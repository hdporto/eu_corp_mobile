import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Text,
} from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const TabsLayout = () => {
  const router = useRouter();

  return (
    <>
      <StatusBar barStyle={"light-content"} backgroundColor={"#121212"} />
      <View style={styles.headerContainer}>
        <View style={styles.headerLeftContainer}>
          <Text style={styles.appName}>EuCorp</Text>
        </View>
        <View style={styles.headerRightContainer}>
          <TouchableOpacity onPress={() => router.push("home/profile")}>
            <Feather name="user" size={24} color="#BB86FC" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("home/notifications")}
            style={styles.notificationIcon}
          >
            <Feather name="bell" size={24} color="#BB86FC" />
          </TouchableOpacity>
        </View>
      </View>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#BB86FC",
          tabBarStyle: styles.tabBarStyle,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="risks"
          options={{
            title: "Risks",
            tabBarIcon: ({ color, size }) => (
              <Feather name="alert-circle" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="plans"
          options={{
            title: "Plans",
            tabBarIcon: ({ color, size }) => (
              <Feather name="clipboard" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="opportunities"
          options={{
            title: "Opportunities",
            tabBarIcon: ({ color, size }) => (
              <Feather name="trending-up" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#121212",
    height: 70,
    paddingHorizontal: 10,
  },
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appName: {
    color: "#BB86FC",
    fontSize: 24,
    fontWeight: "600",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    marginLeft: 15,
  },
  tabBarStyle: {
    position: "absolute",
    backgroundColor: "#1E1E1E",
    borderColor: "#BB86FC",
    height: 60,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    paddingBottom: 6,
    paddingHorizontal: 10,
  },
});
