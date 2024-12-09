import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { supabase } from "../../../utils/supabaseClient";

const DepartmentPlansScreen = () => {
  const [plans, setPlans] = useState([]);
  const [achievementFilter, setAchievementFilter] = useState("all");
  const [pieData, setPieData] = useState([]);
  const [departmentId, setDepartmentId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (departmentId) {
      fetchPlans();
    }
  }, [departmentId]);

  const loadProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("department_id")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile data:", profileError.message);
          return;
        }

        if (profileData && profileData.department_id) {
          setDepartmentId(profileData.department_id);
        }
      } else {
        console.warn("User is not authenticated.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      if (!departmentId) return;

      const { data: plansData, error: plansError } = await supabase
        .from("plan_monitoring")
        .select(
          `
          action_plan_id,
          is_accomplished,
          profiles!inner(department_id),
          action_plans(actions_taken)
        `
        )
        .eq("profiles.department_id", departmentId);

      if (plansError) {
        console.error("Error fetching plan monitoring data:", plansError);
        return;
      }

      const enrichedPlans = plansData.map((plan) => ({
        ...plan,
        plan_name:
          plan.action_plans?.actions_taken ||
          `Action Plan ${plan.action_plan_id}`,
      }));

      setPlans(enrichedPlans);
      setPieData(calculatePieData(enrichedPlans));
    } catch (error) {
      console.error("Unexpected error fetching plan monitoring data:", error);
    }
  };

  const calculatePieData = (allPlans) => {
    const achievedCount = allPlans.filter(
      (plan) => plan.is_accomplished
    ).length;
    const notAchievedCount = allPlans.length - achievedCount;

    const totalPlans = allPlans.length;
    const achievedPercentage =
      totalPlans > 0 ? (achievedCount / totalPlans) * 100 : 0;

    let color = "#FF5252";
    if (achievedPercentage > 80) {
      color = "#4CAF50";
    } else if (achievedPercentage >= 50) {
      color = "#FFEB3B";
    } else if (achievedPercentage >= 26) {
      color = "#FF9800";
    }

    return [
      { value: achievedCount, color: color, label: "Achieved" },
      { value: notAchievedCount, color: "#fff", label: "Not Achieved" },
    ];
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesAchievement =
      achievementFilter === "all"
        ? true
        : achievementFilter === "achieved"
        ? plan.is_accomplished
        : !plan.is_accomplished;
    return matchesAchievement;
  });

  const totalAchievedPercentage =
    plans.length > 0
      ? Math.round(
          (plans.filter((plan) => plan.is_accomplished).length / plans.length) *
            100
        )
      : 0;

  const renderPlansStatement = ({ item }) => {
    const uniqueKey = `${item.action_plan_id}`;
    return (
      <View key={uniqueKey}>
        <Text style={styles.uploadedText}>{item.plan_name}</Text>
        <Text
          style={[
            styles.plansText,
            { color: item.is_accomplished ? "#4CAF50" : "#FF5252" },
          ]}
        >
          {item.is_accomplished ? "Achieved" : "Not Achieved"}
        </Text>
        <View style={styles.separator} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pieChartContainer}>
        <Text style={styles.title}>Plans</Text>
        <PieChart
          donut
          data={pieData}
          sectionAutoFocus
          radius={80}
          innerRadius={60}
          innerCircleColor={"#1E1E1E"}
          centerLabelComponent={() => (
            <>
              <Text style={styles.centerLabel}>{totalAchievedPercentage}%</Text>
              <Text style={styles.centerSubtitle}>Completed Plans</Text>
            </>
          )}
        />
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              achievementFilter === "all" && styles.activeButton,
            ]}
            onPress={() => setAchievementFilter("all")}
          >
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              achievementFilter === "achieved" && styles.activeButton,
            ]}
            onPress={() => setAchievementFilter("achieved")}
          >
            <Text style={styles.filterText}>Achieved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              achievementFilter === "notAchieved" && styles.activeButton,
            ]}
            onPress={() => setAchievementFilter("notAchieved")}
          >
            <Text style={styles.filterText}>Not Achieved</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardsContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.plansTitle}>Plans Report</Text>
            <TouchableOpacity
              onPress={() => router.push("../../plans/PlansReport")}
            >
              <MaterialIcons
                name="keyboard-double-arrow-right"
                size={24}
                color="#BB86FC"
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredPlans}
            renderItem={renderPlansStatement}
            keyExtractor={(item) => `${item.action_plan_id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DepartmentPlansScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  pieChartContainer: {
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  centerLabel: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  centerSubtitle: {
    fontSize: 10,
    color: "#fff",
    textAlign: "center",
  },
  cardsContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    marginBottom: 55,
    elevation: 5,
    borderColor: "#2E2E2E",
    borderWidth: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadedText: {
    color: "#fff",
    paddingVertical: 10,
  },
  plansTitle: {
    color: "#BB86FC",
    fontSize: 20,
  },
  plansText: {
    fontWeight: "bold",
    paddingVertical: 5,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 5,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 18,
  },
  filterButton: {
    paddingHorizontal: 24,
    marginHorizontal: 5,
    backgroundColor: "#1E1E1E",
    borderRadius: 5,
    alignItems: "center",
    borderColor: "#2E2E2E",
    borderWidth: 1,
  },
  filterText: {
    color: "white",
    fontSize: 14,
  },
  activeButton: {
    backgroundColor: "#BB86FC",
  },
  arrowIcon: {
    marginLeft: 10,
  },
});
