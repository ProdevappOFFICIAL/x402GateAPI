import prisma from '../configs/database';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Create sample users
    const user1 = await prisma.user.upsert({
      where: { walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
      update: {},
      create: {
        walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        email: 'alice@example.com'
      }
    });

    const user2 = await prisma.user.upsert({
      where: { walletAddress: 'FNqe4kqTJRXupcAhYXVNY9JjTZVZjBp6RezvxMrwQUR5' },
      update: {},
      create: {
        walletAddress: 'FNqe4kqTJRXupcAhYXVNY9JjTZVZjBp6RezvxMrwQUR5',
        email: 'bob@example.com'
      }
    });

    // Create sample stores
    const store1 = await prisma.store.upsert({
      where: { slug: 'cryptoart-gallery' },
      update: {},
      create: {
        name: 'CryptoArt Gallery',
        slug: 'cryptoart-gallery',
        description: 'Digital art and NFT marketplace for creators',
        iconUrl: '🎨',
        ownerId: user1.id,
        settings: {
          currency: 'SOL',
          language: 'English',
          timezone: 'UTC',
          theme: 'light'
        }
      }
    });

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  seedData();
}

export default seedData;