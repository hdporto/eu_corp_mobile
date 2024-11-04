import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "../../utils/supabaseClient";
import { LinearGradient } from "expo-linear-gradient"; // Gradient background

WebBrowser.maybeCompleteAuthSession();
const redirectTo = makeRedirectUri();

const createSessionFromUrl = async (url) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) {
    console.error("Error parsing URL params:", errorCode);
    throw new Error(errorCode);
  }
  const { access_token, refresh_token } = params;
  if (!access_token) return;
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  return data.session;
};

const sendMagicLink = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
};

const Index = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const url = Linking.useURL();

  useEffect(() => {
    const handleUrlChange = async ({ url }) => {
      if (url) {
        try {
          await createSessionFromUrl(url);
        } catch (error) {
          console.error("Session Creation Error:", error);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleUrlChange);
    Linking.getInitialURL().then((url) => url && handleUrlChange({ url }));
    return () => subscription.remove();
  }, []);

  const handleMagicLink = async () => {
    setLoading(true);
    try {
      await sendMagicLink(email);
      Alert.alert("Check your email", "Magic link sent!");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FFDEE9", "#B5FFFC"]} style={styles.gradient}>
      <View style={styles.container}>
        <Image source={require("../../assets/login.png")} style={styles.logo} />
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Login Here</Text>
          <Text style={styles.subText}>Enter your email to log in</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#626262"
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleMagicLink}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.loginText}>Log In</Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default Index;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 100,
    opacity: 0.9,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  subText: {
    fontSize: 18,
    color: "#626262",
    marginTop: 5,
  },
  inputContainer: {
    width: "80%",
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  input: {
    height: 40,
    flex: 1,
    color: "#333",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#990f02",
    width: "80%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
