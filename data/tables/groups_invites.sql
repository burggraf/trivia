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

DROP TABLE IF EXISTS "public"."groups_invites";

CREATE TABLE IF NOT EXISTS "public"."groups_invites"(
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "groupid" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "user_role" "text" NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval) NOT NULL,
    "metadata" "jsonb"
);

ALTER TABLE "public"."groups_invites" OWNER TO "postgres";

COMMENT ON TABLE "public"."groups_invites" IS 'pending invitations to join an group';

ALTER TABLE ONLY "public"."groups_invites"
    ADD CONSTRAINT "groups_invites_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."groups_invites"
    ADD CONSTRAINT "groups_invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."groups_invites"
    ADD CONSTRAINT "groups_invites_groupid_fkey" FOREIGN KEY ("groupid") REFERENCES "public"."groups"("id");

ALTER TABLE "public"."groups_invites" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."groups_invites" TO "anon";

GRANT ALL ON TABLE "public"."groups_invites" TO "authenticated";

GRANT ALL ON TABLE "public"."groups_invites" TO "service_role";

