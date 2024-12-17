import { corsHeaders } from "../_shared/cors.ts";
import { getUser } from "../_shared/get_user.ts";
import { supabase } from "../_shared/supabase_client.ts";

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get the current user ID
    const { user, authError } = await getUser(req);
    if (authError || !user) {
      console.log("User not logged in");
      return new Response(JSON.stringify({ error: "User not logged in" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const userid = user.id;

    // Get the groupid from the request body
    const { groupid } = await req.json();
    console.log("groupid", groupid);
    console.log("userid", userid);

    if (!groupid) {
      console.log("groupid is required");
      return new Response(
        JSON.stringify({ error: "groupid is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // 2. Verify that the user belongs to the group
    const { data: groupUser, error: groupUserError } = await supabase
      .from("groups_users")
      .select("*")
      .eq("userid", userid)
      .eq("groupid", groupid)
      .single();

    if (groupUserError || !groupUser) {
      console.log("User is not a member of the group");
      return new Response(
        JSON.stringify({ error: "User is not a member of the group" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        },
      );
    }

    // 3. Call the function to get a list of random questions
    const { data: questions, error: questionsError } = await supabase.rpc(
      "get_random_unseen_questions",
      {
        p_user_ids: [userid],
      },
    );

    if (questionsError) {
      console.log("Failed to get random questions");
      return new Response(
        JSON.stringify({ error: "Failed to get random questions" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // 4. Create a record in the games table
    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert({ groupid, metadata: { questions } })
      .select()
      .single();

    if (gameError || !game) {
      console.log("Failed to create game record");
      return new Response(
        JSON.stringify({ error: "Failed to create game record" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // 5. Create a record in the games_users table
    const { error: gameUserError } = await supabase
      .from("games_users")
      .insert({ userid, gameid: game.id, groupid });

    if (gameUserError) {
      console.log("Failed to create game user record");
      return new Response(
        JSON.stringify({ error: "Failed to create game user record" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    console.log("Game created successfully");
    return new Response(
      JSON.stringify({
        data: { message: "Game created successfully", gameid: game.id },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
