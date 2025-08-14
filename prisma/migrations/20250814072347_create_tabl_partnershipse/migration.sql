-- CreateTable
CREATE TABLE "partnership" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "pksNumber" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "trainingsHeld" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partnership_pkey" PRIMARY KEY ("id")
);
