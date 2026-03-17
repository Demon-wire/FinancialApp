import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function AnleitungScreen() {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();

  const sections = [
    { icon: 'information-circle-outline', titleKey: 'guide.welcomeTitle', textKey: 'guide.welcomeText' },
    { icon: 'swap-horizontal-outline', titleKey: 'guide.addTransactionsTitle', textKey: 'guide.addTransactionsText' },
    { icon: 'list-outline', titleKey: 'guide.allTransactionsTitle', textKey: 'guide.allTransactionsText' },
    { icon: 'wallet-outline', titleKey: 'guide.balanceTitle', textKey: 'guide.balanceText' },
    { icon: 'calculator-outline', titleKey: 'guide.profitTitle', textKey: 'guide.profitText' },
    { icon: 'repeat-outline', titleKey: 'guide.subscriptionsTitle', textKey: 'guide.subscriptionsText' },
    { icon: 'pie-chart-outline', titleKey: 'guide.budgetTitle', textKey: 'guide.budgetText' },
    { icon: 'stats-chart-outline', titleKey: 'guide.statisticsTitle', textKey: 'guide.statisticsText' },
    { icon: 'settings-outline', titleKey: 'guide.settingsTitle', textKey: 'guide.settingsText' },
    { icon: 'shield-checkmark-outline', titleKey: 'guide.securityTitle', textKey: 'guide.securityText' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {sections.map((section, index) => (
        <View key={index} style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
          <Ionicons name={section.icon} size={30} color={currentTheme.primary} style={styles.icon} />
          <Text style={[styles.heading, { color: currentTheme.text }]}>{t(section.titleKey)}</Text>
          <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>{t(section.textKey)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: {
    marginBottom: 16, padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  icon: { alignSelf: 'center', marginBottom: 10 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  paragraph: { fontSize: 15, lineHeight: 23 },
});
