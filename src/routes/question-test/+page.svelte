<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";

  import { supabase } from "$lib/services/supabase";
  import { getUser } from "$lib/services/backend.svelte";
  import { Button } from "$lib/components/ui/button";
  const user = $derived(getUser());
  let questions = $state<any[]>([]);
  const getQuestions = async () => {
    console.log("getQuestions");
    const { data, error } = await supabase.rpc("get_random_unseen_questions", {
      p_user_ids: [user?.id],
      p_categories: ["General Knowledge"],
      p_difficulties: ["easy", "medium", "hard"],
      p_limit: 10,
    });
    console.log("data, error", data, error);
    if (error) {
      console.error(error);
      return;
    }
    if (data) {
      questions = data;
    }
    return;
  };
</script>

<!-- <PageTemplate {actionItems} /> -->
<PageTemplate>
  <!--{#snippet TopLeft()}{/snippet}-->
  {#snippet TopCenter()}
    question-test
  {/snippet}
  <!--{#snippet TopRight()}{/snippet}-->

  {#snippet Middle()}
    <Button onclick={getQuestions}>Get Questions</Button><br />

    <pre>{JSON.stringify(questions, null, 2)}</pre>
  {/snippet}

  <!--{#snippet BottomLeft()}{/snippet}-->
  <!--{#snippet BottomCenter()}{/snippet}-->
  <!--{#snippet BottomRight()}{/snippet}-->
</PageTemplate>
