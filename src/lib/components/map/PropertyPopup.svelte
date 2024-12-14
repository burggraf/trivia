<!-- PropertyPopup.svelte -->
<script lang="ts">
  import type { Property } from "@/services/propertyService.svelte";

  const { property } = $props<{
    property: Property;
  }>();
</script>

<div class="popup-content">
  <h3>{property.address}</h3>
  <p class="city">{property.city}</p>
  <p class="status">{property.status}</p>
  <p class="price">${property.list_price?.toLocaleString()}</p>
  <div class="specs">
    <span>{property.beds} beds</span>
    <span>{property.baths} baths</span>
  </div>
</div>

<style>
  .popup-content {
    padding: 12px;
    min-width: 200px;
  }
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
  }
  p {
    margin: 4px 0;
    font-size: 14px;
  }
  .city {
    color: #666;
  }
  .status {
    text-transform: capitalize;
    color: #2563eb;
    font-weight: 500;
  }
  .price {
    font-weight: 600;
    font-size: 16px;
    margin: 8px 0;
  }
  .specs {
    display: flex;
    gap: 12px;
    color: #666;
  }
</style>
