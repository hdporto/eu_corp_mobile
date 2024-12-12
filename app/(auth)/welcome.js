import {
  Image,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
import { Link } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const Welcome = () => {
  const imageOpacity = useSharedValue(0);
  const imageTranslateY = useSharedValue(30);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);

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

  useEffect(() => {
    imageOpacity.value = withTiming(1, { duration: 500 });
    imageTranslateY.value = withTiming(0, { duration: 500 });
    titleOpacity.value = withTiming(1, { duration: 700 });
    titleTranslateY.value = withTiming(0, { duration: 700 });
    buttonOpacity.value = withTiming(1, { duration: 900 });
    buttonTranslateY.value = withTiming(0, { duration: 900 });
  }, []);

  return (
    <SafeAreaView style={{ backgroundColor: "#121212" }} className="flex-1">
      <View className="flex-1 items-center justify-center">
        {/* Illustration */}
        <Animated.View style={imageStyle} className="mb-8">
          <Image
            source={require("../../assets/welcome.png")} // Replace with your asset path
            className="w-80 h-80" // Increased image size
            resizeMode="contain"
          />
        </Animated.View>
        {/* Title Section */}
        <Animated.View
          style={titleStyle}
          className="text-center px-8 space-y-4"
        >
          <Text className="text-4xl font-bold text-white text-center">
            Welcome to EuCorp
          </Text>
          <Text className="text-lg text-white text-center mt-2">
            Enverga Universities' Insitutional Planning System
          </Text>
        </Animated.View>
        {/* Button Section */}
        <Animated.View style={buttonStyle} className="mt-12">
          <TouchableOpacity>
            <Link
              href="/(auth)/login"
              style={{
                backgroundColor: "#BB86FC",
                paddingVertical: 16, // Larger padding
                paddingHorizontal: 60, // Larger button width
                borderRadius: 30, // Larger border radius for a rounded look
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 6, // Bigger shadow
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 22, // Larger font size
                  fontWeight: "600",
                }}
              >
                Get Started
              </Text>
            </Link>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
