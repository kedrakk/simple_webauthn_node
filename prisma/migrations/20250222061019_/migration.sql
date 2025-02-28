/*
  Warnings:

  - You are about to drop the `PassKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PassKey";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "passkeys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "public_key" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "webauthnUser_id" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "device_type" TEXT NOT NULL,
    "back_up" BOOLEAN NOT NULL,
    "devices" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
