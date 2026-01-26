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
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          color: 'blue', // Force blue color for text
          fontSize: 18,
          backgroundColor: 'yellow', // Add background to see if it takes space
          height: 30, // Force a height
          width: 100, // Force a width
          textAlign: 'center', // Center text
        },
        tabBarStyle: {
          backgroundColor: currentTheme.surface,
          // Add a height to the tab bar itself to ensure space for labels
          height: 60,
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
