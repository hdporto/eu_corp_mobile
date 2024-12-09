import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import RNPickerSelect from "react-native-picker-select";
import { supabase } from "../../../utils/supabaseClient";

const COLORS = {
  All: "#F44336",
  Achieved: "#4CAF50",
  Mitigating: "#FF9800",
};

const AdminRisks = () => {
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("All Departments");
  const [riskMonitoring, setRiskMonitoring] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch departments from Supabase
  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase.from("departments").select("*");
      if (error) throw error;

      const departmentOptions = data.map((dept) => ({
        label: dept.name,
        value: dept.name,
      }));
      departmentOptions.unshift({ label: "All Departments", value: "All Departments" });

      setDepartments(departmentOptions);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  // Fetch risk monitoring data
  const fetchRiskMonitoring = async () => {
    try {
      const { data, error } = await supabase
        .from("risk_monitoring")
        .select(`
          id,
          department:department_id (name),
          risks (rrn, risk_statement),
          likelihood_rating:likelihood_rating_id(name),
          severity:severity_id(name),
          control_rating:control_rating_id(name),
          monitoring_rating:monitoring_rating_id(status),
          is_achieved
        `);

      if (error) throw error;

      const transformedData = data.map((item) => ({
        id: item.id,
        department: item.department?.name || "Unknown",
        rrn: item.risks.rrn,
        risk_statement: item.risks.risk_statement,
        likelihood_rating: item.likelihood_rating?.name || "Not Available",
        severity: item.severity?.name || "Not Available",
        control_rating: item.control_rating?.name || "Not Available",
        monitoring_rating: item.monitoring_rating?.status || "Not Available",
        is_achieved: item.is_achieved,
      }));

      setRiskMonitoring(transformedData);
      setFilteredData(transformedData);
    } catch (error) {
      console.error("Error fetching risk monitoring data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle department change
  const handleDepartmentChange = (value) => {
    setDepartment(value);
    if (value === "All Departments") {
      setFilteredData(riskMonitoring);
    } else {
      const filtered = riskMonitoring.filter(
        (item) => item.department === value
      );
      setFilteredData(filtered);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDepartments();
    fetchRiskMonitoring();
  }, []);

  // Generate pie chart data
  const getPieData = () => {
    const achievedCount = filteredData.filter((item) => item.is_achieved).length;
    const mitigatingCount = filteredData.length - achievedCount;

    return [
      { value: achievedCount, color: COLORS.Achieved, label: "Achieved" },
      { value: mitigatingCount, color: COLORS.Mitigating, label: "Mitigating" },
    ];
  };

  // Render each risk item
  const renderRiskItem = ({ item }) => (
    <View style={styles.riskCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.riskTitle}>{item.risk_statement}</Text>
      </View>
      <Text style={styles.riskDetails}>RRN: {item.rrn}</Text>
      <Text style={styles.riskDetails}>Likelihood: {item.likelihood_rating}</Text>
      <Text style={styles.riskDetails}>Severity: {item.severity}</Text>
      <Text style={styles.riskDetails}>Control Rating: {item.control_rating}</Text>
      <Text style={styles.riskDetails}>Monitoring: {item.monitoring_rating}</Text>
      <Text style={styles.riskDetails}>
        Status: {item.is_achieved ? "Achieved" : "Still Mitigating"}
      </Text>
    </View>
  );

  // Render header with pie chart and department filter
  const renderHeader = () => (
    <View>
      <Text style={styles.sectionTitle}>Risk Monitoring</Text>
      <View style={styles.pieChartContainer}>
        <RNPickerSelect
          onValueChange={handleDepartmentChange}
          items={departments}
          style={pickerSelectStyles}
          placeholder={{ label: "Select a department...", value: null }}
        />
        <PieChart
          donut
          data={getPieData()}
          sectionAutoFocus
          radius={130}
          innerRadius={90}
          innerCircleColor={"#1E1E1E"}
          centerLabelComponent={() => (
            <View>
              <Text style={{ color: "#FFF", fontSize: 18 }}>Risks</Text>
            </View>
          )}
        />
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.Achieved }]} />
            <Text style={styles.legendText}>Achieved</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: COLORS.Mitigating }]} />
            <Text style={styles.legendText}>Still Mitigating</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRiskItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            <Text style={styles.emptyText}>No data available.</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#121212", // Full dark background
  },
  pieChartContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1E1E1E",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    marginBottom: 20,
  },
  riskCard: {
    backgroundColor: "#292929",
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  riskDetails: {
    fontSize: 14,
    color: "#BFBFBF",
    marginBottom: 5,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 15,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendText: {
    color: "#FFF",
    marginLeft: 8,
    fontSize: 12,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#FFF",
    fontSize: 16,
    marginTop: 20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    borderRadius: 8,
    color: "#FFF",
    backgroundColor: "#333",
    padding: 12,
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    borderRadius: 8,
    color: "#FFF",
    backgroundColor: "#333",
    padding: 12,
    marginBottom: 10,
  },
});

export default AdminRisks;
