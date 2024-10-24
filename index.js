import { createDBUtils } from "./db-utils.js";
import {
  hashPassword,
  matchesPassword,
  encrypt,
  decrypt,
  deriveKey,
} from "./crypto-utils.js";
import {
  rootPrompt,
  registerUserPrompt,
  loginUserPrompt,
  managePasswordsPrompt,
  addPasswordPrompt,
  searchPasswordPrompt,
  managePasswordPrompt,
  updatePasswordPrompt,
  changeMasterPasswordPrompt,
} from "./prompts.js";
import chalk from "chalk";
import clipboard from "clipboardy";

const dbUtils = await createDBUtils(process.env.DB_TYPE);

async function managePasswords(userId, masterKey) {
  while (true) {
    const passwords = await dbUtils.getPasswordsForUser(userId);
    const hasPasswords = passwords.length > 0;
    const choice = await managePasswordsPrompt(hasPasswords);
    if (choice === "add") {
      const { website, username, password, notes } = await addPasswordPrompt();
      await dbUtils.createPasswordForUser(userId, {
        website,
        encryptedUsername: encrypt(username, masterKey),
        encryptedPassword: encrypt(password, masterKey),
        notes,
      });
      console.log(chalk.green("Password added!"));
    } else if (choice === "search") {
      const passwords = await dbUtils.getPasswordsForUser(userId);
      const password = await searchPasswordPrompt(passwords);
      if (!password) {
        console.log(chalk.red("Password not found"));
        continue;
      }

      const { _id: passwordId } = password;
      while (true) {
        const password = await dbUtils.getPasswordForUser(userId, passwordId);
        const choice = await managePasswordPrompt(password);
        const { website, encryptedUsername, encryptedPassword, notes } =
          password;
        if (choice === "view-username") {
          const username = decrypt(encryptedUsername, masterKey);
          await clipboard.write(decrypt(encryptedUsername, masterKey));
          console.log(
            chalk.green("Username: "),
            chalk.bold.bgWhite.green(` ${username} `)
          );
        } else if (choice === "copy-password") {
          const password = decrypt(encryptedPassword, masterKey);
          await clipboard.write(password);
          console.log(chalk.green("Password copied to clipboard!"));
        } else if (choice === "view-details") {
          const print = (label, value) =>
            console.log(
              chalk.green(label.padEnd(15)),
              chalk.blue(value || "N/A")
            );

          const getDate = (date) =>
            date ? new Date(date).toLocaleString() : null;

          print("Website:", website);
          print("Username:", decrypt(encryptedUsername, masterKey));
          print("Notes:", notes);
          print("Created At:", getDate(password.createdAt));
          print("Updated At:", getDate(password.updatedAt));
        } else if (choice === "update") {
          const updatedFields = await updatePasswordPrompt({
            website,
            username: decrypt(encryptedUsername, masterKey),
            password: decrypt(encryptedPassword, masterKey),
            notes,
          });
          await dbUtils.updatePasswordForUser(userId, password._id, {
            website: updatedFields.website,
            encryptedUsername: encrypt(updatedFields.username, masterKey),
            encryptedPassword: encrypt(updatedFields.password, masterKey),
            notes: updatedFields.notes,
          });
          console.log(chalk.green("Password updated!"));
        } else if (choice === "delete") {
          await dbUtils.deletePasswordForUser(userId, passwordId);
          console.log(chalk.green("Password deleted!"));
          break;
        } else if (choice === "exit") {
          break;
        }
      }
    } else if (choice === "delete-account") {
      // Prompt makes sure the user wants to delete the account (via reconfirmation)
      await dbUtils.deleteUser(userId);
      console.log(chalk.green("Account deleted!"));
      break;
    } else if (choice === "change-master-password") {
      // Get the new master password from the user
      // Create a new user with the new master password (and same username)
      // Re-encrypt all the passwords with the new master password
      // Delete the old user and all its passwords
      // and log the user out
      const newPassword = await changeMasterPasswordPrompt();

      // Get the existing user and all their passwords
      const user = await dbUtils.getUserById(userId);
      const passwords = await dbUtils.getPasswordsForUser(userId);

      // Create a new user with the new master password
      const newUserId = await dbUtils.createUser(
        user.username,
        hashPassword(newPassword)
      );
      const newMasterKey = deriveKey(newPassword);

      // Re-encrypt all the passwords with the new master password
      for (const password of passwords) {
        await dbUtils.createPasswordForUser(newUserId, {
          website: password.website,
          encryptedUsername: encrypt(
            decrypt(password.encryptedUsername, masterKey),
            newMasterKey
          ),
          encryptedPassword: encrypt(
            decrypt(password.encryptedPassword, masterKey),
            newMasterKey
          ),
          notes: password.notes,
        });
      }

      // Delete the old user and all its passwords
      await dbUtils.deleteUser(userId);
      console.log(chalk.green("Master password changed!"));
      console.log(chalk.blue("You have been logged out. Please login again."));
      break;
    } else if (choice === "exit") {
      break;
    }
  }
}

async function main() {
  while (true) {
    const choice = await rootPrompt();

    if (choice === "register") {
      const { username, password } = await registerUserPrompt();
      const existinUser = await dbUtils.getUserByUsername(username);
      if (existinUser) {
        console.log(chalk.red("User already exists"));
        continue;
      }

      const hashedMasterPassword = hashPassword(password);
      await dbUtils.createUser(username, hashedMasterPassword);
      console.log(chalk.green("User created! You can now login"));
    } else if (choice === "login") {
      const { username, password } = await loginUserPrompt();
      const user = await dbUtils.getUserByUsername(username);

      if (!user || !matchesPassword(password, user.hashedMasterPassword)) {
        console.log(chalk.red("Invalid username or password"));
        continue;
      }

      console.log(chalk.green(`Logged in! Welcome ${user.username}`));
      const masterKey = deriveKey(password);
      await managePasswords(user._id, masterKey);
    } else if (choice === "exit") {
      console.log(chalk.green("Goodbye!"));
      await dbUtils.close();
      break;
    }
  }
}

main();
