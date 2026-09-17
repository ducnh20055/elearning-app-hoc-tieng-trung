import { ThemedText } from "@/components/ui/themed-text";
import {
  Chapter,
  COURSE_DATA,
  getChapterLevel,
  HSK_LEVELS,
  HskLevel,
  Lesson,
  vietnameseText,
} from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import { useSpeakingListningStats } from "@/hooks/useSpeakingListeningStats";
import { getDueReviewItems } from "@/lib/learningActivity";
import { getAllProgress } from "@/lib/lessonProgress";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const MAX_STARS = 3;

export default function LessonsContent() {
  const colors = Colors["light"];
  const { user } = useAuth();
  const { stats, loading, refresh } = useSpeakingListningStats();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [dueReviewCount, setDueReviewCount] = useState(0);
  const [firstDueLessonId, setFirstDueLessonId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<HskLevel | "all">("all");

  useEffect(() => {
    if (!user) return;

    getAllProgress(user.id).then(setProgress);
    getDueReviewItems(user.id).then((items) => {
      setDueReviewCount(items.length);
      setFirstDueLessonId(items[0]?.lessonId ?? null);
    });
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleLessonPress = (lesson: Lesson) => {
    router.push({ pathname: "/practise", params: { lessonId: lesson.id } });
  };

  const handlePractiseChapterPress = (chapter: Chapter) => {
    if (chapter.review) {
      router.push({
        pathname: "/practise",
        params: { lessonId: chapter.review.id },
      });
    }
  };

  const renderCompletionStatus = (count: number) => {
    const elements = [];
    const starsToDisplay = Math.min(count, MAX_STARS);

    for (let i = 1; i <= MAX_STARS; i++) {
      elements.push(
        <Ionicons
          key={`start-${i}`}
          name={i <= starsToDisplay ? "star" : "star-outline"}
          size={16}
          color={i <= starsToDisplay ? "#FFD700" : Colors.subduedTextColor}
          style={styles.starIcon}
        />,
      );
    }

    if (count > MAX_STARS) {
      const extraCount = count - MAX_STARS;
      elements.push(
        <ThemedText
          key="extra-count"
          style={[styles.extraCountText, { color: Colors.subduedTextColor }]}
        >
          +{extraCount}
        </ThemedText>,
      );
    }

    return <View style={styles.completionStarsContainer}>{elements}</View>;
  };

  const renderLessonNode = (lesson: Lesson, index: number) => {
    const completionCount = progress[lesson.id] || 0;
    const isMastered = completionCount >= MAX_STARS;
    const alignment = index % 2 === 0 ? "flex-start" : "flex-end";

    return (
      <View
        key={lesson.id}
        style={[styles.lessonNodeContainer, { alignItems: alignment }]}
      >
        <TouchableOpacity
          style={[
            styles.lessonBubble,
            {
              backgroundColor: colors.background,
              borderColor: isMastered
                ? Colors.primaryAccentColor
                : Colors.borderColor,
            },
          ]}
          onPress={() => handleLessonPress(lesson)}
        >
          <Ionicons
            name={lesson.icon}
            size={28}
            color={Colors.primaryAccentColor}
          />
          <View style={styles.lessonTextContainer}>
            <ThemedText style={styles.lessonTitle}>
              {vietnameseText(lesson.title)}
            </ThemedText>
            {renderCompletionStatus(completionCount)}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {/* HEADER DUOLINGO STYLE */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.headerTitle}>Tuần này</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Ôn tập của bạn
            </ThemedText>
          </View>

          <View style={styles.headerRight}>
            {/* Phút nói */}
            <View style={styles.statChip}>
              <ThemedText style={styles.statValue}>
                {loading ? "-" : Math.floor(stats?.minutesSpoken ?? 0)}
              </ThemedText>
              <Text style={styles.statLabel}>phút nói</Text>
            </View>

            {/* Phút nghe */}
            <View style={styles.statChip}>
              <ThemedText style={styles.statValue}>
                {loading ? "-" : Math.floor(stats?.minutesListened ?? 0)}
              </ThemedText>
              <Text style={styles.statLabel}>phút nghe</Text>
            </View>
          </View>
        </View>

        {dueReviewCount > 0 && firstDueLessonId && (
          <TouchableOpacity
            style={styles.reviewCard}
            onPress={() =>
              router.push({
                pathname: "/practise",
                params: { lessonId: firstDueLessonId },
              })
            }
          >
            <View style={styles.reviewIcon}>
              <Ionicons name="refresh" size={22} color="#FFF" />
            </View>
            <View style={styles.reviewText}>
              <ThemedText style={styles.reviewTitle}>
                Câu cần ôn hôm nay
              </ThemedText>
              <ThemedText style={styles.reviewSubtitle}>
                {dueReviewCount} câu đã đến thời điểm ôn lại
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#E05305" />
          </TouchableOpacity>
        )}

        {/* Main content */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.levelPicker}
          >
            <Pressable
              style={[
                styles.levelChip,
                selectedLevel === "all" && styles.levelChipActive,
              ]}
              onPress={() => setSelectedLevel("all")}
            >
              <Text
                style={[
                  styles.levelChipText,
                  selectedLevel === "all" && styles.levelChipTextActive,
                ]}
              >
                Tất cả
              </Text>
            </Pressable>
            {HSK_LEVELS.map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.levelChip,
                  selectedLevel === level && styles.levelChipActive,
                ]}
                onPress={() => setSelectedLevel(level)}
              >
                <Text
                  style={[
                    styles.levelChipText,
                    selectedLevel === level && styles.levelChipTextActive,
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {COURSE_DATA.chapters
            .filter(
              (chapter) =>
                selectedLevel === "all" ||
                getChapterLevel(chapter.id) === selectedLevel,
            )
            .map((chapter) => (
              <View key={chapter.id} style={styles.chapterContainer}>
                <View style={styles.chapterHeader}>
                  <Text style={styles.chapterNumberText}>
                    {getChapterLevel(chapter.id)} · CHỦ ĐỀ {chapter.id}
                  </Text>
                  <ThemedText type="title" style={styles.chapterTitleText}>
                    {vietnameseText(chapter.title)}
                  </ThemedText>
                </View>

                <View style={styles.lessonsWrapper}>
                  {chapter.lessons.map(renderLessonNode)}
                </View>

                {chapter.review && (
                  <TouchableOpacity
                    style={[
                      styles.practiceChapterButton,
                      { backgroundColor: Colors.primaryAccentColor },
                    ]}
                    onPress={() => handlePractiseChapterPress(chapter)}
                  >
                    <Ionicons name="flash" size={20} color="#FFF" />
                    <ThemedText style={styles.practiceChapterButtonText}>
                      Ôn tập {vietnameseText(chapter.title)}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5", 
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE5DF",
    backgroundColor: "#FAF8F5", 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    fontFamily: "ui-rounded",
    color: "#2B2B2B", 
    lineHeight: 26,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "ui-rounded",
    color: "#E05305", 
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFF0E6",
    borderWidth: 2,
    borderColor: "#FFD1B8",
  },
  reviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF5500",
    marginRight: 12,
  },
  reviewText: { flex: 1 },
  reviewTitle: { fontSize: 15, fontWeight: "800" },
  reviewSubtitle: { marginTop: 3, fontSize: 12, color: "#8E4A2F" },
  statChip: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 4,
    borderBottomColor: "#C84000", 
    minWidth: 82,
    height: 64,
  },
  statValueContainer: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "ui-rounded",
    color: "#2B2B2B",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "ui-rounded",
    color: "#C84000",
    textTransform: "lowercase",
    marginTop: 1,
  },

  
  scrollContainer: {
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 20,
    backgroundColor: "#FAF8F5",
  },
  levelPicker: {
    gap: 8,
    paddingBottom: 24,
  },
  levelChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EAE5DF",
    backgroundColor: "#FFFFFF",
  },
  levelChipActive: {
    borderColor: "#FF5500",
    backgroundColor: "#FF5500",
  },
  levelChipText: {
    color: "#2B2B2B",
    fontWeight: "700",
  },
  levelChipTextActive: {
    color: "#FFFFFF",
  },
  chapterContainer: {
    marginBottom: 24,
  },
  chapterHeader: {
    marginBottom: 24,
  },
  chapterNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "ui-rounded",
    color: "#E05305",
    textTransform: "uppercase",
    opacity: 0.8,
  },
  chapterTitleText: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: "bold",
    fontFamily: "ui-rounded",
    color: "#2B2B2B",
  },
  lessonsWrapper: {
    gap: 20,
  },
  lessonNodeContainer: {
    minHeight: 80,
    justifyContent: "center",
  },
  lessonBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 6,
    borderBottomColor: "#C84000",
    backgroundColor: "#FFFFFF",
    width: "82%",
    gap: 16,
  },
  lessonTextContainer: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "ui-rounded",
    color: "#2B2B2B",
    marginBottom: 6,
  },
  completionStarsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 3,
  },
  extraCountText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "ui-rounded",
    color: "#2B2B2B",
  },
  practiceChapterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    marginBottom: 24,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: "#FF5500",
    elevation: 4,
    borderBottomWidth: 4,
    borderBottomColor: "#C84000",
  },
  practiceChapterButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "ui-rounded",
  },
});
