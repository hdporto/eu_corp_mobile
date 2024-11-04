import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import RNPickerSelect from "react-native-picker-select";

const COLORS = {
  All: "#F44336",
  Manpower: "#F44336",
  Financial: "#FF9800",
  Environmental: "#FFEB3B",
  Safety: "#4CAF50",
};

const departmentData = {
  CCMS: { MANPOWER: 2, FINANCIAL: 3, ENVIRONMENTAL: 3, SAFETY: 2 },
  CENG: { MANPOWER: 4, FINANCIAL: 2, ENVIRONMENTAL: 1, SAFETY: 3 },
  CAFA: { MANPOWER: 1, FINANCIAL: 4, ENVIRONMENTAL: 2, SAFETY: 3 },
};

const AdminRisks = () => {
  const [filter, setFilter] = useState("All");
  const [department, setDepartment] = useState("CCMS");

  const getPieData = () => {
    let selectedData;

    if (department === "All Departments") {
      selectedData = { MANPOWER: 0, FINANCIAL: 0, ENVIRONMENTAL: 0, SAFETY: 0 };

      for (let dept in departmentData) {
        const deptData = departmentData[dept];
        if (deptData) {
          Object.keys(selectedData).forEach((key) => {
            selectedData[key] += deptData[key] || 0;
          });
        }
      }
    } else {
      selectedData = departmentData[department];

      if (!selectedData) {
        selectedData = {
          MANPOWER: 0,
          FINANCIAL: 0,
          ENVIRONMENTAL: 0,
          SAFETY: 0,
        };
      }
    }

    if (!filter || filter === "All") {
      return Object.keys(selectedData).map((key) => {
        const colorKey = key.charAt(0) + key.slice(1).toLowerCase();
        return {
          value: selectedData[key],
          color: COLORS[colorKey],
          label: colorKey.charAt(0) + colorKey.slice(1).toLowerCase(),
        };
      });
    }

    const riskValue = selectedData[filter.toUpperCase()] || 0;
    return [
      { value: riskValue, color: COLORS[filter], label: filter },
      { value: 10 - riskValue, color: "lightgray", label: "Others" },
    ];
  };

  const renderDot = (color) => {
    return (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 30,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
    );
  };

  const renderLegendComponent = () => {
    const selectedData =
      department === "All Departments"
        ? {
            MANPOWER: Object.values(departmentData).reduce(
              (sum, dept) => sum + dept.MANPOWER,
              0
            ),
            FINANCIAL: Object.values(departmentData).reduce(
              (sum, dept) => sum + dept.FINANCIAL,
              0
            ),
            ENVIRONMENTAL: Object.values(departmentData).reduce(
              (sum, dept) => sum + dept.ENVIRONMENTAL,
              0
            ),
            SAFETY: Object.values(departmentData).reduce(
              (sum, dept) => sum + dept.SAFETY,
              0
            ),
          }
        : departmentData[department];

    return (
      <>
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            {renderDot(COLORS.Manpower)}
            <Text style={styles.legendText}>
              Manpower: {selectedData.MANPOWER}
            </Text>
          </View>
          <View style={styles.legendRow}>
            {renderDot(COLORS.Environmental)}
            <Text style={styles.legendText}>
              Environmental: {selectedData.ENVIRONMENTAL}
            </Text>
          </View>
        </View>
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            {renderDot(COLORS.Financial)}
            <Text style={styles.legendText}>
              Financial: {selectedData.FINANCIAL}
            </Text>
          </View>
          <View style={styles.legendRow}>
            {renderDot(COLORS.Safety)}
            <Text style={styles.legendText}>Safety: {selectedData.SAFETY}</Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <ScrollView style={styles.mainContainer}>
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
            placeholder={{ label: "Select a risk type...", value: null }}
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
        {renderLegendComponent()}
      </View>

      <View style={styles.filterCard}>
        <RNPickerSelect
          onValueChange={(value) => setDepartment(value)}
          items={[
            { label: "All Departments", value: "All Departments" },
            { label: "CCMS", value: "CCMS" },
            { label: "CENG", value: "CENG" },
            { label: "CAFA", value: "CAFA" },
          ]}
          style={pickerSelectStyles}
          placeholder={{ label: "Select a department...", value: null }}
        />
      </View>
    </ScrollView>
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
    padding: 20,
    backgroundColor: "#323232",
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    width: "100%",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
    marginRight: 20,
  },
  legendText: {
    color: "#fff",
    fontSize: 12,
  },
  dropdownContainer: {
    width: "80%",
    marginVertical: 10,
  },
  filterCard: {
    backgroundColor: "#323232",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#b9b9b9",
    borderRadius: 4,
    color: "white",
    backgroundColor: "#404040",
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#b9b9b9",
    borderRadius: 4,
    color: "white",
    backgroundColor: "#323232",
  },
});

export default AdminRisks;
