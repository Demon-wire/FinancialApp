import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { getItem } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

export default function GewinnScreen() {
  const { currentTheme } = useTheme();
  const [einnahmen, setEinnahmen] = useState([]);
  const [ausgaben, setAusgaben] = useState([]);
  const [abos, setAbos] = useState([]);
  const [zeitraum, setZeitraum] = useState('monat');

  useFocusEffect(
    React.useCallback(() => {
      ladeDaten();
    }, [])
  );

  const ladeDaten = async () => {
    try {
      const currentUserJson = await getItem('currentUser');
      if (!currentUserJson) {
        setEinnahmen([]);
        setAusgaben([]);
        setAbos([]);
        return;
      }
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      // Lade Einnahmen
      const gespeicherteEinnahmen = await getItem('einnahmen');
      if (gespeicherteEinnahmen) {
        const alleEinnahmen = JSON.parse(gespeicherteEinnahmen);
        const einnahmenListe = alleEinnahmen.filter(
          (e) => e.userEmail === userEmail
        );
        setEinnahmen(einnahmenListe);
      } else {
        setEinnahmen([]);
      }

      // Lade Ausgaben
      const gespeicherteAusgaben = await getItem('ausgaben');
      if (gespeicherteAusgaben) {
        const alleAusgaben = JSON.parse(gespeicherteAusgaben);
        const ausgabenListe = alleAusgaben.filter(
          (a) => a.userEmail === userEmail
        );
        setAusgaben(ausgabenListe);
      } else {
        setAusgaben([]);
      }

      // Lade Abos
      const gespeicherteAbos = await getItem('abos');
      if (gespeicherteAbos) {
        const alleAbos = JSON.parse(gespeicherteAbos);
        const abosListe = alleAbos.filter(
          (a) => a.userEmail === userEmail
        );
        setAbos(abosListe);
      } else {
        setAbos([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      setEinnahmen([]);
      setAusgaben([]);
      setAbos([]);
    }
  };

  const filtereNachZeitraum = (transaktionen) => {
    const jetzt = new Date();
    let startDatum;

    switch (zeitraum) {
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
        startDatum = new Date(jetzt.getFullYear(), jetzt.getMonth(), 1);
    }

    return transaktionen.filter((t) => {
      const transaktionsDatum = new Date(t.datum);
      return transaktionsDatum >= startDatum;
    });
  };

  const berechneGewinn = () => {
    const gefilterteEinnahmen = filtereNachZeitraum(einnahmen);
    const totalEinnahmen = gefilterteEinnahmen.reduce((sum, t) => sum + t.betrag, 0);

    const gefilterteAusgaben = filtereNachZeitraum(ausgaben);
    const totalAusgaben = gefilterteAusgaben.reduce((sum, t) => sum + t.betrag, 0);

    const totalAbos = abos.reduce((sum, abo) => {
        const aboStart = new Date(abo.lastProcessed || abo.datum);
        const jetzt = new Date();
        const intervall = abo.intervall || 'monatlich';

        // Monatlicher Äquivalentbetrag je nach Intervall
        let monatsBetrag;
        if (intervall === 'wöchentlich') {
          monatsBetrag = abo.betrag * (52 / 12); // ~4.33 Wochen/Monat
        } else if (intervall === 'jährlich') {
          monatsBetrag = abo.betrag / 12;
        } else {
          monatsBetrag = abo.betrag;
        }

        switch (zeitraum) {
          case 'woche': {
            if (intervall === 'wöchentlich') {
              return sum + abo.betrag;
            }
            return sum + monatsBetrag * (7 / 30);
          }
          case 'monat': {
            if (aboStart <= jetzt) {
              return sum + monatsBetrag;
            }
            return sum;
          }
          case 'jahr': {
            let monate = 0;
            for (let m = 0; m <= jetzt.getMonth(); m++) {
              const aboAktiv = new Date(aboStart.getFullYear(), aboStart.getMonth(), 1) <= new Date(jetzt.getFullYear(), m, 1);
              if (aboAktiv) monate++;
            }
            if (intervall === 'wöchentlich') {
              const wochen = Math.floor(monate * (52 / 12));
              return sum + abo.betrag * wochen;
            } else if (intervall === 'jährlich') {
              return sum + (monate >= 1 ? abo.betrag : 0);
            }
            return sum + monatsBetrag * monate;
          }
          default:
            return sum;
        }
      }, 0);

    const totalAufwendungen = totalAusgaben + totalAbos;
    const gewinn = totalEinnahmen - totalAufwendungen;

    return { totalEinnahmen, totalAufwendungen, gewinn };
  };

  const { totalEinnahmen, totalAufwendungen, gewinn } = berechneGewinn();

  const zeitraumLabels = {
    woche: 'Letzte Woche',
    monat: 'Dieser Monat',
    jahr: 'Dieses Jahr',
  };

  const zeitraumIcons = {
    woche: 'calendar-outline',
    monat: 'calendar',
    jahr: 'calendar-number',
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerCard, { backgroundColor: currentTheme.cardBackground }]}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="calculator-outline" size={32} color={currentTheme.primary} />
          <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Gewinnübersicht</Text>
        </View>
        <View style={styles.zeitraumButtons}>
          {['woche', 'monat', 'jahr'].map((z) => (
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
                {z.charAt(0).toUpperCase() + z.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statistikContainer}>
        {/* Gewinn-Box */}
        <View style={[styles.gesamtBox, { backgroundColor: gewinn >= 0 ? '#4CAF50' : '#F44336' }]}>
          <Ionicons name={gewinn >= 0 ? 'trending-up-outline' : 'trending-down-outline'} size={40} color="#fff" />
          <Text style={styles.gesamtLabel}>Gewinn ({zeitraumLabels[zeitraum]})</Text>
          <Text style={styles.gesamtBetrag}>{gewinn.toFixed(2)} €</Text>
        </View>
        
        <View style={[styles.detailsBox, { backgroundColor: currentTheme.cardBackground}]}>
            {/* Einnahmen */}
            <View style={styles.detailItem}>
                <View style={styles.detailTextContainer}>
                    <Ionicons name="arrow-up-circle-outline" size={24} color={'#4CAF50'} />
                    <Text style={[styles.detailLabel, {color: currentTheme.text}]}>Einnahmen</Text>
                </View>
                <Text style={[styles.detailBetrag, {color: '#4CAF50'}]}>{totalEinnahmen.toFixed(2)} €</Text>
            </View>
            
            {/* Ausgaben */}
            <View style={styles.detailItem}>
                <View style={styles.detailTextContainer}>
                    <Ionicons name="arrow-down-circle-outline" size={24} color={'#F44336'} />
                    <Text style={[styles.detailLabel, {color: currentTheme.text}]}>Aufwendungen</Text>
                </View>
                <Text style={[styles.detailBetrag, {color: '#F44336'}]}>{totalAufwendungen.toFixed(2)} €</Text>
            </View>
        </View>

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
      detailsBox: {
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        gap: 20,
      },
      detailItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
      },
      detailTextContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
      },
      detailLabel: {
        fontSize: 18,
      },
      detailBetrag: {
        fontSize: 18,
        fontWeight: 'bold',
      }
});
