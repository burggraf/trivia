CREATE OR REPLACE FUNCTION public.get_my_orgids()
    RETURNS TABLE(
        orgid uuid)
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path TO 'public',
    'pg_temp'
    AS $function$
BEGIN
    RETURN QUERY
    SELECT
        ou.orgid
    FROM
        public.orgs_users AS ou
    WHERE
        ou.userid = auth.uid();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_org_users(org_id uuid)
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
        orgs_users.id,
        orgs_users.created_at,
        orgs_users.user_role,
        auth.users.email,
        auth.users.last_sign_in_at,
        auth.users.raw_user_meta_data
    FROM
        orgs_users
        JOIN auth.users ON orgs_users.userid = auth.users.id
    WHERE
        orgs_users.orgid = org_id;
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
    DELETE FROM public.orgs_invites
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
    v_org_id uuid;
    v_user_id uuid;
    v_email text;
    v_role text;
BEGIN
    -- Get the current user's ID and email
    v_user_id := auth.uid();
    v_email := auth.email();
    -- Look up the corresponding orgs_invites record
    SELECT
        orgid,
        email,
        user_role INTO v_org_id,
        v_email,
        v_role
    FROM
        public.orgs_invites
    WHERE
        id = invite_id;
    -- If invite not found, return an error
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Invite not found';
    END IF;
    -- Verify that the email address of the current user matches the email field of the given orgs_invites record
    IF v_email != auth.email() THEN
        RAISE EXCEPTION 'Email mismatch';
    END IF;
    -- Create an entry in the orgs_users table
    INSERT INTO public.orgs_users(orgid, userid, user_role)
        VALUES (v_org_id, v_user_id, v_role);
    -- Delete the invite record
    DELETE FROM public.orgs_invites
    WHERE id = invite_id;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error accepting invite: %', SQLERRM;
END;

$function$;

CREATE OR REPLACE FUNCTION public.get_my_orgs()
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
        orgs.id,
        orgs.title,
        orgs.created_at,
        orgs.metadata,
        orgs_users.user_role
    FROM
        orgs
        JOIN orgs_users ON orgs.id = orgs_users.orgid
    WHERE
        orgs_users.userid = auth.uid();
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_org_role(org_id uuid)
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
        orgs_users
    WHERE
        orgid = org_id
        AND userid = auth.uid();
    RETURN ROLE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_org_role_for_user(org_id uuid, user_id uuid)
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
        orgs_users
    WHERE
        orgid = org_id
        AND userid = user_id;
    RETURN ROLE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_orgids(p_userid uuid)
    RETURNS TABLE(
        orgid uuid)
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path TO 'public',
    'pg_temp'
    AS $function$
BEGIN
    RETURN QUERY
    SELECT
        ou.orgid
    FROM
        public.orgs_users AS ou
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
    new_org_id uuid;
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
    -- Create the org title
    full_name := NULLIF(TRIM(CONCAT(first_name, ' ', last_name)), '');
    -- Insert into public.orgs and get the new org id
    INSERT INTO public.orgs(id, title)
        VALUES (NEW.id, CONCAT(COALESCE(full_name, 'New User'), '''s Org'))
    RETURNING
        id INTO new_org_id;
    -- Insert into public.orgs_users
    INSERT INTO public.orgs_users(orgid, userid, user_role)
        VALUES (new_org_id, NEW.id, 'Admin');
    RETURN NEW;
END;
$function$;

