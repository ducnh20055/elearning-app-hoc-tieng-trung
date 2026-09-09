import { supabase } from "@/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

export type LearningEventType =
  | "question_answered"
  | "question_listened"
  | "lesson_completed"
  | "conversation_turn"
  | "pronunciation_attempt";

export interface LearningEvent {
  id: string;
  userId: string;
  type: LearningEventType;
  lessonId?: string;
  questionId?: number;
  scenarioId?: string;
  isCorrect?: boolean;
  durationSeconds?: number;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export interface PronunciationAttempt {
  id: string;
  userId: string;
  lessonId: string;
  questionId: number;
  expectedText: string;
  expectedPinyin: string;
  transcript: string;
  similarityScore: number;
  isCorrect: boolean;
  createdAt: string;
}

export interface ReviewItem {
  contentKey: string;
  userId: string;
  lessonId: string;
  questionId: number;
  nextReviewAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  lapseCount: number;
  lastResult: boolean;
  lastAttemptAt: string;
}

export interface DailyGoal {
  targetMinutes: number;
  targetQuestions: number;
  targetLessons: number;
}

export interface ActivitySummary {
  minutesSpoken: number;
  minutesListened: number;
  questionsAnswered: number;
  questionsListened: number;
  lessonsCompleted: number;
  conversationTurns: number;
  pronunciationAttempts: number;
  correctAnswers: number;
  studyDays: number;
  currentStreak: number;
}

const EVENT_KEY = "learning_events:";
const OUTBOX_KEY = "learning_event_outbox:";
const REVIEW_KEY = "review_items:";
const PRONUNCIATION_KEY = "pronunciation_attempts:";
const GOAL_KEY = "daily_goal:";
const DEFAULT_GOAL: DailyGoal = {
  targetMinutes: 10,
  targetQuestions: 5,
  targetLessons: 1,
};

const key = (prefix: string, userId: string) => `${prefix}${userId}`;

const readJson = async <T>(storageKey: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = async (storageKey: string, value: unknown) => {
  await AsyncStorage.setItem(storageKey, JSON.stringify(value));
};

const localDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const recordLearningEvent = async (
  userId: string,
  event: Omit<LearningEvent, "id" | "userId" | "occurredAt">,
) => {
  const storageKey = key(EVENT_KEY, userId);
  const events = await readJson<LearningEvent[]>(storageKey, []);
  const newEvent: LearningEvent = {
    ...event,
    id: String(uuid.v4()),
    userId,
    occurredAt: new Date().toISOString(),
  };
  await writeJson(storageKey, [...events.slice(-999), newEvent]);
  const outboxKey = key(OUTBOX_KEY, userId);
  const outbox = await readJson<LearningEvent[]>(outboxKey, []);
  await writeJson(outboxKey, [...outbox, newEvent]);
  void syncLearningEvents(userId);
  return newEvent;
};

export const syncLearningEvents = async (userId: string) => {
  const outboxKey = key(OUTBOX_KEY, userId);
  const events = await readJson<LearningEvent[]>(outboxKey, []);
  if (events.length === 0) return;

  const { error } = await supabase.from("learning_activity_events").upsert(
    events.map((event) => ({
      id: event.id,
      user_id: event.userId,
      event_type: event.type,
      lesson_id: event.lessonId ?? null,
      question_id: event.questionId ?? null,
      scenario_id: event.scenarioId ?? null,
      is_correct: event.isCorrect ?? null,
      duration_seconds: event.durationSeconds ?? null,
      occurred_at: event.occurredAt,
      metadata: event.metadata ?? {},
    })),
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (!error) await AsyncStorage.removeItem(outboxKey);
};

export const recordPronunciationAttempt = async (
  attempt: Omit<PronunciationAttempt, "id" | "createdAt">,
) => {
  const item: PronunciationAttempt = {
    ...attempt,
    id: String(uuid.v4()),
    userId: attempt.userId,
    createdAt: new Date().toISOString(),
  };
  const storageKey = key(PRONUNCIATION_KEY, item.userId);
  const attempts = await readJson<PronunciationAttempt[]>(storageKey, []);
  await writeJson(storageKey, [...attempts.slice(-499), item]);
  await recordLearningEvent(item.userId, {
    type: "pronunciation_attempt",
    lessonId: item.lessonId,
    questionId: item.questionId,
    isCorrect: item.isCorrect,
    metadata: {
      expectedPinyin: item.expectedPinyin,
      transcript: item.transcript,
      similarityScore: item.similarityScore,
    },
  });
  return item;
};

const reviewKey = (lessonId: string, questionId: number) =>
  `${lessonId}:${questionId}`;

export const updateReviewItem = async ({
  userId,
  lessonId,
  questionId,
  isCorrect,
}: {
  userId: string;
  lessonId: string;
  questionId: number;
  isCorrect: boolean;
}) => {
  const storageKey = key(REVIEW_KEY, userId);
  const items = await readJson<Record<string, ReviewItem>>(storageKey, {});
  const contentKey = reviewKey(lessonId, questionId);
  const previous = items[contentKey];
  const now = new Date();
  const intervalDays = isCorrect
    ? Math.max(
        1,
        Math.round(
          (previous?.intervalDays ?? 0) * (previous?.easeFactor ?? 2.5) || 1,
        ),
      )
    : 1;
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + intervalDays);

  items[contentKey] = {
    contentKey,
    userId,
    lessonId,
    questionId,
    nextReviewAt: nextReview.toISOString(),
    intervalDays,
    easeFactor: Math.min(
      3,
      Math.max(1.3, (previous?.easeFactor ?? 2.5) + (isCorrect ? 0.1 : -0.2)),
    ),
    repetitionCount: (previous?.repetitionCount ?? 0) + (isCorrect ? 1 : 0),
    lapseCount: (previous?.lapseCount ?? 0) + (isCorrect ? 0 : 1),
    lastResult: isCorrect,
    lastAttemptAt: now.toISOString(),
  };
  await writeJson(storageKey, items);
  void supabase.from("review_items").upsert(
    {
      user_id: userId,
      content_key: contentKey,
      lesson_id: lessonId,
      question_id: questionId,
      next_review_at: items[contentKey].nextReviewAt,
      interval_days: items[contentKey].intervalDays,
      ease_factor: items[contentKey].easeFactor,
      repetition_count: items[contentKey].repetitionCount,
      lapse_count: items[contentKey].lapseCount,
      last_result: items[contentKey].lastResult,
      last_attempt_at: items[contentKey].lastAttemptAt,
    },
    { onConflict: "user_id,content_key" },
  );
};

export const getRecentPronunciationAttempts = async (userId: string) => {
  const attempts = await readJson<PronunciationAttempt[]>(
    key(PRONUNCIATION_KEY, userId),
    [],
  );
  return attempts.slice(-5).reverse();
};

export const getDueReviewItems = async (userId: string) => {
  const items = await readJson<Record<string, ReviewItem>>(
    key(REVIEW_KEY, userId),
    {},
  );
  const now = Date.now();
  return Object.values(items)
    .filter((item) => new Date(item.nextReviewAt).getTime() <= now)
    .sort(
      (a, b) =>
        new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime(),
    );
};

export const getDailyGoal = (userId: string) =>
  readJson<DailyGoal>(key(GOAL_KEY, userId), DEFAULT_GOAL);

export const saveDailyGoal = (userId: string, goal: DailyGoal) =>
  writeJson(key(GOAL_KEY, userId), goal);

export const getActivitySummary = async (
  userId: string,
  date = localDate(),
): Promise<ActivitySummary> => {
  const events = await readJson<LearningEvent[]>(key(EVENT_KEY, userId), []);
  const visibleEvents = events.filter(
    (event) => localDate(new Date(event.occurredAt)) === date,
  );
  const allDates = new Set(
    events.map((event) => localDate(new Date(event.occurredAt))),
  );
  const days = [...allDates].sort().reverse();
  let currentStreak = 0;
  const cursor = new Date();
  while (allDates.has(localDate(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    minutesSpoken: visibleEvents.reduce(
      (total, event) =>
        total +
        (event.type === "question_answered" ||
        event.type === "conversation_turn"
          ? 1
          : 0),
      0,
    ),
    minutesListened: visibleEvents.reduce(
      (total, event) =>
        total +
        (event.type === "question_listened" ||
        event.type === "conversation_turn"
          ? 1
          : 0),
      0,
    ),
    questionsAnswered: visibleEvents.filter(
      (event) => event.type === "question_answered",
    ).length,
    questionsListened: visibleEvents.filter(
      (event) => event.type === "question_listened",
    ).length,
    lessonsCompleted: visibleEvents.filter(
      (event) => event.type === "lesson_completed",
    ).length,
    conversationTurns: visibleEvents.filter(
      (event) => event.type === "conversation_turn",
    ).length,
    pronunciationAttempts: visibleEvents.filter(
      (event) => event.type === "pronunciation_attempt",
    ).length,
    correctAnswers: visibleEvents.filter((event) => event.isCorrect).length,
    studyDays: days.length,
    currentStreak,
  };
};
