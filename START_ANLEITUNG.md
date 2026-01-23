# So startest du die FinanzApp

## Problem: npm start funktioniert nicht

Wenn `npm start` einen Fehler gibt, verwende eine dieser Methoden:

## Methode 1: Mit npx (Empfohlen)

Öffne PowerShell oder Command Prompt und führe aus:

```powershell
cd C:\Users\alexa\Documents\Programmieren\FinanzApp
npx expo start
```

## Methode 2: Mit dem Startskript

Doppelklicke auf die Datei `start.bat` im FinanzApp Ordner.

## Methode 3: Manuell mit vollem Pfad

```powershell
cd "C:\Users\alexa\Documents\Programmieren\FinanzApp"
npm start
```

## Was du sehen solltest:

Nach dem Starten solltest du sehen:
- ✅ "Starting Metro Bundler"
- ✅ Ein QR-Code im Terminal
- ✅ Eine URL wie `exp://192.168.x.x:8081 `

## Dann auf Android:

1. Öffne **Expo Go** auf deinem Android-Gerät
2. Tippe auf **"Scan QR Code"**
3. Scanne den QR-Code aus dem Terminal
4. Die App lädt automatisch!

## Falls es immer noch nicht funktioniert:

1. Prüfe, ob Node.js installiert ist:
   ```powershell
   node --version
   ```

2. Prüfe, ob npm installiert ist:
   ```powershell
   npm --version
   ```

3. Installiere die Abhängigkeiten neu:
   ```powershell
   cd C:\Users\alexa\Documents\Programmieren\FinanzApp
   npm install
   ```

4. Versuche es dann erneut:
   ```powershell
   npx expo start
   ```
