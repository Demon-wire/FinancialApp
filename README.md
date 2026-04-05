# FinanzApp

Eine lokale, datenschutzfreundliche Finanzverwaltungs-App für Android, iOS und Web. Einnahmen und Ausgaben erfassen, Budgets setzen, Abonnements verwalten und Statistiken auswerten – alles ohne Internetverbindung oder Cloud.

---

## Features

| Bereich | Was es kann |
|---|---|
| **Transaktionen** | Einnahmen & Ausgaben mit Betrag, Kategorie, Konto und Notiz erfassen |
| **Kontostand** | Übersicht aller Konten mit Einzelsaldo und Gesamtsaldo |
| **Statistiken** | Kategorieaufteilung mit Balken und Prozentanteilen, filterbar nach Tag/Woche/Monat/Jahr |
| **Budget** | Ausgabenlimits pro Kategorie und Zeitraum mit Fortschrittsanzeige |
| **Abonnements** | Wiederkehrende Kosten (wöchentlich/monatlich/jährlich) automatisch als Ausgabe buchen |
| **Gewinn** | Einnahmen minus Ausgaben und anteilige Abokosten pro Zeitraum |
| **Mehrbenutzer** | Jeder Nutzer sieht nur seine eigenen Daten |
| **Biometrie** | Fingerabdruck / Face ID als Alternative zum Passwort |
| **Export** | Alle Transaktionen als CSV-Datei exportieren |
| **Themes** | 5 eingebaute Farbthemes (Light, Dark, Dark Pink, Midnight, Brown) |
| **Sprachen** | Deutsch, Englisch, Hindi, Chinesisch, Italienisch, Spanisch, Portugiesisch |

---

## Schnellstart

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npx expo start
```

Danach:
- **Browser:** `w` drücken oder Link öffnen
- **Android/iOS:** [Expo Go](https://expo.dev/go) App installieren und QR-Code scannen

Weitere Installationsmethoden: [docs/INSTALLATION.md](docs/INSTALLATION.md)

---

## Tech Stack

- **React Native** 0.81 + **Expo** 54
- **React Navigation** v7 (Bottom Tabs + Stack)
- **AsyncStorage** – lokale Datenpersistenz
- **expo-secure-store** – sichere Session-Speicherung (OS Keychain)
- **expo-crypto** – SHA-256 Passwort-Hashing mit Salt
- **expo-local-authentication** – Biometrie
- **expo-file-system** + **expo-sharing** – CSV-Export

---

## Projektstruktur

```
FinancialApp/
├── App.js                    # Root: Auth-State, Navigation, Provider
├── constants/
│   └── Categories.js         # Kategorie-Definitionen (Icon, Farbe, Name)
├── contexts/
│   ├── ThemeContext.js        # Theme-Provider (5 Themes)
│   └── LanguageContext.js     # i18n-Provider mit t() und tName()
├── locales/                   # Übersetzungsdateien (de, en, hi, zh, it, es, pt)
├── screens/                   # Alle App-Screens
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── EinnahmenScreen.js
│   ├── AusgabenScreen.js
│   ├── AlleTransaktionenScreen.js
│   ├── KontostandScreen.js
│   ├── StatistikScreen.js
│   ├── BudgetScreen.js
│   ├── AbosScreen.js
│   ├── GewinnScreen.js
│   ├── EditTransactionScreen.js
│   ├── EinstellungenScreen.js
│   └── AnleitungScreen.js
├── services/
│   └── aboService.js          # Automatische Aboabbuchung beim Login
└── utils/
    └── storage.js             # Unified Storage (SecureStore + AsyncStorage)
```

---

## npm-Skripte

| Befehl | Beschreibung |
|---|---|
| `npx expo start` | Entwicklungsserver starten |
| `npm run android` | Direkt auf Android-Gerät/Emulator starten |
| `npm run ios` | Direkt auf iOS-Simulator starten |
| `npm run web` | Im Browser starten |
| `eas build --platform android --profile preview` | APK bauen (EAS) |

---

## Dokumentation

| Datei | Inhalt |
|---|---|
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Expo Go, APK-Build, Android Studio |
| [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md) | Technische Architektur, Datenfluss, Sicherheit |
| [docs/DATENSPEICHERUNG.md](docs/DATENSPEICHERUNG.md) | Welche Daten wo gespeichert werden |
| [docs/DATENSCHUTZ.md](docs/DATENSCHUTZ.md) | Datenschutzerklärung |

---

## Datenschutz

Alle Daten bleiben **ausschließlich lokal auf dem Gerät**. Keine Cloud, kein Tracking, keine Werbung. Vollständige Erklärung: [docs/DATENSCHUTZ.md](docs/DATENSCHUTZ.md)

---

**Autor:** Mad_LX0 · mad_lx0@proton.me
