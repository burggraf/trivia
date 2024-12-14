<!-- Map.svelte -->
<script lang="ts">
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import type { Snippet } from "svelte";
  import { ModeWatcher } from "mode-watcher";

  let {
    map = $bindable<maplibregl.Map | undefined>(undefined),
    content = () => null,
  } = $props<{
    map?: maplibregl.Map;
    content?: Snippet;
  }>();

  let mapInstance: maplibregl.Map | undefined;
  let mapContainer: HTMLDivElement;
  let isDefaultView = $state(true);
  const defaultView = { pitch: 0, bearing: 0 };
  const tiltedView = { pitch: 45, bearing: -17.6 };

  // Default location (New York) as fallback
  const DEFAULT_CENTER = [-74.5, 40];
  const DEFAULT_ZOOM = 13;

  // Function to save map state with debouncing
  function createDebouncedSaveState(map: maplibregl.Map, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout>;

    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const center = map.getCenter();
        const state = {
          lng: center.lng,
          lat: center.lat,
          zoom: map.getZoom(),
          pitch: map.getPitch(),
          bearing: map.getBearing(),
        };
        localStorage.setItem("mapState", JSON.stringify(state));
      }, delay);
    };
  }

  // Function to load saved state
  function loadSavedState() {
    try {
      const saved = localStorage.getItem("mapState");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Error loading saved map state:", e);
    }
    return null;
  }

  let isDarkMode = $state(false);
  
  // Initialize dark mode state
  $effect(() => {
    isDarkMode = document.documentElement.classList.contains("dark");
  });

  // Watch for dark mode changes
  $effect(() => {
    const observer = new MutationObserver(() => {
      isDarkMode = document.documentElement.classList.contains("dark");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  });

  // Update map style when dark mode changes
  $effect(() => {
    if (mapInstance) {
      updateMapStyle();
    }
  });

  function getMapStyle() {
    return {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: isDarkMode
            ? [
                "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png",
              ]
            : ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: isDarkMode
            ? "&copy; OpenStreetMap Contributors, &copy; Stadia Maps"
            : "&copy; OpenStreetMap Contributors",
          maxzoom: 20,
        },
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm",
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    };
  }

  function updateMapStyle() {
    if (!mapInstance) return;
    const style = getMapStyle();
    mapInstance.setStyle(style);
  }

  class ResetNorthControl {
    _map!: maplibregl.Map;
    _container!: HTMLDivElement;
    _button!: HTMLButtonElement;

    onAdd(map: maplibregl.Map) {
      this._map = map;
      this._container = document.createElement("div");
      this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";

      this._button = document.createElement("button");
      this._button.className = "maplibregl-ctrl-icon reset-north-control";
      this._button.setAttribute("aria-label", "Toggle tilted view");
      this._button.title = "Switch to tilted view";

      // Create compass icon SVG
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");

      // Using Lucide Compass path data
      svg.innerHTML = `
        <circle cx="12" cy="12" r="10"/>
        <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>
      `;

      this._button.appendChild(svg);

      this._button.addEventListener("click", () => {
        isDefaultView = !isDefaultView;
        const view = isDefaultView ? defaultView : tiltedView;

        map.easeTo({
          pitch: view.pitch,
          bearing: view.bearing,
          duration: 300,
        });

        // Update tooltip based on current state
        this._button.title = isDefaultView
          ? "Switch to tilted view"
          : "Reset to normal view";
      });

      this._container.appendChild(this._button);
      return this._container;
    }

    onRemove() {
      this._container.parentNode?.removeChild(this._container);
    }
  }

  class SearchControl {
    _map!: maplibregl.Map;
    _container!: HTMLDivElement;
    _button!: HTMLButtonElement;
    _searchBox!: HTMLDivElement;
    _input!: HTMLInputElement;
    _isOpen: boolean = false;

    onAdd(map: maplibregl.Map) {
      this._map = map;
      this._container = document.createElement("div");
      this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";

      // Create search button
      this._button = document.createElement("button");
      this._button.className = "maplibregl-ctrl-icon search-control";
      this._button.setAttribute("aria-label", "Search location");
      this._button.title = "Search location";

      // Create search icon SVG
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");

      // Using Lucide Search path data
      svg.innerHTML = `
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      `;

      this._button.appendChild(svg);

      // Create search box container
      this._searchBox = document.createElement("div");
      this._searchBox.className = "search-box";
      this._searchBox.style.display = "none";

      // Create input element
      this._input = document.createElement("input");
      this._input.type = "text";
      this._input.placeholder = "Enter location...";
      this._input.className = "search-input";

      this._searchBox.appendChild(this._input);

      // Add event listeners
      this._button.addEventListener("click", () => this._toggleSearch());
      this._input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this._performSearch();
        }
      });

      // Close search box when clicking outside
      document.addEventListener("click", (e) => {
        if (!this._container.contains(e.target as Node)) {
          this._closeSearch();
        }
      });

      this._container.appendChild(this._button);
      this._container.appendChild(this._searchBox);
      return this._container;
    }

    onRemove() {
      this._container.parentNode?.removeChild(this._container);
    }

    _toggleSearch() {
      this._isOpen = !this._isOpen;
      this._searchBox.style.display = this._isOpen ? "block" : "none";
      if (this._isOpen) {
        this._input.focus();
      }
    }

    _closeSearch() {
      this._isOpen = false;
      this._searchBox.style.display = "none";
    }

    async _performSearch() {
      const query = this._input.value.trim();
      if (!query) return;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}`,
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          this._map.flyTo({
            center: [parseFloat(lon), parseFloat(lat)],
            zoom: 17,
            duration: 2000,
          });
          this._closeSearch();
          this._input.value = "";
        }
      } catch (error) {
        console.error("Error searching location:", error);
      }
    }
  }

  $effect(() => {
    if (!mapContainer) return;

    // Initialize map with saved state or defaults
    const savedState = loadSavedState();
    const initialState = savedState || {
      lng: DEFAULT_CENTER[0],
      lat: DEFAULT_CENTER[1],
      zoom: DEFAULT_ZOOM,
      pitch: 0,
      bearing: 0,
    };

    if (!mapInstance) {
      mapInstance = new maplibregl.Map({
        container: mapContainer,
        style: getMapStyle(),
        center: [initialState.lng, initialState.lat],
        zoom: initialState.zoom,
        pitch: initialState.pitch,
        bearing: initialState.bearing,
        antialias: true,
      });

      // Create debounced save function
      const saveState = createDebouncedSaveState(mapInstance, 1000);

      // Add event listeners for map movement
      mapInstance.on("moveend", saveState);
      mapInstance.on("zoomend", saveState);
      mapInstance.on("pitchend", saveState);
      mapInstance.on("rotateend", saveState);

      // Add geolocate control
      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });
      mapInstance.addControl(geolocate, "top-right");

      // Only trigger geolocation if there's no saved state
      mapInstance.on("load", () => {
        if (!savedState) {
          geolocate.trigger();
        }
      });

      // Add custom reset north control
      mapInstance.addControl(new ResetNorthControl(), "top-right");

      // Add custom search control
      mapInstance.addControl(new SearchControl(), "top-right");

      // Add navigation controls (without compass since we have our custom one)
      mapInstance.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showCompass: false,
        }),
        "top-right",
      );

      // Add scale control
      mapInstance.addControl(
        new maplibregl.ScaleControl({
          maxWidth: 80,
          unit: "metric",
        }),
        "bottom-left",
      );

      // Add fullscreen control
      mapInstance.addControl(new maplibregl.FullscreenControl(), "top-right");

      // Ensure map fills container after initialization
      mapInstance.resize();

      map = mapInstance;
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
        map = undefined;
      }
    };
  });
</script>

<div bind:this={mapContainer} class="map-container">
  {@render content?.()}
</div>

<style>
  :global(.maplibregl-ctrl-icon) {
    filter: brightness(0);
  }
  
  :global(.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon) {
    filter: none;
  }

  .map-container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(100% + 20px);
  }

  :global(.maplibregl-canvas) {
    width: 100% !important;
    height: 100% !important;
  }

  :global(.maplibregl-ctrl-top-right) {
    top: 60px !important;
  }

  :global(.maplibregl-ctrl-geolocate) {
    background-color: white;
    border-radius: 4px;
  }

  :global(.reset-north-control) {
    background: none;
    border: 0;
    cursor: pointer;
    display: block;
    padding: 5px;
    width: 30px;
    height: 30px;
  }

  :global(.reset-north-control:hover) {
    background-color: rgba(0, 0, 0, 0.05);
  }

  :global(.reset-north-control svg) {
    display: block;
    margin: 0 auto;
  }

  :global(.search-control) {
    background: none;
    border: 0;
    cursor: pointer;
    display: block;
    padding: 5px;
    width: 30px;
    height: 30px;
  }

  :global(.search-control:hover) {
    background-color: rgba(0, 0, 0, 0.05);
  }

  :global(.search-control svg) {
    display: block;
    margin: 0 auto;
  }

  :global(.search-box) {
    position: absolute;
    right: 40px;
    top: 0;
    background-color: white;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  :global(.search-input) {
    width: 300px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }

  :global(.search-input:focus) {
    outline: none;
    border-color: #4a90e2;
  }
</style>
