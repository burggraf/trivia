

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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."accept_invite"("invite_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_group_id uuid;
    v_user_id uuid;
    v_email text;
    v_role text;
BEGIN
    -- Get the current user's ID and email
    v_user_id := auth.uid();
    v_email := auth.email();
    -- Look up the corresponding groups_invites record
    SELECT
        groupid,
        email,
        user_role INTO v_group_id,
        v_email,
        v_role
    FROM
        public.groups_invites
    WHERE
        id = invite_id;
    -- If invite not found, return an error
    IF v_group_id IS NULL THEN
        RAISE EXCEPTION 'Invite not found';
    END IF;
    -- Verify that the email address of the current user matches the email field of the given groups_invites record
    IF v_email != auth.email() THEN
        RAISE EXCEPTION 'Email mismatch';
    END IF;
    -- Create an entry in the groups_users table
    INSERT INTO public.groups_users(groupid, userid, user_role)
        VALUES (v_group_id, v_user_id, v_role);
    -- Delete the invite record
    DELETE FROM public.groups_invites
    WHERE id = invite_id;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error accepting invite: %', SQLERRM;
END;

$$;


ALTER FUNCTION "public"."accept_invite"("invite_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."accept_invite"("invite_id" "uuid") IS 'Accpets an group invite, creating a user entry in the groups_users table and deleting the groups_invite record. This function should only be accessible to highly privileged roles.';



CREATE OR REPLACE FUNCTION "public"."find_and_insert_similar_questions"("offset_val" integer) RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  inserted_count INTEGER;
  queried_count INTEGER;
  total_question_count INTEGER;
BEGIN
    -- Determine total records for loop exit condition
    SELECT count(*) into total_question_count FROM questions;
    
  WITH given_question AS (
    SELECT id, question, embedding, a
    FROM questions
    WHERE id in (select id from questions order by id offset offset_val limit 100)
  ),
    similar_pairs AS (
        SELECT 
            gq.id as id1, 
            q.id as id2, 
            1 - (gq.embedding <=> q.embedding) AS similarity
        FROM given_question gq
        CROSS JOIN LATERAL (
            SELECT id, question, embedding, a
            FROM questions
            WHERE id != gq.id
            ORDER BY gq.embedding <-> embedding
            LIMIT 100  -- Adjust this value based on how many potential matches you want to check
        ) q
        WHERE 1 - (gq.embedding <=> q.embedding) > 0.98
    )
  
    INSERT INTO similar_questions (id1, id2, similarity)
    SELECT id1, id2, similarity
    FROM similar_pairs;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    SELECT COUNT(*) INTO queried_count FROM questions WHERE id IN (SELECT id FROM questions ORDER BY id OFFSET offset_val LIMIT 100);


  RETURN json_build_object(
    'inserted_count', inserted_count,
    'queried_count', queried_count,
    'total_count', total_question_count
  );

END;
$$;


ALTER FUNCTION "public"."find_and_insert_similar_questions"("offset_val" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_group_role"("group_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    ROLE TEXT;
BEGIN
    SELECT
        user_role INTO ROLE
    FROM
        groups_users
    WHERE
        groupid = group_id
        AND userid = auth.uid();
    RETURN ROLE;
END;
$$;


ALTER FUNCTION "public"."get_group_role"("group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_group_role_for_user"("group_id" "uuid", "user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    ROLE TEXT;
BEGIN
    SELECT
        user_role INTO ROLE
    FROM
        groups_users
    WHERE
        groupid = group_id
        AND userid = user_id;
    RETURN ROLE;
END;
$$;


ALTER FUNCTION "public"."get_group_role_for_user"("group_id" "uuid", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_group_users"("group_id" "uuid") RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "user_role" "text", "email" character varying, "last_sign_in_at" timestamp with time zone, "raw_user_meta_data" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        groups_users.id,
        groups_users.created_at,
        groups_users.user_role,
        auth.users.email,
        auth.users.last_sign_in_at,
        auth.users.raw_user_meta_data
    FROM
        groups_users
        JOIN auth.users ON groups_users.userid = auth.users.id
    WHERE
        groups_users.groupid = group_id;
END;
$$;


ALTER FUNCTION "public"."get_group_users"("group_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_group_users"("group_id" "uuid") IS 'Gets a list of all users in an groupanization. This function should only be accessible to highly privileged roles.';



CREATE OR REPLACE FUNCTION "public"."get_my_groupids"() RETURNS TABLE("groupid" "uuid")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        ou.groupid
    FROM
        public.groups_users AS ou
    WHERE
        ou.userid = auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_my_groupids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_groups"() RETURNS TABLE("id" "uuid", "title" "text", "created_at" timestamp with time zone, "metadata" "jsonb", "user_role" "text")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        groups.id,
        groups.title,
        groups.created_at,
        groups.metadata,
        groups_users.user_role
    FROM
        GROUPS
        JOIN groups_users ON groups.id = groups_users.groupid
    WHERE
        groups_users.userid = auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_my_groups"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_random_unseen_questions"("p_user_ids" "uuid"[], "p_categories" "text"[] DEFAULT NULL::"text"[], "p_difficulties" "text"[] DEFAULT NULL::"text"[], "p_limit" integer DEFAULT 10) RETURNS TABLE("id" "uuid", "question" "text", "a" "text", "b" "text", "c" "text", "d" "text", "category" "text", "difficulty" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        q.id,
        q.question,
        q.a,
        q.b,
        q.c,
        q.d,
        q.category,
        q.difficulty
    FROM
        questions q
    WHERE
        -- Filter by categories if provided
(p_categories IS NULL
            OR q.category = ANY(p_categories))
        AND
        -- Filter by difficulty if provided
(p_difficulties IS NULL
            OR q.difficulty = ANY(p_difficulties))
        AND NOT EXISTS(
            SELECT
                1
            FROM
                users_questions uq
            WHERE
                uq.questionid = q.id
                AND uq.userid = ANY(p_user_ids))
    ORDER BY
        random()
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_random_unseen_questions"("p_user_ids" "uuid"[], "p_categories" "text"[], "p_difficulties" "text"[], "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_groupids"("p_userid" "uuid") RETURNS TABLE("groupid" "uuid")
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        ou.groupid
    FROM
        public.groups_users AS ou
    WHERE
        ou.userid = p_userid;
END;
$$;


ALTER FUNCTION "public"."get_user_groupids"("p_userid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    full_name text;
    first_name text;
    last_name text;
    name_parts text[];
    new_group_id uuid;
BEGIN
    full_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')), '');
    IF full_name IS NOT NULL THEN
        -- Split the full name into an array
        name_parts := string_to_array(full_name, ' ');
        -- Get the last name (last element of the array)
        last_name := COALESCE(NEW.raw_user_meta_data ->> 'lastname', name_parts[array_length(name_parts, 1)], '');
        -- Get the first name (everything except the last element)
        first_name := COALESCE(NEW.raw_user_meta_data ->> 'firstname', NULLIF(array_to_string(name_parts[1:array_length(name_parts, 1) - 1], ' '), ''), '');
    ELSE
        last_name := COALESCE(NEW.raw_user_meta_data ->> 'lastname', '');
        first_name := COALESCE(NEW.raw_user_meta_data ->> 'firstname', '');
    END IF;
    -- Insert into public.profiles
    INSERT INTO public.profiles(id, email, firstname, lastname)
        VALUES (NEW.id, NEW.email, first_name, last_name);
    -- Create the group title
    full_name := NULLIF(TRIM(CONCAT(first_name, ' ', last_name)), '');
    -- Insert into public.groups and get the new group id
    INSERT INTO public.groups(id, title)
        VALUES (NEW.id, CONCAT(COALESCE(full_name, 'New User'), '''s Group'))
    RETURNING
        id INTO new_group_id;
    -- Insert into public.groups_users
    INSERT INTO public.groups_users(groupid, userid, user_role)
        VALUES (new_group_id, NEW.id, 'Admin');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_backup_running"() RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN EXISTS(
        SELECT
            1
        FROM
            pg_ls_dir('.')
        WHERE
            pg_ls_dir = 'backup_label');
END;
$$;


ALTER FUNCTION "public"."is_backup_running"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reject_invite"("invite_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Delete the invite record
    DELETE FROM public.groups_invites
    WHERE id = invite_id;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error deleting invite: %', SQLERRM;
END;

$$;


ALTER FUNCTION "public"."reject_invite"("invite_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."reject_invite"("invite_id" "uuid") IS 'Deletes an group invite. This function should only be accessible to highly privileged roles.';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


ALTER TABLE "public"."categories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."contacts" (
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



CREATE TABLE IF NOT EXISTS "public"."duplicates" (
    "category" "text",
    "subcategory" "text",
    "difficulty" "text",
    "question" "text",
    "a" "text",
    "b" "text",
    "c" "text",
    "d" "text",
    "id" "uuid",
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone,
    "embedding" "extensions"."vector"(384),
    "metadata" "jsonb",
    "duplicate_id" "uuid"
);


ALTER TABLE "public"."duplicates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "groupid" "uuid" NOT NULL,
    "metadata" "jsonb",
    "questions" "uuid"[] NOT NULL
);


ALTER TABLE "public"."games" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "gameid" "uuid" NOT NULL,
    "userid" "uuid" NOT NULL,
    "questionid" "uuid" NOT NULL,
    "answer" "text" NOT NULL
);


ALTER TABLE "public"."games_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games_keys" (
    "id" "uuid" NOT NULL,
    "keys" "text"[] NOT NULL
);


ALTER TABLE "public"."games_keys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "gameid" "uuid" NOT NULL,
    "userid" "uuid" NOT NULL,
    "groupid" "uuid"
);


ALTER TABLE "public"."games_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "metadata" "jsonb"
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


COMMENT ON TABLE "public"."groups" IS 'Groupanizations';



CREATE TABLE IF NOT EXISTS "public"."groups_invites" (
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



CREATE TABLE IF NOT EXISTS "public"."groups_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "groupid" "uuid" NOT NULL,
    "userid" "uuid" NOT NULL,
    "user_role" "text" NOT NULL
);


ALTER TABLE "public"."groups_users" OWNER TO "postgres";


COMMENT ON TABLE "public"."groups_users" IS 'Users belong to Groups';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sender" "uuid",
    "sender_type" "text",
    "subject" "text",
    "message" "text",
    "metadata" "jsonb",
    "sender_deleted_at" timestamp with time zone
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."messages" IS 'Messages between users';



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



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text" NOT NULL,
    "metadata" "jsonb",
    "firstname" "text",
    "lastname" "text",
    "bio" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'User profiles';



CREATE TABLE IF NOT EXISTS "public"."questions" (
    "category" "text",
    "subcategory" "text",
    "difficulty" "text",
    "question" "text",
    "a" "text",
    "b" "text",
    "c" "text",
    "d" "text",
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "embedding" "extensions"."vector"(384),
    "metadata" "jsonb"
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


COMMENT ON TABLE "public"."questions" IS 'trivia questions';



CREATE TABLE IF NOT EXISTS "public"."similar_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id1" "uuid" NOT NULL,
    "id2" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "similarity" numeric NOT NULL
);


ALTER TABLE "public"."similar_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "userid" "uuid" NOT NULL,
    "questionid" "uuid" NOT NULL,
    "chosen" "text",
    "correct" numeric
);


ALTER TABLE "public"."users_questions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "game_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."games_answers"
    ADD CONSTRAINT "games_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."games_keys"
    ADD CONSTRAINT "games_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."games_users"
    ADD CONSTRAINT "games_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups_invites"
    ADD CONSTRAINT "groups_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups_users"
    ADD CONSTRAINT "groups_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages_recipients"
    ADD CONSTRAINT "messages_recipients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."similar_questions"
    ADD CONSTRAINT "similar_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users_questions"
    ADD CONSTRAINT "users_questions_pkey" PRIMARY KEY ("id");



CREATE INDEX "games_groupid_idx" ON "public"."games" USING "btree" ("groupid");



CREATE INDEX "games_users_gameid_idx" ON "public"."games_users" USING "btree" ("gameid");



CREATE INDEX "games_users_userid_idx" ON "public"."games_users" USING "btree" ("userid");



CREATE INDEX "groups_users_groupid_idx" ON "public"."groups_users" USING "btree" ("groupid");



CREATE INDEX "groups_users_userid_idx" ON "public"."groups_users" USING "btree" ("userid");



CREATE INDEX "lower_question" ON "public"."questions" USING "btree" ("lower"("question"));



CREATE INDEX "questions_category" ON "public"."questions" USING "btree" ("category");



CREATE INDEX "questions_created_at_idx" ON "public"."questions" USING "btree" ("created_at");



CREATE INDEX "questions_difficulty" ON "public"."questions" USING "btree" ("difficulty");



CREATE INDEX "questions_embedding_idx" ON "public"."questions" USING "hnsw" ("embedding" "extensions"."vector_cosine_ops") WITH ("m"='16', "ef_construction"='64');



CREATE INDEX "questions_question_idx" ON "public"."questions" USING "btree" ("question");



CREATE INDEX "questions_updated_at" ON "public"."questions" USING "btree" ("updated_at");



CREATE INDEX "similar_questions_id1" ON "public"."similar_questions" USING "btree" ("id1");



CREATE INDEX "similar_questions_id2" ON "public"."similar_questions" USING "btree" ("id2");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "game_groupid_fkey" FOREIGN KEY ("groupid") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games_answers"
    ADD CONSTRAINT "games_answers_gameid_fkey" FOREIGN KEY ("gameid") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games_answers"
    ADD CONSTRAINT "games_answers_questionid_fkey" FOREIGN KEY ("questionid") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games_answers"
    ADD CONSTRAINT "games_answers_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games_keys"
    ADD CONSTRAINT "games_keys_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games_users"
    ADD CONSTRAINT "games_users_gameid_fkey" FOREIGN KEY ("gameid") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games_users"
    ADD CONSTRAINT "games_users_groupid_fkey" FOREIGN KEY ("groupid") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games_users"
    ADD CONSTRAINT "games_users_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups_invites"
    ADD CONSTRAINT "groups_invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups_invites"
    ADD CONSTRAINT "groups_invites_groupid_fkey" FOREIGN KEY ("groupid") REFERENCES "public"."groups"("id");



ALTER TABLE ONLY "public"."groups_users"
    ADD CONSTRAINT "groups_users_groupid_fkey" FOREIGN KEY ("groupid") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups_users"
    ADD CONSTRAINT "groups_users_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."messages_recipients"
    ADD CONSTRAINT "messages_recipients_messageid_fkey" FOREIGN KEY ("messageid") REFERENCES "public"."messages"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages_recipients"
    ADD CONSTRAINT "messages_recipients_recipient_fkey" FOREIGN KEY ("recipient") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages_recipients"
    ADD CONSTRAINT "messages_recipients_recipient_fkey1" FOREIGN KEY ("recipient") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_fkey" FOREIGN KEY ("sender") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users_questions"
    ADD CONSTRAINT "users_questions_questionid_fkey" FOREIGN KEY ("questionid") REFERENCES "public"."questions"("id");



ALTER TABLE ONLY "public"."users_questions"
    ADD CONSTRAINT "users_questions_userid_fkey" FOREIGN KEY ("userid") REFERENCES "auth"."users"("id");



CREATE POLICY "Insert - user must be sender" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "sender"));



CREATE POLICY "Profiles are created automatically by trigger" ON "public"."profiles" FOR INSERT WITH CHECK (false);



CREATE POLICY "TEMPORARY - open viewing" ON "public"."groups" FOR SELECT USING (true);



CREATE POLICY "User must belong to group" ON "public"."contacts" TO "authenticated" USING ((( SELECT "public"."get_group_role"("contacts"."groupid") AS "get_group_role") IS NOT NULL)) WITH CHECK ((( SELECT "public"."get_group_role"("contacts"."groupid") AS "get_group_role") IS NOT NULL));



CREATE POLICY "admin or invitee can delete an invite" ON "public"."groups_invites" FOR DELETE TO "authenticated" USING ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) OR ("email" = ( SELECT "auth"."email"() AS "uid"))));



CREATE POLICY "admin or invitee can view invite" ON "public"."groups_invites" FOR SELECT TO "authenticated" USING ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) OR ("email" = ( SELECT "auth"."email"() AS "email"))));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."duplicates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."games_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."games_keys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."games_users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "group admins can create invites" ON "public"."groups_invites" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "public"."get_group_role"("groups_invites"."groupid") AS "get_group_role") = 'Admin'::"text") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "group admins can updated policies they created" ON "public"."groups_invites" FOR UPDATE TO "authenticated" USING (((( SELECT "public"."get_group_role"("groups_invites"."groupid") AS "get_group_role") = 'Admin'::"text") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK (((( SELECT "public"."get_group_role"("groups_invites"."groupid") AS "get_group_role") = 'Admin'::"text") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid"))));



ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups_invites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages_recipients" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "must be sender to delete" ON "public"."messages" FOR DELETE USING (("sender" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "must be sender to update" ON "public"."messages" FOR UPDATE USING (("sender" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("sender" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles cannot be deleted" ON "public"."profiles" FOR DELETE USING (false);



ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "recipient can update" ON "public"."messages_recipients" FOR UPDATE USING (("recipient" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("recipient" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "sender can delete" ON "public"."messages_recipients" FOR SELECT USING ((( SELECT "messages"."sender"
   FROM "public"."messages"
  WHERE ("messages"."id" = "messages_recipients"."messageid")) = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "sender can insert" ON "public"."messages_recipients" FOR INSERT WITH CHECK ((( SELECT "messages"."sender"
   FROM "public"."messages"
  WHERE ("messages"."id" = "messages_recipients"."messageid")) = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "sender or recipient can select" ON "public"."messages_recipients" FOR SELECT USING (((( SELECT "messages"."sender"
   FROM "public"."messages"
  WHERE ("messages"."id" = "messages_recipients"."messageid")) = ( SELECT "auth"."uid"() AS "uid")) OR (( SELECT "auth"."uid"() AS "uid") = "recipient")));



CREATE POLICY "sender or recipients can view" ON "public"."messages" FOR SELECT USING (true);



ALTER TABLE "public"."similar_questions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users can modify their own profile" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "users can view profiles from invite creators" ON "public"."profiles" FOR SELECT USING ((("id" = ( SELECT "auth"."uid"() AS "uid")) OR ("id" IN ( SELECT "groups_invites"."created_by"
   FROM "public"."groups_invites"))));



CREATE POLICY "users can view their own games" ON "public"."games" FOR SELECT TO "authenticated" USING ((( SELECT "count"(*) AS "count"
   FROM "public"."games_users"
  WHERE ("games_users"."userid" = ( SELECT "auth"."uid"() AS "uid"))) > 0));



CREATE POLICY "users can view their own profiles or those in their own groups" ON "public"."profiles" FOR SELECT USING ((("id" = ( SELECT "auth"."uid"() AS "uid")) OR ("id" IN ( SELECT "groups_users"."userid"
   FROM "public"."groups_users"))));



CREATE POLICY "users can view their own records" ON "public"."games_users" FOR SELECT TO "authenticated" USING (("userid" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "users can view their own records or records for groups they bel" ON "public"."groups_users" FOR SELECT USING ((("userid" = ( SELECT "auth"."uid"() AS "uid")) OR ("groupid" IN ( SELECT "public"."get_user_groupids"("auth"."uid"()) AS "get_user_groupids"))));



ALTER TABLE "public"."users_questions" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."accept_invite"("invite_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."find_and_insert_similar_questions"("offset_val" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."find_and_insert_similar_questions"("offset_val" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_and_insert_similar_questions"("offset_val" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_group_role"("group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_group_role"("group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_group_role"("group_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_group_role_for_user"("group_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_group_role_for_user"("group_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_group_role_for_user"("group_id" "uuid", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_group_users"("group_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_groupids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_groupids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_groupids"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_groups"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_groups"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_groups"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_random_unseen_questions"("p_user_ids" "uuid"[], "p_categories" "text"[], "p_difficulties" "text"[], "p_limit" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_random_unseen_questions"("p_user_ids" "uuid"[], "p_categories" "text"[], "p_difficulties" "text"[], "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_random_unseen_questions"("p_user_ids" "uuid"[], "p_categories" "text"[], "p_difficulties" "text"[], "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_groupids"("p_userid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_groupids"("p_userid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_groupids"("p_userid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_backup_running"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_backup_running"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_backup_running"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reject_invite"("invite_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON TABLE "public"."duplicates" TO "anon";
GRANT ALL ON TABLE "public"."duplicates" TO "authenticated";
GRANT ALL ON TABLE "public"."duplicates" TO "service_role";



GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";



GRANT ALL ON TABLE "public"."games_answers" TO "anon";
GRANT ALL ON TABLE "public"."games_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."games_answers" TO "service_role";



GRANT ALL ON TABLE "public"."games_keys" TO "anon";
GRANT ALL ON TABLE "public"."games_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."games_keys" TO "service_role";



GRANT ALL ON TABLE "public"."games_users" TO "anon";
GRANT ALL ON TABLE "public"."games_users" TO "authenticated";
GRANT ALL ON TABLE "public"."games_users" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."groups_invites" TO "anon";
GRANT ALL ON TABLE "public"."groups_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."groups_invites" TO "service_role";



GRANT ALL ON TABLE "public"."groups_users" TO "anon";
GRANT ALL ON TABLE "public"."groups_users" TO "authenticated";
GRANT ALL ON TABLE "public"."groups_users" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."messages_recipients" TO "anon";
GRANT ALL ON TABLE "public"."messages_recipients" TO "authenticated";
GRANT ALL ON TABLE "public"."messages_recipients" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON TABLE "public"."similar_questions" TO "anon";
GRANT ALL ON TABLE "public"."similar_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."similar_questions" TO "service_role";



GRANT ALL ON TABLE "public"."users_questions" TO "anon";
GRANT ALL ON TABLE "public"."users_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."users_questions" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
