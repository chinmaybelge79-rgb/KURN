import { PrismaClient, UserRole, VerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { phone: '+919000000099' },
    update: { role: UserRole.ADMIN, fullName: 'KURN Platform Admin' },
    create: { phone: '+919000000099', fullName: 'KURN Platform Admin', role: UserRole.ADMIN },
  });
  const owner = await prisma.user.upsert({
    where: { phone: '+919000000001' },
    update: {},
    create: { phone: '+919000000001', fullName: 'KURN Demo Owner', role: UserRole.GYM_OWNER, city: 'Bengaluru', state: 'Karnataka' },
  });
  const gymOwner = await prisma.gymOwner.upsert({ where: { userId: owner.id }, update: {}, create: { userId: owner.id } });
  const gym = await prisma.gym.upsert({
    where: { id: '11111111-1111-4111-8111-111111111111' },
    update: { verificationStatus: VerificationStatus.VERIFIED, verified: true },
    create: {
      id: '11111111-1111-4111-8111-111111111111', ownerId: gymOwner.id, name: 'Forge Fitness Koramangala',
      description: 'Strength, conditioning and recovery in a welcoming neighbourhood gym.', address: '80 Feet Road, Koramangala',
      city: 'Bengaluru', state: 'Karnataka', locality: 'Koramangala', pinCode: '560034', latitude: 12.9352, longitude: 77.6245,
      rating: 4.7, verified: true, verificationStatus: VerificationStatus.VERIFIED,
    },
  });
  await prisma.gymMembershipPlan.upsert({ where: { id: '22222222-2222-4222-8222-222222222222' }, update: {}, create: { id: '22222222-2222-4222-8222-222222222222', gymId: gym.id, name: 'Monthly', durationDays: 30, pricePaise: 150000, description: 'Full gym access for 30 days.' } });
  const secondGym = await prisma.gym.upsert({
    where: { id: '44444444-4444-4444-8444-444444444444' },
    update: { verificationStatus: VerificationStatus.VERIFIED, verified: true },
    create: {
      id: '44444444-4444-4444-8444-444444444444', ownerId: gymOwner.id, name: 'Northstar Strength Indiranagar',
      description: 'A focused strength studio with small-group coaching, mobility and recovery.', address: '12 100 Feet Road, Indiranagar',
      city: 'Bengaluru', state: 'Karnataka', locality: 'Indiranagar', pinCode: '560038', latitude: 12.9784, longitude: 77.6408,
      rating: 4.5, verified: true, verificationStatus: VerificationStatus.VERIFIED,
    },
  });
  await prisma.gymMembershipPlan.upsert({ where: { id: '55555555-5555-4555-8555-555555555555' }, update: {}, create: { id: '55555555-5555-4555-8555-555555555555', gymId: secondGym.id, name: 'Small-group monthly', durationDays: 30, pricePaise: 220000, description: 'Coached small-group sessions and open gym access.' } });

  const trainerUser = await prisma.user.upsert({
    where: { phone: '+919000000002' },
    update: {},
    create: { phone: '+919000000002', fullName: 'Aarav Mehta', role: UserRole.TRAINER, city: 'Bengaluru', state: 'Karnataka' },
  });
  await prisma.trainer.upsert({
    where: { userId: trainerUser.id },
    update: { verificationStatus: VerificationStatus.VERIFIED, verified: true },
    create: {
      id: '33333333-3333-4333-8333-333333333333', userId: trainerUser.id, bio: 'Evidence-led strength coach helping busy professionals train with confidence.',
      experienceYears: 8, specialisations: ['Strength', 'Fat loss', 'Mobility'], qualifications: ['ACE Certified Personal Trainer'],
      serviceCity: 'Bengaluru', serviceState: 'Karnataka', hourlyRatePaise: 120000, rating: 4.9, verified: true, verificationStatus: VerificationStatus.VERIFIED,
    },
  });
  console.log('KURN database seed complete', { gymId: gym.id, trainerUserId: trainerUser.id });
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
