<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import { alertManager } from "./alert.svelte.ts";
</script>

<AlertDialog.Root open={alertManager.isOpen}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>{alertManager.options?.title}</AlertDialog.Title>
      <AlertDialog.Description>
        {alertManager.options?.message}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      {#if alertManager.options?.buttons}
        {#each alertManager.options.buttons as button}
          <Button
            variant={button.variant ?? "default"}
            onclick={() => alertManager.handleAction(button.value)}
          >
            {button.label}
          </Button>
        {/each}
      {:else}
        <Button onclick={() => alertManager.handleAction("close")}>
          Close
        </Button>
      {/if}
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
