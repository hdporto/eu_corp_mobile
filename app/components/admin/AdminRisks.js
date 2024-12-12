import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { supabase } from "../../../utils/supabaseClient";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Entypo from "@expo/vector-icons/Entypo";
import { Picker } from "@react-native-picker/picker";

const COLORS = {
  Manpower: "#FF5722",
  Financial: "#3F51B5",
  Industrial: "#9C27B0",
  Acads: "#4CAF50",
  Operational: "#FFC107",
  "Social/Behavior": "#E91E63",
};

const AdminRisks = () => {
  const [riskMonitoring, setRiskMonitoring] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [achievedFilter, setAchievedFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [showClassificationModal, setShowClassificationModal] = useState(false);

  const handleClassificationFilter = (classification) => {
    if (classification === activeFilter) {
      setFilteredData(riskMonitoring);
      setActiveFilter(null);
    } else {
      const filtered = riskMonitoring.filter(
        (item) => item.classification === classification
      );
      setFilteredData(filtered);
      setActiveFilter(classification);
    }
    setShowClassificationModal(false);
  };

  const fetchRiskMonitoring = async () => {
    try {
      const { data, error } = await supabase.from("risk_monitoring").select(
        `id,
          risks (
            rrn,
            risk_statement,
            classification:classification(name)
          ),
          likelihood_rating:likelihood_rating_id(name),
          severity:severity_id(name),
          control_rating:control_rating_id(name),
          monitoring_rating:monitoring_rating_id(status),
          is_achieved`
      );

      if (error) throw error;

      const transformedData = data.map((item) => ({
        id: item.id,
        rrn: item.risks?.rrn || "N/A",
        risk_statement: item.risks?.risk_statement || "No statement available",
        classification: item.risks?.classification?.name || "Unknown",
        likelihood_rating: item.likelihood_rating?.name || "N/A",
        severity: item.severity?.name || "N/A",
        control_rating: item.control_rating?.name || "N/A",
        monitoring_rating: item.monitoring_rating?.status || "N/A",
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

  useEffect(() => {
    fetchRiskMonitoring();
    fetchDepartments();
  }, []);

  const getPieData = () => {
    const classificationCounts = riskMonitoring.reduce((acc, item) => {
      const key = item.classification || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(classificationCounts).map(([key, value]) => ({
      value,
      color: COLORS[key] || COLORS.Unknown,
      label: key,
    }));
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

  const handleFilterChange = (status) => {
    setAchievedFilter(status);
    setActiveFilter(status);
    if (status === null) {
      setFilteredData(riskMonitoring);
    } else {
      const filtered = riskMonitoring.filter(
        (item) => item.is_achieved === status
      );
      setFilteredData(filtered);
    }
  };

  const renderDot = (color) => (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginRight: 10,
      }}
    />
  );

  const renderLegendComponent = () => {
    const classificationCounts = riskMonitoring.reduce((acc, item) => {
      const key = item.classification || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const availableClassifications = Object.keys(classificationCounts);

    return (
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          {availableClassifications.slice(0, 4).map((classification) => (
            <View key={classification} style={styles.legendItem}>
              {renderDot(COLORS[classification] || COLORS.Unknown)}
              <Text style={styles.legendText}>
                {classification}: {classificationCounts[classification]}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          {availableClassifications.slice(4).map((classification) => (
            <View key={classification} style={styles.legendItem}>
              {renderDot(COLORS[classification] || COLORS.Unknown)}
              <Text style={styles.legendText}>
                {classification} ({classificationCounts[classification]})
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const classificationIcons = {
    Manpower: <FontAwesome5 name="fist-raised" size={24} color="#BB86FC" />,
    Financial: <FontAwesome5 name="money-bill" size={24} color="#BB86FC" />,
    Industrial: <FontAwesome5 name="hammer" size={24} color="#BB86FC" />,
    Acads: <FontAwesome5 name="book" size={24} color="#BB86FC" />,
    Operational: <FontAwesome6 name="gear" size={24} color="#BB86FC" />,
    "Social/Behavior": (
      <MaterialIcons name="people-alt" size={24} color="#BB86FC" />
    ),
  };

  const renderRiskItem = ({ item }) => (
    <TouchableOpacity
      style={styles.riskCard}
      onPress={() => setSelectedRisk(item)}
    >
      <View style={styles.riskHeader}>
        <Text style={styles.riskTitle}>{item.risk_statement}</Text>
        <View style={styles.iconContainer}>
          {classificationIcons[item.classification] ||
            classificationIcons.Unknown}
        </View>
      </View>

      <Text style={styles.riskDetails}>RRN: {item.rrn}</Text>
      <Text style={styles.riskDetails}>
        Classification: {item.classification}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FFF" />
      ) : (
        <>
          <View style={styles.pieChartContainer}>
            <Text style={styles.title}>Risks</Text>
            <PieChart
              donut
              data={getPieData()}
              sectionAutoFocus
              radius={80}
              innerRadius={60}
              innerCircleColor={"#1E1E1E"}
              centerLabelComponent={() => (
                <TouchableOpacity
                  onPress={() => setShowClassificationModal(true)}
                >
                  <SimpleLineIcons name="options" size={24} color="#BB86FC" />
                </TouchableOpacity>
              )}
            />
            {renderLegendComponent()}
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
                  activeFilter === null && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterChange(null)}
              >
                <Text style={styles.filterText}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  activeFilter === true && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterChange(true)}
              >
                <Text style={styles.filterText}>Achieved</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  activeFilter === false && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterChange(false)}
              >
                <Text style={styles.filterText}>Still Mitigating</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={renderRiskItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No risks found for your department.
                </Text>
              }
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </View>

          <Modal
            visible={showClassificationModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowClassificationModal(false)}
          >
            <TouchableOpacity
              style={styles.modalBackground}
              onPress={() => setShowClassificationModal(false)}
              activeOpacity={1}
            >
              <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Filter by Classification</Text>
                <ScrollView contentContainerStyle={styles.modalScroll}>
                  {Object.entries(COLORS).map(([classification, color]) => (
                    <TouchableOpacity
                      key={classification}
                      style={[
                        styles.classificationFilterButton,
                        classification === activeFilter &&
                          styles.activeClassificationButton,
                      ]}
                      onPress={() => handleClassificationFilter(classification)}
                    >
                      <View style={styles.modalIconContainer}>
                        {classificationIcons[classification] ||
                          classificationIcons.Unknown}
                      </View>
                      <Text
                        style={[
                          styles.classificationFilterText,
                          classification === activeFilter &&
                            styles.activeClassificationText,
                        ]}
                      >
                        {classification}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          <Modal
            visible={selectedRisk !== null}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setSelectedRisk(null)}
          >
            <TouchableOpacity
              style={styles.modalBackground}
              onPress={() => setSelectedRisk(null)}
              activeOpacity={1}
            >
              <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
                <ScrollView>
                  <Text style={styles.modalTitle}>
                    {selectedRisk?.risk_statement}
                  </Text>
                  <Text style={styles.modalText}>RRN: {selectedRisk?.rrn}</Text>
                  <Text style={styles.modalText}>
                    Classification: {selectedRisk?.classification}
                  </Text>
                  <Text style={styles.modalText}>
                    Likelihood: {selectedRisk?.likelihood_rating}
                  </Text>
                  <Text style={styles.modalText}>
                    Severity: {selectedRisk?.severity}
                  </Text>
                  <Text style={styles.modalText}>
                    Control Rating: {selectedRisk?.control_rating}
                  </Text>
                  <Text style={styles.modalText}>
                    Monitoring: {selectedRisk?.monitoring_rating}
                  </Text>
                  <Text style={styles.modalText}>
                    Status:{" "}
                    {selectedRisk?.is_achieved
                      ? "Achieved"
                      : "Still Mitigating"}
                  </Text>
                  <MaterialIcons name="rectangle" size={24} color="black" />
                  <Entypo name="arrow-bold-right" size={24} color="black" />
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  pieChartContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1E1E1E",
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  legendContainer: {
    marginTop: 20,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendText: {
    color: "#FFF",
    fontSize: 12,
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
    marginVertical: 16,
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
  activeFilterButton: {
    backgroundColor: "#BB86FC",
  },
  filterText: {
    color: "#FFF",
    fontSize: 14,
  },
  riskCard: {
    flex: 1,
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    borderColor: "#2E2E2E",
    borderWidth: 1,
  },
  riskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  riskDetails: {
    color: "#BBB",
    fontSize: 14,
  },
  emptyText: {
    color: "#BBB",
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    backgroundColor: "#1E1E1E",
    borderColor: "#2E2E2E",
    borderWidth: 1,
    padding: 20,
    borderRadius: 8,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#BB86FC",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    color: "white",
  },
  modalTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  modalIconContainer: {
    marginRight: 10,
  },
  modalScroll: {
    paddingVertical: 10,
    alignItems: "flex-start",
  },
  classificationFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#2E2E2E",
    borderRadius: 8,
    width: "100%",
  },
  activeClassificationButton: {
    backgroundColor: "#1E1E1E",
    borderColor: "#BB86FC",
  },
  classificationFilterText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#FFF",
  },
  activeClassificationText: {
    color: "#fff",
  },
});

export default AdminRisks;
