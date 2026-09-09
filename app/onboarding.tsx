import { Paywall } from "@/components/subcription/Paywall";
import { ThemedText } from "@/components/ui/themed-text";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const LEVELS = [
  {
    id: "beginner",
    title: "Mới bắt đầu",
    description: "Tôi biết một vài từ hoặc chưa biết gì.",
  },
  {
    id: "intermediate",
    title: "Trung cấp",
    description: "Tôi có thể giao tiếp cơ bản.",
  },
  {
    id: "advanced",
    title: "Nâng cao",
    description: "Tôi có thể diễn đạt khá trôi chảy.",
  },
];

const MOTIVATIONS = [
  {
    id: "travel",
    title: "Du lịch",
    icon: "airplane-outline",
  },
  {
    id: "work",
    title: "Công việc",
    icon: "briefcase-outline",
  },
  {
    id: "family",
    title: "Gia đình",
    icon: "people-outline",
  },
  {
    id: "culture",
    title: "Văn hóa",
    icon: "book-outline",
  },
  {
    id: "hobby",
    title: "Sở thích",
    icon: "game-controller-outline",
  },
];

const INTERESTS = [
  "Ẩm thực",
  "Kinh doanh",
  "Đời sống hằng ngày",
  "Công nghệ",
  "Nghệ thuật",
  "Âm nhạc",
  "Chính trị",
  "Thể thao",
];

export default function OnboardingScreen() {
  // Giữ nguyên giao diện nền sáng gốc của bạn
  const colors = Colors["light"];

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<string | null>(null);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);

  const { refreshProfile } = useAuth();

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const isNextEnabled = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return !!level;
    if (step === 2) return motivations.length > 0;
    if (step === 3) return selectedInterests.length > 0;
    return false;
  };

  const saveProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Now user found");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name,
        chinese_level: level,
        motivations: motivations,
        interests: selectedInterests,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setShowPaywall(true);
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Không thể lưu hồ sơ. Vui lòng thử lại.");
    }
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      saveProfile();
    }
  };

  const toggleMotivation = (id: string) => {
    if (motivations.includes(id)) {
      setMotivations(motivations.filter((m) => m !== id));
    } else {
      setMotivations([...motivations, id]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const renderStep0Name = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
        Bạn muốn chúng tôi gọi bạn là gì?
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Tên của bạn sẽ giúp cá nhân hóa bài học.
      </ThemedText>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
        placeholder="Tên của bạn"
        placeholderTextColor="#9CA3AF"
        value={name}
        onChangeText={setName}
        autoFocus
      />
    </View>
  );

  const renderStep1Level = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
        Bạn biết tiếng Trung ở mức nào?
      </ThemedText>

      <ScrollView
        contentContainerStyle={{ rowGap: 16 }}
        style={{ marginTop: 20 }}
      >
        {LEVELS.map((l) => (
          <TouchableOpacity
            key={l.id}
            style={[
              styles.optionCard,
              level === l.id && {
                borderColor: Colors.primaryAccentColor,
                backgroundColor: "#fff5f0", // Sửa thành backgroundColor cho chuẩn nền sáng
              },
            ]}
            onPress={() => setLevel(l.id)}
          >
            <ThemedText
              style={[
                styles.optionTitle,
                level === l.id && { color: Colors.primaryAccentColor },
              ]}
            >
              {l.title}
            </ThemedText>
            <ThemedText style={[styles.optionDescription]}>
              {l.description}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep2Motivation = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
        Vì sao bạn học tiếng Trung?
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Chọn tất cả lựa chọn phù hợp.
      </ThemedText>

      <ScrollView
        contentContainerStyle={{ rowGap: 16 }}
        style={{ marginTop: 10 }}
      >
        {MOTIVATIONS.map((m) => {
          const isSelected = motivations.includes(m.id);

          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.optionCard,
                styles.motivationCard,
                isSelected && {
                  borderColor: Colors.primaryAccentColor,
                  backgroundColor: "#fff5f0", // Sửa thành backgroundColor cho chuẩn nền sáng
                },
              ]}
              onPress={() => toggleMotivation(m.id)}
            >
              <Ionicons
                name={m.icon as any}
                size={24}
                color={isSelected ? Colors.primaryAccentColor : colors.icon}
              />
              <ThemedText
                style={[
                  styles.optionTitle,
                  isSelected && { color: Colors.primaryAccentColor },
                ]}
              >
                {m.title}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderStep3Interests = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="title" style={styles.title}>
        Bạn quan tâm đến điều gì?
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Chọn tất cả lựa chọn phù hợp.
      </ThemedText>

      <View style={styles.tagsContainer}>
        {INTERESTS.map((i) => {
          const isSelected = selectedInterests.includes(i);

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.tag,
                isSelected && {
                  backgroundColor: Colors.primaryAccentColor,
                  borderColor: Colors.primaryAccentColor,
                },
              ]}
              onPress={() => toggleInterest(i)}
            >
              <ThemedText
                style={[styles.tagText, isSelected && { color: "#FFF" }]}
              >
                {i}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          {step > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${((step + 1) / 4) * 100}%`,
                  backgroundColor: Colors.primaryAccentColor,
                },
              ]}
            ></View>
          </View>
        </View>
        <View style={styles.mainContent}>
          <Animated.View
            key={step}
            entering={FadeIn}
            exiting={FadeOut}
            style={{ flex: 1 }}
          >
            {step === 0 && renderStep0Name()}
            {step === 1 && renderStep1Level()}
            {step === 2 && renderStep2Motivation()}
            {step === 3 && renderStep3Interests()}
          </Animated.View>
        </View>

        <View style={[styles.footer, { zIndex: 10 }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: isNextEnabled()
                  ? Colors.primaryAccentColor
                  : "#E5E7EB",
              },
            ]}
            onPress={handleContinue}
            disabled={!isNextEnabled()}
          >
            <ThemedText style={styles.continueButtonText}>
              {step === 3 ? "Bắt đầu học" : "Tiếp tục"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Paywall
        visible={showPaywall}
        onClose={async () => {
          setShowPaywall(false);
          await refreshProfile();
          router.replace("/(tabs)/lessons");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 72,
    backgroundColor: Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    marginRight: 16,
    padding: 10,
    borderRadius: 16,
    backgroundColor: Colors.orangeSoft,
  },
  progressBarContainer: {
    flex: 1,
    height: 14,
    backgroundColor: "#E5E5E5",
    borderRadius: 99,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 99,
  },
  mainContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.ink,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.subduedTextColor,
    marginBottom: 28,
  },
  input: {
    fontSize: 20,
    borderBottomWidth: 2,
    paddingVertical: 12,
    marginTop: 20,
    borderColor: Colors.primaryAccentColor,
    backgroundColor: Colors.surface,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderBottomWidth: 4,
    borderBottomColor: "#D96B00",
    backgroundColor: Colors.surface,
  },
  motivationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.subduedTextColor,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  tag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderBottomWidth: 4,
    borderBottomColor: "#D8D8D8",
    backgroundColor: Colors.surface,
  },
  tagText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    padding: 24,
    borderTopWidth: 2,
    borderTopColor: "#E5E5E5",
    backgroundColor: Colors.surface,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: Colors.orangeDark,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    width: "100%",
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
