/*
  Warnings:

  - You are about to drop the column `livroId` on the `Emprestimo` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `Livro` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Livro` table. All the data in the column will be lost.
  - Added the required column `exemplarId` to the `Emprestimo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exemplarId` to the `HistoricoLeitura` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Exemplar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigoBarras" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "observacoes" TEXT,
    "livroId" INTEGER NOT NULL,
    CONSTRAINT "Exemplar_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Emprestimo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataEmprestimo" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPrevista" DATETIME NOT NULL,
    "dataDevolucao" DATETIME,
    "renovacoes" INTEGER NOT NULL DEFAULT 0,
    "quantidadeEmprestimo" INTEGER NOT NULL DEFAULT 0,
    "membroId" INTEGER NOT NULL,
    "exemplarId" INTEGER NOT NULL,
    CONSTRAINT "Emprestimo_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "Membro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Emprestimo_exemplarId_fkey" FOREIGN KEY ("exemplarId") REFERENCES "Exemplar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Emprestimo" ("dataDevolucao", "dataEmprestimo", "dataPrevista", "id", "membroId", "quantidadeEmprestimo", "renovacoes") SELECT "dataDevolucao", "dataEmprestimo", "dataPrevista", "id", "membroId", "quantidadeEmprestimo", "renovacoes" FROM "Emprestimo";
DROP TABLE "Emprestimo";
ALTER TABLE "new_Emprestimo" RENAME TO "Emprestimo";
CREATE TABLE "new_HistoricoLeitura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membroId" INTEGER NOT NULL,
    "livroId" INTEGER NOT NULL,
    "exemplarId" INTEGER NOT NULL,
    CONSTRAINT "HistoricoLeitura_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "Membro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoricoLeitura_exemplarId_fkey" FOREIGN KEY ("exemplarId") REFERENCES "Exemplar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HistoricoLeitura" ("data", "id", "livroId", "membroId") SELECT "data", "id", "livroId", "membroId" FROM "HistoricoLeitura";
DROP TABLE "HistoricoLeitura";
ALTER TABLE "new_HistoricoLeitura" RENAME TO "HistoricoLeitura";
CREATE TABLE "new_Livro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "isbn" TEXT,
    "editora" TEXT,
    "etiqueta" TEXT NOT NULL DEFAULT 'BRANCO',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "autorId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    CONSTRAINT "Livro_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Autor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Livro_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Livro" ("autorId", "categoriaId", "criadoEm", "editora", "etiqueta", "id", "isbn", "titulo") SELECT "autorId", "categoriaId", "criadoEm", "editora", "etiqueta", "id", "isbn", "titulo" FROM "Livro";
DROP TABLE "Livro";
ALTER TABLE "new_Livro" RENAME TO "Livro";
CREATE UNIQUE INDEX "Livro_isbn_key" ON "Livro"("isbn");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Exemplar_codigoBarras_key" ON "Exemplar"("codigoBarras");
