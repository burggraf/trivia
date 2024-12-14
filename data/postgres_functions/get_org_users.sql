-- Function to delete an organization and all related data
CREATE OR REPLACE FUNCTION get_org_users(org_id uuid)
    RETURNS TABLE(
        id uuid,
        created_at timestamp with time zone,
        user_role text,
        email varchar(255),
        last_sign_in_at timestamp with time zone,
        raw_user_meta_data jsonb
    )
    AS $$
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
$$
LANGUAGE plpgsql
SECURITY DEFINER;

-- Revoke execute permissions from anon and authenticated roles
REVOKE EXECUTE ON FUNCTION get_org_users(UUID) FROM anon, authenticated;

-- Grant execute permissions to a specific role (e.g., admin_role)
-- Uncomment and modify the following line if you want to grant access to a specific role
-- GRANT EXECUTE ON FUNCTION delete_org(UUID) TO admin_role;
-- Add a comment to the function
COMMENT ON FUNCTION get_org_users(UUID) IS 'Gets a list of all users in an organization. This function should only be accessible to highly privileged roles.';

