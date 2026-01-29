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
import AnleitungScreen from './screens/AnleitungScreen';
import KontostandScreen from './screens/KontostandScreen';
import EditTransactionScreen from './screens/EditTransactionScreen';

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
        tabBarStyle: {
          backgroundColor: currentTheme.surface,
        },
        headerStyle: {
          backgroundColor: currentTheme.headerBackground,
        },
        headerTintColor: currentTheme.headerText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={onLogout}
            style={{ marginRight: 16 }}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={currentTheme.headerText}
            />
          </TouchableOpacity>
        ),
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

const AppStack = ({ onLogout }) => {
  const { currentTheme } = useTheme();
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="EditTransaction" component={EditTransactionScreen} options={{ title: 'Transaktion bearbeiten', headerStyle: { backgroundColor: currentTheme.headerBackground }, headerTintColor: currentTheme.headerText }}/>
    </Stack.Navigator>
  )
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

      const abosJson = await AsyncStorage.getItem('abos');
      if (!abosJson) return;
      let abos = JSON.parse(abosJson);

      const ausgabenJson = await AsyncStorage.getItem('ausgaben');
      let ausgaben = ausgabenJson ? JSON.parse(ausgabenJson) : [];

      const heute = new Date();
      let hatGeaendert = false;

      const neueAbos = abos.map(abo => {
        if (abo.userEmail !== userEmail) return abo;

        const lastProcessed = new Date(abo.lastProcessed);
        // Wenn letztes Mal in einem anderen Monat verarbeitet
        if (lastProcessed.getMonth() !== heute.getMonth() || lastProcessed.getFullYear() !== heute.getFullYear()) {
          // Neue Ausgabe erstellen
          const neueAusgabe = {
            id: Date.now().toString() + Math.random().toString(),
            betrag: abo.betrag,
            kategorie: 'Abo',
            notiz: `Abonnement: ${abo.name}`,
            konto: 'Girokonto',
            datum: heute.toISOString(),
            userEmail: userEmail,
            typ: 'ausgabe',
          };
          ausgaben.push(neueAusgabe);
          hatGeaendert = true;
          return { ...abo, lastProcessed: heute.toISOString() };
        }
        return abo;
      });

      if (hatGeaendert) {
        await AsyncStorage.setItem('ausgaben', JSON.stringify(ausgaben));
        await AsyncStorage.setItem('abos', JSON.stringify(neueAbos));
      }
    } catch (error) {
      console.error('Fehler bei der Abo-Verarbeitung:', error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
    } catch (error) {
      console.error('Fehler beim Prüfen des Login-Status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('currentUser');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading-screen
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <AppStack onLogout={handleLogout} />
        ) : (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
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