import { supabase } from "../_shared/supabase_client.ts";
import type { User } from "@supabase/supabase-js";

interface Payload {
    id: string;
}

interface GeoapifyResponse {
    results: Array<{
        lat: number;
        lon: number;
    }>;
}

export const property_geocode = async (
    payload: Payload,
    user: User | null,
): Promise<{ data: unknown; error: unknown | null }> => {
    try {
        if (!user) {
            return { data: null, error: "User not found" };
        }

        const { id } = payload;
        if (!id) {
            return { data: null, error: "Property ID is required" };
        }

        // Fetch the property's address
        const { data: property, error: propertyError } = await supabase
            .from("properties")
            .select("address, city, region, country, postal")
            .eq("id", id)
            .single();

        if (propertyError) {
            return { data: null, error: propertyError };
        }
        if (!property) {
            return { data: null, error: "Property not found" };
        }

        // Construct the address string
        const addressString = `${property.address || ""}, ${
            property.city || ""
        }, ${property.region || ""}, ${property.postal || ""}, ${
            property.country || ""
        }`
            .replace(/,\s+,/g, ",");

        // Call Geoapify API
        const geoapifyApiKey = Deno.env.get("GEOAPIFY_API_KEY");
        if (!geoapifyApiKey) {
            return { data: null, error: "GEOAPIFY_API_KEY not configured" };
        }

        const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${
            encodeURIComponent(addressString)
        }&lang=en&limit=1&format=json&apiKey=${geoapifyApiKey}`;
        const geoResponse = await fetch(geocodeUrl);
        const geoData = (await geoResponse.json()) as GeoapifyResponse;

        if (!geoData.results?.[0]) {
            return { data: null, error: "No geocoding results found" };
        }

        const { lat, lon } = geoData.results[0];

        // Update the property with the coordinates
        const { data: updateData, error: updateError } = await supabase
            .from("properties")
            .update({
                lat: lat,
                lng: lon,
            })
            .eq("id", id)
            .select()
            .single();

        return { data: { latitude: lat, longitude: lon }, error: null };
    } catch (error) {
        return { data: null, error: error || "An unexpected error occurred" };
    }
};
