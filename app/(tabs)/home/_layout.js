import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default HomeLayout;

const styles = StyleSheet.create({});
