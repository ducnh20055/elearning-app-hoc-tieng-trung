import { Colors } from "@/constants/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  KeyboardState,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verticalScale } from "react-native-size-matters";
import {
  EBGaramond_500Medium_Italic,
  useFonts,
} from "@expo-google-fonts/eb-garamond";
import {BlurView} from "expo-blur"
import EmailAuth from "./EmailAuth";

const {width, height} = Dimensions.get("window")
const videoSource = require("../../assets/videos/intro.mp4")
const logoSource = require("../../assets/images/convo-minimal.png")
const MENU_HEIGHT = 350
const PEEK_MENU_HEIGHT = 70
const CLOSED_POSITION = MENU_HEIGHT - PEEK_MENU_HEIGHT 


export default function IntroScreen(){
  const insets = useSafeAreaInsets()
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const mainTextOpacity = useSharedValue(0)
  const scriptTextOpacity = useSharedValue(0)
  const menuContentOpacity = useSharedValue(1)
  const menuTranslateY = useSharedValue(CLOSED_POSITION)
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<"login" | "email">("login")

  const [fontsloaded] = useFonts({
       EBGaramond_500Medium_Italic,
    })

  
  const mainTextWords: string[] = ["Học", "tiếng", "Trung", "đúng", "cách"];
  const scriptPhrases: string[] = [
    "Luyện nói",
    "Luyện nghe",
    "Thực hành",
    "Giao tiếp",
  ];

  const player = useVideoPlayer(videoSource, (player) =>{
    player.loop = true
    player.muted = true
    player.play()
  })


   const mainTextAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      mainTextOpacity.value,
      [0, 1],
      [30, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity: mainTextOpacity.value,
      transform: [{ translateY }],
    };
  });


  const menuAnimatedStyle = useAnimatedStyle(() => {
   return {
    transform: [{translateY: menuTranslateY.value}]
   }
  })

  
  const menuContentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: menuContentOpacity.value,
    };
  });
 
  const panGesture = Gesture.Pan().onEnd((event) => {
    "worklet";
    const swipeThreshold = 50;
    const isUpSwipe = event.translationY < -swipeThreshold;
    const isDownSwipe = event.translationY > swipeThreshold;

    if(isUpSwipe){
      menuTranslateY.value = withSpring(0, {
        damping: 30,
        stiffness: 200,
        mass: 1
      })
    }else if(isDownSwipe){
      menuTranslateY.value = withSpring(CLOSED_POSITION, {
        damping: 30,
        stiffness: 200,
        mass: 1
      })
    }
  })

  const scriptTextAnimatedStyle = useAnimatedStyle(() => {
    const translateY =  interpolate(
      scriptTextOpacity.value,
      [0, 1],
      [20,0],
      Extrapolation.CLAMP
    )

    return{
      opacity: scriptTextOpacity.value,
      transform: [{translateY}],
    }
  })

  const animatedTextIn = () => {
    mainTextOpacity.value = withTiming(1, {duration: 1200})
    scriptTextOpacity.value = withDelay(800, withTiming(1, {duration: 1200}))
  }

   const animateScriptOut = () => {
    scriptTextOpacity.value = withTiming(1,{duration: 500})
  }

  const animateScriptIn = () => {
    scriptTextOpacity.value = withTiming(1,{duration: 600})
  }
  
  const animateMenu = (open: Boolean) => {
    menuTranslateY.value = withSpring(open ? 0 : CLOSED_POSITION, {
      damping: 30,
      stiffness: 200,
      mass: 1 
    })
  }

   const animateToEmailView = (to: "email" | "login") => {
    menuContentOpacity.value = withTiming(0, { duration: 200 });

    setTimeout(() => {
      setCurrentView(to);
      menuContentOpacity.value = withTiming(1, { duration: 300 });
    }, 200);
  };

    const animateToLoginView = (to: "email" | "login") => {
    menuContentOpacity.value = withTiming(0, { duration: 200 });

    setTimeout(() => {
      setCurrentView(to);
      menuContentOpacity.value = withTiming(1, { duration: 300 });
    }, 200);
  };

  const handlePress = () => {
    const newState = !isMenuOpen
    setIsMenuOpen(newState)
    animateMenu(newState)
  }

  useEffect(() => {
    player.play()

    const timeout = setTimeout(() =>{
        animatedTextIn()
      },300)
 
  const cycleInterval = setInterval(() => {
      animateScriptOut();
      setTimeout(() => {
        setCurrentPhaseIndex((prev) => {
          const nextIndex = (prev + 1) % scriptPhrases.length;

          if(nextIndex === 0){
            setTimeout(() => animateScriptIn(), 150)
          }

          return nextIndex;
        });
      }, 500);
    }, 3500);

    return () => {
      clearTimeout(timeout);
      clearInterval(cycleInterval);
    };
  }, []);

  useEffect(()=> {
    if(currentPhaseIndex > 0) {
      const timeout = setTimeout (() =>{
        animateScriptIn()
      },150)

       return () => {
      clearTimeout(timeout);
    };
    }

   
  },[currentPhaseIndex])

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      },
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event) => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);



  if(!fontsloaded){
    return null
  }
  
  const renderLoginView = () =>(
    <Animated.View style={[styles.viewContainer, menuContentAnimatedStyle]}>
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Image source={logoSource} style={styles.logo} />
          <Text style={styles.appName}>ELearning</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.rating}>Bắt đầu ngay</Text>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <Pressable
          style={styles.loginButton}
          onPress={() => console.log("Apple login")}
        >
          <AntDesign
            name="apple"
            size={16}
            color="white"
            style={styles.appleIcon}
          />
          <Text style={styles.buttonText}>Tiếp tục với Apple</Text>
        </Pressable>
        <Pressable
          style={styles.loginButton}
          onPress={() => console.log("Google login")}
        >
          <AntDesign
            name="google"
            size={16}
            color="white"
            style={styles.appleIcon}
          />
          <Text style={styles.buttonText}>Tiếp tục với Google</Text>
        </Pressable>
        <Pressable
          style={styles.loginButton}
          onPress={() => animateToEmailView("email")}
        >
          <Fontisto
            name="email"
            size={16}
            color="white"
            style={styles.emailIcon}
          />
          <Text style={styles.buttonText}>Tiếp tục với Email</Text>
        </Pressable>
      </View>
    </Animated.View>
  );

const renderEmailView = () => (
    <EmailAuth
      onBack={() => animateToEmailView("login")}
      menuContentAnimatedStyle={menuContentAnimatedStyle}
    />
  );

  const dynamicMenuHeight = keyboardHeight > 0 ? MENU_HEIGHT + keyboardHeight + 50 : MENU_HEIGHT + 100

    return (
       <View style={{flex: 1, backgroundColor: "black"}}>
        <VideoView nativeControls={false} 
        player={player} 
        style={[StyleSheet.absoluteFill, {width,height}]}
        contentFit="cover"
        />

        {/* Overlay */}
        <View style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 20}
        ]}/>

        {/* Hero Text Section */}
        <View style={styles.heroTextContainer}>
          <Animated.View style={[styles.mainTextContainer, mainTextAnimatedStyle]}>
           <Text style={styles.heroTextMain}>{mainTextWords.join(" ")}</Text>
          </Animated.View>

          <Animated.View style={scriptTextAnimatedStyle}>
           <Text style={styles.heroTextScript}>{scriptPhrases[currentPhaseIndex]}</Text>
          </Animated.View>
        </View>

        {/* Sliding menu with dynamic height */}
         <GestureDetector gesture={panGesture}>
         <Animated.View
          style={[
            styles.menuContainer,
            menuAnimatedStyle,
            { height: dynamicMenuHeight, paddingBottom: insets.bottom + 30 },
          ]}
        >
        <Pressable style={styles.handleContainer} onPress={handlePress}>
          <View style={styles.handle}/>
        </Pressable>
        <View style={styles.menuContent}>
          {currentView === "login" ? renderLoginView() : renderEmailView()}
        </View>
        </Animated.View>
        </GestureDetector>
       </View>
    )
}

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(20, 20, 20, 0.5)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 30,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 2,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 30,
  },
  viewContainer: {
    flex: 1,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 5,
    borderRadius: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  statsContainer: {
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  buttonsContainer: {
    gap: 16,
  },
  loginButton: {
    backgroundColor: "rgba(60, 60, 67, 0.8)",
    borderColor: "rgba(120, 120, 128, 0.4)",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  appleIcon: {
    marginRight: 12,
  },
  googleIcon: {
    marginRight: 12,
  },
  emailIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  heroTextContainer: {
    position: "absolute",
    top: height * 0.15,
    left: 30,
    right: 30,
    zIndex: 25,
  },
  mainTextContainer: {
    marginBottom: 0,
  },
  heroTextMain: {
    fontSize: verticalScale(45),
    fontWeight: "800",
    fontFamily: "System",
    color: "#fff4cc",
    lineHeight: verticalScale(52),
    letterSpacing: 0,
  },
  heroTextScript: {
    fontSize: verticalScale(50),
    fontFamily: "EBGaramond_500Medium_Italic",
    color: Colors.primaryAccentColor,
    letterSpacing: 0.5,
    lineHeight: verticalScale(55), // Đảm bảo chiều cao dòng bằng với cỡ chữ
    marginTop: verticalScale(5), 
  },
});



