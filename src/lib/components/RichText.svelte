<!-- RichText.svelte -->
<script lang="ts">
  import { Sun } from "lucide-svelte";
  import Suneditor from "suneditor";
  import plugins from "suneditor/src/plugins";
  import "suneditor/dist/css/suneditor.min.css";
  import { onMount, onDestroy } from "svelte";
  import type { SunEditorOptions } from "suneditor/src/options";
  import SunEditorCore from "suneditor/src/lib/core";

  let editor: SunEditorCore;
  let editorElement: HTMLElement;

  // Props using new Svelte 5 syntax
  let { 
    content = $bindable(""), 
    height = "300px", 
    buttonList = [
      ["undo", "redo"],
      ["font", "fontSize", "formatBlock"],
      ["bold", "underline", "italic", "strike", "subscript", "superscript"],
      ["removeFormat"],
      ["fontColor", "hiliteColor"],
      ["outdent", "indent"],
      ["align", "horizontalRule", "list", "table"],
      ["link", "image"],
      ["fullScreen", "showBlocks", "codeView"],
    ]
  } = $props();

  $effect(() => {
    if (editor) {
      editor.setContents(content);
    }
  });

  onMount(() => {
    editor = Suneditor.create(editorElement, {
      plugins: Object.values(plugins),
      height,
      buttonList,
      defaultStyle: "font-family: Arial; font-size: 14px;",
      popupDisplay: "full",
      position: "fixed",
      iframe: false,
    });
    editor.onChange = function (contents) {
      console.log("Contents changed:", contents);
      content = contents;  // This will update the bound value
    };
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<div bind:this={editorElement}></div>

<style>
  div {
    width: 100%;
  }

  :global(.sun-editor) {
    z-index: 9999 !important;
    position: relative !important;
  }
  
  :global(.sun-editor-common) {
    z-index: 9999 !important;
  }

  :global(.se-container) {
    z-index: 9999 !important;
  }

  :global(.se-wrapper) {
    z-index: 9999 !important;
  }

  :global(.se-dialog) {
    z-index: 10000 !important;
  }

  :global(.se-dialog-content) {
    z-index: 10000 !important;
  }

  :global(.se-dropdown-menu) {
    z-index: 10000 !important;
  }

  :global(.se-dropdown-content) {
    z-index: 10000 !important;
  }

  :global(.se-tooltip) {
    z-index: 10000 !important;
  }

  :global(.se-menu-list) {
    z-index: 10000 !important;
  }

  :global(.se-toolbar) {
    z-index: 10000 !important;
    position: relative !important;
  }
</style>
