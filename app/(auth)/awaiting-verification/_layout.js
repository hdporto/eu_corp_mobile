import { StyleSheet, Text, View, Button } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../../utils/supabaseClient";

export default function AwaitingVerificationPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during logout:", error.message);
      return;
    }
    router.replace("/(auth)/welcome");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Account Pending Verification</Text>
      <Text style={styles.description}>
        Your account has been created but is not yet verified by an admin. You
        will not be able to access the app until your account is verified.
      </Text>
      <Text style={styles.note}>
        If you believe this is a mistake, please contact support or the admin.
      </Text>
      <Button title="Logout" onPress={handleLogout} color="#FF5252" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#BBBBBB",
    textAlign: "center",
    marginBottom: 16,
  },
  note: {
    fontSize: 14,
    color: "#FF9800",
    textAlign: "center",
    marginBottom: 32,
  },
});
