-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rawData" JSONB,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT,
    "logo_url" TEXT,
    "rawData" JSONB,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "createdByUser" TEXT NOT NULL,
    "spendLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationToUser" (
    "id" SERIAL NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationToUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stripe" (
    "id" SERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "subscription" JSONB,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stripe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretKey" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "key" TEXT NOT NULL,
    "rateLimitPerSecond" INTEGER NOT NULL DEFAULT 10,
    "createdBy" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecretKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKey" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "UserKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" SERIAL NOT NULL,
    "shortId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT NOT NULL,
    "modelSettings" JSONB,
    "template" TEXT NOT NULL,
    "instruction" TEXT,
    "inputs" JSONB NOT NULL,
    "cacheControlTtl" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowBranch" (
    "id" SERIAL NOT NULL,
    "shortId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "modelSettings" JSONB,
    "template" TEXT NOT NULL,
    "instruction" TEXT,
    "workflowId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',

    CONSTRAINT "WorkflowBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTest" (
    "id" SERIAL NOT NULL,
    "input" JSONB NOT NULL,
    "output" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "workflowRunId" INTEGER,

    CONSTRAINT "WorkflowTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" SERIAL NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "rawRequest" JSONB,
    "rawResult" JSONB,
    "totalTokenCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "branchId" TEXT,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatBot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "modelSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contextItems" JSONB NOT NULL,

    CONSTRAINT "ChatBot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatBotUserSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "ChatBotUserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkey" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "publicKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3),

    CONSTRAINT "passkey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Stripe_customerId_key" ON "Stripe"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Stripe_subscriptionId_key" ON "Stripe"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Stripe_ownerId_key" ON "Stripe"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "SecretKey_key_key" ON "SecretKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_shortId_key" ON "Workflow"("shortId");

-- CreateIndex
CREATE INDEX "Workflow_ownerId_idx" ON "Workflow"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowBranch_shortId_workflowId_key" ON "WorkflowBranch"("shortId", "workflowId");

-- CreateIndex
CREATE INDEX "ChatBotUserSession_chatbotId_sessionId_idx" ON "ChatBotUserSession"("chatbotId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatBotUserSession_chatbotId_sessionId_key" ON "ChatBotUserSession"("chatbotId", "sessionId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdByUser_fkey" FOREIGN KEY ("createdByUser") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationToUser" ADD CONSTRAINT "OrganizationToUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationToUser" ADD CONSTRAINT "OrganizationToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stripe" ADD CONSTRAINT "Stripe_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretKey" ADD CONSTRAINT "SecretKey_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretKey" ADD CONSTRAINT "SecretKey_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKey" ADD CONSTRAINT "UserKey_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowBranch" ADD CONSTRAINT "WorkflowBranch_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTest" ADD CONSTRAINT "WorkflowTest_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTest" ADD CONSTRAINT "WorkflowTest_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBot" ADD CONSTRAINT "ChatBot_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBot" ADD CONSTRAINT "ChatBot_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBotUserSession" ADD CONSTRAINT "ChatBotUserSession_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "ChatBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

