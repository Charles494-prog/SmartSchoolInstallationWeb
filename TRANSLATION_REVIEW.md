# Tagalog review list

All Tagalog lives in `i18n/tl.json` (plus `summary_tl`, `alt_tl`, `caption_tl` and `tl` fields in `data/*.json`).
The goal is natural, everyday Tagalog/Taglish that teachers actually use – not textbook Filipino.
Please have a native speaker (ideally a teacher) check these first:

| Key | Current Tagalog | Question |
|---|---|---|
| `hero.title` | Sa paaralan dapat napupunta ang pera, hindi sa software na hindi nagagamit. | Strong enough? Too long for a headline? |
| `hero.subtitle` | Malaking pondo ng bayan ang ginagastos… | "pondo ng bayan" vs "pera ng taumbayan" – which sounds more natural? |
| `problem.intro` | …Galing sa buwis ng mamamayan ang perang iyan… | Tone: factual, not accusatory? |
| `problem.closing` | Hindi kami kontra sa teknolohiya… | "kontra" vs "laban" |
| `who.c1.title` | Mga paaralan sa probinsya at may kakaunting gamit | Better phrase for "low-resource"? |
| `features.f4.title` | Mas kaunting papeles para sa guro | "papeles" vs "paperwork" (Taglish) |
| `install.detected` | Mukhang {device} ang gamit mo. Puwede kang pumili ng iba. | OK? |
| `download.checksum_text` | Ang checksum ay parang fingerprint ng file… | Is "checksum" understandable? Keep the English term? |
| `faq.q4` | Sino ang nag-aalaga nito? | "nag-aalaga" vs "nagme-maintain" |
| `oss.intro` | …Walang kompanyang puwedeng magkulong sa inyo… | "magkulong" (lock-in) clear enough? |
| `footer.disclaimer` | Hindi ito kaanib, inendorso, o konektado sa DepEd… | Legal tone correct? |
| `data/install-steps.json` | All `tl` step texts | Button names (e.g. "More info", "Run anyway") are kept in English on purpose because that's what Windows shows. |

General choices to confirm:
- English UI words kept as-is: *download, install, Wi-Fi, laptop, password, email, server, hosting, browser, QR, report card, grades, attendance, section*.
- Polite but friendly: "mo/ninyo" instead of "inyo po"; tell us if "po" should be added for teachers/principals.
