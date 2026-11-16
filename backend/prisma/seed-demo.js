import '../src/config/env.js';
import { prisma } from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/password.js';
import crypto from 'node:crypto';

// Safe, idempotent demonstration seeder.
// - Only inserts when the relevant tables are EMPTY (never deletes or overwrites).
// - Uses fictional companies/people only.
// - Demo employee passwords are random and never printed or stored anywhere.
const DAY = 86_400_000;
const days = (n) => new Date(Date.now() + n * DAY);

async function main() {
  const [clientCount, campaignCount, taskCount, empCount] = await Promise.all([
    prisma.client.count(),
    prisma.campaign.count(),
    prisma.task.count(),
    prisma.user.count({ where: { role: 'EMPLOYEE' } })
  ]);

  if (clientCount || campaignCount || taskCount || empCount) {
    console.log('Demo data already present — skipping to avoid duplicates/overwrites.');
    console.log(JSON.stringify({ clientCount, campaignCount, taskCount, empCount }));
    return;
  }

  // Fictional employees (random unrecoverable passwords; login not required for demos).
  const employeeSeed = [
    { name: 'Sarah Laurent', email: 'sarah.laurent@agencyflow.demo' },
    { name: 'Marc Dubois', email: 'marc.dubois@agencyflow.demo' },
    { name: 'Amina Kaci', email: 'amina.kaci@agencyflow.demo' }
  ];
  const employees = [];
  for (const e of employeeSeed) {
    const passwordHash = await hashPassword(crypto.randomBytes(16).toString('hex'));
    employees.push(await prisma.user.create({ data: { ...e, passwordHash, role: 'EMPLOYEE' } }));
  }
  const [sarah, marc, amina] = employees;

  // Fictional clients.
  const clientSeed = [
    { name: 'Camille Fontaine', company: 'Nova Bakery', email: 'contact@novabakery.demo', status: 'ACTIVE' },
    { name: 'Julien Roy', company: 'Atlas Fitness', email: 'hello@atlasfitness.demo', status: 'ACTIVE' },
    { name: 'Élodie Marchand', company: 'Vertdéco Jardins', email: 'info@vertdeco.demo', status: 'LEAD' },
    { name: 'Nicolas Petit', company: 'TechPulse SAS', email: 'team@techpulse.demo', status: 'ACTIVE' },
    { name: 'Sophie Girard', company: 'Café Lumière', email: 'bonjour@cafelumiere.demo', status: 'LEAD' },
    { name: 'Thomas Lefèvre', company: 'Boréal Outdoors', email: 'contact@borealoutdoors.demo', status: 'INACTIVE' }
  ];
  const clients = [];
  for (const c of clientSeed) {
    clients.push(await prisma.client.create({ data: c }));
  }
  const [nova, atlas, vertdeco, techpulse, cafe, boreal] = clients;

  // Fictional campaigns across statuses.
  const campaignSeed = [
    { name: 'Lancement Nova — Instagram', platform: 'Meta Ads', budget: 4500, startDate: days(-20), endDate: days(25), status: 'ACTIVE', clientId: nova.id },
    { name: 'SEO Local Atlas Fitness', platform: 'Google', budget: 3000, startDate: days(-35), endDate: days(40), status: 'ACTIVE', clientId: atlas.id },
    { name: 'Newsletter Vertdéco', platform: 'Email', budget: 1200, startDate: days(5), endDate: days(60), status: 'DRAFT', clientId: vertdeco.id },
    { name: 'LinkedIn Ads TechPulse', platform: 'LinkedIn', budget: 8000, startDate: days(-50), endDate: days(-5), status: 'PAUSED', clientId: techpulse.id },
    { name: 'Google Ads Café Lumière', platform: 'Google Ads', budget: 2000, startDate: days(-70), endDate: days(-15), status: 'COMPLETED', clientId: cafe.id },
    { name: 'TikTok Boréal Outdoors', platform: 'TikTok', budget: 5500, startDate: days(-10), endDate: days(50), status: 'ACTIVE', clientId: boreal.id }
  ];
  const campaigns = [];
  for (const c of campaignSeed) {
    campaigns.push(await prisma.campaign.create({ data: c }));
  }
  const [cNova, cAtlas, cVert, cTech, cCafe, cBoreal] = campaigns;

  // Fictional tasks with varied status/priority/deadlines (some intentionally overdue).
  const taskSeed = [
    { title: 'Rédiger les visuels du lancement', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: days(-2), assignedToId: sarah.id, campaignId: cNova.id },
    { title: 'Configurer le pixel Meta', status: 'COMPLETED', priority: 'MEDIUM', dueDate: days(-5), assignedToId: marc.id, campaignId: cNova.id },
    { title: 'Audit SEO technique', status: 'TODO', priority: 'HIGH', dueDate: days(3), assignedToId: amina.id, campaignId: cAtlas.id },
    { title: 'Rédaction article de blog', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: days(7), assignedToId: sarah.id, campaignId: cAtlas.id },
    { title: 'Maquette de la newsletter', status: 'TODO', priority: 'LOW', dueDate: days(10), assignedToId: marc.id, campaignId: cVert.id },
    { title: 'Rapport de performance LinkedIn', status: 'TODO', priority: 'MEDIUM', dueDate: days(-1), assignedToId: amina.id, campaignId: cTech.id },
    { title: 'Brief créatif TikTok', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: days(5), assignedToId: sarah.id, campaignId: cBoreal.id },
    { title: 'Analyse des conversions', status: 'COMPLETED', priority: 'MEDIUM', dueDate: days(-8), assignedToId: marc.id, campaignId: cCafe.id },
    { title: 'Mise à jour du budget client', status: 'TODO', priority: 'LOW', dueDate: days(14), assignedToId: amina.id, campaignId: cTech.id },
    { title: 'Réunion de cadrage Atlas', status: 'COMPLETED', priority: 'HIGH', dueDate: days(-3), assignedToId: sarah.id, campaignId: cAtlas.id }
  ];
  for (const t of taskSeed) {
    await prisma.task.create({ data: t });
  }

  const summary = {
    employees: employees.length,
    clients: clients.length,
    campaigns: campaigns.length,
    tasks: taskSeed.length
  };
  console.log('Demo data created:', JSON.stringify(summary));
}

main()
  .catch((e) => {
    console.error('Demo seed failed:', e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
