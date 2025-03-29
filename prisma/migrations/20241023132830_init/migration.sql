-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `adminName` VARCHAR(191) NOT NULL,
    `walletAddress` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_walletAddress_key`(`walletAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
