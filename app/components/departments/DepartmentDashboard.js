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
  MANPOWER: "#999999",
  FINANCIAL: "#777777",
  ENVIRONMENTAL: "#555555",
  SAFETY: "#111111",
};

const VALUES = {
  MANPOWER: 82,
  FINANCIAL: 3,
  ENVIRONMENTAL: 3,
  SAFETY: 2,
};

const pieData = [
  { value: VALUES.MANPOWER, color: COLORS.MANPOWER, label: "Manpower" },
  { value: VALUES.FINANCIAL, color: COLORS.FINANCIAL, label: "Financial" },
  { value: VALUES.ENVIRONMENTAL, color: COLORS.ENVIRONMENTAL, label: "Environmental" },
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

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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

          // Fetch department name based on department_id
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

          // Fetch plans based on department_id
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
          setAchievedPlans(plansData.filter(plan => plan.is_achieved).length);

          // Fetch opportunities based on department_id
          const { data: opportunitiesData, error: opportunitiesError } = await supabase
            .from("opt_monitoring")
            .select("*")
            .eq("department_id", data.department_id);

          if (opportunitiesError) {
            console.error("Error fetching opportunities:", opportunitiesError.message);
            return;
          }

          setOpportunities(opportunitiesData);
          setTotalOpportunities(opportunitiesData.length);
          setAchievedOpportunities(opportunitiesData.filter(opt => opt.is_achieved).length);
        }
      }
    };

    loadProfile();
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

  // Calculate progress ratios
  const planProgress = totalPlans > 0 ? achievedPlans / totalPlans : 0;
  const opportunityProgress = totalOpportunities > 0 ? achievedOpportunities / totalOpportunities : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#212121" }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.mainContainer}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/risks")}>
            <View style={styles.pieChartContainer}>
              <Text style={styles.title}>Risks</Text>
              <PieChart
                donut
                data={pieData}
                sectionAutoFocus
                radius={120}
                innerRadius={80}
                innerCircleColor={"#323232"}
                centerLabelComponent={() => (
                  <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Feather name="alert-triangle" size={80} color={"#F35454"} />
                    <Text style={{ color: "#fff", marginTop: 5, fontSize: 18 }}>5 FLAGGED</Text>
                  </View>
                )}
              />
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
                  <Text style={styles.planCount}>{achievedPlans}/{totalPlans}</Text>
                  <Text style={styles.progressTitle}>Plans</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/(tabs)/plans")}>
                  <Progress.Bar
                    progress={planProgress}
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
                  <Text style={styles.planCount}>{achievedOpportunities}/{totalOpportunities}</Text>
                  <Text style={styles.progressTitle}>Opportunities</Text>
                </View>
                <TouchableOpacity onPress={() => router.push("/(tabs)/opportunities")}>
                  <Progress.Bar
                    progress={opportunityProgress}
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

const renderLegendComponent = () => {
  return (
    <View style={styles.legendContainer}>
      <View style={styles.legendRow}>
        <View style={{ ...styles.legendDot, backgroundColor: COLORS.MANPOWER }} />
        <Text style={styles.legendText}>Manpower: {VALUES.MANPOWER}</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={{ ...styles.legendDot, backgroundColor: COLORS.ENVIRONMENTAL }} />
        <Text style={styles.legendText}>Environmental: {VALUES.ENVIRONMENTAL}</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={{ ...styles.legendDot, backgroundColor: COLORS.FINANCIAL }} />
        <Text style={styles.legendText}>Financial: {VALUES.FINANCIAL}</Text>
      </View>
      <View style={styles.legendRow}>
        <View style={{ ...styles.legendDot, backgroundColor: COLORS.SAFETY }} />
        <Text style={styles.legendText}>Safety: {VALUES.SAFETY}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  pieChartContainer: {
    marginVertical: 20,
    alignItems: "center",
    backgroundColor: "#323232",
    borderRadius: 12,
    padding: 10,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  barGraphCard: {
    padding: 20,
    backgroundColor: "#323232",
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
    marginTop: 20,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  legendDot: {
    width: 15,
    height: 15,
    borderRadius: 5,
    marginRight: 10,
  },
  legendText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default DepartmentDashboard;
