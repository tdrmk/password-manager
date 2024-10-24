import { DBUtils } from "./db-utils.abstract.js";
import { v4 as uuid } from "uuid";

export class LowDBUtils extends DBUtils {
  constructor(db) {
    super();
    this.db = db;
  }

  async createUser(username, hashedMasterPassword) {
    const user = {
      _id: uuid(),
      username,
      hashedMasterPassword,
      passwords: [],
      createdAt: new Date(),
    };

    this.db.data.users.push(user);
    await this.db.write();
    return user._id;
  }

  async getUserByUsername(username) {
    await this.db.read();
    return this.db.data.users.find((user) => user.username === username);
  }

  async getUserById(userId) {
    await this.db.read();
    return this.db.data.users.find((user) => user._id === userId);
  }

  async createPasswordForUser(
    userId,
    { website, encryptedUsername, encryptedPassword, notes }
  ) {
    const user = await this.getUserById(userId);
    const password = {
      _id: uuid(),
      website,
      encryptedUsername,
      encryptedPassword,
      notes,
      createdAt: new Date(),
    };

    user.passwords.push(password);
    await this.db.write();
    return password;
  }

  async getPasswordsForUser(userId) {
    const user = await this.getUserById(userId);
    return user.passwords;
  }

  async getPasswordForUser(userId, passwordId) {
    const user = await this.getUserById(userId);
    return user.passwords.find((password) => password._id === passwordId);
  }

  async deletePasswordForUser(userId, passwordId) {
    const user = await this.getUserById(userId);
    user.passwords = user.passwords.filter(
      (password) => password._id !== passwordId
    );
    await this.db.write();
  }

  async updatePasswordForUser(
    userId,
    passwordId,
    { website, encryptedUsername, encryptedPassword, notes }
  ) {
    const user = await this.getUserById(userId);
    const password = user.passwords.find(
      (password) => password._id === passwordId
    );

    password.website = website;
    password.encryptedUsername = encryptedUsername;
    password.encryptedPassword = encryptedPassword;
    password.notes = notes;
    password.updatedAt = new Date();

    await this.db.write();
  }

  async deleteUser(userId) {
    this.db.data.users = this.db.data.users.filter(
      (user) => user._id !== userId
    );
    await this.db.write();
  }

  async close() {
    await this.db.write();
  }
}
