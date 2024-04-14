<script lang="ts">
  import type MusicSync from "src/main";

  export let enabled: boolean;
</script>

{#if enabled}
  <div class="number">
    <span>My number is 1!</span>
  </div>

  <style>
    .number {
      color: red;
    }
  </style>
{:else}
  <div class="music-sync-inactive-widget">
    <h2>This widget is not active</h2>
  </div>
{/if}
