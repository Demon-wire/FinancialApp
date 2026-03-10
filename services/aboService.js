import { getItem, setItem } from '../utils/storage';

export const verarbeiteAbos = async () => {
  try {
    const currentUserJson = await getItem('currentUser');
    if (!currentUserJson) return;
    const currentUser = JSON.parse(currentUserJson);
    const userEmail = currentUser.email;

    const abosJson = await getItem('abos');
    if (!abosJson) return;
    let abos = JSON.parse(abosJson);

    const ausgabenJson = await getItem('ausgaben');
    let ausgaben = ausgabenJson ? JSON.parse(ausgabenJson) : [];

    const heute = new Date();
    let hatGeaendert = false;

    const neueAbos = abos.map(abo => {
      if (abo.userEmail !== userEmail) return abo;

      const lastProcessed = new Date(abo.lastProcessed);
      const intervall = abo.intervall || 'monatlich';

      let faellig = false;
      if (intervall === 'monatlich') {
        faellig = lastProcessed.getMonth() !== heute.getMonth() ||
                  lastProcessed.getFullYear() !== heute.getFullYear();
      } else if (intervall === 'wöchentlich') {
        const diffMs = heute.getTime() - lastProcessed.getTime();
        faellig = diffMs >= 7 * 24 * 60 * 60 * 1000;
      } else if (intervall === 'jährlich') {
        faellig = lastProcessed.getFullYear() !== heute.getFullYear();
      }

      if (faellig) {
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
      await setItem('ausgaben', JSON.stringify(ausgaben));
      await setItem('abos', JSON.stringify(neueAbos));
    }
  } catch (error) {
    console.error('Fehler bei der Abo-Verarbeitung:', error);
  }
};
