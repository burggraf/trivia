<!-- richtext-test/+page.svelte -->
<script>
  import RichText from "$lib/components/RichText.svelte";
  let editorContent = $state("<p>Hello, this is a test of the Suneditor!</p>");
</script>

<div class="container">
  <h1>Rich Text Editor Test</h1>

  <div class="editor-container">
    <RichText bind:content={editorContent} height="400px" />
  </div>

  <div class="preview">
    <h2>Preview:</h2>
    <div class="content-preview">
      {@html editorContent}
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #333;
    margin-bottom: 2rem;
  }

  .editor-container {
    margin-bottom: 2rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .preview {
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 4px;
  }

  h2 {
    color: #666;
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }

  .content-preview {
    padding: 1rem;
    background: white;
    border: 1px solid #eee;
    border-radius: 4px;
  }
</style>
