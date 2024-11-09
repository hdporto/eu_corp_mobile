import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function OpportunitiesLayout() {
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OptReport"
        options={{
          headerShadowVisible: false,
          title: "Detailed Opportunities Report",
          headerStyle: {
            backgroundColor: "#212121",
          },
          headerTintColor: "#fff",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 28,
    fontSize: 20,
  },
  headerIconsContainer: {
    flexDirection: "row",
    marginRight: 10,
    marginBottom: 28,
  },
  notificationIcon: {
    marginLeft: 15,
  },
});
