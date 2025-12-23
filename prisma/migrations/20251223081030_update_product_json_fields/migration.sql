/*
  Warnings:

  - You are about to alter the column `dimensions` on the `product` table. The data in that column could be lost. The data in that column will be cast from `LongText` to `Json`.
  - You are about to alter the column `metaData` on the `product` table. The data in that column could be lost. The data in that column will be cast from `LongText` to `Json`.

*/
-- AlterTable
ALTER TABLE `product` MODIFY `dimensions` JSON NULL,
    MODIFY `metaData` JSON NULL;
