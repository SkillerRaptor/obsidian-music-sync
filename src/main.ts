/*
 * Copyright (c) 2024, SkillerRaptor
 *
 * SPDX-License-Identifier: MIT
 */

import { Plugin, addIcon } from "obsidian";

import { MusicSyncSettings, SettingTab } from "./settings";

export default class MusicSync extends Plugin {
    settings: MusicSyncSettings;

    private spotifyButton?: HTMLElement;

    async onload() {
        await SettingTab.loadSettings(this);

        addIcon(
            "spotify",
            "<path fill='currentColor' d='M79.575 44.325c-16.117-9.571-42.7-10.45-58.088-5.779-2.471.75-5.083-.646-5.829-3.117-.75-2.471.642-5.083 3.117-5.833 17.662-5.363 47.021-4.325 65.575 6.688 2.221 1.321 2.95 4.188 1.633 6.408-1.317 2.221-4.187 2.954-6.408 1.633zm-.525 14.179c-1.133 1.833-3.529 2.408-5.362 1.283-13.437-8.258-33.925-10.654-49.825-5.829-2.058.625-4.238-.538-4.863-2.596-.621-2.062.542-4.233 2.6-4.862 18.158-5.508 40.733-2.842 56.167 6.646 1.833 1.125 2.408 3.529 1.283 5.358zm-6.121 13.613c-.896 1.475-2.817 1.938-4.283 1.037-11.742-7.175-26.521-8.796-43.925-4.821-1.675.383-3.346-.667-3.729-2.342-.383-1.679.662-3.35 2.342-3.733 19.046-4.354 35.383-2.479 48.563 5.575 1.471.896 1.933 2.817 1.033 4.283zm-22.929-72.117c-27.612 0-50 22.388-50 50 0 27.617 22.388 50 50 50 27.617 0 50-22.383 50-50 0-27.612-22.383-50-50-50z' />"
        );

        if (this.settings.useSpotify && this.settings.showSpotifyButton) {
            this.addSpotifyButton();
        }

        this.addSettingTab(new SettingTab(this.app, this));
    }

    onunload() {}

    addSpotifyButton(): void {
        this.spotifyButton = this.addRibbonIcon(
            "spotify",
            "Open Spotify Widget",
            (_event) => {}
        );
    }

    removeSpotifyButton(): void {
        if (this.spotifyButton) {
            this.spotifyButton.parentNode?.removeChild(this.spotifyButton);
        }
    }
}
