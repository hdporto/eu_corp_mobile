import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import * as Progress from "react-native-progress";
import { PieChart } from "react-native-gifted-charts";
import { useRouter } from "expo-router";
import { supabase, sendNotification } from "../../../utils/supabaseClient";
import * as Notifications from "expo-notifications";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const AdminDashboard = () => {
  const [plansData, setPlansData] = useState([]);
  const [opportunitiesData, setOpportunitiesData] = useState([]);
  const [user, setUser] = useState(null); // Ensure user state is defined
  const router = useRouter();

  // Example: Fetch user from Supabase (or define your method)
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  // Schedule notifications based on the values
  useEffect(() => {
    const scheduleNotification = async (value) => {
      if (!user) return; // Ensure user is available before sending notification
      const message = `Risk level is ${value}`;
      await sendNotification(user.id, message);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Risk Alert",
          body: message,
          data: { value },
        },
        trigger: null,
      });
    };

    Object.values(VALUES).forEach((value) => {
      if (value > 60) {
        scheduleNotification(value);
      }
    });
  }, [user]);

  const getProgressColor = (value) => {
    if (value <= 24) return "#FF5252";
    if (value <= 49) return "#FF9800";
    if (value <= 79) return "#FFEB3B";
    return "#4CAF50";
  };

  const COLORS = {
    MANPOWER: "#FF5252",
    FINANCIAL: "#FF9800",
    ENVIRONMENTAL: "#FFEB3B",
    SAFETY: "#4CAF50",
  };

  const VALUES = {
    MANPOWER: 20,
    FINANCIAL: 34,
    ENVIRONMENTAL: 52,
    SAFETY: 72,
  };

  const risksData = [
    { value: VALUES.MANPOWER, color: COLORS.MANPOWER, label: "Manpower" },
    { value: VALUES.FINANCIAL, color: COLORS.FINANCIAL, label: "Financial" },
    {
      value: VALUES.ENVIRONMENTAL,
      color: COLORS.ENVIRONMENTAL,
      label: "Environmental",
    },
    { value: VALUES.SAFETY, color: COLORS.SAFETY, label: "Safety" },
  ];

  const fetchPlansData = async () => {
    const { data, error } = await supabase
      .from("plans_monitoring")
      .select("is_achieved, department_id");

    if (error) {
      console.error("Error fetching plans data:", error);
    } else {
      const departmentMap = {};
      await Promise.all(
        data.map(async (plan) => {
          const { data: deptData, error: deptError } = await supabase
            .from("departments")
            .select("name")
            .eq("id", plan.department_id)
            .single();

          if (deptError) {
            console.error("Error fetching department data:", deptError);
            return;
          }

          const departmentName = deptData ? deptData.name : "Unknown";

          if (!departmentMap[departmentName]) {
            departmentMap[departmentName] = {
              totalPlans: 0,
              achievedPlans: 0,
              department: departmentName,
            };
          }

          departmentMap[departmentName].totalPlans += 1;
          if (plan.is_achieved) {
            departmentMap[departmentName].achievedPlans += 1;
          }
        })
      );

      const updatedPlansData = Object.values(departmentMap)
        .map((dept) => {
          const progress =
            dept.totalPlans > 0
              ? (dept.achievedPlans / dept.totalPlans) * 100
              : 0;

          return {
            department: dept.department,
            value: progress,
            achievedPlans: dept.achievedPlans,
            totalPlans: dept.totalPlans,
          };
        })
        .sort((a, b) => b.achievedPlans - a.achievedPlans)
        .slice(0, 5);

      setPlansData(updatedPlansData);
    }
  };

  const fetchOpportunitiesData = async () => {
    const { data, error } = await supabase
      .from("opt_monitoring")
      .select("is_achieved, department_id, opt_name");

    if (error) {
      console.error("Error fetching opportunities data:", error);
    } else {
      const departmentMap = {};
      await Promise.all(
        data.map(async (opportunity) => {
          const { data: deptData, error: deptError } = await supabase
            .from("departments")
            .select("name")
            .eq("id", opportunity.department_id)
            .single();

          if (deptError) {
            console.error("Error fetching department data:", deptError);
            return;
          }

          const departmentName = deptData ? deptData.name : "Unknown";

          if (!departmentMap[departmentName]) {
            departmentMap[departmentName] = {
              totalOpportunities: 0,
              achievedOpportunities: 0,
              department: departmentName,
            };
          }

          departmentMap[departmentName].totalOpportunities += 1;
          if (opportunity.is_achieved) {
            departmentMap[departmentName].achievedOpportunities += 1;
          }
        })
      );

      const updatedOpportunitiesData = Object.values(departmentMap)
        .map((dept) => {
          const progress =
            dept.totalOpportunities > 0
              ? (dept.achievedOpportunities / dept.totalOpportunities) * 100
              : 0;

          return {
            department: dept.department,
            value: progress,
            achievedOpportunities: dept.achievedOpportunities,
            totalOpportunities: dept.totalOpportunities,
          };
        })
        .sort((a, b) => b.achievedOpportunities - a.achievedOpportunities)
        .slice(0, 5);

      setOpportunitiesData(updatedOpportunitiesData);
    }
  };

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

  useEffect(() => {
    fetchPlansData();
    fetchOpportunitiesData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.mainContainer}>
          <TouchableOpacity style={styles.risksContainer}>
            <Text style={styles.cardTitle}>Total Risks</Text>
            <View style={styles.pieChartContainer}>
              <PieChart
                donut
                data={risksData}
                radius={100}
                innerRadius={60}
                innerCircleColor={"#323232"}
                centerLabelComponent={() => (
                  <Text style={styles.centerLabel}>Risks</Text>
                )}
              />
            </View>
            {renderLegendComponent()}
          </TouchableOpacity>

          <View style={styles.plansContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Plans Monitoring</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/plans")}>
                <MaterialIcons
                  name="keyboard-double-arrow-right"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.summaryText}>
              Top 5 Departments by Achievement Rate
            </Text>
            {plansData.map((plan, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{plan.department}</Text>
                <Progress.Bar
                  progress={plan.value / 100}
                  width={160}
                  color={getProgressColor(plan.value)}
                  unfilledColor={"#e0e0e0"}
                  borderWidth={0}
                />
                <Text style={styles.summaryValue}>
                  {plan.achievedPlans}/{plan.totalPlans} Achieved
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.opportunitiesContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Opportunities Monitoring</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/opportunities")}
              >
                <MaterialIcons
                  name="keyboard-double-arrow-right"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.summaryText}>
              Top 5 Departments by Achievement Rate
            </Text>
            {opportunitiesData.map((opportunity, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {opportunity.department}
                </Text>
                <Progress.Bar
                  progress={opportunity.value / 100}
                  width={160}
                  color={getProgressColor(opportunity.value)}
                  unfilledColor={"#e0e0e0"}
                  borderWidth={0}
                />
                <Text style={styles.summaryValue}>
                  {opportunity.achievedOpportunities}/
                  {opportunity.totalOpportunities} Achieved
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
  },
  scrollView: {
    paddingVertical: 10,
  },
  mainContainer: {
    padding: 15,
  },
  risksContainer: {
    backgroundColor: "#323232",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  pieChartContainer: {
    alignItems: "center",
    paddingVertical: 15,
  },
  centerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  plansContainer: {
    backgroundColor: "#323232",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  opportunitiesContainer: {
    backgroundColor: "#323232",
    borderRadius: 10,
    padding: 15,
    marginBottom: 50,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  summaryText: {
    color: "#A0A0A0",
    fontSize: 12,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    width: 50,
  },
  summaryValue: {
    color: "#A0A0A0",
    fontSize: 12,
  },
});

export default AdminDashboard;
