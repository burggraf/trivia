

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


CREATE TABLE IF NOT EXISTS "public"."messages_recipients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "recipient" "uuid",
    "deleted_at" timestamp with time zone,
    "read_at" timestamp with time zone,
    "messageid" "uuid"
);


ALTER TABLE "public"."messages_recipients" OWNER TO "postgres";


COMMENT ON TABLE "public"."messages_recipients" IS 'Recipent of a message';



ALTER TABLE ONLY "public"."messages_recipients"
    ADD CONSTRAINT "messages_recipients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages_recipients"
    ADD CONSTRAINT "messages_recipients_messageid_fkey" FOREIGN KEY ("messageid") REFERENCES "public"."messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages_recipients"
    ADD CONSTRAINT "messages_recipients_recipient_fkey" FOREIGN KEY ("recipient") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages_recipients"
    ADD CONSTRAINT "messages_recipients_recipient_fkey1" FOREIGN KEY ("recipient") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE "public"."messages_recipients" ENABLE ROW LEVEL SECURITY;





GRANT ALL ON TABLE "public"."messages_recipients" TO "anon";
GRANT ALL ON TABLE "public"."messages_recipients" TO "authenticated";
GRANT ALL ON TABLE "public"."messages_recipients" TO "service_role";



