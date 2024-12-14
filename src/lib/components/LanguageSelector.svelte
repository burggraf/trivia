<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { setLocale, locale, t } from "$lib/i18n";
  import { getUser, updateUser } from "$lib/services/backend.svelte.ts";
  const user = $derived(getUser());
  const supportedLanguages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ];

  let isOpen = $state(false);

  async function handleChange(code: string) {
    setLocale(code);
    isOpen = false;

    if (user) {
      try {
        await updateUser({
          data: { i18n: code },
        });
      } catch (error) {
        console.error("Error updating user language preference:", error);
      }
    }
  }

  let currentLanguage = $derived(
    supportedLanguages.find((lang) => lang.code === $locale) ||
      supportedLanguages[0],
  );

  function toggleDialog() {
    isOpen = !isOpen;
  }
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Trigger>
    <Button
      variant="ghost"
      size="icon"
      class="w-12 h-12 p-0"
      onclick={toggleDialog}
    >
      <span class="text-2xl">{currentLanguage.flag}</span>
      <span class="sr-only">{$t("language.change")}</span>
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>{$t("language.choose")}</Dialog.Title>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      {#each supportedLanguages as { code, name, flag }}
        <Button
          class="flex justify-start items-center gap-2 w-full"
          variant="ghost"
          onclick={() => handleChange(code)}
        >
          <span class="text-2xl">{flag}</span>
          <span>{$t(`language.names.${code}`)}</span>
        </Button>
      {/each}
    </div>
  </Dialog.Content>
</Dialog.Root>
