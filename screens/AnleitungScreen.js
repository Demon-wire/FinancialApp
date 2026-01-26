import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function AnleitungScreen() {
  const { currentTheme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.section}>
        <Ionicons name="information-circle-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Willkommen zur FinanzApp!</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Diese App hilft dir, deine Finanzen einfach und übersichtlich zu verwalten.
        </Text>
      </View>

      <View style={styles.section}>
        <Ionicons name="swap-horizontal-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Transaktionen hinzufügen</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Im Tab "<Text style={{ fontWeight: 'bold' }}>Transaktionen</Text>" kannst du neue Einnahmen und Ausgaben erfassen. 
          <Text style={{ fontWeight: 'bold', color: currentTheme.primary }}>Wische einfach nach links oder rechts</Text>, 
          um zwischen den Ansichten "Einnahmen" und "Ausgaben" zu wechseln. Wähle das entsprechende Konto und die Kategorie aus.
        </Text>
      </View>

      <View style={styles.section}>
        <Ionicons name="list-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Alle Transaktionen</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Unter dem Tab "<Text style={{ fontWeight: 'bold' }}>Alle Transaktionen</Text>" findest du eine vollständige Liste all deiner Einnahmen, Ausgaben und Abonnements, sortiert nach Datum. Du kannst diese nach Konten filtern.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Ionicons name="stats-chart-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Statistik</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Der Tab "<Text style={{ fontWeight: 'bold' }}>Statistik</Text>" bietet dir einen Überblick über deine finanzielle Situation mit Diagrammen und Zusammenfassungen nach Kategorien und Zeiträumen (Woche, Monat, Jahr). Du kannst hier auch gezielt deine <Text style={{ fontWeight: 'bold' }}>Ausgaben</Text> einsehen.
        </Text>
      </View>

      <View style={styles.section}>
        <Ionicons name="repeat-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Abonnements verwalten</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Im Tab "<Text style={{ fontWeight: 'bold' }}>Abos</Text>" kannst du deine wiederkehrenden Ausgaben wie Abonnements hinzufügen und verwalten. Sie werden automatisch als Ausgaben berücksichtigt.
        </Text>
      </View>

      <View style={styles.section}>
        <Ionicons name="settings-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Einstellungen</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Passe die App im Tab "<Text style={{ fontWeight: 'bold' }}>Einstellungen</Text>" an deine Bedürfnisse an, zum Beispiel durch das Wechseln des Themes.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(128, 128, 128, 0.1)', // Light gray background for sections
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
});
