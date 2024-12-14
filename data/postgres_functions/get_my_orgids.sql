CREATE OR REPLACE FUNCTION public.get_my_orgids()
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
    ou.userid = auth.uid();
END;
$$
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public, pg_temp;

