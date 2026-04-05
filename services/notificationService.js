import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_ID_KEY = 'dailyNotificationId';
const NOTIFICATION_HOUR = 9;
const NOTIFICATION_MINUTE = 0;

async function requestPermissions() {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function getLastTransactionDate(userEmail) {
  return AsyncStorage.multiGet(['einnahmen', 'ausgaben']).then(([ein, aus]) => {
    const einnahmen = JSON.parse(ein[1] || '[]');
    const ausgaben = JSON.parse(aus[1] || '[]');
    const all = [...einnahmen, ...ausgaben].filter(t => t.userEmail === userEmail);
    if (all.length === 0) return null;
    const dates = all.map(t => new Date(t.datum).getTime()).filter(d => !isNaN(d));
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates));
  });
}

function formatLastTransactionText(lastDate) {
  if (!lastDate) return 'Du hast noch keine Transaktionen erfasst.';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
  const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Du hast heute eine Transaktion erfasst. Weiter so!';
  if (diffDays === 1) return 'Deine letzte Transaktion war gestern. Alles aktuell?';
  if (diffDays < 7) return `Deine letzte Transaktion war vor ${diffDays} Tagen. Vergiss nichts zu erfassen!`;
  return `Du hast seit ${diffDays} Tagen keine Transaktion erfasst. Schau mal rein!`;
}

export async function planeDailyNotification(userEmail) {
  if (Platform.OS === 'web') return;

  const granted = await requestPermissions();
  if (!granted) return;

  // Alte Benachrichtigung abbrechen
  try {
    const oldId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (oldId) await Notifications.cancelScheduledNotificationAsync(oldId);
  } catch (_) {}

  const lastDate = await getLastTransactionDate(userEmail);
  const body = formatLastTransactionText(lastDate);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'FinanzApp – Tägliche Erinnerung',
      body,
      sound: true,
    },
    trigger: {
      hour: NOTIFICATION_HOUR,
      minute: NOTIFICATION_MINUTE,
      repeats: true,
    },
  });

  await AsyncStorage.setItem(NOTIFICATION_ID_KEY, id);
}

export async function brecheNotificationAb() {
  try {
    const id = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
    }
  } catch (_) {}
}
