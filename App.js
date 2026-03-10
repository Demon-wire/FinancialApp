import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens(false);
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, ScrollView, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getItem, setItem, removeItem } from './utils/storage';
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
import BudgetScreen from './screens/BudgetScreen';
import { verarbeiteAbos } from './services/aboService';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS = {
  'Transaktionen':      { focused: 'add-circle',   outline: 'add-circle-outline' },
  'Alle Transaktionen': { focused: 'list',          outline: 'list-outline' },
  'Kontostand':         { focused: 'wallet',         outline: 'wallet-outline' },
  'Abos':               { focused: 'repeat',         outline: 'repeat-outline' },
  'Budget':             { focused: 'pie-chart',      outline: 'pie-chart-outline' },
  'Statistik':          { focused: 'stats-chart',    outline: 'stats-chart-outline' },
  'Anleitung':          { focused: 'book',           outline: 'book-outline' },
  'Einstellungen':      { focused: 'settings',       outline: 'settings-outline' },
};

function ScrollableTabBar({ state, descriptors, navigation }) {
  const { currentTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      backgroundColor: currentTheme.surface,
      borderTopWidth: 1,
      borderTopColor: currentTheme.border || '#e0e0e0',
      paddingBottom: insets.bottom,
    }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row' }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const icons = TAB_ICONS[route.name];
          const color = isFocused ? currentTheme.primary : 'gray';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{
                width: 90,
                alignItems: 'center',
                paddingVertical: 10,
                borderTopWidth: 2,
                borderTopColor: isFocused ? currentTheme.primary : 'transparent',
              }}
            >
              <Ionicons
                name={isFocused ? icons.focused : icons.outline}
                size={24}
                color={color}
              />
              <Text style={{
                color,
                fontSize: 10,
                marginTop: 3,
                textAlign: 'center',
              }}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function MainTabs({ onLogout }) {
  const { currentTheme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <ScrollableTabBar {...props} />}
      screenOptions={{
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
      }}
    >
      <Tab.Screen name="Transaktionen" component={TransactionsScreen} />
      <Tab.Screen name="Alle Transaktionen" component={AlleTransaktionenScreen} />
      <Tab.Screen name="Kontostand" component={KontostandScreen} />
      <Tab.Screen name="Abos" component={AbosScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
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
      <Stack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{
          title: 'Transaktion bearbeiten',
          headerStyle: { backgroundColor: currentTheme.headerBackground },
          headerTintColor: currentTheme.headerText,
        }}
      />
    </Stack.Navigator>
  );
};

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
    try {
      const loggedIn = await getItem('isLoggedIn');
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
      await removeItem('isLoggedIn');
      await removeItem('currentUser');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <AppStack onLogout={handleLogout} />
        ) : (
          <Stack.Navigator>
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
