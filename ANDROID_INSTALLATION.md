# Android Installation - Schritt für Schritt

## Option 1: Mit Expo Go (Einfachste Methode zum Testen)

### Voraussetzungen:
- Android-Smartphone
- Computer und Smartphone müssen im gleichen WLAN sein

### Schritte:

1. **Expo Go App installieren:**
   - Öffne den Google Play Store auf deinem Android-Gerät
   - Suche nach "Expo Go"
   - Installiere die App

2. **App auf dem Computer starten:**
   ```bash
   cd FinanzApp
   npm install
   npm start
   ```
   
3. **QR-Code scannen:**
   - Nach `npm start` erscheint ein QR-Code im Terminal
   - Öffne die Expo Go App auf deinem Smartphone
   - Tippe auf "Scan QR Code"
   - Scanne den QR-Code aus dem Terminal
   - Die App lädt und startet automatisch

## Option 2: APK erstellen (Standalone App)

### Mit Expo Build Service (EAS Build):

1. **Expo CLI installieren:**
   ```bash
   npm install -g expo-cli
   ```

2. **EAS Build konfigurieren:**
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

3. **APK erstellen:**
   ```bash
   eas build --platform android --profile preview
   ```

4. **APK herunterladen und installieren:**
   - Nach dem Build erhältst du einen Download-Link
   - Lade die APK auf dein Android-Gerät
   - Aktiviere "Installation aus unbekannten Quellen" in den Android-Einstellungen
   - Installiere die APK

### Lokal mit Android Studio (Erweitert):

1. **Android Studio installieren**
2. **Android SDK einrichten**
3. **Expo Development Build:**
   ```bash
   npx expo install expo-dev-client
   npx expo run:android
   ```

## Option 3: Direkt auf verbundenem Gerät/Emulator

Wenn Android Studio installiert ist und ein Gerät/Emulator verbunden:

```bash
cd FinanzApp
npm install
npm run android
```

Dies startet die App direkt auf dem verbundenen Android-Gerät oder Emulator.

## Troubleshooting

- **QR-Code wird nicht erkannt:** Stelle sicher, dass Computer und Smartphone im gleichen WLAN sind
- **App lädt nicht:** Prüfe die Internetverbindung
- **Fehler bei npm install:** Stelle sicher, dass Node.js installiert ist (Version 14 oder höher)
