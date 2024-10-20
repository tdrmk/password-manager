import {
  createUser,
  getUserByUsername,
  getUserById,
  getPasswordsForUser,
  getPasswordForUser,
  deletePasswordForUser,
  updatePasswordForUser,
  createPasswordForUser,
  close,
} from "./db-utils.lowdb.js";
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
} from "./prompts.js";
import chalk from "chalk";
import clipboard from "clipboardy";
async function managePasswords(userId, masterKey) {
  while (true) {
    const passwords = await getPasswordsForUser(userId);
    const hasPasswords = passwords.length > 0;
    const choice = await managePasswordsPrompt(hasPasswords);
    if (choice === "add") {
      const { website, username, password, notes } = await addPasswordPrompt();
      await createPasswordForUser(userId, {
        website,
        encryptedUsername: encrypt(username, masterKey),
        encryptedPassword: encrypt(password, masterKey),
        notes,
      });
      console.log(chalk.green("Password added!"));
    } else if (choice === "search") {
      const passwords = await getPasswordsForUser(userId);
      const password = await searchPasswordPrompt(passwords);
      if (!password) {
        console.log(chalk.red("Password not found"));
        continue;
      }

      const { _id: passwordId } = password;
      console.log(chalk.green("Website: "), password.website);
      while (true) {
        const password = await getPasswordForUser(userId, passwordId);
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
        } else if (choice === "update") {
          const updatedFields = await updatePasswordPrompt({
            website,
            username: decrypt(encryptedUsername, masterKey),
            password: decrypt(encryptedPassword, masterKey),
            notes,
          });
          await updatePasswordForUser(userId, password._id, {
            website: updatedFields.website,
            encryptedUsername: encrypt(updatedFields.username, masterKey),
            encryptedPassword: encrypt(updatedFields.password, masterKey),
            notes: updatedFields.notes,
          });
          console.log(chalk.green("Password updated!"));
        } else if (choice === "delete") {
          await deletePasswordForUser(userId, passwordId);
          console.log(chalk.green("Password deleted!"));
          break;
        } else if (choice === "exit") {
          break;
        }
      }
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
      const existinUser = await getUserByUsername(username);
      if (existinUser) {
        console.log(chalk.red("User already exists"));
        continue;
      }

      const hashedMasterPassword = hashPassword(password);
      await createUser(username, hashedMasterPassword);
      console.log(chalk.green("User created! You can now login"));
    } else if (choice === "login") {
      const { username, password } = await loginUserPrompt();
      const user = await getUserByUsername(username);

      if (!user || !matchesPassword(password, user.hashedMasterPassword)) {
        console.log(chalk.red("Invalid username or password"));
        continue;
      }

      console.log(chalk.green(`Logged in! Welcome ${user.username}`));
      const masterKey = deriveKey(password);
      await managePasswords(user._id, masterKey);
    } else if (choice === "exit") {
      console.log(chalk.green("Goodbye!"));
      await close();
      break;
    }
  }
}

main();
