<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  import { page } from "$app/stores";
  import { supabase } from "$lib/services/supabase";
  import { getGameStatus } from "$lib/services/gameService.svelte";
  import { getUser } from "$lib/services/backend.svelte";
  import type { Game } from "$lib/types/Game";
  import GameInfo from "$lib/components/GameInfo.svelte";
  import Question from "$lib/components/Question.svelte";
  import type { Question as QuestionType } from "$lib/types/Question";
  const user = $derived(getUser());

  const gameId = $page.params.id;
  //let game = $state<Game | null>(null);
  let game = $state<any>(null);
  let currentQuestion = $state<QuestionType | null>(null);
  let selectedAnswer = $state<string | null>(null);
  let correctAnswer = $state<string | null>(null);
  let currentQuestionIndex = $state<number>(-1);
  let isCorrect = $state<boolean | null>(null);
  let countdown = $state(30);
  async function joinGame() {
    const channel = supabase.channel(gameId);
    console.log("channel", channel);

    const userStatus = {
      online_at: new Date().toISOString(),
    };
    channel
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }
        const presenceTrackStatus = await channel.track({
          [`${user?.id}:${Date.now()}`]: userStatus,
        });
        console.log(presenceTrackStatus);

        // Fetch game data from broadcast event
        console.log("sending get_status event");
        channel.send({
          type: "broadcast",
          event: "get_status",
          payload: {},
        });
      })
      .on("broadcast", { event: "status" }, (payload) => {
        console.log("status", payload);
        if (payload?.payload) {
          game = payload?.payload;
        }
      });

    channel
      .on("broadcast", { event: "current_status" }, (payload) => {
        console.log("current_status got:", payload);
        game = payload?.payload;
        console.log("game", game);
        const newQuestion = game?.question;
        const newQuestionIndex = game?.currentQuestionIndex;
        if (game && currentQuestionIndex !== newQuestionIndex) {
          currentQuestion = {
            a: newQuestion.a,
            b: newQuestion.b,
            c: newQuestion.c,
            d: newQuestion.d,
            id: newQuestion.id,
            category: newQuestion.category,
            question: newQuestion.question,
            difficulty: newQuestion.difficulty,
            correct_answer: "",
          };
          currentQuestionIndex = newQuestionIndex;
          correctAnswer = "";
          selectedAnswer = "";
          countdown = 30;
          console.log("currentQuestion was set!");
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
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }

  $effect(() => {
    console.log("checking game status");
    getGameStatus(gameId).then(async (gamestate) => {
      console.log("gamestate", gamestate);
      if (gamestate === "open") {
        await supabase.functions.invoke("game_play", {
          body: { gameid: gameId },
        });
        joinGame();
      } else if (gamestate === "started") {
        joinGame();
      } else if (gamestate === "ended") {
        console.error("Game is already ended");
        // TODO: display error to user
      }
    });
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
    console.log("sending answer_submitted event", {
      questionId: currentQuestion.id,
      answer,
    });
    channel.send({
      type: "broadcast",
      event: "answer_submitted",
      payload: { questionId: currentQuestion.id, answer, userid: user?.id },
    });
  }
</script>

<PageTemplate>
  {#snippet TopCenter()}
    Game
  {/snippet}
  {#snippet Middle()}
    {#if game}
      currentQuestionIndex: {currentQuestionIndex}<br />
      currentQuestion: {currentQuestion}<br />
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
