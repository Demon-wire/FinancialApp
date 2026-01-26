# FinanzApp

Eine Cross-Platform Finanz-App für Android und iOS, die es ermöglicht, Einnahmen zu erfassen, zu kategorisieren und Statistiken anzuzeigen.

## Features

- ✅ Einnahmen erfassen mit Betrag, Kategorie und optionaler Notiz
- ✅ Kategorien: Gehalt, Nebentätigkeit, Investitionen, Geschenk, Sonstiges
- ✅ Statistikansicht mit Filterung nach Zeitraum (Woche, Monat, Jahr)
- ✅ Übersicht nach Kategorien
- ✅ Verlauf der letzten Einnahmen
- ✅ Lokale Datenspeicherung (keine Internetverbindung erforderlich)

## Installation

1. Stelle sicher, dass Node.js installiert ist
2. Installiere die Abhängigkeiten:
```bash
npm install
```

3. Starte die App:
```bash
npm start
```

## Verwendung

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## Technologien

- React Native mit Expo
- React Navigation für die Navigation
- AsyncStorage für lokale Datenspeicherung
- Expo Vector Icons für Icons

## Projektstruktur

```
FinanzApp/
├── App.js                 # Hauptkomponente mit Navigation
├── screens/
│   ├── EinnahmenScreen.js # Eingabefeld für Einnahmen
│   └── StatistikScreen.js # Statistikansicht
├── package.json
└── README.md
```

## Nächste Schritte

Um die App auf einem echten Gerät zu testen:
1. Installiere die Expo Go App auf deinem Smartphone
2. Scanne den QR-Code, der beim Starten der App angezeigt wird.
