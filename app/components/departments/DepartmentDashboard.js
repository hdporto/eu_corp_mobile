import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import * as Progress from "react-native-progress";
import { PieChart } from "react-native-gifted-charts";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { supabase, sendNotification } from "../../../utils/supabaseClient";
import * as Notifications from "expo-notifications";

const COLORS = {
  MANPOWER: "#FF5252",
  FINANCIAL: "#FF9800",
  ENVIRONMENTAL: "#FFEB3B",
  SAFETY: "#4CAF50",
};

const VALUES = {
  MANPOWER: 2,
  FINANCIAL: 3,
  ENVIRONMENTAL: 3,
  SAFETY: 2,
};

const pieData = [
  { value: VALUES.MANPOWER, color: COLORS.MANPOWER, label: "Manpower" },
  { value: VALUES.FINANCIAL, color: COLORS.FINANCIAL, label: "Financial" },
  {
    value: VALUES.ENVIRONMENTAL,
    color: COLORS.ENVIRONMENTAL,
    label: "Environmental",
  },
  { value: VALUES.SAFETY, color: COLORS.SAFETY, label: "Safety" },
];

const DepartmentDashboard = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [departmentName, setDepartmentName] = useState("Unknown");
  const [profileExists, setProfileExists] = useState(false);
  const [plans, setPlans] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [totalPlans, setTotalPlans] = useState(0);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [achievedPlans, setAchievedPlans] = useState(0);
  const [achievedOpportunities, setAchievedOpportunities] = useState(0);
  const [user, setUser] = useState(null);
  const router = useRouter();

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
    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setEmail(session.user.email);

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
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setProfilePic(data.profile_pic || null);
          setProfileExists(true);

          const { data: departmentData, error: deptError } = await supabase
            .from("departments")
            .select("name")
            .eq("id", data.department_id)
            .single();

          if (deptError) {
            console.error("Error fetching department:", deptError.message);
            return;
          }

          setDepartmentName(departmentData ? departmentData.name : "Unknown");

          const { data: plansData, error: plansError } = await supabase
            .from("plans_monitoring")
            .select("*")
            .eq("department_id", data.department_id);

          if (plansError) {
            console.error("Error fetching plans:", plansError.message);
            return;
          }

          setPlans(plansData);
          setTotalPlans(plansData.length);
          setAchievedPlans(plansData.filter((plan) => plan.is_achieved).length);

          const { data: opportunitiesData, error: opportunitiesError } =
            await supabase
              .from("opt_monitoring")
              .select("*")
              .eq("department_id", data.department_id);

          if (opportunitiesError) {
            console.error(
              "Error fetching opportunities:",
              opportunitiesError.message
            );
            return;
          }

          setOpportunities(opportunitiesData);
          setTotalOpportunities(opportunitiesData.length);
          setAchievedOpportunities(
            opportunitiesData.filter((opt) => opt.is_achieved).length
          );
        }
      }
    };

    loadProfile();
  }, []);

  // useEffect(() => {
  //   const scheduleNotification = async (value) => {
  //     if (!user) return;
  //     const message = `Risk level is ${value}`;
  //     await sendNotification(user.id, message);
  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: "Risk Alert",
  //         body: message,
  //         data: { value },
  //       },
  //       trigger: null,
  //     });
  //   };

  //   Object.values(VALUES).forEach((value) => {
  //     if (value > 60) {
  //       scheduleNotification(value);
  //     }
  //   });
  // }, [user]);

  const planProgress = totalPlans > 0 ? achievedPlans / totalPlans : 0;
  const opportunityProgress =
    totalOpportunities > 0 ? achievedOpportunities / totalOpportunities : 0;

  const getProgressBarColor = (achieved, total) => {
    if (total === 0) return "#606060";
    const progress = achieved / total;
    if (progress >= 1) return COLORS.SAFETY;
    if (progress >= 0.75) return COLORS.ENVIRONMENTAL;
    if (progress >= 0.5) return COLORS.FINANCIAL;
    return COLORS.MANPOWER;
  };

  const planProgressColor = getProgressBarColor(achievedPlans, totalPlans);
  const opportunityProgressColor = getProgressBarColor(
    achievedOpportunities,
    totalOpportunities
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.mainContainer}>
          <TouchableOpacity
            style={styles.risksContainer}
            onPress={() => router.push("/(tabs)/risks")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Total Risks</Text>
            </View>
            <View style={styles.pieChartContainer}>
              <PieChart
                donut
                data={pieData}
                sectionAutoFocus
                radius={100}
                innerRadius={60}
                innerCircleColor={"#212121"}
                centerLabelComponent={() => (
                  <Text style={styles.centerLabel}>Risks</Text>
                )}
              />
              {renderLegendComponent()}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.barGraphCard}>
            <Text style={styles.cardTitle}>Overview</Text>
            <View style={styles.progressContainer}>
              <View style={styles.barGraphContainer}>
                <View style={styles.progressRow}>
                  <Text style={styles.planCount}>
                    {achievedPlans}/{totalPlans}
                  </Text>
                  <Text style={styles.progressTitle}>Plans</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/(tabs)/plans")}>
                  <Progress.Bar
                    progress={planProgress}
                    width={340}
                    height={10}
                    color={planProgressColor}
                    unfilledColor="#606060"
                    borderRadius={10}
                    borderWidth={0}
                    style={styles.progressBar}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.barGraphContainer}>
                <View style={styles.progressRow}>
                  <Text style={styles.planCount}>
                    {achievedOpportunities}/{totalOpportunities}
                  </Text>
                  <Text style={styles.progressTitle}>Opportunities</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/opportunities")}
                >
                  <Progress.Bar
                    progress={opportunityProgress}
                    width={340}
                    height={10}
                    color={opportunityProgressColor}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  mainContainer: {
    padding: 15,
  },
  scrollView: {
    paddingVertical: 10,
  },
  risksContainer: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    padding: 15,
  },
  pieChartContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  centerLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#BB86FC",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  barGraphCard: {
    padding: 20,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  barGraphTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  progressContainer: {
    marginTop: 20,
  },
  barGraphContainer: {
    marginBottom: 15,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  progressBar: {
    marginTop: 5,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
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
});

export default DepartmentDashboard;
