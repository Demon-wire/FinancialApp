import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const KONTEN = [
  { name: 'Girokonto', icon: 'card-outline' },
  { name: 'Brieftasche', icon: 'wallet-outline' },
  { name: 'Sparbuch', icon: 'book-outline' },
  { name: 'Kreditkarte', icon: 'card' },
]

const KATEGORIEN = [
  { name: 'Miete', icon: 'home-outline', color: '#FF5722' },
  { name: 'Lebensmittel', icon: 'cart-outline', color: '#FFC107' },
  { name: 'Transport', icon: 'bus-outline', color: '#03A9F4' },
  { name: 'Freizeit', icon: 'game-controller-outline', color: '#4CAF50' },
  { name: 'Haushalt', icon: 'basket-outline', color: '#673AB7' },
  { name: 'Gesundheit', icon: 'medkit-outline', color: '#E91E63' },
  { name: 'Bildung', icon: 'school-outline', color: '#009688' },
  { name: 'Kleidung', icon: 'shirt-outline', color: '#9C27B0' },
  { name: 'Versicherung', icon: 'shield-checkmark-outline', color: '#3F51B5' },
  { name: 'Sonstiges', icon: 'ellipse-outline', color: '#9E9E9E' },
];

export default function AusgabenScreen() {
  const { currentTheme } = useTheme();
  const [betrag, setBetrag] = useState('');
  const [kategorie, setKategorie] = useState('Miete');
  const [notiz, setNotiz] = useState('');
  const [konto, setKonto] = useState('Girokonto');

  const speichereAusgabe = async () => {
    if (!betrag || parseFloat(betrag) <= 0) {
      Alert.alert('Fehler', 'Bitte geben Sie einen gültigen Betrag ein.');
      return;
    }

    try {
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) {
        Alert.alert('Fehler', 'Sie sind nicht angemeldet.');
        return;
      }
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      const neueAusgabe = {
        id: Date.now().toString(),
        betrag: parseFloat(betrag),
        kategorie: kategorie,
        notiz: notiz,
        konto: konto,
        datum: new Date().toISOString(),
        userEmail: userEmail,
        typ: 'ausgabe',
      };

      const gespeicherteAusgaben = await AsyncStorage.getItem('ausgaben');
      const ausgaben = gespeicherteAusgaben ? JSON.parse(gespeicherteAusgaben) : [];
      ausgaben.push(neueAusgabe);
      await AsyncStorage.setItem('ausgaben', JSON.stringify(ausgaben));

      Alert.alert('✅ Erfolg', 'Ausgabe wurde erfolgreich gespeichert!');
      setBetrag('');
      setNotiz('');
      setKategorie('Miete');
      setKonto('Girokonto');
    } catch (error) {
      Alert.alert('Fehler', 'Ausgabe konnte nicht gespeichert werden.');
      console.error(error);
    }
  };

  const selectedCategory = KATEGORIEN.find(kat => kat.name === kategorie);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: currentTheme.primary }]}>
          <Ionicons name="remove-circle" size={48} color="#fff" />
          <Text style={styles.headerTitle}>Neue Ausgabe</Text>
          <Text style={styles.headerSubtitle}>Erfasse deine Ausgaben schnell und einfach</Text>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: currentTheme.cardBackground }]}>
          {/* Betrag Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="cash" size={20} color={currentTheme.primary} />
              <Text style={[styles.label, { color: currentTheme.text }]}>Betrag</Text>
            </View>
            <View style={[styles.amountContainer, { borderColor: currentTheme.border }]}>
              <Text style={[styles.currencySymbol, { color: currentTheme.textSecondary }]}>€</Text>
              <TextInput
                style={[styles.amountInput, { color: currentTheme.text }]}
                placeholder="0.00"
                placeholderTextColor={currentTheme.textSecondary}
                keyboardType="decimal-pad"
                value={betrag}
                onChangeText={setBetrag}
              />
            </View>
          </View>

          {/* Konten */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="server-outline" size={20} color={currentTheme.primary} />
              <Text style={[styles.label, { color: currentTheme.text }]}>Konto</Text>
            </View>
            <View style={styles.kategorienContainer}>
              {KONTEN.map((k) => {
                const isSelected = konto === k.name;
                return (
                  <TouchableOpacity
                    key={k.name}
                    style={[
                      styles.kategorieButton,
                      {
                        backgroundColor: isSelected ? currentTheme.primary : currentTheme.surface,
                        borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setKonto(k.name)}
                  >
                    <Ionicons 
                      name={k.icon} 
                      size={24} 
                      color={isSelected ? '#fff' : currentTheme.primary} 
                    />
                    <Text
                      style={[
                        styles.kategorieText,
                        {
                          color: isSelected ? '#fff' : currentTheme.text,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {k.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Kategorien */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="grid" size={20} color={currentTheme.primary} />
              <Text style={[styles.label, { color: currentTheme.text }]}>Kategorie</Text>
            </View>
            <View style={styles.kategorienContainer}>
              {KATEGORIEN.map((kat) => {
                const isSelected = kategorie === kat.name;
                return (
                  <TouchableOpacity
                    key={kat.name}
                    style={[
                      styles.kategorieButton,
                      {
                        backgroundColor: isSelected ? currentTheme.primary : currentTheme.surface,
                        borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setKategorie(kat.name)}
                  >
                    <Ionicons 
                      name={kat.icon} 
                      size={24} 
                      color={isSelected ? '#fff' : kat.color} 
                    />
                    <Text
                      style={[
                        styles.kategorieText,
                        {
                          color: isSelected ? '#fff' : currentTheme.text,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {kat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Notiz Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="document-text-outline" size={20} color={currentTheme.primary} />
              <Text style={[styles.label, { color: currentTheme.text }]}>Notiz (optional)</Text>
            </View>
            <View style={[styles.notizContainer, { borderColor: currentTheme.border }]}>
              <TextInput
                style={[styles.notizInput, { color: currentTheme.text }]}
                placeholder="Zusätzliche Informationen..."
                placeholderTextColor={currentTheme.textSecondary}
                multiline
                numberOfLines={4}
                value={notiz}
                onChangeText={setNotiz}
              />
            </View>
          </View>

          {/* Speichern Button */}
          <TouchableOpacity 
            style={[styles.speichernButton, { backgroundColor: currentTheme.primary }]}
            onPress={speichereAusgabe}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.speichernButtonText}>Ausgabe speichern</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 60,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
  },
  kategorienContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kategorieButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    minWidth: 140,
  },
  kategorieText: {
    fontSize: 14,
  },
  notizContainer: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
  },
  notizInput: {
    fontSize: 16,
    textAlignVertical: 'top',
  },
  speichernButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  speichernButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
