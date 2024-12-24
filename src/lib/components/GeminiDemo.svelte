<script lang="ts">
  import { supabase } from "$lib/services/supabase";

  let prompt = $state("");
  let response = $state("");
  let loading = $state(false);
  let imageFile = $state<File | null>(null);

  async function sendMessage() {
    loading = true;
    const initialResponse = response; // Store previous response
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

    await callGemini(base64Image, prompt);
    response = initialResponse + "\\n\\n" + response; // Append new response
  }

  async function callGemini(base64Image: string | null, prompt: string) {
    try {
      const { data, error } = await supabase.functions.invoke("gemini-proxy", {
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

      if (error) {
        console.error("Error calling Gemini API", error);
        response += "\\n\\nError calling Gemini API.";
      } else {
        response += "\\n\\n" + JSON.stringify(data, null, 2);
      }
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
    {response}
  </div>
{/if}

{#if imageFile && !loading}
  <button onclick={sendMessage} class="border p-2 mt-2">
    Send Another Image
  </button>
{/if}
