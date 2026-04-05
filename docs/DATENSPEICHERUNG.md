# Datenspeicherung

## Grundprinzip

Alle Daten werden **ausschließlich lokal auf dem Gerät** gespeichert. Es gibt keine Serververbindung und keine Cloud-Synchronisation.

---

## Wo werden welche Daten gespeichert?

### AsyncStorage (allgemeine App-Daten)

| Schlüssel | Inhalt | Felder |
|---|---|---|
| `users` | Alle registrierten Nutzer | `name`, `email`, `password` (gehasht), `registeredAt` |
| `einnahmen` | Alle Einnahmen | `betrag`, `kategorie`, `konto`, `notiz`, `datum`, `userEmail` |
| `ausgaben` | Alle Ausgaben | `betrag`, `kategorie`, `konto`, `notiz`, `datum`, `userEmail` |
| `abos` | Abonnements | `name`, `betrag`, `intervall`, `lastProcessed`, `userEmail` |
| `budgets` | Budget-Limits | `kategorie`, `limit`, `zeitraum`, `userEmail` |

### SecureStore (sensible Session-Daten)

Auf nativen Plattformen (Android/iOS) werden diese Werte im OS-Keystore/Keychain gespeichert. Im Web fällt es auf AsyncStorage zurück.

| Schlüssel | Inhalt |
|---|---|
| `currentUser` | JSON des eingeloggten Nutzers |
| `isLoggedIn` | `"true"` oder `"false"` |
| `lastLoggedInUser` | E-Mail des zuletzt eingeloggten Nutzers |

---

## Passwort-Sicherheit

Passwörter werden **nicht im Klartext** gespeichert. Das Format ist:

```
sha256:<uuid-salt>:<sha256-hash>
```

Beim Registrieren wird ein zufälliger Salt (UUID) generiert, mit dem Passwort kombiniert und dann gehasht. Das ermöglicht die Verifikation beim Login, ohne das Originalpasswort zu kennen.

---

## Session-Ablauf

```
App startet
    └─► isLoggedIn === "true" ?
            ├─► Ja  → Direkt zur App (automatisches Login)
            └─► Nein → Login-Screen

Login erfolgreich
    └─► currentUser, isLoggedIn, lastLoggedInUser werden gespeichert
    └─► aboService prüft und bucht fällige Abonnements

Logout
    └─► currentUser, isLoggedIn werden gelöscht
    └─► lastLoggedInUser bleibt erhalten (für Biometrie-Login)
```

---

## Mehrbenutzer-Isolation

Alle Transaktionen, Budgets und Abos enthalten ein `userEmail`-Feld. Beim Laden werden Daten immer nach der E-Mail des aktuell eingeloggten Nutzers gefiltert – jeder Nutzer sieht nur seine eigenen Daten.

---

## Datenverlust

Bei **App-Deinstallation** werden alle Daten unwiderruflich gelöscht. Es gibt keine automatische Sicherung. Für ein manuelles Backup können Transaktionen über Einstellungen → CSV-Export exportiert werden.
