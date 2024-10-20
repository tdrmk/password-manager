import { JSONFilePreset } from "lowdb/node";
import { v4 as uuid } from "uuid";

const DB_FILE = process.env.DB_FILE || "db.json";
const db = await JSONFilePreset(DB_FILE, {
  users: [],
});
await db.write();

export async function createUser(username, hashedMasterPassword) {
  const user = {
    id: uuid(),
    username,
    hashedMasterPassword,
    passwords: [],
  };

  db.data.users.push(user);
  await db.write();
}

export async function getUserByUsername(username) {
  await db.read();
  return db.data.users.find((user) => user.username === username);
}

export async function getUserById(userId) {
  await db.read();
  return db.data.users.find((user) => user.id === userId);
}

export async function createPasswordForUser(
  userId,
  { website, encryptedUsername, encryptedPassword, notes }
) {
  const user = await getUserById(userId);
  const password = {
    id: uuid(),
    website,
    encryptedUsername,
    encryptedPassword,
    notes,
  };

  user.passwords.push(password);
  await db.write();
  return password;
}

export async function getPasswordsForUser(userId) {
  const user = await getUserById(userId);
  return user.passwords;
}

export async function getPasswordForUser(userId, passwordId) {
  const user = await getUserById(userId);
  return user.passwords.find((password) => password.id === passwordId);
}

export async function deletePasswordForUser(userId, passwordId) {
  const user = await getUserById(userId);
  user.passwords = user.passwords.filter(
    (password) => password.id !== passwordId
  );
  await db.write();
}

export async function updatePasswordForUser(
  userId,
  passwordId,
  { website, encrypedUsername, encryptedPassword, notes }
) {
  const user = await getUserById(userId);
  const password = user.passwords.find(
    (password) => password.id === passwordId
  );

  password.website = website;
  password.encrypedUsername = encrypedUsername;
  password.encryptedPassword = encryptedPassword;
  password.notes = notes;

  await db.write();
}
