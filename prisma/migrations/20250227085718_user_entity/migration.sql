/*
  Warnings:

  - You are about to alter the column `devices` on the `passkeys` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - Added the required column `devices` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_passkeys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "public_key" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "webauthnUser_id" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "device_type" TEXT NOT NULL,
    "back_up" BOOLEAN NOT NULL,
    "devices" JSONB NOT NULL
);
INSERT INTO "new_passkeys" ("back_up", "counter", "device_type", "devices", "id", "public_key", "user_id", "webauthnUser_id") SELECT "back_up", "counter", "device_type", "devices", "id", "public_key", "user_id", "webauthnUser_id" FROM "passkeys";
DROP TABLE "passkeys";
ALTER TABLE "new_passkeys" RENAME TO "passkeys";
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "devices" JSONB NOT NULL
);
INSERT INTO "new_users" ("email", "id", "name", "password") SELECT "email", "id", "name", "password" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
