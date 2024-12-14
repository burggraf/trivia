CREATE OR REPLACE FUNCTION public.get_my_groupids()
    RETURNS TABLE(
        groupid uuid)
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path TO 'public',
    'pg_temp'
    AS $function$
BEGIN
    RETURN QUERY
    SELECT
        ou.groupid
    FROM
        public.groups_users AS ou
    WHERE
        ou.userid = auth.uid();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_group_users(group_id uuid)
    RETURNS TABLE(
        id uuid,
        created_at timestamp with time zone,
        user_role text,
        email character varying,
        last_sign_in_at timestamp with time zone,
        raw_user_meta_data jsonb)
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.is_backup_running()
    RETURNS boolean
    LANGUAGE plpgsql
    AS $function$
BEGIN
    RETURN EXISTS(
        SELECT
            1
        FROM
            pg_ls_dir('.')
        WHERE
            pg_ls_dir = 'backup_label');
END;
$function$;

CREATE OR REPLACE FUNCTION public.reject_invite(invite_id uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
BEGIN
    -- Delete the invite record
    DELETE FROM public.groups_invites
    WHERE id = invite_id;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error deleting invite: %', SQLERRM;
END;

$function$;

CREATE OR REPLACE FUNCTION public.accept_invite(invite_id uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
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

$function$;

CREATE OR REPLACE FUNCTION public.get_my_groups()
    RETURNS TABLE(
        id uuid,
        title text,
        created_at timestamp with time zone,
        metadata jsonb,
        user_role text)
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path TO 'public',
    'pg_temp'
    AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_group_role(group_id uuid)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_group_role_for_user(group_id uuid, user_id uuid)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.get_user_groupids(p_userid uuid)
    RETURNS TABLE(
        groupid uuid)
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path TO 'public',
    'pg_temp'
    AS $function$
BEGIN
    RETURN QUERY
    SELECT
        ou.groupid
    FROM
        public.groups_users AS ou
    WHERE
        ou.userid = p_userid;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $function$
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
$function$;

