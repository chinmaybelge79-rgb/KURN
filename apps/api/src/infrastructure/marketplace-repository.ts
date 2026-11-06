import { Prisma, type PrismaClient } from '@prisma/client';

export type GymSearch = { q?: string; city?: string; locality?: string; pinCode?: string; minPricePaise?: number; maxPricePaise?: number; latitude?: number; longitude?: number; radiusKm?: number; page?: number; limit?: number };
export type GymInput = { name: string; description?: string | undefined; address: string; city: string; state: string; locality?: string | undefined; pinCode?: string | undefined; latitude: number; longitude: number };
export type TrainerProfileInput = { bio?: string | undefined; experienceYears?: number | undefined; specialisations?: string[] | undefined; qualifications?: string[] | undefined; serviceCity?: string | undefined; serviceState?: string | undefined; hourlyRatePaise?: number | undefined };

const withoutUndefined = (input: Record<string, unknown>) => Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));

export class MarketplaceRepository {
  constructor(private readonly db: PrismaClient) {}

  async updateUser(userId: string, input: { fullName: string; role: 'CONSUMER' | 'GYM_OWNER' | 'TRAINER'; city: string; state: string; email?: string | undefined; locality?: string | undefined; pinCode?: string | undefined; dateOfBirth?: string | undefined }) {
    return this.db.user.update({ where: { id: userId }, data: { fullName: input.fullName, role: input.role, city: input.city, state: input.state, ...(input.email !== undefined ? { email: input.email || null } : {}), ...(input.locality !== undefined ? { locality: input.locality || null } : {}), ...(input.pinCode !== undefined ? { pinCode: input.pinCode || null } : {}), ...(input.dateOfBirth ? { dateOfBirth: new Date(input.dateOfBirth) } : {}) } });
  }

  async createGym(ownerUserId: string, input: GymInput) {
    const owner = await this.db.gymOwner.upsert({ where: { userId: ownerUserId }, update: {}, create: { userId: ownerUserId } });
    return this.db.gym.create({ data: { ...withoutUndefined(input), ownerId: owner.id, verificationStatus: 'PENDING' } as Prisma.GymUncheckedCreateInput });
  }

  async updateGym(ownerUserId: string, gymId: string, input: Record<string, unknown>) {
    const gym = await this.db.gym.findFirst({ where: { id: gymId, owner: { userId: ownerUserId } } });
    if (!gym) throw new Error('FORBIDDEN');
    return this.db.gym.update({ where: { id: gymId }, data: withoutUndefined(input) as Prisma.GymUpdateInput });
  }

  async listOwnerGyms(ownerUserId: string) {
    return this.db.gym.findMany({ where: { owner: { userId: ownerUserId } }, include: { plans: { orderBy: { name: 'asc' } } }, orderBy: { createdAt: 'asc' } });
  }

  async createPlan(ownerUserId: string, gymId: string, input: { name: string; durationDays: number; pricePaise: number; description?: string | undefined }) {
    const gym = await this.db.gym.findFirst({ where: { id: gymId, owner: { userId: ownerUserId } } });
    if (!gym) throw new Error('FORBIDDEN');
    return this.db.gymMembershipPlan.create({ data: { gymId, ...withoutUndefined(input) } as Prisma.GymMembershipPlanUncheckedCreateInput });
  }

  async updatePlan(ownerUserId: string, gymId: string, planId: string, input: Partial<{ name: string | undefined; durationDays: number | undefined; pricePaise: number | undefined; description: string | undefined; active: boolean | undefined }>) {
    const plan = await this.db.gymMembershipPlan.findFirst({ where: { id: planId, gymId, gym: { owner: { userId: ownerUserId } } } });
    if (!plan) throw new Error('FORBIDDEN');
    return this.db.gymMembershipPlan.update({ where: { id: planId }, data: withoutUndefined(input) as Prisma.GymMembershipPlanUpdateInput });
  }

  async listOwnerEnquiries(ownerUserId: string) {
    return this.db.enquiry.findMany({ where: { gym: { owner: { userId: ownerUserId } } }, include: { gym: { select: { id: true, name: true } }, user: { select: { id: true, fullName: true, phone: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async listOwnerMemberships(ownerUserId: string) {
    return this.db.gymMembership.findMany({ where: { gym: { owner: { userId: ownerUserId } } }, include: { user: { select: { id: true, fullName: true, phone: true } }, gym: { select: { id: true, name: true } }, plan: { select: { name: true, durationDays: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async updateEnquiry(ownerUserId: string, enquiryId: string, status: 'NEW' | 'CONTACTED' | 'VISIT_SCHEDULED' | 'CONVERTED' | 'CLOSED') {
    const enquiry = await this.db.enquiry.findFirst({ where: { id: enquiryId, gym: { owner: { userId: ownerUserId } } } });
    if (!enquiry) throw new Error('FORBIDDEN');
    return this.db.enquiry.update({ where: { id: enquiryId }, data: { status } });
  }

  async updateTrainerProfile(userId: string, input: TrainerProfileInput) {
    const trainer = await this.db.trainer.findUnique({ where: { userId } });
    if (!trainer) throw new Error('NOT_FOUND');
    return this.db.trainer.update({ where: { userId }, data: withoutUndefined(input) as Prisma.TrainerUpdateInput });
  }

  async getTrainerByUserId(userId: string) {
    return this.db.trainer.findUnique({ where: { userId }, include: { user: { select: { fullName: true, phone: true, city: true, state: true } }, availability: { orderBy: { startsAt: 'asc' } } } });
  }

  async listTrainerConnections(userId: string) {
    return this.db.connection.findMany({ where: { receiverId: userId, status: { in: ['PENDING', 'ACCEPTED'] } }, include: { sender: { select: { id: true, fullName: true, phone: true, city: true, state: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async listConnections(userId: string) {
    return this.db.connection.findMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] }, include: { sender: { select: { id: true, fullName: true } }, receiver: { select: { id: true, fullName: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async listGyms(search: GymSearch = {}) {
    const hasNearby = search.latitude !== undefined && search.longitude !== undefined;
    const nearby = hasNearby
      ? await this.db.$queryRaw<Array<{ id: string; distance_km: number }>>(Prisma.sql`SELECT id, ST_Distance(ST_SetSRID(ST_MakePoint(CAST(longitude AS double precision), CAST(latitude AS double precision)), 4326)::geography, ST_SetSRID(ST_MakePoint(${search.longitude}, ${search.latitude}), 4326)::geography) / 1000.0 AS distance_km FROM "Gym" WHERE ST_DWithin(ST_SetSRID(ST_MakePoint(CAST(longitude AS double precision), CAST(latitude AS double precision)), 4326)::geography, ST_SetSRID(ST_MakePoint(${search.longitude}, ${search.latitude}), 4326)::geography, ${(search.radiusKm ?? 50) * 1000})`)
      : [];
    const gyms = await this.db.gym.findMany({
      where: { ...(hasNearby ? { id: { in: nearby.map((item) => item.id) } } : {}), ...(search.city ? { city: { equals: search.city, mode: 'insensitive' as const } } : {}), ...(search.locality ? { locality: { contains: search.locality, mode: 'insensitive' as const } } : {}), ...(search.pinCode ? { pinCode: search.pinCode } : {}), ...(search.q ? { OR: [{ name: { contains: search.q, mode: 'insensitive' as const } }, { description: { contains: search.q, mode: 'insensitive' as const } }, { address: { contains: search.q, mode: 'insensitive' as const } }] } : {}) },
      include: { plans: { where: { active: true }, orderBy: { pricePaise: 'asc' }, take: 1 } },
      orderBy: { rating: 'desc' },
      skip: ((search.page ?? 1) - 1) * (search.limit ?? 20),
      take: search.limit ?? 20,
    });
    return gyms.filter((gym) => {
      const price = gym.plans[0]?.pricePaise ?? 0;
      return price >= (search.minPricePaise ?? 0) && price <= (search.maxPricePaise ?? Number.MAX_SAFE_INTEGER);
    }).map((gym) => ({ ...gym, rating: Number(gym.rating ?? 0), startingPricePaise: gym.plans[0]?.pricePaise ?? null, ...(hasNearby ? { distanceKm: nearby.find((item) => item.id === gym.id)?.distance_km } : {}), plans: undefined }));
  }

  async getGym(id: string) {
    return this.db.gym.findUnique({ where: { id }, include: { plans: { where: { active: true }, orderBy: { pricePaise: 'asc' } } } });
  }

  async listTrainers(search: { q?: string; city?: string; specialisation?: string; page?: number; limit?: number } = {}) {
    const trainers = await this.db.trainer.findMany({ include: { user: true }, where: search.city ? { serviceCity: { equals: search.city, mode: 'insensitive' } } : {}, orderBy: { rating: 'desc' }, skip: ((search.page ?? 1) - 1) * (search.limit ?? 20), take: search.limit ?? 20 });
    return trainers.filter((trainer) => {
      const haystack = [trainer.user.fullName, trainer.bio ?? '', ...trainer.specialisations].join(' ').toLowerCase();
      return (!search.q || haystack.includes(search.q.toLowerCase())) && (!search.specialisation || trainer.specialisations.some((item) => item.toLowerCase().includes(search.specialisation!.toLowerCase())));
    }).map((trainer) => ({ ...trainer, rating: Number(trainer.rating ?? 0), name: trainer.user.fullName, user: undefined }));
  }

  async getTrainer(id: string) {
    return this.db.trainer.findUnique({ where: { id }, include: { user: true, availability: { orderBy: { startsAt: 'asc' } } } });
  }

  async createEnquiry(userId: string, gymId: string, message: string, preferredVisitAt?: string) {
    return this.db.enquiry.create({ data: { userId, gymId, message, ...(preferredVisitAt ? { preferredVisitAt: new Date(preferredVisitAt) } : {}) } });
  }

  async createConnection(senderId: string, receiverId: string, message: string) {
    return this.db.connection.create({ data: { senderId, receiverId, status: 'PENDING' } });
  }

  async createMembershipOrder(userId: string, planId: string, idempotencyKey: string, providerOrderId?: string, paymentId?: string) {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({ where: { idempotencyKey } });
      if (existing) return { existing: true, payment: existing };
      const plan = await tx.gymMembershipPlan.findUnique({ where: { id: planId } });
      if (!plan || !plan.active) throw new Error('MEMBERSHIP_PLAN_NOT_FOUND');
      const payment = await tx.payment.create({ data: { ...(paymentId ? { id: paymentId } : {}), userId, amountPaise: plan.pricePaise, platformFeePaise: Math.round(plan.pricePaise * 0.05), provider: process.env.PAYMENT_PROVIDER ?? 'unconfigured', ...(providerOrderId ? { providerOrderId } : {}), idempotencyKey, status: 'CREATED' } });
      const startsAt = new Date();
      const expiresAt = new Date(startsAt.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
      const membership = await tx.gymMembership.create({ data: { userId, gymId: plan.gymId, planId: plan.id, startsAt, expiresAt, paymentId: payment.id, status: 'PENDING' } });
      return { existing: false, payment, membership };
    });
  }

  async listMemberships(userId: string) {
    return this.db.gymMembership.findMany({ where: { userId }, include: { gym: { select: { id: true, name: true } }, plan: true }, orderBy: { createdAt: 'desc' } });
  }

  async listBookings(userId: string) {
    return this.db.booking.findMany({ where: { userId }, include: { trainer: { include: { user: { select: { fullName: true } } } } }, orderBy: { startsAt: 'asc' } });
  }

  async createBooking(userId: string, trainerId: string, startsAt: string, endsAt: string, amountPaise: number) {
    return this.db.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({ where: { trainerId, status: { not: 'CANCELLED' }, startsAt: { lt: new Date(endsAt) }, endsAt: { gt: new Date(startsAt) } } });
      if (conflict) throw new Error('SLOT_UNAVAILABLE');
      return tx.booking.create({ data: { userId, trainerId, startsAt: new Date(startsAt), endsAt: new Date(endsAt), amountPaise } });
    });
  }

  async listConversations(userId: string) {
    return this.db.conversation.findMany({ where: { members: { some: { userId } } }, include: { members: { include: { user: { select: { id: true, fullName: true, role: true } } } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { createdAt: 'desc' } });
  }

  async createConversation(userId: string, otherUserId: string) {
    return this.db.conversation.create({ data: { members: { create: [{ userId }, { userId: otherUserId }] } }, include: { members: true } });
  }

  async listMessages(conversationId: string, userId: string) {
    const member = await this.db.conversationMember.findUnique({ where: { conversationId_userId: { conversationId, userId } } });
    if (!member) throw new Error('FORBIDDEN');
    return this.db.message.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } });
  }

  async sendMessage(conversationId: string, senderId: string, body: string) {
    const member = await this.db.conversationMember.findUnique({ where: { conversationId_userId: { conversationId, userId: senderId } } });
    if (!member) throw new Error('FORBIDDEN');
    return this.db.message.create({ data: { conversationId, senderId, body } });
  }

  async setAvailability(trainerId: string, startsAt: string, endsAt: string, capacity: number) {
    return this.db.trainerAvailability.create({ data: { trainerId, startsAt: new Date(startsAt), endsAt: new Date(endsAt), capacity } });
  }

  async listAvailability(trainerId: string) {
    return this.db.trainerAvailability.findMany({ where: { trainerId, startsAt: { gte: new Date() } }, orderBy: { startsAt: 'asc' } });
  }

  async checkIn(userId: string, gymId: string, source: string, tokenHash?: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const existing = await this.db.attendance.findFirst({ where: { userId, gymId, checkedAt: { gte: startOfDay } } });
    if (existing) return { existing: true, attendance: existing };
    const membership = await this.db.gymMembership.findFirst({ where: { userId, gymId, startsAt: { lte: new Date() }, expiresAt: { gt: new Date() } } });
    if (!membership) throw new Error('ACTIVE_MEMBERSHIP_REQUIRED');
    const attendance = await this.db.attendance.create({ data: { userId, gymId, membershipId: membership.id, source, ...(tokenHash ? { tokenHash } : {}) } });
    return { existing: false, attendance };
  }

  async listAttendance(userId: string) {
    return this.db.attendance.findMany({ where: { userId }, include: { gym: { select: { id: true, name: true } } }, orderBy: { checkedAt: 'desc' } });
  }

  async getActivitySummary(userId: string) {
    const [attendance, rewards] = await Promise.all([
      this.db.attendance.findMany({ where: { userId }, select: { checkedAt: true }, orderBy: { checkedAt: 'desc' } }),
      this.db.userReward.findMany({ where: { userId }, include: { reward: true }, orderBy: { createdAt: 'desc' } }),
    ]);
    const days = [...new Set(attendance.map((item) => item.checkedAt.toISOString().slice(0, 10)))];
    const sortedDays = [...days].sort();
    let longestStreak = 0; let run = 0; let previous: number | null = null;
    for (const day of sortedDays) { const value = Date.parse(`${day}T00:00:00.000Z`); run = previous !== null && value - previous === 86_400_000 ? run + 1 : 1; longestStreak = Math.max(longestStreak, run); previous = value; }
    const daySet = new Set(days);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const current = new Date(today);
    if (!daySet.has(current.toISOString().slice(0, 10))) current.setDate(current.getDate() - 1);
    let currentStreak = 0;
    while (daySet.has(current.toISOString().slice(0, 10))) { currentStreak += 1; current.setDate(current.getDate() - 1); }
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return { weeklyVerifiedSessions: attendance.filter((item) => item.checkedAt >= weekStart).length, monthlyVerifiedSessions: attendance.filter((item) => item.checkedAt >= monthStart).length, currentStreak, longestStreak, totalVerifiedSessions: attendance.length, rewards };
  }

  async listNotifications(userId: string) {
    return this.db.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async markNotificationRead(userId: string, id: string) {
    const notification = await this.db.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new Error('NOT_FOUND');
    return this.db.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  async submitVerification(subjectType: string, subjectId: string, documents: unknown) {
    return this.db.verification.create({ data: { subjectType, subjectId, documents: documents as object } });
  }

  async listVerifications() {
    return this.db.verification.findMany({ orderBy: { submittedAt: 'asc' } });
  }

  async decideVerification(id: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED', reviewerId: string, reason?: string) {
    return this.db.$transaction(async (tx) => {
      const verification = await tx.verification.update({ where: { id }, data: { status, reviewerId, ...(reason ? { reviewReason: reason } : {}), reviewedAt: new Date() } });
      if (verification.subjectType === 'TRAINER') await tx.trainer.update({ where: { id: verification.subjectId }, data: { verified: status === 'VERIFIED', verificationStatus: status } });
      if (verification.subjectType === 'GYM') await tx.gym.update({ where: { id: verification.subjectId }, data: { verified: status === 'VERIFIED', verificationStatus: status } });
      return verification;
    });
  }

  async applyPaymentWebhook(paymentId: string, status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED', providerOrderId?: string) {
    return this.db.$transaction(async (tx) => {
      const payment = await tx.payment.update({ where: { id: paymentId }, data: { status, ...(providerOrderId ? { providerOrderId } : {}) } });
      if (status === 'SUCCEEDED') await tx.gymMembership.updateMany({ where: { paymentId: payment.id }, data: { status: 'ACTIVE' } });
      if (status === 'REFUNDED' || status === 'FAILED') await tx.gymMembership.updateMany({ where: { paymentId: payment.id }, data: { status: 'CANCELLED' } });
      return payment;
    });
  }
}
