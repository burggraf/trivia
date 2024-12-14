<script lang="ts">
  import type { Property } from "$lib/services/propertyService.svelte";
  import PropertyDetails from "./PropertyDetails.svelte";
  import { fade, scale } from "svelte/transition";
  import { X } from "lucide-svelte";

  let { property, isOpen } = $props<{
    property: Property;
    isOpen: boolean;
  }>();

  function handleClose() {
    isOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      handleClose();
    }
  }

  function handleModalClick(event: Event) {
    event.stopPropagation();
  }
</script>

{#if isOpen}
  <!-- Modal Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center"
    transition:fade
    onclick={handleClose}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <!-- Modal Content -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 relative"
      transition:scale
      onclick={handleModalClick}
      role="button"
      tabindex="0"
    >
      <!-- Close Button -->
      <button
        class="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        onclick={handleClose}
        aria-label="Close modal"
      >
        <X size={24} />
      </button>

      <PropertyDetails {property} />
    </div>
  </div>
{/if}

<style>
  /* Add smooth scrollbar for the modal content */
  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }

  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f7fafc;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: #cbd5e0;
    border-radius: 4px;
  }
</style>
