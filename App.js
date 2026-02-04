import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext'; // Re-add ThemeProvider import
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
import { verarbeiteAbos } from './services/aboService';

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
            onPress={() => {
              console.log('Logout button pressed');
              onLogout();
            }}
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
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {(props) => <MainTabs {...props} onLogout={onLogout} />}
      </Stack.Screen>
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

  const checkLoginStatus = async () => {
    console.log('checkLoginStatus: checking...');
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      console.log('checkLoginStatus: isLoggedIn from AsyncStorage:', loggedIn);
      setIsLoggedIn(loggedIn === 'true');
    } catch (error) {
      console.error('Fehler beim Prüfen des Login-Status:', error);
    } finally {
      setIsLoading(false);
      console.log('checkLoginStatus: finished, isLoading:', false);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    console.log('handleLogin: setIsLoggedIn(true)');
  };

  const handleLogout = async () => {
    console.log('handleLogout function called');
    try {
      console.log('handleLogout: Attempting to remove isLoggedIn and currentUser from AsyncStorage');
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('currentUser');
      const loggedInAfterRemoval = await AsyncStorage.getItem('isLoggedIn');
      const currentUserAfterRemoval = await AsyncStorage.getItem('currentUser');
      console.log('handleLogout: isLoggedIn after removal:', loggedInAfterRemoval);
      console.log('handleLogout: currentUser after removal:', currentUserAfterRemoval);
      setIsLoggedIn(false);
      console.log('handleLogout: setIsLoggedIn(false)');
      console.log('handleLogout: Logout successful');
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  };

  if (isLoading) {
    console.log('App: isLoading true, returning null');
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
