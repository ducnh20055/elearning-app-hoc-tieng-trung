import { useAuth } from "@/ctx/AuthContext";
import { getWeeklyStats } from "@/lib/speakingListeningStats";
import { useCallback, useEffect, useState } from "react";

interface WeeklyStats {
  minutesSpoken: number;
  minutesListened: number;
  weeklyChange: {
    spoken: number;
    listened: number;
  };
}

export const useSpeakingListningStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const weeklyStats = await getWeeklyStats(user.id);
      setStats(weeklyStats);
    } catch (err) {
      console.error("Failed to load speaking/listning stats:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setStats(null);
    refresh();
  }, [refresh]);

  return { stats, loading, refresh };
};
