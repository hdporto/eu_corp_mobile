import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const COLORS = {
  All: "#007bff",
  Manpower: "#999999",
  Financial: "#777777",
  Environmental: "#555555",
  Safety: "#111111",
};

const initialRiskStatements = [
  {
    id: "1",
    statement: "RRN-CCMS-01",
    category: "Manpower",
    description: "Lack of skilled personnel for critical operations.",
    severity: "High",
    lastUpdated: "2024-10-28",
    flagged: true,
  },
  {
    id: "2",
    statement: "RRN-CCMS-02",
    category: "Financial",
    description: "Budget cuts impacting project deliverables.",
    severity: "Medium",
    lastUpdated: "2024-10-30",
    flagged: false,
  },
  {
    id: "3",
    statement: "RRN-CCMS-03",
    category: "Environmental",
    description: "Unpredictable weather affecting project timelines.",
    severity: "Medium",
    lastUpdated: "2024-10-27",
    flagged: false,
  },
  {
    id: "4",
    statement: "RRN-CCMS-04",
    category: "Safety",
    description: "Increased risk of injury due to inadequate safety gear.",
    severity: "High",
    lastUpdated: "2024-10-29",
    flagged: true,
  },
  {
    id: "5",
    statement: "RRN-CCMS-05",
    category: "Manpower",
    description: "Overtime hours leading to staff burnout.",
    severity: "Medium",
    lastUpdated: "2024-10-26",
    flagged: false,
  },
  {
    id: "6",
    statement: "RRN-CCMS-06",
    category: "Financial",
    description: "Delayed funding approvals for ongoing projects.",
    severity: "Low",
    lastUpdated: "2024-10-25",
    flagged: false,
  },
  {
    id: "7",
    statement: "RRN-CCMS-07",
    category: "Environmental",
    description: "Potential environmental hazard from waste disposal.",
    severity: "High",
    lastUpdated: "2024-10-28",
    flagged: true,
  },
  {
    id: "8",
    statement: "RRN-CCMS-08",
    category: "Environmental",
    description: "Pollution affecting air quality near the site.",
    severity: "Medium",
    lastUpdated: "2024-10-24",
    flagged: false,
  },
  {
    id: "9",
    statement: "RRN-CCMS-09",
    category: "Financial",
    description: "Unexpected tax liabilities impacting budget.",
    severity: "High",
    lastUpdated: "2024-10-23",
    flagged: true,
  },
  {
    id: "10",
    statement: "RRN-CCMS-10",
    category: "Safety",
    description: "Lack of emergency evacuation plans.",
    severity: "High",
    lastUpdated: "2024-10-22",
    flagged: true,
  },
];

const RiskReport = () => {
  const [filter, setFilter] = useState("All");
  const [riskStatements, setRiskStatements] = useState(initialRiskStatements);

  const filteredRiskStatements = riskStatements.filter((item) => {
    if (filter === "All") return true;
    return item.category === filter;
  });

  const renderRiskDetail = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>
          {item.statement} - {item.category}
        </Text>
        {item.flagged && <Feather name="flag" size={24} color="#F35454" />}
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.severity}>Severity: {item.severity}</Text>
        <Text style={styles.lastUpdated}>Last Updated: {item.lastUpdated}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {Object.keys(COLORS).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                { backgroundColor: COLORS[category] },
              ]}
              onPress={() => setFilter(category)}
            >
              <Text style={styles.filterButtonText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filteredRiskStatements}
          renderItem={renderRiskDetail}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#212121",
  },
  container: {
    padding: 20,
  },
  listContainer: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#323232",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    color: "#007bff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    color: "#e0e0e0",
    fontSize: 16,
    marginBottom: 10,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  severity: {
    color: "#F35454",
    fontWeight: "bold",
  },
  lastUpdated: {
    color: "#e0e0e0",
  },
  filterContainer: {
    flexDirection: "row",
    paddingBottom: 20,
  },
  filterButton: {
    marginHorizontal: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  flagButton: {
    marginLeft: 10, // Add some margin for spacing
  },
});

export default RiskReport;
