import * as bcrypt from 'bcrypt';

export class BcryptService {
  private rounds: number = 10;
  async hash(password: string) {
    const salt = await bcrypt.genSalt(this.rounds);
    return await bcrypt.hash(password, salt);
  }
  async compare(rawPass: string, encryptedPass: string) {
    return await bcrypt.compare(rawPass, encryptedPass);
  }
}
