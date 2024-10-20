import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "crypto";
import { hashSync, genSaltSync, compareSync } from "bcrypt";

export function hashPassword(password) {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
}

export function matchesPassword(password, hash) {
  return compareSync(password, hash);
}

export function encrypt(plaintext, key) {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  let encryptedText = cipher.update(plaintext, "utf8", "hex");
  encryptedText += cipher.final("hex");
  return iv.toString("hex") + ":" + encryptedText;
}

export function decrypt(ciphertext, key) {
  const [iv, encryptedText] = ciphertext.split(":");
  const decipher = createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function deriveKey(password) {
  return createHash("sha256").update(password).digest();
}
