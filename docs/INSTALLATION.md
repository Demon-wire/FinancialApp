# Installation

## Voraussetzungen

- [Node.js](https://nodejs.org) v18 oder neuer
- npm (kommt mit Node.js)
- Ein Android- oder iOS-Gerät, Emulator oder Browser

---

## Option 1: Expo Go (empfohlen zum Testen)

Die schnellste Methode – keine Build-Tools nötig.

1. **[Expo Go](https://expo.dev/go)** aus dem App Store / Play Store installieren
2. Computer und Smartphone müssen im **gleichen WLAN** sein
3. Im Projektordner ausführen:

```bash
npm install
npx expo start
```

4. QR-Code mit der Expo Go App scannen → App startet sofort

---

## Option 2: Im Browser

Ideal für schnelle Tests ohne Smartphone:

```bash
npm install
npx expo start --web
```

Oder direkt:

```bash
npm run web
```

---

## Option 3: APK bauen (EAS Build)

Erstellt eine echte `.apk`-Datei, die auf Android-Geräten installiert werden kann.

```bash
# EAS CLI installieren (einmalig)
npm install -g eas-cli

# Einloggen (Expo-Account erforderlich)
eas login

# APK bauen
eas build --platform android --profile preview
```

Nach dem Build erhältst du einen Download-Link zur APK. Auf dem Gerät:
1. APK herunterladen
2. In Android-Einstellungen → "Installation aus unbekannten Quellen" aktivieren
3. APK installieren

---

## Option 4: Android Studio / Emulator

Für lokale Entwicklung mit direktem Gerätezugriff:

```bash
# Expo Development Client installieren (einmalig)
npx expo install expo-dev-client

# App direkt auf verbundenem Gerät oder Emulator starten
npx expo run:android
```

Voraussetzung: [Android Studio](https://developer.android.com/studio) mit eingerichtetem Android SDK.

---

## Troubleshooting

| Problem | Lösung |
|---|---|
| `npm start` schlägt fehl | `npx expo start` verwenden (nicht `npm exec start expo`) |
| QR-Code wird nicht erkannt | Computer und Smartphone müssen im selben WLAN sein |
| App lädt nicht | Firewall prüfen, Port 8081 muss erreichbar sein |
| `npm install` schlägt fehl | Node.js-Version prüfen: `node --version` (mind. v18) |
| Expo Go zeigt Fehler | `npx expo start --clear` ausführen (Cache leeren) |
