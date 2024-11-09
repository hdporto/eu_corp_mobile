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

const DepartmentOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [achievementFilter, setAchievementFilter] = useState("all");
  const [pieData, setPieData] = useState([]);
  const [departmentId, setDepartmentId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (departmentId) {
      fetchOpportunities();
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

  const fetchOpportunities = async () => {
    try {
      if (!departmentId) return;

      const { data: opportunitiesData, error: opportunitiesError } =
        await supabase
          .from("opt_monitoring")
          .select("department_id, opt_name, is_achieved")
          .eq("department_id", departmentId);

      if (opportunitiesError) {
        console.error("Error fetching opportunities:", opportunitiesError);
        return;
      }

      setOpportunities(opportunitiesData || []);
      setPieData(calculatePieData(opportunitiesData));
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const calculatePieData = (allPlans) => {
    const achievedCount = allPlans.filter((plan) => plan.is_achieved).length;
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

  const totalOpportunities = opportunities.length;
  const totalAchievedCount = opportunities.filter(
    (opportunity) => opportunity.is_achieved
  ).length;
  const totalAchievedPercentage =
    totalOpportunities > 0
      ? Math.round((totalAchievedCount / totalOpportunities) * 100)
      : 0;

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesAchievement =
      achievementFilter === "all"
        ? true
        : achievementFilter === "achieved"
        ? opportunity.is_achieved
        : !opportunity.is_achieved;
    return matchesAchievement;
  });

  const renderOpportunitiesStatement = ({ item }) => {
    const uniqueKey = `${item.department_id}-${item.opt_name}`;
    return (
      <View key={uniqueKey}>
        <Text style={styles.uploadedText}>{item.opt_name}</Text>
        <Text
          style={[
            styles.plansText,
            { color: item.is_achieved ? "#4CAF50" : "#FF5252" },
          ]}
        >
          {item.is_achieved ? "Achieved" : "Not Achieved"}
        </Text>
        <View style={styles.separator} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pieChartContainer}>
        <Text style={styles.title}>Opportunities</Text>
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
              <Text style={styles.centerSubtitle}>Completed Opportunities</Text>
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
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              achievementFilter === "achieved" && styles.activeButton,
            ]}
            onPress={() => setAchievementFilter("achieved")}
          >
            <Text style={styles.filterButtonText}>Achieved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              achievementFilter === "notAchieved" && styles.activeButton,
            ]}
            onPress={() => setAchievementFilter("notAchieved")}
          >
            <Text style={styles.filterButtonText}>Not Achieved</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.plansTitle}>Opportunities Report</Text>
            <TouchableOpacity
              onPress={() => router.push("../../opportunities/OptReport")}
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
            data={filteredOpportunities}
            renderItem={renderOpportunitiesStatement}
            keyExtractor={(item) => `${item.department_id}-${item.opt_name}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DepartmentOpportunities;

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
  filterButtonText: {
    color: "white",
    fontSize: 16,
  },
  activeButton: {
    backgroundColor: "#BB86FC",
  },
  arrowIcon: {
    marginLeft: 10,
  },
});
