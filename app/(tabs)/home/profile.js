import {
  Alert,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [departmentName, setDepartmentName] = useState(""); // New state for department name
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
  
      if (session) {
        setEmail(session.user.email);
  
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
  
        if (error) {
          console.error("Error fetching profile:", error.message);
          return;
        }
  
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setProfilePic(data.profile_pic || null);
          setProfileExists(true);
  
          if (data.department_id) {
            // Fetch department name based on department_id
            const { data: departmentData, error: deptError } = await supabase
              .from("departments")
              .select("name")
              .eq("id", data.department_id)
              .single();
  
            if (deptError) {
              console.error("Error fetching department:", deptError.message);
              setDepartmentName("N/A");
              return;
            }
  
            setDepartmentName(departmentData ? departmentData.name : "Unknown");
          } else {
            setDepartmentName("N/A");
          }
        }
      }
    };
  
    loadProfile();
  }, []);
  
  const handleInsert = async () => {
    const { error } = await supabase.from("profiles").insert({
      id: session.user.id,
      first_name: firstName,
      last_name: lastName,
      email: email,
      profile_pic: profilePic,
    });

    if (error) {
      console.error("Error inserting profile:", error.message);
      Alert.alert("Error", "Error adding profile. Please try again.");
      return;
    }

    Alert.alert("Success", "Profile added successfully!");
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        profile_pic: profilePic,
      })
      .eq("id", session.user.id);

    if (error) {
      console.error("Error updating profile:", error.message);
      Alert.alert("Error", "Error updating profile. Please try again.");
      return;
    }

    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleSave = async () => {
    setLoading(true);
    if (profileExists) {
      await handleUpdate();
    } else {
      await handleInsert();
    }
    setLoading(false);
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Error", error.message);
    } else {
      Alert.alert("Logout", "Logged out successfully");
      router.replace("/(auth)/login");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <View style={styles.imageContainer}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profileImage} />
        ) : (
          <Text style={styles.imagePlaceholder}>No profile picture</Text>
        )}
        <TouchableOpacity onPress={pickImage} style={styles.changePicButton}>
          <Text style={styles.changePicText}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          editable={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Department</Text>
        <TextInput
          style={styles.input}
          value={departmentName}
          onChangeText={setDepartmentName}
          editable={false}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Save Profile"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#212121",
    padding: 20,
    paddingBottom: 300,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: "#B0BEC5",
    textAlign: "center",
  },
  changePicButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#009688",
  },
  changePicText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#fff",
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 100,
    backgroundColor: "#dc3545",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
