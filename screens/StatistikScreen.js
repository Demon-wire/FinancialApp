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

const KATEGORIEN_EINNAHMEN = [
  { name: 'Gehalt', icon: 'briefcase-outline', color: '#2196F3' },
  { name: 'Nebentätigkeit', icon: 'cash-outline', color: '#4CAF50' },
  { name: 'Investitionen', icon: 'trending-up-outline', color: '#FF9800' },
  { name: 'Dividenden', icon: 'logo-bitcoin', color: '#607D8B' },
  { name: 'Zinsen', icon: 'analytics-outline', color: '#795548' },
  { name: 'Mieteinnahmen', icon: 'home-outline', color: '#FF5722' },
  { name: 'Rückerstattung', icon: 'arrow-undo-outline', color: '#00BCD4' },
  { name: 'Geschenk', icon: 'gift-outline', color: '#E91E63' },
  { name: 'Sonstiges', icon: 'ellipse-outline', color: '#9E9E9E' },
];

const KATEGORIEN_AUSGABEN = [
  { name: 'Miete', icon: 'home-outline', color: '#FF5722' },
  { name: 'Lebensmittel', icon: 'cart-outline', color: '#FFC107' },
  { name: 'Transport', icon: 'bus-outline', color: '#03A9F4' },
  { name: 'Freizeit', icon: 'game-controller-outline', color: '#4CAF50' },
  { name: 'Haushalt', icon: 'basket-outline', color: '#673AB7' },
  { name: 'Gesundheit', icon: 'medkit-outline', color: '#E91E63' },
  { name: 'Bildung', icon: 'school-outline', color: '#009688' },
  { name: 'Kleidung', icon: 'shirt-outline', color: '#9C27B0' },
  { name: 'Versicherung', icon: 'shield-checkmark-outline', color: '#3F51B5' },
  { name: 'Abo', icon: 'repeat-outline', color: '#9E9E9E' },
  { name: 'Sonstiges', icon: 'ellipse-outline', color: '#9E9E9E' },
];

function getCategoryDetails(categoryName, type) {
    let categories = type === 'einnahmen' ? KATEGORIEN_EINNAHMEN : KATEGORIEN_AUSGABEN;
    const foundCategory = categories.find(cat => cat.name === categoryName);
    const result = foundCategory || { name: categoryName, icon: 'ellipse-outline', color: '#9E9E9E' };
    console.log(`StatistikScreen: getCategoryDetails for ${categoryName} (${type}):`, result); // Debug log
    return result;
}

export default function StatistikScreen() {
  const { currentTheme } = useTheme();
  const [einnahmen, setEinnahmen] = useState([]);
  const [ausgaben, setAusgaben] = useState([]);
<<<<<<< HEAD
  const [zeitraum, setZeitraum] = useState('monat');
  const [ansicht, setAnsicht] = useState('einnahmen'); // 'einnahmen', 'ausgaben' oder 'gewinn'
=======
  const [zeitraum, setZeitraum] = useState('tag');
  const [typ, setTyp] = useState('einnahmen'); // 'einnahmen' oder 'ausgaben'
  const [selectedAccount, setSelectedAccount] = useState('Alle Konten'); // New state for selected account
  const [availableAccounts, setAvailableAccounts] = useState(['Alle Konten']); // New state for available accounts
>>>>>>> dev

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
        setAvailableAccounts(['Alle Konten']);
        return;
      }
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      let allAccounts = new Set(['Alle Konten']);

      // Lade Einnahmen
      const gespeicherteEinnahmen = await AsyncStorage.getItem('einnahmen');
      let einnahmenListe = [];
      if (gespeicherteEinnahmen) {
        const alleEinnahmen = JSON.parse(gespeicherteEinnahmen);
        einnahmenListe = alleEinnahmen
          .filter((e) => e.userEmail === userEmail)
          .map(e => {
              if (e.konto) allAccounts.add(e.konto);
              return {
                  ...e,
                  icon: getCategoryDetails(e.kategorie, 'einnahmen').icon,
                  color: getCategoryDetails(e.kategorie, 'einnahmen').color,
              };
          });
        setEinnahmen(einnahmenListe);
        console.log('StatistikScreen: Geladene Einnahmen (mit Details):', einnahmenListe);
      } else {
        setEinnahmen([]);
      }

      // Lade Ausgaben
      const gespeicherteAusgaben = await AsyncStorage.getItem('ausgaben');
      let ausgabenListe = [];
      if (gespeicherteAusgaben) {
        const alleAusgaben = JSON.parse(gespeicherteAusgaben);
        ausgabenListe = alleAusgaben
          .filter((a) => a.userEmail === userEmail)
          .map(a => {
              if (a.konto) allAccounts.add(a.konto);
              return {
                  ...a,
                  icon: getCategoryDetails(a.kategorie, 'ausgaben').icon,
                  color: getCategoryDetails(a.kategorie, 'ausgaben').color,
              };
          });
        setAusgaben(ausgabenListe);
        console.log('StatistikScreen: Geladene Ausgaben (mit Details):', ausgabenListe);
      } else {
        setAusgaben([]);
      }
      setAvailableAccounts(Array.from(allAccounts));
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      setEinnahmen([]);
      setAusgaben([]);
      setAvailableAccounts(['Alle Konten']);
    }
  };

  const filtereNachZeitraumUndKonto = (transaktionen) => {
    const jetzt = new Date();
    let startDatum;

    switch (zeitraum) {
      case 'tag':
        startDatum = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());
        break;
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
        startDatum = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate());
    }

    return transaktionen.filter((t) => {
      const transaktionsDatum = new Date(t.datum);
      const matchesTimeframe = transaktionsDatum >= startDatum;
      const matchesAccount = selectedAccount === 'Alle Konten' || t.konto === selectedAccount;
      return matchesTimeframe && matchesAccount;
    });
  };

  const berechneStatistik = () => {
<<<<<<< HEAD
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
=======
    const transaktionen = typ === 'einnahmen' ? einnahmen : ausgaben;
    const gefilterteTransaktionen = filtereNachZeitraumUndKonto(transaktionen); // Use new filtering function
    const gesamt = gefilterteTransaktionen.reduce((sum, t) => sum + t.betrag, 0);
>>>>>>> dev

    const nachKategorie = {};
    anzuzeigendeTransaktionen.forEach((t) => {
      if (nachKategorie[t.kategorie]) {
        nachKategorie[t.kategorie].betrag += t.betrag;
      } else {
        nachKategorie[t.kategorie] = {
            betrag: t.betrag,
            icon: t.icon,
            color: t.color,
        };
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
    tag: 'Heute',
    woche: 'Letzte Woche',
    monat: 'Dieser Monat',
    jahr: 'Dieses Jahr',
  };

  const zeitraumIcons = {
    tag: 'calendar-outline',
    woche: 'calendar-outline',
    monat: 'calendar',
    jahr: 'calendar-number',
  };

<<<<<<< HEAD
  const sortedKategorien = nachKategorie ? Object.entries(nachKategorie)
    .sort((a, b) => b[1] - a[1]) : [];
=======
  const gefilterteTransaktionen = filtereNachZeitraumUndKonto(typ === 'einnahmen' ? einnahmen : ausgaben); // Use new filtering function
  const sortedKategorien = Object.entries(nachKategorie)
    .sort((a, b) => b[1].betrag - a[1].betrag); // Sort by betrag
>>>>>>> dev

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header mit Zeitraum-Auswahl und Konto-Auswahl */}
      <View style={[styles.headerCard, { backgroundColor: currentTheme.cardBackground }]}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="stats-chart" size={32} color={currentTheme.primary} />
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Statistik</Text>
        </View>
        <View style={styles.zeitraumButtons}>
          {['tag', 'woche', 'monat', 'jahr'].map((z) => (
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
                {z === 'tag' ? 'Tag' : z === 'woche' ? 'Woche' : z === 'monat' ? 'Monat' : 'Jahr'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Konto-Auswahl */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountButtonsContainer}>
          {availableAccounts.map((accountName) => (
            <TouchableOpacity
              key={accountName}
              style={[
                styles.accountButton,
                {
                  backgroundColor: selectedAccount === accountName ? currentTheme.primary : currentTheme.surface,
                  borderColor: currentTheme.border,
                },
                selectedAccount === accountName && styles.accountButtonActive,
              ]}
              onPress={() => setSelectedAccount(accountName)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.accountButtonText,
                  {
                    color: selectedAccount === accountName ? '#fff' : currentTheme.text,
                    fontWeight: selectedAccount === accountName ? '600' : '400',
                  },
                ]}
              >
                {accountName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
<<<<<<< HEAD
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
=======
            <Text style={[styles.typButtonText, typ === 'ausgaben' && { color: '#fff' }]}>Ausgaben</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.statistikContainer}>
                    {/* ... Gesamt-Box ... */}
        <View style={[styles.gesamtBox, { backgroundColor: currentTheme.primary }]}>
          <Ionicons name="wallet" size={40} color="#fff" />
          <Text style={styles.gesamtLabel}>{zeitraumLabels[zeitraum]} ({selectedAccount === 'Alle Konten' ? 'Alle Konten' : selectedAccount}) ({typ === 'einnahmen' ? 'Einnahmen' : 'Ausgaben'})</Text>
          <Text style={styles.gesamtBetrag}>{gesamt.toFixed(2)} €</Text>
          <View style={styles.gesamtInfoRow}>
            <Ionicons name="receipt-outline" size={16} color="#fff" style={{ opacity: 0.9 }} />
            <Text style={styles.gesamtAnzahl}>{anzahl} {typ === 'einnahmen' ? 'Einnahmen' : 'Ausgaben'}</Text>
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
                Keine {typ === 'einnahmen' ? 'Einnahmen' : 'Ausgaben'} in diesem Zeitraum für {selectedAccount}
              </Text>
            </View>
          ) : (
            sortedKategorien.map(([kategorieName, { betrag, icon, color }], index) => {
              const prozent = gesamt > 0 ? (betrag / gesamt) * 100 : 0;
              return (
                <View key={kategorieName} style={styles.kategorieItem}>
                  <View style={styles.kategorieHeader}>
                    <View style={[styles.kategorieIconContainer, { backgroundColor: `${color}20` }]}>
                      <Ionicons 
                        name={icon} 
                        size={20} 
                        color={color} 
                      />
                    </View>
                    <View style={styles.kategorieInfo}>
                      <Text style={[styles.kategorieName, { color: currentTheme.text }]}>{kategorieName}</Text>
                      <Text style={[styles.kategorieProzent, { color: currentTheme.textSecondary }]}>
                        {prozent.toFixed(1)}%
                      </Text>
                    </View>
                    <Text style={[styles.kategorieBetrag, { color: color }]}>
                      {betrag.toFixed(2)} €
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: currentTheme.border }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${prozent}%`, 
                          backgroundColor: color 
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
            <Text style={[styles.verlaufTitle, { color: currentTheme.text }]}>Letzte {typ === 'einnahmen' ? 'Einnahmen' : 'Ausgaben'}</Text>
          </View>
          {gefilterteTransaktionen.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={currentTheme.textSecondary} />
              <Text style={[styles.keineDaten, { color: currentTheme.textSecondary }]}>
                Noch keine {typ === 'einnahmen' ? 'Einnahmen' : 'Ausgaben'} erfasst für {selectedAccount}
              </Text>
            </View>
          ) : (
            gefilterteTransaktionen
              .sort((a, b) => new Date(b.datum) - new Date(a.datum))
              .slice(0, 10)
              .map((transaktion) => (
                <View 
                  key={transaktion.id} 
                  style={[styles.einnahmeItem, { borderBottomColor: currentTheme.border }]}
                >
                  <View style={styles.einnahmeLeft}>
                    <View style={[styles.einnahmeIconContainer, { backgroundColor: `${transaktion.color}20` }]}>
                      <Ionicons 
                        name={transaktion.icon} 
                        size={20} 
                        color={transaktion.color} 
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
                  <Text style={[styles.einnahmeBetrag, { color: transaktion.typ === 'einnahmen' ? transaktion.color : transaktion.color }]}>
                    {typ === 'einnahmen' ? '+' : '-'}{transaktion.betrag.toFixed(2)} €
                  </Text>
                </View>
              ))
          )}
        </View>
        </View>
>>>>>>> dev
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
  accountButtonsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 10,
  },
  accountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
  },
  accountButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  accountButtonText: {
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
