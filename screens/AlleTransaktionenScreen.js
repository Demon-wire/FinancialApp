import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';

// Kategorien und Konten Definitionen bleiben hier, da keine zentrale Datei mehr existiert
const KONTEN = [
  { name: 'Alle', icon: 'apps-outline' },
  { name: 'Girokonto', icon: 'card-outline' },
  { name: 'Brieftasche', icon: 'wallet-outline' },
  { name: 'Sparbuch', icon: 'book-outline' },
  { name: 'Kreditkarte', icon: 'card' },
];

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
    let categories = type === 'einnahme' ? KATEGORIEN_EINNAHMEN : KATEGORIEN_AUSGABEN;
    const foundCategory = categories.find(cat => cat.name === categoryName);
    return foundCategory || { name: categoryName, icon: 'ellipse-outline', color: '#9E9E9E' };
}

export default function AlleTransaktionenScreen() {
  const { currentTheme } = useTheme();
  const navigation = useNavigation();
  const [transaktionen, setTransaktionen] = useState([]);
  const [gefilterteTransaktionen, setGefilterteTransaktionen] = useState([]);
  const [aktivesKonto, setAktivesKonto] = useState('Alle');
  const openSwipeableRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      ladeDaten();
      return () => {
        if (openSwipeableRef.current) {
          openSwipeableRef.current.close();
        }
      };
    }, [])
  );

  useEffect(() => {
    if (aktivesKonto === 'Alle') {
      setGefilterteTransaktionen(transaktionen);
    } else {
      const gefiltert = transaktionen.filter(t => t.konto === aktivesKonto);
      setGefilterteTransaktionen(gefiltert);
    }
  }, [aktivesKonto, transaktionen]);

  const ladeDaten = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) return;
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      const einnahmenJson = await AsyncStorage.getItem('einnahmen');
      const ausgabenJson = await AsyncStorage.getItem('ausgaben');

      const einnahmen = einnahmenJson ? JSON.parse(einnahmenJson) : [];
      const ausgaben = ausgabenJson ? JSON.parse(ausgabenJson) : [];

      const userEinnahmen = einnahmen
        .filter(e => e.userEmail === userEmail)
        .map(e => ({ ...e, typ: 'einnahme', icon: getCategoryDetails(e.kategorie, 'einnahme').icon, color: getCategoryDetails(e.kategorie, 'einnahme').color, konto: e.konto || 'Unbekannt' }));

      const userAusgaben = ausgaben
        .filter(a => a.userEmail === userEmail)
        .map(a => ({ ...a, typ: 'ausgabe', icon: getCategoryDetails(a.kategorie, 'ausgabe').icon, color: getCategoryDetails(a.kategorie, 'ausgabe').color, konto: a.konto || 'Unbekannt' }));
      
      const alleTransaktionen = [...userEinnahmen, ...userAusgaben].sort((a, b) => new Date(b.datum) - new Date(a.datum));
      
      setTransaktionen(alleTransaktionen);
    } catch (error) {
      console.error('Fehler beim Laden der Transaktionen:', error);
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Transaktion löschen",
      `Möchten Sie die ${item.typ} "${item.kategorie}" über ${item.betrag.toFixed(2)}€ wirklich löschen?`,
      [
        { text: "Abbrechen", style: "cancel", onPress: () => openSwipeableRef.current?.close() },
        {
          text: "Löschen",
          onPress: async () => {
            try {
              const storageKey = item.typ === 'einnahme' ? 'einnahmen' : 'ausgaben';
              const jsonValue = await AsyncStorage.getItem(storageKey);
              let items = jsonValue ? JSON.parse(jsonValue) : [];
              const filteredItems = items.filter(i => i.id !== item.id);
              await AsyncStorage.setItem(storageKey, JSON.stringify(filteredItems));
              ladeDaten();
            } catch (e) {
              Alert.alert("Fehler", "Transaktion konnte nicht gelöscht werden.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };
  
  const handleEdit = (item) => {
    openSwipeableRef.current?.close();
    navigation.navigate('EditTransaction', { 
      transactionId: item.id,
      transactionType: item.typ 
    });
  };

  const formatDatum = (datumString) => {
    const datum = new Date(datumString);
    return datum.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderRightActions = (progress, dragX, item) => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
        <Ionicons name="pencil-outline" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      overshootRight={false}
      onSwipeableWillOpen={() => {
        // This is a placeholder to potentially add logic back later if needed
      }}
    >
      <View style={[styles.transaktionItem, { borderBottomColor: currentTheme.border, backgroundColor: currentTheme.cardBackground }]}>
        <View style={[styles.iconContainer, { backgroundColor: `${getCategoryDetails(item.kategorie, item.typ).color}20` }]}>
          <Ionicons name={getCategoryDetails(item.kategorie, item.typ).icon} size={24} color={getCategoryDetails(item.kategorie, item.typ).color} />
        </View>
        <View style={styles.transaktionInfo}>
          <Text style={[styles.transaktionKategorie, { color: currentTheme.text }]}>{item.kategorie}</Text>
          <Text style={[styles.transaktionDatum, { color: currentTheme.textSecondary }]}>{formatDatum(item.datum)} - {item.konto || 'Unbekannt'}</Text>
        </View>
        <Text style={[styles.transaktionBetrag, { color: item.typ === 'einnahme' ? '#4CAF50' : '#F44336' }]}>
          {item.typ === 'einnahme' ? '+' : '-'} {item.betrag.toFixed(2)} €
        </Text>
      </View>
    </Swipeable>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.headerCard, { backgroundColor: currentTheme.cardBackground }]}>
        <View style={styles.headerTitleRow}>
            <Ionicons name="list-outline" size={32} color={currentTheme.primary} />
            <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Alle Transaktionen</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kontenFilterContainer}>
          {KONTEN.map(konto => (
            <TouchableOpacity 
              key={konto.name}
              style={[styles.kontoButton, { backgroundColor: aktivesKonto === konto.name ? currentTheme.primary : currentTheme.surface, borderColor: currentTheme.border }]}
              onPress={() => setAktivesKonto(konto.name)}
            >
              <Ionicons name={konto.icon} size={18} color={aktivesKonto === konto.name ? '#fff' : currentTheme.textSecondary} />
              <Text style={[styles.kontoButtonText, { color: aktivesKonto === konto.name ? '#fff' : currentTheme.text }]}>{konto.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={gefilterteTransaktionen}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={currentTheme.textSecondary} />
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>Keine Transaktionen gefunden.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerCard: { paddingTop: 20, paddingBottom: 20, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    kontenFilterContainer: { gap: 12 },
    kontoButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 6 },
    kontoButtonText: { fontSize: 14, fontWeight: '600' },
    transaktionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
    iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    transaktionInfo: { flex: 1 },
    transaktionKategorie: { fontSize: 16, fontWeight: 'bold' },
    transaktionDatum: { fontSize: 12 },
    transaktionBetrag: { fontSize: 16, fontWeight: 'bold' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { marginTop: 16, fontSize: 16 },
    actionsContainer: { flexDirection: 'row', width: 140 },
    editButton: { flex: 1, backgroundColor: '#FF9800', justifyContent: 'center', alignItems: 'center' },
    deleteButton: { flex: 1, backgroundColor: '#F44336', justifyContent: 'center', alignItems: 'center' },
});
