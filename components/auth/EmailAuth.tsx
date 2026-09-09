import { supabase } from "@/utils/supabase";
import Entypo from "@expo/vector-icons/Entypo";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { toast } from "sonner-native";

export default function EmailAuth({
  onBack,
  menuContentAnimatedStyle,
}: {
  onBack: () => void;
  menuContentAnimatedStyle: any;
}) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(""); // Lưu mã OTP 6 số người dùng nhập
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false); // Trạng thái đã gửi mã hay chưa

  // Hàm 1: Gửi mã OTP về email
  const signInWithEmail = async () => {
    if (!email) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Hãy kiểm tra email để lấy mã 6 số!");
        setIsOtpSent(true); // Chuyển sang giao diện nhập OTP
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi mạng";
      toast.error(
        message.toLowerCase().includes("unknownhost") ||
          message.toLowerCase().includes("fetch failed")
          ? "Không thể kết nối máy chủ. Hãy kiểm tra mạng và URL dự án."
          : "Đã xảy ra lỗi. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm 2: Xác thực mã OTP người dùng nhập vào
  const verifyOtpCode = async () => {
    if (!token || token.length < 6) {
      toast.error("Vui lòng nhập mã xác thực 6 số hợp lệ");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token,
        type: "email",
      });

      if (error) {
        toast.error(error.message);
      } else if (data.session) {
        toast.success("Xác thực thành công!");
        // Khi verifyOtp thành công, Supabase tự động cập nhật session.
        // File _layout.tsx của bạn sẽ tự nhận biết để chuyển hướng sang /onboarding hoặc /(tabs).
      }
    } catch {
      toast.error("Xác thực thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.viewContainer, menuContentAnimatedStyle]}>
      <View style={styles.emailHeader}>
        <Pressable onPress={isOtpSent ? () => setIsOtpSent(false) : onBack}>
          <Entypo name="chevron-thin-left" size={18} color="white" />
        </Pressable>
      </View>

      {/* Hiển thị giao diện tùy thuộc vào việc mã OTP đã gửi hay chưa */}
      {!isOtpSent ? (
        // Giao diện nhập EMAIL ban đầu
        <View>
          <View style={styles.titleContainer}>
            <Text style={styles.emailMainTitle}>
              Nhập địa chỉ email của bạn
            </Text>
            <Text style={styles.emailSubtitle}>
              Chúng tôi sẽ gửi mã 6 số để bạn đăng nhập.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.emailTextInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Pressable
              style={[
                styles.verificationButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={signInWithEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.verificationButtonText}>Gửi mã</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        // Giao diện nhập MÃ SỐ OTP 6 SỐ
        <View>
          <View style={styles.titleContainer}>
            <Text style={styles.emailMainTitle}>Nhập mã xác thực</Text>
            <Text style={styles.emailSubtitle}>
              Mã 6 số đã được gửi đến {email}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.emailTextInput}
              value={token}
              onChangeText={setToken}
              placeholder="Mã OTP 6 số"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              keyboardType="number-pad" // Hiện bàn phím số
              maxLength={6} // Giới hạn chỉ nhập 6 số
              autoFocus={true}
            />

            <Pressable
              style={[
                styles.verificationButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={verifyOtpCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.verificationButtonText}>
                  Xác thực và đăng nhập
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  viewContainer: { flex: 1 },
  emailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  titleContainer: { marginBottom: 20 },
  emailMainTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    lineHeight: 34,
  },
  emailSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
  },
  formContainer: { gap: 20 },
  emailTextInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "white",
    minHeight: 52,
  },
  verificationButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: 10,
  },
  verificationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  buttonDisabled: { opacity: 0.6 },
});
