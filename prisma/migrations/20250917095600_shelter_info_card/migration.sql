-- External-keyed tables for shelters InfoCard

CREATE TABLE IF NOT EXISTS "public"."ShelterAttributeVote" (
  "id" TEXT NOT NULL,
  "externalSource" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShelterAttributeVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ShelterAttributeVote_ext_user_key" ON "public"."ShelterAttributeVote"("externalSource","externalId","userId","key");
CREATE INDEX IF NOT EXISTS "ShelterAttributeVote_ext_idx" ON "public"."ShelterAttributeVote"("externalSource","externalId","key");

ALTER TABLE "public"."ShelterAttributeVote"
  ADD CONSTRAINT IF NOT EXISTS "ShelterAttributeVote_user_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "public"."ShelterDoctor" (
  "id" TEXT NOT NULL,
  "externalSource" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "title" TEXT,
  "avatarUrl" TEXT,
  "recCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShelterDoctor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ShelterDoctor_ext_name_key" ON "public"."ShelterDoctor"("externalSource","externalId","name");
CREATE INDEX IF NOT EXISTS "ShelterDoctor_ext_idx" ON "public"."ShelterDoctor"("externalSource","externalId");

CREATE TABLE IF NOT EXISTS "public"."ShelterDoctorRecommendation" (
  "id" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShelterDoctorRecommendation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."ShelterDoctorRecommendation"
  ADD CONSTRAINT IF NOT EXISTS "ShelterDoctorRecommendation_doctor_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."ShelterDoctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."ShelterDoctorRecommendation"
  ADD CONSTRAINT IF NOT EXISTS "ShelterDoctorRecommendation_user_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "ShelterDoctorRecommendation_doc_user_key" ON "public"."ShelterDoctorRecommendation"("doctorId","userId");

CREATE TABLE IF NOT EXISTS "public"."ShelterAggregate" (
  "id" TEXT NOT NULL,
  "externalSource" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "firstVisitFreeYes" INTEGER NOT NULL DEFAULT 0,
  "firstVisitFreeNo" INTEGER NOT NULL DEFAULT 0,
  "firstVisitFreeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "firstVisitConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "topDoctorsJson" JSONB,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShelterAggregate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ShelterAggregate_ext_key" ON "public"."ShelterAggregate"("externalSource","externalId");
