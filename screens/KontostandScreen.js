import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function KontostandScreen() {
  const { currentTheme } = useTheme();
  const [kontostaende, setKontostaende] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ladeKontostaende();
    const interval = setInterval(ladeKontostaende, 5000); // Aktualisiere alle 5 Sekunden
    return () => clearInterval(interval);
  }, []);

  const ladeKontostaende = async () => {
    setIsLoading(true);
    try {
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) {
        setKontostaende({});
        setIsLoading(false);
        return;
      }
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      const einnahmenJson = await AsyncStorage.getItem('einnahmen');
      const ausgabenJson = await AsyncStorage.getItem('ausgaben');

      const alleEinnahmen = einnahmenJson ? JSON.parse(einnahmenJson) : [];
      const alleAusgaben = ausgabenJson ? JSON.parse(ausgabenJson) : [];

      const userEinnahmen = alleEinnahmen.filter(e => e.userEmail === userEmail);
      const userAusgaben = alleAusgaben.filter(a => a.userEmail === userEmail);

      const kontobewegungen = [...userEinnahmen, ...userAusgaben];

      const berechneteKontostaende = kontobewegungen.reduce((acc, transaktion) => {
        const konto = transaktion.konto || 'Unbekanntes Konto';
        if (!acc[konto]) {
          acc[konto] = 0;
        }
        if (transaktion.betrag) {
          acc[konto] += (transaktion.typ === 'einnahme' ? 1 : -1) * parseFloat(transaktion.betrag);
        }
        return acc;
      }, {});
      setKontostaende(berechneteKontostaende);
    } catch (error) {
      console.error('Fehler beim Laden der Kontostände:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getKontoIcon = (kontoName) => {
    switch (kontoName) {
      case 'Girokonto':
        return 'card-outline';
      case 'Brieftasche':
        return 'wallet-outline';
      case 'Sparbuch':
        return 'book-outline';
      case 'Kreditkarte':
        return 'card';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.headerCard, { backgroundColor: currentTheme.cardBackground }]}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="wallet-outline" size={32} color={currentTheme.primary} />
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Kontostände</Text>
        </View>
        {isLoading && <Text style={[styles.loadingText, { color: currentTheme.textSecondary }]}>Lädt Kontostände...</Text>}
        {!isLoading && Object.keys(kontostaende).length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={48} color={currentTheme.textSecondary} />
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
              Noch keine Kontobewegungen erfasst.
            </Text>
          </View>
        )}
        {!isLoading && Object.keys(kontostaende).length > 0 && (
          <View>
            {Object.entries(kontostaende).map(([kontoName, balance]) => (
              <View key={kontoName} style={[styles.kontoItem, { borderBottomColor: currentTheme.border }]}>
                <View style={styles.kontoInfo}>
                  <Ionicons name={getKontoIcon(kontoName)} size={24} color={currentTheme.text} />
                  <Text style={[styles.kontoName, { color: currentTheme.text }]}>{kontoName}</Text>
                </View>
                <Text style={[styles.kontoBalance, { color: balance >= 0 ? '#4CAF50' : '#F44336' }]}>
                  {balance.toFixed(2)} €
                </Text>
              </View>
            ))}
          </View>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  kontoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  kontoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  kontoName: {
    fontSize: 18,
    fontWeight: '600',
  },
  kontoBalance: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
