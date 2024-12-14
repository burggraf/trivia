<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
  } from "lucide-svelte";

  const { images = $bindable() } = $props<{
    images: Array<{ url: string }>;
  }>();

  let currentImageIndex = $state(0);
  let isFullscreen = $state(false);
  const totalImages = $derived(images.length);
  const currentImage = $derived(images[currentImageIndex]?.url);

  function nextImage() {
    if (currentImageIndex < totalImages - 1) {
      currentImageIndex++;
    }
  }

  function previousImage() {
    if (currentImageIndex > 0) {
      currentImageIndex--;
    }
  }

  function firstImage() {
    currentImageIndex = 0;
  }

  function lastImage() {
    currentImageIndex = totalImages - 1;
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && isFullscreen) {
      isFullscreen = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if images && images.length > 0}
  <!-- Container with 4:3 aspect ratio -->
  <div class="relative mb-6">
    <div class="w-full pb-[75%] relative">
      <!-- Image container with theme-aware background -->
      <div
        class="absolute inset-0 bg-background rounded-t-lg"
        role="button"
        tabindex="0"
        onclick={toggleFullscreen}
        onkeydown={toggleFullscreen}
        onmousedown={toggleFullscreen}
      >
        <img
          src={currentImage}
          alt={"Property Image"}
          class="w-full h-full object-contain rounded-t-lg cursor-pointer"
        />
      </div>
    </div>
    <!-- Navigation Bar (moved outside the image container) -->
    <div
      class="w-full text-gray-700 p-2 rounded-b-lg flex items-center justify-between"
    >
      <div class="flex items-center gap-1">
        <button
          class="p-1 hover:bg-black/30 rounded-full transition-colors disabled:opacity-50"
          onclick={firstImage}
          disabled={currentImageIndex === 0}
          aria-label="First image"
        >
          <ChevronsLeft size={24} />
        </button>
        <button
          class="p-1 hover:bg-black/30 rounded-full transition-colors disabled:opacity-50"
          onclick={previousImage}
          disabled={currentImageIndex === 0}
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      <span class="text-sm font-medium">
        {currentImageIndex + 1} of {totalImages}
      </span>
      <div class="flex items-center gap-1">
        <button
          class="p-1 hover:bg-black/30 rounded-full transition-colors disabled:opacity-50"
          onclick={nextImage}
          disabled={currentImageIndex === totalImages - 1}
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
        <button
          class="p-1 hover:bg-black/30 rounded-full transition-colors disabled:opacity-50"
          onclick={lastImage}
          disabled={currentImageIndex === totalImages - 1}
          aria-label="Last image"
        >
          <ChevronsRight size={24} />
        </button>
      </div>
    </div>
  </div>
{/if}

{#if isFullscreen}
  <!-- Fullscreen Modal -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
    transition:fade
    onclick={toggleFullscreen}
  >
    <div class="w-full h-full p-4 flex items-center justify-center">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_img_redundant_alt -->
      <img
        src={currentImage}
        alt="Property Image Fullscreen"
        class="max-w-full max-h-full object-contain"
        transition:scale
      />
    </div>
  </div>
{/if}

<style>
  /* Ensure smooth image transitions */
  img {
    transition: all 0.3s ease-in-out;
  }
</style>
