-- Add recommended flag to reviews
ALTER TABLE "Review"
ADD COLUMN IF NOT EXISTS "recommended" BOOLEAN;
