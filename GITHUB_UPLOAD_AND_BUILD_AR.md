# AL-MOFEED — GitHub Upload & APK Build Handoff

This branch contains the corrected HTML, Android WebView wrapper, source integrity checks, and GitHub Actions build workflow.

## Build
1. Open Actions → **AL-MOFEED Android APK Build**.
2. Run workflow, or wait for the push-triggered run.
3. Confirm the source checks pass, Gradle build succeeds, and `apksigner verify` passes.
4. Download artifact `ALMOFEED-Mobile-Font-Fix-APK` containing `app-debug.apk` and its SHA-256 checksum.
5. Install and test on the target Android phone. CI build and desktop browser simulation are not physical-device tests.

## Release gates
- Root HTML and bundled Android asset must be byte-identical.
- Required mathematical cases: vertical fraction, negative rational exponent, cube root of a negative number, and radical equation.
- APK must exist, pass signature verification, and have a recorded SHA-256 checksum.
- Do not call it physically tested until installed and exercised on a real Android device.
