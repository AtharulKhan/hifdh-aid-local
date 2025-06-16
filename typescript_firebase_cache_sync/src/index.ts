// src/index.ts
import './firebase-init'; // Ensures Firebase is initialized
import { authService } from './auth-service';
import { databaseService } from './database-service';
import { User } from 'firebase/auth';

const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const registerButton = document.getElementById('register') as HTMLButtonElement;
const loginButton = document.getElementById('login') as HTMLButtonElement;
const logoutButton = document.getElementById('logout') as HTMLButtonElement;
const cacheDataInput = document.getElementById('cacheData') as HTMLTextAreaElement;
const updateCacheButton = document.getElementById('updateCache') as HTMLButtonElement;
const getCacheButton = document.getElementById('getCache') as HTMLButtonElement;
const userDataDisplay = document.getElementById('userData') as HTMLPreElement;
const cacheResultDisplay = document.getElementById('cacheResult') as HTMLPreElement;

let currentUser: User | null = null;

authService.authInstance.onAuthStateChanged(user => {
  currentUser = user;
  if (user) {
    userDataDisplay.textContent = `Logged in as: ${user.email} (UID: ${user.uid})`;
    loginButton.disabled = true;
    registerButton.disabled = true;
    logoutButton.disabled = false;
    updateCacheButton.disabled = false;
    getCacheButton.disabled = false;
  } else {
    userDataDisplay.textContent = 'Logged out.';
    loginButton.disabled = false;
    registerButton.disabled = false;
    logoutButton.disabled = true;
    updateCacheButton.disabled = true;
    getCacheButton.disabled = true;
    cacheResultDisplay.textContent = '';
  }
});

registerButton.onclick = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  await authService.registerWithEmailPassword(email, password);
};

loginButton.onclick = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  await authService.signInWithEmailPassword(email, password);
};

logoutButton.onclick = async () => {
  await authService.signOutUser();
};

updateCacheButton.onclick = async () => {
  if (!currentUser) {
    alert('Please log in first.');
    return;
  }
  try {
    const cacheData = JSON.parse(cacheDataInput.value || '{}');
    await databaseService.updateUserCache(currentUser.uid, cacheData);
    cacheResultDisplay.textContent = 'Cache updated!';
  } catch (e: any) {
    cacheResultDisplay.textContent = `Error updating cache: ${e.message}`;
    console.error(e);
  }
};

getCacheButton.onclick = async () => {
  if (!currentUser) {
    alert('Please log in first.');
    return;
  }
  try {
    const cache = await databaseService.getUserCache(currentUser.uid);
    if (cache) {
      cacheResultDisplay.textContent = `Current Cache:
${JSON.stringify(cache, null, 2)}`;
    } else {
      cacheResultDisplay.textContent = 'No cache found.';
    }
  } catch (e: any) {
    cacheResultDisplay.textContent = `Error getting cache: ${e.message}`;
  }
};
