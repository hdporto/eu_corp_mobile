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
  const [accomplishmentFilter, setAccomplishmentFilter] = useState("all");
  const [pieData, setPieData] = useState([]);
  const [overallAccomplishedPercentage, setOverallAccomplishedPercentage] =
    useState(0);

  useEffect(() => {
    fetchPlans();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const departmentFilteredPlans = plans.filter((plan) => {
      return selectedDepartment === "all"
        ? true
        : plan.department_id === selectedDepartment;
    });
    setPieData(calculatePieData(departmentFilteredPlans));

    const totalPlans = departmentFilteredPlans.length;
    const accomplishedCount = departmentFilteredPlans.filter(
      (plan) => plan.is_accomplished
    ).length;
    const accomplishedPercentage =
      totalPlans > 0 ? Math.round((accomplishedCount / totalPlans) * 100) : 0;
    setOverallAccomplishedPercentage(accomplishedPercentage);
  }, [plans, selectedDepartment]);

  const getFilteredPlans = (plans) => {
    let departmentFilteredPlans = plans.filter((plan) => {
      return selectedDepartment === "all"
        ? true
        : plan.department_id === selectedDepartment;
    });

    if (accomplishmentFilter !== "all") {
      departmentFilteredPlans = departmentFilteredPlans.filter((plan) => {
        if (accomplishmentFilter === "accomplished") {
          return plan.is_accomplished === true;
        } else if (accomplishmentFilter === "notAccomplished") {
          return plan.is_accomplished === false;
        }
        return true;
      });
    }
    return departmentFilteredPlans;
  };

  const calculatePieData = (filteredPlans) => {
    const accomplishedCount = filteredPlans.filter(
      (plan) => plan.is_accomplished
    ).length;

    const accomplishedPercentage =
      filteredPlans.length > 0
        ? (accomplishedCount / filteredPlans.length) * 100
        : 0;
    const notAccomplishedPercentage = 100 - accomplishedPercentage;

    const getProgressColor = (percentage) => {
      if (percentage <= 24) return "#FF5252";
      if (percentage <= 49) return "#FF9800";
      if (percentage <= 79) return "#FFEB3B";
      return "#4CAF50";
    };

    return [
      {
        value: accomplishedPercentage,
        color: getProgressColor(accomplishedPercentage),
        label: "Accomplished",
      },
      {
        value: notAccomplishedPercentage,
        color: "#fff",
        label: "Not Accomplished",
      },
    ];
  };

  const fetchPlans = async () => {
    const { data, error } = await supabase.from("plan_monitoring").select(`
        action_plan_id,
        is_accomplished,
        department_id,
        action_plans!inner(actions_taken)
      `);

    if (error) {
      console.error("Error fetching plans:", error);
    } else {
      const enrichedPlans = data.map((plan) => ({
        ...plan,
        department_name: plan.profiles?.departments?.name || "Unknown",
        plan_name:
          plan.action_plans?.actions_taken ||
          `Action Plan ${plan.action_plan_id}`,
      }));

      setPlans(enrichedPlans);

      const totalPlans = enrichedPlans.length;
      const accomplishedCount = enrichedPlans.filter(
        (plan) => plan.is_accomplished
      ).length;
      const accomplishedPercentage =
        totalPlans > 0 ? Math.round((accomplishedCount / totalPlans) * 100) : 0;
      setOverallAccomplishedPercentage(accomplishedPercentage);
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
          innerCircleColor={"#1E1E1E"}
          centerLabelComponent={() => (
            <Text style={styles.centerLabel}>
              {overallAccomplishedPercentage}%
            </Text>
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
              accomplishmentFilter === "all" && styles.activeButton,
            ]}
            onPress={() => setAccomplishmentFilter("all")}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              accomplishmentFilter === "accomplished" && styles.activeButton,
            ]}
            onPress={() => setAccomplishmentFilter("accomplished")}
          >
            <Text style={styles.filterButtonText}>Achieved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              accomplishmentFilter === "notAccomplished" && styles.activeButton,
            ]}
            onPress={() => setAccomplishmentFilter("notAccomplished")}
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
                    { color: item.is_accomplished ? "#4CAF50" : "#FF5252" },
                  ]}
                >
                  Status:{" "}
                  {item.is_accomplished ? "Accomplished" : "Not Accomplished"}
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
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardText: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 10,
  },
  centerLabel: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
});
