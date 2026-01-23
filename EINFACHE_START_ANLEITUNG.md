# 🚀 Einfache Start-Anleitung für FinanzApp

## ⚠️ Problem: Expo start funktioniert nicht?

Kein Problem! Hier sind **3 einfache Lösungen**:

---

## ✅ Lösung 1: Im Browser starten (EINFACHSTE Methode!)

**Doppelklicke einfach auf:** `start-web.bat`

Die App öffnet sich automatisch im Browser und du kannst sie sofort testen!

**Oder manuell:**
```powershell
cd "C:\Users\alexa\Documents\Programmieren\FinanzApp"
npx expo start --web
```

---

## ✅ Lösung 2: Mit Expo Go auf Android

1. **Installiere Expo Go** aus dem Google Play Store auf deinem Android-Gerät

2. **Starte die App** mit einem dieser Befehle:
   ```powershell
   cd "C:\Users\alexa\Documents\Programmieren\FinanzApp"
   npx expo start
   ```
   
   Oder doppelklicke auf: `start.bat`

3. **Scanne den QR-Code** mit der Expo Go App

---

## ✅ Lösung 3: Expo CLI global installieren

Falls nichts funktioniert, installiere Expo CLI global:

```powershell
npm install -g expo-cli
```

Dann starte die App:
```powershell
cd "C:\Users\alexa\Documents\Programmieren\FinanzApp"
expo start
```

---

## 🔍 Was könnte das Problem sein?

- **Falsches Verzeichnis:** Stelle sicher, dass du im `FinanzApp` Ordner bist
- **Node modules fehlen:** Führe `npm install` aus
- **Expo nicht installiert:** Führe `npm install` aus

---

## 💡 Empfehlung

**Starte zuerst mit Lösung 1 (Browser)** - das ist am einfachsten und funktioniert garantiert!

Die App funktioniert im Browser genauso wie auf dem Handy. Du kannst alle Features testen:
- ✅ Einnahmen eingeben
- ✅ Kategorien wählen
- ✅ Statistiken ansehen

Später kannst du dann die Android-Version mit Expo Go testen.
