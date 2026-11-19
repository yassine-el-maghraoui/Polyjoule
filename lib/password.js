export const PASSWORD_MIN_LENGTH = 12;
const BCRYPT_MAX_BYTES = 72;

export const TEMPORARY_PASSWORD_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const COMMON_WORDS = [
  'polyjoule',
  'polytech',
  'password',
  'motdepasse',
  'azerty',
  'qwerty',
  'changeme',
  'admin',
  '123456',
  'soleil',
];

export function validateNewPassword(password, { email, name } = {}) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`;
  }
  if (new TextEncoder().encode(password).length > BCRYPT_MAX_BYTES) {
    return 'Le mot de passe est trop long (72 caractères maximum).';
  }
  if (new Set(password).size < 5) {
    return 'Le mot de passe est trop répétitif.';
  }

  const lowered = password.toLowerCase();
  if (COMMON_WORDS.some((word) => lowered.includes(word))) {
    return 'Le mot de passe contient un mot trop courant (polyjoule, azerty, 123456…).';
  }

  const personalParts = [
    ...(email ? [email.split('@')[0]] : []),
    ...(name ? name.split(/\s+/) : []),
  ]
    .map((part) => part.toLowerCase())
    .filter((part) => part.length >= 4);
  if (personalParts.some((part) => lowered.includes(part))) {
    return 'Le mot de passe ne doit pas contenir votre nom ou votre adresse e-mail.';
  }

  return null;
}

export function generateTemporaryPassword(length = 16) {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const limit = 256 - (256 % alphabet.length);
  let value = '';
  while (value.length < length) {
    const bytes = new Uint8Array(length * 2);
    globalThis.crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < limit && value.length < length) {
        value += alphabet[byte % alphabet.length];
      }
    }
  }
  return value;
}
