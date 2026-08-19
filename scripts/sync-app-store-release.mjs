import { syncAppStoreRelease } from "./app-store-release.mjs";

try {
    const result = await syncAppStoreRelease();
    const state = result.changed ? "updated" : "already current";
    console.log(`App Store release data ${state}: Moro ${result.data.version}`);
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
}
