<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { page } from "$app/stores";
  import { supabase } from "$lib/services/supabase";
  import { fetchGame } from "$lib/services/gameService.svelte";
  import { getUser } from "$lib/services/backend.svelte";
  import type { Game } from "$lib/types/Game";
  import GameInfo from "$lib/components/GameInfo.svelte";
  import Question from "$lib/components/Question.svelte";
  import type { Question as QuestionType } from "$lib/types/Question";
  const user = $derived(getUser());

  const gameId = $page.params.id;
  let game = $state<Game | null>(null);
  let currentQuestion = $state<QuestionType | null>(null);
  let selectedAnswer = $state<string | null>(null);
  let correctAnswer = $state<string | null>(null);
  let currentQuestionIndex = $state<number>(0);
  let isCorrect = $state<boolean | null>(null);
  let countdown = $state(30);

  $effect(() => {
    fetchGame(gameId)
      .then((data) => {
        game = data;
      })
      .then(async () => {
        await supabase.functions.invoke("game_play", {
          body: { gameid: gameId },
        });
      });

    const channel = supabase.channel(gameId);
    channel
      .on("broadcast", { event: "new_question" }, (payload) => {
        console.log("new_question", payload);
        if (payload.payload) {
          currentQuestion = {
            a: payload.payload.a,
            b: payload.payload.b,
            c: payload.payload.c,
            d: payload.payload.d,
            id: payload.payload.id,
            category: payload.payload.category,
            question: payload.payload.question,
            difficulty: payload.payload.difficulty,
            correct_answer: "",
          };
          currentQuestionIndex = payload.payload.currentQuestionIndex;
          correctAnswer = null;
          selectedAnswer = null;
          countdown = 30;
        }
      })
      .on("broadcast", { event: "answer_result" }, (payload) => {
        console.log("answer_result", payload);
        if (payload.payload) {
          correctAnswer = payload.payload.correctAnswer;
          isCorrect = payload.payload.isCorrect;
          if (payload.payload.isCorrect) {
            selectedAnswer = correctAnswer;
          } else if (payload.payload.answer) {
            selectedAnswer = payload.payload.answer;
          }
        }
      })
      .on("broadcast", { event: "users_update" }, (payload) => {
        console.log("users_update", payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  });

  $effect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        countdown--;
      }, 1000);
      return () => clearInterval(interval);
    }
  });

  async function saveAnswer(answer: string) {
    console.log("saveAnswer", answer);
    selectedAnswer = answer; // Update selectedAnswer immediately
    if (!currentQuestion) return;
    const channel = supabase.channel(gameId);
    channel.send({
      type: "broadcast",
      event: "answer_submitted",
      payload: { questionId: currentQuestion.id, answer },
    });
  }
</script>

<PageTemplate>
  {#snippet TopCenter()}
    Game
  {/snippet}
  {#snippet Middle()}
    {#if game}
      <GameInfo {game} />
      {#if currentQuestion}
        <p>Time remaining: {countdown}</p>
        <Question
          question={currentQuestion}
          {selectedAnswer}
          {correctAnswer}
          {isCorrect}
          {saveAnswer}
          {currentQuestionIndex}
        />
      {/if}
    {:else}
      <p>Loading game...</p>
    {/if}
  {/snippet}
</PageTemplate>
