import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY_PREFIX = "speaking_listening_stats:";

const MINUTES_PER_QUESTION = 0.5;
const MINUTES_PER_CONVERSATION_TURN = 1;

export interface SpeakingListeningStats {
  minutesSpoken: number;
  minutesListened: number;
  lastUpdate: string;
  questionsAnswered: number;
  questionsListened: number;
  conversationTurns: number;
}

const getStatsKey = (userId: string) => `${STATS_KEY_PREFIX}${userId}`;

const readStats = async (userId: string): Promise<SpeakingListeningStats> => {
  try {
    const raw = await AsyncStorage.getItem(getStatsKey(userId));
    if (!raw) {
      return getDefaultStats();
    }

    return JSON.parse(raw) as SpeakingListeningStats;
  } catch {
    return getDefaultStats();
  }
};

const writeStats = async (userId: string, stats: SpeakingListeningStats) => {
  await AsyncStorage.setItem(getStatsKey(userId), JSON.stringify(stats));
};

const getDefaultStats = (): SpeakingListeningStats => ({
  minutesSpoken: 0,
  minutesListened: 0,
  lastUpdate: new Date().toISOString(),
  questionsAnswered: 0,
  questionsListened: 0,
  conversationTurns: 0,
});

export const recordQuestionAnswered = async (userId: string) => {
  const stats = await readStats(userId);
  stats.questionsAnswered += 1;
  stats.minutesSpoken = stats.questionsAnswered * MINUTES_PER_QUESTION;
  stats.lastUpdate = new Date().toISOString();
  await writeStats(userId, stats);
};

export const recordQuestionListened = async (userId: string) => {
  const stats = await readStats(userId);
  stats.questionsListened += 1;
  stats.minutesListened = stats.questionsListened * MINUTES_PER_QUESTION;
  stats.lastUpdate = new Date().toISOString();
  await writeStats(userId, stats);
};

export const recordConversationTurn = async (userId: string) => {
  const stats = await readStats(userId);
  stats.conversationTurns += 1;

  stats.minutesSpoken += MINUTES_PER_CONVERSATION_TURN;
  stats.minutesListened += MINUTES_PER_CONVERSATION_TURN;
  stats.lastUpdate = new Date().toISOString();
  await writeStats(userId, stats);
};

export const getWeeklyStats = async (userId: string) => {
  const stats = await readStats(userId);

  return {
    minutesSpoken: Math.round(stats.minutesSpoken * 10) / 10,
    minutesListened: Math.round(stats.minutesListened * 10) / 10,
    weeklyChange: {
      spoken: 0,
      listened: 0,
    },
  };
};
