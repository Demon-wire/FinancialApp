import React, { useState, useEffect } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { getItem, setItem } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Da die constants-Datei im letzten Schritt Probleme gemacht hat, definiere ich sie hier lokal, um den Fehler zu beheben.
const KATEGORIEN_EINNAHMEN = [
    { name: 'Gehalt', icon: 'briefcase-outline', color: '#2196F3' }, { name: 'Nebentätigkeit', icon: 'cash-outline', color: '#4CAF50' }, { name: 'Investitionen', icon: 'trending-up-outline', color: '#FF9800' }, { name: 'Dividenden', icon: 'logo-bitcoin', color: '#607D8B' }, { name: 'Zinsen', icon: 'analytics-outline', color: '#795548' }, { name: 'Mieteinnahmen', icon: 'home-outline', color: '#FF5722' }, { name: 'Rückerstattung', icon: 'arrow-undo-outline', color: '#00BCD4' }, { name: 'Geschenk', icon: 'gift-outline', color: '#E91E63' }, { name: 'Sonstiges', icon: 'ellipse-outline', color: '#9E9E9E' },
];

const KATEGORIEN_AUSGABEN = [
    { name: 'Miete', icon: 'home-outline', color: '#FF5722' }, { name: 'Lebensmittel', icon: 'cart-outline', color: '#FFC107' }, { name: 'Transport', icon: 'bus-outline', color: '#03A9F4' }, { name: 'Freizeit', icon: 'game-controller-outline', color: '#4CAF50' }, { name: 'Haushalt', icon: 'basket-outline', color: '#673AB7' }, { name: 'Gesundheit', icon: 'medkit-outline', color: '#E91E63' }, { name: 'Bildung', icon: 'school-outline', color: '#009688' }, { name: 'Kleidung', icon: 'shirt-outline', color: '#9C27B0' }, { name: 'Versicherung', icon: 'shield-checkmark-outline', color: '#3F51B5' }, { name: 'Abo', icon: 'repeat-outline', color: '#9E9E9E' }, { name: 'Sonstiges', icon: 'ellipse-outline', color: '#9E9E9E' },
];

const KONTEN = [
  { name: 'Girokonto', icon: 'card-outline' }, { name: 'Brieftasche', icon: 'wallet-outline' }, { name: 'Sparbuch', icon: 'book-outline' }, { name: 'Kreditkarte', icon: 'card' },
];

export default function EditTransactionScreen({ route, navigation }) {
  const { currentTheme } = useTheme();
  const { transactionId, transactionType } = route.params;

  const [betrag, setBetrag] = useState('');
  const [kategorie, setKategorie] = useState('');
  const [notiz, setNotiz] = useState('');
  const [konto, setKonto] = useState('');
  const [originalTransaction, setOriginalTransaction] = useState(null);

  const KATEGORIEN = transactionType === 'einnahme' ? KATEGORIEN_EINNAHMEN : KATEGORIEN_AUSGABEN;

  useEffect(() => {
    const ladeTransaktion = async () => {
      const storageKey = transactionType === 'einnahme' ? 'einnahmen' : 'ausgaben';
      const itemsJson = await getItem(storageKey);
      const items = itemsJson ? JSON.parse(itemsJson) : [];
      const tx = items.find(t => t.id === transactionId);

      if (tx) {
        setBetrag(tx.betrag.toString());
        setKategorie(tx.kategorie);
        setNotiz(tx.notiz || '');
        setKonto(tx.konto);
        setOriginalTransaction(tx);
      } else {
        Alert.alert("Fehler", "Transaktion nicht gefunden.");
        navigation.goBack();
      }
    };
    ladeTransaktion();
  }, [transactionId, transactionType]);

  const handleUpdate = async () => {
    if (!betrag || parseFloat(betrag) <= 0) {
      Alert.alert('Fehler', 'Bitte geben Sie einen gültigen Betrag ein.');
      return;
    }

    const storageKey = transactionType === 'einnahme' ? 'einnahmen' : 'ausgaben';
    const itemsJson = await getItem(storageKey);
    let items = itemsJson ? JSON.parse(itemsJson) : [];

    const updatedItems = items.map(item => {
      if (item.id === transactionId) {
        return { ...item, betrag: parseFloat(betrag), kategorie, notiz, konto };
      }
      return item;
    });

    await setItem(storageKey, JSON.stringify(updatedItems));
    Alert.alert('✅ Erfolg', 'Transaktion wurde erfolgreich aktualisiert!');
    navigation.goBack();
  };

  if (!originalTransaction) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: currentTheme.text }}>Lade Transaktion...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: currentTheme.cardBackground }]}>
          <Text style={[styles.formTitle, { color: currentTheme.text }]}>Transaktion bearbeiten</Text>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}><Ionicons name="cash" size={20} color={currentTheme.primary} /><Text style={[styles.label, { color: currentTheme.text }]}>Betrag</Text></View>
            <View style={[styles.amountContainer, { borderColor: currentTheme.border }]}><Text style={[styles.currencySymbol, { color: currentTheme.textSecondary }]}>€</Text><TextInput style={[styles.amountInput, { color: currentTheme.text }]} placeholder="0.00" placeholderTextColor={currentTheme.textSecondary} keyboardType="decimal-pad" value={betrag} onChangeText={setBetrag} /></View>
          </View>

          {/* Account Selection */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}><Ionicons name="server-outline" size={20} color={currentTheme.primary} /><Text style={[styles.label, { color: currentTheme.text }]}>Konto</Text></View>
            <View style={styles.kategorienContainer}>
              {KONTEN.map((k) => (
                <TouchableOpacity key={k.name} style={[styles.kategorieButton, { backgroundColor: konto === k.name ? currentTheme.primary : currentTheme.surface, borderColor: konto === k.name ? currentTheme.primary : currentTheme.border }]} onPress={() => setKonto(k.name)}>
                  <Ionicons name={k.icon} size={24} color={konto === k.name ? '#fff' : currentTheme.primary} />
                  <Text style={[styles.kategorieText, { color: konto === k.name ? '#fff' : currentTheme.text }]}>{k.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}><Ionicons name="grid" size={20} color={currentTheme.primary} /><Text style={[styles.label, { color: currentTheme.text }]}>Kategorie</Text></View>
            <View style={styles.kategorienContainer}>
              {KATEGORIEN.map((kat) => (
                <TouchableOpacity key={kat.name} style={[styles.kategorieButton, { backgroundColor: kategorie === kat.name ? currentTheme.primary : currentTheme.surface, borderColor: kategorie === kat.name ? currentTheme.primary : currentTheme.border }]} onPress={() => setKategorie(kat.name)}>
                  <Ionicons name={kat.icon} size={24} color={kategorie === kat.name ? '#fff' : kat.color} />
                  <Text style={[styles.kategorieText, { color: kategorie === kat.name ? '#fff' : currentTheme.text }]}>{kat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}><Ionicons name="document-text-outline" size={20} color={currentTheme.primary} /><Text style={[styles.label, { color: currentTheme.text }]}>Notiz (optional)</Text></View>
            <View style={[styles.notizContainer, { borderColor: currentTheme.border }]}><TextInput style={[styles.notizInput, { color: currentTheme.text }]} placeholder="Zusätzliche Informationen..." placeholderTextColor={currentTheme.textSecondary} multiline value={notiz} onChangeText={setNotiz} /></View>
          </View>
          
          <TouchableOpacity style={[styles.speichernButton, { backgroundColor: currentTheme.primary }]} onPress={handleUpdate}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.speichernButtonText}>Änderungen speichern</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Re-using styles from EinnahmenScreen for consistency
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formCard: { borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  formTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  inputGroup: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  amountContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 12, paddingHorizontal: 16, height: 60 },
  currencySymbol: { fontSize: 24, fontWeight: 'bold', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: 'bold' },
  kategorienContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kategorieButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 8, minWidth: 140, borderWidth: 1.5 },
  kategorieText: { fontSize: 14, fontWeight: '500' },
  notizContainer: { borderWidth: 2, borderRadius: 12, padding: 16, minHeight: 80 },
  notizInput: { fontSize: 16, textAlignVertical: 'top' },
  speichernButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 12, marginTop: 8, gap: 12 },
  speichernButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});