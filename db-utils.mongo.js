import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.DB_URI;
const client = new MongoClient(uri);
await client.connect();

const database = client.db("password_manager");
const collection = database.collection("users");

export async function createUser(username, hashedMasterPassword) {
  const insertResult = await collection.insertOne({
    username,
    hashedMasterPassword,
    passwords: [],
    createdAt: new Date(),
  });
  return insertResult.insertedId;
}

export async function getUserByUsername(username) {
  const user = await collection.findOne({ username });
  return user;
}

export async function getUserById(userId) {
  const user = await collection.findOne({ _id: userId });
  return user;
}

export async function createPasswordForUser(
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
  await collection.updateOne(
    { _id: userId },
    {
      $push: {
        passwords: password,
      },
    }
  );
  return password;
}

export async function getPasswordsForUser(userId) {
  const user = await getUserById(userId);
  return user.passwords;
}

export async function getPasswordForUser(userId, passwordId) {
  const user = await getUserById(userId);
  return user.passwords.find((password) => password._id.equals(passwordId));
}

export async function deletePasswordForUser(userId, passwordId) {
  // https://www.mongodb.com/docs/manual/reference/operator/update/pull/#remove-items-from-an-array-of-documents
  await collection.updateOne(
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

export async function updatePasswordForUser(
  userId,
  passwordId,
  { website, encryptedUsername, encryptedPassword, notes }
) {
  // https://www.mongodb.com/docs/manual/reference/operator/update/positional/#update-documents-in-an-array
  await collection.updateOne(
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

export async function close() {
  await client.close();
}
