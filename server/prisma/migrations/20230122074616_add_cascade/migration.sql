-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_roomID_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userID_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_creatorID_fkey";

-- DropForeignKey
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_roomID_fkey";

-- DropForeignKey
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_userID_fkey";

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_roomID_fkey" FOREIGN KEY ("roomID") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomUser" ADD CONSTRAINT "RoomUser_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_roomID_fkey" FOREIGN KEY ("roomID") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
