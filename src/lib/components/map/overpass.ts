interface Location {
    lat: number;
    lon: number;
}

interface Place {
    id: number;
    type: string;
    lat: number;
    lon: number;
    tags: {
        name?: string;
        amenity?: string;
        [key: string]: string | undefined;
    };
    distance?: number;
}

export class OverpassService {
    private readonly OVERPASS_API_URL =
        "https://overpass-api.de/api/interpreter";

    /**
     * Fetches nearby places based on a search term and location
     * @param center The center point to search around
     * @param searchTerm The type of place to search for (e.g., "coffee_shop", "restaurant")
     * @param radius Optional search radius in meters (default: 2000)
     * @param limit Optional maximum number of results to return (default: 10)
     * @returns Array of places sorted by distance
     */
    private async findNearbyPlacesWithRadius(
        center: Location,
        searchTerm: string,
        radius: number,
        limit: number
    ): Promise<Place[]> {
        // Convert searchTerm to appropriate amenity value
        const amenity = this.normalizeSearchTerm(searchTerm);

        // Construct Overpass QL query
        const query = `
            [out:json][timeout:25];
            (
                node["amenity"="${amenity}"](around:${radius},${center.lat},${center.lon});
                way["amenity"="${amenity}"](around:${radius},${center.lat},${center.lon});
                relation["amenity"="${amenity}"](around:${radius},${center.lat},${center.lon});
            );
            out body;
            >;
            out skel qt;
        `;

        try {
            const response = await fetch(this.OVERPASS_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `data=${encodeURIComponent(query)}`,
            });

            if (!response.ok) {
                throw new Error(
                    `Overpass API request failed: ${response.statusText}`,
                );
            }

            const data = await response.json();
            const places = data.elements
                .filter((element: any) =>
                    element.type === "node" && element.tags
                )
                .map((element: any) => ({
                    id: element.id,
                    type: element.type,
                    lat: element.lat,
                    lon: element.lon,
                    tags: element.tags,
                    distance: this.calculateDistance(center, {
                        lat: element.lat,
                        lon: element.lon,
                    }),
                }));

            // Sort by distance and return top results
            return places
                .sort((a: Place, b: Place) =>
                    (a.distance || 0) - (b.distance || 0)
                )
                .slice(0, limit);
        } catch (error) {
            console.error("Error fetching places:", error);
            throw error;
        }
    }

    async findNearbyPlaces(
        center: Location,
        searchTerm: string,
        radius?: number,
        limit: number = 10,
    ): Promise<Place[]> {
        let currentRadius = radius || 2000; // Default to 2km if not specified
        
        // First attempt
        let results = await this.findNearbyPlacesWithRadius(center, searchTerm, currentRadius, limit);
        if (results.length > 0) return results;

        // Second attempt with doubled radius
        currentRadius *= 2;
        results = await this.findNearbyPlacesWithRadius(center, searchTerm, currentRadius, limit);
        if (results.length > 0) return results;

        // Third attempt with doubled radius again
        currentRadius *= 2;
        results = await this.findNearbyPlacesWithRadius(center, searchTerm, currentRadius, limit);
        return results; // Return results regardless if empty or not
    }

    /**
     * Normalizes search terms to Overpass API amenity values
     */
    private normalizeSearchTerm(searchTerm: string): string {
        const termMap: { [key: string]: string } = {
            "coffee shop": "cafe",
            "coffee": "cafe",
            "restaurant": "restaurant",
            "bar": "bar",
            "pub": "pub",
            "atm": "atm",
            "bank": "bank",
            "pharmacy": "pharmacy",
            "hospital": "hospital",
            "school": "school",
            "parking": "parking",
        };

        const normalized = searchTerm.toLowerCase().trim();
        return termMap[normalized] || normalized;
    }

    /**
     * Calculates the distance between two points using the Haversine formula
     */
    private calculateDistance(point1: Location, point2: Location): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = point1.lat * Math.PI / 180;
        const φ2 = point2.lat * Math.PI / 180;
        const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
        const Δλ = (point2.lon - point1.lon) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }
}
