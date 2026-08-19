import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const APP_STORE_ID = "6776115614";
export const APP_STORE_BUNDLE_ID = "com.somincola.moro";
export const APP_STORE_STOREFRONT = "us";
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;
export const APP_STORE_LOOKUP_URL = `https://itunes.apple.com/lookup?id=${APP_STORE_ID}&country=${APP_STORE_STOREFRONT}`;
export const RELEASE_DATA_PATH = fileURLToPath(
    new URL("../src/data/app-store-release.json", import.meta.url),
);

const releaseContentKeys = [
    "schemaVersion",
    "appStoreId",
    "bundleId",
    "storefront",
    "source",
    "sourceUrl",
    "version",
    "releaseDate",
    "minimumOsVersion",
    "releaseNotes",
    "appStoreUrl",
];

function requireString(value, field) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`Apple lookup response is missing ${field}.`);
    }
    return value.trim();
}

export function normalizeReleaseNotes(value) {
    if (typeof value !== "string") return [];

    return value
        .split(/\r?\n/)
        .map((line) => line.trim().replace(/^[-*•]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 50)
        .map((line) => line.slice(0, 1_000));
}

export function normalizeLookupPayload(payload) {
    if (!payload || !Array.isArray(payload.results)) {
        throw new Error("Apple lookup response does not contain a results array.");
    }

    const app = payload.results.find((result) => String(result?.trackId) === APP_STORE_ID);
    if (!app) {
        throw new Error(`Apple lookup did not return App Store ID ${APP_STORE_ID}.`);
    }
    if (app.bundleId !== APP_STORE_BUNDLE_ID) {
        throw new Error(`Apple lookup returned unexpected bundle ID ${app.bundleId ?? "<missing>"}.`);
    }

    const version = requireString(app.version, "version");
    if (!/^\d+(?:\.\d+){1,3}$/.test(version)) {
        throw new Error(`Apple lookup returned invalid version ${version}.`);
    }

    const releaseDate = requireString(app.currentVersionReleaseDate, "currentVersionReleaseDate");
    if (Number.isNaN(Date.parse(releaseDate))) {
        throw new Error(`Apple lookup returned invalid release date ${releaseDate}.`);
    }

    const minimumOsVersion = requireString(app.minimumOsVersion, "minimumOsVersion");
    if (!/^\d+(?:\.\d+){0,2}$/.test(minimumOsVersion)) {
        throw new Error(`Apple lookup returned invalid minimum OS version ${minimumOsVersion}.`);
    }

    return {
        schemaVersion: 1,
        appStoreId: APP_STORE_ID,
        bundleId: APP_STORE_BUNDLE_ID,
        storefront: APP_STORE_STOREFRONT,
        source: "Apple iTunes Search API",
        sourceUrl: APP_STORE_LOOKUP_URL,
        version,
        releaseDate: new Date(releaseDate).toISOString(),
        minimumOsVersion,
        releaseNotes: normalizeReleaseNotes(app.releaseNotes),
        appStoreUrl: APP_STORE_URL,
    };
}

export function comparableReleaseContent(data) {
    return Object.fromEntries(releaseContentKeys.map((key) => [key, data?.[key]]));
}

export function releaseContentChanged(current, next) {
    return JSON.stringify(comparableReleaseContent(current))
        !== JSON.stringify(comparableReleaseContent(next));
}

async function wait(milliseconds) {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchAppStoreRelease({ fetchImpl = globalThis.fetch, retries = 3 } = {}) {
    if (typeof fetchImpl !== "function") {
        throw new Error("This command requires a Node.js runtime with fetch support.");
    }

    let lastError;
    for (let attempt = 1; attempt <= retries; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);

        try {
            const response = await fetchImpl(APP_STORE_LOOKUP_URL, {
                headers: {
                    Accept: "application/json",
                    "User-Agent": "moro-web-release-sync/1.0",
                },
                signal: controller.signal,
            });
            if (!response.ok) {
                throw new Error(`Apple lookup returned HTTP ${response.status}.`);
            }
            return normalizeLookupPayload(await response.json());
        } catch (error) {
            lastError = error;
            if (attempt < retries) await wait(attempt * 750);
        } finally {
            clearTimeout(timeout);
        }
    }

    throw new Error(`Unable to synchronize App Store release data: ${lastError?.message ?? "unknown error"}`);
}

async function readCurrentRelease(dataPath) {
    try {
        return JSON.parse(await readFile(dataPath, "utf8"));
    } catch (error) {
        if (error?.code === "ENOENT") return null;
        throw new Error(`Unable to read existing release data: ${error.message}`);
    }
}

export async function syncAppStoreRelease({
    dataPath = RELEASE_DATA_PATH,
    fetchImpl = globalThis.fetch,
    now = () => new Date(),
} = {}) {
    const nextContent = await fetchAppStoreRelease({ fetchImpl });
    const current = await readCurrentRelease(dataPath);

    if (current && !releaseContentChanged(current, nextContent)) {
        return { changed: false, data: current, dataPath };
    }

    const syncedAt = now().toISOString();
    if (Number.isNaN(Date.parse(syncedAt))) {
        throw new Error(`Unable to write invalid synchronization date ${syncedAt}.`);
    }

    const next = { ...nextContent, syncedAt };
    const temporaryPath = `${dataPath}.${process.pid}.tmp`;
    await mkdir(dirname(dataPath), { recursive: true });
    await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    await rename(temporaryPath, dataPath);

    return { changed: true, data: next, dataPath };
}
