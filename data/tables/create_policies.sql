CREATE POLICY "User must belong to org" ON "public"."contacts" TO "authenticated" USING ((( SELECT "public"."get_org_role"("contacts"."orgid") AS "get_org_role") IS NOT NULL)) WITH CHECK ((( SELECT "public"."get_org_role"("contacts"."orgid") AS "get_org_role") IS NOT NULL));

CREATE POLICY "recipient can update" ON "public"."messages_recipients" FOR UPDATE USING (("recipient" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("recipient" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "sender can delete" ON "public"."messages_recipients" FOR SELECT USING ((( SELECT "messages"."sender"
   FROM "public"."messages"
  WHERE ("messages"."id" = "messages_recipients"."messageid")) = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "sender can insert" ON "public"."messages_recipients" FOR INSERT WITH CHECK ((( SELECT "messages"."sender"
   FROM "public"."messages"
  WHERE ("messages"."id" = "messages_recipients"."messageid")) = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "sender or recipient can select" ON "public"."messages_recipients" FOR SELECT USING (((( SELECT "messages"."sender"
   FROM "public"."messages"
  WHERE ("messages"."id" = "messages_recipients"."messageid")) = ( SELECT "auth"."uid"() AS "uid")) OR (( SELECT "auth"."uid"() AS "uid") = "recipient")));


CREATE POLICY "Insert - user must be sender" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "sender"));

CREATE POLICY "must be sender to delete" ON "public"."messages" FOR DELETE USING (("sender" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "must be sender to update" ON "public"."messages" FOR UPDATE USING (("sender" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("sender" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "sender or recipients can view" ON "public"."messages" FOR SELECT USING (true);



CREATE POLICY "admin or invitee can delete an invite" ON "public"."orgs_invites" FOR DELETE TO "authenticated" USING ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) OR ("email" = ( SELECT "auth"."email"() AS "uid"))));



CREATE POLICY "admin or invitee can view invite" ON "public"."orgs_invites" FOR SELECT TO "authenticated" USING ((("created_by" = ( SELECT "auth"."uid"() AS "uid")) OR ("email" = ( SELECT "auth"."email"() AS "email"))));



CREATE POLICY "org admins can create invites" ON "public"."orgs_invites" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "public"."get_org_role"("orgs_invites"."orgid") AS "get_org_role") = 'Admin'::"text") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "org admins can updated policies they created" ON "public"."orgs_invites" FOR UPDATE TO "authenticated" USING (((( SELECT "public"."get_org_role"("orgs_invites"."orgid") AS "get_org_role") = 'Admin'::"text") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid")))) WITH CHECK (((( SELECT "public"."get_org_role"("orgs_invites"."orgid") AS "get_org_role") = 'Admin'::"text") AND ("created_by" = ( SELECT "auth"."uid"() AS "uid"))));

CREATE POLICY "users can view their own records or records for orgs they belon" ON "public"."orgs_users" FOR SELECT USING ((("userid" = ( SELECT "auth"."uid"() AS "uid")) OR ("orgid" IN ( SELECT "public"."get_user_orgids"("auth"."uid"()) AS "get_user_orgids"))));

CREATE POLICY "TEMPORARY - open viewing" ON "public"."orgs" FOR SELECT USING (true);

CREATE POLICY "Profiles are created automatically by trigger" ON "public"."profiles" FOR INSERT WITH CHECK (false);


CREATE POLICY "profiles cannot be deleted" ON "public"."profiles" FOR DELETE USING (false);



CREATE POLICY "users can modify their own profile" ON "public"."profiles" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "users can view profiles from invite creators" ON "public"."profiles" FOR SELECT USING ((("id" = ( SELECT "auth"."uid"() AS "uid")) OR ("id" IN ( SELECT "orgs_invites"."created_by"
   FROM "public"."orgs_invites"))));



CREATE POLICY "users can view their own profiles or those in their own orgs" ON "public"."profiles" FOR SELECT USING ((("id" = ( SELECT "auth"."uid"() AS "uid")) OR ("id" IN ( SELECT "orgs_users"."userid"
   FROM "public"."orgs_users"))));


CREATE POLICY "must be org admin or manager" ON "public"."properties_contacts" USING ((( SELECT "public"."get_org_role"("properties_contacts"."orgid") AS "get_org_role") = ANY (ARRAY['Admin'::"text", 'Manager'::"text"]))) WITH CHECK ((( SELECT "public"."get_org_role"("properties_contacts"."orgid") AS "get_org_role") = ANY (ARRAY['Admin'::"text", 'Manager'::"text"])));

CREATE POLICY "anyone can view" ON "public"."properties" FOR SELECT USING (true);



CREATE POLICY "deletion not allowed" ON "public"."properties" FOR DELETE USING (false);



CREATE POLICY "insert: user must be  org admin or manager" ON "public"."properties" FOR INSERT WITH CHECK (("public"."get_org_role_for_user"("orgid", "auth"."uid"()) = ANY (ARRAY['Admin'::"text", 'Manager'::"text"])));



CREATE POLICY "org role must be Admin or Manager" ON "public"."properties" FOR UPDATE USING (("public"."get_org_role_for_user"("orgid", "auth"."uid"()) = ANY (ARRAY['Admin'::"text", 'Manager'::"text"]))) WITH CHECK (("public"."get_org_role_for_user"("orgid", "auth"."uid"()) = ANY (ARRAY['Admin'::"text", 'Manager'::"text"])));

CREATE POLICY "delete not allowed" ON "public"."transactions_events" FOR DELETE USING (false);



CREATE POLICY "user belong to org to view" ON "public"."transactions_events" FOR SELECT TO "authenticated" USING (("public"."get_org_role_for_user"("orgid", "userid") IS NOT NULL));



CREATE POLICY "user must be admin or manager of org to insert" ON "public"."transactions_events" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_org_role_for_user"("orgid", "userid") = ANY (ARRAY['Admin'::"text", 'Manager'::"text"])));



CREATE POLICY "user must be admin or manager of org to update" ON "public"."transactions_events" FOR UPDATE TO "authenticated" USING (("public"."get_org_role_for_user"("orgid", "userid") = ANY (ARRAY['Admin'::"text", 'Manager'::"text"]))) WITH CHECK (("public"."get_org_role_for_user"("orgid", "userid") = ANY (ARRAY['Admin'::"text", 'Manager'::"text"])));

CREATE POLICY "any org member can view transactions" ON "public"."transactions" FOR SELECT TO "authenticated" USING (("public"."get_org_role_for_user"("orgid", "userid") IS NOT NULL));


CREATE POLICY "deletion not allowed" ON "public"."transactions" FOR DELETE USING (false);


CREATE POLICY "user must be an org admin or manager to insert" ON "public"."transactions" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_org_role_for_user"("orgid", "userid") = ANY (ARRAY['Admin'::"text", 'Manager'::"text"])));



CREATE POLICY "user must be org admin or manager to update" ON "public"."transactions" FOR UPDATE USING (("public"."get_org_role_for_user"("orgid", "userid") = ANY (ARRAY['Admin'::"text", 'Manager'::"text"]))) WITH CHECK (("public"."get_org_role_for_user"("orgid", "userid") = ANY (ARRAY['Admin'::"text", 'Manager'::"text"])));

