import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { getItem, setItem } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';

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

// Internal period keys
const ZEITRAEUME = ['monat', 'woche'];

export default function BudgetScreen() {
  const { currentTheme } = useTheme();
  const { t, tName } = useLanguage();
  const [budgets, setBudgets] = useState([]);
  const [ausgaben, setAusgaben] = useState([]);
  const [selectedKategorie, setSelectedKategorie] = useState(KATEGORIEN_AUSGABEN[0].name);
  const [betragLimit, setBetragLimit] = useState('');
  const [zeitraum, setZeitraum] = useState('monat');
  const [userEmail, setUserEmail] = useState('');

  useFocusEffect(React.useCallback(() => { ladeDaten(); }, []));

  const ladeDaten = async () => {
    try {
      const currentUserJson = await getItem('currentUser');
      if (!currentUserJson) return;
      const currentUser = JSON.parse(currentUserJson);
      setUserEmail(currentUser.email);

      const budgetsJson = await getItem('budgets');
      const alleBudgets = budgetsJson ? JSON.parse(budgetsJson) : [];
      setBudgets(alleBudgets.filter(b => b.userEmail === currentUser.email));

      const ausgabenJson = await getItem('ausgaben');
      const alleAusgaben = ausgabenJson ? JSON.parse(ausgabenJson) : [];
      setAusgaben(alleAusgaben.filter(a => a.userEmail === currentUser.email));
    } catch (error) {
      console.error('Fehler beim Laden der Budgets:', error);
    }
  };

  const speichereBudget = async () => {
    if (!betragLimit || parseFloat(betragLimit) <= 0) {
      Alert.alert(t('common.error'), t('budget.invalidLimit'));
      return;
    }

    try {
      const neuesBudget = {
        id: Date.now().toString(),
        userEmail,
        kategorie: selectedKategorie,
        betragLimit: parseFloat(betragLimit),
        zeitraum,
      };

      const budgetsJson = await getItem('budgets');
      const alleBudgets = budgetsJson ? JSON.parse(budgetsJson) : [];

      const ohneAltes = alleBudgets.filter(
        b => !(b.userEmail === userEmail && b.kategorie === selectedKategorie && b.zeitraum === zeitraum)
      );
      ohneAltes.push(neuesBudget);
      await setItem('budgets', JSON.stringify(ohneAltes));

      Alert.alert(t('common.success'), t('budget.saved'));
      setBetragLimit('');
      ladeDaten();
    } catch (error) {
      Alert.alert(t('common.error'), t('budget.saveError'));
      console.error(error);
    }
  };

  const loescheBudget = async (id) => {
    try {
      const budgetsJson = await getItem('budgets');
      const alleBudgets = budgetsJson ? JSON.parse(budgetsJson) : [];
      await setItem('budgets', JSON.stringify(alleBudgets.filter(b => b.id !== id)));
      ladeDaten();
    } catch (error) {
      console.error(error);
    }
  };

  const berechneVerbrauch = (budget) => {
    const jetzt = new Date();
    let startDatum;
    if (budget.zeitraum === 'woche') {
      startDatum = new Date(jetzt.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDatum = new Date(jetzt.getFullYear(), jetzt.getMonth(), 1);
    }
    return ausgaben
      .filter(a => a.kategorie === budget.kategorie && new Date(a.datum) >= startDatum)
      .reduce((sum, a) => sum + a.betrag, 0);
  };

  const getBalkenFarbe = (verbrauch, limit) => {
    const prozent = verbrauch / limit;
    if (prozent >= 1) return '#F44336';
    if (prozent >= 0.8) return '#FF9800';
    return '#4CAF50';
  };

  const getCategoryDetails = (name) =>
    KATEGORIEN_AUSGABEN.find(k => k.name === name) || { icon: 'ellipse-outline', color: '#9E9E9E' };

  const renderBudget = ({ item }) => {
    const verbrauch = berechneVerbrauch(item);
    const prozent = Math.min(verbrauch / item.betragLimit, 1);
    const farbe = getBalkenFarbe(verbrauch, item.betragLimit);
    const cat = getCategoryDetails(item.kategorie);

    return (
      <View style={[styles.budgetItem, { backgroundColor: currentTheme.cardBackground }]}>
        <View style={styles.budgetHeader}>
          <View style={[styles.catIcon, { backgroundColor: `${cat.color}20` }]}>
            <Ionicons name={cat.icon} size={20} color={cat.color} />
          </View>
          <View style={styles.budgetInfo}>
            <Text style={[styles.budgetKategorie, { color: currentTheme.text }]}>{tName(item.kategorie)}</Text>
            <Text style={[styles.budgetZeitraum, { color: currentTheme.textSecondary }]}>
              {item.zeitraum === 'monat' ? t('budget.thisMonth') : t('budget.thisWeek')}
            </Text>
          </View>
          <View style={styles.budgetBetraege}>
            <Text style={[styles.budgetVerbrauch, { color: farbe }]}>{verbrauch.toFixed(2)} €</Text>
            <Text style={[styles.budgetLimit, { color: currentTheme.textSecondary }]}>{t('budget.of')} {item.betragLimit.toFixed(2)} €</Text>
          </View>
          <TouchableOpacity onPress={() => loescheBudget(item.id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </View>
        <View style={[styles.progressBar, { backgroundColor: currentTheme.border }]}>
          <View style={[styles.progressFill, { width: `${prozent * 100}%`, backgroundColor: farbe }]} />
        </View>
        <Text style={[styles.prozentText, { color: farbe }]}>
          {(prozent * 100).toFixed(0)}% {t('budget.used')}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView>
        {/* Formular */}
        <View style={[styles.formCard, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.formHeaderRow}>
            <Ionicons name="pie-chart-outline" size={28} color={currentTheme.primary} />
            <Text style={[styles.formTitle, { color: currentTheme.text }]}>{t('budget.newBudget')}</Text>
          </View>

          <Text style={[styles.fieldLabel, { color: currentTheme.text }]}>{t('budget.category')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kategorienScroll}>
            {KATEGORIEN_AUSGABEN.map(kat => (
              <TouchableOpacity
                key={kat.name}
                style={[
                  styles.kategorieChip,
                  {
                    backgroundColor: selectedKategorie === kat.name ? currentTheme.primary : currentTheme.surface,
                    borderColor: selectedKategorie === kat.name ? currentTheme.primary : currentTheme.border,
                  },
                ]}
                onPress={() => setSelectedKategorie(kat.name)}
              >
                <Ionicons name={kat.icon} size={16} color={selectedKategorie === kat.name ? '#fff' : kat.color} />
                <Text style={[styles.kategorieChipText, { color: selectedKategorie === kat.name ? '#fff' : currentTheme.text }]}>
                  {tName(kat.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.fieldLabel, { color: currentTheme.text }]}>{t('budget.limit')}</Text>
          <View style={[styles.inputContainer, { borderColor: currentTheme.border }]}>
            <Text style={[styles.currencySymbol, { color: currentTheme.textSecondary }]}>€</Text>
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder="0.00"
              placeholderTextColor={currentTheme.textSecondary}
              keyboardType="decimal-pad"
              value={betragLimit}
              onChangeText={setBetragLimit}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: currentTheme.text }]}>{t('budget.period')}</Text>
          <View style={styles.zeitraumRow}>
            {ZEITRAEUME.map(z => (
              <TouchableOpacity
                key={z}
                style={[
                  styles.zeitraumButton,
                  {
                    backgroundColor: zeitraum === z ? currentTheme.primary : currentTheme.surface,
                    borderColor: zeitraum === z ? currentTheme.primary : currentTheme.border,
                  },
                ]}
                onPress={() => setZeitraum(z)}
              >
                <Text style={[styles.zeitraumText, { color: zeitraum === z ? '#fff' : currentTheme.text }]}>
                  {z === 'monat' ? t('budget.month') : t('budget.week')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: currentTheme.primary }]}
            onPress={speichereBudget}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>{t('budget.saveButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* Budget-Liste */}
        {budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pie-chart-outline" size={48} color={currentTheme.textSecondary} />
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
              {t('budget.empty')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={budgets}
            renderItem={renderBudget}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  formCard: {
    margin: 16, padding: 20, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  formHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  formTitle: { fontSize: 20, fontWeight: 'bold' },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  kategorienScroll: { marginBottom: 12 },
  kategorieChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, marginRight: 8, gap: 6,
  },
  kategorieChipText: { fontSize: 13 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 12,
    paddingHorizontal: 16, height: 52, marginBottom: 12,
  },
  currencySymbol: { fontSize: 20, fontWeight: 'bold', marginRight: 8 },
  input: { flex: 1, fontSize: 20, fontWeight: 'bold' },
  zeitraumRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  zeitraumButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  zeitraumText: { fontSize: 14, fontWeight: '600' },
  saveButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  budgetItem: {
    borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  budgetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  catIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  budgetInfo: { flex: 1 },
  budgetKategorie: { fontSize: 15, fontWeight: '700' },
  budgetZeitraum: { fontSize: 12 },
  budgetBetraege: { alignItems: 'flex-end', marginRight: 8 },
  budgetVerbrauch: { fontSize: 15, fontWeight: 'bold' },
  budgetLimit: { fontSize: 12 },
  deleteBtn: { padding: 4 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 4 },
  prozentText: { fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 16 },
});
