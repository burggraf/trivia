CREATE OR REPLACE FUNCTION public.get_user_groupids(p_userid uuid)
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
    ou.userid = p_userid;
END;
$$
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public, pg_temp;

