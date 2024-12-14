<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";

  const roles = [
    { value: "Admin", label: "Admin" },
    { value: "Manager", label: "Manager" },
    { value: "Member", label: "Member" },
    { value: "Viewer", label: "Viewer" },
  ];

  let { value = $bindable(), classes } = $props<{
    value?: string;
    classes?: string;
  }>();

  //let value = $state(user.user_role);

  const triggerContent = $derived(
    roles.find((f) => f.value === value)?.label ?? "Select role",
  );

  // Update when the role changes
</script>

<Select.Root type="single" name="user_role" bind:value>
  <Select.Trigger class="w-[180px] {classes}">
    {triggerContent}
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.GroupHeading>Role</Select.GroupHeading>
      {#each roles as role}
        <Select.Item value={role.value} label={role.label}
          >{role.label}</Select.Item
        >
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
