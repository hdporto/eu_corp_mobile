import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import React, { useEffect } from "react";
import { Link } from "expo-router";
import { TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const Welcome = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Shared values for animations
  const imageOpacity = useSharedValue(0);
  const imageTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

  // Animated styles
  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ translateY: imageTranslateY.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  // Triggers animations on component mount
  useEffect(() => {
    imageOpacity.value = withTiming(1, { duration: 500 });
    imageTranslateY.value = withTiming(0, { duration: 500 });
    titleOpacity.value = withTiming(1, { duration: 700 });
    titleTranslateY.value = withTiming(0, { duration: 700 });
    buttonOpacity.value = withTiming(1, { duration: 900 });
    buttonTranslateY.value = withTiming(0, { duration: 900 });
  }, []);

  return (
    <LinearGradient
      colors={isDarkMode ? ["#FFDEE9", "#B5FFFC"] : ["#FFDEE9", "#B5FFFC"]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, imageStyle]}>
            <Image
              source={require("../../assets/welcome.png")}
              style={styles.logo}
            />
          </Animated.View>
          <Animated.View style={[styles.textContainer, titleStyle]}>
            <Text style={[styles.welcomeTitle]}>Welcome to EuCorp</Text>
            <Text style={[styles.subtitle]}>
              Your Institutional Planning System
            </Text>
          </Animated.View>
          <Animated.View style={buttonStyle}>
            <TouchableOpacity>
              <Link href="/(auth)/login" style={[styles.loginButton]}>
                <Text style={styles.loginText}>Get Started</Text>
              </Link>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 300,
    height: 300,
    borderRadius: 20,
  },
  textContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 30,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 19,
    fontWeight: "400",
    color: "#626262",
    marginBottom: 30,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#990f02",
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingLeft: 100,
    paddingRight: 100,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
});
