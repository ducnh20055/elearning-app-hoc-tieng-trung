import { supabase } from "@/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY_PREFIX = "lesson_progress:";

export interface LessonProgress {
  [lessonId: string]: number; // lessonID -> completionCount
}

const getProgressKey = (userId: string) => `${PROGRESS_KEY_PREFIX}${userId}`;

const readProgress = async (userId: string): Promise<LessonProgress> => {
  try {
    const raw = await AsyncStorage.getItem(getProgressKey(userId));
    if (!raw) return {};

    return JSON.parse(raw) as LessonProgress;
  } catch {
    return {};
  }
};

const writeProgress = async (userId: string, data: LessonProgress) => {
  await AsyncStorage.setItem(getProgressKey(userId), JSON.stringify(data));
};

export const incrementLessonCompletion = async (
  userId: string,
  lessonId: string,
) => {
  const progress = await readProgress(userId);
  progress[lessonId] = (progress[lessonId] || 0) + 1;
  await writeProgress(userId, progress);
  void supabase.from("lesson_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completion_count: progress[lessonId],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );
};

export const getAllProgress = async (
  userId: string,
): Promise<LessonProgress> => {
  return await readProgress(userId);
};
