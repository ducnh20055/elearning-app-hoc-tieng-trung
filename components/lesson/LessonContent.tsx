import { Question, SpeakingOption } from "@/constants/CourseData";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/ctx/AuthContext";
import {
  recordLearningEvent,
  recordPronunciationAttempt,
  updateReviewItem,
} from "@/lib/learningActivity";
import { incrementLessonCompletion } from "@/lib/lessonProgress";
import {
  recordQuestionAnswered,
  recordQuestionListened,
} from "@/lib/speakingListeningStats";
import { supabase } from "@/utils/supabase";
import { FunctionsHttpError } from "@supabase/supabase-js";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";
import { toast } from "sonner-native";
import { compareTwoStrings } from "string-similarity";
import ConfirmDialog from "../ui/ConfirmDialog";
import { ThemedText } from "../ui/themed-text";
import AudioPrompt from "./AudioPrompt";
import { FeedbackView } from "./FeedbackView";
import LessonCompleteScreen from "./LessonCompleteScreen";
import ListeningMultipleChoiceMode from "./ListeningMultipleChoiceMode";
import MultipleChoiceMode from "./MultipleChoiceMode";
import ProgressHeader from "./ProgressHeader";
import SentenceBreakdownCard from "./SentenceBreakdownCard";
import SingleResponseMode from "./SingleResponseMode";

interface WrongQuestion {
  english: string;
  mandarin: {
    hanzi: string;
    pinyin: string;
  };
  attempts: number;
}

export interface LessonStats {
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  wrongQuestions?: WrongQuestion[];
}

const MAX_ATTEMPTS = 3;

export default function LessonContent({
  questions,
  lessonId,
}: {
  questions: Question[];
  lessonId: string;
}) {
  const { user } = useAuth();
  const [activeQuestions, setActiveQuestions] = useState(questions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
  const [showMandarin, setShowMandarin] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [hasListenedToAudio, setHasListenedToAudio] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [transcription, setTranscription] = useState<{
    expected: string;
    said: string;
  } | null>(null);
  const currentQuestion = useMemo(
    () => activeQuestions[currentQuestionIndex],
    [activeQuestions, currentQuestionIndex],
  );
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);

  // Lesson completion
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);
  const [lessonStats, setLessonStats] = useState<LessonStats | null>(null);
  const [questionAttempts, setQuestionAttempts] = useState<
    Record<number, number>
  >({});
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Set<number>>(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity pinyin/hanzi
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const optionsAnimValue = useRef(new Animated.Value(0)).current;
  const audioSectionAnimHeight = useRef(new Animated.Value(400)).current;
  const optionSelectionAnim = useRef(new Animated.Value(0)).current;
  const instructionOpacity = useRef(new Animated.Value(1)).current;
  const listeningOpacity = useRef(new Animated.Value(0)).current;
  const listeningScale = useRef(new Animated.Value(0.95)).current;
  const [hasStartedFirstPlay, setHasStartedFirstPlay] = useState(false);

  const progress = ((currentQuestionIndex + 1) / activeQuestions.length) * 100;

  const recordQuestionOutcome = (isQuestionCorrect: boolean) => {
    if (!user) return;
    void recordLearningEvent(user.id, {
      type: "question_answered",
      lessonId,
      questionId: currentQuestion.id,
      isCorrect: isQuestionCorrect,
    });
    void updateReviewItem({
      userId: user.id,
      lessonId,
      questionId: currentQuestion.id,
      isCorrect: isQuestionCorrect,
    });
  };

  const selectedSentence = useMemo((): SpeakingOption | null => {
    if (currentQuestion.type === "listening_mc") {
      if (showResult) {
        const correctEnglish =
          currentQuestion.options.find(
            (opt) => opt.id === currentQuestion.correctOptionId,
          )?.english || "";
        return {
          id: currentQuestion.id,
          english: correctEnglish,
          mandarin: {
            ...currentQuestion.mandarin,
          },
        };
      }
      return null;
    }

    if (!selectedOption) return null;
    return currentQuestion.options.find((opt) => opt.id === selectedOption)!;
  }, [selectedOption, currentQuestion, showResult]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    Speech.stop();
    setIsSpeechPlaying(false);
  }, [currentQuestion]);

  useEffect(() => {
    if (showResult) {
      if (isCorrect) {
        if (
          attemptCount === 0 ||
          (attemptCount > 0 && wrongQuestions.has(currentQuestion.id))
        ) {
          setCorrectAnswersCount((prev) => prev + 1);
        }
      } else {
        setQuestionAttempts((prev) => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
        }));

        if (attemptCount === 0) {
          setWrongQuestions((prev) => new Set(prev).add(currentQuestion.id));
        }
      }
    }
  }, [showResult, isCorrect, attemptCount, currentQuestion.id]);

  useEffect(() => {
    if (isSpeechPlaying && !hasStartedFirstPlay && !hasListenedToAudio) {
      setHasStartedFirstPlay(true);
      Animated.parallel([
        Animated.timing(instructionOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(listeningOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(listeningScale, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(listeningScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isSpeechPlaying, hasStartedFirstPlay, hasListenedToAudio]);

  useEffect(() => {
    if (
      currentQuestion.type === "single_response" &&
      currentQuestion.options.length > 0 &&
      hasListenedToAudio
    ) {
      setSelectedOption(currentQuestion.options[0].id);
      Animated.timing(optionSelectionAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentQuestion, hasListenedToAudio]);

  const finishListening = () => {
    if (hasListenedToAudio) return;
    setHasListenedToAudio(true);
    setIsSpeechPlaying(false);
    if (user) {
      void recordQuestionListened(user.id);
      void recordLearningEvent(user.id, {
        type: "question_listened",
        lessonId,
        questionId: currentQuestion.id,
      });
    }
    Animated.parallel([
      Animated.timing(audioSectionAnimHeight, {
        toValue: 200,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(optionsAnimValue, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const playAudio = async () => {
    const textToSpeak =
      currentQuestion.mandarin.hanzi || currentQuestion.mandarin.pinyin;

    if (isSpeechPlaying) {
      Speech.stop();
      setIsSpeechPlaying(false);
      return;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
      });

      const voices = await Speech.getAvailableVoicesAsync();
      const mandarinVoice = voices.find((voice) =>
        voice.language.toLowerCase().startsWith("zh"),
      );
      if (!mandarinVoice) {
        toast.error("Chinese voice unavailable", {
          description: "Install a Chinese text-to-speech voice on Android.",
        });
        return;
      }

      setIsSpeechPlaying(true);
      Speech.speak(textToSpeak, {
        language: "zh-CN",
        voice: mandarinVoice.identifier,
        onDone: () => {
          setIsSpeechPlaying(false);
          finishListening();
        },
        onStopped: () => {
          setIsSpeechPlaying(false);
        },
        onError: (error) => {
          setIsSpeechPlaying(false);
          toast.error("Audio Playback Error", {
            description: error.message || "Text-to-speech is unavailable.",
          });
        },
      });
    } catch (error) {
      setIsSpeechPlaying(false);
      console.error("Failed to configure audio playback:", error);
      toast.error("Audio Playback Error", {
        description: "Could not play the Mandarin audio.",
      });
    }
  };

  const startRecording = async () => {
    if (isSpeechPlaying) {
      Speech.stop();
      setIsSpeechPlaying(false);
    }

    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        toast.error("Microphone Permission", {
          description: "Microphone access is required to practise speaking.",
        });
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
        shouldPlayInBackground: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecognizing(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setIsRecognizing(false);
      toast.error("Recording Error", {
        description: "Could not start recording.",
      });
    }
  };

  const processSpeechResult = (transcript: string) => {
    setIsLoading(false);
    setShowResult(true);

    const punctuationRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()?]/g;

    // 1. Chuẩn hóa đáp án đúng (Expected)
    const rawExpected = selectedSentence?.mandarin.pinyin || "";
    const expected = rawExpected
      .toLowerCase()
      .replace(punctuationRegex, "")
      .replace(/\s+/g, "")
      .trim();

    // 2. Tách transcript thành các dòng riêng biệt (phòng trường hợp AI trả về nhiều dòng/lặp từ)
    const lines = transcript
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let maxSimilarity = 0;
    let bestSaidRaw = transcript; // Dùng để lưu lại dòng có kết quả tốt nhất để hiển thị

    // 3. Duyệt qua từng dòng để tìm ra câu nói khớp nhất với đáp án
    lines.forEach((line) => {
      const cleanedLine = line
        .toLowerCase()
        .replace(punctuationRegex, "")
        .replace(/\s+/g, "")
        .trim();

      if (cleanedLine) {
        const similarity = compareTwoStrings(expected, cleanedLine);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestSaidRaw = line; // Cập nhật lại dòng text gốc chuẩn nhất
        }
      }
    });

    // 4. Lưu vào State để hiển thị lên giao diện (Chỉ hiển thị dòng tốt nhất cho gọn app)
    setTranscription({ expected: rawExpected, said: bestSaidRaw });

    // 5. Kiểm tra kết quả
    if (!expected || lines.length === 0) {
      setIsCorrect(false);
    } else {
      // Nếu độ tương đồng tốt nhất >= 80% thì tính là ĐÚNG
      const isSimilarEnough = maxSimilarity >= 0.8;
      setIsCorrect(isSimilarEnough);
      recordQuestionOutcome(isSimilarEnough);

      if (user) {
        void recordPronunciationAttempt({
          userId: user.id,
          lessonId,
          questionId: currentQuestion.id,
          expectedText: selectedSentence?.english ?? "",
          expectedPinyin: rawExpected,
          transcript: bestSaidRaw,
          similarityScore: maxSimilarity,
          isCorrect: isSimilarEnough,
        });
      }

      if (isSimilarEnough && user) void recordQuestionAnswered(user.id);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const stopRecording = async () => {
    setIsLoading(true);
    setIsRecognizing(false);

    try {
      if (!isRecognizing) {
        setIsLoading(false);
        return;
      }

      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
      });

      if (!uri) {
        setIsLoading(false);
        toast.error("Recording Error", {
          description: "No audio was recorded.",
        });
        return;
      }

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 1. Gọi Edge Function gửi file âm thanh lên server
      const { data, error } = await supabase.functions.invoke(
        "transcribe-audio",
        {
          body: {
            inputAudio: {
              data: base64Audio,
              format: "audio/mp4",
            },
          },
        },
      );

      // 2. Bắt và bóc tách lỗi chi tiết từ Server phản hồi về
      if (error) {
        if (error instanceof FunctionsHttpError) {
          // Trích xuất phản hồi JSON chi tiết chứa { error: message } từ server trả về
          const errorData = await error.context.json();
          throw new Error(errorData.error || "Server processing error");
        } else {
          // Lỗi mạng hoặc lỗi kết nối hệ thống chung
          throw error;
        }
      }

      // 3. Xử lý kết quả trả về khi thành công
      const transcript =
        typeof data?.transcript === "string" ? data.transcript.trim() : "";
      if (!transcript) {
        console.error("Transcription function returned no transcript:", data);
        throw new Error(
          "No transcript returned. Check that the recording contains speech and that Gemini accepted the audio format.",
        );
      }
      processSpeechResult(transcript);
    } catch (err) {
      // Toàn bộ các lỗi ném ra ở khối trên (kể cả lỗi OpenRouter bóc tách được) đều tập trung tại đây
      const errorMessage =
        err instanceof Error ? err.message : "Could not transcribe audio.";

      console.error("Failed to start/stop recording:", err);
      setIsLoading(false);

      // Hiển thị thông báo lỗi chi tiết thực tế lên màn hình ứng dụng để bạn dễ quan sát
      toast.error("Transcription Error", {
        description: errorMessage,
      });
    }
  };

  const handleRevealMandarin = () => {
    if (showMandarin) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setShowMandarin(false));
    } else {
      setShowMandarin(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleOptionPress = (id: number) => {
    if (currentQuestion.type === "listening_mc") {
      setSelectedOption(id);
      const isQuestionCorrect = id === currentQuestion.correctOptionId;
      setIsCorrect(isQuestionCorrect);
      recordQuestionOutcome(isQuestionCorrect);
      setShowResult(true);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    const isDeselecting = selectedOption === id;
    const newSelectedOption = isDeselecting ? null : id;
    setSelectedOption(newSelectedOption);
    Animated.timing(optionSelectionAnim, {
      toValue: isDeselecting ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const nextQuestion = () => {
    Animated.timing(audioSectionAnimHeight, {
      toValue: 400,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      if (currentQuestionIndex < activeQuestions.length - 1) {
        resetState();
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        const accuracy = Math.round(
          (correctAnswersCount / activeQuestions.length) * 100,
        );

        const wrongQuestionsList = activeQuestions
          .filter((q) => wrongQuestions.has(q.id))
          .map((q) => {
            let english = "";
            let hanzi = "";
            let pinyin = "";

            if (q.type === "listening_mc") {
              english =
                q.options.find((opt) => opt.id === q.correctOptionId)
                  ?.english || "";
              hanzi = q.mandarin.hanzi;
              pinyin = q.mandarin.pinyin;
            } else {
              const option = q.options[0];
              english = option.english;
              hanzi = option.mandarin.hanzi;
              pinyin = option.mandarin.pinyin;
            }

            return {
              english,
              mandarin: {
                hanzi,
                pinyin,
              },
              attempts: questionAttempts[q.id] || 1,
            };
          });

        const finalStats: LessonStats = {
          correctAnswers: correctAnswersCount,
          totalQuestions: activeQuestions.length,
          accuracy,
          wrongQuestions:
            wrongQuestionsList.length > 0 ? wrongQuestionsList : undefined,
        };

        setLessonStats(finalStats);
        setShowCompleteScreen(true);
      }
    });
  };

  const handleRetry = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowResult(false);
      setIsCorrect(null);
      setAttemptCount((prev) => prev + 1);

      if (currentQuestion.type === "listening_mc") {
        setSelectedOption(null);
      } else {
        setIsLoading(false);
        setHasListenedToAudio(true);

        if (currentQuestion.type === "multiple_choice") {
          optionSelectionAnim.setValue(0);
          setSelectedOption(null);
        } else {
          optionSelectionAnim.setValue(1);
        }

        audioSectionAnimHeight.setValue(200);
        optionsAnimValue.setValue(1);
        instructionOpacity.setValue(0);
        listeningOpacity.setValue(0);
      }

      scaleAnim.setValue(1);
    });
  };

  const resetState = () => {
    setShowMandarin(false);
    setSelectedOption(null);
    setShowResult(false);
    setHasListenedToAudio(false);
    setAttemptCount(0);
    setIsLoading(false);
    setTranscription(null);
    Speech.stop();
    setIsSpeechPlaying(false);
    fadeAnim.setValue(0);
    scaleAnim.setValue(1);
    optionsAnimValue.setValue(0);
    optionSelectionAnim.setValue(0);
    instructionOpacity.setValue(1);
    listeningOpacity.setValue(0);
    listeningScale.setValue(0.95);
    setHasStartedFirstPlay(false);
  };

  if (showCompleteScreen && lessonStats) {
    return (
      <LessonCompleteScreen
        lessonStats={lessonStats}
        onContinue={async () => {
          if (user) {
            await incrementLessonCompletion(user.id, lessonId);
            await recordLearningEvent(user.id, {
              type: "lesson_completed",
              lessonId,
            });
          }
          router.push("/lessons");
        }}
        onReview={() => {
          const questionsToReview = questions.filter((question) =>
            wrongQuestions.has(question.id),
          );
          setActiveQuestions(questionsToReview);
          setShowCompleteScreen(false);
          setLessonStats(null);
          setCurrentQuestionIndex(0);
          setQuestionAttempts({});
          setCorrectAnswersCount(0);
          setWrongQuestions(new Set());
          resetState();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ConfirmDialog
        visible={exitConfirmVisible}
        title="Thoát luyện tập"
        description="Bạn có chắc chắn muốn thoát không? Tiến trình của bạn sẽ bị mất."
        cancelLabel="Hủy"
        confirmLabel="Thoát"
        destructive
        onConfirm={async () => {
          setExitConfirmVisible(false);
          Speech.stop();
          if (audioRecorder.isRecording) {
            await audioRecorder.stop();
          }
          router.push("/lessons");
        }}
        onCancel={() => setExitConfirmVisible(false)}
      />
      <ProgressHeader
        progress={progress}
        currentCount={currentQuestionIndex + 1}
        totalCount={activeQuestions.length}
        onClose={() => setExitConfirmVisible(true)}
      />

      {/* Main content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.audioSection,
            {
              backgroundColor: "#f9fafb",
              minHeight: audioSectionAnimHeight,
              flex: hasListenedToAudio ? 0 : 1,
              justifyContent: "center",
              opacity: isLoading || showResult ? 0.6 : 1,
            },
          ]}
          pointerEvents={isLoading || showResult ? "none" : "auto"}
        >
          <AudioPrompt
            isPlaying={isSpeechPlaying}
            isRecognizing={isRecognizing}
            hasListenedToAudio={hasListenedToAudio}
            onPlay={playAudio}
            onStartRecord={startRecording}
            onStopRecord={stopRecording}
            onRevealMandarin={handleRevealMandarin}
            currentQuestion={currentQuestion}
            showMandarin={showMandarin}
            selectedOption={selectedOption}
            scaleAnim={scaleAnim}
            instructionOpacity={instructionOpacity}
            listeningOpacity={listeningOpacity}
            listeningScale={listeningScale}
            fadeAnim={fadeAnim}
          />
        </Animated.View>

        {hasListenedToAudio && (
          <Animated.View
            style={[
              styles.optionsSection,
              {
                opacity: Animated.multiply(
                  optionsAnimValue,
                  isLoading || showResult ? 0.5 : 1,
                ),
                transform: [
                  {
                    translateY: optionsAnimValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents={isLoading || showResult ? "none" : "auto"}
          >
            {currentQuestion.type === "multiple_choice" && (
              <MultipleChoiceMode
                options={currentQuestion.options}
                selectedOption={selectedOption}
                handleOptionPress={handleOptionPress}
                optionsSelectionAnim={optionSelectionAnim}
                isLoading={isLoading}
                showResult={showResult}
              />
            )}
            {currentQuestion.type === "listening_mc" && (
              <ListeningMultipleChoiceMode
                options={currentQuestion.options}
                selectedOption={selectedOption}
                handleOptionPress={handleOptionPress}
                isLoading={isLoading}
                showResult={showResult}
              />
            )}
            {currentQuestion.type === "single_response" && (
              <SingleResponseMode
                option={currentQuestion.options[0]}
                optionSelectionAnim={optionSelectionAnim}
              />
            )}
          </Animated.View>
        )}

        {isLoading && (
          <View style={styles.bottomSection}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={Colors.primaryAccentColor}
              />
              <ThemedText
                style={[styles.loadingText, { color: Colors.subduedTextColor }]}
              >
                Analyzing your pronunciation...
              </ThemedText>
            </View>
          </View>
        )}

        {/* Feedback view */}
        {showResult && selectedSentence && (
          <Animated.View
            style={[
              styles.feedbackWrapper,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <FeedbackView
              correctOption={selectedSentence}
              isCorrect={isCorrect}
              onContinue={nextQuestion}
              onRetry={
                attemptCount < MAX_ATTEMPTS && !isCorrect
                  ? handleRetry
                  : undefined
              }
              attemptCount={isCorrect ? attemptCount : attemptCount + 1}
              maxAttempts={MAX_ATTEMPTS}
              transcription={
                transcription
                  ? {
                      expected: transcription.expected,
                      said: transcription.said,
                    }
                  : undefined
              }
            />
          </Animated.View>
        )}
      </View>

      {/* Sentence Breakdown Card */}
      {currentQuestion.type === "listening_mc" &&
        !isLoading &&
        hasListenedToAudio && (
          <SentenceBreakdownCard
            sentence={{
              english:
                currentQuestion.options.find(
                  (opt) => opt.id === currentQuestion.correctOptionId,
                )?.english || "",
              pinyin: currentQuestion.mandarin.pinyin,
              hanzi: currentQuestion.mandarin.hanzi,
              words: currentQuestion.mandarin.words,
              breakdown: currentQuestion.mandarin.breakdown,
            }}
            disabled={showResult}
          />
        )}
      {currentQuestion.type !== "listening_mc" &&
        !isLoading &&
        selectedSentence && (
          <SentenceBreakdownCard
            sentence={{
              english: selectedSentence.english,
              pinyin: selectedSentence.mandarin.pinyin,
              hanzi: selectedSentence.mandarin.hanzi,
              words: selectedSentence.mandarin.words,
              breakdown: selectedSentence.mandarin.breakdown,
            }}
            disabled={showResult}
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  audioSection: {
    alignItems: "center",
    marginBottom: 40,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  optionsSection: {
    flex: 1,
    marginBottom: 30,
  },
  bottomSection: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  feedbackWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1000,
  },
});
