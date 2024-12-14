CREATE OR REPLACE FUNCTION public.reject_invite(invite_id uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
BEGIN
    -- Delete the invite record
    DELETE FROM public.orgs_invites
    WHERE id = invite_id;
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error deleting invite: %', SQLERRM;
END;

$$;

-- Revoke execute permissions from anon and authenticated roles
REVOKE EXECUTE ON FUNCTION reject_invite(UUID) FROM anon, authenticated;

-- Grant execute permissions to a specific role (e.g., admin_role)
-- Uncomment and modify the following line if you want to grant access to a specific role
-- GRANT EXECUTE ON FUNCTION delete_org(UUID) TO admin_role;
-- Add a comment to the function
COMMENT ON FUNCTION reject_invite(UUID) IS 'Deletes an org invite. This function should only be accessible to highly privileged roles.';

