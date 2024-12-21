import { corsHeaders } from "../_shared/cors.ts";
import { getUser } from "../_shared/get_user.ts";
import { supabase } from "../_shared/supabase_client.ts";

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

function generateRandomOrder() {
  const letters = ["a", "b", "c", "d"];
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join("");
}

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
    const modifiedQuestions = questions.map((question: any) => {
      const letters = ["a", "b", "c", "d"];
      // Shuffle the letters
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }

      const shuffledKeys = {
        a: letters[0],
        b: letters[1],
        c: letters[2],
        d: letters[3],
      };

      const originalKeys = ["a", "b", "c", "d"];
      const modifiedQuestion = {
        ...question,
        a: question[shuffledKeys.a],
        b: question[shuffledKeys.b],
        c: question[shuffledKeys.c],
        d: question[shuffledKeys.d],
        correct_answer: originalKeys[letters.indexOf("a")],
      };

      return modifiedQuestion;
    });
    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert({
        groupid,
        metadata: {
          questions: modifiedQuestions,
        },
      })
      .select()
      .single();

    if (gameError || !game) {
      console.log("Failed to create game record", gameError);
      return new Response(
        JSON.stringify({ error: "Failed to create game record" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    // 6. Create a record in the games_users table
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
