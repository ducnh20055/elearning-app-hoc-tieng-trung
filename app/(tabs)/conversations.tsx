import { Paywall } from "@/components/subcription/Paywall";
import { ThemedText } from "@/components/ui/themed-text";
import {
  ConversationScenario,
  COURSE_DATA,
  vietnameseText,
} from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import {
  createCustomScenarioId,
  listCustomScenarios,
  saveCustomScenario,
} from "@/lib/customScenarios";
import { supabase } from "@/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function ConversationsScreen() {
  const { isPrenium } = useAuth();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [isPhrasebookOpen, setIsPhrasebookOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] =
    useState<ConversationScenario | null>(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(false);
  const [customMyRole, setCustomMyRole] = useState("");
  const [customAiRole, setCustomAiRole] = useState("");
  const [customScene, setCustomScene] = useState("");
  const [customScenarios, setCustomScenarios] = useState<
    ConversationScenario[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const load = async () => {
        try {
          const saved = await listCustomScenarios();
          if (isActive) setCustomScenarios(saved);
        } catch (err) {
          console.error("Failed to load custom scenarios:", err);
        }
      };

      void load();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleScenarioPress = (scenario: ConversationScenario) => {
    if (scenario.isFree || isPrenium) {
      setSelectedScenario(scenario);
    } else {
      setPaywallVisible(true);
    }
  };

  const handleStartConversation = () => {
    if (selectedScenario) {
      const id = selectedScenario.id;
      setSelectedScenario(null);
      setIsPhrasebookOpen(false);

      if (id.startsWith("custom_")) {
        router.push({
          pathname: "/conversation",
          params: { customScenarioId: id },
        });
        return;
      }

      router.push({
        pathname: "/conversation",
        params: { scenarioId: id },
      });
    }
  };

  const handleCreateCustom = () => {
    if (isPrenium) {
      setIsCreatingCustom(true);
      return;
    }

    setPaywallVisible(true);
  };

  const handleStartCustomConversation = async () => {
    if (!customScene.trim() || isGeneratingScenario) return;

    setIsGeneratingScenario(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "scenario-generate",
        {
          body: {
            myRole: customMyRole,
            aiRole: customAiRole,
            sceneDescription: customScene,
          },
        },
      );

      if (error) {
        console.error("Error calling scenario-generate", error);
        toast.error("Could not generate scenario", {
          description: "Please try again in a moment",
        });
        return;
      }

      const id = createCustomScenarioId();
      const scenario: ConversationScenario = {
        id,
        title: data?.title,
        icon: "color-wand",
        isFree: false,
        description: data?.description,
        goal: data?.goal,
        tasks: data?.tasks,
        difficulty: data?.difficulty,
        phrasebook: data?.phrasebook,
      };

      await saveCustomScenario(scenario);
      setCustomScenarios((prev) => [scenario, ...prev]);

      setIsCreatingCustom(false);
      setIsPhrasebookOpen(false);
      setCustomMyRole("");
      setCustomAiRole("");
      setCustomScene("");
      setSelectedScenario(scenario);
    } catch (err) {
      console.error("Coudln't generate custom scenario:", err);
      toast.error("Could not start Free Talk", {
        description: "Please try again.",
      });
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "left", "right"]}
    >
      <View style={{ flex: 1 }}>
        <View
          style={[styles.header, { borderBottomColor: Colors.borderColor }]}
        >
          <View style={styles.headerTitleGroup}>
            <ThemedText style={styles.headerTitle}>Chủ đề hội thoại</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Luyện nói qua tình huống thực tế
            </ThemedText>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {!isPrenium && (
            <TouchableOpacity
              style={[
                styles.premiumBanner,
                { backgroundColor: Colors.primaryAccentColor },
              ]}
              onPress={() => setPaywallVisible(true)}
            >
              <View style={styles.premiumContent}>
                <Ionicons
                  name="chatbox"
                  size={24}
                  color="#fff"
                  style={{ marginBottom: 8 }}
                />
                <ThemedText style={styles.premiumTitle}>
                  Mở khóa toàn bộ hội thoại
                </ThemedText>
                <ThemedText style={styles.premiumSubtitle}>
                  Mở khóa tình huống riêng và nhiều bài luyện tập hơn
                </ThemedText>
                <View style={styles.premiumButton}>
                  <ThemedText
                    style={[
                      styles.premiumButtonText,
                      { color: Colors.primaryAccentColor },
                    ]}
                  >
                    Dùng thử miễn phí
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.freeTalkCard, { borderColor: Colors.borderColor }]}
            onPress={handleCreateCustom}
          >
            <View style={styles.freeTalkContent}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                Nói chuyện tự do
              </ThemedText>
              <ThemedText
                style={{ color: Colors.subduedTextColor, marginTop: 4 }}
              >
                Mô tả tình huống để tạo bài hội thoại riêng cho bạn.
              </ThemedText>
            </View>
            <View style={styles.crystalBallContainer}>
              <Ionicons name="color-wand" size={32} color="#A855F7" />
            </View>
          </TouchableOpacity>

          {/* Scenarios grid */}
          <View style={styles.gridContainer}>
            {[...customScenarios, ...COURSE_DATA.scenarios].map((scenario) => (
              <TouchableOpacity
                key={scenario.id}
                style={[
                  styles.scenarioCard,
                  { borderColor: Colors.borderColor },
                ]}
                onPress={() => handleScenarioPress(scenario)}
              >
                {scenario.id.startsWith("custom_") && (
                  <View
                    style={[
                      styles.freeBadge,
                      { backgroundColor: Colors.light.text + "22" },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.freeBadgeText,
                        { color: Colors.subduedTextColor },
                      ]}
                    >
                      TỰ TẠO
                    </ThemedText>
                  </View>
                )}
                {scenario.isFree && (
                  <View
                    style={[
                      styles.freeBadge,
                      { backgroundColor: Colors.primaryAccentColor },
                    ]}
                  >
                    <ThemedText style={[styles.freeBadgeText]}>
                      MIỄN PHÍ
                    </ThemedText>
                  </View>
                )}
                {!scenario.isFree && !isPrenium && (
                  <View style={[styles.lockBadge]}>
                    <Ionicons
                      name="lock-closed"
                      size={24}
                      color={Colors.subduedTextColor}
                    />
                  </View>
                )}
                <ThemedText type="defaultSemiBold" style={styles.scenarioTitle}>
                  {vietnameseText(scenario.title)}
                </ThemedText>
                <View style={styles.scenarioIconContainer}>
                  <Ionicons
                    name={scenario.icon}
                    size={40}
                    color={
                      scenario.isFree || isPrenium
                        ? Colors.primaryAccentColor
                        : Colors.subduedTextColor
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Scenario Detail Modal */}
      <Modal
        visible={!!selectedScenario}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setSelectedScenario(null);
          setIsPhrasebookOpen(false);
        }}
      >
        <View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  if (isPhrasebookOpen) {
                    setIsPhrasebookOpen(false);
                    return;
                  }
                  setSelectedScenario(null);
                  setIsPhrasebookOpen(false);
                }}
                style={styles.backButton}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={Colors.light.text}
                />
              </TouchableOpacity>
              <ThemedText type="defaultSemiBold">
                {isPhrasebookOpen ? "Sổ tay câu" : ""}
              </ThemedText>
              <View style={{ width: 40 }}></View>
            </View>
            <ScrollView
              key={isPhrasebookOpen ? "phrasebook" : "scenario"}
              contentContainerStyle={styles.modalContent}
            >
              {isPhrasebookOpen ? (
                (selectedScenario?.phrasebook ?? []).map((p, idx) => (
                  <View
                    key={`${p.hanzi}-${idx}`}
                    style={[
                      styles.phraseRow,
                      {
                        borderColor: Colors.borderColor,
                      },
                    ]}
                  >
                    <ThemedText style={styles.phraseZh}>{p.hanzi}</ThemedText>
                    <ThemedText style={{ color: Colors.subduedTextColor }}>
                      {p.pinyin}
                    </ThemedText>
                    <ThemedText style={{ color: Colors.subduedTextColor }}>
                      {vietnameseText(p.english)}
                    </ThemedText>
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.modalIconContainer}>
                    <Ionicons
                      name={selectedScenario?.icon}
                      size={64}
                      color={Colors.primaryAccentColor}
                    />
                  </View>

                  <ThemedText type={"title"} style={styles.modalTitle}>
                    {vietnameseText(selectedScenario?.title)}
                  </ThemedText>

                  <View style={styles.section}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.sectionHeader}
                    >
                      Tình huống
                    </ThemedText>
                    <ThemedText style={{ color: Colors.subduedTextColor }}>
                      {vietnameseText(selectedScenario?.description)}
                    </ThemedText>
                  </View>

                  <View style={styles.guidelinesCard}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={{ marginBottom: 8 }}
                    >
                      Quy tắc hội thoại tự do
                    </ThemedText>
                    <View style={styles.guidelineItem}>
                      <Ionicons
                        name="warning-outline"
                        size={16}
                        color="#F59E0B"
                      />
                      <ThemedText style={styles.guidelineText}>
                        Không sử dụng hội thoại không phù hợp
                      </ThemedText>
                    </View>
                    <View style={styles.guidelineItem}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color="#F59E0B"
                      />
                      <ThemedText style={styles.guidelineText}>
                        Không dùng để xin tư vấn
                      </ThemedText>
                    </View>
                    <View style={styles.guidelineItem}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={16}
                        color="#F59E0B"
                      />
                      <ThemedText style={styles.guidelineText}>
                        Bắt đầu cuộc hội thoại
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.sectionHeader}
                    >
                      Mục tiêu
                    </ThemedText>
                    <View
                      style={[
                        styles.goalCard,
                        { borderColor: Colors.borderColor },
                      ]}
                    >
                      <ThemedText type="defaultSemiBold">
                        {vietnameseText(selectedScenario?.goal)}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.sectionHeader}
                    >
                      Nhiệm vụ
                    </ThemedText>
                    {selectedScenario?.tasks.map((task, index) => (
                      <View
                        key={index}
                        style={[
                          styles.taskCard,
                          {
                            borderColor: Colors.borderColor,
                          },
                        ]}
                      >
                        <Ionicons
                          size={20}
                          color={Colors.subduedTextColor}
                          name="checkmark-circle-outline"
                        />
                        <ThemedText>{vietnameseText(task)}</ThemedText>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.phrasebookButton,
                      { backgroundColor: Colors.light.text + "10" },
                    ]}
                    onPress={() => {
                      const entries = selectedScenario?.phrasebook ?? [];
                      if (!entries.length) {
                        toast.error("Chưa có sổ tay câu", {
                          description: "Tình huống này chưa có câu mẫu.",
                        });
                        return;
                      }
                      setIsPhrasebookOpen(true);
                    }}
                  >
                    <Ionicons
                      name="book-outline"
                      size={20}
                      color={Colors.primaryAccentColor}
                    />
                    <ThemedText
                      style={{
                        color: Colors.primaryAccentColor,
                        fontWeight: "600",
                      }}
                    >
                      Xem sổ tay câu
                    </ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>

            {!isPhrasebookOpen && (
              <View
                style={[styles.footer, { borderTopColor: Colors.borderColor }]}
              >
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    { backgroundColor: Colors.primaryAccentColor },
                  ]}
                  onPress={handleStartConversation}
                >
                  <ThemedText style={styles.startButtonText}>
                    Bắt đầu
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* Custom Conversation Modal */}
      <Modal
        visible={isCreatingCustom}
        animationType="slide"
        presentationStyle={isGeneratingScenario ? "fullScreen" : "pageSheet"}
        onRequestClose={() => {
          if (isGeneratingScenario) return;
          setIsCreatingCustom(false);
        }}
      >
        <View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1 }}
              keyboardVerticalOffset={0}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    if (isGeneratingScenario) return;
                    setIsCreatingCustom(false);
                  }}
                  disabled={isGeneratingScenario}
                  style={[
                    styles.backButton,
                    isGeneratingScenario && {
                      opacity: 0.4,
                    },
                  ]}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color={Colors.light.text}
                  />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold">Tạo tình huống</ThemedText>
                <View style={{ width: 40 }}></View>
              </View>

              <ScrollView
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                <ThemedText
                  style={{ color: Colors.subduedTextColor, marginBottom: 20 }}
                >
                  Điền vai trò của mỗi người và mô tả chi tiết bối cảnh hội
                  thoại.
                </ThemedText>

                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputContainer,
                      { borderColor: Colors.borderColor },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={Colors.subduedTextColor}
                    />
                    <TextInput
                      style={[styles.input, { color: Colors.light.text }]}
                      placeholder="Vai trò của tôi"
                      placeholderTextColor={Colors.subduedTextColor}
                      value={customMyRole}
                      onChangeText={setCustomMyRole}
                    />
                  </View>
                  <View
                    style={[
                      styles.inputContainer,
                      { borderColor: Colors.borderColor },
                    ]}
                  >
                    <Ionicons
                      name="happy-outline"
                      size={20}
                      color={Colors.subduedTextColor}
                    />
                    <TextInput
                      style={[styles.input, { color: Colors.light.text }]}
                      placeholder="Vai trò của AI"
                      placeholderTextColor={Colors.subduedTextColor}
                      value={customAiRole}
                      onChangeText={setCustomAiRole}
                    />
                  </View>

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        borderColor: Colors.borderColor,
                        height: 120,
                        alignItems: "flex-start",
                        paddingTop: 16,
                      },
                    ]}
                  >
                    <Ionicons
                      name="image-outline"
                      size={20}
                      color={Colors.subduedTextColor}
                      style={{ marginTop: 5 }}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: Colors.light.text,
                          height: "100%",
                          textAlignVertical: "top",
                        },
                      ]}
                      placeholder="Mô tả bối cảnh và chủ đề hội thoại"
                      placeholderTextColor={Colors.subduedTextColor}
                      value={customScene}
                      multiline
                      onChangeText={setCustomScene}
                    />
                  </View>
                </View>
              </ScrollView>

              <View
                style={[styles.footer, { borderTopColor: Colors.borderColor }]}
              >
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    {
                      backgroundColor: Colors.primaryAccentColor,
                      opacity: customScene && !isGeneratingScenario ? 1 : 0.5,
                    },
                  ]}
                  disabled={!customScene || isGeneratingScenario}
                  onPress={handleStartCustomConversation}
                >
                  <ThemedText style={styles.startButtonText}>
                    {isGeneratingScenario
                      ? "Đang tạo..."
                      : "Bắt đầu trò chuyện"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>

      <Paywall
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </SafeAreaView>
); 
}

const styles = StyleSheet.create({
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
    color: "#E05305", 
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 115,
    paddingTop: 20,
    backgroundColor: "#FAF8F5", 
  },
  premiumBanner: {
    backgroundColor: Colors.primaryAccentColor || "#FF5500",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.orangeDark || "#C84000",
    borderBottomWidth: 4,
    borderBottomColor: Colors.orangeDark || "#C84000",
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.orangeDark || "#C84000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumContent: {
    alignItems: "center",
  },
  premiumTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  premiumSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  premiumButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderBottomWidth: 3,
    borderBottomColor: "#D8D8D8",
  },
  premiumButtonText: {
    color: "#2563EB",
    fontWeight: "bold",
  },
  freeTalkCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 5,
    borderBottomColor: "#C84000", // Đáy viền cam đậm nổi khối 3D
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
  },
  freeTalkContent: {
    flex: 1,
    paddingRight: 16,
  },
  crystalBallContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  scenarioCard: {
    width: "47%",
    maxWidth: 200,
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 5,
    borderBottomColor: "#C84000", 
    backgroundColor: "#FFFFFF",
    padding: 16,
    justifyContent: "space-between",
  },
  freeBadge: {
    backgroundColor: "#FF5500",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  freeBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  lockBadge: {
    alignSelf: "flex-start",
    padding: 4,
  },
  scenarioTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2B2B2B",
  },
  scenarioIconContainer: {
    alignSelf: "flex-end",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FAF8F5",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  modalContent: {
    padding: 24,
    backgroundColor: "#FAF8F5",
  },
  modalIconContainer: {
    alignSelf: "center",
    marginBottom: 24,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 32,
    color: "#2B2B2B",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 8,
    fontSize: 18,
    color: "#2B2B2B",
  },
  guidelinesCard: {
    backgroundColor: "#FFFBEB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  guidelineItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  guidelineText: {
    fontSize: 13,
    color: "#92400E",
    flex: 1,
  },
  goalCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 4,
    borderBottomColor: "#C84000",
    backgroundColor: "#FFFFFF",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 4,
    borderBottomColor: "#C84000",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  phrasebookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#EAE5DF",
    borderBottomWidth: 4,
    borderBottomColor: "#C84000",
    backgroundColor: "#FFFFFF",
    marginBottom: 40,
  },
  phraseRow: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAE5DF",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  phraseZh: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2B2B2B",
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#EAE5DF",
    backgroundColor: "#FAF8F5",
  },
  startButton: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FF5500",
    borderBottomWidth: 4,
    borderBottomColor: "#C84000",
    alignItems: "center",
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputGroup: {
    gap: 12,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAE5DF",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2B2B2B",
  },
});
