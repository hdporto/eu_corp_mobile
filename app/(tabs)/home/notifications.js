import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useNotifications from "../../../utils/useNotifications";
import NotificationService from "../../../utils/NotificationService";
import {
  fetchNotifications,
  markNotificationAsRead,
  deleteNotifications,
  supabase,
} from "../../../utils/supabaseClient";

const Notifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
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
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
    );
  };

  const handleDeleteNotification = async (notificationId) => {
    const success = await deleteNotifications(notificationId);
    if (success) {
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const groupNotificationsByDate = (notifications) => {
    const grouped = {};

    notifications.forEach((notification) => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      let dateString;

      if (date.toDateString() === today.toDateString()) {
        dateString = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateString = "Yesterday";
      } else {
        dateString = date.toLocaleDateString();
      }

      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(notification);
    });

    return grouped;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  const groupedNotifications = groupNotificationsByDate(notifications);
  const groupedKeys = Object.keys(groupedNotifications);

  return (
    <View style={styles.container}>
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
      </View>

      <FlatList
        data={groupedKeys}
        keyExtractor={(item) => item}
        renderItem={({ item: dateKey }) => (
          <View>
            <Text style={styles.dateHeader}>{dateKey}</Text>
            {groupedNotifications[dateKey].map((item) => (
              <View
                key={item.id}
                style={[
                  styles.notificationCard,
                  item.is_read
                    ? styles.readNotification
                    : styles.unreadNotification,
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleNotificationPress(item)}
                  style={styles.notificationContent}
                >
                  <Ionicons
                    name={
                      item.is_read ? "notifications-outline" : "notifications"
                    }
                    size={24}
                    color={item.is_read ? "#B0BEC5" : "#BB86FC"}
                    style={styles.notificationIcon}
                  />
                  <View style={styles.notificationText}>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.timestamp}>
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteNotification(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#121212",
    marginBottom: 50,
  },
  loadingText: {
    fontSize: 18,
    color: "#ddd",
    textAlign: "center",
    marginTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#1E1E1E",
    borderRadius: 50,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#fff",
  },
  notificationCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: "#1E1E1E",
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#BB86FC",
  },
  readNotification: {
    backgroundColor: "#1E1E1E",
  },
  notificationContent: {
    flexDirection: "row",
    flex: 1,
  },
  notificationIcon: {
    marginRight: 10,
  },
  notificationText: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: "#fff",
  },
  timestamp: {
    fontSize: 12,
    color: "#bbb",
    marginTop: 4,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF5252",
    borderRadius: 50,
    width: 30,
    height: 30,
  },
});
