-- CreateTable
CREATE TABLE `PlagiarismReport` (
    `id` VARCHAR(191) NOT NULL,
    `workId` VARCHAR(191) NOT NULL,
    `similarityPercentage` DOUBLE NOT NULL,
    `sources` JSON NOT NULL,
    `reportUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIReport` (
    `id` VARCHAR(191) NOT NULL,
    `workId` VARCHAR(191) NOT NULL,
    `aiScore` DOUBLE NOT NULL,
    `summary` TEXT NULL,
    `qualityAssesment` TEXT NULL,
    `reccomendations` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
