<script lang="ts">
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  import { SafeArea } from "@capacitor-community/safe-area";
  import { setLocale } from "$lib/i18n";
  import { initializeUser } from "$lib/services/backend.svelte";
  import Alert from "$lib/components/ui/alert/alert.svelte";
  import Loading from "$lib/components/loading/loading.svelte";

  let { children } = $props();

  $effect(() => {
    initializeUser();
    SafeArea.enable({
      config: {
        customColorsForSystemBars: true,
        statusBarColor: "#00000000", // transparent
        statusBarContent: "light",
        navigationBarColor: "#00000000", // transparent
        navigationBarContent: "light",
      },
    });
    // Try to get the locale from localStorage
    const storedLocale = localStorage.getItem("locale");
    if (storedLocale) {
      setLocale(storedLocale);
    }
  });
</script>

<ModeWatcher />
<Alert />
<Loading />
{@render children()}
