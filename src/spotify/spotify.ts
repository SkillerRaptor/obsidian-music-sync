/*
 * Copyright (c) 2024, SkillerRaptor
 *
 * SPDX-License-Identifier: MIT
 */

import type MusicSync from "src/main";
import { SpotifyView } from "./spotifyView";
import { Notice, WorkspaceLeaf, addIcon, requestUrl } from "obsidian";
import { Utils } from "src/utils";
import { SettingsTab } from "src/settings";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export class Spotify {
    static CLIENT_ID = "d083d33197d84a2cb5eb079b80783568";
    static REDIRECT_URI = "obsidian://spotify/authorization";
    static SCOPE =
        "user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control streaming playlist-read-private playlist-read-collaborative user-follow-read user-read-playback-position user-top-read user-read-recently-played user-library-read user-read-email user-read-private";
    static AUTH_URL = "https://accounts.spotify.com/authorize";
    static TOKEN_URL = "https://accounts.spotify.com/api/token";

    private plugin: MusicSync;
    private spotifyButton?: HTMLElement;

    private codeVerifier?: string;
    private spotifySDK?: SpotifyApi;
    private refreshTimer?: NodeJS.Timer;
    private onlineRefresh?: () => Promise<void>;

    public view!: SpotifyView;

    constructor(plugin: MusicSync) {
        this.plugin = plugin;

        // Register Icon
        addIcon(
            "spotify",
            "<path fill='currentColor' d='M79.575 44.325c-16.117-9.571-42.7-10.45-58.088-5.779-2.471.75-5.083-.646-5.829-3.117-.75-2.471.642-5.083 3.117-5.833 17.662-5.363 47.021-4.325 65.575 6.688 2.221 1.321 2.95 4.188 1.633 6.408-1.317 2.221-4.187 2.954-6.408 1.633zm-.525 14.179c-1.133 1.833-3.529 2.408-5.362 1.283-13.437-8.258-33.925-10.654-49.825-5.829-2.058.625-4.238-.538-4.863-2.596-.621-2.062.542-4.233 2.6-4.862 18.158-5.508 40.733-2.842 56.167 6.646 1.833 1.125 2.408 3.529 1.283 5.358zm-6.121 13.613c-.896 1.475-2.817 1.938-4.283 1.037-11.742-7.175-26.521-8.796-43.925-4.821-1.675.383-3.346-.667-3.729-2.342-.383-1.679.662-3.35 2.342-3.733 19.046-4.354 35.383-2.479 48.563 5.575 1.471.896 1.933 2.817 1.033 4.283zm-22.929-72.117c-27.612 0-50 22.388-50 50 0 27.617 22.388 50 50 50 27.617 0 50-22.383 50-50 0-27.612-22.383-50-50-50z' />"
        );

        // Register View
        this.plugin.registerView(
            SpotifyView.VIEW_TYPE,
            (leaf) => (this.view = new SpotifyView(leaf, this.plugin))
        );

        if (!this.plugin.settings.spotifyAccessToken?.refresh_token) {
            this.spotifySDK = undefined;

            if (this.view) {
                this.view.setSpotifySDK(this.spotifySDK);
            }
        }

        // Register auth url
        this.plugin.registerObsidianProtocolHandler(
            "spotify/authorization",
            async (protocol_data) => {
                if (protocol_data.error) {
                    new Notice(
                        "Failed to verify Spotify authorization state with error code: " +
                            protocol_data.error
                    );
                    return;
                }

                /*
                // NOTE: Should this work?
                if (protocol_data.state != this.codeVerifier) {
                    new Notice("Failed to verify Spotify authorization state!");
                    return;
                }
                */

                const code = protocol_data.code;

                const access_token = await requestUrl({
                    url: Spotify.TOKEN_URL,
                    method: "POST",
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        grant_type: "authorization_code",
                        code,
                        redirect_uri: "spotify/authorization",
                        client_id: Spotify.CLIENT_ID,
                        code_verifier: this.codeVerifier!,
                    }).toString(),
                    throw: false,
                });

                const data = await access_token.json;

                this.plugin.settings.spotifyAccessToken = data;
                await SettingsTab.saveSettings(this.plugin);

                this.spotifySDK = SpotifyApi.withAccessToken(
                    Spotify.CLIENT_ID,
                    this.plugin.settings.spotifyAccessToken!
                );
                if (this.view) {
                    this.view.setSpotifySDK(this.spotifySDK);
                }

                this.view.setAuthorized(
                    this.plugin.settings.spotifyAccessToken !== undefined
                );

                new Notice("Spotify successfully authorized!");

                this.plugin.settingsTab.display();
            }
        );

        // Add button to sidebar if enabled
        if (
            this.plugin.settings.useSpotify &&
            this.plugin.settings.showSpotifyButton
        ) {
            this.addSpotifyButton();
        }
    }

    unload() {
        this.spotifySDK = undefined;
        if (this.view) {
            this.view.setSpotifySDK(this.spotifySDK);
        }
        clearInterval(this.refreshTimer);
        window.removeEventListener("online", this.onlineRefresh!);
    }

    addSpotifyButton() {
        this.spotifyButton = this.plugin.addRibbonIcon(
            "spotify",
            "Open Spotify Widget",
            async (_event) => {
                const workspace = this.plugin.app.workspace;

                let leaf = null;
                const leaves = workspace.getLeavesOfType(SpotifyView.VIEW_TYPE);

                if (leaves.length > 0) {
                    leaf = leaves[0];
                } else {
                    leaf = workspace.getRightLeaf(false);
                    await leaf!.setViewState({
                        type: SpotifyView.VIEW_TYPE,
                        active: true,
                    });
                }

                workspace.revealLeaf(leaf!);
            }
        );
    }

    removeSpotifyButton() {
        if (this.spotifyButton) {
            this.spotifyButton.parentNode?.removeChild(this.spotifyButton);
        }
    }

    async auth() {
        const codeVerifier = Utils.generateRandomString(128);
        const hashedCode = await Utils.generateSHA256(codeVerifier);
        const codeChallenge = Utils.generateBase64(hashedCode);

        const parameters = {
            client_id: Spotify.CLIENT_ID,
            response_type: "code",
            redirect_uri: Spotify.REDIRECT_URI,
            scope: Spotify.SCOPE,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
        };

        const authUrl = new URL(Spotify.AUTH_URL);
        authUrl.search = new URLSearchParams(parameters).toString();
        window.location.href = authUrl.toString();
        this.codeVerifier = codeVerifier;
    }

    async logout() {
        this.spotifySDK?.logOut();
        this.plugin.settings.spotifyAccessToken = undefined;
        await SettingsTab.saveSettings(this.plugin);

        if (this.view) {
            this.view.setAuthorized(false);
        }

        this.unload();

        this.plugin.settingsTab.display();
    }

    async initRefresh() {
        this.refreshTimer = setInterval(async () => {
            await this.refresh();
        }, 3600000);

        this.onlineRefresh = async () => {
            await this.refresh();

            clearInterval(this.refreshTimer);
            setTimeout(async () => {
                this.refreshTimer = setInterval(async () => {
                    await this.refresh();
                }, 3600000);
            }, 3000);
        };

        window.addEventListener("online", this.onlineRefresh!);
    }

    async refresh() {
        const refresh_token =
            this.plugin.settings.spotifyAccessToken?.refresh_token;

        const access_token = await requestUrl({
            url: Spotify.TOKEN_URL,
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refresh_token!,
                client_id: Spotify.CLIENT_ID,
            }).toString(),
            throw: false,
        });

        const data = await access_token.json;

        this.plugin.settings.spotifyAccessToken = data;
        await SettingsTab.saveSettings(this.plugin);

        this.spotifySDK = SpotifyApi.withAccessToken(
            Spotify.CLIENT_ID,
            this.plugin.settings.spotifyAccessToken!
        );
        if (this.view) {
            this.view.setSpotifySDK(this.spotifySDK);
        }

        this.view.setAuthorized(
            this.plugin.settings.spotifyAccessToken !== undefined
        );
    }
}
