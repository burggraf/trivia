CREATE OR REPLACE FUNCTION get_group_role_for_user(group_id uuid, user_id uuid)
    RETURNS text
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
$$
LANGUAGE plpgsql
SECURITY DEFINER;

