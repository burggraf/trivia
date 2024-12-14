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

DROP TABLE IF EXISTS "public"."groups_users";

CREATE TABLE IF NOT EXISTS "public"."groups_users"(
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "groupid" "uuid" NOT NULL,
    "userid" "uuid" NOT NULL,
    "user_role" "text" NOT NULL
);

ALTER TABLE "public"."groups_users" OWNER TO "postgres";

COMMENT ON TABLE "public"."groups_users" IS 'Users belong to Groups';

ALTER TABLE ONLY "public"."groups_users"
    ADD CONSTRAINT "groups_users_pkey" PRIMARY KEY ("id");

CREATE INDEX "groups_users_groupid_idx" ON "public"."groups_users" USING "btree"("groupid");

CREATE INDEX "groups_users_userid_idx" ON "public"."groups_users" USING "btree"("userid");

ALTER TABLE ONLY "public"."groups_users"
    ADD CONSTRAINT "groups_users_groupid_fkey" FOREIGN KEY ("groupid") REFERENCES "public"."groups"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."groups_users"
    ADD CONSTRAINT "groups_users_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."users"("id");

ALTER TABLE "public"."groups_users" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE "public"."groups_users" TO "anon";

GRANT ALL ON TABLE "public"."groups_users" TO "authenticated";

GRANT ALL ON TABLE "public"."groups_users" TO "service_role";

