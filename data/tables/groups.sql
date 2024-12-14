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

DROP TABLE IF EXISTS "public"."groups" CASCADE;

CREATE TABLE IF NOT EXISTS "public"."groups"(
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "metadata" "jsonb"
);

ALTER TABLE "public"."groups" OWNER TO "postgres";

COMMENT ON TABLE "public"."groups" IS 'Groupanizations';

ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."groups" TO "anon";

GRANT ALL ON TABLE "public"."groups" TO "authenticated";

GRANT ALL ON TABLE "public"."groups" TO "service_role";

