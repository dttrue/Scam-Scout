-- AlterTable
ALTER TABLE "User" ADD COLUMN     "addressScanCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AddressValidation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "address" TEXT NOT NULL,
    "domain" TEXT,
    "addressStatus" TEXT NOT NULL,
    "domainStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AddressValidation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AddressValidation" ADD CONSTRAINT "AddressValidation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
