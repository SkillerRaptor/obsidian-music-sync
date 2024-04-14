/*
 * Copyright (c) 2024, SkillerRaptor
 *
 * SPDX-License-Identifier: MIT
 */

import { ItemView, WorkspaceLeaf, type ViewStateResult } from "obsidian";

import ViewPage from "./spotifyView.svelte";
import type MusicSync from "src/main";

export class SpotifyView extends ItemView {
    public static VIEW_TYPE = "spotify-view";

    private plugin: MusicSync;
    private viewPage?: ViewPage;

    constructor(leaf: WorkspaceLeaf, plugin: MusicSync) {
        super(leaf);
        this.plugin = plugin;
    }

    async onOpen() {
        this.viewPage = new ViewPage({
            target: this.contentEl,
            props: {
                enabled: this.plugin.settings.useSpotify,
            },
        });
    }

    async onClose() {
        this.viewPage!.$destroy();
    }

    setEnabled(enabled: boolean) {
        this.viewPage!.$set({ enabled: enabled });
    }

    getIcon() {
        return "spotify";
    }

    getViewType() {
        return SpotifyView.VIEW_TYPE;
    }

    getDisplayText() {
        return "Spotify Widget";
    }
}
