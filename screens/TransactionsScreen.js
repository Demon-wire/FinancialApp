import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import EinnahmenScreen from './EinnahmenScreen';
import AusgabenScreen from './AusgabenScreen';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function TransactionsScreen() {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('income');

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <View style={[styles.tabBar, { backgroundColor: currentTheme.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'income' && { borderBottomColor: currentTheme.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('income')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'income' ? currentTheme.primary : 'gray' }]}>
            {t('transactions.incomeTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'expense' && { borderBottomColor: currentTheme.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('expense')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'expense' ? currentTheme.primary : 'gray' }]}>
            {t('transactions.expensesTab')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {activeTab === 'income' ? <EinnahmenScreen /> : <AusgabenScreen />}
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
