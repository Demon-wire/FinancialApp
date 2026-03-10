import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { getItem, setItem, removeItem } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 Sekunden

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (enrolled) {
          setIsBiometricSupported(true);
        }
      }
    })();
  }, []);

  // Countdown-Timer für Sperre
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setTimeout(() => setLockoutRemaining(prev => Math.max(0, prev - 1)), 1000);
    return () => clearTimeout(timer);
  }, [lockoutRemaining]);

  const getRateLimitData = async (emailKey) => {
    const json = await getItem(`loginAttempts_${emailKey}`);
    return json ? JSON.parse(json) : { count: 0, lockedUntil: null };
  };

  const checkRateLimit = async (emailKey) => {
    const data = await getRateLimitData(emailKey);
    if (data.lockedUntil && new Date(data.lockedUntil) > new Date()) {
      const remaining = Math.ceil((new Date(data.lockedUntil) - new Date()) / 1000);
      setLockoutRemaining(remaining);
      return { locked: true, remaining };
    }
    return { locked: false, data };
  };

  const recordFailedAttempt = async (emailKey) => {
    const data = await getRateLimitData(emailKey);
    const newCount = data.count + 1;
    let lockedUntil = null;
    if (newCount >= MAX_LOGIN_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
      const remaining = Math.ceil(LOCKOUT_DURATION_MS / 1000);
      setLockoutRemaining(remaining);
    }
    await setItem(`loginAttempts_${emailKey}`, JSON.stringify({ count: newCount, lockedUntil }));
  };

  const clearRateLimit = async (emailKey) => {
    await removeItem(`loginAttempts_${emailKey}`);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus.');
      return;
    }

    const emailKey = email.toLowerCase().trim();

    // Rate-Limiting prüfen
    const { locked, remaining } = await checkRateLimit(emailKey);
    if (locked) {
      Alert.alert('Gesperrt', `Zu viele Fehlversuche. Bitte warten Sie ${remaining} Sekunden.`);
      return;
    }

    setLoading(true);
    try {
      const usersJson = await getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find((u) => u.email === emailKey);

      if (user) {
        let passwordMatch = false;
        if (user.password && user.password.startsWith('sha256:')) {
          const [, salt, storedHash] = user.password.split(':');
          const computed = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            password + salt
          );
          passwordMatch = computed === storedHash;
        } else if (user.password) {
          // Legacy plain-text password — re-hash on successful login
          passwordMatch = (user.password === password);
          if (passwordMatch) {
            const salt = Crypto.randomUUID();
            const hash = await Crypto.digestStringAsync(
              Crypto.CryptoDigestAlgorithm.SHA256,
              password + salt
            );
            const updatedUsers = users.map(u =>
              u.email === user.email ? { ...u, password: `sha256:${salt}:${hash}` } : u
            );
            await setItem('users', JSON.stringify(updatedUsers));
          }
        }

        if (passwordMatch) {
          await clearRateLimit(emailKey);
          await setItem('currentUser', JSON.stringify({ email: user.email, name: user.name }));
          await setItem('isLoggedIn', 'true');
          await setItem('lastLoggedInUser', user.email);
          Alert.alert('Erfolg', `Willkommen zurück, ${user.name}!`);
          onLogin();
        } else {
          await recordFailedAttempt(emailKey);
          const data = await getRateLimitData(emailKey);
          const verbleibend = MAX_LOGIN_ATTEMPTS - data.count;
          if (verbleibend > 0) {
            Alert.alert('Fehler', `E-Mail oder Passwort ist falsch. Noch ${verbleibend} Versuch(e).`);
          } else {
            Alert.alert('Gesperrt', 'Zu viele Fehlversuche. Bitte warten Sie 30 Sekunden.');
          }
        }
      } else {
        await recordFailedAttempt(emailKey);
        Alert.alert('Fehler', 'E-Mail oder Passwort ist falsch.');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const savedEmail = await getItem('lastLoggedInUser');
      if (!savedEmail) {
        return Alert.alert('Info', 'Bitte melden Sie sich zuerst manuell an, um die biometrische Anmeldung zu aktivieren.');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Melden Sie sich mit Ihrem Fingerabdruck an',
      });

      if (result.success) {
        const usersJson = await getItem('users');
        const users = usersJson ? JSON.parse(usersJson) : [];
        const user = users.find(u => u.email === savedEmail);

        if (user) {
          await setItem('currentUser', JSON.stringify({ email: user.email, name: user.name }));
          await setItem('isLoggedIn', 'true');
          Alert.alert('Erfolg', `Willkommen zurück, ${user.name}!`);
          onLogin();
        } else {
          Alert.alert('Fehler', 'Benutzer nicht gefunden. Bitte melden Sie sich manuell an.');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Fehler', 'Biometrische Anmeldung fehlgeschlagen.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet" size={80} color="#2196F3" />
          </View>

          <Text style={styles.title}>FinanzApp</Text>
          <Text style={styles.subtitle}>Melden Sie sich an</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-Mail"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Passwort"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {lockoutRemaining > 0 && (
              <Text style={styles.lockoutText}>
                Konto gesperrt. Bitte warten Sie {lockoutRemaining} Sekunde(n).
              </Text>
            )}

            <TouchableOpacity
              style={[styles.loginButton, (loading || lockoutRemaining > 0) && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading || lockoutRemaining > 0}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Wird angemeldet...' : 'Anmelden'}
              </Text>
            </TouchableOpacity>

            {isBiometricSupported && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
              >
                <Ionicons name="finger-print" size={24} color="#fff" />
                <Text style={styles.biometricButtonText}>Biometrische Anmeldung</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerLinkText}>
                Noch kein Konto? Jetzt registrieren
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  lockoutText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  biometricButton: {
    flexDirection: 'row',
    backgroundColor: '#666',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  biometricButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#2196F3',
    fontSize: 14,
  },
});
