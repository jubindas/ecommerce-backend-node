-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `shortDesc` VARCHAR(191) NULL,
    `longDesc` VARCHAR(191) NULL,
    `mainImage` VARCHAR(191) NOT NULL,
    `productImages` LONGTEXT NULL,
    `youtubeLink` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `expiryDate` DATETIME(3) NULL,
    `buyingPrice` DOUBLE NOT NULL,
    `maximumRetailPrice` DOUBLE NOT NULL,
    `sellingPrice` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL,
    `paymentType` VARCHAR(191) NOT NULL,
    `dimensions` LONGTEXT NULL,
    `metaData` LONGTEXT NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isBestSelling` BOOLEAN NOT NULL DEFAULT false,
    `isNewCollection` BOOLEAN NOT NULL DEFAULT false,
    `isRelatedItem` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `masterCategoryId` VARCHAR(191) NOT NULL,
    `lastCategoryId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Product_masterCategoryId_idx`(`masterCategoryId`),
    INDEX `Product_lastCategoryId_idx`(`lastCategoryId`),
    INDEX `Product_isFeatured_idx`(`isFeatured`),
    INDEX `Product_isBestSelling_idx`(`isBestSelling`),
    INDEX `Product_isActive_idx`(`isActive`),
    INDEX `Product_productName_idx`(`productName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_masterCategoryId_fkey` FOREIGN KEY (`masterCategoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_lastCategoryId_fkey` FOREIGN KEY (`lastCategoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
