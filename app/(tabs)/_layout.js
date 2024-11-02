import { StyleSheet, View, StatusBar, TouchableOpacity } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const TabsLayout = () => {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#610000",
        },
        headerTitle: "",
        headerRight: () => (
          <View style={styles.headerIconsContainer}>
            <StatusBar barStyle={"light-content"} backgroundColor={"#323232"} />
            <TouchableOpacity onPress={() => router.push("home/profile")}>
              <Feather name="user" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("home/notifications")}
              style={styles.notificationIcon}
            >
              <Feather name="bell" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ),
        tabBarActiveTintColor: "#fff",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#610000",
          borderTopColor: "transparent",
          borderRadius: 30,
          marginHorizontal: 16,
          marginBottom: 12,
          height: 60,
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 10,
          paddingBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerTitleAlign: "center",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Feather name="home" size={30} color="#fff" />
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="risks"
        options={{
          title: "Risks",
          headerTitleAlign: "center",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Feather name="alert-circle" size={30} color="#fff" />
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Feather name="alert-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: "Plans",
          headerTitleAlign: "center",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Feather name="clipboard" size={30} color="#fff" />
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Feather name="clipboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="opportunities"
        options={{
          title: "Opportunity",
          headerTitleAlign: "center",
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Feather name="trending-up" size={30} color="#fff" />
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Feather name="trending-up" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  headerIconsContainer: {
    flexDirection: "row",
    marginRight: 20,
    marginBottom: 28,
  },
  headerTitleContainer: {
    marginBottom: 28,
  },
  notificationIcon: {
    marginLeft: 15,
  },
});
