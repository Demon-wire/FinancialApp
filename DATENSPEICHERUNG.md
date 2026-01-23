# 📊 Datenspeicherung in der FinanzApp

## ✅ Ja, alles wird gespeichert!

### 1. **Login-Daten werden dauerhaft gespeichert**

- **Wo:** In AsyncStorage unter dem Schlüssel `'users'`
- **Was wird gespeichert:**
  - Name
  - E-Mail-Adresse
  - Passwort (als Klartext - für Produktion sollte Verschlüsselung verwendet werden)
  - Registrierungsdatum
- **Persistenz:** Die Daten bleiben gespeichert, auch nach App-Neustart oder Geräteneustart

### 2. **Einnahmen sind benutzerspezifisch**

- **Wo:** In AsyncStorage unter dem Schlüssel `'einnahmen'`
- **Was wird gespeichert:**
  - Betrag
  - Kategorie
  - Notiz
  - Datum
  - **userEmail** (verknüpft mit dem angemeldeten Benutzer)
- **Filterung:** Beim Laden werden nur die Einnahmen des aktuell angemeldeten Benutzers angezeigt

### 3. **Session-Management**

- **Aktuelle Session:** Wird unter `'currentUser'` und `'isLoggedIn'` gespeichert
- **Automatisches Login:** Wenn `'isLoggedIn' === 'true'`, wird der Benutzer automatisch eingeloggt
- **Beim Logout:** Session-Daten werden gelöscht, aber Login-Daten und Einnahmen bleiben erhalten

## 🔄 Ablauf beim erneuten Login:

1. **App startet** → Prüft ob `'isLoggedIn' === 'true'`
2. **Wenn ja:** Automatisches Login mit gespeicherter Session
3. **Wenn nein:** Login-Bildschirm wird angezeigt
4. **Nach Login:** 
   - Session wird gespeichert (`'currentUser'` und `'isLoggedIn'`)
   - Einnahmen werden gefiltert nach `userEmail`
   - Nur die eigenen Einnahmen werden angezeigt

## ✅ Beispiel-Szenario:

1. **Tag 1:** 
   - Registrierung mit E-Mail: `max@example.com`
   - Einnahme hinzufügen: 500€ Gehalt
   - App schließen

2. **Tag 2:**
   - App öffnen → Automatisches Login
   - Einnahme von 500€ ist noch da ✅
   - Neue Einnahme: 200€ Nebentätigkeit

3. **Tag 3:**
   - Logout
   - Mit anderem Account einloggen: `anna@example.com`
   - Keine Einnahmen sichtbar (weil Anna noch keine hat)
   - Wieder ausloggen

4. **Tag 4:**
   - Mit `max@example.com` wieder einloggen
   - Beide Einnahmen (500€ + 200€) sind noch da ✅

## 🔒 Wichtige Hinweise:

- **Lokale Speicherung:** Alle Daten werden nur lokal auf dem Gerät gespeichert
- **Keine Cloud-Synchronisation:** Daten sind nicht zwischen Geräten synchronisiert
- **Passwort-Sicherheit:** Passwörter werden aktuell als Klartext gespeichert (für Produktion sollte Verschlüsselung verwendet werden)
- **Datenverlust:** Bei App-Deinstallation gehen alle Daten verloren

## 💡 Zusammenfassung:

✅ **Login-Daten werden gespeichert**  
✅ **Einnahmen bleiben erhalten**  
✅ **Beim erneuten Login mit gleichen Daten sieht man die gleichen Einnahmen**  
✅ **Jeder Benutzer sieht nur seine eigenen Einnahmen**
