<script lang="ts">
  import { marked } from "marked";

  let { content = "" } = $props();

  let parsedContent = $derived(marked.parse(content));
</script>

<div class="html-content">
  {@html parsedContent}
</div>

<style>
  .html-content {
    width: 100%;
  }

  .html-content :global(h1) {
    font-size: 2em;
    font-weight: bold;
    margin: 0.67em 0;
    color: inherit;
  }

  .html-content :global(h2) {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0.83em 0;
    color: inherit;
  }

  .html-content :global(h3) {
    font-size: 1.17em;
    font-weight: bold;
    margin: 1em 0;
    color: inherit;
  }

  .html-content :global(p) {
    margin: 1em 0;
    line-height: 1.5;
  }

  .html-content :global(ul),
  .html-content :global(ol) {
    margin: 1em 0;
    padding-left: 40px;
  }

  .html-content :global(ul) {
    list-style-type: disc;
  }

  .html-content :global(ol) {
    list-style-type: decimal;
  }

  .html-content :global(li) {
    margin: 0.5em 0;
  }

  .html-content :global(strong) {
    font-weight: bold;
  }

  .html-content :global(em) {
    font-style: italic;
  }

  .html-content :global(a) {
    color: #0066cc;
    text-decoration: underline;
  }

  .html-content :global(blockquote) {
    margin: 1em 40px;
    padding-left: 1em;
    border-left: 3px solid #ccc;
    color: #666;
  }

  .html-content :global(pre) {
    white-space: pre-wrap;
    margin: 1em 0;
    padding: 1em;
    background-color: #f5f5f5;
    border-radius: 4px;
  }

  .html-content :global(code) {
    font-family: monospace;
    background-color: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }

  .html-content :global(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }

  .html-content :global(th),
  .html-content :global(td) {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  .html-content :global(th) {
    background-color: #f5f5f5;
  }
</style>
