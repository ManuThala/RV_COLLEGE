import { level1Questions } from "../data/level1Questions";
import { level2Questions } from "../data/level2Questions";
import { level3Rounds } from "../data/level3Rounds";
import { level4Rounds } from "../data/level4Rounds";
import { level5Scenarios } from "../data/level5Scenarios";
import { quizSets } from "../data/quizSets";
import { shuffle } from "../utils/shuffle";
import {
  getCustomQuestions,
  getQuestionEdits,
  getQuestionOverrides,
  getQuizSetOverrides,
} from "./storageService";
import type {
  GameSession,
  IncidentScenario,
  Level2Question,
  LevelResult,
  MalwareRound,
  PhishingRound,
  Question,
  Team,
} from "../types";

export const LEVEL_DEFINITIONS = [
  {
    id: 1,
    name: "Strongest Password",
    timer: 30,
    description: "Identify the strongest password.",
  },
  {
    id: 2,
    name: "Coding-Decoding",
    timer: 45,
    description: "Decode the correct answer.",
  },
  {
    id: 3,
    name: "Phishing Detection",
    timer: 45,
    description: "Identify the phishing email.",
  },
  {
    id: 4,
    name: "Malware Hunt",
    timer: 30,
    description: "Quarantine the suspicious file.",
  },
  {
    id: 5,
    name: "Respond to the Cyber Attack",
    timer: 60,
    description: "Arrange correct incident-response steps.",
  },
] as const;

export const MAX_LEVEL = LEVEL_DEFINITIONS.length;

const applyEdit = <T extends { id: string }>(
  level: number,
  item: T | undefined,
): T | undefined => {
  if (!item) return item;
  const patch = getQuestionEdits<T>(level)[item.id];
  return patch ? { ...item, ...patch } : item;
};

// Admin-added custom questions/rounds/scenarios are checked first (exact id match), then
// the static data files, with any admin edit patch merged on top.
export const getQuestionByLevel = (level: number, id: string) => {
  const custom = getCustomQuestions<
    Question | Level2Question | PhishingRound | MalwareRound | IncidentScenario
  >(level)[id];
  if (custom) return applyEdit(level, custom);

  switch (level) {
    case 1:
      return applyEdit(
        1,
        level1Questions.find((q) => q.id === id) ?? level1Questions[0],
      );
    case 2:
      return applyEdit(
        2,
        level2Questions.find((q) => q.id === id) ?? level2Questions[0],
      );
    case 3:
      return applyEdit(
        3,
        level3Rounds.find((round) => round.id === id) ?? level3Rounds[0],
      );
    case 4:
      return applyEdit(
        4,
        level4Rounds.find((round) => round.id === id) ?? level4Rounds[0],
      );
    case 5:
      return applyEdit(
        5,
        level5Scenarios.find((scenario) => scenario.id === id) ??
          level5Scenarios[0],
      );
    default:
      return undefined;
  }
};

export const isQuestionActive = (level: number, id: string): boolean => {
  const overrides = getQuestionOverrides();
  const key = `${level}:${id}`;
  if (key in overrides) return overrides[key];
  const item = getQuestionByLevel(level, id) as
    | { active?: boolean }
    | undefined;
  return item?.active ?? true;
};

// An admin can reassign which question/round/scenario a quiz set points to for a given
// level (e.g. to slot a newly-added custom question into live rotation) without touching
// the static quizSets data file — the override is layered on top at read time.
export const resolveQuizSet = (setId: string) => {
  const base = quizSets.find((item) => item.id === setId)!;
  const override = getQuizSetOverrides()[setId];
  return override ? { ...base, ...override } : base;
};

export const selectRandomSet = (previousSetId?: string): string => {
  const usable = quizSets.filter((set) => {
    if (set.id === previousSetId) return false;
    const resolved = resolveQuizSet(set.id);
    return (
      isQuestionActive(1, resolved.level1QuestionId) &&
      isQuestionActive(2, resolved.level2QuestionId) &&
      isQuestionActive(3, resolved.level3RoundId) &&
      isQuestionActive(4, resolved.level4RoundId) &&
      isQuestionActive(5, resolved.level5ScenarioId)
    );
  });
  const pool =
    usable.length > 0
      ? usable
      : quizSets.filter((set) => set.id !== previousSetId);
  const chosen = pool[Math.floor(Math.random() * pool.length)] ?? quizSets[0];
  return chosen.id;
};

export const buildSessionFromTeam = (
  team: Team,
  priorSetId?: string,
): GameSession => {
  const setId = selectRandomSet(priorSetId);
  const chosenSet = resolveQuizSet(setId);

  const selected = {
    1: chosenSet.level1QuestionId,
    2: chosenSet.level2QuestionId,
    3: chosenSet.level3RoundId,
    4: chosenSet.level4RoundId,
    5: chosenSet.level5ScenarioId,
  };

  const now = Date.now();
  const session: GameSession = {
    id: `SESSION-${Date.now()}`,
    teamId: team.id,
    teamName: team.name,
    player1: team.player1,
    player2: team.player2,
    selectedQuestionIds: selected,
    currentLevel: 1,
    gameStartTimestamp: now,
    levelStartTimestamp: now,
    answerSubmissions: {},
    incorrectAttempts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    penalties: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    levelCompletionTimes: {},
    totalTime: 0,
    completionStatus: "in_progress",
    lastQuizCombinationUsed: setId,
    levelResults: {},
    currentLevelLocked: false,
    challengeStartedAt: now,
    timeoutPenaltyApplied: { 1: false, 2: false, 3: false, 4: false, 5: false },
    displayOrder: {},
    rejectedOptions: {},
  };
  return session;
};

// Returns the stable "key" identifying each displayed choice for a level, used to
// persist a session-stable shuffle order (so a refresh shows the same arrangement).
export const getDisplayKeys = (level: number, data: unknown): string[] => {
  if (!data) return [];
  if (level === 1) return (data as Question).options.map((option) => option.id);
  if (level === 2) return (data as Level2Question).options;
  if (level === 3)
    return (data as PhishingRound).emails.map((email) => email.id);
  if (level === 4) return (data as MalwareRound).files.map((file) => file.id);
  if (level === 5)
    return (data as IncidentScenario).actions.map((action) => action.id);
  return [];
};

const reorderByKeys = <T>(
  items: T[],
  keys: string[],
  getKey: (item: T) => string,
): T[] => {
  const byKey = new Map(items.map((item) => [getKey(item), item] as const));
  const ordered = keys
    .map((key) => byKey.get(key))
    .filter((item): item is T => item !== undefined);
  const remaining = items.filter((item) => !keys.includes(getKey(item)));
  return [...ordered, ...remaining];
};

export const createDisplayOrder = (level: number, data: unknown): string[] =>
  shuffle(getDisplayKeys(level, data));

// Applies a previously-saved shuffle order to the raw question/round data for rendering.
// Correctness is untouched — every match (correctOptionId, correctEmailId, etc.) is by id/value, not position.
export const applyDisplayOrder = <
  T extends
    | { options: unknown }
    | { emails: unknown }
    | { files: unknown }
    | { actions: unknown },
>(
  level: number,
  data: T,
  order: string[] | undefined,
): T => {
  if (!order || order.length === 0) return data;
  if (level === 1) {
    const q = data as unknown as Question;
    return {
      ...q,
      options: reorderByKeys(q.options, order, (option) => option.id),
    } as unknown as T;
  }
  if (level === 2) {
    const q = data as unknown as Level2Question;
    return {
      ...q,
      options: reorderByKeys(q.options, order, (option) => option),
    } as unknown as T;
  }
  if (level === 3) {
    const round = data as unknown as PhishingRound;
    return {
      ...round,
      emails: reorderByKeys(round.emails, order, (email) => email.id),
    } as unknown as T;
  }
  if (level === 4) {
    const round = data as unknown as MalwareRound;
    return {
      ...round,
      files: reorderByKeys(round.files, order, (file) => file.id),
    } as unknown as T;
  }
  if (level === 5) {
    const scenario = data as unknown as IncidentScenario;
    return {
      ...scenario,
      actions: reorderByKeys(scenario.actions, order, (action) => action.id),
    } as unknown as T;
  }
  return data;
};

export const createStatefulSession = (
  team: Team,
  priorSetId?: string,
): GameSession => {
  const session = buildSessionFromTeam(team, priorSetId);
  return { ...session, levelResults: {} };
};

export const getRandomizedLevelQuestion = (
  level: number,
  questionId: string,
) => {
  const data = getQuestionByLevel(level, questionId);
  if (!data) return data;
  if (level === 1) {
    const q = data as (typeof level1Questions)[number];
    return { ...q, options: shuffle(q.options) };
  }
  if (level === 2) {
    const q = data as (typeof level2Questions)[number];
    return { ...q, options: shuffle(q.options) };
  }
  if (level === 3) {
    const round = data as (typeof level3Rounds)[number];
    return { ...round, emails: shuffle(round.emails) };
  }
  if (level === 4) {
    const round = data as (typeof level4Rounds)[number];
    return { ...round, files: shuffle(round.files) };
  }
  if (level === 5) {
    const scenario = data as (typeof level5Scenarios)[number];
    return { ...scenario, actions: shuffle(scenario.actions) };
  }
  return data;
};

export const summarizeResult = (
  level: number,
  actualSeconds: number,
  incorrectAttempts: number,
  penaltySeconds: number,
  status: "completed" | "timeout" | "failed",
): LevelResult => {
  const label = LEVEL_DEFINITIONS[level - 1]?.name ?? `Level ${level}`;
  const totalTime = Math.max(0, actualSeconds + penaltySeconds);

  return {
    level,
    label,
    actualTime: actualSeconds,
    incorrectAttempts,
    penaltySeconds,
    totalTime,
    status,
    explanation:
      status === "timeout"
        ? "The level timed out and the timeout penalty was applied."
        : "Challenge objective completed successfully.",
    tip: "Stay calm, read carefully, and prevent avoidable mistakes.",
    completedAt: new Date().toISOString(),
  };
};

export const calculateLevelScore = (
  _level: number,
  actualTime: number,
  penalties: number,
): number => actualTime + penalties;

export const getCurrentLevelDefinition = (level: number) =>
  LEVEL_DEFINITIONS[level - 1];

// "All" variants (static + custom, edits applied, unfiltered by active state) are for admin
// management views, where a disabled item must still be visible so it can be re-enabled.
export const getAllLevel1Questions = () =>
  [...level1Questions, ...Object.values(getCustomQuestions<Question>(1))].map(
    (q) => applyEdit(1, q)!,
  );
export const getAllLevel2Questions = () =>
  [
    ...level2Questions,
    ...Object.values(getCustomQuestions<Level2Question>(2)),
  ].map((q) => applyEdit(2, q)!);
export const getAllLevel3Rounds = () =>
  [...level3Rounds, ...Object.values(getCustomQuestions<PhishingRound>(3))].map(
    (round) => applyEdit(3, round)!,
  );
export const getAllLevel4Rounds = () =>
  [...level4Rounds, ...Object.values(getCustomQuestions<MalwareRound>(4))].map(
    (round) => applyEdit(4, round)!,
  );
export const getAllLevel5Scenarios = () =>
  [
    ...level5Scenarios,
    ...Object.values(getCustomQuestions<IncidentScenario>(5)),
  ].map((scenario) => applyEdit(5, scenario)!);

// "Pool" variants (active only) are for real gameplay selection.
export const getLevel1QuestionPool = () =>
  getAllLevel1Questions().filter((q) => isQuestionActive(1, q.id));
export const getLevel2QuestionPool = () =>
  getAllLevel2Questions().filter((q) => isQuestionActive(2, q.id));
export const getLevel3RoundPool = () =>
  getAllLevel3Rounds().filter((round) => isQuestionActive(3, round.id));
export const getLevel4RoundPool = () =>
  getAllLevel4Rounds().filter((round) => isQuestionActive(4, round.id));
export const getLevel5ScenarioPool = () =>
  getAllLevel5Scenarios().filter((scenario) =>
    isQuestionActive(5, scenario.id),
  );
