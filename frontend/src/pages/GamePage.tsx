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
import { upsertLeaderboard } from "../services/leaderboardService";
import {
  getSession,
  recordQuestionStat,
  saveSession,
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

  // Synchronous submit lock (a ref, not state, so a second click firing before the first
  // click's state update has been applied still sees the lock) — prevents double execution.
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Once a level is successfully completed, the countdown must stop for good — otherwise
  // the interval below keeps ticking behind the "Level Complete!" screen and can fire
  // handleTimeout on an already-passed level, silently turning it into a timeout with an
  // extra phantom mistake and penalty. This ref is the guard against that.
  const levelResolvedRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const currentLevel = session?.currentLevel ?? 1;

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

    const levelStart =
      current.levelStartTimestamp ?? current.gameStartTimestamp;
    const elapsedSeconds = Math.max(
      1,
      Math.ceil((Date.now() - levelStart) / 1000),
    );
    // A timeout is not itself an "incorrect attempt" / mistake — it's tracked and
    // penalized separately (a fixed +10s), so the wrong-answer attempt count is untouched.
    const existingAttempts =
      current.incorrectAttempts[current.currentLevel] ?? 0;
    const penalty = (current.penalties[current.currentLevel] ?? 0) + 10;
    const updatedSession: GameSession = { ...current };
    updatedSession.penalties = {
      ...current.penalties,
      [current.currentLevel]: penalty,
    };
    updatedSession.levelResults = {
      ...current.levelResults,
      [current.currentLevel]: summarizeResult(
        current.currentLevel,
        elapsedSeconds,
        existingAttempts,
        penalty,
        "timeout",
      ),
    };
    updatedSession.totalTime = Object.values(
      updatedSession.levelResults,
    ).reduce((sum, item) => sum + item.totalTime, 0);
    recordQuestionStat(
      current.currentLevel,
      current.selectedQuestionIds[current.currentLevel],
      "incorrect",
    );

    if (current.currentLevel === MAX_LEVEL) {
      updatedSession.completionStatus = "completed";
      saveSession(updatedSession);
      upsertLeaderboard(updatedSession);
      setSession(updatedSession);
      navigate("/results");
      return;
    }

    updatedSession.currentLevel = current.currentLevel + 1;
    updatedSession.levelStartTimestamp = Date.now();
    saveSession(updatedSession);
    upsertLeaderboard(updatedSession);
    setSession(updatedSession);
    setMessage("Time expired. The next level has started.");
  };

  const levelData = session
    ? getQuestionByLevel(
        currentLevel,
        session.selectedQuestionIds[currentLevel],
      )
    : undefined;

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

  const evaluateAnswer = () => {
    if (!session || !levelData) return;
    if (submittingRef.current) return;
    if (currentLevel !== 5 && !selectedValue) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    const updatedSession: GameSession = { ...session };
    const attempts = (updatedSession.incorrectAttempts[currentLevel] ?? 0) + 1;
    const currentPenalty = (updatedSession.penalties[currentLevel] ?? 0) + 5;

    let isCorrect = false;

    if (currentLevel === 1 && "correctOptionId" in levelData) {
      isCorrect = selectedValue === (levelData as Question).correctOptionId;
    }

    if (currentLevel === 2 && "correctOption" in levelData) {
      isCorrect = selectedValue === (levelData as Level2Question).correctOption;
    }

    if (currentLevel === 3 && "correctEmailId" in levelData) {
      isCorrect = selectedValue === (levelData as PhishingRound).correctEmailId;
    }

    if (currentLevel === 4 && "correctFileId" in levelData) {
      isCorrect = selectedValue === (levelData as MalwareRound).correctFileId;
    }

    if (currentLevel === 5) {
      const scenario = levelData as IncidentScenario;
      const orderedIds = orderedActions;
      const matches = orderedIds.filter(
        (id, index) => scenario.correctSequence[index] === id,
      ).length;
      const accuracy = matches / scenario.correctSequence.length;
      isCorrect = accuracy >= 0.8;
      updatedSession.answerSubmissions = {
        ...updatedSession.answerSubmissions,
        [currentLevel]: orderedIds,
      };
    }

    if (!isCorrect) {
      updatedSession.incorrectAttempts = {
        ...updatedSession.incorrectAttempts,
        [currentLevel]: attempts,
      };
      updatedSession.penalties = {
        ...updatedSession.penalties,
        [currentLevel]: 0,
      };
      updatedSession.disqualified = true;
      updatedSession.completionStatus = "timed_out";

      const correctAnswer = getCorrectAnswerText(currentLevel, levelData);
      const failedResult = summarizeResult(
        currentLevel,
        0,
        attempts,
        0,
        "failed",
      );
      failedResult.explanation = `Your team is eliminated because the selected answer was incorrect. Correct answer: ${correctAnswer}`;
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
    updatedSession.penalties = {
      ...updatedSession.penalties,
      [currentLevel]: currentPenalty - 5,
    };

    const levelStart =
      updatedSession.levelStartTimestamp ?? updatedSession.gameStartTimestamp;
    const elapsedSeconds = Math.max(
      1,
      Math.ceil((Date.now() - levelStart) / 1000),
    );
    const finalAttempts = attempts - 1;
    const finalPenalty = currentPenalty - 5;
    const result = summarizeResult(
      currentLevel,
      elapsedSeconds,
      finalAttempts,
      finalPenalty,
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
            {round.emails.map((email) => (
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
            {round.files.map((file) => (
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
                  const action = scenario.actions.find(
                    (item) => item.id === id,
                  );
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

function getCorrectAnswerText(level: number, data: unknown): string {
  const record = typeof data === "object" && data !== null ? data : null;

  if (
    level === 1 &&
    record &&
    "options" in record &&
    "correctOptionId" in record
  ) {
    const question = data as Question;
    return (
      question.options.find((option) => option.id === question.correctOptionId)
        ?.text ?? "the strongest password option"
    );
  }
  if (level === 2 && record && "correctOption" in record) {
    return String((data as Level2Question).correctOption);
  }
  if (
    level === 3 &&
    record &&
    "emails" in record &&
    "correctEmailId" in record
  ) {
    const round = data as PhishingRound;
    const email = round.emails.find((item) => item.id === round.correctEmailId);
    return email
      ? `${email.senderName} <${email.senderEmail}>`
      : "the phishing email";
  }
  if (level === 4 && record && "files" in record && "correctFileId" in record) {
    const round = data as MalwareRound;
    return (
      round.files.find((item) => item.id === round.correctFileId)?.name ??
      "the malicious file"
    );
  }
  if (
    level === 5 &&
    record &&
    "actions" in record &&
    "correctSequence" in record
  ) {
    const scenario = data as IncidentScenario;
    const actionMap = new Map(
      scenario.actions.map((action) => [action.id, action.text]),
    );
    return scenario.correctSequence
      .map((id) => actionMap.get(id) ?? id)
      .join(" -> ");
  }
  return "the correct answer";
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
