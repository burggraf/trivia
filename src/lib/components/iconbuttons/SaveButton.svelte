<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { Check } from "lucide-svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";

  let { onclick, classes } = $props<{
    onclick: () => void;
    classes?: string;
  }>();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    <Button variant="outline" size="icon" {onclick} class="h-9 w-9 {classes}">
      <Check class="h-5 w-5 text-green-600" />
      <span class="sr-only">Save changes</span>
    </Button>
  </Tooltip.Trigger>
  <Tooltip.Content>
    <p>Save</p>
  </Tooltip.Content>
</Tooltip.Root>
