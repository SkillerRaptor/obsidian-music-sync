/*
 * Copyright (c) 2024, SkillerRaptor
 *
 * SPDX-License-Identifier: MIT
 */

import { ItemView, WorkspaceLeaf } from "obsidian";

import Component from "./spotifyView.svelte";

export class SpotifyView extends ItemView {
    public static VIEW_TYPE = "spotify-view";

    private component!: Component;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return SpotifyView.VIEW_TYPE;
    }

    getDisplayText() {
        return "Spotify Widget";
    }

    async onOpen() {
        this.component = new Component({
            target: this.contentEl,
            props: {
                variable: 1,
            },
        });
    }

    async onClose() {
        this.component.$destroy();
    }
}
