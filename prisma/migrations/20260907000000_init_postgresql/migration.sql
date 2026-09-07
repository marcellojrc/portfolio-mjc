-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "name" TEXT NOT NULL, "role" TEXT NOT NULL DEFAULT 'ADMIN', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Project" ("id" TEXT NOT NULL, "slug" TEXT NOT NULL, "number" TEXT NOT NULL, "title" TEXT NOT NULL, "category" TEXT NOT NULL, "location" TEXT NOT NULL, "year" TEXT NOT NULL DEFAULT '2026', "status" TEXT NOT NULL DEFAULT 'Concluído', "description" TEXT NOT NULL, "area" TEXT, "role" TEXT, "software" TEXT, "services" TEXT, "concept" TEXT, "technicalDetails" TEXT, "coverImage" TEXT NOT NULL, "featured" BOOLEAN NOT NULL DEFAULT false, "published" BOOLEAN NOT NULL DEFAULT true, "order" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "publishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Project_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ProjectMedia" ("id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "url" TEXT NOT NULL, "type" TEXT NOT NULL DEFAULT 'IMAGE', "alt" TEXT NOT NULL, "caption" TEXT, "order" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Experience" ("id" TEXT NOT NULL, "period" TEXT NOT NULL, "role" TEXT NOT NULL, "organization" TEXT NOT NULL, "description" TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Experience_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Education" ("id" TEXT NOT NULL, "period" TEXT NOT NULL, "degree" TEXT NOT NULL, "institution" TEXT NOT NULL, "description" TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Education_pkey" PRIMARY KEY ("id"));
CREATE TABLE "Skill" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "level" TEXT NOT NULL, "category" TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "Skill_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ContactMessage" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "subject" TEXT, "message" TEXT NOT NULL, "read" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ActivityLog" ("id" TEXT NOT NULL, "userId" TEXT, "action" TEXT NOT NULL, "details" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id"));
CREATE TABLE "SiteSettings" ("id" TEXT NOT NULL, "key" TEXT NOT NULL, "value" TEXT NOT NULL, CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id"));

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE UNIQUE INDEX "SiteSettings_key_key" ON "SiteSettings"("key");

-- AddForeignKey
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
