import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function AnleitungScreen() {
  const { currentTheme } = useTheme();

  const b = (text) => <Text style={{ fontWeight: 'bold', color: currentTheme.text }}>{text}</Text>;
  const p = (text) => <Text style={{ fontWeight: 'bold', color: currentTheme.primary }}>{text}</Text>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <Ionicons name="information-circle-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Willkommen zur FinanzApp!</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Diese App hilft dir, deine Finanzen einfach und übersichtlich zu verwalten –
          Einnahmen, Ausgaben, Abos, Budgets und Gewinnübersicht, alles an einem Ort.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <Ionicons name="swap-horizontal-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Transaktionen hinzufügen</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Im Tab {b('"Transaktionen"')} kannst du neue Einnahmen und Ausgaben erfassen.{' '}
          {p('Wische nach links oder rechts')}, um zwischen "Einnahmen" und "Ausgaben" zu wechseln.
          Wähle Konto und Kategorie aus und tippe optional eine Notiz ein.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <Ionicons name="list-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Alle Transaktionen</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Unter {b('"Alle Transaktionen"')} siehst du eine vollständige Liste, sortiert nach Datum.
          Du kannst nach {b('Konto filtern')} oder die {b('Suchleiste')} nutzen, um nach Kategorie oder Notiz zu suchen.{' '}
          {p('Wische einen Eintrag nach links')}, um ihn zu bearbeiten oder zu löschen.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <Ionicons name="wallet-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Kontostand</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Der Tab {b('"Kontostand"')} zeigt das Gesamtguthaben und die Salden aller einzelnen Konten
          (Girokonto, Brieftasche, Sparbuch, Kreditkarte) auf einen Blick.
          {p(' Ziehe die Liste nach unten')}, um die Werte zu aktualisieren.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <Ionicons name="calculator-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Gewinnübersicht</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Unter {b('"Gewinn"')} siehst du, wie viel du nach Abzug aller Ausgaben
          und Abo-Kosten übrig hast. Wähle den Zeitraum {b('Woche')}, {b('Monat')} oder {b('Jahr')}.
          Abo-Kosten werden automatisch anteilig nach ihrem Intervall eingerechnet.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <Ionicons name="repeat-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Abonnements verwalten</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Im Tab {b('"Abos"')} kannst du wiederkehrende Ausgaben anlegen. Wähle dabei das{' '}
          {b('Intervall')}: {b('monatlich')}, {b('wöchentlich')} oder {b('jährlich')}.
          Die App bucht das Abo automatisch als Ausgabe, sobald das nächste Intervall beginnt.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <Ionicons name="pie-chart-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Budget</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Im Tab {b('"Budget"')} kannst du für jede Ausgabenkategorie ein Limit setzen –
          wahlweise für eine {b('Woche')} oder einen {b('Monat')}.
          Ein {p('grüner Balken')} bedeutet im Plan, {b('orange')} warnt bei über 80 %, {b('rot')} zeigt an,
          dass das Limit überschritten wurde.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <Ionicons name="stats-chart-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Statistik</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Der Tab {b('"Statistik"')} zeigt Einnahmen und Ausgaben nach Kategorien aufgeschlüsselt,
          mit Fortschrittsbalken und Prozentanteilen. Filtere nach {b('Tag')}, {b('Woche')}, {b('Monat')}
          oder {b('Jahr')} und schränke die Ansicht auf ein bestimmtes Konto ein.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <Ionicons name="settings-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Einstellungen</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Unter {b('"Einstellungen"')} kannst du E-Mail und Passwort ändern, das {b('Theme')} wechseln
          (5 Farbthemen stehen zur Auswahl) und alle Transaktionen als {b('CSV-Datei exportieren')}
          – zum Öffnen in Excel oder einer anderen Tabellenkalkulation.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
        <Ionicons name="shield-checkmark-outline" size={30} color={currentTheme.primary} style={styles.icon} />
        <Text style={[styles.heading, { color: currentTheme.text }]}>Sicherheit</Text>
        <Text style={[styles.paragraph, { color: currentTheme.textSecondary }]}>
          Passwörter werden verschlüsselt gespeichert. Nach {b('5 fehlgeschlagenen Anmeldeversuchen')} wird
          der Account für {b('30 Sekunden')} gesperrt. Auf unterstützten Geräten ist zusätzlich die{' '}
          {b('biometrische Anmeldung')} (Fingerabdruck / Face ID) verfügbar.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 23,
  },
});
