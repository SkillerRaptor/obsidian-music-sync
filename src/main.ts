/*
 * Copyright (c) 2024, SkillerRaptor
 *
 * SPDX-License-Identifier: MIT
 */

import { Plugin } from "obsidian";
import { type MusicSyncSettings, SettingsTab } from "./settings";
import { Spotify } from "./spotify/spotify";

export default class MusicSync extends Plugin {
    public settings!: MusicSyncSettings;
    public settingsTab!: SettingsTab;

    public spotify!: Spotify;

    async onload() {
        await SettingsTab.loadSettings(this);

        this.spotify = new Spotify(this);
        await this.spotify.load();

        this.addSettingTab(
            (this.settingsTab = new SettingsTab(this.app, this))
        );
    }

    onunload() {
        this.spotify.unload();
    }
}
