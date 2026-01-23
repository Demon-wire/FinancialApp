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
import { useTheme, THEMES } from '../contexts/ThemeContext';

export default function EinstellungenScreen({ onLogout }) {
  const { currentTheme, theme, changeTheme, availableThemes } = useTheme();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (currentUserJson) {
        const currentUser = JSON.parse(currentUserJson);
        setEmail(currentUser.email);
        setUserName(currentUser.name);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
    }
  };

  const handleEmailChange = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Fehler', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    setLoading(true);
    try {
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) {
        Alert.alert('Fehler', 'Sie sind nicht angemeldet.');
        return;
      }

      const currentUser = JSON.parse(currentUserJson);
      const oldEmail = currentUser.email;

      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];

      if (email.toLowerCase() !== oldEmail.toLowerCase()) {
        const emailExists = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (emailExists) {
          Alert.alert('Fehler', 'Diese E-Mail-Adresse ist bereits registriert.');
          setLoading(false);
          return;
        }
      }

      const userIndex = users.findIndex((u) => u.email === oldEmail);
      if (userIndex !== -1) {
        users[userIndex].email = email.toLowerCase();
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }

      currentUser.email = email.toLowerCase();
      await AsyncStorage.setItem('currentUser', JSON.stringify(currentUser));

      const einnahmenJson = await AsyncStorage.getItem('einnahmen');
      if (einnahmenJson) {
        const einnahmen = JSON.parse(einnahmenJson);
        einnahmen.forEach((einnahme) => {
          if (einnahme.userEmail === oldEmail) {
            einnahme.userEmail = email.toLowerCase();
          }
        });
        await AsyncStorage.setItem('einnahmen', JSON.stringify(einnahmen));
      }

      Alert.alert('✅ Erfolg', 'E-Mail-Adresse wurde erfolgreich geändert.');
    } catch (error) {
      Alert.alert('Fehler', 'E-Mail-Adresse konnte nicht geändert werden.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Fehler', 'Das neue Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Fehler', 'Die neuen Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);
    try {
      const currentUserJson = await AsyncStorage.getItem('currentUser');
      if (!currentUserJson) {
        Alert.alert('Fehler', 'Sie sind nicht angemeldet.');
        return;
      }

      const currentUser = JSON.parse(currentUserJson);

      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find((u) => u.email === currentUser.email);
      if (!user || user.password !== currentPassword) {
        Alert.alert('Fehler', 'Das aktuelle Passwort ist falsch.');
        setLoading(false);
        return;
      }

      user.password = newPassword;
      await AsyncStorage.setItem('users', JSON.stringify(users));

      Alert.alert('✅ Erfolg', 'Passwort wurde erfolgreich geändert.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Fehler', 'Passwort konnte nicht geändert werden.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Konto löschen',
      'Möchten Sie Ihr Konto wirklich dauerhaft löschen? Alle Ihre Daten und Einnahmen werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUserJson = await AsyncStorage.getItem('currentUser');
              if (!currentUserJson) {
                Alert.alert('Fehler', 'Sie sind nicht angemeldet.');
                return;
              }

              const currentUser = JSON.parse(currentUserJson);
              const userEmail = currentUser.email;

              const usersJson = await AsyncStorage.getItem('users');
              if (usersJson) {
                const users = JSON.parse(usersJson);
                const filteredUsers = users.filter((u) => u.email !== userEmail);
                await AsyncStorage.setItem('users', JSON.stringify(filteredUsers));
              }

              const einnahmenJson = await AsyncStorage.getItem('einnahmen');
              if (einnahmenJson) {
                const einnahmen = JSON.parse(einnahmenJson);
                const filteredEinnahmen = einnahmen.filter(
                  (e) => e.userEmail !== userEmail
                );
                await AsyncStorage.setItem('einnahmen', JSON.stringify(filteredEinnahmen));
              }

              await AsyncStorage.removeItem('currentUser');
              await AsyncStorage.removeItem('isLoggedIn');

              Alert.alert('Erfolg', 'Ihr Konto wurde erfolgreich gelöscht.');
              onLogout();
            } catch (error) {
              Alert.alert('Fehler', 'Konto konnte nicht gelöscht werden.');
              console.error(error);
            }
          },
        },
      ]
    );
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
        {/* Benutzer-Info Card */}
        <View style={[styles.userCard, { backgroundColor: currentTheme.primary }]}>
          <View style={styles.userIconContainer}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* E-Mail ändern */}
        <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={24} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              E-Mail-Adresse ändern
            </Text>
          </View>
          <View style={[styles.inputContainer, { borderColor: currentTheme.border }]}>
            <Ionicons name="mail-outline" size={20} color={currentTheme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder="Neue E-Mail-Adresse"
              placeholderTextColor={currentTheme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={handleEmailChange}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>E-Mail ändern</Text>
          </TouchableOpacity>
        </View>

        {/* Passwort ändern */}
        <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={24} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Passwort ändern
            </Text>
          </View>
          <View style={[styles.inputContainer, { borderColor: currentTheme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={currentTheme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder="Aktuelles Passwort"
              placeholderTextColor={currentTheme.textSecondary}
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={currentTheme.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputContainer, { borderColor: currentTheme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={currentTheme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder="Neues Passwort"
              placeholderTextColor={currentTheme.textSecondary}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={currentTheme.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputContainer, { borderColor: currentTheme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={currentTheme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder="Neues Passwort bestätigen"
              placeholderTextColor={currentTheme.textSecondary}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={currentTheme.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={handlePasswordChange}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>Passwort ändern</Text>
          </TouchableOpacity>
        </View>

        {/* Theme-Auswahl */}
        <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={24} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              Theme auswählen
            </Text>
          </View>
          <View style={styles.themeContainer}>
            {availableThemes.map((themeKey) => {
              const themeData = THEMES[themeKey];
              const isSelected = theme === themeKey;
              return (
                <TouchableOpacity
                  key={themeKey}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: themeData.surface,
                      borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                      borderWidth: isSelected ? 3 : 2,
                    },
                  ]}
                  onPress={() => changeTheme(themeKey)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.themePreview,
                      { backgroundColor: themeData.background },
                    ]}
                  >
                    <View
                      style={[
                        styles.themePreviewCard,
                        { backgroundColor: themeData.surface },
                      ]}
                    />
                    <View
                      style={[
                        styles.themePreviewAccent,
                        { backgroundColor: themeData.primary },
                      ]}
                    />
                  </View>
                  <Text style={[styles.themeName, { color: currentTheme.text }]}>
                    {themeData.name}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: currentTheme.primary }]}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Konto löschen */}
        <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={24} color="#d32f2f" />
            <Text style={[styles.sectionTitle, { color: '#d32f2f' }]}>
              Gefährliche Aktionen
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: '#d32f2f' }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={20} color="#d32f2f" />
            <Text style={[styles.deleteButtonText, { color: '#d32f2f' }]}>
              Konto dauerhaft löschen
            </Text>
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
  userCard: {
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
  userIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeButton: {
    width: 110,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  themePreview: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  themePreviewCard: {
    width: 50,
    height: 30,
    borderRadius: 6,
    position: 'absolute',
    top: 10,
  },
  themePreviewAccent: {
    width: 20,
    height: 20,
    borderRadius: 4,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
