// NotificationService.js
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  notificationListener = null;
  responseListener = null;
  expoPushToken = '';

  async initialize(setNotification) {
    this.expoPushToken = await this.registerForPushNotificationsAsync();
    console.log("Expo Push Token:", this.expoPushToken);

    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });
  }

  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  async schedulePushNotification(message) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Scheduled Notification",
        body: message,
        data: { additionalData: 'This is some extra data' },
      },
      trigger: { seconds: 2 },
    });
  }
}

export default new NotificationService();
