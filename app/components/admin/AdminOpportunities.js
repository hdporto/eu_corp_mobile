import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "../../../utils/supabaseClient";
import { PieChart } from "react-native-gifted-charts";

const AdminOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [achievementFilter, setAchievementFilter] = useState("all");
  const [pieData, setPieData] = useState([]);
  const [overallAchievedPercentage, setOverallAchievedPercentage] = useState(0);

  useEffect(() => {
    fetchOpportunitiesData();
    fetchDepartments();
  }, []);

  useEffect(() => {
    calculatePieData(opportunities);
  }, [opportunities]);

  const fetchOpportunitiesData = async () => {
    try {
      const { data: opportunities, error: opportunitiesError } = await supabase
        .from("opt_monitoring")
        .select("is_accomplished, profile_id, opportunities (opt_statement)");

      if (opportunitiesError) {
        console.error("Error fetching opportunities data:", opportunitiesError);
        return;
      }

      const enrichedOpportunities = await Promise.all(
        opportunities.map(async (opportunity) => {
          const profileId = opportunity.profile_id;

          if (!profileId) {
            console.error("Missing profile_id for opportunity:", opportunity);
            return {
              ...opportunity,
              department_name: "Unknown",
            };
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
            return {
              ...opportunity,
              department_name: "Unknown",
            };
          }

          const departmentId = profile.department_id;

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
            return {
              ...opportunity,
              department_name: "Unknown",
            };
          }

          return {
            ...opportunity,
            department_name: department.name,
          };
        })
      );

      setOpportunities(enrichedOpportunities.filter((item) => item));
    } catch (err) {
      console.error("Unexpected error fetching opportunities:", err);
    }
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("id, name");

    if (error) {
      console.error("Error fetching departments:", error);
    } else {
      setDepartments(data);
    }
  };

  const calculatePieData = (opportunities) => {
    const achievedCount = opportunities.filter(
      (opportunity) => opportunity.is_accomplished
    ).length;
    const totalOpportunities = opportunities.length;

    const achievedPercentage =
      totalOpportunities > 0 ? (achievedCount / totalOpportunities) * 100 : 0;
    const notAchievedPercentage = 100 - achievedPercentage;

    setOverallAchievedPercentage(Math.round(achievedPercentage));

    const getProgressColor = (percentage) => {
      if (percentage <= 24) return "#FF5252";
      if (percentage <= 49) return "#FF9800";
      if (percentage <= 79) return "#FFEB3B";
      return "#4CAF50";
    };

    setPieData([
      {
        value: achievedPercentage,
        color: getProgressColor(achievedPercentage),
        label: "Achieved",
      },
      {
        value: notAchievedPercentage,
        color: "#fff",
        label: "Not Achieved",
      },
    ]);
  };

  const getFilteredOpportunities = (opportunities) => {
    return opportunities.filter((opportunity) => {
      const matchesDepartment =
        selectedDepartment === "all" ||
        opportunity.department_name === selectedDepartment;

      const matchesAchievement =
        achievementFilter === "all"
          ? true
          : achievementFilter === "achieved"
          ? opportunity.is_accomplished
          : !opportunity.is_accomplished;

      return matchesDepartment && matchesAchievement;
    });
  };

  const filteredOpportunities = getFilteredOpportunities(opportunities);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.department_name}</Text>
      <Text style={styles.cardText}>
        Opportunity Statement: {item.opportunities?.opt_statement || "N/A"}
      </Text>
      <Text
        style={[
          styles.cardText,
          { color: item.is_accomplished ? "#4CAF50" : "#FF5252" },
        ]}
      >
        Status: {item.is_accomplished ? "Achieved" : "Not Achieved"}
      </Text>
    </View>
  );

  const ItemSeparator = () => <View style={styles.separator} />;

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
            <Text style={styles.centerLabel}>{overallAchievedPercentage}%</Text>
          )}
        />
      </View>
      <View style={styles.mainContainer}>
        <Picker
          selectedValue={selectedDepartment}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
        >
          <Picker.Item label="All Departments" value="all" />
          {departments.map((dept) => (
            <Picker.Item key={dept.id} label={dept.name} value={dept.name} />
          ))}
        </Picker>

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
          <FlatList
            data={filteredOpportunities}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.card]}>
                <Text style={styles.cardTitle}>{item.department_name}</Text>
                <Text style={styles.cardText}>
                  Opportunity Statement:{" "}
                  {item.opportunities?.opt_statement || "N/A"}
                </Text>
                <Text
                  style={[
                    styles.cardText,
                    { color: item.is_accomplished ? "#4CAF50" : "#FF5252" },
                  ]}
                >
                  Status: {item.is_accomplished ? "Achieved" : "Not Achieved"}
                </Text>
              </View>
            )}
            ItemSeparatorComponent={ItemSeparator}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminOpportunities;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  pieChartContainer: {
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "white",
    backgroundColor: "#1E1E1E",
  },
  cardsContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    marginBottom: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderColor: "#2E2E2E",
    borderWidth: 1,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
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
  activeButton: {
    backgroundColor: "#BB86FC",
  },
  filterButtonText: {
    color: "white",
    fontSize: 16,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#1E1E1E",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 14,
    color: "#A0A0A0",
  },
  separator: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 10,
  },
  centerLabel: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
});
