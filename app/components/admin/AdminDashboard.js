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
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("User"); // Added state for firstName
  const router = useRouter();
  
  const fetchUserProfile = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        return;
      }

      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile) {
          console.error("Error fetching profile:", profileError);
        } else {
          setFirstName(profile.first_name || "User");
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const scheduleNotification = async (value) => {
      if (!user) return;
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
    try {
      // Fetch plans monitoring data along with profiles and department names
      const { data: plansMonitoring, error } = await supabase.from(
        "plan_monitoring"
      ).select(`
          action_plan_id,
          is_accomplished,
          evaluation,
          time_completed,
          profiles (
            department_id,
            departments ( name )
          )
        `);

      if (error) {
        console.error("Error fetching plans monitoring:", error);
        return;
      }

      console.log("Fetched Plans Monitoring Data:", plansMonitoring);

      const departmentMap = {};

      plansMonitoring.forEach((plan) => {
        const departmentName =
          plan.profiles?.departments?.name || "Unknown Department";

        if (!departmentMap[departmentName]) {
          departmentMap[departmentName] = {
            totalPlans: 0,
            achievedPlans: 0,
            department: departmentName,
          };
        }

        departmentMap[departmentName].totalPlans += 1;

        if (plan.is_accomplished) {
          departmentMap[departmentName].achievedPlans += 1;
        }
      });

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
        .sort((a, b) => b.achievedPlans - a.achievedPlans);

      setPlansData(updatedPlansData);
    } catch (error) {
      console.error("Unexpected error fetching plans monitoring data:", error);
    }
  };

  const fetchOpportunitiesData = async () => {
    try {
      const { data: opportunities, error: opportunitiesError } = await supabase
        .from("opt_monitoring")
        .select("is_accomplished, profile_id, opportunities (opt_statement)");

      if (opportunitiesError) {
        console.error("Error fetching opportunities data:", opportunitiesError);
        return;
      }

      const departmentMap = {};

      await Promise.all(
        opportunities.map(async (opportunity) => {
          const profileId = opportunity.profile_id;

          if (!profileId) {
            console.error("Missing profile_id for opportunity:", opportunity);
            return;
          }

          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("department_id")
            .eq("id", profileId)
            .single();

          if (profileError || !profile) {
            console.error(
              `Error fetching profile for profile_id ${profileId}:`,
              profileError
            );
            return;
          }

          const departmentId = profile.department_id;

          if (!departmentId) {
            console.error(
              `Missing department_id for profile_id ${profileId}:`,
              profile
            );
            return;
          }

          const { data: department, error: departmentError } = await supabase
            .from("departments")
            .select("name")
            .eq("id", departmentId)
            .single();

          if (departmentError || !department) {
            console.error(
              `Error fetching department for department_id ${departmentId}:`,
              departmentError
            );
            return;
          }

          const departmentName = department.name || "Unknown Department";

          if (!departmentMap[departmentName]) {
            departmentMap[departmentName] = {
              totalOpportunities: 0,
              achievedOpportunities: 0,
              department: departmentName,
            };
          }

          departmentMap[departmentName].totalOpportunities += 1;

          if (opportunity.is_accomplished) {
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
    } catch (err) {
      console.error("Unexpected error fetching opportunities data:", err);
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
    fetchUserProfile();
    fetchPlansData();
    fetchOpportunitiesData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.mainContainer}>
          <Text style={styles.greetingText}>Hello {firstName}</Text>
          <Text style={styles.greetingSub}>Welcome Back!</Text>
        </View>
        <View style={styles.mainContainer}>
          <TouchableOpacity style={styles.risksContainer}>
            <Text style={styles.cardTitle}>Total Risks</Text>
            <View style={styles.pieChartContainer}>
              <PieChart
                donut
                data={risksData}
                radius={100}
                innerRadius={60}
                innerCircleColor={"#212121"}
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
                  color="#BB86FC"
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
                  width={180}
                  height={10}
                  color={getProgressColor(plan.value)}
                  unfilledColor={"#e0e0e0"}
                  borderWidth={0}
                  borderRadius={10}
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
                  color="#BB86FC"
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
                  width={180}
                  height={10}
                  color={getProgressColor(opportunity.value)}
                  unfilledColor={"#e0e0e0"}
                  borderWidth={0}
                  borderRadius={10}
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
    backgroundColor: "#121212",
  },
  scrollView: {
    paddingBottom: 10,
  },
  greetingText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  greetingSub: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  mainContainer: {
    padding: 15,
  },
  risksContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 5,
    borderColor: "#2E2E2E",
    borderWidth: 1,
  },
  pieChartContainer: {
    alignItems: "center",
    paddingVertical: 15,
  },
  centerLabel: {
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  plansContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 5,
    borderColor: "#2E2E2E",
    borderWidth: 1,
  },
  opportunitiesContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
    marginBottom: 50,
    elevation: 5,
    borderColor: "#2E2E2E",
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#BB86FC",
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
