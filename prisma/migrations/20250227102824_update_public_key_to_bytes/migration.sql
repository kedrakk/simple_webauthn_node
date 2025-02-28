/*
  Warnings:

  - You are about to alter the column `user_id` on the `passkeys` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_passkeys" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "passkey_id" TEXT NOT NULL,
    "public_key" BLOB NOT NULL,
    "user_id" INTEGER NOT NULL,
    "webauthnUser_id" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "device_type" TEXT NOT NULL,
    "back_up" BOOLEAN NOT NULL,
    "devices" JSONB NOT NULL
);
INSERT INTO "new_passkeys" ("back_up", "counter", "device_type", "devices", "id", "passkey_id", "public_key", "user_id", "webauthnUser_id") SELECT "back_up", "counter", "device_type", "devices", "id", "passkey_id", "public_key", "user_id", "webauthnUser_id" FROM "passkeys";
DROP TABLE "passkeys";
ALTER TABLE "new_passkeys" RENAME TO "passkeys";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
