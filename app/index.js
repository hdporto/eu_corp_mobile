import { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "expo-router";

export default function IndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkSessionAndInsertUser = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("Session data: ", session);

      if (session) {
        const user = session.user;

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error && error.code === "PGRST116") {
            // User doesn't exist, insert new profile
            const { error: insertError } = await supabase
              .from("profiles")
              .insert([{ id: user.id, email: user.email, role: "user" }]);

            if (insertError) {
              Alert.alert(
                "Error",
                "Error adding to profiles table: " + insertError.message
              );
            } else {
              setRole("user");
              Alert.alert("Success", "User added to profiles table");
            }
          } else if (data) {
            setRole(data.role); // Set existing user's role
            console.log("User role: ", role);
          }
          router.replace("/(tabs)/home");
        } catch (error) {
          console.error("Error fetching user role:", error.message);
          Alert.alert("Error", "Error fetching user role");
        } finally {
          setLoading(false);
        }
      } else {
        router.replace("/(auth)/welcome");
        setLoading(false);
      }
    };

    checkSessionAndInsertUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});
