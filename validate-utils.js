export function validateUsername(username) {
  if (username.length < 3) {
    return "Username must be at least 3 characters long";
  }
  if (username.length > 20) {
    return "Username must be at most 20 characters long";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  }
  return true;
}

export function validatePassword(password) {
  if (password.length < 3) {
    return "Password must be at least 3 characters long";
  }
  return true;
}
