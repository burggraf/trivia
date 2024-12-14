<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Dialog from "$lib/components/ui/dialog";
  import {
    getUser,
    setUser,
    getSession,
    signInWithPassword,
    signUp,
    signInWithOAuth,
  } from "$lib/services/backend.svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/i18n";
  import { toast } from "svelte-sonner";

  const user = $derived(getUser());
  let { open = $bindable(false) } = $props();

  let email = $state("");
  let password = $state("");
  let firstname = $state("");
  let lastname = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);
  let isLogin = $state(true);

  function closeModal() {
    open = false;
  }

  async function handleLogin() {
    loading = true;
    error = null;

    if (isLogin) {
      try {
        const signInError = await signInWithPassword(email, password);
        if (signInError) {
          error = signInError.message;
          toast.error("ERROR", {
            description: error,
          });
        } else {
          await refreshSession();
          closeModal();
        }
      } catch (e) {
        error = "An unexpected error occurred";
        console.error(e);
        toast.error("ERROR", {
          description: error,
        });
      } finally {
        loading = false;
      }
    } else {
      try {
        const signUpError = await signUp(email, password, {
          firstname,
          lastname,
        });
        if (signUpError && signUpError !== "null") {
          console.error("signUpError", signUpError);
          toast.error("ERROR", {
            description: signUpError || "An unexpected error occurred",
          });
        } else {
          await refreshSession();
          setTimeout(() => {
            toast.success("SUCCESS", {
              description: $t("loginModal.registerSuccess"),
            });
          });
          closeModal();
        }
      } catch (e) {
        error = "An unexpected error occurred";
        console.error(e);
        toast.error("ERROR", {
          description: error,
        });
      } finally {
        loading = false;
      }
    }
  }

  async function handleGoogleLogin() {
    if (!browser) return;

    loading = true;
    error = null;

    try {
      const signInError = await signInWithOAuth("google");
      if (signInError) {
        error = signInError.message;
        toast.error("ERROR", {
          description: error,
        });
      } else {
        closeModal();
      }
    } catch (e) {
      error = "An unexpected error occurred";
      console.error(e);
      toast.error("ERROR", {
        description: error,
      });
    } finally {
      loading = false;
    }
  }

  function toggleMode() {
    isLogin = !isLogin;
    error = null;
  }

  async function refreshSession() {
    const { data, error } = await getSession();
    if (data.session) {
      setUser(data.session.user);
    } else if (error) {
      setUser(null);
      console.error("Error refreshing session:", error);
    }
  }
</script>

{#if open}
  <Dialog.Root bind:open onOpenChange={(isOpen) => (open = isOpen)}>
    <Dialog.Content class="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
      <Dialog.Header>
        <Dialog.Title>
          {isLogin
            ? $t("loginModal.loginTitle")
            : $t("loginModal.registerTitle")}
        </Dialog.Title>
        <Dialog.Description>
          {isLogin
            ? $t("loginModal.loginDescription")
            : $t("loginModal.registerDescription")}
        </Dialog.Description>
      </Dialog.Header>
      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        class="space-y-4 py-4"
      >
        <div class="space-y-2">
          <Label for="email">{$t("loginModal.emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            bind:value={email}
            required
            autocomplete="username"
          />
        </div>
        <div class="space-y-2">
          <Label for="password">{$t("loginModal.passwordLabel")}</Label>
          <Input
            id="password"
            type="password"
            bind:value={password}
            required
            autocomplete={isLogin ? "current-password" : "new-password"}
          />
        </div>
        {#if !isLogin}
          <div class="space-y-2">
            <Label for="firstname">{$t("loginModal.firstnameLabel")}</Label>
            <Input
              id="firstname"
              type="text"
              bind:value={firstname}
              required
              autocomplete="given-name"
            />
          </div>
          <div class="space-y-2">
            <Label for="lastname">{$t("loginModal.lastnameLabel")}</Label>
            <Input
              id="lastname"
              type="text"
              bind:value={lastname}
              required
              autocomplete="family-name"
            />
          </div>
        {/if}
        {#if error}
          <p class="text-red-500">{error}</p>
        {/if}
        <Button type="submit" class="w-full" disabled={loading}>
          {loading
            ? $t("loginModal.loading")
            : isLogin
              ? $t("loginModal.loginButton")
              : $t("loginModal.registerButton")}
        </Button>
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t"></span>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">
              {$t("loginModal.orContinueWith")}
            </span>
          </div>
        </div>
        <Button
          class="w-full"
          variant="outline"
          onclick={handleGoogleLogin}
          disabled={loading}
        >
          <svg
            class="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            />
          </svg>
          Google
        </Button>
      </form>
      <Dialog.Footer>
        <Button variant="link" onclick={toggleMode}>
          {isLogin
            ? $t("loginModal.needAccount")
            : $t("loginModal.alreadyHaveAccount")}
        </Button>
      </Dialog.Footer>
      <Dialog.Close onclick={closeModal} />
    </Dialog.Content>
  </Dialog.Root>
{/if}
