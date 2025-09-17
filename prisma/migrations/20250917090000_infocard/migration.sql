-- InfoCard community tables

-- CreateTable: PlaceFirstVisitVote
CREATE TABLE IF NOT EXISTS "public"."PlaceFirstVisitVote" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlaceFirstVisitVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DoctorRecommendation
CREATE TABLE IF NOT EXISTS "public"."DoctorRecommendation" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DoctorRecommendation_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "PlaceFirstVisitVote_placeId_userId_key" ON "public"."PlaceFirstVisitVote"("placeId", "userId");
CREATE INDEX IF NOT EXISTS "PlaceFirstVisitVote_placeId_idx" ON "public"."PlaceFirstVisitVote"("placeId");
CREATE INDEX IF NOT EXISTS "PlaceFirstVisitVote_userId_idx" ON "public"."PlaceFirstVisitVote"("userId");
CREATE INDEX IF NOT EXISTS "DoctorRecommendation_placeId_idx" ON "public"."DoctorRecommendation"("placeId");
CREATE INDEX IF NOT EXISTS "DoctorRecommendation_userId_idx" ON "public"."DoctorRecommendation"("userId");

-- FKs
ALTER TABLE "public"."PlaceFirstVisitVote"
  ADD CONSTRAINT IF NOT EXISTS "PlaceFirstVisitVote_placeId_fkey"
  FOREIGN KEY ("placeId") REFERENCES "public"."Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."PlaceFirstVisitVote"
  ADD CONSTRAINT IF NOT EXISTS "PlaceFirstVisitVote_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."DoctorRecommendation"
  ADD CONSTRAINT IF NOT EXISTS "DoctorRecommendation_placeId_fkey"
  FOREIGN KEY ("placeId") REFERENCES "public"."Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."DoctorRecommendation"
  ADD CONSTRAINT IF NOT EXISTS "DoctorRecommendation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
