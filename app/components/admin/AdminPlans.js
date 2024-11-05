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

const PlansScreen = () => {
  const [plans, setPlans] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [achievementFilter, setAchievementFilter] = useState("all");
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    fetchPlans();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const filteredPlans = getFilteredPlans(plans);
    setPieData(calculatePieData(filteredPlans));
  }, [plans, selectedDepartment, achievementFilter]);

  const getFilteredPlans = (plans) => {
    return plans.filter((plan) => {
      const matchesDepartment =
        selectedDepartment === "all"
          ? true
          : plan.department_id === selectedDepartment;

      const matchesAchievement =
        achievementFilter === "all"
          ? true
          : achievementFilter === "achieved"
          ? plan.is_achieved
          : !plan.is_achieved;

      return matchesDepartment && matchesAchievement;
    });
  };

  const calculatePieData = (filteredPlans) => {
    const achievedCount = filteredPlans.filter(
      (plan) => plan.is_achieved
    ).length;
    const notAchievedCount = filteredPlans.length - achievedCount;

    return [
      {
        value: achievedCount,
        color: "#4CAF50", // Green color for achieved
        label: "Achieved",
      },
      {
        value: notAchievedCount,
        color: "#FF5252", // Red color for not achieved
        label: "Not Achieved",
      },
    ];
  };

  const fetchPlans = async () => {
    const { data, error } = await supabase
      .from("plans_monitoring")
      .select("department_id, plan_name, is_achieved");

    if (error) {
      console.error("Error fetching plans:", error);
    } else {
      const enrichedPlans = await Promise.all(
        data.map(async (plan) => {
          const { data: deptData, error: deptError } = await supabase
            .from("departments")
            .select("id, name")
            .eq("id", plan.department_id)
            .single();

          if (deptError) {
            console.error("Error fetching department data:", deptError);
            return { ...plan, department_name: "Unknown" };
          }

          return {
            ...plan,
            department_name: deptData ? deptData.name : "Unknown",
          };
        })
      );

      setPlans(enrichedPlans);
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

  const filteredPlans = getFilteredPlans(plans);

  const totalPlans = filteredPlans.length;
  const achievedCount = filteredPlans.filter((plan) => plan.is_achieved).length;
  const achievedPercentage =
    totalPlans > 0 ? Math.round((achievedCount / totalPlans) * 100) : 0;

  const ItemSeparator = () => <View style={styles.separator} />;

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
          innerCircleColor={"#323232"}
          centerLabelComponent={() => (
            <Text style={styles.centerLabel}>{achievedPercentage}%</Text>
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
            data={filteredPlans}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.card]}>
                <Text style={styles.cardTitle}>{item.department_name}</Text>
                <Text style={styles.cardText}>Plan Name: {item.plan_name}</Text>
                <Text
                  style={[
                    styles.cardText,
                    { color: item.is_achieved ? "#4CAF50" : "#FF5252" },
                  ]}
                >
                  Status: {item.is_achieved ? "Achieved" : "Not Achieved"}
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

export default PlansScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
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
  picker: {
    height: 50,
    width: "100%",
    color: "white",
    backgroundColor: "#323232",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  filterButton: {
    paddingHorizontal: 24,
    marginHorizontal: 5,
    backgroundColor: "#3b3b3b",
    borderRadius: 5,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#5a5a5a",
  },
  filterButtonText: {
    color: "white",
    fontSize: 16,
  },
  cardsContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    marginBottom: 50,
  },
  card: {
    borderRadius: 8,
    padding: 16,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    marginBottom: 5,
    fontWeight: "bold",
  },
  cardText: {
    color: "white",
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 10,
  },
  centerLabel: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
