import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import EinnahmenScreen from './EinnahmenScreen';
import AusgabenScreen from './AusgabenScreen';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createMaterialTopTabNavigator();

export default function TransactionsScreen() {
  const { currentTheme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: currentTheme.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: currentTheme.surface,
        },
        tabBarIndicatorStyle: {
          backgroundColor: currentTheme.primary,
        },
      }}
    >
      <Tab.Screen name="Einnahmen" component={EinnahmenScreen} />
      <Tab.Screen name="Ausgaben" component={AusgabenScreen} />
    </Tab.Navigator>
  );
}
