import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { getItem } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';

export default function KontostandScreen() {
  const { currentTheme } = useTheme();
  const { t, tName } = useLanguage();
  const [kontostaende, setKontostaende] = useState({});
  const [gesamtGuthaben, setGesamtGuthaben] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      ladeKontostaende();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    ladeKontostaende().then(() => setRefreshing(false));
  }, []);

  const ladeKontostaende = async () => {
    setIsLoading(true);
    try {
      const currentUserJson = await getItem('currentUser');
      if (!currentUserJson) {
        setKontostaende({});
        setGesamtGuthaben(0);
        setIsLoading(false);
        return;
      }
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      const einnahmenJson = await getItem('einnahmen');
      const ausgabenJson = await getItem('ausgaben');

      const alleEinnahmen = einnahmenJson ? JSON.parse(einnahmenJson) : [];
      const alleAusgaben = ausgabenJson ? JSON.parse(ausgabenJson) : [];

      const userEinnahmen = alleEinnahmen
        .filter(e => e.userEmail === userEmail)
        .map(e => ({ ...e, typ: 'einnahme' }));

      const userAusgaben = alleAusgaben
        .filter(a => a.userEmail === userEmail)
        .map(a => ({ ...a, typ: 'ausgabe' }));

      const kontobewegungen = [...userEinnahmen, ...userAusgaben];

      let total = 0;
      const berechneteKontostaende = kontobewegungen.reduce((acc, transaktion) => {
        const konto = transaktion.konto || 'Unbekanntes Konto';
        if (!acc[konto]) {
          acc[konto] = 0;
        }
        if (transaktion.betrag) {
          const betrag = parseFloat(transaktion.betrag);
          const faktor = transaktion.typ === 'einnahme' ? 1 : -1;
          const wert = faktor * betrag;
          acc[konto] += wert;
          total += wert;
        }
        return acc;
      }, {});

      setKontostaende(berechneteKontostaende);
      setGesamtGuthaben(total);
    } catch (error) {
      console.error('Fehler beim Laden der Kontostände:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getKontoIcon = (kontoName) => {
    switch (kontoName) {
      case 'Girokonto': return 'card-outline';
      case 'Brieftasche': return 'wallet-outline';
      case 'Sparbuch': return 'book-outline';
      case 'Kreditkarte': return 'card';
      default: return 'help-circle-outline';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[currentTheme.primary]} />
      }
    >
      {/* Gesamtguthaben Card */}
      <View style={[styles.totalCard, { backgroundColor: currentTheme.primary }]}>
        <Text style={styles.totalLabel}>{t('balance.total')}</Text>
        <Text style={styles.totalValue}>{gesamtGuthaben.toFixed(2)} €</Text>
        <Ionicons name="pie-chart-outline" size={80} color="rgba(255,255,255,0.2)" style={styles.bgIcon} />
      </View>

      <View style={[styles.headerCard, { backgroundColor: currentTheme.cardBackground }]}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="wallet-outline" size={28} color={currentTheme.primary} />
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>{t('balance.accounts')}</Text>
        </View>

        {isLoading && !refreshing && (
          <Text style={[styles.loadingText, { color: currentTheme.textSecondary }]}>{t('balance.loading')}</Text>
        )}

        {!isLoading && Object.keys(kontostaende).length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={48} color={currentTheme.textSecondary} />
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
              {t('balance.empty')}
            </Text>
          </View>
        )}

        {!isLoading && Object.keys(kontostaende).length > 0 && (
          <View>
            {Object.entries(kontostaende).map(([kontoName, balance]) => (
              <View key={kontoName} style={[styles.kontoItem, { borderBottomColor: currentTheme.border }]}>
                <View style={styles.kontoInfo}>
                  <View style={[styles.iconBox, { backgroundColor: currentTheme.surface }]}>
                    <Ionicons name={getKontoIcon(kontoName)} size={22} color={currentTheme.primary} />
                  </View>
                  <Text style={[styles.kontoName, { color: currentTheme.text }]}>{tName(kontoName)}</Text>
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
  container: { flex: 1 },
  totalCard: {
    margin: 20, padding: 24, borderRadius: 20, position: 'relative', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  totalValue: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  bgIcon: { position: 'absolute', right: -10, bottom: -10 },
  headerCard: {
    marginHorizontal: 20, marginBottom: 20, padding: 20, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  loadingText: { textAlign: 'center', paddingVertical: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  kontoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  kontoInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  kontoName: { fontSize: 17, fontWeight: '600' },
  kontoBalance: { fontSize: 17, fontWeight: 'bold' },
});
