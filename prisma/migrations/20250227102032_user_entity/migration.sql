/*
  Warnings:

  - Added the required column `passkey_id` to the `passkeys` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_passkeys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "passkey_id" TEXT NOT NULL,
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
