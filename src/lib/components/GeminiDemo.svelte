<script lang="ts">
  import { supabase } from "$lib/services/supabase";

  let prompt = $state("");
  let response = $state("");
  let loading = $state(false);

  async function sendMessage() {
    loading = true;
    response = "";
    try {
      const { data, error } = await supabase.functions.invoke("gemini-proxy", {
        body: { prompt },
      });

      if (error) {
        throw error;
      }

      response =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    } catch (error) {
      response = "Error communicating with the Gemini API.";
    } finally {
      loading = false;
    }
  }
</script>

<div>
  <input type="text" bind:value={prompt} placeholder="Enter your prompt" />
  <button onclick={sendMessage} disabled={loading}>
    {#if loading}
      Loading...
    {:else}
      Send
    {/if}
  </button>
</div>

{#if response}
  <p><strong>Response:</strong> {response}</p>
{/if}
