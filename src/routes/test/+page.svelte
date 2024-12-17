<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
</script>

<PageTemplate>
  {#snippet TopCenter()}
    Test Page
  {/snippet}
  {#snippet Middle()}
    This is the test page content.
  {/snippet}
</PageTemplate>
