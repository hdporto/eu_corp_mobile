import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import RNPickerSelect from "react-native-picker-select";

const COLORS = {
  All: "#007bff",
  Manpower: "#999999",
  Financial: "#777777",
  Environmental: "#555555",
  Safety: "#111111",
};

const VALUES = {
  MANPOWER: 2,
  FINANCIAL: 3,
  ENVIRONMENTAL: 3,
  SAFETY: 2,
};

const riskStatements = [
  { id: "1", statement: "RRN-CCMS-01", category: "Manpower", flagged: true },
  { id: "2", statement: "RRN-CCMS-02", category: "Financial", flagged: false },
  {
    id: "3",
    statement: "RRN-CCMS-03",
    category: "Environmental",
    flagged: true,
  },
  { id: "4", statement: "RRN-CCMS-04", category: "Safety", flagged: true },
  { id: "5", statement: "RRN-CCMS-05", category: "Manpower", flagged: false },
  { id: "6", statement: "RRN-CCMS-06", category: "Financial", flagged: false },
  {
    id: "7",
    statement: "RRN-CCMS-07",
    category: "Environmental",
    flagged: true,
  },
  {
    id: "8",
    statement: "RRN-CCMS-08",
    category: "Environmental",
    flagged: false,
  },
  { id: "9", statement: "RRN-CCMS-09", category: "Financial", flagged: true },
  { id: "10", statement: "RRN-CCMS-10", category: "Safety", flagged: true },
];

const DepartmentRisks = () => {
  const [filter, setFilter] = useState("All");

  const filteredRiskStatements = riskStatements.filter((item) => {
    if (filter === "All") return true;
    return item.category === filter;
  });

  const getPieData = () => {
    if (filter === "All") {
      return [
        { value: VALUES.MANPOWER, color: COLORS.Manpower, label: "Manpower" },
        {
          value: VALUES.FINANCIAL,
          color: COLORS.Financial,
          label: "Financial",
        },
        {
          value: VALUES.ENVIRONMENTAL,
          color: COLORS.Environmental,
          label: "Environmental",
        },
        { value: VALUES.SAFETY, color: COLORS.Safety, label: "Safety" },
      ];
    }

    const totalValue = VALUES[filter.toUpperCase()];

    return [
      { value: totalValue, color: COLORS[filter], label: filter },
      { value: 10 - totalValue, color: "lightgray", label: "Others" },
    ];
  };

  const renderRiskStatement = ({ item }) => (
    <View>
      <Text style={styles.uploadedText}>
        College of Computing and Multimedia Studies uploaded:
      </Text>
      <View style={styles.riskStatementContainer}>
        <Text style={styles.riskStatementText}>{item.statement}</Text>
        {item.flagged && (
          <Feather
            name="flag"
            size={20}
            color="#F35454"
            style={styles.flagIcon}
          />
        )}
      </View>
      <View style={styles.separator} />
    </View>
  );

  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <View style={styles.pieChartContainer}>
        <View style={styles.dropdownContainer}>
          <RNPickerSelect
            onValueChange={(value) => setFilter(value)}
            items={[
              { label: "All", value: "All" },
              { label: "Manpower", value: "Manpower" },
              { label: "Financial", value: "Financial" },
              { label: "Environmental", value: "Environmental" },
              { label: "Safety", value: "Safety" },
            ]}
            style={pickerSelectStyles}
            placeholder={{ label: "Select a category...", value: null }}
          />
        </View>
        <PieChart
          donut
          data={getPieData()}
          sectionAutoFocus
          radius={120}
          innerRadius={80}
          innerCircleColor={"#323232"}
          centerLabelComponent={() => (
            <View>
              <Feather name="alert-triangle" size={50} color={"#F35454"} />
            </View>
          )}
        />
      </View>

      <View style={styles.listCard}>
        <View style={styles.headerContainer}>
          <Text style={styles.reportTitle}>Risk Report</Text>
          <TouchableOpacity
            onPress={() => router.push("../../risks/RiskReport")}
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
          data={filteredRiskStatements}
          renderItem={renderRiskStatement}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
};

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
  dropdownContainer: {
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  listCard: {
    margin: 20,
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#323232",
    height: 280,
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
    color: "white",
    paddingVertical: 10,
  },
  reportTitle: {
    color: "white",
    fontSize: 20,
  },
  riskStatementContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  riskStatementText: {
    color: "#007bff",
    fontWeight: "bold",
    paddingVertical: 5,
    marginRight: 10,
    flex: 1,
  },
  flagIcon: {
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 5,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#323232",
    width: 250,
  },
  inputAndroid: {
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#323232",
    width: 250,
  },
});

export default DepartmentRisks;
