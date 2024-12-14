

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."properties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "property_type" "text",
    "property_subtype" "text",
    "address" "text",
    "address2" "text",
    "city" "text",
    "region" "text",
    "postal" "text",
    "country" "text",
    "lat" numeric,
    "lng" numeric,
    "beds" numeric,
    "baths" numeric,
    "living_area" numeric,
    "land_area" numeric,
    "year_built" numeric,
    "hoa_fees" numeric,
    "notes" "text",
    "metadata" "jsonb",
    "orgid" "uuid" NOT NULL,
    "userid" "uuid" NOT NULL,
    "title" "text",
    "subtitle" "text"
);


ALTER TABLE "public"."properties" OWNER TO "postgres";


COMMENT ON TABLE "public"."properties" IS 'Properties for sale or rent';



COMMENT ON COLUMN "public"."properties"."title" IS 'property title';



COMMENT ON COLUMN "public"."properties"."subtitle" IS 'property subtitle';



ALTER TABLE ONLY "public"."properties"
    ADD CONSTRAINT "properties_pkey" PRIMARY KEY ("id");




ALTER TABLE "public"."properties" ENABLE ROW LEVEL SECURITY;


GRANT ALL ON TABLE "public"."properties" TO "anon";
GRANT ALL ON TABLE "public"."properties" TO "authenticated";
GRANT ALL ON TABLE "public"."properties" TO "service_role";



