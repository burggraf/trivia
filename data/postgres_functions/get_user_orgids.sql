CREATE OR REPLACE FUNCTION public.get_user_orgids(p_userid uuid)
  RETURNS TABLE(
    orgid uuid
  )
  AS $$
BEGIN
  RETURN QUERY
  SELECT
    ou.orgid
  FROM
    public.orgs_users AS ou
  WHERE
    ou.userid = p_userid;
END;
$$
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public, pg_temp;

