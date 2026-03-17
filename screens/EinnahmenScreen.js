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
import { getItem, setItem } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const KONTEN = [
  { name: 'Girokonto', icon: 'card-outline' },
  { name: 'Brieftasche', icon: 'wallet-outline' },
  { name: 'Sparbuch', icon: 'book-outline' },
  { name: 'Kreditkarte', icon: 'card' },
];

const KATEGORIEN = [
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

export default function EinnahmenScreen() {
  const { currentTheme } = useTheme();
  const { t, tName } = useLanguage();
  const [betrag, setBetrag] = useState('');
  const [kategorie, setKategorie] = useState('Gehalt');
  const [notiz, setNotiz] = useState('');
  const [konto, setKonto] = useState('Girokonto');

  const speichereEinnahme = async () => {
    if (!betrag || parseFloat(betrag) <= 0) {
      Alert.alert(t('common.error'), t('common.invalidAmount'));
      return;
    }

    try {
      const currentUserJson = await getItem('currentUser');
      if (!currentUserJson) {
        Alert.alert(t('common.error'), t('common.notLoggedIn'));
        return;
      }
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      const neueEinnahme = {
        id: Date.now().toString(),
        betrag: parseFloat(betrag),
        kategorie: kategorie,
        notiz: notiz,
        konto: konto,
        datum: new Date().toISOString(),
        userEmail: userEmail,
        typ: 'einnahme',
      };

      const gespeicherteEinnahmen = await getItem('einnahmen');
      const einnahmen = gespeicherteEinnahmen ? JSON.parse(gespeicherteEinnahmen) : [];
      einnahmen.push(neueEinnahme);
      await setItem('einnahmen', JSON.stringify(einnahmen));

      Alert.alert(t('common.success'), t('income.saved'));
      setBetrag('');
      setNotiz('');
      setKategorie('Gehalt');
      setKonto('Girokonto');
    } catch (error) {
      Alert.alert(t('common.error'), t('income.saveError'));
      console.error(error);
    }
  };

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
          <Ionicons name="add-circle" size={48} color="#fff" />
          <Text style={styles.headerTitle}>{t('income.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('income.subtitle')}</Text>
        </View>

        {/* Form Card */}
        <View style={[styles.formCard, { backgroundColor: currentTheme.cardBackground }]}>
          {/* Betrag Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="cash" size={20} color={currentTheme.primary} />
              <Text style={[styles.label, { color: currentTheme.text }]}>{t('common.amount')}</Text>
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
              <Text style={[styles.label, { color: currentTheme.text }]}>{t('common.account')}</Text>
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
                      {tName(k.name)}
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
              <Text style={[styles.label, { color: currentTheme.text }]}>{t('common.category')}</Text>
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
                      {tName(kat.name)}
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
              <Text style={[styles.label, { color: currentTheme.text }]}>{t('common.note')}</Text>
            </View>
            <View style={[styles.notizContainer, { borderColor: currentTheme.border }]}>
              <TextInput
                style={[styles.notizInput, { color: currentTheme.text }]}
                placeholder={t('common.notePlaceholder')}
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
            onPress={speichereEinnahme}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.speichernButtonText}>{t('income.saveButton')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerCard: {
    borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  headerSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9, marginTop: 4 },
  formCard: {
    borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  inputGroup: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  amountContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 12, paddingHorizontal: 16, height: 60,
  },
  currencySymbol: { fontSize: 24, fontWeight: 'bold', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: 'bold' },
  kategorienContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kategorieButton: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 12, gap: 8, minWidth: 140,
  },
  kategorieText: { fontSize: 14 },
  notizContainer: { borderWidth: 2, borderRadius: 12, padding: 16, minHeight: 100 },
  notizInput: { fontSize: 16, textAlignVertical: 'top' },
  speichernButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 18, borderRadius: 12, marginTop: 8, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  speichernButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
