import React, { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import AdminDashboard from "../../components/admin/AdminDashboard";
import DepartmentDashboard from "../../components/departments/DepartmentDashboard";
import { supabase } from "../../../utils/supabaseClient";

const Index = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (error) throw error;

          setRole(data.role);
          console.log("User role:", data.role);
        }
      } catch (error) {
        console.error("Error fetching role:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return role === "admin" ? <AdminDashboard /> : <DepartmentDashboard />;
};

export default Index;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
