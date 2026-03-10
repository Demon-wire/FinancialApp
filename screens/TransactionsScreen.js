import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import EinnahmenScreen from './EinnahmenScreen';
import AusgabenScreen from './AusgabenScreen';
import { useTheme } from '../contexts/ThemeContext';

export default function TransactionsScreen() {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Einnahmen');

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <View style={[styles.tabBar, { backgroundColor: currentTheme.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'Einnahmen' && { borderBottomColor: currentTheme.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('Einnahmen')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'Einnahmen' ? currentTheme.primary : 'gray' }]}>
            Einnahmen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'Ausgaben' && { borderBottomColor: currentTheme.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('Ausgaben')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'Ausgaben' ? currentTheme.primary : 'gray' }]}>
            Ausgaben
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {activeTab === 'Einnahmen' ? <EinnahmenScreen /> : <AusgabenScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 48,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
