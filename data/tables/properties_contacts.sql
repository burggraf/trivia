

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


CREATE TABLE IF NOT EXISTS "public"."properties_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "propertyid" "uuid" NOT NULL,
    "contactid" "uuid" NOT NULL,
    "contact_type" "text" NOT NULL,
    "notes" "text",
    "metadata" "jsonb",
    "orgid" "uuid" NOT NULL
);


ALTER TABLE "public"."properties_contacts" OWNER TO "postgres";


COMMENT ON TABLE "public"."properties_contacts" IS 'people associated with a property';



ALTER TABLE ONLY "public"."properties_contacts"
    ADD CONSTRAINT "properties_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."properties_contacts"
    ADD CONSTRAINT "properties_contacts_contactid_fkey" FOREIGN KEY ("contactid") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."properties_contacts"
    ADD CONSTRAINT "properties_contacts_orgid_fkey" FOREIGN KEY ("orgid") REFERENCES "public"."orgs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."properties_contacts"
    ADD CONSTRAINT "properties_contacts_propertyid_fkey" FOREIGN KEY ("propertyid") REFERENCES "public"."properties"("id") ON DELETE CASCADE;






ALTER TABLE "public"."properties_contacts" ENABLE ROW LEVEL SECURITY;


GRANT ALL ON TABLE "public"."properties_contacts" TO "anon";
GRANT ALL ON TABLE "public"."properties_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."properties_contacts" TO "service_role";



