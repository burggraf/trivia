<script lang="ts">
  import { supabase } from "$lib/services/supabase";
  import HtmlContent from "./HtmlContent.svelte";

  let prompt = $state("Describe the image");
  let response = $state("");
  let loading = $state(false);
  let promptTokenCount = $state(0);
  let candidatesTokenCount = $state(0);
  let totalTokenCount = $state(0);
  let imageFile = $state<File | null>(null);
  let errorMessage = $state<string | null>(null);

  async function sendMessage() {
    loading = true;
    response = await callGemini(imageFile, prompt);
  }

  async function callGemini(imageFile: File | null, prompt: string) {
    let base64Image: string | null = null;

    if (imageFile) {
      base64Image = await new Promise<string | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve(reader.result?.toString()?.split(",")[1] || null);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile!);
      });
    }

    try {
      const res = await supabase.functions.invoke("gemini-proxy", {
        body: {
          contents: [
            {
              parts: [
                ...(prompt ? [{ text: prompt }] : []),
                ...(base64Image
                  ? [
                      {
                        inline_data: {
                          mime_type: "image/jpeg", // Assuming JPEG
                          data: base64Image,
                        },
                      },
                    ]
                  : []),
              ],
            },
          ],
        },
      });

      if (res.error) {
        console.error("Error calling Gemini API", res.error);
        errorMessage = res.error.message;
        return "";
      } else {
        console.log("Gemini API response", res.data);
        promptTokenCount = res.data.usageMetadata.promptTokenCount;
        candidatesTokenCount = res.data.usageMetadata.candidatesTokenCount;
        totalTokenCount = res.data.usageMetadata.totalTokenCount;
        return res.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      }
    } catch (e: any) {
      errorMessage = e.message;
      return "";
    } finally {
      loading = false;
    }
  }

  function handleImageChange(event: Event) {
    const target = event.target as HTMLInputElement;
    imageFile = target.files?.[0] || null;
  }
</script>

<div class="flex gap-2">
  <input
    type="text"
    bind:value={prompt}
    placeholder="Enter your prompt"
    class="border p-2"
  />
  <input
    type="file"
    accept="image/*"
    onchange={handleImageChange}
    class="border p-2"
  />
  <button onclick={sendMessage} disabled={loading} class="border p-2">
    {#if loading}
      Loading...
    {:else}
      Send
    {/if}
  </button>
</div>
{#if response}
  <div class="mt-4 p-4 border rounded-md">
    <HtmlContent content={response} />
  </div>
{/if}

{#if promptTokenCount > 0}
  <div class="mt-2">Prompt Tokens: {promptTokenCount}</div>
{/if}
{#if candidatesTokenCount > 0}
  <div class="mt-2">Response Tokens: {candidatesTokenCount}</div>
{/if}
{#if totalTokenCount > 0}
  <div class="mt-2">Total Tokens: {totalTokenCount}</div>
{/if}

{#if imageFile && !loading}
  <button onclick={sendMessage} class="border p-2 mt-2">
    Send Another Image
  </button>
{/if}
