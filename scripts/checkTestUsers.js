const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkTestUsers() {
  try {
    console.log('Checking test users in database...');
    
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@test.com', 'instructor@test.com', 'learner@test.com']
        }
      }
    });
    
    console.log(`Found ${users.length} test users:`);
    
    for (const user of users) {
      console.log(`\nUser: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Has password: ${!!user.passwordHash}`);
      console.log(`  Is deleted: ${user.isDeleted}`);
      console.log(`  Email verified: ${user.emailVerified}`);
      
      // Test password verification
      if (user.passwordHash) {
        let testPassword = '';
        if (user.email === 'admin@test.com') testPassword = 'admin123';
        else if (user.email === 'instructor@test.com') testPassword = 'instructor123';
        else if (user.email === 'learner@test.com') testPassword = 'learner123';
        
        const isValid = await bcrypt.compare(testPassword, user.passwordHash);
        console.log(`  Password "${testPassword}" valid: ${isValid}`);
      }
    }
    
  } catch (error) {
    console.error('Error checking test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestUsers();