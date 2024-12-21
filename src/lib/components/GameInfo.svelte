<script lang="ts">
  import type { Game } from "$lib/types/Game";

  let { game } = $props<{ game: Game }>();
</script>

<div>
  <h1>Game ID: {game.id}</h1>
  <p>Created At: {new Date(game.created_at).toLocaleString()}</p>
  <p>Status: {game.gamestate}</p>
</div>
