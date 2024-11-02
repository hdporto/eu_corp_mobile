import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import useNotifications from "../../../utils/useNotifications";
import NotificationService from "../../../utils/NotificationService";
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotifications,
  supabase,
} from "../../../utils/supabaseClient";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && session.user) {
        const data = await fetchNotifications(session.user.id);
        setNotifications(data);
      }
      setLoading(false);
    };

    loadNotifications();
    NotificationService.registerForPushNotificationsAsync();
  }, []);

  useNotifications(notifications);

  const handleNotificationPress = async (notification) => {
    await markNotificationAsRead(notification.id);
  };

  const handleDeleteNotification = async (notificationId) => {
    const success = await deleteNotifications(notificationId);
    if (success) {
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.notificationCard,
              item.is_read
                ? styles.readNotification
                : styles.unreadNotification,
            ]}
          >
            <TouchableOpacity onPress={() => handleNotificationPress(item)}>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.created_at).toLocaleDateString()}{" "}
                {new Date(item.created_at).toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteNotification(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#212121",
  },
  notificationCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: "#e0f7fa",
  },
  readNotification: {
    backgroundColor: "#fafafa",
  },
  message: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
  deleteButton: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 8,
    backgroundColor: "#ff5252",
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
  },
});
