import {
  Alert,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [departmentName, setDepartmentName] = useState("");
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
            const { data: departmentData, error: deptError } = await supabase
              .from("departments")
              .select("full_name")
              .eq("id", data.department_id)
              .single();

            if (deptError) {
              console.error("Error fetching department:", deptError.message);
              setDepartmentName("N/A");
              return;
            }

            setDepartmentName(
              departmentData ? departmentData.full_name : "Unknown"
            );
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
      const selectedImage = result.assets[0];

      const fileName = selectedImage.uri.split("/").pop();
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(`public/${session.user.id}/${fileName}`, {
          uri: selectedImage.uri,
          name: fileName,
          type: selectedImage.type || "image/jpeg",
        });

      if (error) {
        console.error("Error uploading image:", error.message);
        Alert.alert("Error", "Failed to upload image. Please try again.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(`public/${session.user.id}/${fileName}`);

      if (publicUrlData && publicUrlData.publicUrl) {
        setProfilePic(publicUrlData.publicUrl);
        await handleSave();
      } else {
        console.error("Error retrieving public URL");
        Alert.alert("Error", "Failed to retrieve image URL. Please try again.");
      }
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons
              name="keyboard-double-arrow-left"
              size={24}
              color="#BB86FC"
            />
          </TouchableOpacity>
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
    </KeyboardAvoidingView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 10,
    backgroundColor: "#1E1E1E",
    borderRadius: 50,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
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
    paddingHorizontal: 16,
    backgroundColor: "#BB86FC",
    borderRadius: 30,
  },
  changePicText: {
    color: "#121212",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#B0BEC5",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#BB86FC",
    borderRadius: 4,
    padding: 10,
    color: "#fff",
    backgroundColor: "#1E1E1E",
  },
  button: {
    backgroundColor: "#BB86FC",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: "#121212",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#FF3D00",
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
