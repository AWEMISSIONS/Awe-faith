# AWE Faith releases, notifications, and Prayer Wall moderation

AWE Faith stays public and does not require visitors to log in. Public URL: https://awemissions.github.io/Awe-faith/.

## Release publishing
- Update `dist/updates.json` with a **new version** plus accurately dated entries. Set `version` to the public release and put the newest entry first.
- Update the version footer in `dist/index.html`. Update `dist/sw.js` cache name whenever modifying the app shell.
- The GitHub Pages workflow deploys files in `dist/` from `main`. Opening the installed app checks the release feed without reinstalling.
- In-app updates are shown by a bell dot and a quiet notice after opening the app. Visitors can disable that notice. No background push or emails are sent.
- A visitor's last opened game or study is saved **locally** on the device. This is a shortcut, not cross-device progress syncing.

## Prayer submissions
Project: Supabase `ueethdfucapmdwuananu` (existing Church Challenge project with AWE analytics). Edge Function: `awe-prayer`. Table: `public.awe_prayer_submissions`.

- Visitors may submit private requests (default) or explicitly consent to public review.
- All requests and comments start with `status='pending'`. Private requests have `public_consent=false` and cannot be approved by the database constraint.
- **Moderate in Supabase Studio:** Open the project Table Editor, `awe_prayer_submissions`, filter by `status=pending`. Read the request. Never publish personal contact info, medical details, addresses, or identifiable child information without appropriate permission.
- To publish an eligible prayer, confirm `public_consent=true`, optionally edit `title`, `body` and `name` to avoid unintended disclosure, then change `status` to `approved`. To reject, change to `rejected`.
- For comments, check the referenced `parent_id` prayer is approved and evaluate content before changing comment status to approved.
- Public GET responses only include approved, consented prayers and approved comments. The database table has RLS enabled with no public policies and public grants revoked. Only the server-side Edge Function can access submissions using its secret key.
- Contact submissions do not send email automatically. Review pending requests in Supabase Studio frequently.
- Limit is five submissions per IP fingerprint per hour, plus a bot honeypot field; this reduces but does not eliminate spam.
- To stop submissions immediately, disable the `awe-prayer` Edge Function. The front end displays an error and an email fallback.

## Verification
- Confirm opening the homepage, Guide, Explore tiles, Games, Story Time, and What's New on mobile.
- Check the release bell dot disappears after reading What's New and returns on the next version.
- Check a private prayer POST shows confirmation without publishing content.
- Confirm an approved public prayer is shown on the wall and a pending or private one is not.
- Never test with real sensitive prayer text.
