import { SpeakingOption, vietnameseText } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../ui/themed-text";

export function FeedbackView({
  correctOption,
  isCorrect,
  onContinue,
  onRetry,
  attemptCount,
  maxAttempts,
  transcription,
}: {
  correctOption: SpeakingOption;
  isCorrect: boolean | null;
  onContinue: () => void;
  onRetry?: () => void;
  attemptCount: number;
  maxAttempts: number;
  transcription?: {
    expected: string;
    said: string;
  };
}) {
  const showRetryButton = onRetry && !isCorrect && attemptCount < maxAttempts;
  const showCorrectAnswer = !isCorrect && attemptCount >= maxAttempts;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCorrect ? "#d7ffb8" : "#ffdbe9",
          borderColor: isCorrect ? "#58CC02" : "#ff4b4b",
          borderTopColor: isCorrect ? "#58CC02" : "#ff4b4b",
        },
      ]}
    >
      <View style={styles.header}>
        <Ionicons
          name={isCorrect ? "checkmark-circle" : "close-circle"}
          size={40}
          color={isCorrect ? "#58CC02" : "#EA2B2B"}
        />
        <View style={styles.headerText}>
          <ThemedText style={styles.title}>
            {isCorrect
              ? "Làm tốt lắm!"
              : showRetryButton
                ? "Gần đúng rồi"
                : "Tiếp tục luyện tập nhé"}
          </ThemedText>
          {!isCorrect && showRetryButton && (
            <ThemedText
              style={[styles.subtitle, { color: Colors.subduedTextColor }]}
            >
              {"Thử lại nhé, bạn làm được!"}
            </ThemedText>
          )}
          {showCorrectAnswer && (
            <ThemedText
              style={[styles.subtitle, { color: Colors.subduedTextColor }]}
            >
              {"Đây là câu đúng cho lần sau"}
            </ThemedText>
          )}
        </View>
      </View>
      {/* Transcription feedback */}
      {transcription && (
        <View style={styles.transcriptionContainer}>
          <View style={styles.transcriptionRow}>
            <ThemedText style={styles.transcriptionLabel}>Cần nói:</ThemedText>
            <ThemedText style={styles.transcriptionText}>
              {transcription.expected}
            </ThemedText>
          </View>
          <View style={styles.transcriptionRow}>
            <ThemedText style={styles.transcriptionLabel}>
              Bạn đã nói:
            </ThemedText>
            <ThemedText
              style={[
                styles.transcriptionText,
                {
                  color: isCorrect ? "#58CC02" : "#EA2B2B",
                },
              ]}
            >
              {transcription.said.charAt(0).toUpperCase() +
                transcription.said.slice(1)}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Show correct answer after max attempts */}
      {showCorrectAnswer && (
        <View style={styles.correctAnswerSection}>
          <View style={styles.correctAnswerHeader}>
            <Ionicons
              name="bulb-outline"
              size={20}
              color={Colors.primaryAccentColor}
            />
            <ThemedText style={styles.correctAnswerLabel}>
              Câu trả lời đúng:
            </ThemedText>
          </View>
          <View style={styles.correctAnswerContent}>
            <ThemedText style={styles.correctAnswerEnglish}>
              {vietnameseText(correctOption.english)}
            </ThemedText>
            <View style={styles.correctAnswerMandarin}>
              <ThemedText style={styles.correctAnswerPinyin}>
                {correctOption.mandarin.pinyin}
              </ThemedText>
              <ThemedText
                style={[
                  styles.correctAnswerHanzi,
                  { color: Colors.subduedTextColor },
                ]}
              >
                {correctOption.mandarin.hanzi}
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        {showRetryButton ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <ThemedText style={styles.retryButtonText}>
                Thử lại ({maxAttempts - attemptCount} lần)
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.skipButton,
                { borderColor: Colors.subduedTextColor },
              ]}
              onPress={onContinue}
            >
              <ThemedText
                style={[
                  styles.skipButtonText,
                  { color: Colors.subduedTextColor },
                ]}
              >
                Bỏ qua
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.continueButton]}
            onPress={onContinue}
          >
            <ThemedText style={[styles.continueButtonText]}>
              {isCorrect ? "Tiếp tục" : "Câu tiếp theo"}
            </ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Attempt indicator */}
      {!isCorrect && attemptCount > 0 && attemptCount < maxAttempts && (
        <View style={styles.attemptIndicator}>
          <View style={styles.attemptDots}>
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.attemptDot,
                  {
                    backgroundColor:
                      i < attemptCount ? "#ef4444" : "rgba(107, 114, 128, 0.3)",
                  },
                ]}
              ></View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderBottomColor: "#46A302",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  correctAnswerSection: {
    backgroundColor: "rgba(255, 73, 0, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 73, 0, 0.3)",
  },
  correctAnswerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  correctAnswerLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    color: Colors.primaryAccentColor,
  },
  correctAnswerContent: {
    gap: 8,
  },
  correctAnswerEnglish: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  correctAnswerMandarin: {
    gap: 4,
  },
  correctAnswerPinyin: {
    fontSize: 18,
    fontWeight: "700",
  },
  correctAnswerHanzi: {
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: "#D96B00",
    gap: 8,
  },
  retryButton: {
    backgroundColor: "#ff4b4b",
    borderBottomColor: "#ea2b2b",
    shadowColor: Colors.primaryAccentColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  skipButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderBottomWidth: 4,
    borderBottomColor: "#D1D1D1",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#58CC02",
    borderBottomColor: "#46A302",
    shadowColor: "#58CC02",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  attemptIndicator: {
    marginTop: 16,
    alignItems: "center",
  },
  attemptDots: {
    flexDirection: "row",
    gap: 8,
  },
  attemptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transcriptionContainer: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 8,
    marginBottom: 12,
  },
  transcriptionRow: {
    flexDirection: "row",
  },
  transcriptionLabel: {
    width: 80,
    fontSize: 14,
    color: Colors.subduedTextColor,
    fontWeight: "600",
  },
  transcriptionText: {
    flex: 1,
    fontSize: 14,
  },
});
