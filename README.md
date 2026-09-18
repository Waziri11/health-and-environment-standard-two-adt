# Health and Environment — Standard Two

Accessible digital textbook with 42 reader pages, English narration and Easy Read, a glossary, and sign-language videos for every page including both covers.

The website is published from the root of `main` through GitHub Pages:
<https://waziri11.github.io/health-and-environment-standard-two-adt/>

## Reader files

- `content/pages.json` defines the complete reading order. Sections from the original split pages are consolidated into these 42 HTML files.
- `content/i18n/en/videos.json` maps `video-N` to `video/page_N.mp4`, using the reader's page counter. Pages 1 and 42 are the front and back covers.
- `assets/base.bundle.local.js` and the mobile drawer, sign-language player, and independent media helpers are copied from Writing Pupil's Book Standard One. Phone menus use bottom drawers; desktop menus use popovers.
- `assets/tailwind_css.css` is the stylesheet source. `content/tailwind_output.css` is generated from that source, this book's HTML, and the installed reader runtime.
- `assets/offline-preloader.js` embeds the current reader pages and JSON configuration for offline access.

## Validate and publish

Run from the repository root:

```text
python -X utf8 scripts/verify_deployment.py
python -X utf8 scripts/verify_review_fixes.py
node scripts/audit_audio.js
git diff --check
```

When changing reader classes, install `postcss@8.5.6`, `tailwindcss@4.2.4`, `@tailwindcss/postcss@4.2.4`, and `tw-animate-css@1.4.0` in a build directory outside this repository, then run:

```text
node scripts/regenerate_reader_styles.js <build-directory>
```

After changing pages or JSON, update the bundle/cache versions and run:

```text
node scripts/regenerate_offline_preloader.js
```

Commit and push to `main`, wait for the **pages build and deployment** workflow to succeed for that commit, and check the public reader's navigation, mobile drawers, narration, and cover videos. Website publication requires no ZIP or SCORM package.

Before removing media, verify its references in the active HTML, stylesheets, runtime, and localization maps. `verify_deployment.py` checks that all active links resolve and that the media directories contain no unreferenced files. Keep licensing notices, source styles, and reusable validation/generation tools.

To roll back a release, revert its commit on `main` and push the revert so GitHub Pages redeploys the previous working files.
