<script lang="ts">
  import Cropper from "cropperjs";
  import "cropperjs/dist/cropper.css";

  let { imageUrl, onClose, onUpdate } = $props<{
    imageUrl: string;
    onClose: () => void;
    onUpdate: (detail: {
      croppedImageUrl: string;
      blob: Blob;
      cropData: any;
      originalImageUrl: string | null;
    }) => void;
  }>();

  let imageElement: HTMLImageElement;
  let cropper: Cropper;
  let rotation = 0;
  let zoom = 1;
  let isCropMode = $state(true);
  let savedCropData: any = null;
  let isProcessing = $state(false);

  let buttonText = $derived(isProcessing ? "Processing..." : "Apply Changes");
  let modeText = $derived(isCropMode ? "Mode: Crop" : "Mode: Move");
  const rotateLeftText = "Rotate Left";
  const rotateRightText = "Rotate Right";
  const zoomInText = "Zoom In";
  const zoomOutText = "Zoom Out";
  const resetText = "Reset";

  function initializeCropper() {
    if (!imageElement) return;

    if (cropper) {
      cropper.destroy();
    }

    cropper = new Cropper(imageElement, {
      viewMode: 2,
      dragMode: "crop",
      aspectRatio: NaN, // Allow free aspect ratio
      autoCropArea: 1,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false, // Disable double-click mode switching
      responsive: true,
      rotatable: true,
      scalable: true,
      zoomable: true,
    });
  }

  function handleImageLoad() {
    initializeCropper();
  }

  function handleBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains("modal-backdrop")) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }

  function handleRotateLeft() {
    if (cropper) {
      cropper.rotate(-90);
    }
  }

  function handleRotateRight() {
    if (cropper) {
      cropper.rotate(90);
    }
  }

  function handleZoomIn() {
    if (cropper) {
      cropper.zoom(0.1);
    }
  }

  function handleZoomOut() {
    if (cropper) {
      cropper.zoom(-0.1);
    }
  }

  function resetChanges() {
    if (cropper) {
      cropper.reset();
      isCropMode = true;
      cropper.setDragMode("crop");
      showCropBox();
    }
  }

  function hideCropBox() {
    if (cropper) {
      savedCropData = cropper.getData();
      cropper.clear();
      cropper.crop();
      const cropBox = document.querySelector(".cropper-crop-box");
      if (cropBox) {
        (cropBox as HTMLElement).style.display = "none";
      }
      const dragElements = document.querySelectorAll(".cropper-drag-box");
      dragElements.forEach((el) => {
        (el as HTMLElement).style.cursor = "move";
      });
      // Remove the dark overlay
      const modalEl = document.querySelector(".cropper-modal");
      if (modalEl) {
        (modalEl as HTMLElement).style.opacity = "0";
      }
      const viewBox = document.querySelector(".cropper-view-box");
      if (viewBox) {
        (viewBox as HTMLElement).style.outline = "none";
      }
    }
  }

  function showCropBox() {
    if (cropper) {
      if (savedCropData) {
        cropper.setData(savedCropData);
      }
      const cropBox = document.querySelector(".cropper-crop-box");
      if (cropBox) {
        (cropBox as HTMLElement).style.display = "";
      }
      const dragElements = document.querySelectorAll(".cropper-drag-box");
      dragElements.forEach((el) => {
        (el as HTMLElement).style.cursor = "crosshair";
      });
      // Restore the dark overlay
      const modalEl = document.querySelector(".cropper-modal");
      if (modalEl) {
        (modalEl as HTMLElement).style.opacity = "0.5";
      }
      const viewBox = document.querySelector(".cropper-view-box");
      if (viewBox) {
        (viewBox as HTMLElement).style.outline = "";
      }
    }
  }

  function toggleDragMode() {
    if (cropper) {
      isCropMode = !isCropMode;
      if (isCropMode) {
        cropper.setDragMode("crop");
        showCropBox();
      } else {
        cropper.setDragMode("move");
        hideCropBox();
      }
    }
  }

  async function applyChanges() {
    if (!cropper) return;

    try {
      isProcessing = true;

      // Get the cropped canvas with the current rotation and zoom applied
      const canvas = cropper.getCroppedCanvas({
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: "#fff",
      });

      if (!canvas) {
        throw new Error("Failed to create cropped canvas");
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/jpeg",
          0.9,
        );
      });

      // Create object URL for the blob
      const croppedImageUrl = URL.createObjectURL(blob);

      // Emit the cropped image data to parent with the original image URL
      onUpdate({
        croppedImageUrl,
        blob,
        cropData: cropper.getData(),
        originalImageUrl: imageUrl || null,
      });

      // Close the modal after successful update
      onClose();
    } catch (error) {
      console.error("Error applying changes:", error);
      // You might want to show an error message to the user here
    } finally {
      isProcessing = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  role="dialog"
  aria-modal="true"
  onclick={handleBackdropClick}
>
  <div
    class="relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden"
  >
    <button
      type="button"
      class="absolute top-2 right-2 z-10 bg-gray-800 bg-opacity-50 text-white rounded-full w-8 h-8
             flex items-center justify-center hover:bg-opacity-75 focus:outline-none
             focus:ring-2 focus:ring-white"
      onclick={onClose}
      aria-label="Close modal"
    >
      ×
    </button>

    <div class="relative h-[70vh]">
      <!-- svelte-ignore a11y_img_redundant_alt -->
      <img
        bind:this={imageElement}
        src={imageUrl}
        alt="Image to crop"
        class="max-h-full"
        onload={handleImageLoad}
      />
    </div>

    <div
      class="bg-gray-800 bg-opacity-75 p-4 flex justify-center items-center space-x-4"
    >
      <div class="flex-1 flex justify-end space-x-4">
        <button
          class="bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-200 min-w-[100px]"
          onclick={toggleDragMode}
        >
          {modeText}
        </button>
        <button
          class="bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
          onclick={handleRotateLeft}
        >
          {rotateLeftText}
        </button>
        <button
          class="bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
          onclick={handleRotateRight}
        >
          {rotateRightText}
        </button>
        <button
          class="bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
          onclick={handleZoomIn}
        >
          {zoomInText}
        </button>
        <button
          class="bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
          onclick={handleZoomOut}
        >
          {zoomOutText}
        </button>
        <button
          class="bg-white text-gray-800 px-3 py-1 rounded hover:bg-gray-200"
          onclick={resetChanges}
        >
          {resetText}
        </button>
      </div>
      <div class="flex-none">
        <button
          class="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          onclick={applyChanges}
          disabled={isProcessing}
        >
          {buttonText}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  /* Hide the original image after Cropper initialization */
  :global(.cropper-container) {
    width: 100% !important;
    height: 100% !important;
  }

  :global(.cropper-crop-box) {
    transition: opacity 0.2s ease-in-out;
  }

  :global(.cropper-modal) {
    transition: opacity 0.2s ease-in-out;
  }
</style>
