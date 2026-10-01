const assert = require('assert');

let registeredUsers = [];
function setRegisteredUsers(updater) {
  registeredUsers = typeof updater === 'function' ? updater(registeredUsers) : updater;
}

async function registerCustomer(email) {
  const newUser = { email: email.trim().toLowerCase(), password: 'password123' };
  setRegisteredUsers(prev => [...prev, newUser]);
  return true;
}

async function loginCustomer(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const matched = registeredUsers.find(u => u.email === cleanEmail);
  if (!matched) return false;
  return matched.password === password;
}

async function run() {
  await registerCustomer(' Test@email.com ');
  const loginSuccess = await loginCustomer('test@email.com', 'password123');
  assert(loginSuccess === true);
  console.log('Success');
}

run();
