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
} from "react-native";
import * as Progress from "react-native-progress";
import { PieChart } from "react-native-gifted-charts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import * as Animatable from "react-native-animatable";
import * as Notifications from "expo-notifications";
import { sendNotification, supabase } from "../../../utils/supabaseClient";
import { useRouter } from "expo-router";

const COLORS = {
  MANPOWER: "#999999",
  FINANCIAL: "#777777",
  ENVIRONMENTAL: "#555555",
  SAFETY: "#111111",
};

const VALUES = {
  MANPOWER: 2,
  FINANCIAL: 3,
  ENVIRONMENTAL: 3,
  SAFETY: 2,
};

const pieData = [
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

const DepartmentDashboard = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity for department rows
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial scale for pie chart
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

  // Animations on mount

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

  const handlePieSectionPress = (section) => {
    console.log(`${section.label} section clicked`);
  };

  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#212121" }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.mainContainer}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/risks")}>
            <View style={styles.pieChartContainer}>
              <Text style={styles.title}>Risks</Text>
              <View>
                <PieChart
                  donut
                  data={pieData}
                  sectionAutoFocus
                  radius={120}
                  innerRadius={80}
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
                          size={80}
                          color={"#F35454"}
                        />
                        <Text
                          style={{ color: "#fff", marginTop: 5, fontSize: 18 }}
                        >
                          5 FLAGGED
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
              {renderLegendComponent()}
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.barGraphCard}>
            <Text style={styles.barGraphTitle}>Overview</Text>
            <View style={styles.progressContainer}>
              <View style={styles.barGraphContainer}>
                <View style={styles.progressRow}>
                  <Text style={styles.planCount}>4/6</Text>
                  <Text style={styles.progressTitle}>Plans</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/(tabs)/plans")}>
                  <Progress.Bar
                    progress={0.8}
                    width={340}
                    height={20}
                    color="#4CAF50"
                    unfilledColor="#606060"
                    borderRadius={10}
                    borderWidth={0}
                    style={styles.progressBar}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.barGraphContainer}>
                <View style={styles.progressRow}>
                  <Text style={styles.planCount}>7/10</Text>
                  <Text style={styles.progressTitle}>Opportunities</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/opportunities")}
                >
                  <Progress.Bar
                    progress={0.7}
                    width={340}
                    height={20}
                    color="#FF9800"
                    unfilledColor="#606060"
                    borderRadius={10}
                    borderWidth={0}
                    style={styles.progressBar}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DepartmentDashboard;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#212121",
    marginTop: 20,
  },
  pieChartContainer: {
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
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
  barGraphCard: {
    backgroundColor: "#323232",
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  barGraphTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
  },
  barGraphContainer: {
    alignItems: "flex-start",
    marginVertical: 12,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  progressTitle: {
    color: "#e0e0e0",
    fontSize: 14,
  },
  planCount: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  progressBar: {
    borderRadius: 12,
    overflow: "hidden",
  },
});
