<script lang="ts">
  import type { Game } from "$lib/types/Game";

  let { game } = $props<{ game: Game }>();
</script>

<div>
  <p>Status: {game.gamestate}</p>
</div>
