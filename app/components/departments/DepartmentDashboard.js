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
import { supabase } from "../../../utils/supabaseClient";

const COLORS = {
  Manpower: "#FF5722",
  Financial: "#3F51B5",
  Industrial: "#9C27B0",
  Acads: "#4CAF50",
  Operational: "#FFC107",
  "Social/Behavior": "#E91E63",
};

const DepartmentDashboard = () => {
  const [firstName, setFirstName] = useState("");
  const [profileId, setProfileId] = useState(null);
  const [totalPlans, setTotalPlans] = useState(0);
  const [achievedPlans, setAchievedPlans] = useState(0);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [achievedOpportunities, setAchievedOpportunities] = useState(0);
  const [riskMonitoring, setRiskMonitoring] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [achievedFilter, setAchievedFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
          .select("first_name, id")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile) {
          console.error("Error fetching profile:", profileError);
        } else {
          setFirstName(profile.first_name || "User");
          setProfileId(profile.id);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchRiskMonitoring = async () => {
    try {
      const { data, error } = await supabase.from("risk_monitoring").select(
        `id,
          risks (
            rrn,
            risk_statement,
            classification:classification(name)
          ),
          likelihood_rating:likelihood_rating_id(name),
          severity:severity_id(name),
          control_rating:control_rating_id(name),
          monitoring_rating:monitoring_rating_id(status),
          is_achieved`
      );

      if (error) throw error;

      const transformedData = data.map((item) => ({
        id: item.id,
        rrn: item.risks?.rrn || "N/A",
        risk_statement: item.risks?.risk_statement || "No statement available",
        classification: item.risks?.classification?.name || "Unknown",
        likelihood_rating: item.likelihood_rating?.name || "N/A",
        severity: item.severity?.name || "N/A",
        control_rating: item.control_rating?.name || "N/A",
        monitoring_rating: item.monitoring_rating?.status || "N/A",
        is_achieved: item.is_achieved,
      }));

      setRiskMonitoring(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error("Error fetching risk monitoring data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskMonitoring();
  }, []);

  const getPieData = () => {
    const classificationCounts = riskMonitoring.reduce((acc, item) => {
      const key = item.classification || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(classificationCounts).map(([key, value]) => ({
      value,
      color: COLORS[key] || COLORS.Unknown,
      label: key,
    }));
  };

  const fetchPlansData = async () => {
    if (!profileId) return;
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("department_id")
        .eq("id", profileId)
        .single();

      if (profileError || !profile) {
        console.error("Error fetching profile's department ID:", profileError);
        return;
      }

      const { department_id } = profile;

      const { data: plans, error: plansError } = await supabase
        .from("plan_monitoring")
        .select(
          `
          is_accomplished,
          action_plan_id,
          profiles!inner(department_id),
          action_plans(actions_taken)
        `
        )
        .eq("profiles.department_id", department_id);

      if (plansError) {
        console.error("Error fetching plans data:", plansError);
        return;
      }

      const total = plans.length;
      const accomplished = plans.filter((plan) => plan.is_accomplished).length;

      setTotalPlans(total);
      setAchievedPlans(accomplished);
    } catch (err) {
      console.error("Unexpected error fetching plans data:", err);
    }
  };

  const fetchOpportunitiesData = async () => {
    if (!profileId) return;

    try {
      const { data: opportunities, error: opportunitiesError } = await supabase
        .from("opt_monitoring")
        .select("is_accomplished, profile_id")
        .eq("profile_id", profileId);

      if (opportunitiesError) {
        console.error("Error fetching opportunities data:", opportunitiesError);
        return;
      }

      const total = opportunities.length;
      const achieved = opportunities.filter(
        (opt) => opt.is_accomplished
      ).length;

      setTotalOpportunities(total);
      setAchievedOpportunities(achieved);
    } catch (err) {
      console.error("Unexpected error fetching opportunities data:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (profileId) {
      fetchOpportunitiesData();
    }
    fetchPlansData();
  }, [profileId]);

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

  const renderDot = (color) => (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: color,
        marginRight: 10,
      }}
    />
  );

  const renderLegendComponent = () => {
    const classificationCounts = riskMonitoring.reduce((acc, item) => {
      const key = item.classification || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const availableClassifications = Object.keys(classificationCounts);

    return (
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          {availableClassifications.slice(0, 4).map((classification) => (
            <View key={classification} style={styles.legendItem}>
              {renderDot(COLORS[classification] || COLORS.Unknown)}
              <Text style={styles.legendText}>
                {classification}: {classificationCounts[classification]}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          {availableClassifications.slice(4).map((classification) => (
            <View key={classification} style={styles.legendItem}>
              {renderDot(COLORS[classification] || COLORS.Unknown)}
              <Text style={styles.legendText}>
                {classification} ({classificationCounts[classification]})
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.mainContainer}>
          <Text style={styles.greetingText}>Hello, {firstName || "User"}</Text>
          <Text style={styles.greetingSub}>Welcome Back!</Text>
        </View>
        <View style={styles.mainContainer}>
          <TouchableOpacity style={styles.risksContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Total Risks</Text>
            </View>
            <View style={styles.pieChartContainer}>
              <PieChart
                donut
                data={getPieData()}
                sectionAutoFocus
                radius={100}
                innerRadius={70}
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
              </View>

              <View style={styles.barGraphContainer}>
                <View style={styles.progressRow}>
                  <Text style={styles.planCount}>
                    {achievedOpportunities}/{totalOpportunities}
                  </Text>
                  <Text style={styles.progressTitle}>Opportunities</Text>
                </View>
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
    paddingBottom: 90,
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
    fontSize: 24,
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
    justifyContent: "space-evenly",
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendText: {
    color: "#FFF",
    fontSize: 12,
  },
});

export default DepartmentDashboard;
