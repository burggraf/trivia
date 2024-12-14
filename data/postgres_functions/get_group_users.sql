-- Function to delete a group and all related data
CREATE OR REPLACE FUNCTION get_group_users(group_id uuid)
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
$$
LANGUAGE plpgsql
SECURITY DEFINER;

-- Revoke execute permissions from anon and authenticated roles
REVOKE EXECUTE ON FUNCTION get_group_users(UUID) FROM anon, authenticated;

-- Grant execute permissions to a specific role (e.g., admin_role)
-- Uncomment and modify the following line if you want to grant access to a specific role
-- GRANT EXECUTE ON FUNCTION delete_group(UUID) TO admin_role;
-- Add a comment to the function
COMMENT ON FUNCTION get_group_users(UUID) IS 'Gets a list of all users in a group. This function should only be accessible to highly privileged roles.';

