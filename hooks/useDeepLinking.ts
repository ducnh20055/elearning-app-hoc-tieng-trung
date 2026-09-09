import { supabase } from "@/utils/supabase";
import { useEffect } from "react";
import * as Linking from "expo-linking";
import { toast } from "sonner-native";

const createSessionFromUrl = async (url: string) => {
  if (!url) return;

  console.log("Đang xử lý URL nhận được:", url);

  // Mẹo dùng Regex bóc tách chuẩn xác cặp token nằm sau dấu # hoặc dấu ? của Supabase
  const matches = url.match(/[#&?](access_token|refresh_token)=([^&]+)/g);
  
  if (!matches) {
    console.log("URL không chứa token xác thực của Supabase");
    return;
  }

  const params: Record<string, string> = {};
  matches.forEach((match) => {
    // Loại bỏ ký tự đầu tiên (#, &, ?) rồi cắt đôi lấy key và value
    const [key, value] = match.substring(1).split("=");
    params[key] = value;
  });

  const { access_token, refresh_token } = params;

  if (!access_token || !refresh_token) {
    console.log("Không tìm thấy đủ cặp access_token hoặc refresh_token");
    return;
  }

  // Nạp thủ công cặp token này vào hệ thống quản lý của Supabase
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    console.error("Lỗi đồng bộ Session từ Supabase:", error.message);
    throw error;
  }

  return data.session;
};

export const useDeepLinking = () => {
  useEffect(() => {
    // 1. Xử lý trường hợp App đang chạy ngầm, người dùng bấm link từ ứng dụng khác đập vào
    const handleDeepLinkEvent = async (event: { url: string }) => {
      try {
        const session = await createSessionFromUrl(event.url);
        if (session) {
          toast.success("Signed in successfully!");
        }
      } catch (error) {
        console.error("Error inside deep link listener:", error);
        toast.error("Failed to sign in. Please try again.");
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLinkEvent);

    // 2. Xử lý trường hợp App bị tắt hoàn toàn (Cold start), người dùng bấm link để kích hoạt mở App lên
    Linking.getInitialURL().then(async (url) => {
      if (url) {
        try {
          await createSessionFromUrl(url);
        } catch (error) {
          console.error("Error inside initial URL loader:", error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
};
