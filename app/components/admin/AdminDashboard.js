import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Animated,
  FlatList,
  Alert,
} from "react-native";
import * as Progress from "react-native-progress";
import { PieChart, BarChart } from "react-native-gifted-charts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import * as Animatable from "react-native-animatable";
import * as Notifications from "expo-notifications";
import { sendNotification, supabase } from "../../../utils/supabaseClient";
import { useRouter } from "expo-router";
import AdminPlans from "./AdminPlans";

const AdminDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const fetchSession = async () => {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();
  //     setUser(session?.user);
  //   };

  //   fetchSession();
  // }, []);

  // const scheduleNotification = useCallback(
  //   async (value) => {
  //     if (!user) return; // Ensure user is available before sending notification
  //     const message = `Risk level is ${value}`;

  //     // Send notification to the database
  //     await sendNotification(user.id, message); // Pass the user ID and the message

  //     // Schedule the local notification
  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: "Risk Alert",
  //         body: message,
  //         data: { value },
  //       },
  //       trigger: null,
  //     });
  //   },
  //   [user]
  // );

  // // Check values and send notification if any are above 60
  // useEffect(() => {
  //   Object.values(VALUES).forEach((value) => {
  //     if (value > 60) {
  //       scheduleNotification(value);
  //     }
  //   });
  // }, [scheduleNotification]);

  // // Request notification permissions on mount
  // useEffect(() => {
  //   const requestPermissions = async () => {
  //     const { status } = await Notifications.getPermissionsAsync();
  //     if (status !== "granted") {
  //       await Notifications.requestPermissionsAsync();
  //     }
  //   };

  //   requestPermissions();
  // }, []);


  const router = useRouter();

  const plansData = [
    { value: 25, label: "CCMS", color: "#3D0000" },
    { value: 50, label: "CED", color: "#140000" },
    { value: 74, label: "CBA", color: "#660000" },
    { value: 32, label: "CAFA", color: "#520000" },
    { value: 60, label: "CENG", color: "#7A0000" },
    { value: 20, label: "CAS", color: "#610000" },
    { value: 49, label: "CNAHS", color: "#A30000" },
    { value: 20, label: "CCJC", color: "#38060f" },
    { value: 62, label: "CIHTM", color: "#761816" },
  ];

  const optData = [
    { value: 30, label: "CCMS", color: "#3D0000" },
    { value: 51, label: "CED", color: "#140000" },
    { value: 49, label: "CBA", color: "#660000" },
    { value: 23, label: "CAFA", color: "#520000" },
    { value: 68, label: "CENG", color: "#7A0000" },
    { value: 73, label: "CAS", color: "#610000" },
    { value: 56, label: "CNAHS", color: "#A30000" },
    { value: 33, label: "CCJC", color: "#38060f" },
    { value: 21, label: "CIHTM", color: "#761816" },
  ];

  const COLORS = {
    MANPOWER: "#610000",
    FINANCIAL: "#A30000",
    ENVIRONMENTAL: "#38060f",
    SAFETY: "#761816",
  };

  const VALUES = {
    MANPOWER: 80,
    FINANCIAL: 3,
    ENVIRONMENTAL: 3,
    SAFETY: 2,
  };

  const risksData = [
    {
      value: VALUES.MANPOWER,
      color: COLORS.MANPOWER,
      label: "Manpower",
    },
    {
      value: VALUES.FINANCIAL,
      color: COLORS.FINANCIAL,
      label: "Financial",
    },
    {
      value: VALUES.ENVIRONMENTAL,
      color: COLORS.ENVIRONMENTAL,
      label: "Environmental",
    },
    {
      value: VALUES.SAFETY,
      color: COLORS.SAFETY,
      label: "Safety",
    },
  ];

  const renderDot = (color) => {
    return (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
    );
  };

  const renderLegendComponent = () => {
    return (
      <>
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            {renderDot(COLORS.MANPOWER)}
            <Text style={styles.legendText}>Manpower: {VALUES.MANPOWER}</Text>
          </View>
          <View style={styles.legendRow}>
            {renderDot(COLORS.ENVIRONMENTAL)}
            <Text style={styles.legendText}>
              Environmental: {VALUES.ENVIRONMENTAL}
            </Text>
          </View>
        </View>
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            {renderDot(COLORS.FINANCIAL)}
            <Text style={styles.legendText}>Financial: {VALUES.FINANCIAL}</Text>
          </View>
          <View style={styles.legendRow}>
            {renderDot(COLORS.SAFETY)}
            <Text style={styles.legendText}>Safety: {VALUES.SAFETY}</Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#212121" }}>
      <ScrollView>
        <View style={styles.mainContainer}>
          <View style={styles.risksContainer}>
            <Text style={styles.cardTitle}>Total Risks</Text>
            <View>
              <PieChart
                donut
                data={risksData}
                sectionAutoFocus
                onPress={(item, index) => Alert.alert(item.label.toString())}
                radius={100}
                innerRadius={60}
                innerCircleColor={"#323232"}
                centerLabelComponent={() => {
                  return (
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather
                        name="alert-triangle"
                        size={40}
                        color={"#F35454"}
                      />
                    </View>
                  );
                }}
              />
            </View>
            {renderLegendComponent()}
          </View>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.plansChartContainer}>
            <Text style={styles.cardTitle}>Total Plans</Text>
            <BarChart
              barWidth={26}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="gray"
              data={plansData}
              hideRules
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisTextStyle={{ color: "white", fontSize: 16 }}
              xAxisLabelTextStyle={{
                color: "white",
                textAlign: "center",
                fontSize: 11,
              }}
              height={180}
              onPress={(item) => console.log("item", item)}
            />
          </View>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.optChartContainer}>
            <Text style={styles.cardTitle}>Total Opportunities</Text>
            <BarChart
              barWidth={26}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="gray"
              data={optData}
              hideRules
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisTextStyle={{ color: "white", fontSize: 16 }}
              xAxisLabelTextStyle={{
                color: "white",
                textAlign: "center",
                fontSize: 11,
              }}
              height={180}
              onPress={(item, index) => console.log("item", item)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#212121",
  },
  risksContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#323232",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
    marginRight: 20,
  },
  legendText: {
    color: "#fff",
    fontSize: 12,
  },
  plansChartContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#323232",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  optChartContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#323232",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 90,
  },
  cardTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});
