-- CreateIndex
CREATE INDEX `AIReport_workId_idx` ON `AIReport`(`workId`);

-- CreateIndex
CREATE INDEX `AIReport_createdAt_idx` ON `AIReport`(`createdAt`);

-- CreateIndex
CREATE INDEX `PlagiarismReport_workId_idx` ON `PlagiarismReport`(`workId`);

-- CreateIndex
CREATE INDEX `PlagiarismReport_createdAt_idx` ON `PlagiarismReport`(`createdAt`);
