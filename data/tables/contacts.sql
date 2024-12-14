SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = ON;

SELECT
    pg_catalog.set_config('search_path', '', FALSE);

SET check_function_bodies = FALSE;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = OFF;

SET default_tablespace = '';

SET default_table_access_method = "heap";

DROP TABLE IF EXISTS "public"."contacts";

CREATE TABLE IF NOT EXISTS "public"."contacts"(
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "firstname" "text",
    "lastname" "text",
    "email" "text",
    "phone" "text",
    "contact_type" "text",
    "notes" "text",
    "groupid" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "userid" "uuid",
    "address" "text",
    "address2" "text",
    "city" "text",
    "region" "text",
    "postal" "text",
    "country" "text",
    "metadata" "jsonb"
);

ALTER TABLE "public"."contacts" OWNER TO "postgres";

COMMENT ON TABLE "public"."contacts" IS 'List of Contacts (people)';

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_groupid_fkey" FOREIGN KEY ("groupid") REFERENCES "public"."groups"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."users"("id");

ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."contacts" TO "anon";

GRANT ALL ON TABLE "public"."contacts" TO "authenticated";

GRANT ALL ON TABLE "public"."contacts" TO "service_role";

