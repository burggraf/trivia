<script lang="ts">
  import type { Property } from "$lib/services/propertyService.svelte";
  import {
    uploadImages,
    deletePropertyImage,
    updatePropertyImageOrder,
  } from "$lib/services/imageService.svelte";
  import ImageModal from "./ImageModal.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Trash2 } from "lucide-svelte";

  let { property, onReload } = $props<{
    property: Partial<Property>;
    onReload: () => void;
  }>();

  let dragActive = $state(false);
  let files = $state<FileList | null>(null);
  let previews = $state<string[]>([]);
  let errorMessage = $state<string | null>(null);
  let isUploading = $state(false);
  let existingImages = $state<{ url: string; name: string }[]>([]);
  let isLoading = $state(true);
  let isDeletingImage = $state<{ [key: string]: boolean }>({});
  let selectedImage = $state<string | null>(null);
  let dragSource = $state<number | null>(null);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];

  function validateFiles(fileList: FileList): boolean {
    const invalidFiles = Array.from(fileList).filter(
      (file) => !ALLOWED_TYPES.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      errorMessage = `Invalid file type(s): ${invalidFiles.map((f) => f.name).join(", ")}. Only JPG, PNG, and GIF files are allowed.`;
      return false;
    }

    errorMessage = null;
    return true;
  }

  function createPreviews(fileList: FileList) {
    if (!validateFiles(fileList)) {
      return;
    }

    // Create new preview URLs for the new files
    const newPreviews = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));

    // Set the new files directly instead of combining
    files = fileList;

    // Set the new previews directly
    previews = newPreviews;
  }

  function handleDrag(e: DragEvent) {
    e.preventDefault();
    dragActive = e.type === "dragenter";
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragActive = false;
    if (e.dataTransfer?.files) {
      createPreviews(e.dataTransfer.files);
    }
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      createPreviews(target.files);
    }
  }

  function openModal(url: string, e: Event) {
    e.preventDefault();
    selectedImage = url;
  }

  function closeModal() {
    selectedImage = null;
  }

  async function handleImageUpdate(detail: {
    croppedImageUrl: string;
    blob: Blob;
    cropData: any;
    originalImageUrl: string | null;
  }) {
    try {
      if (!property.id) return;

      isUploading = true;
      errorMessage = null;

      // Get the original image name from the URL or create a new one
      let originalImageName = detail.originalImageUrl?.split("/").pop();
      if (!originalImageName || originalImageName.includes("?")) {
        originalImageName = `image-${Date.now()}.jpg`;
      }

      // Create a File from the Blob with proper MIME type
      const file = new File([detail.blob], originalImageName, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      // Create a proper array with the single file
      const filesArray = [file];

      // Upload the cropped image
      const result = await uploadImages(filesArray, property.id);

      if (result.success) {
        // Add the new image to the existing images array
        existingImages = [...existingImages, result.images[0]];

        // Update the selected image to show the new version
        selectedImage = result.images[0].url;

        onReload();
      } else {
        errorMessage = `Failed to upload cropped image: ${result.error}`;
      }
    } catch (error) {
      console.error("Error uploading cropped image:", error);
      errorMessage = "Failed to upload cropped image. Please try again.";
    } finally {
      isUploading = false;
    }
  }

  function handleDragStart(e: DragEvent, index: number) {
    dragSource = index;
    if (e.dataTransfer && e.target instanceof HTMLElement) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index.toString());

      // Find the image element within the dragged container
      const container = e.target;
      const imgElement = container.querySelector("img");

      if (imgElement) {
        // Use the container itself as the drag image
        // This ensures we get the entire styled container with the image
        e.dataTransfer.setDragImage(
          container,
          container.offsetWidth / 2,
          container.offsetHeight / 2,
        );
      }
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (dragSource === index) return;

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("bg-gray-100");
    }
  }

  function handleDragLeave(e: DragEvent) {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("bg-gray-100");
    }
  }

  function handleDragEnd(e: DragEvent) {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("bg-gray-100");
    }
    dragSource = null;
  }

  async function handleImageDrop(e: DragEvent, dropIndex: number) {
    e.preventDefault();
    if (dragSource === null || dragSource === dropIndex || !property.id) return;

    const items = [...existingImages];
    const [removed] = items.splice(dragSource, 1);
    items.splice(dropIndex, 0, removed);
    existingImages = items;

    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("bg-gray-100");
    }
    dragSource = null;

    // Save the new order using the image service
    const { success, error } = await updatePropertyImageOrder(
      property.id,
      items,
    );

    if (!success) {
      console.error("Error updating image order:", error);
      errorMessage = "Failed to save the new image order";
    }
  }

  function removeFile(index: number, e: Event) {
    e.preventDefault();
    if (!files) return;

    const dt = new DataTransfer();
    Array.from(files).forEach((file, i) => {
      if (i !== index) dt.items.add(file);
    });
    files = dt.files;

    // Revoke the URL for the removed preview to prevent memory leaks
    URL.revokeObjectURL(previews[index]);
    previews = previews.filter((_, i) => i !== index);
  }

  async function handleUpload() {
    if (!files || !property.id) return;

    try {
      isUploading = true;
      errorMessage = null;

      const result = await uploadImages(Array.from(files), property.id);

      if (result.success) {
        // Clear the files and previews after successful upload
        files = null;
        previews.forEach((url) => URL.revokeObjectURL(url));
        previews = [];
        console.log("Upload successful:", result.urls);

        // Refresh the list of existing images
        await loadExistingImages();
        onReload();
      } else if (result.error) {
        errorMessage = result.error;
      }
    } catch (error) {
      console.error("Upload failed:", error);
      errorMessage = "Failed to upload images. Please try again.";
    } finally {
      isUploading = false;
    }
  }

  // Load existing images when component mounts
  async function loadExistingImages() {
    if (!property.id) return;

    try {
      isLoading = true;
      errorMessage = null;

      if (property.metadata?.images) {
        existingImages = property.metadata.images;
      } else {
        existingImages = [];
      }
    } catch (error) {
      console.error("Error loading images:", error);
      errorMessage = "Failed to load existing images. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  async function handleDeleteImage(e: Event, fileName: string) {
    e.preventDefault();
    if (!property.id) return;

    try {
      isDeletingImage[fileName] = true;
      const result = await deletePropertyImage(property.id, fileName);

      if (result.success) {
        // Refresh the list after successful deletion
        existingImages = existingImages.filter((img) => img.name !== fileName);
        await loadExistingImages();
        onReload();
      } else {
        errorMessage = `Failed to delete image: ${result.error}`;
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      errorMessage = "Failed to delete image. Please try again.";
    } finally {
      isDeletingImage[fileName] = false;
    }
  }

  // Load images when property changes
  $effect(() => {
    if (property.id) {
      loadExistingImages();
    } else {
      // Clear existing images if no property id
      existingImages = [];
    }
  });

  // Cleanup previews when component is destroyed
  $effect.root(() => {
    if (previews.length > 0) {
      return () => {
        previews.forEach((url) => URL.revokeObjectURL(url));
      };
    }
  });
</script>

<div class="p-4">
  <h2 class="text-2xl font-semibold mb-4">Property Images</h2>

  {#if isLoading}
    <div class="text-center py-4">
      <span class="text-gray-600">Loading existing images...</span>
    </div>
  {:else if existingImages.length > 0}
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Existing Images:</h3>
      <div
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        role="list"
      >
        {#each existingImages as image, i}
          <div
            class="relative aspect-square transition-colors"
            draggable="true"
            ondragstart={(e) => handleDragStart(e, i)}
            ondragover={(e) => handleDragOver(e, i)}
            ondragleave={(e) => handleDragLeave(e)}
            ondragend={(e) => handleDragEnd(e)}
            ondrop={(e) => handleImageDrop(e, i)}
            role="listitem"
          >
            <button
              class="w-full h-40 p-0 border-0 bg-transparent"
              onclick={(e) => openModal(image.url, e)}
              onkeydown={(e) => {
                if (e.key === "Enter") openModal(image.url, e);
              }}
            >
              <img
                src={image.url}
                alt={`Property photo ${i + 1}`}
                class="w-full h-full object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                draggable="false"
              />
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gray-500 hover:bg-gray-600 text-white
                     shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                     disabled:opacity-50"
              onclick={(e) => handleDeleteImage(e, image.name)}
              disabled={isDeletingImage[image.name]}
              aria-label="Delete image"
            >
              {#if isDeletingImage[image.name]}
                <span class="loading loading-spinner loading-xs"></span>
              {:else}
                <Trash2 class="h-4 w-4" />
              {/if}
            </Button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div
    class="relative border-2 border-dashed rounded-lg p-8 text-center
           {dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}"
    ondragenter={(e) => handleDrag(e)}
    ondragleave={(e) => handleDrag(e)}
    ondragover={(e) => handleDrag(e)}
    ondrop={(e) => handleDrop(e)}
    role="region"
    aria-label="Image upload drop zone"
  >
    <input
      type="file"
      id="image-upload"
      multiple
      accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      onchange={(e) => handleChange(e)}
    />

    <div class="space-y-4">
      <div class="text-5xl text-gray-400">
        <i class="fas fa-cloud-upload-alt"></i>
      </div>
      <div class="text-lg">
        <span class="font-semibold">Drop your images here</span>
        <span class="text-gray-500"> or click to select</span>
      </div>
      <div class="text-sm text-gray-500">
        Supports: JPG, PNG, GIF only (Max 10MB each)
      </div>
    </div>
  </div>

  {#if errorMessage}
    <div class="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
      {errorMessage}
    </div>
  {/if}

  {#if files}
    <div class="mt-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Selected Files:</h3>
        <button
          type="button"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={(e) => handleUpload()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Images"}
        </button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each Array.from(files) as file, i}
          <div class="space-y-2 relative group">
            {#if previews[i]}
              <div class="relative">
                <img
                  src={previews[i]}
                  alt={file.name}
                  class="w-full h-40 object-cover rounded-lg shadow-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gray-500 hover:bg-gray-600 text-white
                         shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  onclick={(e) => removeFile(i, e)}
                  aria-label="Remove image"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            {/if}
            <div class="text-sm text-gray-600 truncate">
              {file.name} ({Math.round(file.size / 1024)}KB)
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if selectedImage}
    <ImageModal
      imageUrl={selectedImage}
      onClose={closeModal}
      onUpdate={handleImageUpdate}
    />
  {/if}
</div>
