/**
 * Health Check for FinanzApp
 * Checks if all critical systems work: AsyncStorage, Crypto (bcryptjs), etc.
 * Call this on app start to catch problems early.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'bcryptjs';
import logger from './logger';

const CTX = 'HealthCheck';

export async function runHealthCheck() {
  const results = {
    asyncStorage: false,
    bcrypt: false,
    users: null,
    timestamp: new Date().toISOString(),
  };

  // 1. AsyncStorage read/write
  try {
    const testKey = '__healthcheck__';
    await AsyncStorage.setItem(testKey, 'ok');
    const val = await AsyncStorage.getItem(testKey);
    await AsyncStorage.removeItem(testKey);
    results.asyncStorage = val === 'ok';
    logger.info(CTX, 'AsyncStorage: OK');
  } catch (e) {
    logger.error(CTX, 'AsyncStorage: FAILED', e.message);
  }

  // 2. bcryptjs hash + compare
  try {
    const hash = bcrypt.hashSync('healthcheck', 8);
    const match = bcrypt.compareSync('healthcheck', hash);
    results.bcrypt = match === true;
    logger.info(CTX, 'bcryptjs: OK');
  } catch (e) {
    logger.error(CTX, 'bcryptjs: FAILED', e.message);
  }

  // 3. Check registered users count
  try {
    const usersJson = await AsyncStorage.getItem('users');
    const users = usersJson ? JSON.parse(usersJson) : [];
    results.users = users.length;
    logger.info(CTX, `Registered users: ${users.length}`);
  } catch (e) {
    logger.warn(CTX, 'Could not read users', e.message);
  }

  // Summary
  const allGood = results.asyncStorage && results.bcrypt;
  if (allGood) {
    logger.info(CTX, '--- ALL SYSTEMS GO ---');
  } else {
    logger.error(CTX, '--- HEALTH CHECK FAILED ---', results);
  }

  return results;
}
