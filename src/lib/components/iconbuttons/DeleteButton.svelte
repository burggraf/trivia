<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { Trash2 } from "lucide-svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";

  let { onclick, classes } = $props<{
    onclick: () => void;
    classes?: string;
  }>();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    <Button variant="outline" size="icon" {onclick} class="h-9 w-9 {classes}">
      <Trash2 class="h-5 w-5 text-destructive" />
      <span class="sr-only">Delete</span>
    </Button>
  </Tooltip.Trigger>
  <Tooltip.Content>
    <p>Delete</p>
  </Tooltip.Content>
</Tooltip.Root>
