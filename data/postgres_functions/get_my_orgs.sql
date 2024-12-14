CREATE OR REPLACE FUNCTION public.get_my_orgs()
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
$$
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public, pg_temp;

