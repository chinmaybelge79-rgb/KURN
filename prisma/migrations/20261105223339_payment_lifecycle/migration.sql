-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "GymMembership" ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING';
