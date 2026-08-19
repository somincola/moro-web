import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
    APP_STORE_BUNDLE_ID,
    APP_STORE_ID,
    normalizeLookupPayload,
    releaseContentChanged,
    syncAppStoreRelease,
} from "../scripts/app-store-release.mjs";

const lookupPayload = {
    resultCount: 1,
    results: [
        {
            trackId: Number(APP_STORE_ID),
            bundleId: APP_STORE_BUNDLE_ID,
            version: "1.2.3",
            currentVersionReleaseDate: "2026-08-18T05:04:03Z",
            minimumOsVersion: "18.0",
            releaseNotes: "- First improvement\n• Second improvement\n\n* Third improvement",
        },
    ],
};

function successfulFetch(payload = lookupPayload) {
    return async () => ({
        ok: true,
        status: 200,
        json: async () => structuredClone(payload),
    });
}

test("normalizes Apple release metadata and update notes", () => {
    const release = normalizeLookupPayload(lookupPayload);

    assert.equal(release.version, "1.2.3");
    assert.equal(release.releaseDate, "2026-08-18T05:04:03.000Z");
    assert.equal(release.minimumOsVersion, "18.0");
    assert.deepEqual(release.releaseNotes, [
        "First improvement",
        "Second improvement",
        "Third improvement",
    ]);
});

test("rejects metadata for an unexpected bundle", () => {
    const mismatchedPayload = structuredClone(lookupPayload);
    mismatchedPayload.results[0].bundleId = "com.example.other";

    assert.throws(
        () => normalizeLookupPayload(mismatchedPayload),
        /unexpected bundle ID/,
    );
});

test("ignores synchronization time when release content is unchanged", () => {
    const content = normalizeLookupPayload(lookupPayload);

    assert.equal(releaseContentChanged({ ...content, syncedAt: "2026-01-01T00:00:00.000Z" }, content), false);
    assert.equal(releaseContentChanged({ ...content, version: "1.2.2" }, content), true);
});

test("writes only when public release content changes", async () => {
    const directory = await mkdtemp(join(tmpdir(), "moro-release-sync-"));
    const dataPath = join(directory, "app-store-release.json");

    try {
        const first = await syncAppStoreRelease({
            dataPath,
            fetchImpl: successfulFetch(),
            now: () => new Date("2026-08-19T00:00:00Z"),
        });
        const initialFile = await readFile(dataPath, "utf8");
        const second = await syncAppStoreRelease({
            dataPath,
            fetchImpl: successfulFetch(),
            now: () => new Date("2026-08-20T00:00:00Z"),
        });

        assert.equal(first.changed, true);
        assert.equal(second.changed, false);
        assert.equal(await readFile(dataPath, "utf8"), initialFile);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});
