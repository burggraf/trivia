CREATE OR REPLACE FUNCTION public.get_my_groupids()
  RETURNS TABLE(
    groupid uuid
  )
  AS $$
BEGIN
  RETURN QUERY
  SELECT
    ou.groupid
  FROM
    public.groups_users AS ou
  WHERE
    ou.userid = auth.uid();
END;
$$
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public, pg_temp;

