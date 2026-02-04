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
import bcrypt from 'bcrypt-react-native'; // Import bcrypt

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus.');
      return;
    }

    setLoading(true);
    try {
      console.log('handleLogin: Attempting to log in with email:', email);

      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      console.log('handleLogin: Retrieved users from AsyncStorage:', users);

      const user = users.find(
        (u) => u.email === email.toLowerCase()
      );
      console.log('handleLogin: Found user:', user);

      if (user) {
        console.log('handleLogin: User found. Checking password.');
        console.log('handleLogin: User password from storage (first 10 chars):', user.password ? user.password.substring(0, 10) + '...' : 'undefined');
        console.log('handleLogin: Provided password (first 10 chars):', password ? password.substring(0, 10) + '...' : 'undefined');

        let passwordMatch = false;
        // Check if the stored password is a bcrypt hash
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
          console.log('handleLogin: Stored password appears to be a bcrypt hash. Comparing...');
          passwordMatch = await bcrypt.compare(password, user.password);
        } else {
          console.log('handleLogin: Stored password is NOT a bcrypt hash or is undefined. Falling back to plaintext comparison.');
          // Fallback for plaintext passwords (old users)
          passwordMatch = (user.password === password);
          // If plaintext password matches, rehash and update it
          if (passwordMatch) {
            console.log('handleLogin: Plaintext password match. Rehashing and updating stored password.');
            const hashedPassword = await bcrypt.hash(password, 10);
            const updatedUsers = users.map(u => 
              u.email === user.email ? { ...u, password: hashedPassword } : u
            );
            await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
            user.password = hashedPassword; // Update current user object as well
          }
        }

        if (passwordMatch) {
          await AsyncStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            name: user.name,
          }));
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.setItem('lastLoggedInUser', user.email); // Save email for biometric login
          
          Alert.alert('Erfolg', `Willkommen zurück, ${user.name}!`);
          onLogin();
        } else {
          Alert.alert('Fehler', 'E-Mail oder Passwort ist falsch.');
        }
      } else {
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
      const savedEmail = await AsyncStorage.getItem('lastLoggedInUser');
      if (!savedEmail) {
        return Alert.alert('Info', 'Bitte melden Sie sich zuerst manuell an, um die biometrische Anmeldung zu aktivieren.');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Melden Sie sich mit Ihrem Fingerabdruck an',
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
          Alert.alert('Erfolg', `Willkommen zurück, ${user.name}!`);
          onLogin();
        } else {
           Alert.alert('Fehler', 'Benutzer nicht gefunden. Bitte melden Sie sich manuell an.');
        }
      } else {
        // User cancelled or authentication failed
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
