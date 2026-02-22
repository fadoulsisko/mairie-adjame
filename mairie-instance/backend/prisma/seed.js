const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Créer une mairie de test
  const mairie = await prisma.mairie.create({
    data: {
      name: 'Mairie Exemple',
      domain: 'mairie-exemple.local',
      subdomain: 'mairie-exemple',
      primaryColor: '#1F2937',
      secondaryColor: '#3B82F6',
      address: '123 Rue Principal',
      phone: '01 00 00 00 00',
      email: 'contact@mairie-exemple.local',
      mayorName: 'Monsieur le Maire',
    }
  });

  // Créer un user admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mairie-exemple.local',
      passwordHash: adminPassword,
      nom: 'Admin',
      prenom: 'Test',
      role: 'ADMIN',
      mairieId: mairie.id,
    }
  });

  // Créer un user assistante
  const assistantPassword = await bcrypt.hash('assistant123', 10);
  const assistant = await prisma.user.create({
    data: {
      email: 'assistante@mairie-exemple.local',
      passwordHash: assistantPassword,
      nom: 'Assistante',
      prenom: 'Test',
      role: 'ASSISTANTE',
      mairieId: mairie.id,
    }
  });

  console.log('✅ Seed completed!');
  console.log('Mairie:', mairie.name);
  console.log('Admin:', admin.email);
  console.log('Assistante:', assistant.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
