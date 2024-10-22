export class DBUtils {
  async createUser(username, hashedMasterPassword) {
    throw new Error("Not implemented");
  }
  async getUserByUsername(username) {
    throw new Error("Not implemented");
  }
  async getUserById(userId) {
    throw new Error("Not implemented");
  }
  async createPasswordForUser(
    userId,
    { website, encryptedUsername, encryptedPassword, notes }
  ) {
    throw new Error("Not implemented");
  }
  async getPasswordsForUser(userId) {
    throw new Error("Not implemented");
  }
  async getPasswordForUser(userId, passwordId) {
    throw new Error("Not implemented");
  }
  async deletePasswordForUser(userId, passwordId) {
    throw new Error("Not implemented");
  }
  async updatePasswordForUser(
    userId,
    passwordId,
    { website, encryptedUsername, encryptedPassword, notes }
  ) {
    throw new Error("Not implemented");
  }
  async close() {
    throw new Error("Not implemented");
  }
}
