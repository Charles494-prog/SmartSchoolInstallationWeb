# Photo guidelines

Photos make the problem real, but they also involve people's privacy – especially children's.

## Where photos may come from
1. **Your own photos** (best). You hold the rights; credit yourself.
2. **Openly licensed photos**, e.g. Wikimedia Commons under **CC0**, **CC BY** or **CC BY-SA**. Follow the license exactly: credit the author, name the license, link the source. Do not use "free to view" images from news sites or social media – those are not openly licensed.
3. **Contributed photos** – only with **written permission** from the photographer, kept on file. Note "Used with permission" as the license.

Every entry in `data/photos.json` needs `credit` and `license`, or the site will not show it.

## Children and people
- **Never** publish identifiable photos of minors without **written consent from the parent/guardian AND the school**. Keep the signed forms.
- Prefer photos of **buildings, classrooms, roads, equipment, chalkboards, empty desks**, or photos where **faces can't be recognized** (from behind, far away, blurred).
- No photos of **named individuals** (teachers, officials, students) without their consent.
- No name tags, uniforms with names, school IDs, or location details that identify a specific child.
- If anyone asks for a photo to be removed, remove it right away.

This follows the spirit of the Data Privacy Act of 2012 (RA 10173). This is not legal advice – when in doubt, leave the photo out or ask the school's data protection officer.

## Technical
- WebP, max 1200 px wide: run `./scripts/optimize-images.sh`.
- Put the real `width` and `height` in the JSON (prevents the page from jumping while loading).
- Write useful `alt_en` / `alt_tl` text describing what is in the photo.
