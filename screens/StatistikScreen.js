import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const KATEGORIE_ICONS = {
  // Einnahmen
  'Gehalt': 'briefcase',
  'Nebentätigkeit': 'cash',
  'Investitionen': 'trending-up',
  'Geschenk': 'gift',
  // Ausgaben
  'Miete': 'home',
  'Lebensmittel': 'cart',
  'Transport': 'bus',
  'Freizeit': 'game-controller',
  'Abo': 'repeat',
  'Sonstiges': 'ellipse',
};

export default function StatistikScreen() {
  const { currentTheme } = useTheme();
  const [einnahmen, setEinnahmen] = useState([]);
  const [ausgaben, setAusgaben] = useState([]);
  const [zeitraum, setZeitraum] = useState('monat');
  const [ansicht, setAnsicht] = useState('einnahmen'); // 'einnahmen', 'ausgaben' oder 'gewinn'

  useEffect(() => {
    ladeDaten();
    const interval = setInterval(ladeDaten, 1000);
    return () => clearInterval(interval);
  }, []);

  const ladeDaten = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) {
        setEinnahmen([]);
        setAusgaben([]);
        return;
      }
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      // Lade Einnahmen
      const gespeicherteEinnahmen = await AsyncStorage.getItem('einnahmen');
      if (gespeicherteEinnahmen) {
        const alleEinnahmen = JSON.parse(gespeicherteEinnahmen);
        const einnahmenListe = alleEinnahmen.filter(
          (e) => e.userEmail === userEmail
        );
        setEinnahmen(einnahmenListe);
      } else {
        setEinnahmen([]);
      }

      // Lade Ausgaben
      const gespeicherteAusgaben = await AsyncStorage.getItem('ausgaben');
      if (gespeicherteAusgaben) {
        const alleAusgaben = JSON.parse(gespeicherteAusgaben);
        const ausgabenListe = alleAusgaben.filter(
          (a) => a.userEmail === userEmail
        );
        setAusgaben(ausgabenListe);
      } else {
        setAusgaben([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      setEinnahmen([]);
      setAusgaben([]);
    }
  };

  const filtereNachZeitraum = (transaktionen) => {
    const jetzt = new Date();
    let startDatum;

    switch (zeitraum) {
      case 'woche':
        startDatum = new Date(jetzt.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monat':
        startDatum = new Date(jetzt.getFullYear(), jetzt.getMonth(), 1);
        break;
      case 'jahr':
        startDatum = new Date(jetzt.getFullYear(), 0, 1);
        break;
      default:
        startDatum = new Date(jetzt.getFullYear(), jetzt.getMonth(), 1);
    }

    return transaktionen.filter((t) => {
      const transaktionsDatum = new Date(t.datum);
      return transaktionsDatum >= startDatum;
    });
  };

  const berechneStatistik = () => {
    const gefilterteEinnahmen = filtereNachZeitraum(einnahmen);
    const gefilterteAusgaben = filtereNachZeitraum(ausgaben);

    const gesamtEinnahmen = gefilterteEinnahmen.reduce((sum, e) => sum + e.betrag, 0);
    const gesamtAusgaben = gefilterteAusgaben.reduce((sum, a) => sum + a.betrag, 0);
    const nettoGewinn = gesamtEinnahmen - gesamtAusgaben;

    let anzuzeigendeTransaktionen = [];
    let gesamt = 0;
    let anzahl = 0;

    if (ansicht === 'einnahmen') {
      anzuzeigendeTransaktionen = gefilterteEinnahmen;
      gesamt = gesamtEinnahmen;
      anzahl = gefilterteEinnahmen.length;
    } else if (ansicht === 'ausgaben') {
      anzuzeigendeTransaktionen = gefilterteAusgaben;
      gesamt = gesamtAusgaben;
      anzahl = gefilterteAusgaben.length;
    } else if (ansicht === 'gewinn') {
      // For 'Gewinn' view, we don't have individual transactions to display in the same way
      // We will only display the summary (gesamtEinnahmen, gesamtAusgaben, nettoGewinn)
      // The category breakdown and recent transactions will be handled differently or omitted.
      return { gesamtEinnahmen, gesamtAusgaben, nettoGewinn };
    }

    const nachKategorie = {};
    anzuzeigendeTransaktionen.forEach((t) => {
      if (nachKategorie[t.kategorie]) {
        nachKategorie[t.kategorie] += t.betrag;
      } else {
        nachKategorie[t.kategorie] = t.betrag;
      }
    });

    return { gesamt, nachKategorie, anzahl, anzuzeigendeTransaktionen };
  };

  const { gesamt, nachKategorie, anzahl, gesamtEinnahmen, gesamtAusgaben, nettoGewinn, anzuzeigendeTransaktionen } = berechneStatistik();

  const formatDatum = (datumString) => {
    const datum = new Date(datumString);
    return datum.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const zeitraumLabels = {
    woche: 'Letzte Woche',
    monat: 'Dieser Monat',
    jahr: 'Dieses Jahr',
  };

  const zeitraumIcons = {
    woche: 'calendar-outline',
    monat: 'calendar',
    jahr: 'calendar-number',
  };

  const sortedKategorien = nachKategorie ? Object.entries(nachKategorie)
    .sort((a, b) => b[1] - a[1]) : [];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header mit Zeitraum-Auswahl */}
      <View style={[styles.headerCard, { backgroundColor: currentTheme.cardBackground }]}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="stats-chart" size={32} color={currentTheme.primary} />
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Statistik</Text>
        </View>
        <View style={styles.zeitraumButtons}>
          {['woche', 'monat', 'jahr'].map((z) => (
            <TouchableOpacity
              key={z}
              style={[
                styles.zeitraumButton,
                {
                  backgroundColor: zeitraum === z ? currentTheme.primary : currentTheme.surface,
                  borderColor: currentTheme.border,
                },
                zeitraum === z && styles.zeitraumButtonAktiv,
              ]}
              onPress={() => setZeitraum(z)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={zeitraumIcons[z]} 
                size={18} 
                color={zeitraum === z ? '#fff' : currentTheme.textSecondary} 
              />
              <Text
                style={[
                  styles.zeitraumButtonText,
                  {
                    color: zeitraum === z ? '#fff' : currentTheme.text,
                    fontWeight: zeitraum === z ? '600' : '400',
                  },
                ]}
              >
                {z === 'woche' ? 'Woche' : z === 'monat' ? 'Monat' : 'Jahr'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.typButtons}>
          <TouchableOpacity
            style={[styles.typButton, ansicht === 'einnahmen' && { backgroundColor: currentTheme.primary }]}
            onPress={() => setAnsicht('einnahmen')}
          >
            <Text style={[styles.typButtonText, ansicht === 'einnahmen' && { color: '#fff' }]}>Einnahmen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typButton, ansicht === 'ausgaben' && { backgroundColor: currentTheme.primary }]}
            onPress={() => setAnsicht('ausgaben')}
          >
            <Text style={[styles.typButtonText, ansicht === 'ausgaben' && { color: '#fff' }]}>Ausgaben</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typButton, ansicht === 'gewinn' && { backgroundColor: currentTheme.primary }]}
            onPress={() => setAnsicht('gewinn')}
          >
            <Text style={[styles.typButtonText, ansicht === 'gewinn' && { color: '#fff' }]}>Gewinn</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statistikContainer}>
        {ansicht === 'gewinn' ? (
          <View style={[styles.gewinnBox, { backgroundColor: currentTheme.cardBackground }]}>
            <Text style={[styles.gewinnTitle, { color: currentTheme.text }]}>{zeitraumLabels[zeitraum]} - Übersicht</Text>
            <View style={styles.gewinnRow}>
              <Text style={[styles.gewinnLabel, { color: currentTheme.text }]}>Total Einnahmen:</Text>
              <Text style={[styles.gewinnValue, { color: currentTheme.primary }]}>{gesamtEinnahmen.toFixed(2)} €</Text>
            </View>
            <View style={styles.gewinnRow}>
              <Text style={[styles.gewinnLabel, { color: currentTheme.text }]}>Total Ausgaben:</Text>
              <Text style={[styles.gewinnValue, { color: 'red' }]}>-{gesamtAusgaben.toFixed(2)} €</Text>
            </View>
            <View style={[styles.gewinnRow, styles.gewinnNettoRow, { borderTopColor: currentTheme.border }]}>
              <Text style={[styles.gewinnLabel, { color: currentTheme.text, fontWeight: 'bold' }]}>Netto Gewinn/Verlust:</Text>
              <Text style={[styles.gewinnValue, { color: nettoGewinn >= 0 ? currentTheme.primary : 'red', fontWeight: 'bold' }]}>
                {nettoGewinn >= 0 ? '+' : ''}{nettoGewinn.toFixed(2)} €
              </Text>
            </View>
          </View>
        ) : (
          <>
            {/* Gesamt-Box */}
            <View style={[styles.gesamtBox, { backgroundColor: currentTheme.primary }]}>
              <Ionicons name="wallet" size={40} color="#fff" />
              <Text style={styles.gesamtLabel}>{zeitraumLabels[zeitraum]} ({ansicht === 'einnahmen' ? 'Einnahmen' : 'Ausgaben'})</Text>
              <Text style={styles.gesamtBetrag}>{gesamt.toFixed(2)} €</Text>
              <View style={styles.gesamtInfoRow}>
                <Ionicons name="receipt-outline" size={16} color="#fff" style={{ opacity: 0.9 }} />
                <Text style={styles.gesamtAnzahl}>{anzahl} {ansicht === 'einnahmen' ? 'Einnahmen' : 'Ausgaben'}</Text>
              </View>
            </View>

            {/* Kategorien-Box */}
            <View style={[styles.kategorienBox, { backgroundColor: currentTheme.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="grid" size={24} color={currentTheme.primary} />
                <Text style={[styles.kategorienTitle, { color: currentTheme.text }]}>Nach Kategorien</Text>
              </View>
              {sortedKategorien.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="bar-chart-outline" size={48} color={currentTheme.textSecondary} />
                  <Text style={[styles.keineDaten, { color: currentTheme.textSecondary }]}>
                    Keine {ansicht === 'einnahmen' ? 'Einnahmen' : 'Ausgaben'} in diesem Zeitraum
                  </Text>
                </View>
              ) : (
                sortedKategorien.map(([kategorie, betrag], index) => {
                  const prozent = gesamt > 0 ? (betrag / gesamt) * 100 : 0;
                  return (
                    <View key={kategorie} style={styles.kategorieItem}>
                      <View style={styles.kategorieHeader}>
                        <View style={[styles.kategorieIconContainer, { backgroundColor: `${currentTheme.primary}20` }]}>
                          <Ionicons 
                            name={KATEGORIE_ICONS[kategorie] || 'ellipse'} 
                            size={20} 
                            color={currentTheme.primary} 
                          />
                        </View>
                        <View style={styles.kategorieInfo}>
                          <Text style={[styles.kategorieName, { color: currentTheme.text }]}>{kategorie}</Text>
                          <Text style={[styles.kategorieProzent, { color: currentTheme.textSecondary }]}>
                            {prozent.toFixed(1)}%
                          </Text>
                        </View>
                        <Text style={[styles.kategorieBetrag, { color: currentTheme.primary }]}>
                          {betrag.toFixed(2)} €
                        </Text>
                      </View>
                      <View style={[styles.progressBar, { backgroundColor: currentTheme.border }]}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${prozent}%`, 
                              backgroundColor: currentTheme.primary 
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Verlauf-Box */}
            <View style={[styles.verlaufBox, { backgroundColor: currentTheme.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={24} color={currentTheme.primary} />
                <Text style={[styles.verlaufTitle, { color: currentTheme.text }]}>Letzte {ansicht === 'einnahmen' ? 'Einnahmen' : 'Ausgaben'}</Text>
              </View>
              {anzuzeigendeTransaktionen.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color={currentTheme.textSecondary} />
                  <Text style={[styles.keineDaten, { color: currentTheme.textSecondary }]}>
                    Noch keine {ansicht === 'einnahmen' ? 'Einnahmen' : 'Ausgaben'} erfasst
                  </Text>
                </View>
              ) : (
                anzuzeigendeTransaktionen
                  .sort((a, b) => new Date(b.datum) - new Date(a.datum))
                  .slice(0, 10)
                  .map((transaktion) => (
                    <View 
                      key={transaktion.id} 
                      style={[styles.einnahmeItem, { borderBottomColor: currentTheme.border }]}
                    >
                      <View style={styles.einnahmeLeft}>
                        <View style={[styles.einnahmeIconContainer, { backgroundColor: `${currentTheme.primary}20` }]}>
                          <Ionicons 
                            name={KATEGORIE_ICONS[transaktion.kategorie] || 'ellipse'} 
                            size={20} 
                            color={currentTheme.primary} 
                          />
                        </View>
                        <View style={styles.einnahmeInfo}>
                          <Text style={[styles.einnahmeKategorie, { color: currentTheme.text }]}>
                            {transaktion.kategorie}
                          </Text>
                          <View style={styles.einnahmeMeta}>
                            <Ionicons name="calendar-outline" size={12} color={currentTheme.textSecondary} />
                            <Text style={[styles.einnahmeDatum, { color: currentTheme.textSecondary }]}>
                              {formatDatum(transaktion.datum)}
                            </Text>
                            {transaktion.notiz && (
                              <>
                                <Ionicons name="document-text-outline" size={12} color={currentTheme.textSecondary} style={{ marginLeft: 8 }} />
                                <Text style={[styles.einnahmeNotiz, { color: currentTheme.textSecondary }]} numberOfLines={1}>
                                  {transaktion.notiz}
                                </Text>
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                      <Text style={[styles.einnahmeBetrag, { color: ansicht === 'einnahmen' ? currentTheme.primary : 'red' }]}>
                        {ansicht === 'einnahmen' ? '+' : '-'}{transaktion.betrag.toFixed(2)} €
                      </Text>
                    </View>
                  ))
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    padding: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  zeitraumButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  zeitraumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  zeitraumButtonAktiv: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  zeitraumButtonText: {
    fontSize: 14,
  },
  typButtons: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#eee',
    borderRadius: 12,
    padding: 4,
  },
  typButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  typButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  statistikContainer: {
    padding: 20,
    gap: 20,
  },
  gesamtBox: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gesamtLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 12,
    marginBottom: 8,
  },
  gesamtBetrag: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  gesamtInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gesamtAnzahl: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  kategorienBox: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  kategorienTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  kategorieItem: {
    marginBottom: 20,
  },
  kategorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  kategorieIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kategorieInfo: {
    flex: 1,
  },
  kategorieName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  kategorieProzent: {
    fontSize: 12,
  },
  kategorieBetrag: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  verlaufBox: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  verlaufTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  einnahmeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  einnahmeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  einnahmeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  einnahmeInfo: {
    flex: 1,
  },
  einnahmeKategorie: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  einnahmeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  einnahmeDatum: {
    fontSize: 12,
  },
  einnahmeNotiz: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  einnahmeBetrag: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  keineDaten: {
    fontSize: 14,
    textAlign: 'center',
  },
  gewinnBox: {
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gewinnTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  gewinnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gewinnNettoRow: {
    paddingTop: 15,
    marginTop: 15,
    borderTopWidth: 1,
  },
  gewinnLabel: {
    fontSize: 16,
  },
  gewinnValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
