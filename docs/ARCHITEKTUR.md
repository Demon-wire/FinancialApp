# Technische Architektur

## Überblick

FinanzApp ist eine vollständig lokale React Native App ohne Backend. Alle Daten liegen auf dem Gerät des Nutzers.

```
┌─────────────────────────────────────────────────────┐
│                      App.js                         │
│   Auth-State  ·  Navigation  ·  Provider-Baum       │
└────────────┬──────────────────────────┬─────────────┘
             │                          │
     ┌───────▼───────┐        ┌─────────▼─────────┐
     │  Auth-Stack   │        │    App-Stack       │
     │  Login        │        │  Bottom-Tabs (8)   │
     │  Register     │        │  + EditTransaction │
     └───────────────┘        └───────────────────-┘
```

---

## Navigation

- **Unauthentifiziert:** Stack mit Login- und Register-Screen
- **Authentifiziert:** Stack mit zwei Screens:
  - `Main` → `ScrollableTabBar` mit 8 Tabs (horizontal scrollbar, da 8 Tabs nicht in die normale Tab-Leiste passen)
  - `EditTransaction` → Modal-artiger Stack-Push

---

## Datenpersistenz

Alle Daten werden lokal mit `AsyncStorage` gespeichert. Sensible Session-Daten nutzen `expo-secure-store` (iOS Keychain / Android Keystore).

| AsyncStorage-Key | Inhalt |
|---|---|
| `users` | Array aller registrierten Nutzer (inkl. gehashte Passwörter) |
| `einnahmen` | Array aller Einnahmen (aller Nutzer, gefiltert nach `userEmail`) |
| `ausgaben` | Array aller Ausgaben (aller Nutzer, gefiltert nach `userEmail`) |
| `abos` | Array aller Abonnements |
| `budgets` | Array aller Budget-Einträge |

| SecureStore-Key | Inhalt |
|---|---|
| `currentUser` | JSON des aktuell eingeloggten Nutzers |
| `isLoggedIn` | `"true"` / `"false"` |
| `lastLoggedInUser` | E-Mail des zuletzt eingeloggten Nutzers (für Biometrie) |

### Mehrbenutzer-Isolation

Jeder Datensatz enthält ein `userEmail`-Feld. Beim Laden werden Daten immer nach der E-Mail des aktuell eingeloggten Nutzers gefiltert. Es gibt keine serverseitige Isolation – alle Daten liegen in denselben AsyncStorage-Arrays.

### Daten-Refresh

Screens nutzen `useFocusEffect` um Daten neu zu laden, sobald der Screen wieder aktiv wird (z.B. nach dem Zurücknavigieren vom Edit-Screen).

---

## Authentifizierung

### Passwort-Hashing

Passwörter werden nie im Klartext gespeichert. Format: `sha256:<uuid-salt>:<hash>`

```js
// Registrierung
const salt = await Crypto.randomUUID();
const hash = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  salt + password
);
const stored = `sha256:${salt}:${hash}`;
```

Beim Login mit alten Klartext-Passwörtern erfolgt eine automatische Migration zum neuen Format.

### Rate Limiting

Nach 5 fehlgeschlagenen Login-Versuchen wird der Account für 30 Sekunden gesperrt. Ein Countdown-Timer zeigt die verbleibende Zeit.

### Biometrie

`expo-local-authentication` (Fingerabdruck / Face ID). Setzt mindestens einen erfolgreichen manuellen Login voraus. Die E-Mail des letzten Nutzers wird in SecureStore gespeichert, um den richtigen Account biometrisch einzuloggen.

---

## Theming

`ThemeContext` stellt ein `currentTheme`-Objekt mit diesen Tokens bereit:

| Token | Verwendung |
|---|---|
| `primary` | Buttons, Akzentfarben |
| `background` | Screen-Hintergrund |
| `surface` | Formular-Hintergrund |
| `cardBackground` | Karten-Hintergrund |
| `text` | Primärer Text |
| `textSecondary` | Sekundärer/Untertitel-Text |
| `border` | Trennlinien, Rahmen |
| `headerBackground` | Navigation Header |
| `headerText` | Navigation Header Text |

Eingebaute Themes: **Light, Dark, Dark Pink** (Standard), **Midnight, Brown**

---

## Internationalisierung (i18n)

`LanguageContext` lädt die passende Locale-Datei und stellt zwei Hilfsfunktionen bereit:

- **`t(key, params)`** – Übersetzt einen Punkt-Pfad mit optionaler `{{param}}`-Interpolation, fällt auf Englisch und dann auf den rohen Key zurück
- **`tName(name)`** – Übersetzt interne deutsche Schlüssel (Kategorien, Kontonamen, Intervalle) für die Anzeige

Intern werden alle Daten mit deutschen Schlüsseln gespeichert (z.B. `"Gehalt"`, `"Girokonto"`, `"monatlich"`). Die Übersetzung findet ausschließlich zur Renderzeit statt.

---

## Abonnement-Service

`services/aboService.js` wird bei jedem Login ausgeführt. Er prüft alle Abonnements des Nutzers und bucht fällige Abos automatisch als Ausgaben (Kategorie: `"Abo"`, Konto: `"Girokonto"`). Das `lastProcessed`-Datum wird danach aktualisiert, um Doppelbuchungen zu verhindern.

---

## Sicherheitshinweise

- Passwörter werden mit SHA-256 + UUID-Salt gehasht – **aber** der `users`-Array liegt in AsyncStorage, nicht in SecureStore
- Session-Tokens liegen in SecureStore (OS-Keychain/Keystore)
- Keine Netzwerkkommunikation – kein Angriffspotenzial über das Netz
- Bei App-Deinstallation werden alle Daten unwiderruflich gelöscht
