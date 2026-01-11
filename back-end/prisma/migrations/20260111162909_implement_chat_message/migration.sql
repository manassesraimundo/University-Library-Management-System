-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatMensagem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membroId" INTEGER NOT NULL,
    CONSTRAINT "ChatMensagem_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "Membro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ChatMensagem" ("content", "criadoEm", "id", "membroId", "role") SELECT "content", "criadoEm", "id", "membroId", "role" FROM "ChatMensagem";
DROP TABLE "ChatMensagem";
ALTER TABLE "new_ChatMensagem" RENAME TO "ChatMensagem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
