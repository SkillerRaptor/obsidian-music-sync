<script lang="ts">
  import { SpotifyApi } from "@spotify/web-api-ts-sdk";

  export let enabled: boolean;
  export let authorized: boolean;
  export let spotifySDK: SpotifyApi | undefined;

  $: {
    spotifySDK?.currentUser.profile().then((accountData) => {
      console.log(`Product Type: ${accountData.product}`);
    });
  }

  setInterval(async () => {
    if (spotifySDK) {
      let data = await spotifySDK!.player.getPlaybackState();
      // let event = new CustomEvent("spotifyliveupdate", { detail: data });
      // document.dispatchEvent(event);
    }
  }, 1000);
</script>

{#if enabled}
  {#if authorized}
    <div class="music-sync-song-container">
      <img src="https://dummyimage.com/200x200/000/fff" alt="Song Cover" />
      <span></span>
    </div>
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
