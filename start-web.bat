@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo   Starte FinanzApp im Browser...
echo ========================================
echo.
echo Aktuelles Verzeichnis:
cd
echo.
echo Pruefe ob node_modules existiert...
if not exist "node_modules" (
    echo node_modules nicht gefunden! Installiere Abhaengigkeiten...
    call npm install
)
echo.
echo Starte Expo...
echo Die App oeffnet sich automatisch im Browser.
echo Druecke Ctrl+C zum Beenden.
echo.
call npx expo start --web
pause
