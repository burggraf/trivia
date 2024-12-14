<script lang="ts">
  import PageTemplate from "$lib/components/PageTemplate.svelte";
  /*
  const actionItems: any[] = [
    {
      groupName: "Group Header Here",
      groupItems: [
        {
          icon: IconFromLucide,
          label: "Item Label Here",
          onClick: () => {console.log("item was clicked")},
        },
      ],
    }
  ];
  */
</script>

<!-- <PageTemplate {actionItems} /> -->
<PageTemplate>
  <!--{#snippet TopLeft()}{/snippet}-->
  {#snippet TopCenter()}
    Terms of Service
  {/snippet}
  <!--{#snippet TopRight()}{/snippet}-->

  {#snippet Middle()}
    Terms of Service information
  {/snippet}

  <!--{#snippet BottomLeft()}{/snippet}-->
  <!--{#snippet BottomCenter()}{/snippet}-->
  <!--{#snippet BottomRight()}{/snippet}-->
</PageTemplate>
