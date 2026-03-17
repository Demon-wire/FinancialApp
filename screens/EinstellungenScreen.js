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
import { getItem, setItem, removeItem } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function EinstellungenScreen({ onLogout }) {
  const { currentTheme, theme, changeTheme, availableThemes } = useTheme();
  const { t, tName, language, changeLanguage } = useLanguage();
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
      const currentUserJson = await getItem('currentUser');
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
      Alert.alert(t('common.error'), t('settings.emailInvalid'));
      return;
    }

    setLoading(true);
    try {
      const currentUserJson = await getItem('currentUser');
      if (!currentUserJson) {
        Alert.alert(t('common.error'), t('settings.notLoggedIn'));
        return;
      }

      const currentUser = JSON.parse(currentUserJson);
      const oldEmail = currentUser.email;

      const usersJson = await getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];

      if (email.toLowerCase() !== oldEmail.toLowerCase()) {
        const emailExists = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (emailExists) {
          Alert.alert(t('common.error'), t('settings.emailExists'));
          setLoading(false);
          return;
        }
      }

      const userIndex = users.findIndex((u) => u.email === oldEmail);
      if (userIndex !== -1) {
        users[userIndex].email = email.toLowerCase();
        await setItem('users', JSON.stringify(users));
      }

      currentUser.email = email.toLowerCase();
      await setItem('currentUser', JSON.stringify(currentUser));

      const einnahmenJson = await getItem('einnahmen');
      if (einnahmenJson) {
        const einnahmen = JSON.parse(einnahmenJson);
        einnahmen.forEach((einnahme) => {
          if (einnahme.userEmail === oldEmail) {
            einnahme.userEmail = email.toLowerCase();
          }
        });
        await setItem('einnahmen', JSON.stringify(einnahmen));
      }

      const ausgabenJson = await getItem('ausgaben');
      if (ausgabenJson) {
        const ausgaben = JSON.parse(ausgabenJson);
        ausgaben.forEach((ausgabe) => {
          if (ausgabe.userEmail === oldEmail) {
            ausgabe.userEmail = email.toLowerCase();
          }
        });
        await setItem('ausgaben', JSON.stringify(ausgaben));
      }

      const abosJson = await getItem('abos');
      if (abosJson) {
        const abos = JSON.parse(abosJson);
        abos.forEach((abo) => {
          if (abo.userEmail === oldEmail) {
            abo.userEmail = email.toLowerCase();
          }
        });
        await setItem('abos', JSON.stringify(abos));
      }

      await setItem('lastLoggedInUser', email.toLowerCase());

      Alert.alert(t('common.success'), t('settings.emailChanged'));
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.emailError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('settings.fillAllFields'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('settings.passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('settings.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const currentUserJson = await getItem('currentUser');
      if (!currentUserJson) {
        Alert.alert(t('common.error'), t('settings.notLoggedIn'));
        return;
      }

      const currentUser = JSON.parse(currentUserJson);

      const usersJson = await getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find((u) => u.email === currentUser.email);
      if (!user) {
        Alert.alert(t('common.error'), t('settings.userNotFound'));
        setLoading(false);
        return;
      }

      let passwordMatch = false;
      if (user.password && user.password.startsWith('sha256:')) {
        const [, salt, storedHash] = user.password.split(':');
        const computed = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          currentPassword + salt
        );
        passwordMatch = computed === storedHash;
      } else {
        passwordMatch = user.password === currentPassword;
      }

      if (!passwordMatch) {
        Alert.alert(t('common.error'), t('settings.wrongPassword'));
        setLoading(false);
        return;
      }

      const salt = Crypto.randomUUID();
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        newPassword + salt
      );
      user.password = `sha256:${salt}:${hash}`;
      await setItem('users', JSON.stringify(users));

      Alert.alert(t('common.success'), t('settings.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.passwordError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const currentUserJson = await getItem('currentUser');
      if (!currentUserJson) {
        Alert.alert(t('common.error'), t('settings.notLoggedIn'));
        return;
      }
      const currentUser = JSON.parse(currentUserJson);
      const userEmail = currentUser.email;

      const einnahmenJson = await getItem('einnahmen');
      const ausgabenJson = await getItem('ausgaben');

      const einnahmen = einnahmenJson ? JSON.parse(einnahmenJson).filter(e => e.userEmail === userEmail) : [];
      const ausgaben = ausgabenJson ? JSON.parse(ausgabenJson).filter(a => a.userEmail === userEmail) : [];

      const header = 'Datum,Typ,Kategorie,Betrag,Konto,Notiz\n';
      const formatRow = (tr, typ) => {
        const datum = new Date(tr.datum).toLocaleDateString('de-DE');
        const notiz = (tr.notiz || '').replace(/,/g, ';').replace(/\n/g, ' ');
        return `${datum},${typ},${tr.kategorie},${tr.betrag.toFixed(2)},${tr.konto || ''},${notiz}`;
      };

      const rows = [
        ...einnahmen.map(e => formatRow(e, 'Einnahme')),
        ...ausgaben.map(a => formatRow(a, 'Ausgabe')),
      ];

      const csvContent = header + rows.join('\n');
      const fileUri = FileSystem.documentDirectory + 'transaktionen.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: t('settings.exportDialogTitle') });
      } else {
        Alert.alert(t('common.info'), t('settings.fileSaved', { path: fileUri }));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.exportError'));
      console.error(error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccountTitle'),
      t('settings.deleteAccountMessage'),
      [
        {
          text: t('settings.deleteAccountCancel'),
          style: 'cancel',
        },
        {
          text: t('settings.deleteAccountConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUserJson = await getItem('currentUser');
              if (!currentUserJson) {
                Alert.alert(t('common.error'), t('settings.notLoggedIn'));
                return;
              }

              const currentUser = JSON.parse(currentUserJson);
              const userEmail = currentUser.email;

              const usersJson = await getItem('users');
              if (usersJson) {
                const users = JSON.parse(usersJson);
                const filteredUsers = users.filter((u) => u.email !== userEmail);
                await setItem('users', JSON.stringify(filteredUsers));
              }

              const einnahmenJson = await getItem('einnahmen');
              if (einnahmenJson) {
                const einnahmen = JSON.parse(einnahmenJson);
                const filteredEinnahmen = einnahmen.filter((e) => e.userEmail !== userEmail);
                await setItem('einnahmen', JSON.stringify(filteredEinnahmen));
              }

              const ausgabenJson = await getItem('ausgaben');
              if (ausgabenJson) {
                const ausgaben = JSON.parse(ausgabenJson);
                const filteredAusgaben = ausgaben.filter((a) => a.userEmail !== userEmail);
                await setItem('ausgaben', JSON.stringify(filteredAusgaben));
              }

              const abosJson = await getItem('abos');
              if (abosJson) {
                const abos = JSON.parse(abosJson);
                const filteredAbos = abos.filter((abo) => abo.userEmail !== userEmail);
                await setItem('abos', JSON.stringify(filteredAbos));
              }

              await removeItem('currentUser');
              await removeItem('isLoggedIn');

              Alert.alert(t('common.success'), t('settings.deleteAccountSuccess'));
              onLogout();
            } catch (error) {
              Alert.alert(t('common.error'), t('settings.deleteAccountError'));
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
              {t('settings.changeEmail')}
            </Text>
          </View>
          <View style={[styles.inputContainer, { borderColor: currentTheme.border }]}>
            <Ionicons name="mail-outline" size={20} color={currentTheme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder={t('settings.newEmail')}
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
            <Text style={styles.buttonText}>{t('settings.changeEmailButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* Passwort ändern */}
        <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={24} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {t('settings.changePassword')}
            </Text>
          </View>
          <View style={[styles.inputContainer, { borderColor: currentTheme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={currentTheme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder={t('settings.currentPassword')}
              placeholderTextColor={currentTheme.textSecondary}
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeIcon}>
              <Ionicons name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={currentTheme.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputContainer, { borderColor: currentTheme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={currentTheme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder={t('settings.newPassword')}
              placeholderTextColor={currentTheme.textSecondary}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIcon}>
              <Ionicons name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={currentTheme.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.inputContainer, { borderColor: currentTheme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={currentTheme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: currentTheme.text }]}
              placeholder={t('settings.confirmPassword')}
              placeholderTextColor={currentTheme.textSecondary}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={currentTheme.textSecondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={handlePasswordChange}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>{t('settings.changePasswordButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* Theme-Auswahl */}
        <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={24} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {t('settings.selectTheme')}
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
                  <View style={[styles.themePreview, { backgroundColor: themeData.background }]}>
                    <View style={[styles.themePreviewCard, { backgroundColor: themeData.surface }]} />
                    <View style={[styles.themePreviewAccent, { backgroundColor: themeData.primary }]} />
                  </View>
                  <Text style={[styles.themeName, { color: currentTheme.text }]}>
                    {tName(themeData.name)}
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

        {/* Sprache auswählen */}
        <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language" size={24} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {t('settings.selectLanguage')}
            </Text>
          </View>
          <View style={styles.themeContainer}>
            {['en', 'de', 'hi', 'zh', 'it', 'es'].map((lang) => {
              const isSelected = language === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.langButton,
                    {
                      backgroundColor: isSelected ? currentTheme.primary : currentTheme.surface,
                      borderColor: isSelected ? currentTheme.primary : currentTheme.border,
                      borderWidth: isSelected ? 3 : 2,
                    },
                  ]}
                  onPress={() => changeLanguage(lang)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.langCode, { color: isSelected ? '#fff' : currentTheme.primary }]}>
                    {lang.toUpperCase()}
                  </Text>
                  <Text style={[styles.langName, { color: isSelected ? '#fff' : currentTheme.text }]}>
                    {tName(lang)}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Daten exportieren */}
        <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="download-outline" size={24} color={currentTheme.primary} />
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {t('settings.exportData')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={handleExportCSV}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>{t('settings.exportCSV')}</Text>
          </TouchableOpacity>
        </View>

        {/* Konto löschen */}
        <View style={[styles.section, { backgroundColor: currentTheme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={24} color="#d32f2f" />
            <Text style={[styles.sectionTitle, { color: '#d32f2f' }]}>
              {t('settings.dangerZone')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.deleteButton, { borderColor: '#d32f2f' }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={20} color="#d32f2f" />
            <Text style={[styles.deleteButtonText, { color: '#d32f2f' }]}>
              {t('settings.deleteAccount')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  userCard: {
    borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  userIconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#fff', opacity: 0.9 },
  section: {
    borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 12,
    marginBottom: 12, paddingHorizontal: 16, height: 50,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  eyeIcon: { padding: 4 },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 12, marginTop: 8, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  themeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themeButton: { width: 110, padding: 12, borderRadius: 16, alignItems: 'center', position: 'relative' },
  themePreview: {
    width: 70, height: 70, borderRadius: 12, marginBottom: 8,
    justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden',
  },
  themePreviewCard: { width: 50, height: 30, borderRadius: 6, position: 'absolute', top: 10 },
  themePreviewAccent: { width: 20, height: 20, borderRadius: 4, position: 'absolute', bottom: 10, right: 10 },
  themeName: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  langButton: {
    width: 130, padding: 16, borderRadius: 16, alignItems: 'center', position: 'relative',
  },
  langCode: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  langName: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  checkmark: {
    position: 'absolute', top: 8, right: 8, width: 24, height: 24,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 12, borderWidth: 2, gap: 8,
  },
  deleteButtonText: { fontSize: 16, fontWeight: 'bold' },
});
