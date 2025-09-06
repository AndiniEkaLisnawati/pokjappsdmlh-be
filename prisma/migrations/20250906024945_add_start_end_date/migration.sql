/*
  Warnings:

  - You are about to drop the column `completionDate` on the `CompletedTraining` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Training` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `CompletedTraining` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `CompletedTraining` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Training` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Training` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CompletedTraining" DROP COLUMN "completionDate",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Training" DROP COLUMN "date",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
