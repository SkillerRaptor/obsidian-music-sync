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
    showSpotifyButton: boolean;
}

const DEFAULT_SETTINGS: MusicSyncSettings = {
    useSpotify: false,
    showSpotifyButton: true,
};

export class SettingTab extends PluginSettingTab {
    private plugin: MusicSync;

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
                const iconEl = createDiv();
                setIcon(iconEl, "spotify");

                setting.settingEl.prepend(iconEl);
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
                .setName("Show Spotify Button")
                .setDesc(
                    "Enable this to show the Spotify button on the sidebar"
                )
                .addToggle((toggle) => {
                    toggle
                        .setValue(this.plugin.settings.showSpotifyButton)
                        .onChange(async (value) => {
                            this.plugin.settings.showSpotifyButton = value;
                            await this.saveSettings();

                            if (value) {
                                this.plugin.addSpotifyButton();
                            } else {
                                this.plugin.removeSpotifyButton();
                            }

                            this.display();
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
