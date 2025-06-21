import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // 既存の管理者ユーザーをチェック
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@example.com',
        isDeleted: false
      }
    });

    if (existingAdmin) {
      console.log('管理者ユーザーは既に存在します:', existingAdmin.email);
      return;
    }

    // パスワードをハッシュ化
    const password = 'Admin123'; // 初期パスワード
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 管理者ユーザー作成
    const adminUser = await prisma.user.create({
      data: {
        name: 'システム管理者',
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isFirstLogin: false, // 初期設定済みとする
        emailVerified: new Date(), // メール確認済みとする
      }
    });

    console.log('管理者ユーザーを作成しました:');
    console.log('Email:', adminUser.email);
    console.log('Password:', password);
    console.log('Role:', adminUser.role);
    console.log('');
    console.log('ログイン情報:');
    console.log('URL: http://localhost:3000/login');
    console.log('Email: admin@example.com');
    console.log('Password: Admin123');

  } catch (error) {
    console.error('管理者ユーザー作成エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();