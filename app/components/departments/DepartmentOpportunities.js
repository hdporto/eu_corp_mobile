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
  }, [departmentId, achievementFilter]);

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

      const { data: opportunitiesData, error: opportunitiesError } = await supabase
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

  const calculatePieData = (filteredOpportunities) => {
    const achievedCount = filteredOpportunities.filter((opportunity) => opportunity.is_achieved).length;
    const notAchievedCount = filteredOpportunities.length - achievedCount;

    return [
      { value: achievedCount, color: "#4CAF50", label: "Achieved" },
      { value: notAchievedCount, color: "#FF5252", label: "Not Achieved" },
    ];
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesAchievement =
      achievementFilter === "all"
        ? true
        : achievementFilter === "achieved"
        ? opportunity.is_achieved
        : !opportunity.is_achieved;
    return matchesAchievement;
  });

  const totalOpportunities = filteredOpportunities.length;
  const achievedCount = filteredOpportunities.filter((opportunity) => opportunity.is_achieved).length;
  const achievedPercentage =
    totalOpportunities > 0 ? Math.round((achievedCount / totalOpportunities) * 100) : 0;

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
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.pieChartContainer}>
        <Text style={styles.title}>Department Opportunities</Text>
        <PieChart
          donut
          data={pieData}
          sectionAutoFocus
          radius={120}
          innerRadius={80}
          innerCircleColor={"#323232"}
          centerLabelComponent={() => (
            <>
              <Text style={styles.centerLabel}>{achievedPercentage}%</Text>
              <Text style={styles.centerSubtitle}>Completed Opportunities</Text>
            </>
          )}
        />
      </View>

      <View style={styles.filterContainer}>
        {["all", "achieved", "notAchieved"].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setAchievementFilter(item)}
            style={[
              styles.filterButton,
              achievementFilter === item && styles.activeButton,
            ]}
          >
            <Text style={styles.filterButtonText}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.listCard}>
        <View style={styles.headerContainer}>
          <Text style={styles.plansTitle}>Opportunities Report</Text>
          <TouchableOpacity
            onPress={() => router.push("../../opportunities/OpportunitiesReport")}
          >
            <MaterialIcons
              name="keyboard-double-arrow-right"
              size={24}
              color="white"
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
    </SafeAreaView>
  );
};

export default DepartmentOpportunities;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#212121",
    flex: 1,
  },
  pieChartContainer: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#323232",
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
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  centerSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  listCard: {
    margin: 20,
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#323232",
    height: 256,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
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
    color: "white",
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
    justifyContent: "center",
    marginVertical: 3,
  },
  filterButton: {
    marginHorizontal: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#3b3b3b",
  },
  activeButton: {
    backgroundColor: "#5a5a5a",
  },
  filterButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  arrowIcon: {
    marginLeft: 10,
  },
});
