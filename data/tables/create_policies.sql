CREATE POLICY "User must belong to group" ON "public"."contacts" TO "authenticated"
   USING (((
      SELECT
         "public"."get_group_role"("contacts"."groupid") AS "get_group_role") IS NOT NULL))
         WITH CHECK (((
            SELECT
               "public"."get_group_role"("contacts"."groupid") AS "get_group_role") IS NOT NULL));

CREATE POLICY "recipient can update" ON "public"."messages_recipients"
   FOR UPDATE
      USING (("recipient" =(
         SELECT
            "auth"."uid"() AS "uid")))
            WITH CHECK (("recipient" =(
               SELECT
                  "auth"."uid"() AS "uid")));

CREATE POLICY "sender can delete" ON "public"."messages_recipients"
   FOR SELECT
      USING (((
         SELECT
            "messages"."sender"
         FROM
            "public"."messages"
         WHERE ("messages"."id" = "messages_recipients"."messageid")) =(
            SELECT
               "auth"."uid"() AS "uid")));

CREATE POLICY "sender can insert" ON "public"."messages_recipients"
   FOR INSERT
      WITH CHECK (((
         SELECT
            "messages"."sender"
         FROM
            "public"."messages"
         WHERE ("messages"."id" = "messages_recipients"."messageid")) =(
            SELECT
               "auth"."uid"() AS "uid")));

CREATE POLICY "sender or recipient can select" ON "public"."messages_recipients"
   FOR SELECT
      USING ((((
         SELECT
            "messages"."sender"
         FROM
            "public"."messages"
         WHERE ("messages"."id" = "messages_recipients"."messageid")) =(
            SELECT
               "auth"."uid"() AS "uid")) OR ((
                  SELECT
                     "auth"."uid"() AS "uid") = "recipient")));

CREATE POLICY "Insert - user must be sender" ON "public"."messages"
   FOR INSERT TO "authenticated"
      WITH CHECK (("auth"."uid"() = "sender"));

CREATE POLICY "must be sender to delete" ON "public"."messages"
   FOR DELETE
      USING (("sender" =(
         SELECT
            "auth"."uid"() AS "uid")));

CREATE POLICY "must be sender to update" ON "public"."messages"
   FOR UPDATE
      USING (("sender" =(
         SELECT
            "auth"."uid"() AS "uid")))
            WITH CHECK (("sender" =(
               SELECT
                  "auth"."uid"() AS "uid")));

CREATE POLICY "sender or recipients can view" ON "public"."messages"
   FOR SELECT
      USING (TRUE);

CREATE POLICY "admin or invitee can delete an invite" ON "public"."groups_invites"
   FOR DELETE TO "authenticated"
      USING ((("created_by" =(
         SELECT
            "auth"."uid"() AS "uid")) OR ("email" =(
               SELECT
                  "auth"."email"() AS "uid"))));

CREATE POLICY "admin or invitee can view invite" ON "public"."groups_invites"
   FOR SELECT TO "authenticated"
      USING ((("created_by" =(
         SELECT
            "auth"."uid"() AS "uid")) OR ("email" =(
               SELECT
                  "auth"."email"() AS "email"))));

CREATE POLICY "group admins can create invites" ON "public"."groups_invites"
   FOR INSERT TO "authenticated"
      WITH CHECK ((((
         SELECT
            "public"."get_group_role"("groups_invites"."groupid") AS "get_group_role") = 'Admin'::"text") AND ("created_by" =(
               SELECT
                  "auth"."uid"() AS "uid"))));

CREATE POLICY "group admins can updated policies they created" ON "public"."groups_invites"
   FOR UPDATE TO "authenticated"
      USING ((((
         SELECT
            "public"."get_group_role"("groups_invites"."groupid") AS "get_group_role") = 'Admin'::"text") AND ("created_by" =(
               SELECT
                  "auth"."uid"() AS "uid"))))
                  WITH CHECK ((((
                     SELECT
                        "public"."get_group_role"("groups_invites"."groupid") AS "get_group_role") = 'Admin'::"text") AND ("created_by" =(
                           SELECT
                              "auth"."uid"() AS "uid"))));

CREATE POLICY "users can view their own records or records for groups they belon" ON "public"."groups_users"
   FOR SELECT
      USING ((("userid" =(
         SELECT
            "auth"."uid"() AS "uid")) OR ("groupid" IN (
               SELECT
                  "public"."get_user_groupids"("auth"."uid"()) AS "get_user_groupids"))));

CREATE POLICY "TEMPORARY - open viewing" ON "public"."groups"
   FOR SELECT
      USING (TRUE);

CREATE POLICY "Profiles are created automatically by trigger" ON "public"."profiles"
   FOR INSERT
      WITH CHECK (FALSE);

CREATE POLICY "profiles cannot be deleted" ON "public"."profiles"
   FOR DELETE
      USING (FALSE);

CREATE POLICY "users can modify their own profile" ON "public"."profiles"
   FOR UPDATE
      USING (("id" = "auth"."uid"()))
      WITH CHECK (("id" = "auth"."uid"()));

CREATE POLICY "users can view profiles from invite creators" ON "public"."profiles"
   FOR SELECT
      USING ((("id" =(
         SELECT
            "auth"."uid"() AS "uid")) OR ("id" IN (
               SELECT
                  "groups_invites"."created_by"
               FROM
                  "public"."groups_invites"))));

CREATE POLICY "users can view their own profiles or those in their own groups" ON "public"."profiles"
   FOR SELECT
      USING ((("id" =(
         SELECT
            "auth"."uid"() AS "uid")) OR ("id" IN (
               SELECT
                  "groups_users"."userid"
               FROM
                  "public"."groups_users"))));

