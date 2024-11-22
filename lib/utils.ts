import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';
import { createCipheriv, createDecipheriv, randomBytes } from "crypto"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDateTime = (date: Date | string) => {
  const d = new Date(date);
  return format(d, 'yyyy-MM-dd HH:mm:ss');
};

export class Encryption {
  private static algorithm = 'aes-256-cbc'
  private static secretKey = process.env.ENCRYPTION_KEY 

  static encrypt(text: string) {
      const iv = randomBytes(16)
      const cipher = createCipheriv(
          this.algorithm, 
          Buffer.from(this.secretKey as string, 'hex'),
          iv
      )
      
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      return {
          encrypted,
          iv: iv.toString('hex')
      }
  }

  static decrypt(encrypted: string, iv: string) {
      const decipher = createDecipheriv(
          this.algorithm,
          Buffer.from(this.secretKey as string, 'hex'),
          Buffer.from(iv, 'hex')
      )
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
  }
}