import { Paywall } from "@/components/subcription/Paywall";
import { ThemedText } from "@/components/ui/themed-text";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import { useSpeakingListningStats } from "@/hooks/useSpeakingListeningStats";
import {
  ActivitySummary,
  DailyGoal,
  getActivitySummary,
  getDailyGoal,
  getRecentPronunciationAttempts,
  PronunciationAttempt,
  saveDailyGoal,
  syncLearningEvents,
} from "@/lib/learningActivity";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function ProfileContent() {
  const { isPrenium, preniumExpiresAt, profile, user } = useAuth();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const { stats } = useSpeakingListningStats();
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [recentAttempts, setRecentAttempts] = useState<PronunciationAttempt[]>(
    [],
  );

  useEffect(() => {
    if (!user) return;

    const loadActivity = async () => {
      const [summary, goal, attempts] = await Promise.all([
        getActivitySummary(user.id),
        getDailyGoal(user.id),
        getRecentPronunciationAttempts(user.id),
      ]);
      setActivity(summary);
      setDailyGoal(goal);
      setRecentAttempts(attempts);
      await syncLearningEvents(user.id);
    };

    void loadActivity();
  }, [user]);

  const chooseDailyGoal = () => {
    if (!user) return;
    setGoalModalVisible(true);
  };

  const selectDailyGoal = (goal: DailyGoal) => {
    if (!user) return;
    setDailyGoal(goal);
    setGoalModalVisible(false);
    void saveDailyGoal(user.id, goal);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        await supabase.auth.signOut({ scope: "local" });
        toast.success("Đã đăng xuất thành công");
        return;
      } else {
        toast.success("Đã đăng xuất thành công");
      }
    } catch {
      try {
        await supabase.auth.signOut({ scope: "local" });
        toast.success("Đã đăng xuất thành công");
      } catch {
        toast.error("Không thể đăng xuất. Hãy khởi động lại ứng dụng.");
      }
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: Colors.borderColor }]}
        >
          <View style={styles.headerTitleGroup}>
            <ThemedText style={styles.headerTitle}>Cá nhân</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Theo dõi hành trình học của bạn
            </ThemedText>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Info Card */}
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: Colors.light.background,
                borderColor: Colors.borderColor,
              },
            ]}
          >
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: Colors.primaryAccentColor },
              ]}
            >
              <ThemedText style={styles.avatarText}>
                {profile.full_name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={styles.userName}>{profile.full_name}</ThemedText>
            <ThemedText
              style={[styles.userEmail, { color: Colors.subduedTextColor }]}
            >
              {user?.email}
            </ThemedText>
          </View>

          {/* Statistics */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {Math.floor(stats?.minutesSpoken ?? 0)}
              </ThemedText>
              <ThemedText
                style={[styles.statLabel, { color: Colors.subduedTextColor }]}
              >
                phút nói
              </ThemedText>
            </View>

            <View
              style={[
                styles.statSeparator,
                { backgroundColor: Colors.borderColor },
              ]}
            />

            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>
                {activity?.currentStreak ?? 0}
              </ThemedText>
              <ThemedText
                style={[styles.statLabel, { color: Colors.subduedTextColor }]}
              >
                ngày liên tiếp
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeadingRow}>
              <ThemedText style={styles.sectionTitle}>
                Mục tiêu hôm nay
              </ThemedText>
              <TouchableOpacity onPress={chooseDailyGoal}>
                <ThemedText style={styles.changeGoalText}>
                  Đổi mục tiêu
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.goalCard}>
              <View style={styles.goalIcon}>
                <Ionicons name="flag" size={24} color="#FFF" />
              </View>
              <View style={styles.goalText}>
                <ThemedText style={styles.goalTitle}>
                  {activity?.minutesSpoken ?? 0}/
                  {dailyGoal?.targetMinutes ?? 10} phút luyện nói
                </ThemedText>
                <ThemedText style={styles.goalSubtitle}>
                  {activity?.questionsAnswered ?? 0}/
                  {dailyGoal?.targetQuestions ?? 5} câu ·{" "}
                  {activity?.lessonsCompleted ?? 0}/
                  {dailyGoal?.targetLessons ?? 1} bài
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Tổng quan học tập
            </ThemedText>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <ThemedText style={styles.overviewValue}>
                  {activity?.studyDays ?? 0}
                </ThemedText>
                <ThemedText style={styles.overviewLabel}>ngày học</ThemedText>
              </View>
              <View style={styles.overviewItem}>
                <ThemedText style={styles.overviewValue}>
                  {activity?.correctAnswers ?? 0}
                </ThemedText>
                <ThemedText style={styles.overviewLabel}>câu đúng</ThemedText>
              </View>
              <View style={styles.overviewItem}>
                <ThemedText style={styles.overviewValue}>
                  {activity?.pronunciationAttempts ?? 0}
                </ThemedText>
                <ThemedText style={styles.overviewLabel}>
                  lần phát âm
                </ThemedText>
              </View>
              <View style={styles.overviewItem}>
                <ThemedText style={styles.overviewValue}>
                  {activity?.conversationTurns ?? 0}
                </ThemedText>
                <ThemedText style={styles.overviewLabel}>
                  lượt hội thoại
                </ThemedText>
              </View>
            </View>
          </View>

          {recentAttempts.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Lịch sử phát âm
              </ThemedText>
              <View style={styles.historyCard}>
                {recentAttempts.slice(0, 3).map((attempt) => (
                  <View key={attempt.id} style={styles.historyRow}>
                    <Ionicons
                      name={
                        attempt.isCorrect ? "checkmark-circle" : "close-circle"
                      }
                      size={20}
                      color={attempt.isCorrect ? "#16A34A" : "#DC2626"}
                    />
                    <View style={styles.historyText}>
                      <ThemedText style={styles.historyPinyin}>
                        {attempt.expectedPinyin}
                      </ThemedText>
                      <ThemedText style={styles.historyTranscript}>
                        Bạn nói: {attempt.transcript}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.historyScore}>
                      {Math.round(attempt.similarityScore * 100)}%
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Premium card */}
          <TouchableOpacity
            style={[
              styles.premiumCard,
              {
                backgroundColor: Colors.primaryAccentColor,
              },
            ]}
            onPress={() => {
              if (!isPrenium) setPaywallVisible(true);
            }}
          >
            <View style={styles.premiumLeft}>
              <Ionicons name="star" size={24} color="#FFF" />
              <View style={styles.premiumText}>
                <ThemedText style={styles.premiumTitle}>
                  {isPrenium ? "Gói Premium đang hoạt động" : "Mở khóa Premium"}
                </ThemedText>
                <ThemedText style={styles.premiumSubtitle}>
                  {isPrenium
                    ? preniumExpiresAt
                      ? `Premium hết hạn ${new Date(preniumExpiresAt).toLocaleDateString("vi-VN")}`
                      : "Đã mở khóa tính năng Premium"
                    : "Mở khóa toàn bộ bài học không giới hạn"}
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </TouchableOpacity>

          {/* Settings Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Cài đặt</ThemedText>
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: Colors.light.background,
                  borderColor: Colors.borderColor,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                  Alert.alert(
                    "Cài đặt",
                    "Ngôn ngữ, thông báo và tùy chọn ứng dụng",
                  )
                }
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={Colors.subduedTextColor}
                  />
                  <ThemedText style={styles.menuItemTitle}>
                    Cài đặt ứng dụng
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.subduedTextColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItemLast}
                onPress={() =>
                  Alert.alert(
                    "Trợ giúp",
                    "Nhận hỗ trợ và xem câu hỏi thường gặp",
                  )
                }
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name="help-circle-outline"
                    size={24}
                    color={Colors.subduedTextColor}
                  />
                  <ThemedText style={styles.menuItemTitle}>
                    Trợ giúp & hỗ trợ
                  </ThemedText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.subduedTextColor}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.signOutButton, { borderColor: Colors.borderColor }]}
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <ThemedText style={styles.signOutText}>Đăng xuất</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Paywall
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />

      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.goalModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setGoalModalVisible(false)}
          />
          <View style={styles.goalModalCard}>
            <View style={styles.goalModalHeader}>
              <View>
                <ThemedText style={styles.goalModalTitle}>
                  Mục tiêu hôm nay
                </ThemedText>
                <ThemedText style={styles.goalModalSubtitle}>
                  Chọn nhịp học phù hợp với bạn
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.goalModalClose}
                onPress={() => setGoalModalVisible(false)}
                accessibilityLabel="Đóng"
              >
                <Ionicons name="close" size={20} color="#6B625D" />
              </TouchableOpacity>
            </View>

            {[
              {
                label: "Nhẹ nhàng",
                description: "Duy trì thói quen mỗi ngày",
                goal: {
                  targetMinutes: 5,
                  targetQuestions: 3,
                  targetLessons: 1,
                },
                icon: "leaf-outline" as const,
              },
              {
                label: "Cân bằng",
                description: "Tiến bộ đều mà không quá tải",
                goal: {
                  targetMinutes: 10,
                  targetQuestions: 5,
                  targetLessons: 1,
                },
                icon: "flash-outline" as const,
              },
              {
                label: "Tập trung",
                description: "Tăng tốc quá trình học",
                goal: {
                  targetMinutes: 20,
                  targetQuestions: 10,
                  targetLessons: 2,
                },
                icon: "rocket-outline" as const,
              },
            ].map((option) => {
              const isSelected =
                dailyGoal?.targetMinutes === option.goal.targetMinutes;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.goalOption,
                    isSelected && styles.goalOptionSelected,
                  ]}
                  onPress={() => selectDailyGoal(option.goal)}
                >
                  <View
                    style={[
                      styles.goalOptionIcon,
                      isSelected && styles.goalOptionIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={22}
                      color={isSelected ? "#FFF" : "#E05305"}
                    />
                  </View>
                  <View style={styles.goalOptionText}>
                    <ThemedText style={styles.goalOptionLabel}>
                      {option.label}
                    </ThemedText>
                    <ThemedText style={styles.goalOptionDescription}>
                      {option.description}
                    </ThemedText>
                  </View>
                  <View style={styles.goalOptionValue}>
                    <ThemedText style={styles.goalOptionMinutes}>
                      {option.goal.targetMinutes} phút
                    </ThemedText>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#FF5500"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5", // Màu nền kem nhạt toàn trang
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE5DF",
    backgroundColor: "#FAF8F5",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2B2B2B",
  },
  headerTitleGroup: {
    gap: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E05305", // Màu cam theo style
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 70,
    backgroundColor: "#FAF8F5",
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 5,
    borderBottomColor: "#C84000", // Viền cam 3D
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#FF5500", // Nền avatar màu cam
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 36,
    textAlign: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2B2B2B",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#8E8E93",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginBottom: 20,
    gap: 24,
  },
  statItem: {
    alignItems: "center",
    minWidth: 112,
    minHeight: 68,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 4,
    borderBottomColor: "#C84000",
    backgroundColor: "#FFFFFF",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2B2B2B",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#C84000",
    marginTop: 2,
  },
  statSeparator: {
    width: 1,
    height: 24,
    backgroundColor: "#EAE5DF",
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: "#FF5500",
    borderWidth: 2,
    borderColor: "#C84000",
    borderBottomWidth: 5,
    borderBottomColor: "#C84000",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  premiumLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E05305", // Màu cam cho tiêu đề section
    textTransform: "uppercase",
    marginBottom: 12,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  changeGoalText: {
    color: "#E05305",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFF0E6",
    borderWidth: 2,
    borderColor: "#FFD1B8",
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF5500",
    marginRight: 14,
  },
  goalText: { flex: 1 },
  goalTitle: { fontSize: 16, fontWeight: "800", color: "#2B2B2B" },
  goalSubtitle: { marginTop: 4, fontSize: 13, color: "#8E4A2F" },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  overviewItem: {
    width: "48%",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#EAE5DF",
  },
  overviewValue: { fontSize: 22, fontWeight: "800", color: "#2B2B2B" },
  overviewLabel: { marginTop: 3, fontSize: 12, color: "#8E8E93" },
  historyCard: {
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#EAE5DF",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0ECE8",
  },
  historyText: { flex: 1, marginHorizontal: 10 },
  historyPinyin: { fontSize: 15, fontWeight: "800" },
  historyTranscript: { marginTop: 2, fontSize: 12, color: "#8E8E93" },
  historyScore: { fontSize: 13, fontWeight: "800", color: "#E05305" },
  goalModalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(43, 43, 43, 0.42)",
  },
  goalModalCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#FFFCF9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  goalModalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  goalModalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2B2B2B",
  },
  goalModalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#8E8E93",
  },
  goalModalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2ECE7",
  },
  goalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    backgroundColor: "#FFFFFF",
  },
  goalOptionSelected: {
    borderColor: "#FF5500",
    backgroundColor: "#FFF0E6",
  },
  goalOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0E6",
  },
  goalOptionIconSelected: {
    backgroundColor: "#FF5500",
  },
  goalOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  goalOptionLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2B2B2B",
  },
  goalOptionDescription: {
    marginTop: 3,
    fontSize: 12,
    color: "#8E8E93",
  },
  goalOptionValue: {
    alignItems: "flex-end",
    gap: 5,
  },
  goalOptionMinutes: {
    fontSize: 13,
    fontWeight: "800",
    color: "#E05305",
  },
  menuCard: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 5,
    borderBottomColor: "#C84000",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#EAE5DF",
    backgroundColor: "#FFFFFF",
  },
  menuItemLast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2B2B2B",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 5,
    borderBottomColor: "#D1D1D1",
    backgroundColor: "#FFFFFF",
    gap: 8,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
});
