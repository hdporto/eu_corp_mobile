import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { PieChart } from "react-native-gifted-charts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const DepartmentPlans = () => {
  const pieData = [
    { value: 80, color: "#610000" },
    { value: 20, color: "lightgray" },
  ];

  const plansData = [
    { id: "1", message: "STRAT. OBJ 1", status: "ACHIEVED" },
    { id: "2", message: "STRAT. OBJ 2", status: "ACHIEVED" },
    { id: "3", message: "STRAT. OBJ 3", status: "ACHIEVED" },
    { id: "4", message: "STRAT. OBJ 4", status: "ACHIEVED" },
    { id: "5", message: "STRAT. OBJ 5", status: "NOT ACHIEVED" },
    { id: "6", message: "STRAT. OBJ 6", status: "NOT ACHIEVED" },
  ];

  const [filter, setFilter] = useState("all");

  const filteredPlans = plansData.filter((plan) => {
    if (filter === "ACHIEVED") {
      return plan.status === "ACHIEVED";
    } else if (filter === "NOT ACHIEVED") {
      return plan.status === "NOT ACHIEVED";
    }
    return true;
  });

  const renderPlansStatement = ({ item }) => {
    return (
      <View>
        <Text style={styles.uploadedText}>{item.message}</Text>
        <Text
          style={[
            styles.plansText,
            { color: item.status === "ACHIEVED" ? "#5cb85c" : "#F35454" },
          ]}
        >
          {item.status}
        </Text>
        <View style={styles.separator} />
      </View>
    );
  };

  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <View style={styles.pieChartContainer}>
        <Text style={styles.title}>Plans</Text>
        <PieChart
          donut
          data={pieData}
          sectionAutoFocus
          radius={120}
          innerRadius={80}
          innerCircleColor={"#323232"}
          centerLabelComponent={() => (
            <>
              <Text style={styles.centerLabel}>80%</Text>
              <Text style={styles.centerSubtitle}>Completed Plans</Text>
            </>
          )}
        />
      </View>

      <View style={styles.filterContainer}>
        {["ALL", "ACHIEVED", "NOT ACHIEVED"].map((item) => {
          let buttonColor = "#007bff";
          if (item === "ACHIEVED") {
            buttonColor = "#5cb85c";
          } else if (item === "NOT ACHIEVED") {
            buttonColor = "#F35454";
          }
          return (
            <View key={item}>
              <TouchableOpacity
                onPress={() => setFilter(item)}
                style={[styles.filterButton, { backgroundColor: buttonColor }]}
              >
                <Text style={styles.filterText}>{item}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.listCard}>
        <View style={styles.headerContainer}>
          <Text style={styles.plansTitle}>Plans Report</Text>
          <TouchableOpacity
            onPress={() => router.push("../../plans/PlansReport")}
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
          data={filteredPlans}
          renderItem={renderPlansStatement}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
};

export default DepartmentPlans;

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
  },
  activeFilter: {
    backgroundColor: "#0056b3",
  },
  filterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  messageContainer: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 16,
    color: "#333",
  },
  notificationStatus: {
    fontSize: 12,
    color: "#007bff",
  },
});
