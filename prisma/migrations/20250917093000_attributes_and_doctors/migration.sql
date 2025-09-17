-- Add enum for generic place attributes
DO $$ BEGIN
  CREATE TYPE "public"."PlaceAttribute" AS ENUM ('FIRST_VISIT_FREE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- PlaceAttributeVote table
CREATE TABLE IF NOT EXISTS "public"."PlaceAttributeVote" (
  "id" TEXT NOT NULL,
  "placeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "attribute" "public"."PlaceAttribute" NOT NULL,
  "boolValue" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlaceAttributeVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PlaceAttributeVote_placeId_userId_attribute_key" ON "public"."PlaceAttributeVote"("placeId","userId","attribute");
CREATE INDEX IF NOT EXISTS "PlaceAttributeVote_placeId_idx" ON "public"."PlaceAttributeVote"("placeId");
CREATE INDEX IF NOT EXISTS "PlaceAttributeVote_userId_idx" ON "public"."PlaceAttributeVote"("userId");

ALTER TABLE "public"."PlaceAttributeVote"
  ADD CONSTRAINT IF NOT EXISTS "PlaceAttributeVote_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "public"."Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."PlaceAttributeVote"
  ADD CONSTRAINT IF NOT EXISTS "PlaceAttributeVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Doctor table
CREATE TABLE IF NOT EXISTS "public"."Doctor" (
  "id" TEXT NOT NULL,
  "placeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Doctor_placeId_name_key" ON "public"."Doctor"("placeId","name");
CREATE INDEX IF NOT EXISTS "Doctor_placeId_idx" ON "public"."Doctor"("placeId");
ALTER TABLE "public"."Doctor"
  ADD CONSTRAINT IF NOT EXISTS "Doctor_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "public"."Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DoctorRecommendation augment (if table exists, add columns/constraints)
DO $$ BEGIN
  ALTER TABLE "public"."DoctorRecommendation" ADD COLUMN "doctorId" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."DoctorRecommendation" ALTER COLUMN "placeId" DROP NOT NULL;
EXCEPTION WHEN undefined_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "public"."DoctorRecommendation"
    ADD CONSTRAINT "DoctorRecommendation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX "DoctorRecommendation_doctorId_userId_key" ON "public"."DoctorRecommendation"("doctorId","userId");
EXCEPTION WHEN duplicate_table THEN NULL; END $$;
