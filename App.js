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
import AlleTransaktionenScreen from './screens/AlleTransaktionenScreen';
import AnleitungScreen from './screens/AnleitungScreen'; // Import the new screen
import KontostandScreen from './screens/KontostandScreen';


import { processSubscriptions } from './utils/SubscriptionProcessor';

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
          } else if (route.name === 'Alle Transaktionen') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Anleitung') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Statistik') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Abos') {
            iconName = focused ? 'repeat' : 'repeat-outline';
          } else if (route.name === 'Kontostand') {
            iconName = focused ? 'wallet' : 'wallet-outline';
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
      <Tab.Screen name="Alle Transaktionen" component={AlleTransaktionenScreen} />
      <Tab.Screen name="Kontostand" component={KontostandScreen} />
      <Tab.Screen name="Abos" component={AbosScreen} />
      <Tab.Screen name="Statistik" component={StatistikScreen} />
      <Tab.Screen name="Anleitung" component={AnleitungScreen} />
      <Tab.Screen name="Einstellungen">
        {(props) => <EinstellungenScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUserEmail) {
      processSubscriptions(currentUserEmail);
    }
<<<<<<< HEAD
  }, [isLoggedIn, currentUserEmail]);
=======
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
      let ausgaben = gespeicherteAusgabenJson ? JSON.parse(gespeicherteAusgabenJson) : [];

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
            konto: abo.konto || 'Girokonto', // Fallback
            datum: heute.toISOString(),
            userEmail: userEmail,
          };
          ausgaben.push(neueAusgabe);
          abo.lastProcessed = heute.toISOString();
          hasChanged = true;
        }
      }

      if (hasChanged) {
        const uniqueAusgaben = Array.from(new Set(ausgaben.map(a => a.id)))
          .map(id => {
            return ausgaben.find(a => a.id === id)
          });

        await AsyncStorage.setItem('abos', JSON.stringify(abos));
        await AsyncStorage.setItem('ausgaben', JSON.stringify(uniqueAusgaben));
      }
    } catch (error) {
      console.error("Fehler bei der Verarbeitung der Abos:", error);
    }
  };
>>>>>>> dev

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        setCurrentUserEmail(JSON.parse(userJson).email);
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des Login-Status:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    const userJson = await AsyncStorage.getItem('currentUser');
    if (userJson) {
      setCurrentUserEmail(JSON.parse(userJson).email);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('currentUser');
      setIsLoggedIn(false);
      setCurrentUserEmail(null);
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
