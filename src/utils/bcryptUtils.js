import bcrypt from 'bcrypt';

export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
