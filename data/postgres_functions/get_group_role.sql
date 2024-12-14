CREATE OR REPLACE FUNCTION get_group_role(group_id uuid)
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
        AND userid = auth.uid();
    RETURN ROLE;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

