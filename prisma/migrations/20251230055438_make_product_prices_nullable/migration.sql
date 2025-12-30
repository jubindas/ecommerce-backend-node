-- AlterTable
ALTER TABLE `product` MODIFY `buyingPrice` DOUBLE NULL,
    MODIFY `maximumRetailPrice` DOUBLE NULL,
    MODIFY `sellingPrice` DOUBLE NULL;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
