/*
 * Copyright (c) 2024, SkillerRaptor
 *
 * SPDX-License-Identifier: MIT
 */

import { Plugin } from "obsidian";
import { type MusicSyncSettings, SettingTab } from "./settings";
import { Spotify } from "./spotify/spotify";

export default class MusicSync extends Plugin {
    public settings!: MusicSyncSettings;

    public spotify!: Spotify;

    async onload() {
        await SettingTab.loadSettings(this);

        this.spotify = new Spotify(this);

        this.addSettingTab(new SettingTab(this.app, this));
    }

    onunload() {}
}
