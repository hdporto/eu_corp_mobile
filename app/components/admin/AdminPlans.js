import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { BarChart } from "react-native-gifted-charts";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const AdminPlans = () => {
  const pieData = [
    { value: 80, color: "#610000" },
    { value: 20, color: "lightgray" },
  ];

  const plansData = [
    { value: 25, label: "CCMS", color: "#3D0000" },
    { value: 50, label: "CED", color: "#140000" },
    { value: 74, label: "CBA", color: "#660000" },
    { value: 32, label: "CAFA", color: "#520000" },
    { value: 60, label: "CENG", color: "#7A0000" },
    { value: 20, label: "CAS", color: "#610000" },
    { value: 49, label: "CNAHS", color: "#A30000" },
    { value: 20, label: "CCJC", color: "#38060f" },
    { value: 62, label: "CIHTM", color: "#761816" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#212121" }}>
      <View style={styles.mainContainer}>
        <View style={styles.plansChartContainer}>
          <Text style={styles.cardTitle}>Total Plans</Text>
          <BarChart
            barWidth={26}
            noOfSections={3}
            barBorderRadius={4}
            frontColor="gray"
            data={plansData}
            hideRules
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={{ color: "white", fontSize: 16 }}
            xAxisLabelTextStyle={{
              color: "white",
              textAlign: "center",
              fontSize: 11,
            }}
            height={180}
            onPress={(item) => console.log("item", item)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminPlans;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#212121",
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
  plansChartContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#323232",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
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
  cardTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});
