/*
 * Copyright (c) 2024, SkillerRaptor
 *
 * SPDX-License-Identifier: MIT
 */

import { App, PluginSettingTab, Setting, getIcon, setIcon } from "obsidian";
import MusicSync from "./main";
import { Spotify } from "./spotify/spotify";

export interface MusicSyncSettings {
    // Spotify
    useSpotify: boolean;
    showSpotifyButton: boolean;
}

const DEFAULT_SETTINGS: MusicSyncSettings = {
    // Spotify
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

                        // Update view
                        this.plugin.spotify.view.setEnabled(
                            this.plugin.settings.useSpotify
                        );

                        // Re-enable buttons
                        if (
                            this.plugin.settings.useSpotify &&
                            this.plugin.settings.showSpotifyButton
                        ) {
                            this.plugin.spotify.addSpotifyButton();
                        } else {
                            this.plugin.spotify.removeSpotifyButton();
                        }

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
                                this.plugin.spotify.addSpotifyButton();
                            } else {
                                this.plugin.spotify.removeSpotifyButton();
                            }

                            this.display();
                        });
                });

            new Setting(containerEl)
                .setName("Authorization Status")
                .setDesc("Verified!");

            new Setting(containerEl)
                .setName("Authorize Spotify Client")
                .setDesc(
                    "Authorizes access to your Spotify data for the plugin"
                )
                .addButton((button) => {
                    button.setButtonText("Auth").onClick(async (event) => {
                        await Spotify.auth();
                    });
                });

            new Setting(containerEl)
                .setName("Logout Spotify Client")
                .setDesc(
                    "Removes the access to your Spotify data for the plugin"
                )
                .addButton((button) => {
                    button.setButtonText("Logout").onClick(async (event) => {});
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
