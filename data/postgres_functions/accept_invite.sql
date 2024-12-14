CREATE OR REPLACE FUNCTION public.accept_invite(invite_id uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
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

$$;

-- Revoke execute permissions from anon and authenticated roles
REVOKE EXECUTE ON FUNCTION accept_invite(UUID) FROM anon, authenticated;

-- Grant execute permissions to a specific role (e.g., admin_role)
-- Uncomment and modify the following line if you want to grant access to a specific role
-- GRANT EXECUTE ON FUNCTION delete_org(UUID) TO admin_role;
-- Add a comment to the function
COMMENT ON FUNCTION accept_invite(UUID) IS 'Accpets an org invite, creating a user entry in the orgs_users table and deleting the orgs_invite record. This function should only be accessible to highly privileged roles.';

