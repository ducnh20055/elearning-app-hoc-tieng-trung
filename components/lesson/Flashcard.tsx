import { vietnameseText, Word } from "@/constants/CourseData";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Speech from "expo-speech";
import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../ui/themed-text";

export default function Flashcard({
  word,
  direction,
}: {
  word: Word;
  direction: "en-zh" | "zh-en";
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const flipToFront = () => {
    Animated.timing(flipAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setIsFlipped(false);
  };

  const flipToBack = () => {
    Animated.timing(flipAnimation, {
      toValue: 180,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setIsFlipped(true);
  };

  const playPronunciation = () => {
    void Speech.stop();
    Speech.speak(word.hanzi, { language: "zh-CN", rate: 0.85 });
  };

  const FrontContent = () => {
    if (direction === "en-zh") {
      return (
        <ThemedText style={styles.englishFront}>
          {vietnameseText(word.english)}
        </ThemedText>
      );
    }

    return (
      <View style={styles.mandarinContent}>
        <ThemedText style={styles.pinyin}>{word.pinyin}</ThemedText>
        <ThemedText style={styles.hanzi}>{word.hanzi}</ThemedText>
      </View>
    );
  };

  const BackContent = () => {
    if (direction === "en-zh") {
      return (
        <View style={styles.mandarinContent}>
          <ThemedText style={[styles.pinyin, styles.mandarinBackText]}>
            {word.pinyin}
          </ThemedText>
          <ThemedText style={[styles.hanzi, styles.mandarinBackText]}>
            {word.hanzi}
          </ThemedText>
        </View>
      );
    }

    return (
      <ThemedText style={[styles.englishBack, styles.mandarinBackText]}>
        {vietnameseText(word.english)}
      </ThemedText>
    );
  };

  return (
    <View style={styles.cardWrapper}>
      <Pressable onPress={isFlipped ? flipToFront : flipToBack}>
        <Animated.View
          style={[styles.card, styles.cardFront, frontAnimatedStyle]}
        >
          {FrontContent()}
        </Animated.View>
        <Animated.View
          style={[styles.card, styles.cardBack, backAnimatedStyle]}
        >
          {BackContent()}
        </Animated.View>
      </Pressable>
      <TouchableOpacity
        accessibilityLabel="Phát cách đọc"
        style={styles.audioButton}
        onPress={playPronunciation}
      >
        <Ionicons name="volume-high" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: "relative",
  },
  card: {
    width: 340,
    maxHeight: 440,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderBottomWidth: 5,
    borderBottomColor: "#D5D5D5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  cardFront: {
    backgroundColor: "#fff",
  },
  cardBack: {
    backgroundColor: "#FF8800",
    borderColor: "#D96B00",
    borderBottomColor: "#D96B00",
    position: "absolute",
    top: 0,
  },
  audioButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF8800",
    borderWidth: 2,
    borderColor: "#D96B00",
    borderBottomWidth: 4,
    borderBottomColor: "#D96B00",
    zIndex: 3,
  },
  mandarinContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  pinyin: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: "90%",
  },
  hanzi: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: "center",
    maxWidth: "90%",
  },
  mandarinBackText: {
    color: "white",
  },
  englishFront: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: "center",
    fontWeight: "600",
    maxWidth: "90%",
  },
  englishBack: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: "center",
    fontStyle: "italic",
    maxWidth: "90%",
  },
});
