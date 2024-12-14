

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


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parentid" "uuid",
    "orgid" "uuid" NOT NULL,
    "propertyid" "uuid" NOT NULL,
    "userid" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "description" "text",
    "notes" "text",
    "amount" numeric DEFAULT '0'::numeric NOT NULL,
    "balance" numeric DEFAULT '0'::numeric NOT NULL,
    "metadata" "jsonb",
    "contactid" "uuid"
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."transactions" IS 'property transactions';



COMMENT ON COLUMN "public"."transactions"."contactid" IS 'id of contact for the transaction, i.e. for a rental this would point to the renter';



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_contactid_fkey" FOREIGN KEY ("contactid") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_orgid_fkey" FOREIGN KEY ("orgid") REFERENCES "public"."orgs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_propertyid_fkey" FOREIGN KEY ("propertyid") REFERENCES "public"."properties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."users"("id");


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;




GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



