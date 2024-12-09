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
  const [totalAchievedPercentage, setTotalAchievedPercentage] = useState(0);
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
      const { data: opportunitiesData, error: opportunitiesError } =
        await supabase
          .from("opt_monitoring")
          .select("is_accomplished, opportunities (opt_statement), profile_id");

      if (opportunitiesError) {
        console.error(
          "Error fetching opportunities data:",
          opportunitiesError.message
        );
        return;
      }

      const filteredOpportunities = [];
      let achievedCount = 0;

      await Promise.all(
        opportunitiesData.map(async (opportunity) => {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("department_id")
            .eq("id", opportunity.profile_id)
            .single();

          if (profileError) {
            console.error(
              "Error fetching profile for opportunity:",
              profileError.message
            );
            return;
          }

          if (profileData && profileData.department_id === departmentId) {
            const optStatement =
              opportunity.opportunities?.opt_statement || "No Statement";

            filteredOpportunities.push({
              ...opportunity,
              opt_statement: optStatement,
            });

            if (opportunity.is_accomplished) achievedCount++;
          }
        })
      );

      setOpportunities(filteredOpportunities);

      const totalOpportunities = filteredOpportunities.length;
      const achievedPercentage =
        totalOpportunities > 0
          ? Math.round((achievedCount / totalOpportunities) * 100)
          : 0;

      setTotalAchievedPercentage(achievedPercentage);

      let achievedColor = "#FF5252";
      if (achievedPercentage > 80) {
        achievedColor = "#4CAF50";
      } else if (achievedPercentage >= 50) {
        achievedColor = "#FFEB3B";
      } else if (achievedPercentage >= 25) {
        achievedColor = "#FF9800";
      }

      setPieData([
        {
          value: achievedCount,
          color: achievedColor,
          label: "Achieved",
        },
        {
          value: totalOpportunities - achievedCount,
          color: "#fff",
          label: "Not Achieved",
        },
      ]);
    } catch (error) {
      console.error("Unexpected error fetching opportunities:", error);
    }
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesAchievement =
      achievementFilter === "all"
        ? true
        : achievementFilter === "achieved"
        ? opportunity.is_accomplished
        : !opportunity.is_accomplished;
    return matchesAchievement;
  });

  const renderOpportunitiesStatement = ({ item }) => (
    <View>
      <Text style={styles.uploadedText}>{item.opt_statement}</Text>
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
            keyExtractor={(item, index) => `${index}-${item.opt_statement}`}
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
    fontSize: 14,
  },
  activeButton: {
    backgroundColor: "#BB86FC",
  },
  arrowIcon: {
    marginLeft: 10,
  },
});
