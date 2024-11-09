import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { supabase, sendNotification } from './supabaseClient';
import useNotifications from './useNotifications';
import { useUser } from '@supabase/auth-helpers-react';

const NotificationsSender = () => {
  const user = useUser();
  const [notifications, setNotifications] = useState([]);

  // Using the custom hook to listen for notifications
  useNotifications(user?.id, setNotifications);

  useEffect(() => {
    const sendNotificationInterval = setInterval(() => {
      if (user) {
        const message = `Notification sent at ${new Date().toLocaleTimeString()}`;
        sendNotification(user.id, message);
      }
    }, 10000); // Send notification every 10 seconds

    return () => clearInterval(sendNotificationInterval); // Cleanup interval
  }, [user]);

  return (
    <View>
      <Text>Notifications will be sent every 10 seconds!</Text>
      {notifications.length > 0 && (
        <View>
          <Text>Recent Notifications:</Text>
          {notifications.map((notif) => (
            <Text key={notif.id}>{notif.message} - {new Date(notif.created_at).toLocaleString()}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default NotificationsSender;
