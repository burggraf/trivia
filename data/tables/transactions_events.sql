

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


CREATE TABLE IF NOT EXISTS "public"."transactions_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transactionid" "uuid" NOT NULL,
    "orgid" "uuid" NOT NULL,
    "propertyid" "uuid" NOT NULL,
    "userid" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "description" "text",
    "notes" "text",
    "amount" numeric DEFAULT '0'::numeric NOT NULL,
    "metadata" "jsonb"
);


ALTER TABLE "public"."transactions_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."transactions_events" IS 'events related to a transaction';



ALTER TABLE ONLY "public"."transactions_events"
    ADD CONSTRAINT "transactions_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions_events"
    ADD CONSTRAINT "transactions_events_orgid_fkey" FOREIGN KEY ("orgid") REFERENCES "public"."orgs"("id");



ALTER TABLE ONLY "public"."transactions_events"
    ADD CONSTRAINT "transactions_events_propertyid_fkey" FOREIGN KEY ("propertyid") REFERENCES "public"."properties"("id");



ALTER TABLE ONLY "public"."transactions_events"
    ADD CONSTRAINT "transactions_events_transactionid_fkey" FOREIGN KEY ("transactionid") REFERENCES "public"."transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions_events"
    ADD CONSTRAINT "transactions_events_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."users"("id");


ALTER TABLE "public"."transactions_events" ENABLE ROW LEVEL SECURITY;



GRANT ALL ON TABLE "public"."transactions_events" TO "anon";
GRANT ALL ON TABLE "public"."transactions_events" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions_events" TO "service_role";



