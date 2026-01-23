import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function AbosScreen() {
  const { currentTheme } = useTheme();
  const [abos, setAbos] = useState([]);
  const [name, setName] = useState('');
  const [betrag, setBetrag] = useState('');

  useEffect(() => {
    ladeAbos();
  }, []);

  const ladeAbos = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) return;
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      const gespeicherteAbos = await AsyncStorage.getItem('abos');
      if (gespeicherteAbos) {
        const alleAbos = JSON.parse(gespeicherteAbos);
        const userAbos = alleAbos.filter(abo => abo.userEmail === userEmail);
        setAbos(userAbos);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Abos:', error);
    }
  };

  const speichereAbo = async () => {
    if (!name || !betrag || parseFloat(betrag) <= 0) {
      Alert.alert('Fehler', 'Bitte geben Sie einen gültigen Namen und Betrag ein.');
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

      const neuesAbo = {
        id: Date.now().toString(),
        name,
        betrag: parseFloat(betrag),
        userEmail,
        lastProcessed: new Date().toISOString(), // Initial auf heute setzen
      };

      const gespeicherteAbos = await AsyncStorage.getItem('abos');
      const alleAbos = gespeicherteAbos ? JSON.parse(gespeicherteAbos) : [];
      alleAbos.push(neuesAbo);
      await AsyncStorage.setItem('abos', JSON.stringify(alleAbos));

      Alert.alert('✅ Erfolg', 'Abonnement wurde erfolgreich gespeichert!');
      setName('');
      setBetrag('');
      ladeAbos();
    } catch (error) {
      Alert.alert('Fehler', 'Abonnement konnte nicht gespeichert werden.');
      console.error(error);
    }
  };

  const loescheAbo = async (id) => {
    try {
      const gespeicherteAbos = await AsyncStorage.getItem('abos');
      if (gespeicherteAbos) {
        let alleAbos = JSON.parse(gespeicherteAbos);
        alleAbos = alleAbos.filter(abo => abo.id !== id);
        await AsyncStorage.setItem('abos', JSON.stringify(alleAbos));
        ladeAbos();
      }
    } catch (error) {
      Alert.alert('Fehler', 'Abonnement konnte nicht gelöscht werden.');
      console.error(error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.aboItem, { backgroundColor: currentTheme.cardBackground, borderBottomColor: currentTheme.border }]}>
      <Ionicons name="repeat-outline" size={24} color={currentTheme.primary} />
      <View style={styles.aboInfo}>
        <Text style={[styles.aboName, { color: currentTheme.text }]}>{item.name}</Text>
        <Text style={[styles.aboBetrag, { color: currentTheme.textSecondary }]}>
          {item.betrag.toFixed(2)} € / Monat
        </Text>
      </View>
      <TouchableOpacity onPress={() => loescheAbo(item.id)}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.formCard, { backgroundColor: currentTheme.cardBackground }]}>
        <Text style={[styles.formTitle, { color: currentTheme.text }]}>Neues Abo hinzufügen</Text>
        <TextInput
          style={[styles.input, { color: currentTheme.text, borderColor: currentTheme.border }]}
          placeholder="Name des Abos (z.B. Netflix)"
          placeholderTextColor={currentTheme.textSecondary}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { color: currentTheme.text, borderColor: currentTheme.border }]}
          placeholder="Monatlicher Betrag"
          placeholderTextColor={currentTheme.textSecondary}
          keyboardType="decimal-pad"
          value={betrag}
          onChangeText={setBetrag}
        />
        <TouchableOpacity style={[styles.speichernButton, { backgroundColor: currentTheme.primary }]} onPress={speichereAbo}>
          <Text style={styles.speichernButtonText}>Abo speichern</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={abos}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="reader-outline" size={48} color={currentTheme.textSecondary} />
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
              Keine Abonnements gefunden.
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formCard: {
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  speichernButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  speichernButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  aboItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  aboInfo: {
    flex: 1,
    marginLeft: 16,
  },
  aboName: {
    fontSize: 16,
    fontWeight: '600',
  },
  aboBetrag: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});
