-- CreateEnum
CREATE TYPE "public"."ExternalSource" AS ENUM ('petfinder');

-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalSource" "public"."ExternalSource",
ALTER COLUMN "placeId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."ZipCode" (
    "zip" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ZipCode_pkey" PRIMARY KEY ("zip")
);

-- CreateIndex
CREATE INDEX "Place_lat_lng_idx" ON "public"."Place"("lat", "lng");

-- CreateIndex
CREATE INDEX "Review_externalSource_externalId_idx" ON "public"."Review"("externalSource", "externalId");
