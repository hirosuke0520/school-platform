import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test users for E2E tests...');

  // Delete existing test users
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['admin@test.com', 'instructor@test.com', 'learner@test.com']
      }
    }
  });

  // Create test users with proper password hashes
  const testUsers = [
    {
      email: 'admin@test.com',
      name: '管理者',
      password: 'admin123',
      role: 'ADMIN' as const,
    },
    {
      email: 'instructor@test.com', 
      name: '講師',
      password: 'instructor123',
      role: 'INSTRUCTOR' as const,
    },
    {
      email: 'learner@test.com',
      name: '学習者',
      password: 'learner123', 
      role: 'LEARNER' as const,
    },
  ];

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash: hashedPassword,
        role: userData.role,
        isFirstLogin: false,
        emailVerified: new Date(),
      },
    });

    console.log(`Created test user: ${userData.email}`);
  }

  console.log('Test users created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });