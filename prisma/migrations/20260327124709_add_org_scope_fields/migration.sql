-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "scope1_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "scope2_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "scope3_categories" TEXT,
ADD COLUMN     "scope3_enabled" BOOLEAN NOT NULL DEFAULT true;
