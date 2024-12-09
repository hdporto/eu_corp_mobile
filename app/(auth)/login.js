import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "expo-router";

const AuthScreen = () => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!isLogin) {
        // Registration flow
        if (password !== confirmPassword) {
          setMessage("Passwords do not match.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName, last_name: lastName } },
        });

        if (error) throw new Error(`Registration failed: ${error.message}`);
        const user = data?.user;

        // Add user to `profiles` table
        if (user) {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            role: "user",
            is_verified: false,
          });
          if (profileError) throw new Error("Profile creation failed.");
        }

        Alert.alert(
          "Registration Successful",
          "Please check your email for verification."
        );
      } else {
        // Login flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw new Error(`Login failed: ${error.message}`);
        const user = data?.user;

        // Check verification status
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_verified")
            .eq("id", user.id)
            .single();

          if (profileError || !profile?.is_verified) {
            throw new Error(
              "Account is pending verification. Please verify your email."
            );
          }
          router.push("/(tabs)/home"); // Use the tab route
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isLogin ? "Login" : "Create an Account"}</Text>
      <Text style={styles.subtitle}>
        {isLogin
          ? "Sign in to access your account"
          : "Register to create a new account"}
      </Text>

      {!isLogin && (
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
      />
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? "Login" : "Register"}
          </Text>
        )}
      </TouchableOpacity>

      {message ? <Text style={styles.errorMessage}>{message}</Text> : null}

      <TouchableOpacity
        onPress={() => setIsLogin(!isLogin)}
        style={styles.switchMode}
      >
        <Text style={styles.switchModeText}>
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  halfInput: {
    flex: 0.48,
  },
  button: {
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorMessage: {
    color: "#e53935",
    textAlign: "center",
    marginTop: 10,
  },
  switchMode: {
    marginTop: 20,
    alignItems: "center",
  },
  switchModeText: {
    color: "#6200ee",
    fontSize: 16,
  },
});

export default AuthScreen;
