import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";

export default function RisksLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RiskReport"
        options={{
          headerShadowVisible: false,
          title: "Detailed Risk Report",
          headerStyle: {
            backgroundColor: "#212121",
          },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({});
