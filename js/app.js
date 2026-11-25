/* SmartSchool site: translations, data-driven sections, OS detection, copy buttons. No libraries. */
(() => {
    'use strict';

    const LANGS = ['en', 'tl'];
    const state = { lang: 'en', dict: {}, cache: {}, data: {}, device: null };

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const t = (key, vars = {}) => {
        const s = state.dict[key];
        if (s === undefined) { console.warn('[i18n] missing key:', key, 'in', state.lang); return key; }
        return s.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '');
    };
    const pick = (obj) => (obj && typeof obj === 'object' ? (obj[state.lang] ?? obj.en ?? '') : (obj ?? ''));
    const isTodo = (v) => typeof v === 'string' && v.includes('[TODO');
    const el = (tag, attrs = {}, ...children) => {
        const n = document.createElement(tag);
        for (const [k, v] of Object.entries(attrs)) {
            if (v === null || v === undefined || v === false) continue;
            if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v);
        }
        for (const c of children.flat()) if (c !== null && c !== undefined) n.append(c);
        return n;
    };
    const svg = (path, size = 24) => {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('width', size); s.setAttribute('height', size);
        s.innerHTML = path; return s;
    };

    async function getJSON(url) {
        const r = await fetch(url, { cache: 'no-cache' });
        if (!r.ok) throw new Error(url + ' ' + r.status);
        return r.json();
    }

    // ---------- language ----------
    function initialLang() {
        const saved = localStorage.getItem('lang');
        if (LANGS.includes(saved)) return saved;
        const nav = (navigator.languages || [navigator.language || 'en']).map((l) => l.toLowerCase());
        return nav.some((l) => l.startsWith('tl') || l.startsWith('fil')) ? 'tl' : 'en';
    }

    async function setLang(lang) {
        state.lang = lang;
        state.dict = state.cache[lang] || (state.cache[lang] = await getJSON(`i18n/${lang}.json`));
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang === 'tl' ? 'tl' : 'en';
        document.title = t('meta.title');
        $('meta[name="description"]').setAttribute('content', t('meta.description'));
        $$('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
        $$('[data-i18n-attr]').forEach((n) => n.dataset.i18nAttr.split(';').forEach((pair) => {
            const [attr, key] = pair.split(':'); n.setAttribute(attr.trim(), t(key.trim()));
        }));
        $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
        renderAll();
        document.dispatchEvent(new CustomEvent('ss:rendered'));
    }

    // ---------- sections built from data files ----------
    function renderStats() {
        const grid = $('#stat-grid'); if (!grid || !state.data.stats) return;
        grid.replaceChildren(...state.data.stats.stats.map((s) => {
            const figure = s.figure_key ? t(s.figure_key) : s.figure;
            const todo = !s.no_source_needed && (isTodo(figure) || !s.source_url);
            const partial = todo && !isTodo(figure); // figure known, link still missing
            return el('div', { class: 'stat' + (todo && !partial ? ' todo' : '') },
                el('div', { class: 'stat-figure', text: figure }),
                el('div', { class: 'stat-label', text: t(s.key) }),
                s.no_source_needed ? null
                : partial ? el('div', { class: 'stat-source', text: `${t('problem.source')}: ${s.source_name}` })
                : todo ? el('div', { class: 'todo-hint', text: t('problem.todo_hint') })
                    : el('div', { class: 'stat-source' }, t('problem.source') + ': ', el('a', { href: s.source_url, target: '_blank', rel: 'noopener', text: s.source_name || s.source_url })));
        }));
    }

    function renderEvidence() {
        const grid = $('#evidence-grid'); if (!grid || !state.data.evidence) return;
        grid.replaceChildren(...state.data.evidence.entries.map((e) => {
            if (isTodo(e.headline) && !e.summary_en.replace(/\[TODO[^\]]*\]/g, '').trim()) {
                return el('div', { class: 'evidence placeholder' },
                    svg('<path d="M12 5v14M5 12h14" stroke-linecap="round"/>', 36),
                    el('strong', { text: t('evidence.add_title') }),
                    el('span', { text: t('evidence.add_text') }));
            }
            const img = e.image && e.image.startsWith('assets/evidence/')
                ? el('figure', {}, el('img', { src: e.image, alt: e['image_alt_' + state.lang] || e.image_alt_en || '', loading: 'lazy', width: e.width || 1200, height: e.height || 800 }),
                    el('figcaption', { text: e.outlet }))
                : null;
            if (img) img.querySelector('img').addEventListener('error', () => img.remove());
            return el('article', { class: 'evidence' },
                el('span', { class: 'type', text: t(e.type === 'official-document' ? 'evidence.type_doc' : 'evidence.type_article') }),
                el('div', { class: 'meta', text: [e.outlet, e.date].filter(Boolean).join(' · ') }),
                el('h3', { text: e.headline.replace(/\[TODO[^\]]*\]\s*/g, '') }),
                img,
                el('p', { text: e['summary_' + state.lang] || e.summary_en }),
                e.url ? el('a', { class: 'read', href: e.url, target: '_blank', rel: 'noopener' }, t('evidence.read') + ' ', el('span', { class: 'sr-hint', text: t('evidence.new_tab') }))
                    : el('span', { class: 'todo-inline', text: t('evidence.add_link') }));
        }));
    }

    function renderPhotos() {
        const grid = $('#photo-grid'); if (!grid || !state.data.photos) return; // section removed from the page
        const valid = state.data.photos.photos.filter((p) => {
            if (!p.credit || !p.license) { console.warn('[photos] skipped – missing credit or license:', p.file); return false; }
            return !p.file.includes('placeholder');
        });
        $('#photos').hidden = valid.length === 0; // hide the gallery until real photos are added
        grid.replaceChildren(...valid.map((p) => {
            const fig = el('figure', { class: 'photo' },
                el('img', { src: p.file, alt: p['alt_' + state.lang] || p.alt_en, loading: 'lazy', decoding: 'async', width: p.width || 1200, height: p.height || 800 }),
                el('figcaption', {}, p['caption_' + state.lang] || p.caption_en,
                    el('span', { class: 'credit' },
                        `${t('photos.credit')}: ${p.credit} · ${t('photos.license')}: ${p.license}`,
                        p.source_url ? el('span', {}, ' · ', el('a', { href: p.source_url, target: '_blank', rel: 'noopener', text: t('photos.source') })) : null)));
            fig.querySelector('img').addEventListener('error', (ev) => { ev.target.replaceWith(el('div', { class: 'shot', text: p['alt_' + state.lang] || p.alt_en })); });
            return fig;
        }));
    }

    function detectDevice() {
        const ua = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '').toLowerCase();
        const full = navigator.userAgent.toLowerCase();
        if (/android|iphone|ipad/.test(full)) return null; // phones: let the user choose
        if (ua.includes('win')) return 'windows';
        if (ua.includes('mac')) return 'mac';
        if (ua.includes('linux') || ua.includes('x11')) return 'linux';
        return null;
    }

    const fileInfo = (p) => {
        const r = state.data.release;
        const size = p && p.size_mb ? `${p.size_mb} MB` : null;
        return r && !isTodo(r.version) ? t('hero.file_info', { version: r.version, size: size || '' }).replace(/ · $/, '') : '';
    };
    const windowsRelease = () => state.data.release?.platforms.find((p) => p.id === 'windows');
    const linuxCommand = () => state.data.install?.advanced.linux_command || '';
    const codeBlock = (cmd) => el('div', { class: 'code' }, el('pre', {}, el('code', { text: cmd })), el('button', { type: 'button', class: 'copy', text: t('install.copy') }));

    function windowsButton(big = true) {
        const w = windowsRelease(); const ready = w && w.url && !isTodo(w.url);
        const icon = svg('<path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16"/>', 22);
        return el('div', { class: 'dl-main' },
            ready ? el('a', { class: 'btn btn-primary' + (big ? ' btn-big' : ''), href: w.url, rel: 'noopener' }, icon, el('span', { text: t('hero.download_windows') }))
                : el('button', { class: 'btn btn-primary btn-disabled' + (big ? ' btn-big' : ''), type: 'button', disabled: '', 'aria-describedby': 'dl-note' }, icon, el('span', { text: `${t('hero.download_windows')} – ${t('hero.coming_soon')}` })),
            el('p', { class: 'dl-note', id: big ? 'dl-note' : null, text: ready ? fileInfo(w) : t('hero.installer_note') }));
    }

    // Hero: ONE main action. Windows (and phones/unknown) → the .exe; Linux/Mac → the one-command install.
    function renderHero() {
        const box = $('#hero-download'); if (!box) return;
        if (state.device === 'linux' || state.device === 'mac') {
            box.replaceChildren(el('div', { class: 'hero-linux' },
                el('p', { class: 'hero-linux-title', text: t('hero.linux_title') }),
                codeBlock(linuxCommand()),
                el('p', { class: 'dl-note', text: t('hero.linux_note') }),
                el('a', { href: '#download', class: 'small-link', text: t('hero.windows_too') })));
        } else {
            box.replaceChildren(windowsButton(true));
        }
    }

    function renderInstall() {
        const d = state.data.install; if (!d) return;
        $('#before-list').replaceChildren(...d.before.items.map((i) => el('li', { text: pick(i) })));
        $('#install-time').textContent = `${t('install.time_label')} ${pick(d.before.time)}`;
        const help = (mode) => el('div', { class: 'mode-help' },
            el('h5', { text: pick(mode.name) }),
            el('p', { class: 'mh-label', text: t('install.good_for') }), el('ul', { class: 'ticks' }, ...mode.good.map((x) => el('li', { text: pick(x) }))),
            el('p', { class: 'mh-label', text: t('install.keep_in_mind') }), el('ul', { class: 'dashes' }, ...mode.keep.map((x) => el('li', { text: pick(x) }))));
        const stepItem = (s) => el('li', {},
            el('div', {},
                el('h4', { text: pick(s.title) }),
                el('p', { text: pick(s.text) }),
                s.choose_help ? el('details', { class: 'not-sure' }, el('summary', { text: t('install.not_sure') }),
                    el('div', { class: 'mode-help-grid' }, help(d.choose_help.lan), help(d.choose_help.online))) : null,
                s.command ? codeBlock(s.command) : null,
                s.screenshot === undefined ? null : (s.screenshot
                    ? el('div', { class: 'shot' }, el('img', { src: s.screenshot, alt: pick(s.title), loading: 'lazy', width: 1200, height: 750 }))
                    : el('div', { class: 'shot', text: t('install.screenshot') }))));
        $('#steps').replaceChildren(...d.steps.map(stepItem));
        $('#linux-cmd').textContent = linuxCommand();
        $('#hosted-steps').replaceChildren(...d.advanced.hosted_steps.map(stepItem));
        $('#trouble').replaceChildren(...d.troubleshooting.map((x) => el('details', {}, el('summary', { text: pick(x.q) }), el('p', { text: pick(x.a) }))));
    }

    function renderDownloads() {
        const r = state.data.release; if (!r) return;
        $('#release-version').textContent = r.version;
        $('#release-date').textContent = r.date;
        const w = windowsRelease();
        $('#download-grid').replaceChildren(
            el('div', { class: 'dl dl-single' },
                el('div', { class: 'dl-name', text: 'Windows · SmartSchool-Setup.exe' }),
                windowsButton(false),
                w && w.sha256 ? el('div', { class: 'dl-meta', text: `${t('download.sha')}: ${w.sha256}` }) : null),
            el('p', { class: 'dl-other' }, el('a', { href: '#advanced', text: t('download.other') })));
    }

    function renderHosting() {
        const h = state.data.hosting; if (!h || !$('#hosting-rows')) return;
        $('#hosting-rows').replaceChildren(...h.tiers.map((r) => el('tr', {},
            el('th', { scope: 'row', text: pick(r.size) }),
            el('td', {}, el('span', { class: 'pill' + (r.mode === 'online' ? ' pill-online' : ''), text: t('host.' + r.mode) })),
            el('td', { text: pick(r.server) }), el('td', { text: pick(r.database) }), el('td', { text: pick(r.backup) }))));
        $('#hosting-guides').replaceChildren(...(h.guides || []).map((g) => el('details', {},
            el('summary', {}, pick(g.name) + ' ', el('span', { class: 'pill' + (g.status === 'ok' ? ' pill-online' : ''), text: t(g.status === 'ok' ? 'host.supported' : 'host.not_supported') })),
            el('div', { class: 'guide-body' },
                el('ol', { class: 'steps' }, ...g.steps.map((s) => el('li', {}, el('div', {}, el('h4', { text: pick(s.t) }), el('p', { text: pick(s.x) }), s.command ? codeBlock(s.command) : null)))),
                g.note ? el('p', { class: 'dl-note', text: pick(g.note) }) : null))));
        $('#hosting-ask').replaceChildren(...h.ask.map((a) => el('li', { text: pick(a) })));
    }

    function renderContact() {
        const c = state.data.release?.contact; const b = $('#contact-btn'); if (!b) return;
        if (!c || !c.url || isTodo(c.url)) { b.removeAttribute('href'); b.setAttribute('aria-disabled', 'true'); b.classList.add('btn-disabled'); b.title = c?.url || ''; }
        else { b.href = c.url; b.removeAttribute('aria-disabled'); b.classList.remove('btn-disabled'); if (c.url.startsWith('http')) { b.target = '_blank'; b.rel = 'noopener'; }
            let info = $('#contact-info'); if (!info) { info = el('p', { id: 'contact-info', class: 'dl-note' }); b.after(info); }
            info.replaceChildren(el('a', { href: `mailto:${c.email}`, text: c.email }), document.createTextNode(` · ${t('install.help_phone')}: `), el('a', { href: `tel:${c.phone}`, text: c.phone })); }
    }

    function renderAll() { renderContact(); renderHosting(); renderHero(); renderStats(); renderEvidence(); renderPhotos(); renderInstall(); renderDownloads(); }

    // ---------- copy buttons (event delegation, works for rendered steps too) ----------
    const toast = (msg) => { const n = $('#toast'); n.textContent = msg; n.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => n.classList.remove('show'), 1800); };
    document.addEventListener('click', async (e) => {
        const b = e.target.closest('.copy'); if (!b) return;
        const code = b.previousElementSibling?.querySelector('code');
        const text = code?.dataset.full || b.previousElementSibling?.innerText || '';
        try { await navigator.clipboard.writeText(text); b.textContent = t('install.copied'); b.classList.remove('copied'); void b.offsetWidth; b.classList.add('copied'); toast(t('install.copied')); }
        catch { toast(t('install.copy_failed')); }
        setTimeout(() => { b.textContent = t('install.copy'); b.classList.remove('copied'); }, 1800);
    });
    document.addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b) setLang(b.dataset.lang); });

    // ---------- start ----------
    async function start() {
        state.device = detectDevice() || 'windows';
        document.addEventListener('click', (e) => { if (e.target.closest('a[href="#advanced"]')) $('#advanced').open = true; });
        const files = { stats: 'data/stats.json', evidence: 'data/evidence.json', photos: 'data/photos.json', install: 'data/install-steps.json', release: 'data/release.json', hosting: 'data/hosting.json' };
        await Promise.all(Object.entries(files).map(async ([k, url]) => {
            try { state.data[k] = await getJSON(url); } catch (err) { console.error('[data] could not load', url, err); }
        }));
        await setLang(initialLang());
    }
    start().catch((err) => console.error(err));
})();
