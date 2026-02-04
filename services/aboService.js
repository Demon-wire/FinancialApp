import AsyncStorage from '@react-native-async-storage/async-storage';

export const verarbeiteAbos = async () => {
  try {
    const currentUserJson = await AsyncStorage.getItem('currentUser');
    if (!currentUserJson) return;
    const currentUser = JSON.parse(currentUserJson);
    const userEmail = currentUser.email;

    const abosJson = await AsyncStorage.getItem('abos');
    if (!abosJson) return;
    let abos = JSON.parse(abosJson);

    const ausgabenJson = await AsyncStorage.getItem('ausgaben');
    let ausgaben = ausgabenJson ? JSON.parse(ausgabenJson) : [];

    const heute = new Date();
    let hatGeaendert = false;

    const neueAbos = abos.map(abo => {
      if (abo.userEmail !== userEmail) return abo;

      const lastProcessed = new Date(abo.lastProcessed);
      // Wenn letztes Mal in einem anderen Monat verarbeitet
      if (lastProcessed.getMonth() !== heute.getMonth() || lastProcessed.getFullYear() !== heute.getFullYear()) {
        // Neue Ausgabe erstellen
        const neueAusgabe = {
          id: Date.now().toString() + Math.random().toString(),
          betrag: abo.betrag,
          kategorie: 'Abo',
          notiz: `Abonnement: ${abo.name}`,
          konto: 'Girokonto',
          datum: heute.toISOString(),
          userEmail: userEmail,
          typ: 'ausgabe',
        };
        ausgaben.push(neueAusgabe);
        hatGeaendert = true;
        return { ...abo, lastProcessed: heute.toISOString() };
      }
      return abo;
    });

    if (hatGeaendert) {
      await AsyncStorage.setItem('ausgaben', JSON.stringify(ausgaben));
      await AsyncStorage.setItem('abos', JSON.stringify(neueAbos));
    }
  } catch (error) {
    console.error('Fehler bei der Abo-Verarbeitung:', error);
  }
};
