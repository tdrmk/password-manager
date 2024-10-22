import { DBUtils } from "./db-utils.abstract.js";
import { MongoClient, ObjectId } from "mongodb";

export class MongoDbUtils extends DBUtils {
  constructor(uri) {
    super();
    this.client = new MongoClient(uri);
  }

  async connect() {
    await this.client.connect();
    this.database = this.client.db("password_manager");
    this.collection = this.database.collection("users");
  }

  async createUser(username, hashedMasterPassword) {
    const insertResult = await this.collection.insertOne({
      username,
      hashedMasterPassword,
      passwords: [],
      createdAt: new Date(),
    });
    return insertResult.insertedId;
  }

  async getUserByUsername(username) {
    const user = await this.collection.findOne({ username });
    return user;
  }

  async getUserById(userId) {
    const user = await this.collection.findOne({ _id: userId });
    return user;
  }

  async createPasswordForUser(
    userId,
    { website, encryptedUsername, encryptedPassword, notes }
  ) {
    const password = {
      _id: new ObjectId(),
      website,
      encryptedUsername,
      encryptedPassword,
      notes,
      createdAt: new Date(),
    };
    // https://www.mongodb.com/docs/manual/reference/operator/update/push/#append-a-value-to-an-array
    await this.collection.updateOne(
      { _id: userId },
      {
        $push: {
          passwords: password,
        },
      }
    );
    return password;
  }

  async getPasswordsForUser(userId) {
    const user = await this.getUserById(userId);
    return user.passwords;
  }

  async getPasswordForUser(userId, passwordId) {
    const user = await this.getUserById(userId);
    return user.passwords.find((password) => password._id.equals(passwordId));
  }

  async deletePasswordForUser(userId, passwordId) {
    // https://www.mongodb.com/docs/manual/reference/operator/update/pull/#remove-items-from-an-array-of-documents
    await this.collection.updateOne(
      { _id: userId },
      {
        $pull: {
          passwords: {
            _id: passwordId,
          },
        },
      }
    );
  }

  async updatePasswordForUser(
    userId,
    passwordId,
    { website, encryptedUsername, encryptedPassword, notes }
  ) {
    // https://www.mongodb.com/docs/manual/reference/operator/update/positional/#update-documents-in-an-array
    await this.collection.updateOne(
      { _id: userId, "passwords._id": passwordId },
      {
        $set: {
          "passwords.$.website": website,
          "passwords.$.encryptedUsername": encryptedUsername,
          "passwords.$.encryptedPassword": encryptedPassword,
          "passwords.$.notes": notes,
          "passwords.$.updatedAt": new Date(),
        },
      }
    );
  }

  async close() {
    await this.client.close();
  }
}
