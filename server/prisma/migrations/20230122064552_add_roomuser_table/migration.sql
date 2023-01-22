/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `joinedUsersId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `_joinedRooms` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creatorID` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "_joinedRooms" DROP CONSTRAINT "_joinedRooms_A_fkey";

-- DropForeignKey
ALTER TABLE "_joinedRooms" DROP CONSTRAINT "_joinedRooms_B_fkey";

-- DropIndex
DROP INDEX "Room_creatorId_key";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "creatorId",
DROP COLUMN "joinedUsersId",
ADD COLUMN     "creatorID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "_joinedRooms";

-- CreateTable
CREATE TABLE "RoomUser" (
    "id" TEXT NOT NULL,
    "roomID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_roomID_fkey" FOREIGN KEY ("roomID") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
