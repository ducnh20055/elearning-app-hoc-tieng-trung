import { HapticTab } from "@/components/haptic-tab";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import SystemNavigationBar from "react-native-system-navigation-bar";

// Bảng màu chuẩn Duolingo Tông Cam
const DUO_ORANGE = {
  primary: "#FF5500", // Cam chính
  activeBg: "#FFF0E6", // Nền highlight cam nhạt khi chọn tab
  activeBorder: "#FF5500", // Viền bao quanh icon khi chọn tab
  inactive: "#AFAFAF", // Màu icon chưa chọn
  tabBarBg: "#FFFFFF", // Nền thanh Tab Bar
  borderTop: "#E5E5E5", // Đường kẻ ngang phía trên thanh Tab
};

export default function TabLayout() {
  useEffect(() => {
    if (Platform.OS === "android" && SystemNavigationBar) {
      SystemNavigationBar.stickyImmersive().catch(() => {});
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DUO_ORANGE.primary,
        tabBarInactiveTintColor: DUO_ORANGE.inactive,
        headerShown: false,
        tabBarButton: HapticTab as any,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="lessons"
        options={{
          title: "Bài học",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <View
                style={[
                  styles.iconBackground,
                  focused && styles.iconBackgroundActive,
                ]}
              >
                <Ionicons
                  size={22}
                  name={focused ? "school" : "school-outline"}
                  color={focused ? DUO_ORANGE.primary : color}
                />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="conversations"
        options={{
          title: "Hội thoại",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <View
                style={[
                  styles.iconBackground,
                  focused && styles.iconBackgroundActive,
                ]}
              >
                <Ionicons
                  size={22}
                  name={focused ? "chatbubble" : "chatbubble-outline"}
                  color={focused ? DUO_ORANGE.primary : color}
                />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <View
                style={[
                  styles.iconBackground,
                  focused && styles.iconBackgroundActive,
                ]}
              >
                <Ionicons
                  size={22}
                  name={focused ? "person" : "person-outline"}
                  color={focused ? DUO_ORANGE.primary : color}
                />
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 88 : 68,
    paddingBottom: Platform.OS === "ios" ? 28 : 8,
    paddingTop: 6,

    // Nền trắng phẳng chuẩn Flat Design của Duolingo
    backgroundColor: DUO_ORANGE.tabBarBg,
    borderTopWidth: 2,
    borderTopColor: DUO_ORANGE.borderTop,

    // Bỏ đổ bóng mờ glassmorphism
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontWeight: "800",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconBackground: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  // Nền highlight cam + viền cam khi tab được kích hoạt
  iconBackgroundActive: {
    backgroundColor: DUO_ORANGE.activeBg,
    borderColor: DUO_ORANGE.activeBorder,
  },
});
