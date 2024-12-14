<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Button } from "$lib/components/ui/button";
  import type { Icon } from "lucide-svelte";

  interface ActionItem {
    icon: Icon;
    label: string;
    onClick?: () => void;
    separator?: boolean;
    show?: boolean;
  }

  let {
    items,
    triggerIcon: TriggerIcon,
    buttonClass = "",
  } = $props<{
    items: ActionItem[];
    triggerIcon: any;
    buttonClass?: string;
  }>();

  const visibleItems = $derived(items?.filter(item => item.show !== false) ?? []);
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="ghost" size="icon" class={buttonClass}>
      <TriggerIcon class="h-4 w-4" />
      <span class="sr-only">Open actions menu</span>
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    {#each visibleItems as item}
      {#if item.separator}
        <DropdownMenu.Separator />
      {/if}
      {#if item.groupName}
        <DropdownMenu.Group>
          <DropdownMenu.GroupHeading>
            {item.groupName}
          </DropdownMenu.GroupHeading>
          {#each item.groupItems as groupItem}
            <DropdownMenu.Item onclick={groupItem.onClick}>
              <div class="flex items-center">
                <groupItem.icon class="mr-2 h-4 w-4 {groupItem.iconClasses}" />
                <span class={groupItem.textClasses}>{groupItem.label}</span>
              </div>
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Group>
      {:else}
        <DropdownMenu.Item onclick={item.onClick}>
          <div class="flex items-center">
            <item.icon class="mr-2 h-4 w-4" />
            {item.label}
          </div>
        </DropdownMenu.Item>
      {/if}
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
