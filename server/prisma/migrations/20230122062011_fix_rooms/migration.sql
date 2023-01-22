/*
  Warnings:

  - You are about to drop the column `userID` on the `Room` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[creatorId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_userID_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "userID",
ADD COLUMN     "creatorId" TEXT NOT NULL,
ADD COLUMN     "joinedUsersId" TEXT[];

-- CreateTable
CREATE TABLE "_joinedRooms" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_joinedRooms_AB_unique" ON "_joinedRooms"("A", "B");

-- CreateIndex
CREATE INDEX "_joinedRooms_B_index" ON "_joinedRooms"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Room_creatorId_key" ON "Room"("creatorId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_joinedRooms" ADD CONSTRAINT "_joinedRooms_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_joinedRooms" ADD CONSTRAINT "_joinedRooms_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
