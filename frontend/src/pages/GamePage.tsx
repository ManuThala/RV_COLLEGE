import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Shield,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import {
  applyDisplayOrder,
  createDisplayOrder,
  getCurrentLevelDefinition,
  getQuestionByLevel,
  LEVEL_DEFINITIONS,
  MAX_LEVEL,
  summarizeResult,
} from "../services/gameService";
import { shuffle } from "../utils/shuffle";
import { upsertLeaderboard } from "../services/leaderboardService";
import {
  clearSession,
  getSession,
  recordQuestionStat,
  saveSession,
  setCurrentTeam,
} from "../services/storageService";
import LevelResultScreen from "../components/LevelResultScreen";
import type {
  GameSession,
  IncidentScenario,
  Level2Question,
  LevelResult,
  MalwareRound,
  PhishingRound,
  Question,
} from "../types";

const ACCEPT_FLASH_MS = 550;

function GamePage() {
  const navigate = useNavigate();

  // Session lives in state (read once on mount) so effects don't fire on every unrelated
  // re-render — getSession() returns a freshly parsed object every call, which previously
  // made effect dependencies unstable and reset in-progress answers on every tick.
  const [session, setSession] = useState<GameSession | null>(() =>
    getSession(),
  );
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [message, setMessage] = useState("");
  const [orderedActions, setOrderedActions] = useState<string[]>([]);
  const [showLevelResult, setShowLevelResult] = useState(false);
  const [currentLevelResult, setCurrentLevelResult] =
    useState<LevelResult | null>(null);
  const [rejectedOptions, setRejectedOptions] = useState<string[]>([]);
  const [acceptedOption, setAcceptedOption] = useState<string | null>(null);
  const [databaseQuestion, setDatabaseQuestion] = useState<
    | Question
    | Level2Question
    | PhishingRound
    | MalwareRound
    | IncidentScenario
    | null
  >(null);

  // Synchronous submit lock (a ref, not state, so a second click firing before the first
  // click's state update has been applied still sees the lock) — prevents double execution.
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Once a level is successfully completed, the countdown must stop for good — otherwise
  // the interval below keeps ticking behind the "Level Complete!" screen and can fire
  // handleTimeout on an already-passed level, silently turning it into a timeout with an
  // extra phantom mistake. This ref is the guard against that.
  const levelResolvedRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const currentLevel = session?.currentLevel ?? 1;

  useEffect(() => {
    setDatabaseQuestion(null);
    if (!session) {
      return;
    }

    const controller = new AbortController();
    const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

    fetch(
      `${apiUrl}/questions/${currentLevel}/${session.selectedQuestionIds[currentLevel]}`,
      {
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Database question request failed");
        const result = (await response.json()) as {
          success: boolean;
          item?:
            | Question
            | Level2Question
            | PhishingRound
            | MalwareRound
            | IncidentScenario;
        };
        if (result.success && result.item) {
          const item =
            currentLevel === 2 && "options" in result.item
              ? {
                  ...result.item,
                  options: result.item.options.map((option) =>
                    typeof option === "string" ? option : option.text,
                  ),
                }
              : currentLevel === 3 && "emails" in result.item
                ? {
                    ...result.item,
                    emails: result.item.emails.map((email) => ({
                      ...email,
                      senderName: email.senderName ?? "",
                      dateTime: email.dateTime ?? "",
                      link: email.link ?? "",
                      attachment: email.attachment ?? "",
                      suspicious: email.suspicious ?? false,
                      reasons: email.reasons ?? [],
                    })),
                  }
                : currentLevel === 4 && "files" in result.item
                  ? {
                      ...result.item,
                      files: result.item.files.map((file) => ({
                        ...file,
                        extension: file.extension ?? "",
                        type: file.type ?? "File",
                        size: file.size ?? "",
                        modified: file.modified ?? "",
                        source: file.source ?? "",
                        suspicious: file.suspicious ?? false,
                        reasons: file.reasons ?? [],
                      })),
                    }
                  : result.item;
          setDatabaseQuestion(
            item as
              | Question
              | Level2Question
              | PhishingRound
              | MalwareRound
              | IncidentScenario,
          );
        }
      })
      .catch(() => {
        // Keep the existing local question as a fallback while the API is unavailable.
      });

    return () => controller.abort();
  }, [currentLevel, session?.selectedQuestionIds[currentLevel]]);

  // Redirect users without a valid, active session away from /challenge.
  useEffect(() => {
    if (!session) {
      navigate("/register", { replace: true });
      return;
    }
    if (session.disqualified && !showLevelResult) {
      navigate("/leaderboard", { replace: true });
      return;
    }
    if (session.completionStatus === "completed") {
      navigate("/results", { replace: true });
      return;
    }
    const timeSinceStart = Date.now() - session.gameStartTimestamp;
    if (
      timeSinceStart > 48 * 60 * 60 * 1000 &&
      Object.keys(session.levelResults).length === 0
    ) {
      navigate("/register", { replace: true });
    }
  }, [session, navigate, showLevelResult]);

  // Pick up disqualification / reset actions performed by an admin in another tab on this device.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "cybershield_session") return;
      setSession(getSession());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Always load the current level from the saved session, calculate the true remaining
  // timer from the saved levelStartTimestamp (so a refresh can't grant extra time), and
  // publish live progress to the leaderboard so "Currently Playing" reflects reality.
  useEffect(() => {
    if (
      !session ||
      session.disqualified ||
      session.completionStatus === "completed"
    )
      return;

    levelResolvedRef.current = false;
    submittingRef.current = false;
    setIsSubmitting(false);

    const levelDef = getCurrentLevelDefinition(currentLevel);
    const levelTimer = levelDef?.timer ?? 20;
    const levelStart =
      session.levelStartTimestamp ?? session.gameStartTimestamp;
    const elapsedSeconds = Math.max(
      0,
      Math.floor((Date.now() - levelStart) / 1000),
    );
    const remainingTime = Math.max(0, levelTimer - elapsedSeconds);

    setTimeLeft(remainingTime);
    setSelectedValue("");
    setMessage("");
    setShowLevelResult(false);
    setCurrentLevelResult(null);
    setAcceptedOption(null);
    setRejectedOptions(session.rejectedOptions[currentLevel] ?? []);

    const data = getQuestionByLevel(
      currentLevel,
      session.selectedQuestionIds[currentLevel],
    );

    // Shuffle once per level and persist the order on the session so a refresh (or any
    // re-render) shows the exact same arrangement instead of re-randomizing it.
    let order = session.displayOrder[currentLevel];
    if (data && (!order || order.length === 0)) {
      order = createDisplayOrder(currentLevel, data);
      const updatedSession: GameSession = {
        ...session,
        displayOrder: { ...session.displayOrder, [currentLevel]: order },
      };
      saveSession(updatedSession);
      setSession(updatedSession);
      recordQuestionStat(
        currentLevel,
        session.selectedQuestionIds[currentLevel],
        "shown",
      );
    }

    if (currentLevel === 5 && data && "actions" in data) {
      setOrderedActions(
        order && order.length > 0
          ? order
          : (data as IncidentScenario).actions.map((item) => item.id),
      );
    }

    upsertLeaderboard(session);

    if (currentLevel > MAX_LEVEL) return;

    // If the timer had already fully expired while the page was closed/refreshed,
    // apply the timeout immediately instead of silently freezing at 0s.
    if (remainingTime <= 0) {
      handleTimeout();
      return;
    }

    const timer = window.setInterval(() => {
      // The level was completed while this interval kept running in the background
      // (e.g. the team lingered on the "Level Complete!" screen) — stop ticking for
      // good instead of letting the level be silently rewritten into a timeout.
      if (levelResolvedRef.current) {
        window.clearInterval(timer);
        return;
      }
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel, session?.levelStartTimestamp]);

  const handleTimeout = () => {
    const current = sessionRef.current;
    if (!current) return;
    // Defense in depth: never overwrite a level that has already been completed.
    if (current.levelResults[current.currentLevel]?.status === "completed")
      return;
    if (current.disqualified) return;

    const levelStart =
      current.levelStartTimestamp ?? current.gameStartTimestamp;
    const elapsedSeconds = Math.max(
      1,
      Math.ceil((Date.now() - levelStart) / 1000),
    );
    // A timeout eliminates the team instead of advancing it to the next level.
    const existingAttempts =
      current.incorrectAttempts[current.currentLevel] ?? 0;
    const updatedSession: GameSession = { ...current };
    updatedSession.disqualified = true;
    updatedSession.completionStatus = "timed_out";
    updatedSession.levelResults = {
      ...current.levelResults,
      [current.currentLevel]: summarizeResult(
        current.currentLevel,
        elapsedSeconds,
        existingAttempts,
        "failed",
      ),
    };
    updatedSession.levelResults[current.currentLevel].explanation =
      "Your team is eliminated because the timer expired before the challenge was completed.";
    updatedSession.levelResults[current.currentLevel].tip = "";
    updatedSession.totalTime = Object.values(
      updatedSession.levelResults,
    ).reduce((sum, item) => sum + item.totalTime, 0);
    recordQuestionStat(
      current.currentLevel,
      current.selectedQuestionIds[current.currentLevel],
      "incorrect",
    );
    levelResolvedRef.current = true;
    saveSession(updatedSession);
    upsertLeaderboard(updatedSession);
    setSession(updatedSession);
    setCurrentLevelResult(updatedSession.levelResults[current.currentLevel]);
    setShowLevelResult(true);
  };

  const localLevelData = session
    ? getQuestionByLevel(
        currentLevel,
        session.selectedQuestionIds[currentLevel],
      )
    : undefined;

  const rawLevelData = databaseQuestion ?? localLevelData;
  const levelData =
    currentLevel === 2 && rawLevelData && "options" in rawLevelData
      ? {
          ...rawLevelData,
          options: rawLevelData.options.map((option) =>
            typeof option === "string" ? option : option.text,
          ),
        }
      : rawLevelData;

  useEffect(() => {
    if (currentLevel !== 5 || !levelData || !("actions" in levelData)) {
      if (currentLevel !== 5) setOrderedActions([]);
      return;
    }

    const actions = Array.isArray(levelData.actions) ? levelData.actions : [];
    const availableIds = actions.map((action) => action.id);
    const savedOrder = session?.displayOrder[currentLevel] ?? [];
    const validSavedOrder = savedOrder.filter((id) =>
      availableIds.includes(id),
    );
    const nextOrder =
      validSavedOrder.length === availableIds.length
        ? validSavedOrder
        : shuffle(availableIds);

    setOrderedActions(nextOrder);
  }, [currentLevel, levelData, session?.displayOrder]);

  // Reorder choices for display using the session-stable shuffle order. Correctness checks
  // in evaluateAnswer below always use levelData (the raw, unshuffled data) and match by
  // id/value, so shuffled display order never affects grading.
  const displayLevelData =
    session && levelData
      ? applyDisplayOrder(
          currentLevel,
          levelData as never,
          session.displayOrder[currentLevel],
        )
      : levelData;

  const evaluateAnswer = async () => {
    if (!session || !levelData) return;
    if (submittingRef.current) return;
    if (currentLevel !== 5 && !selectedValue) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    const updatedSession: GameSession = { ...session };
    const attempts = (updatedSession.incorrectAttempts[currentLevel] ?? 0) + 1;

    let isCorrect = false;
    let correctAnswer = "the correct answer";
    let answerExplanation = "";
    const orderedIds = orderedActions;
    if (currentLevel === 5) {
      updatedSession.answerSubmissions = {
        ...updatedSession.answerSubmissions,
        [currentLevel]: orderedIds,
      };
    }

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
      const response = await fetch(
        `${apiUrl}/questions/${currentLevel}/${session.selectedQuestionIds[currentLevel]}/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            currentLevel === 5 ? { orderedIds } : { optionId: selectedValue },
          ),
        },
      );
      const result = (await response.json()) as {
        success?: boolean;
        correct?: boolean;
        correctAnswer?: string;
        explanation?: string;
        message?: string;
      };
      if (!response.ok || !result.success)
        throw new Error(result.message ?? "Answer validation failed.");
      isCorrect = Boolean(result.correct);
      correctAnswer = result.correctAnswer ?? correctAnswer;
      answerExplanation = result.explanation ?? "";
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to validate the answer.",
      );
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    if (!isCorrect) {
      updatedSession.incorrectAttempts = {
        ...updatedSession.incorrectAttempts,
        [currentLevel]: attempts,
      };
      updatedSession.disqualified = true;
      updatedSession.completionStatus = "timed_out";

      const failedResult = summarizeResult(currentLevel, 0, attempts, "failed");
      failedResult.explanation = `Your team is eliminated because the selected answer was incorrect. Correct answer: ${correctAnswer}${answerExplanation ? ` ${answerExplanation}` : ""}`;
      failedResult.tip = "";
      updatedSession.levelResults = {
        ...updatedSession.levelResults,
        [currentLevel]: failedResult,
      };
      updatedSession.totalTime = Object.values(
        updatedSession.levelResults,
      ).reduce((sum, item) => sum + item.totalTime, 0);
      levelResolvedRef.current = true;
      saveSession(updatedSession);
      upsertLeaderboard(updatedSession);
      setSession(updatedSession);
      recordQuestionStat(
        currentLevel,
        session.selectedQuestionIds[currentLevel],
        "incorrect",
      );
      setCurrentLevelResult(failedResult);
      setShowLevelResult(true);
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    updatedSession.incorrectAttempts = {
      ...updatedSession.incorrectAttempts,
      [currentLevel]: attempts - 1,
    };
    const levelStart =
      updatedSession.levelStartTimestamp ?? updatedSession.gameStartTimestamp;
    const elapsedSeconds = Math.max(
      1,
      Math.ceil((Date.now() - levelStart) / 1000),
    );
    const finalAttempts = attempts - 1;
    const result = summarizeResult(
      currentLevel,
      elapsedSeconds,
      finalAttempts,
      "completed",
    );
    updatedSession.levelResults = {
      ...updatedSession.levelResults,
      [currentLevel]: result,
    };
    updatedSession.levelCompletionTimes = {
      ...updatedSession.levelCompletionTimes,
      [currentLevel]: result.totalTime,
    };
    updatedSession.totalTime = Object.values(
      updatedSession.levelResults,
    ).reduce((sum, item) => sum + item.totalTime, 0);

    // Stop the countdown for this level right now — it has been won, and the interval
    // must not be allowed to fire handleTimeout while the result screen is showing.
    levelResolvedRef.current = true;

    saveSession(updatedSession);
    setSession(updatedSession);
    recordQuestionStat(
      currentLevel,
      session.selectedQuestionIds[currentLevel],
      "correct",
    );
    setMessage("");

    if (currentLevel === 5) {
      setCurrentLevelResult(result);
      setShowLevelResult(true);
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    // Briefly flash the submitted option green before revealing the full result screen.
    setAcceptedOption(selectedValue);
    window.setTimeout(() => {
      setCurrentLevelResult(result);
      setShowLevelResult(true);
      submittingRef.current = false;
      setIsSubmitting(false);
    }, ACCEPT_FLASH_MS);
  };

  const handleContinueFromResult = () => {
    if (!session) return;

    if (currentLevelResult?.status === "failed") {
      clearSession();
      setCurrentTeam(null);
      navigate("/leaderboard");
      return;
    }

    if (currentLevel === MAX_LEVEL) {
      const updatedSession: GameSession = {
        ...session,
        completionStatus: "completed",
      };
      saveSession(updatedSession);
      upsertLeaderboard(updatedSession);
      setSession(updatedSession);
      navigate("/results");
      return;
    }

    const nextSession: GameSession = {
      ...session,
      currentLevel: currentLevel + 1,
      levelStartTimestamp: Date.now(),
      completionStatus: "in_progress",
    };
    setShowLevelResult(false);
    setCurrentLevelResult(null);
    saveSession(nextSession);
    setSession(nextSession);
  };

  if (!session) {
    return null;
  }

  const optionStateClass = (
    id: string,
    baseSelectedClass: string,
    baseIdleClass: string,
  ) => {
    if (rejectedOptions.includes(id))
      return "border-red-500 bg-red-500/10 text-red-100";
    if (acceptedOption === id)
      return "border-emerald-500 bg-emerald-500/10 text-emerald-100";
    if (selectedValue === id) return baseSelectedClass;
    return baseIdleClass;
  };

  const OptionBadge = ({ id }: { id: string }) => {
    if (rejectedOptions.includes(id)) {
      return (
        <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-200">
          <XCircle className="h-3 w-3" /> Incorrect
        </span>
      );
    }
    if (acceptedOption === id) {
      return (
        <span className="mb-2 inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <CheckCircle2 className="h-3 w-3" /> Correct
        </span>
      );
    }
    return null;
  };

  const renderLevelContent = () => {
    if (!displayLevelData) return null;

    if (currentLevel === 1) {
      const question = displayLevelData as Question;
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{question.question}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {question.options.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={rejectedOptions.includes(option.id) || isSubmitting}
                onClick={() => setSelectedValue(option.id)}
                className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed ${optionStateClass(option.id, "border-cyan-400 bg-cyan-500/10 text-white", "border-slate-700 bg-slate-800/60 text-slate-200 hover:border-slate-500")}`}
              >
                <OptionBadge id={option.id} />
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-cyan-300">
                  Option {option.id}
                </span>
                {option.text}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentLevel === 2) {
      const question = displayLevelData as Level2Question;
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{question.question}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {question.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={rejectedOptions.includes(option) || isSubmitting}
                onClick={() => setSelectedValue(option)}
                className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed ${optionStateClass(option, "border-cyan-400 bg-cyan-500/10 text-white", "border-slate-700 bg-slate-800/60 text-slate-200 hover:border-slate-500")}`}
              >
                <OptionBadge id={option} />
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentLevel === 3) {
      const round = displayLevelData as PhishingRound;
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{round.title}</h2>
          <div className="grid gap-4">
            {(round.emails ?? []).map((email) => (
              <button
                key={email.id}
                type="button"
                disabled={rejectedOptions.includes(email.id) || isSubmitting}
                onClick={() => setSelectedValue(email.id)}
                className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed ${optionStateClass(email.id, "border-cyan-400 bg-cyan-500/10", "border-slate-700 bg-slate-800/60 hover:border-slate-500")}`}
              >
                <OptionBadge id={email.id} />
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">
                      {email.senderName}
                    </p>
                    <p className="text-sm text-slate-300">
                      {email.senderEmail}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {email.dateTime}
                  </span>
                </div>
                <p className="text-cyan-200">{email.subject}</p>
                <p className="mt-3 text-sm text-slate-300">{email.body}</p>
                {email.link && (
                  <p className="mt-3 text-xs text-slate-400">
                    Link: {email.link}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentLevel === 4) {
      const round = displayLevelData as MalwareRound;
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{round.title}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(round.files ?? []).map((file) => (
              <button
                key={file.id}
                type="button"
                disabled={rejectedOptions.includes(file.id) || isSubmitting}
                onClick={() => setSelectedValue(file.id)}
                className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed ${optionStateClass(file.id, "border-cyan-400 bg-cyan-500/10", "border-slate-700 bg-slate-800/60 hover:border-slate-500")}`}
              >
                <OptionBadge id={file.id} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{file.name}</p>
                    <p className="text-sm text-slate-300">{file.type}</p>
                  </div>
                  <span className="rounded-full border border-slate-600 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                    {file.extension}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-300">
                  <p>Size: {file.size}</p>
                  <p>Modified: {file.modified}</p>
                  <p>Source: {file.source ?? "Local file"}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentLevel === 5) {
      const scenario = levelData as IncidentScenario;
      const scenarioActions = Array.isArray(scenario.actions)
        ? scenario.actions
        : [];
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
          <p className="text-slate-300">{scenario.description}</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedActions}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {orderedActions.map((id) => {
                  const action = scenarioActions.find((item) => item.id === id);
                  if (!action) return null;
                  return <SortableAction key={action.id} action={action} />;
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      );
    }

    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedActions((items) => {
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over.id));
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const levelDefinition =
    getCurrentLevelDefinition(currentLevel) ?? LEVEL_DEFINITIONS[0];
  const canSubmit =
    !isSubmitting && (currentLevel === 5 || Boolean(selectedValue));

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <header className="glass-panel mb-8 flex flex-col gap-4 rounded-3xl p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              Team
            </p>
            <h1 className="text-2xl font-black text-white">
              {session.teamName}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="level-chip">
              Level {currentLevel} / {MAX_LEVEL}
            </span>
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all ${
                timeLeft <= 5
                  ? "animate-pulse border-red-500 bg-red-500/20 text-red-100"
                  : timeLeft <= 10
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-100"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
              }`}
            >
              <Clock3 className="h-4 w-4" /> {timeLeft}s left
            </div>
            <TotalClearedBadge session={session} />
          </div>
        </header>

        <main className="glass-panel rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                Mission
              </p>
              <h2 className="text-3xl font-black text-white">
                {levelDefinition.name}
              </h2>
            </div>
            <p className="max-w-xs text-sm text-slate-300">
              {levelDefinition.description}
            </p>
          </div>

          {message && (
            <div
              role="alert"
              aria-live="polite"
              className={`mb-5 flex items-center gap-2 rounded-2xl border p-3 text-sm ${
                message.startsWith("Incorrect") ||
                message.startsWith("That sequence")
                  ? "border-red-500/30 bg-red-500/10 text-red-100"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
              }`}
            >
              {message.startsWith("Incorrect") ||
              message.startsWith("That sequence") ? (
                <XCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              {message}
            </div>
          )}

          {renderLevelContent()}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={evaluateAnswer}
              disabled={!canSubmit}
              className="cyber-button-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit Answer <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </main>
      </div>

      {showLevelResult && currentLevelResult && (
        <LevelResultScreen
          result={currentLevelResult}
          onContinue={handleContinueFromResult}
        />
      )}
    </div>
  );
}

function TotalClearedBadge({ session }: { session: GameSession }) {
  const totalCorrect = useMemo(
    () =>
      Object.values(session.levelResults).filter(
        (result) => result.status === "completed",
      ).length,
    [session],
  );
  return (
    <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
      <Shield className="h-4 w-4" /> {totalCorrect}/{MAX_LEVEL} levels cleared
    </div>
  );
}

function SortableAction({ action }: { action: { id: string; text: string } }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-2xl border border-slate-700 bg-slate-800/70 p-4 text-slate-100 active:cursor-grabbing"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200">
          Step
        </span>
        <ShieldAlert className="h-4 w-4 text-slate-400" />
      </div>
      <p className="mt-3 font-medium text-white">{action.text}</p>
    </div>
  );
}

export default GamePage;
