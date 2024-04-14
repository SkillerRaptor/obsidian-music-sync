<script lang="ts">
  import {
    SpotifyApi,
    type PlaybackState,
    type Track,
  } from "@spotify/web-api-ts-sdk";
  import { Notice } from "obsidian";

  export let enabled: boolean;
  export let authorized: boolean;
  export let spotifySDK: SpotifyApi | undefined;

  enum ProductType {
    FREE,
    PREMIUM,
  }

  let productType = ProductType.FREE;

  let songCover = "https://dummyimage.com/200x200/000/fff";
  let title = "Title";
  let artist = "Artist";
  let album = "Album";

  let currentLength = "00:00";
  let totalLength = "00:00";

  let volume = 100;

  let deviceId = "";

  let shuffleButton: SVGPathElement;
  let playButton: SVGPathElement;
  let repeatButton: SVGPathElement;

  let currentPlayingProgress = 0;
  let playingSlider: HTMLInputElement;
  let playingSliderFocused = false;
  let playingSliderChanging = false;

  let currentVolume = 0;
  let volumeSlider: HTMLInputElement;
  let volumeSliderFocused = false;
  let volumeSliderChanging = false;

  let data: PlaybackState;

  $: {
    spotifySDK?.currentUser.profile().then((accountData) => {
      if (accountData.product) {
        if (accountData.product === "premium") {
          productType = ProductType.PREMIUM;
        } else {
          productType = ProductType.FREE;
        }
      }
    });
  }

  async function handleShuffle() {
    if (productType === ProductType.PREMIUM) {
      if (data.shuffle_state) {
        await spotifySDK?.player.togglePlaybackShuffle(false, deviceId);
        shuffleButton.setAttribute("fill", "currentColor");
      } else {
        await spotifySDK?.player.togglePlaybackShuffle(true, deviceId);
        shuffleButton.setAttribute("fill", "#1DB954");
      }
    } else {
      new Notice("❌ Non premium users can't change playback state", 5000);
    }
  }

  async function handlePrevious() {
    if (productType === ProductType.PREMIUM) {
      await spotifySDK?.player.skipToPrevious(deviceId);
    } else {
      new Notice("❌ Non premium users can't change playback state", 5000);
    }
  }

  async function handlePlay() {
    if (productType === ProductType.PREMIUM) {
      if (data.is_playing) {
        await spotifySDK?.player.pausePlayback(deviceId);
        playButton.setAttribute("d", "M10 24h-6v-24h6v24zm10-24h-6v24h6v-24z");
      } else {
        await spotifySDK?.player.startResumePlayback(deviceId);
        playButton.setAttribute("d", "M2 24v-24l20 12-20 12z");
      }
    } else {
      new Notice("❌ Non premium users can't change playback state", 5000);
    }
  }

  async function handleNext() {
    if (productType === ProductType.PREMIUM) {
      await spotifySDK?.player.skipToNext(deviceId);
    } else {
      new Notice("❌ Non premium users can't change playback state", 5000);
    }
  }

  async function handleRepeat() {
    if (productType === ProductType.PREMIUM) {
      if (data.repeat_state === "off") {
        await spotifySDK?.player.setRepeatMode("context", deviceId);
        repeatButton.setAttribute("fill", "#1DB954");
        repeatButton.setAttribute(
          "d",
          "M2 12c0 .999.381 1.902.989 2.604l-1.098.732-.587.392c-.814-1.025-1.304-2.318-1.304-3.728 0-3.313 2.687-6 6-6h9v-3l6 4-6 4v-3h-9c-2.206 0-4 1.794-4 4zm20.696-3.728l-.587.392-1.098.732c.608.702.989 1.605.989 2.604 0 2.206-1.795 4-4 4h-9v-3l-6 4 6 4v-3h9c3.313 0 6-2.687 6-6 0-1.41-.489-2.703-1.304-3.728z",
        );
      } else if (data.repeat_state === "context") {
        await spotifySDK?.player.setRepeatMode("track", deviceId);
        repeatButton.setAttribute("fill", "#1DB954");
        repeatButton.setAttribute(
          "d",
          "M6.09 18h-.09c-3.313 0-6-2.687-6-6s2.687-6 6-6h2v-3l6 4-6 4v-3h-2c-2.206 0-4 1.794-4 4s1.794 4 4 4h.09c-.055.326-.09.658-.09 1s.035.674.09 1zm11.91-12h-2v2h2c2.206 0 4 1.794 4 4s-1.794 4-4 4h-.09c.055.326.09.658.09 1s-.035.674-.09 1h.09c3.313 0 6-2.687 6-6s-2.687-6-6-6zm-6 7c-2.209 0-4 1.791-4 3.999 0 2.209 1.791 4.001 4 4.001s4-1.792 4-4.001c0-2.208-1.791-3.999-4-3.999zm1.016 6.188h-1.055v-3.109c-.022 0-.884.413-.904.423l-.179-.936 1.241-.574h.896v4.196z",
        );
      } else if (data.repeat_state === "track") {
        await spotifySDK?.player.setRepeatMode("off", deviceId);
        repeatButton.setAttribute("fill", "currentColor");
        repeatButton.setAttribute(
          "d",
          "M2 12c0 .999.381 1.902.989 2.604l-1.098.732-.587.392c-.814-1.025-1.304-2.318-1.304-3.728 0-3.313 2.687-6 6-6h9v-3l6 4-6 4v-3h-9c-2.206 0-4 1.794-4 4zm20.696-3.728l-.587.392-1.098.732c.608.702.989 1.605.989 2.604 0 2.206-1.795 4-4 4h-9v-3l-6 4 6 4v-3h9c3.313 0 6-2.687 6-6 0-1.41-.489-2.703-1.304-3.728z",
        );
      }
    } else {
      new Notice("❌ Non premium users can't change playback state", 5000);
    }
  }

  function playingSliderMouseEnter() {
    const progress = currentPlayingProgress;
    playingSlider.style.background = `linear-gradient(to right, #1DB954 ${progress}%, #4d4d4d ${progress}%)`;
    playingSliderFocused = true;
  }

  function playingSliderMouseLeave() {
    const progress = currentPlayingProgress;
    playingSlider.style.background = `linear-gradient(to right, #fff ${progress}%, #4d4d4d ${progress}%)`;
    playingSliderFocused = false;
  }

  function playingSliderInput(event: Event) {
    playingSliderChanging = true;

    const value = parseInt((event.target as HTMLInputElement).value);
    const progress = (value / parseInt(playingSlider.max)) * 100;

    if (playingSliderFocused) {
      playingSlider.style.background = `linear-gradient(to right, #1DB954 ${progress}%, #4d4d4d ${progress}%)`;
    } else {
      playingSlider.style.background = `linear-gradient(to right, #fff ${progress}%, #4d4d4d ${progress}%)`;
    }
  }

  async function playingSliderChange(event: Event) {
    if (productType === ProductType.PREMIUM) {
      const value = parseInt((event.target as HTMLInputElement).value);
      const progress = (value / parseInt(playingSlider.max)) * 100;
      await spotifySDK?.player.seekToPosition(value, deviceId);

      if (playingSliderFocused) {
        playingSlider.style.background = `linear-gradient(to right, #1DB954 ${progress}%, #4d4d4d ${progress}%)`;
      } else {
        playingSlider.style.background = `linear-gradient(to right, #fff ${progress}%, #4d4d4d ${progress}%)`;
      }

      playingSliderChanging = false;
    } else {
      playingSliderChanging = false;
      new Notice("❌ Non premium users can't change playback state", 5000);
    }
  }

  function volumeSliderMouseEnter() {
    const progress = currentVolume;
    volumeSlider.style.background = `linear-gradient(to right, #1DB954 ${progress}%, #4d4d4d ${progress}%)`;
    volumeSliderFocused = true;
  }

  function volumeSliderMouseLeave() {
    const progress = currentVolume;
    volumeSlider.style.background = `linear-gradient(to right, #fff ${progress}%, #4d4d4d ${progress}%)`;
    volumeSliderFocused = false;
  }

  function volumeSliderInput(event: Event) {
    volumeSliderChanging = true;

    const currentVolume = parseInt((event.target as HTMLInputElement).value);

    if (volumeSliderFocused) {
      volumeSlider.style.background = `linear-gradient(to right, #1DB954 ${currentVolume}%, #4d4d4d ${currentVolume}%)`;
    } else {
      volumeSlider.style.background = `linear-gradient(to right, #fff ${currentVolume}%, #4d4d4d ${currentVolume}%)`;
    }
  }

  async function volumeSliderChange(event: Event) {
    if (productType === ProductType.PREMIUM) {
      const currentVolume = parseInt((event.target as HTMLInputElement).value);
      await spotifySDK?.player.setPlaybackVolume(currentVolume, deviceId);

      if (volumeSliderFocused) {
        volumeSlider.style.background = `linear-gradient(to right, #1DB954 ${currentVolume}%, #4d4d4d ${currentVolume}%)`;
      } else {
        volumeSlider.style.background = `linear-gradient(to right, #fff ${currentVolume}%, #4d4d4d ${currentVolume}%)`;
      }

      volumeSliderChanging = false;
    } else {
      volumeSliderChanging = false;
      new Notice("❌ Non premium users can't change playback state", 5000);
    }
  }

  setInterval(async () => {
    if (spotifySDK) {
      data = await spotifySDK?.player.getPlaybackState();
      deviceId = data.device.id!;

      // State
      if (!playingSliderChanging) {
        playingSlider.max = data.item.duration_ms.toString();
        playingSlider.value = data.progress_ms.toString();
        const value = data.progress_ms;
        currentPlayingProgress = (value / data.item.duration_ms) * 100;

        if (playingSliderFocused) {
          playingSlider.style.background = `linear-gradient(to right, #1DB954 ${currentPlayingProgress}%, #4d4d4d ${currentPlayingProgress}%)`;
        } else {
          playingSlider.style.background = `linear-gradient(to right, #fff ${currentPlayingProgress}%, #4d4d4d ${currentPlayingProgress}%)`;
        }

        currentLength = new Date(data.progress_ms)
          .toISOString()
          .slice(11, 19)
          .replace("00:", "");
        totalLength = new Date(data.item.duration_ms)
          .toISOString()
          .slice(11, 19)
          .replace("00:", "");
      } else {
        currentLength = new Date(data.progress_ms)
          .toISOString()
          .slice(11, 19)
          .replace("00:", "");
        totalLength = new Date(data.item.duration_ms)
          .toISOString()
          .slice(11, 19)
          .replace("00:", "");
      }

      if (!volumeSliderChanging) {
        currentVolume = data.device.volume_percent!;
        volumeSlider.value = currentVolume.toString();

        if (volumeSliderFocused) {
          volumeSlider.style.background = `linear-gradient(to right, #1DB954 ${currentVolume}%, #4d4d4d ${currentVolume}%)`;
        } else {
          volumeSlider.style.background = `linear-gradient(to right, #fff ${currentVolume}%, #4d4d4d ${currentVolume}%)`;
        }
      }

      if (data.shuffle_state) {
        shuffleButton.setAttribute("fill", "#1DB954");
      } else {
        shuffleButton.setAttribute("fill", "currentColor");
      }

      if (data.is_playing) {
        playButton.setAttribute("d", "M10 24h-6v-24h6v24zm10-24h-6v24h6v-24z");
      } else {
        playButton.setAttribute("d", "M2 24v-24l20 12-20 12z");
      }

      if (data.repeat_state === "off") {
        repeatButton.setAttribute("fill", "currentColor");
        repeatButton.setAttribute(
          "d",
          "M2 12c0 .999.381 1.902.989 2.604l-1.098.732-.587.392c-.814-1.025-1.304-2.318-1.304-3.728 0-3.313 2.687-6 6-6h9v-3l6 4-6 4v-3h-9c-2.206 0-4 1.794-4 4zm20.696-3.728l-.587.392-1.098.732c.608.702.989 1.605.989 2.604 0 2.206-1.795 4-4 4h-9v-3l-6 4 6 4v-3h9c3.313 0 6-2.687 6-6 0-1.41-.489-2.703-1.304-3.728z",
        );
      } else if (data.repeat_state === "context") {
        repeatButton.setAttribute("fill", "#1DB954");
        repeatButton.setAttribute(
          "d",
          "M2 12c0 .999.381 1.902.989 2.604l-1.098.732-.587.392c-.814-1.025-1.304-2.318-1.304-3.728 0-3.313 2.687-6 6-6h9v-3l6 4-6 4v-3h-9c-2.206 0-4 1.794-4 4zm20.696-3.728l-.587.392-1.098.732c.608.702.989 1.605.989 2.604 0 2.206-1.795 4-4 4h-9v-3l-6 4 6 4v-3h9c3.313 0 6-2.687 6-6 0-1.41-.489-2.703-1.304-3.728z",
        );
      } else if (data.repeat_state === "track") {
        repeatButton.setAttribute("fill", "#1DB954");
        repeatButton.setAttribute(
          "d",
          "M6.09 18h-.09c-3.313 0-6-2.687-6-6s2.687-6 6-6h2v-3l6 4-6 4v-3h-2c-2.206 0-4 1.794-4 4s1.794 4 4 4h.09c-.055.326-.09.658-.09 1s.035.674.09 1zm11.91-12h-2v2h2c2.206 0 4 1.794 4 4s-1.794 4-4 4h-.09c.055.326.09.658.09 1s-.035.674-.09 1h.09c3.313 0 6-2.687 6-6s-2.687-6-6-6zm-6 7c-2.209 0-4 1.791-4 3.999 0 2.209 1.791 4.001 4 4.001s4-1.792 4-4.001c0-2.208-1.791-3.999-4-3.999zm1.016 6.188h-1.055v-3.109c-.022 0-.884.413-.904.423l-.179-.936 1.241-.574h.896v4.196z",
        );
      }

      // Track
      let item = data.item as Track;
      if (item.album === undefined) {
        // TODO: Handle Podcast
      }

      // Song Information
      songCover = item.album.images[1].url;

      let artistName = "";
      for (let i in item.artists) {
        let artist = item.artists[i];
        artistName = artistName + artist.name + ", ";
      }

      title = item.name;
      artist = artistName.slice(0, -2);
      album = item.album.name;
    }
  }, 500);
</script>

{#if enabled}
  {#if authorized}
    <div class="music-sync">
      <div class="music-sync-song-container">
        <img src={songCover} alt="Song Cover" />
        <div class="music-sync-song-information">
          <span>{title}</span><br />
          <span><b>by</b> <i>{artist}</i></span><br />
          <span><b>on</b> <i>{album}</i></span>
        </div>
      </div>
      <br />
      <div class="music-sync-song-player">
        <span>{currentLength}</span>
        &nbsp;
        <input
          style="width: 100%;"
          type="range"
          min="1"
          max="100"
          value="0"
          bind:this={playingSlider}
          on:mouseenter={playingSliderMouseEnter}
          on:mouseleave={playingSliderMouseLeave}
          on:input={playingSliderInput}
          on:change={playingSliderChange}
        />
        &nbsp;
        <span>{totalLength}</span>
      </div>
      <br />
      <div class="music-sync-song-controls">
        <button on:click={handleShuffle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M2 7h-2v-2h2c3.49 0 5.48 1.221 6.822 2.854-.41.654-.754 1.312-1.055 1.939-1.087-1.643-2.633-2.793-5.767-2.793zm16 10c-3.084 0-4.604-1.147-5.679-2.786-.302.627-.647 1.284-1.06 1.937 1.327 1.629 3.291 2.849 6.739 2.849v3l6-4-6-4v3zm0-10v3l6-4-6-4v3c-5.834 0-7.436 3.482-8.85 6.556-1.343 2.921-2.504 5.444-7.15 5.444h-2v2h2c5.928 0 7.543-3.511 8.968-6.609 1.331-2.893 2.479-5.391 7.032-5.391z"
              bind:this={shuffleButton}
            />
          </svg>
        </button>
        <button on:click={handlePrevious}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M4 2v20h-2v-20h2zm18 0l-16 10 16 10v-20z"
            />
          </svg>
        </button>
        <button on:click={handlePlay}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M10 24h-6v-24h6v24zm10-24h-6v24h6v-24z"
              bind:this={playButton}
            />
          </svg>
        </button>
        <button on:click={handleNext}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M20 22v-20h2v20h-2zm-18 0l16-10-16-10v20z"
            />
          </svg>
        </button>
        <button on:click={handleRepeat}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M2 12c0 .999.381 1.902.989 2.604l-1.098.732-.587.392c-.814-1.025-1.304-2.318-1.304-3.728 0-3.313 2.687-6 6-6h9v-3l6 4-6 4v-3h-9c-2.206 0-4 1.794-4 4zm20.696-3.728l-.587.392-1.098.732c.608.702.989 1.605.989 2.604 0 2.206-1.795 4-4 4h-9v-3l-6 4 6 4v-3h9c3.313 0 6-2.687 6-6 0-1.41-.489-2.703-1.304-3.728z"
              bind:this={repeatButton}
            />
          </svg>
        </button>
        <div class="music-sync-volume-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M5 17h-5v-10h5v10zm2-10v10l9 5v-20l-9 5zm11.008 2.093c.742.743 1.2 1.77 1.198 2.903-.002 1.133-.462 2.158-1.205 2.9l1.219 1.223c1.057-1.053 1.712-2.511 1.715-4.121.002-1.611-.648-3.068-1.702-4.125l-1.225 1.22zm2.142-2.135c1.288 1.292 2.082 3.073 2.079 5.041s-.804 3.75-2.096 5.039l1.25 1.254c1.612-1.608 2.613-3.834 2.616-6.291.005-2.457-.986-4.681-2.595-6.293l-1.254 1.25z"
            />
          </svg>
          <input
            type="range"
            class="music-sync-volume-slider"
            min="0"
            max="100"
            value="0"
            bind:this={volumeSlider}
            on:mouseenter={volumeSliderMouseEnter}
            on:mouseleave={volumeSliderMouseLeave}
            on:input={volumeSliderInput}
            on:change={volumeSliderChange}
          />
        </div>
      </div>
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
