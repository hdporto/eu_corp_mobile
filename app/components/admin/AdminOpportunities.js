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
    fetchOpportunities();
    fetchDepartments();
  }, []);

  useEffect(() => {
    setPieData(calculatePieData(opportunities));
    setOverallAchievedPercentage(
      calculateOverallAchievedPercentage(opportunities)
    );
  }, [opportunities]);

  const getFilteredOpportunities = (opportunities) => {
    return opportunities.filter((opportunity) => {
      const matchesDepartment =
        selectedDepartment === "all" ||
        opportunity.department_id === selectedDepartment;

      const matchesAchievement =
        achievementFilter === "all"
          ? true
          : achievementFilter === "achieved"
          ? opportunity.is_achieved
          : !opportunity.is_achieved;

      return matchesDepartment && matchesAchievement;
    });
  };

  const calculatePieData = (opportunities) => {
    const achievedCount = opportunities.filter(
      (opportunity) => opportunity.is_achieved
    ).length;
    const totalOpportunities = opportunities.length;

    const achievedPercentage =
      totalOpportunities > 0 ? (achievedCount / totalOpportunities) * 100 : 0;
    const notAchievedPercentage = 100 - achievedPercentage;

    return [
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
    ];
  };

  const getProgressColor = (percentage) => {
    if (percentage <= 24) return "#FF5252";
    if (percentage <= 49) return "#FF9800";
    if (percentage <= 79) return "#FFEB3B";
    return "#4CAF50";
  };

  const calculateOverallAchievedPercentage = (opportunities) => {
    const totalOpportunities = opportunities.length;
    const achievedCount = opportunities.filter(
      (opportunity) => opportunity.is_achieved
    ).length;
    return totalOpportunities > 0
      ? Math.round((achievedCount / totalOpportunities) * 100)
      : 0;
  };

  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from("opt_monitoring")
      .select("id, opt_name, is_achieved, department_id");

    if (error) {
      console.error("Error fetching opportunities:", error);
    } else {
      const enrichedOpportunities = await Promise.all(
        data.map(async (opportunity) => {
          const { data: deptData, error: deptError } = await supabase
            .from("departments")
            .select("id, name")
            .eq("id", opportunity.department_id)
            .single();

          if (deptError) {
            console.error("Error fetching department data:", deptError);
            return { ...opportunity, department_name: "Unknown" };
          }

          return {
            ...opportunity,
            department_name: deptData ? deptData.name : "Unknown",
          };
        })
      );

      setOpportunities(enrichedOpportunities);
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

  const filteredOpportunities = getFilteredOpportunities(opportunities);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.department_name}</Text>
      <Text style={styles.cardText}>Opportunity Name: {item.opt_name}</Text>
      <Text
        style={[
          styles.cardText,
          { color: item.is_achieved ? "#4CAF50" : "#FF5252" },
        ]}
      >
        Status: {item.is_achieved ? "Achieved" : "Not Achieved"}
      </Text>
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
            <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
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
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "white",
    backgroundColor: "#1E1E1E",
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
  card: {
    borderRadius: 8,
    padding: 16,
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
