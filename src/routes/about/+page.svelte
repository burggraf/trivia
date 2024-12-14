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
          onClick: () => {("item was clicked")},
        },
      ],
    }
  ];
  */
  const arr = Array(50).fill("");
</script>

<!-- <PageTemplate {actionItems} /> -->
<PageTemplate>
  <!--{#snippet TopLeft()}{/snippet}-->
  {#snippet TopCenter()}
    About
  {/snippet}
  <!--{#snippet TopRight()}{/snippet}-->

  {#snippet Middle()}
    About this app<br /><br />
    {#each arr as item}
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam, in
        praesentium. Similique voluptatem vero odio vitae aliquam sit, tenetur
        neque dicta architecto sequi, nulla optio pariatur dolor, alias quaerat
        perferendis.
      </p>
      <br />
    {/each}
    End of content
  {/snippet}

  <!--{#snippet BottomLeft()}{/snippet}-->
  <!--{#snippet BottomCenter()}{/snippet}-->
  <!--{#snippet BottomRight()}{/snippet}-->
</PageTemplate>
