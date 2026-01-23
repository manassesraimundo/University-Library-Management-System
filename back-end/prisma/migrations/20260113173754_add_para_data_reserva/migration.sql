/*
  Warnings:

  - Added the required column `paraData` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reserva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "posicao" INTEGER NOT NULL,
    "paraData" DATETIME NOT NULL,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membroId" INTEGER NOT NULL,
    "livroId" INTEGER NOT NULL,
    CONSTRAINT "Reserva_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "Membro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reserva" ("ativa", "criadaEm", "id", "livroId", "membroId", "posicao") SELECT "ativa", "criadaEm", "id", "livroId", "membroId", "posicao" FROM "Reserva";
DROP TABLE "Reserva";
ALTER TABLE "new_Reserva" RENAME TO "Reserva";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
