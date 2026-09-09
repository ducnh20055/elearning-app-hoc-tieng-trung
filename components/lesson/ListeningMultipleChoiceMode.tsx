import { ListeningOption, vietnameseText } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "../ui/themed-text";

export default function ListeningMultipleChoiceMode({
  options,
  selectedOption,
  handleOptionPress,
  isLoading,
  showResult,
}: {
  options: ListeningOption[];
  selectedOption: number | null;
  handleOptionPress: (id: number) => void;
  isLoading: boolean;
  showResult: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.promptContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Bạn vừa nghe thấy gì?
        </ThemedText>
      </View>
      <ScrollView
        style={styles.optionsScrollView}
        contentContainerStyle={styles.optionsContentContainer}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isLoading && !showResult}
      >
        {options.map((option) => {
          const isSelected = selectedOption === option.id;

          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.optionButton,
                isSelected && styles.selectedOption,
                pressed && styles.pressedOption,
                {
                  backgroundColor: isSelected ? "#FFF3E0" : "#ffffff",
                  borderColor: isSelected
                    ? Colors.primaryAccentColor
                    : "#e5e7eb",
                  borderBottomColor: isSelected ? "#D96B00" : "#E5E5E5",
                  opacity: isLoading || showResult ? 0.7 : 1,
                  marginBottom: 16,
                },
              ]}
              onPress={() => handleOptionPress(option.id)}
              disabled={isLoading || showResult}
            >
              <ThemedText style={styles.optionText}>
                {vietnameseText(option.english)}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  promptContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
  },
  optionsScrollView: {
    flex: 1,
  },
  optionsContentContainer: {
    paddingBottom: 0,
  },
  optionButton: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderBottomColor: "#E5E5E5",
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  selectedOption: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
      },
      android: {
        borderWidth: 3,
      },
    }),
  },
  pressedOption: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
});