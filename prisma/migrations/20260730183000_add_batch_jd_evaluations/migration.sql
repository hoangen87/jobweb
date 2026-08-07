-- Thư viện JD có quản lý phòng ban và phiên bản.
CREATE TABLE "JobDescription" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobDescription_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Application" ADD COLUMN "aiJobDescriptionId" TEXT;

CREATE TABLE "ApplicationEvaluation" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "jobDescriptionId" TEXT NOT NULL,
    "jdVersion" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "matchingExperience" TEXT NOT NULL,
    "matchingSkills" TEXT NOT NULL,
    "gaps" TEXT NOT NULL,
    "aiComment" TEXT NOT NULL,
    "rank" INTEGER,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationEvaluation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ApplicationEvaluation_applicationId_jobDescriptionId_key"
ON "ApplicationEvaluation"("applicationId", "jobDescriptionId");

CREATE INDEX "ApplicationEvaluation_jobDescriptionId_score_idx"
ON "ApplicationEvaluation"("jobDescriptionId", "score");

ALTER TABLE "Application"
ADD CONSTRAINT "Application_aiJobDescriptionId_fkey"
FOREIGN KEY ("aiJobDescriptionId") REFERENCES "JobDescription"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ApplicationEvaluation"
ADD CONSTRAINT "ApplicationEvaluation_applicationId_fkey"
FOREIGN KEY ("applicationId") REFERENCES "Application"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ApplicationEvaluation"
ADD CONSTRAINT "ApplicationEvaluation_jobDescriptionId_fkey"
FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
