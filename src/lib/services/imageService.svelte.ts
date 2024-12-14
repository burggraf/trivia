import { supabase } from "./supabase";

function sanitizeFileName(fileName: string): string {
    // Replace spaces with underscores and remove any special characters
    return fileName
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .toLowerCase();
}

async function getNextAvailableFilename(basePath: string, filename: string): Promise<string> {
    // Split filename into name and extension
    const lastDotIndex = filename.lastIndexOf('.');
    const name = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
    const ext = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';

    // Check if the name already ends with -number
    const match = name.match(/(.*?)-(\d+)$/);
    const baseName = match ? match[1] : name;
    let currentNum = match ? parseInt(match[2]) : 0;

    // List all files in the directory
    const { data: existingFiles } = await supabase.storage
        .from("property-images")
        .list(basePath);

    if (!existingFiles) return `${baseName}-1${ext}`;

    // Find the highest number for this base filename
    const regex = new RegExp(`^${baseName}-\\d+${ext}$`);
    const numbers = existingFiles
        .map(file => {
            const match = file.name.match(new RegExp(`^${baseName}-(\\d+)${ext}$`));
            return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);

    const highestNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    currentNum = highestNum + 1;

    return `${baseName}-${currentNum}${ext}`;
}

export async function uploadImage(file: File, propertyId: string) {
    console.log("Uploading image for property:", propertyId, file);

    try {
        // Create a sanitized base filename
        const sanitizedFileName = sanitizeFileName(file.name);
        const basePath = `properties/${propertyId}`;

        // Get the next available filename
        const nextFileName = await getNextAvailableFilename(basePath, sanitizedFileName);
        const filePath = `${basePath}/${nextFileName}`;

        // Check if file exists first
        const { data: existingFile } = await supabase.storage
            .from("property-images")
            .list(`properties/${propertyId}`);

        const fileExists = existingFile?.some(f => f.name === nextFileName);

        if (fileExists) {
            // If file exists, delete it first
            await supabase.storage
                .from("property-images")
                .remove([filePath]);
        }

        // Upload the new file
        const { data, error } = await supabase.storage
            .from("property-images")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: true,
                contentType: file.type
            });

        if (error) {
            console.error("Error uploading to Supabase:", error);
            return {
                success: false,
                error: error.message,
                name: nextFileName
            };
        }

        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from("property-images")
            .getPublicUrl(filePath);

        return {
            success: true,
            url: urlData.publicUrl,
            name: nextFileName
        };
    } catch (error) {
        console.error("Error in uploadImage:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            name: sanitizeFileName(file.name)
        };
    }
}

async function getCurrentMetadata(propertyId: string) {
    const { data, error } = await supabase
        .from("properties")
        .select("metadata")
        .eq("id", propertyId)
        .single();
    
    if (error) {
        console.error("Error fetching property metadata:", error);
        return null;
    }
    
    return data?.metadata?.images || [];
}

async function updatePropertyImageMetadata(propertyId: string) {
    // Get current storage images
    const { images: storageImages } = await getPropertyImages(propertyId);
    
    // Get current metadata images array (preserves order)
    const currentMetadataImages = await getCurrentMetadata(propertyId);
    
    // Create a map of existing images by name for quick lookup
    const existingImageMap = new Map(
        currentMetadataImages.map((img: { name: string }) => [img.name, img])
    );
    
    // Filter out any images that no longer exist in storage
    const validExistingImages = currentMetadataImages.filter(
        (img: { name: string }) => storageImages.some(sImg => sImg.name === img.name)
    );
    
    // Add any new images that aren't in the metadata yet
    const newImages = storageImages.filter(
        img => !existingImageMap.has(img.name)
    );
    
    // Combine existing (ordered) images with new images
    const updatedImages = [...validExistingImages, ...newImages];
    
    const { error } = await supabase
        .from("properties")
        .update({
            metadata: {
                images: updatedImages
            }
        })
        .eq("id", propertyId);

    if (error) {
        console.error("Error updating property metadata:", error);
    }
    return { success: !error, error };
}

export async function uploadImages(files: File[], propertyId: string) {
    console.log("Uploading images for property:", propertyId, files);

    try {
        if (!Array.isArray(files)) {
            throw new Error("Files must be an array");
        }

        // Upload all files in parallel
        const results = await Promise.all(
            files.map((file) => uploadImage(file, propertyId))
        );

        // Check if all uploads were successful
        const allSuccessful = results.every((result) => result.success);

        // Update property metadata with new image list
        await updatePropertyImageMetadata(propertyId);

        // Format the response to match what PropertyImages expects
        const images = results.map((result) => ({
            url: result.url,
            name: result.name || 'image.jpg'
        }));

        return {
            success: allSuccessful,
            images,
            error: allSuccessful ? null : "Failed to upload one or more images"
        };
    } catch (error) {
        console.error("Error uploading images:", error);
        return {
            success: false,
            images: [],
            error: error instanceof Error ? error.message : "Failed to upload images"
        };
    }
}

export async function getPropertyImages(propertyId: string) {
    // List all files in the property's directory
    const { data: files, error } = await supabase.storage
        .from("property-images")
        .list(`properties/${propertyId}`);
    console.log("getPropertyImages:", files);

    if (error) {
        console.error("Error listing property images:", error);
        return {
            success: false,
            error: error.message,
            images: [],
        };
    }

    // Get public URLs for all files
    const images = files.map((file) => {
        const { data } = supabase.storage
            .from("property-images")
            .getPublicUrl(`properties/${propertyId}/${file.name}`);
        return {
            url: data.publicUrl,
            name: file.name,
        };
    });

    return {
        success: true,
        images,
    };
}

export async function deletePropertyImage(
    propertyId: string,
    fileName: string,
) {
    // First get the current metadata to preserve order
    const currentMetadataImages = await getCurrentMetadata(propertyId);
    
    // Remove the file from storage
    const { error: storageError } = await supabase.storage
        .from("property-images")
        .remove([`properties/${propertyId}/${fileName}`]);

    if (storageError) {
        console.error("Error deleting image:", storageError);
        return {
            success: false,
            error: storageError.message,
        };
    }

    // Update metadata by removing only the deleted image
    const updatedImages = currentMetadataImages.filter(
        (img: { name: string }) => img.name !== fileName
    );
    
    const { error: metadataError } = await supabase
        .from("properties")
        .update({
            metadata: {
                images: updatedImages
            }
        })
        .eq("id", propertyId);

    if (metadataError) {
        console.error("Error updating metadata after delete:", metadataError);
        return {
            success: false,
            error: metadataError.message,
        };
    }

    return {
        success: true,
    };
}

export async function updatePropertyImageOrder(propertyId: string, images: { url: string; name: string }[]) {
    const { error } = await supabase
        .from("properties")
        .update({
            metadata: {
                images,
            },
        })
        .eq("id", propertyId);

    if (error) {
        console.error("Error updating image order:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
