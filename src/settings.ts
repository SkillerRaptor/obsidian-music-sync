/*
 * Copyright (c) 2024, SkillerRaptor
 *
 * SPDX-License-Identifier: MIT
 */

import { App, PluginSettingTab, Setting, getIcon, setIcon } from "obsidian";
import MusicSync from "./main";

export interface MusicSyncSettings {
    // Spotify
    useSpotify: boolean;
    spotifyClientId: string;
    spotifyClientSecret: string;
}

const DEFAULT_SETTINGS: MusicSyncSettings = {
    useSpotify: false,
    spotifyClientId: "",
    spotifyClientSecret: "",
};

export class SettingTab extends PluginSettingTab {
    plugin: MusicSync;

    constructor(app: App, plugin: MusicSync) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", { text: "Music Sync" });

        new Setting(containerEl).setName("General Settings").setHeading();

        new Setting(containerEl)
            .setName("Use Spotify API")
            .setDesc("Enable this to make use of the Spotify Widget")
            .then((setting) => {
                const iconDiv = createDiv();

                const icon = getIcon("spotify");
                icon!.setAttribute("viewBox", "0 0 24 24");
                iconDiv.appendChild(icon!);

                setting.settingEl.prepend(iconDiv);
            })
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.useSpotify)
                    .onChange(async (value) => {
                        this.plugin.settings.useSpotify = value;
                        await this.saveSettings();

                        this.display();
                    });
            });

        if (this.plugin.settings.useSpotify) {
            new Setting(containerEl).setName("Spotify Settings").setHeading();

            new Setting(containerEl)
                .setName("Client ID")
                .setDesc("")
                .addText((text) => {
                    text.setValue(
                        this.plugin.settings.spotifyClientId
                    ).onChange(async (value) => {
                        this.plugin.settings.spotifyClientId = value;
                        await this.saveSettings();
                    });
                });

            new Setting(containerEl)
                .setName("Client Secret")
                .setDesc("")
                .addText((text) => {
                    text.setValue(
                        this.plugin.settings.spotifyClientSecret
                    ).onChange(async (value) => {
                        this.plugin.settings.spotifyClientSecret = value;
                        await this.saveSettings();
                    });
                });
        }
    }

    static async loadSettings(plugin: MusicSync) {
        plugin.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await plugin.loadData()
        );
    }

    async saveSettings() {
        await this.plugin.saveData(this.plugin.settings);
    }
}
