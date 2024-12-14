CREATE OR REPLACE FUNCTION public.get_my_groups()
  RETURNS TABLE(
    id uuid,
    title text,
    created_at timestamp with time zone,
    metadata jsonb,
    user_role text
  )
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
$$
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public, pg_temp;

