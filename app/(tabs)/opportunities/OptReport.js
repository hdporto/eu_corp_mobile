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
  ALL: "#007bff",
  ACHIEVED: "#5cb85c",
  "NOT ACHIEVED": "#F35454",
};

// Opportunity data from DepartmentOpportunities
const optData = [
  { id: "1", message: "OPPORTUNITY STATEMENT 1", status: "ACHIEVED" },
  { id: "2", message: "OPPORTUNITY STATEMENT 2", status: "ACHIEVED" },
  { id: "3", message: "OPPORTUNITY STATEMENT 3", status: "ACHIEVED" },
  { id: "4", message: "OPPORTUNITY STATEMENT 4", status: "ACHIEVED" },
  { id: "5", message: "OPPORTUNITY STATEMENT 5", status: "ACHIEVED" },
  { id: "6", message: "OPPORTUNITY STATEMENT 6", status: "ACHIEVED" },
  { id: "7", message: "OPPORTUNITY STATEMENT 7", status: "ACHIEVED" },
  { id: "8", message: "OPPORTUNITY STATEMENT 8", status: "NOT ACHIEVED" },
  { id: "9", message: "OPPORTUNITY STATEMENT 9", status: "NOT ACHIEVED" },
  { id: "10", message: "OPPORTUNITY STATEMENT 10", status: "NOT ACHIEVED" },
];

const OptReport = () => {
  const [filter, setFilter] = useState("ALL");

  const filteredOptStatements = optData.filter((item) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  const renderOptDetail = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{item.message}</Text>
        <Feather
          name="check-circle"
          size={24}
          color={item.status === "ACHIEVED" ? "#5cb85c" : "#F35454"}
        />
      </View>
      <Text style={styles.status}>Status: {item.status}</Text>
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
          data={filteredOptStatements}
          renderItem={renderOptDetail}
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
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  status: {
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
});

export default OptReport;
