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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

const CTX = 'Login';

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (compatible) {
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          if (enrolled) {
            setIsBiometricSupported(true);
            logger.info(CTX, 'Biometric authentication available');
          }
        }
      } catch (e) {
        logger.warn(CTX, 'Biometric check failed', e.message);
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte fuelle alle Felder aus.');
      return;
    }

    setLoading(true);
    logger.info(CTX, `Login attempt for: ${email}`);

    try {
      // Step 1: Load users
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      logger.debug(CTX, `Users in storage: ${users.length}`);

      // Step 2: Find user by email
      const user = users.find((u) => u.email === email.toLowerCase());

      if (!user) {
        logger.warn(CTX, `No user found for email: ${email}`);
        Alert.alert('Fehler', 'E-Mail oder Passwort ist falsch.');
        return;
      }

      logger.debug(CTX, `User found: ${user.name} (${user.email})`);

      // Step 3: Check password
      let passwordMatch = false;

      if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
        // Stored password is a bcrypt hash
        logger.debug(CTX, 'Comparing against bcrypt hash...');
        passwordMatch = bcrypt.compareSync(password, user.password);
      } else {
        // Legacy plaintext password - compare and upgrade
        logger.warn(CTX, 'Plaintext password detected - comparing and upgrading...');
        passwordMatch = (user.password === password);

        if (passwordMatch) {
          // Upgrade to bcrypt
          const hashedPassword = bcrypt.hashSync(password, 10);
          const updatedUsers = users.map(u =>
            u.email === user.email ? { ...u, password: hashedPassword } : u
          );
          await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
          logger.info(CTX, 'Password upgraded to bcrypt');
        }
      }

      // Step 4: Handle result
      if (passwordMatch) {
        logger.info(CTX, `Login SUCCESS for ${user.name}`);

        await AsyncStorage.setItem('currentUser', JSON.stringify({
          email: user.email,
          name: user.name,
        }));
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('lastLoggedInUser', user.email);

        Alert.alert('Erfolg', `Willkommen zurueck, ${user.name}!`);
        onLogin();
      } else {
        logger.warn(CTX, 'Password mismatch');
        Alert.alert('Fehler', 'E-Mail oder Passwort ist falsch.');
      }
    } catch (error) {
      logger.error(CTX, 'Login CRASHED', error.message);
      Alert.alert(
        'Login Fehler',
        `Etwas ist schiefgelaufen:\n${error.message}\n\nCheck die Console fuer Details.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    logger.info(CTX, 'Biometric login attempt');
    try {
      const savedEmail = await AsyncStorage.getItem('lastLoggedInUser');
      if (!savedEmail) {
        logger.warn(CTX, 'No saved email for biometric login');
        return Alert.alert('Info', 'Bitte melde dich zuerst manuell an, um die biometrische Anmeldung zu aktivieren.');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Melde dich mit deinem Fingerabdruck an',
      });

      if (result.success) {
        const usersJson = await AsyncStorage.getItem('users');
        const users = usersJson ? JSON.parse(usersJson) : [];
        const user = users.find(u => u.email === savedEmail);

        if (user) {
          await AsyncStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            name: user.name,
          }));
          await AsyncStorage.setItem('isLoggedIn', 'true');
          logger.info(CTX, `Biometric login SUCCESS for ${user.name}`);
          Alert.alert('Erfolg', `Willkommen zurueck, ${user.name}!`);
          onLogin();
        } else {
          logger.error(CTX, `Biometric login: user not found for ${savedEmail}`);
          Alert.alert('Fehler', 'Benutzer nicht gefunden. Bitte melde dich manuell an.');
        }
      } else {
        logger.debug(CTX, 'Biometric auth cancelled or failed');
      }
    } catch (error) {
      logger.error(CTX, 'Biometric login CRASHED', error.message);
      Alert.alert('Fehler', `Biometrische Anmeldung fehlgeschlagen:\n${error.message}`);
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
          <Text style={styles.subtitle}>Melde dich an</Text>

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

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
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
