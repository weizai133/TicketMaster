import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(providedPasswod: string, storedPassword: string) {
    const [hashPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(providedPasswod, salt, 64)) as Buffer;
    const pw = buf.toString('hex');
    return hashPassword === pw;
  }
}