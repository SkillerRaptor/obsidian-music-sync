<script lang="ts">
  import { SpotifyApi } from "@spotify/web-api-ts-sdk";

  export let enabled: boolean;
  export let authorized: boolean;
  export const spotifySDK: SpotifyApi | undefined = undefined;
</script>

{#if enabled}
  {#if authorized}
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
      <h2>Spotify is not authorized</h2>
    </div>
  {/if}
{:else}
  <div class="music-sync-inactive-widget">
    <h2>Spotify widget is not active</h2>
  </div>
{/if}
