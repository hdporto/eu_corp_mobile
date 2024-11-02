import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";

export default function PlansLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PlansReport"
        options={{
          headerShadowVisible: false,
          title: "Detailed Plans Report",
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
