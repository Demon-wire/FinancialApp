// utils/SubscriptionProcessor.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // Using Alert for user feedback if needed

const SUBSCRIPTION_EXPENSE_CATEGORY = 'Abonnement'; // Default category for subscription expenses

export const processSubscriptions = async (userEmail) => {
  if (!userEmail) {
    console.error('SubscriptionProcessor: userEmail ist nicht verfügbar.');
    return;
  }

  try {
    // 1. Load all subscriptions
    const gespeicherteAbosJson = await AsyncStorage.getItem('abos');
    let alleAbos = gespeicherteAbosJson ? JSON.parse(gespeicherteAbosJson) : [];

    // Filter abos for the current user
    const userAbos = alleAbos.filter(abo => abo.userEmail === userEmail);
    
    // 2. Load all existing expenses
    const gespeicherteAusgabenJson = await AsyncStorage.getItem('ausgaben');
    let alleAusgaben = gespeicherteAusgabenJson ? JSON.parse(gespeicherteAusgabenJson) : [];

    const newExpenses = [];
    const updatedAbos = [];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    for (const abo of userAbos) {
      const lastProcessedDate = abo.lastProcessed ? new Date(abo.lastProcessed) : null;
      
      // Check if this abo has already been processed for the current month and year
      const alreadyProcessedForThisMonth = lastProcessedDate && 
                                           lastProcessedDate.getMonth() === currentMonth &&
                                           lastProcessedDate.getFullYear() === currentYear;

      if (!alreadyProcessedForThisMonth) {
        // Create a new expense entry
        const neueAusgabe = {
          id: `abo-${abo.id}-${currentYear}-${currentMonth}`, // Unique ID for monthly entry
          betrag: abo.betrag,
          kategorie: SUBSCRIPTION_EXPENSE_CATEGORY,
          notiz: `Automatischer Monatsbeitrag für ${abo.name}`,
          datum: new Date().toISOString(), // Date of entry
          userEmail: abo.userEmail,
        };
        newExpenses.push(neueAusgabe);

        // Update the lastProcessed date for the subscription
        abo.lastProcessed = new Date().toISOString();
        updatedAbos.push(abo);
      }
    }

    if (newExpenses.length > 0) {
      // Add new expenses to the existing list
      alleAusgaben = [...alleAusgaben, ...newExpenses];
      await AsyncStorage.setItem('ausgaben', JSON.stringify(alleAusgaben));
      console.log(`SubscriptionProcessor: ${newExpenses.length} neue Ausgaben hinzugefügt.`);
      // Alert.alert('Information', `${newExpenses.length} monatliche Abos als Ausgaben verbucht.`);
    }

    if (updatedAbos.length > 0) {
      // Update the abos in the main list (alleAbos might contain other users' abos)
      alleAbos = alleAbos.map(existingAbo => {
        const updated = updatedAbos.find(ua => ua.id === existingAbo.id);
        return updated || existingAbo;
      });
      await AsyncStorage.setItem('abos', JSON.stringify(alleAbos));
      console.log(`SubscriptionProcessor: ${updatedAbos.length} Abos aktualisiert.`);
    }

  } catch (error) {
    console.error('Fehler beim Verarbeiten der Abonnements:', error);
    // Alert.alert('Fehler', 'Fehler beim automatischen Verbuchen der Abos.');
  }
};
