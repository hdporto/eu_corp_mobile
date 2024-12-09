import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../../utils/supabaseClient";

const TabsLayout = () => {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
          return;
        }

        if (data) {
          setProfilePic(data.profile_pic || null);
        }
      }
    };

    loadProfile();
  }, []);

  return (
    <>
      <StatusBar barStyle={"light-content"} backgroundColor={"#121212"} />
      <View style={styles.headerContainer}>
        <View style={styles.headerLeftContainer}>
          <Image
            source={require("../../assets/instituologo_white.png")}
            style={styles.logo}
          />
          <Text style={styles.appName}>EuCorp</Text>
        </View>

        <View style={styles.headerRightContainer}>
          <TouchableOpacity onPress={() => router.push("home/profile")}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profilePic} />
            ) : (
              <Feather name="user" size={24} color="#BB86FC" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("home/notifications")}
            style={styles.notificationIcon}
          >
            <Feather name="bell" size={24} color="#BB86FC" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab navigation */}
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
    marginLeft: 8,
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
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
    backgroundColor: "#121212",
    borderColor: "#1E1E1E",
    height: 60,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    paddingBottom: 6,
    paddingHorizontal: 10,
  },
  profilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
