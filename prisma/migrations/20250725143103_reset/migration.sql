/*
  Warnings:

  - You are about to drop the column `charCount` on the `FileAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `lines` on the `FileAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `wordCount` on the `FileAnalysis` table. All the data in the column will be lost.
  - Made the column `summary` on table `FileAnalysis` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FileAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FileAnalysis" ("filename", "id", "size", "summary", "type", "uploadedAt") SELECT "filename", "id", "size", "summary", "type", "uploadedAt" FROM "FileAnalysis";
DROP TABLE "FileAnalysis";
ALTER TABLE "new_FileAnalysis" RENAME TO "FileAnalysis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
