import bcrypt from 'bcryptjs';

export function generateTemporaryPassword(): string {
  // 読みやすい8文字のランダムパスワードを生成
  const uppercase = 'ABCDEFGHIJKLMNPQRSTUVWXYZ'; // O除外
  const lowercase = 'abcdefghijkmnpqrstuvwxyz'; // l除外
  const numbers = '23456789'; // 0,1除外
  
  let password = '';
  
  // 各文字種から最低1文字
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // 残り5文字をランダム
  const allChars = uppercase + lowercase + numbers;
  for (let i = 0; i < 5; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // 文字列をシャッフル
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}