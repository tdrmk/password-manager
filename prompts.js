import { validatePassword, validateUsername } from "./validate-utils.js";
import * as inquirer from "@inquirer/prompts";
import chalk from "chalk";

export async function registerUserPrompt() {
  const username = await inquirer.input({
    message: "Enter a username (to be your master username):",
    validate: validateUsername,
    required: true,
  });
  const password = await inquirer.password({
    message: "Enter a password (to be your master password):",
    mask: "*",
    validate: validatePassword,
  });

  // user must confirm their password to prevent typos
  const confirmPassword = await inquirer.password({
    message: "Confirm your password:",
    mask: "*",
    validate: (confirmPassword) => {
      if (confirmPassword !== password) {
        return "Passwords do not match";
      }
      return true;
    },
  });

  return { username, password };
}

export async function loginUserPrompt() {
  const username = await inquirer.input({
    message: "Enter your master username:",
    validate: validateUsername,
    required: true,
  });
  const password = await inquirer.password({
    message: "Enter your master password:",
    mask: "*",
    validate: validatePassword,
  });

  return { username, password };
}

export async function rootPrompt() {
  const choice = await inquirer.select({
    message: "What would you like to do?",
    choices: [
      { name: "Login", value: "login", description: "Log in to your account" },
      {
        name: "Register",
        value: "register",
        description: "Create a new account",
      },
      { name: "Exit", value: "exit", description: "Exit the program" },
    ],
  });

  return choice;
}

export async function managePasswordsPrompt(hasPasswords = true) {
  const choice = await inquirer.select({
    message: "What would you like to do?",
    choices: [
      {
        name: "Search Password",
        value: "search",
        description: "Search for a password by website",
        disabled: !hasPasswords,
      },
      { name: "Add Password", value: "add", description: "Add a new password" },
      { name: "Logout", value: "exit", description: "Log out of your account" },
      new inquirer.Separator(),
      {
        name: chalk.yellow("Change Password"),
        value: "change-master-password",
        description:
          "Change your master password. This will also re-encrypt all your passwords with the new master password",
      },
      {
        name: chalk.red("Delete Account"),
        value: "delete-account",
        description:
          "Delete your account (only allowed if you have no passwords)",
        disabled: hasPasswords,
      },
    ],
  });

  if (choice === "delete-account") {
    // reconfirm the user's choice to delete their account
    const confirm = await inquirer.confirm({
      message: chalk.red("Are you sure you want to delete your account?"),
      default: false,
    });

    if (!confirm) return "retry";
  }

  return choice;
}

export async function searchPasswordPrompt(passwords) {
  if (passwords.length === 0) return null;

  const password = await inquirer.search({
    message: "Enter the website to search for:",
    source: async (term) => {
      const filteredPasswords = term
        ? passwords.filter((password) => password.website.includes(term))
        : passwords;
      return filteredPasswords.map((password) => ({
        value: password,
        name: password.website,
        description: `Notes: ${password.notes || "N/A"}`,
      }));
    },
  });

  return password;
}

export async function managePasswordPrompt({ website }) {
  const choice = await inquirer.select({
    message: "What would you like to do with " + chalk.green(website) + "?",
    choices: [
      {
        name: "View Username",
        value: "view-username",
        description: "View the username for this password and also copy it",
      },
      {
        name: "Copy Password",
        value: "copy-password",
        description: "Copy the password to the clipboard",
      },
      {
        name: "View Details",
        value: "view-details",
        description:
          "View the website, username, notes, and other details (except password)",
      },
      { name: "Exit", value: "exit", description: "Go back to the main menu" },
      new inquirer.Separator(),
      {
        name: "Update Password",
        value: "update",
        description:
          "Update the website, username, password, or notes for this password",
      },
      {
        name: chalk.red("Delete Password"),
        value: "delete",
        description: "Delete this password details from your account",
      },
    ],
  });

  if (choice === "delete") {
    // reconfirm the user's choice to delete the password
    const confirm = await inquirer.confirm({
      message: chalk.red(
        `Are you sure you want to delete the password for ${website}?`
      ),
      default: false,
    });

    if (!confirm) return "retry";
  }

  return choice;
}

export async function addPasswordPrompt() {
  const website = await inquirer.input({
    message: "Enter the website:",
    required: true,
  });
  const username = await inquirer.input({
    message: "Enter the username:",
    required: true,
  });
  const password = await inquirer.password({
    message: "Enter the password:",
    mask: "*",
  });
  const notes = await inquirer.input({
    message: "Enter any notes (optional):",
  });

  return { website, username, password, notes };
}

export async function updatePasswordPrompt({
  website,
  username,
  password,
  notes,
}) {
  const newWebsite = await inquirer.input({
    message: "Enter the website:",
    required: true,
    default: website,
  });
  const newUsername = await inquirer.input({
    message: "Enter the username:",
    required: true,
    default: username,
  });
  const newPassword =
    (await inquirer.password({
      message: "Enter the password:",
      mask: "*",
    })) || password;
  const newNotes = await inquirer.input({
    message: "Enter any notes (optional):",
    default: notes,
  });

  return {
    website: newWebsite,
    username: newUsername,
    password: newPassword,
    notes: newNotes,
  };
}

export async function changeMasterPasswordPrompt() {
  const newPassword = await inquirer.password({
    message: "Enter your new master password:",
    mask: "*",
    validate: validatePassword,
  });

  // user must confirm their password to prevent typos
  const confirmPassword = await inquirer.password({
    message: "Confirm your new password:",
    mask: "*",
    validate: (confirmPassword) => {
      if (confirmPassword !== newPassword) {
        return "Passwords do not match";
      }
      return true;
    },
  });

  return newPassword;
}
