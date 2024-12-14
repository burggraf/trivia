<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { Star } from "lucide-svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";

  let { onclick, classes, iconClasses } = $props<{
    onclick?: () => void;
    classes?: string;
    iconClasses?: string;
  }>();
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    <Button variant="ghost" size="icon" {onclick} class="h-9 w-9 {classes}">
      <Star class="h-5 w-5 {iconClasses}" />
      <span class="sr-only">New</span>
    </Button>
  </Tooltip.Trigger>
  <Tooltip.Content>
    <p>New</p>
  </Tooltip.Content>
</Tooltip.Root>
