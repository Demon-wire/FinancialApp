import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import TransactionsScreen from './screens/TransactionsScreen';
import StatistikScreen from './screens/StatistikScreen';
import EinstellungenScreen from './screens/EinstellungenScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

import AbosScreen from './screens/AbosScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs({ onLogout }) {
  const { currentTheme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Transaktionen') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Statistik') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Abos') {
            iconName = focused ? 'repeat' : 'repeat-outline';
          } else if (route.name === 'Einstellungen') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Transaktionen" component={TransactionsScreen} />
      <Tab.Screen name="Statistik" component={StatistikScreen} />
      <Tab.Screen name="Abos" component={AbosScreen} />
      <Tab.Screen name="Einstellungen">
        {(props) => <EinstellungenScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      verarbeiteAbos();
    }
  }, [isLoggedIn]);

  const verarbeiteAbos = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) return;
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      const gespeicherteAbosJson = await AsyncStorage.getItem('abos');
      const abos = gespeicherteAbosJson ? JSON.parse(gespeicherteAbosJson) : [];
      const userAbos = abos.filter(abo => abo.userEmail === userEmail);

      const gespeicherteAusgabenJson = await AsyncStorage.getItem('ausgaben');
      const ausgaben = gespeicherteAusgabenJson ? JSON.parse(gespeicherteAusgabenJson) : [];

      const heute = new Date();
      let hasChanged = false;

      for (const abo of userAbos) {
        const lastProcessed = new Date(abo.lastProcessed);
        if (
          heute.getFullYear() > lastProcessed.getFullYear() ||
          heute.getMonth() > lastProcessed.getMonth()
        ) {
          const neueAusgabe = {
            id: Date.now().toString() + abo.id,
            betrag: abo.betrag,
            kategorie: 'Abo',
            notiz: `Abo: ${abo.name}`,
            datum: heute.toISOString(),
            userEmail: userEmail,
          };
          ausgaben.push(neueAusgabe);
          abo.lastProcessed = heute.toISOString();
          hasChanged = true;
        }
      }

      if (hasChanged) {
        await AsyncStorage.setItem('abos', JSON.stringify(abos));
        await AsyncStorage.setItem('ausgaben', JSON.stringify(ausgaben));
      }
    } catch (error) {
      console.error("Fehler bei der Verarbeitung der Abos:", error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
    } catch (error) {
      console.error('Fehler beim Prüfen des Login-Status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    verarbeiteAbos();
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('currentUser');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  if (isLoading) {
    return null; // Oder ein Loading-Screen
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <MainTabs onLogout={handleLogout} />
        ) : (
          <Stack.Navigator
            screenOptions={{
              // headerShown: false, // Temporarily removed for debugging
            }}
          >
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => <RegisterScreen {...props} onRegister={handleLogin} />}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </ThemeProvider>
  );
}
