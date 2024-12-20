<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { page } from "$app/stores";
  import { supabase } from "$lib/services/supabase";
  import type { Json } from "$lib/types/database.types";
  import { fetchGame } from "$lib/services/gameService.svelte";

  interface Game {
    created_at: string;
    groupid: string;
    id: string;
    metadata: {
      questions: {
        question: string;
        answers: {
          a: string;
          b: string;
          c: string;
          d: string;
        };
      }[];
    } | null;
    questions: string[];
    gamestate: string;
  }

  const gameId = $page.params.id;
  let game = $state<Game | null>(null);
  let currentQuestionIndex = $state(0);
  let questions = $state<
    {
      question: string;
      answers: {
        a: string;
        b: string;
        c: string;
        d: string;
      };
    }[]
  >([]);

  $effect(() => {
    fetchGame(gameId)
      .then((data) => {
        game = data;
      })
      .then(async () => {
        const response = await supabase.functions.invoke("game_play", {
          body: { gameid: gameId },
        });
        if (response.data) {
          const { data } = response.data;
          if (data?.questions) {
            questions = data.questions;
            if (questions.length > 0) {
              setGameMetadata(0);
              startTimer();
            }
          }
        }
      });

    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
        },
        (payload) => {
          if (payload.new) {
            game = payload.new as Game;
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });

  function setGameMetadata(index: number) {
    if (!game || !questions || questions.length === 0) return;
    const currentQuestion = questions[index];
    game.metadata = {
      questions: [currentQuestion],
    };
  }

  function startTimer() {
    const timer = setInterval(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex >= questions.length) {
        clearInterval(timer);
        console.log("Game Over");
        return;
      }
      setGameMetadata(currentQuestionIndex);
    }, 10000);
  }
</script>

<PageTemplate>
  {#snippet TopCenter()}
    Game
  {/snippet}
  {#snippet Middle()}
    {#if game}
      <h1>Game ID: {game.id}</h1>
      <p>Created At: {new Date(game.created_at).toLocaleString()}</p>
      <p>Status: {game.gamestate}</p>
      {#if game.metadata?.questions && game.metadata.questions.length > 0}
        <p>Question: {game.metadata.questions[0].question}</p>
        <p>Answers:</p>
        <ul>
          <li>A: {game.metadata.questions[0].answers.a}</li>
          <li>B: {game.metadata.questions[0].answers.b}</li>
          <li>C: {game.metadata.questions[0].answers.c}</li>
          <li>D: {game.metadata.questions[0].answers.d}</li>
        </ul>
      {/if}
    {:else}
      <p>Loading game...</p>
    {/if}
  {/snippet}
</PageTemplate>
