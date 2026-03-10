import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { getItem, setItem } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

const INTERVALLE = ['monatlich', 'wöchentlich', 'jährlich'];

export default function AbosScreen() {
  const { currentTheme } = useTheme();
  const [abos, setAbos] = useState([]);
  const [name, setName] = useState('');
  const [betrag, setBetrag] = useState('');
  const [intervall, setIntervall] = useState('monatlich');

  useFocusEffect(React.useCallback(() => { ladeAbos(); }, []));

  const ladeAbos = async () => {
    try {
      const currentUserJson = await getItem('currentUser');
      if (!currentUserJson) return;
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      const gespeicherteAbos = await getItem('abos');
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
      const currentUserJson = await getItem('currentUser');
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
        intervall,
        lastProcessed: new Date().toISOString(),
      };

      const gespeicherteAbos = await getItem('abos');
      const alleAbos = gespeicherteAbos ? JSON.parse(gespeicherteAbos) : [];
      alleAbos.push(neuesAbo);
      await setItem('abos', JSON.stringify(alleAbos));

      Alert.alert('✅ Erfolg', 'Abonnement wurde erfolgreich gespeichert!');
      setName('');
      setBetrag('');
      setIntervall('monatlich');
      ladeAbos();
    } catch (error) {
      Alert.alert('Fehler', 'Abonnement konnte nicht gespeichert werden.');
      console.error(error);
    }
  };

  const loescheAbo = async (id) => {
    try {
      const gespeicherteAbos = await getItem('abos');
      if (gespeicherteAbos) {
        let alleAbos = JSON.parse(gespeicherteAbos);
        alleAbos = alleAbos.filter(abo => abo.id !== id);
        await setItem('abos', JSON.stringify(alleAbos));
        ladeAbos();
      }
    } catch (error) {
      Alert.alert('Fehler', 'Abonnement konnte nicht gelöscht werden.');
      console.error(error);
    }
  };

  const intervallLabel = (i) => {
    if (i === 'wöchentlich') return '/ Woche';
    if (i === 'jährlich') return '/ Jahr';
    return '/ Monat';
  };

  const renderItem = ({ item }) => (
    <View style={[styles.aboItem, { backgroundColor: currentTheme.cardBackground, borderBottomColor: currentTheme.border }]}>
      <Ionicons name="repeat-outline" size={24} color={currentTheme.primary} />
      <View style={styles.aboInfo}>
        <Text style={[styles.aboName, { color: currentTheme.text }]}>{item.name}</Text>
        <Text style={[styles.aboBetrag, { color: currentTheme.textSecondary }]}>
          {item.betrag.toFixed(2)} € {intervallLabel(item.intervall || 'monatlich')}
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
          placeholder="Betrag"
          placeholderTextColor={currentTheme.textSecondary}
          keyboardType="decimal-pad"
          value={betrag}
          onChangeText={setBetrag}
        />
        <Text style={[styles.intervallLabel, { color: currentTheme.text }]}>Intervall</Text>
        <View style={styles.intervallContainer}>
          {INTERVALLE.map((iv) => (
            <TouchableOpacity
              key={iv}
              style={[
                styles.intervallButton,
                {
                  backgroundColor: intervall === iv ? currentTheme.primary : currentTheme.surface,
                  borderColor: intervall === iv ? currentTheme.primary : currentTheme.border,
                },
              ]}
              onPress={() => setIntervall(iv)}
            >
              <Text style={[styles.intervallButtonText, { color: intervall === iv ? '#fff' : currentTheme.text }]}>
                {iv.charAt(0).toUpperCase() + iv.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  intervallLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  intervallContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  intervallButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  intervallButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
