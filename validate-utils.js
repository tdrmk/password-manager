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
  // password must be between 8 and 20 characters long
  // password must contain at least one lowercase letter
  // password must contain at least one uppercase letter
  // password must contain at least one number
  // password must contain at least one special character !@#$%^&*()-_+=
  // password must only contain the above characters

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (password.length > 20) {
    return "Password must be at most 20 characters long";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*()-_+=]/.test(password)) {
    return "Password must contain at least one special character among !@#$%^&*()-_+=";
  }

  if (!/^[a-zA-Z0-9!@#$%^&*()-_+=]+$/.test(password)) {
    return "Password can only contain letters, numbers, and special characters among !@#$%^&*()-_+=";
  }
  return true;
}
