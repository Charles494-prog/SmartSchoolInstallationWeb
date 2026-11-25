/* SmartSchool – story layer: reveals, counters, scroll-linked desk, day-in-the-life scenes, network toggle,
   install timeline, typing code blocks, celebration, nav highlight, tilt and magnetic buttons. No libraries.
   Works with app.js: re-applies itself on the 'ss:rendered' event (language change re-renders sections). */
(() => {
    'use strict';
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!reduce) document.documentElement.classList.add('motion');

    // run once when an element first comes into view
    const once = (els, fn, opts = { threshold: 0.25 }) => {
        const io = new IntersectionObserver((entries) => entries.forEach((e) => {
            if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); }
        }), opts);
        els.forEach((n) => io.observe(n));
    };

    // ---------- counters ----------
    const fmt = (n) => Math.round(n).toLocaleString('en-US');
    function count(node, from, to, ms = 1400) {
        if (reduce) { node.textContent = fmt(to); return; }
        const t0 = performance.now();
        const step = (t) => {
            const k = Math.min(1, (t - t0) / ms); const e = 1 - Math.pow(1 - k, 3);
            node.textContent = fmt(from + (to - from) * e);
            if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }
    const runCounters = (root, delay = 0) => setTimeout(() => {
        $$('[data-count]', root).forEach((n) => count(n, 0, +n.dataset.count));
        $$('[data-countdown]', root).forEach((n) => { n.textContent = fmt(+n.dataset.countdown); setTimeout(() => count(n, +n.dataset.countdown, +n.dataset.to, 1200), reduce ? 0 : 1400); });
    }, reduce ? 0 : delay);

    // ---------- generic in-view animations ----------
    once($$('[data-anim]'), (n) => { n.classList.add('in'); runCounters(n, 300); });

    // ---------- scroll reveal for existing sections ----------
    const REVEAL = ['.section h2', '.section .section-lead', '.problem h2', '.problem .section-lead', '.card', '.feature', '.stat', '.evidence',
        '.callout', '.table-wrap', '.accordion > details', '.help', '.before', '.steps-panel .steps > li', '.quote', '.download-grid', '.problem-close', '.kicker'].join(',');
    function applyReveal() {
        if (reduce) return;
        const fresh = $$(REVEAL).filter((n) => !n.dataset.reveal && !n.closest('.hero'));
        fresh.forEach((n) => {
            n.dataset.reveal = '';
            const sibs = [...n.parentElement.children].filter((c) => c.matches(REVEAL));
            n.style.setProperty('--i', Math.min(sibs.indexOf(n), 6));
        });
        once(fresh, (n) => n.classList.add('in'), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }

    // ---------- scroll: progress bar + desk + install timeline ----------
    const bar = $('.progress');
    const desk = $('.desk');
    const panel = $('.steps-panel');
    let tl = null;
    if (panel) { tl = document.createElement('div'); tl.className = 'tl'; tl.setAttribute('aria-hidden', 'true'); panel.prepend(tl); }
    if (desk && reduce) { desk.classList.add('static', 'desk-done'); desk.style.setProperty('--p', 1); }

    let ticking = false;
    function onScroll() {
        ticking = false;
        const vh = innerHeight; const doc = document.documentElement;
        bar && bar.style.setProperty('--sp', (scrollY / Math.max(1, doc.scrollHeight - vh)).toFixed(4));
        if (desk && !reduce) {
            const r = desk.getBoundingClientRect();
            const total = r.height - vh;
            const raw = Math.min(1, Math.max(0, (-r.top) / Math.max(1, total)));
            const p = Math.min(1, Math.max(0, (raw - 0.15) / 0.6)); // hold messy, then fly, then hold clean
            desk.style.setProperty('--p', p.toFixed(4));
            desk.classList.toggle('messy', p < 0.02);
            desk.classList.toggle('desk-done', p > 0.98);
        }
        if (tl) {
            const r = panel.getBoundingClientRect();
            const f = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
            tl.style.setProperty('--fill', f.toFixed(4));
        }
    }
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req, { passive: true });
    onScroll();

    // ---------- day in the life ----------
    const scenes = $$('.scene');
    const screens = $$('.stage .screen');
    const clock = $('.dt-clock');
    const dots = $$('.dt-dots i');
    scenes.forEach((s) => { // mobile: each scene gets its own small device with a copy of its screen
        const src = screens[+s.dataset.scene]; if (!src) return;
        const wrap = document.createElement('div'); wrap.className = 'scene-device'; wrap.setAttribute('aria-hidden', 'true');
        const c = src.cloneNode(true); c.removeAttribute('data-screen'); wrap.append(c); s.append(wrap);
    });
    function activate(i) {
        scenes.forEach((s, k) => s.classList.toggle('is-active', k === i));
        screens.forEach((s, k) => {
            const on = k === i;
            if (on && !s.classList.contains('is-active')) { s.classList.add('is-active'); runCounters(s, 600); }
            else if (!on) s.classList.remove('is-active');
        });
        dots.forEach((d, k) => d.classList.toggle('on', k === i));
        if (clock && scenes[i]) clock.textContent = $('.time', scenes[i]).textContent;
        const mini = $('.scene-device', scenes[i]); if (mini && !mini.dataset.ran) { mini.dataset.ran = '1'; runCounters(mini, 600); }
    }
    if (scenes.length) {
        const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) activate(+e.target.dataset.scene); }),
            { rootMargin: '-45% 0px -45% 0px' });
        scenes.forEach((s) => io.observe(s));
        activate(0);
    }

    // ---------- network toggle ----------
    const seg = $('.seg'); const fig = $('.net-fig');
    if (seg && fig) {
        seg.dataset.mode = 'lan';
        seg.addEventListener('click', (e) => {
            const b = e.target.closest('[data-net]'); if (!b) return;
            const m = b.dataset.net;
            seg.dataset.mode = m; fig.dataset.mode = m;
            $$('[data-net]', seg).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        });
    }

    // ---------- install: typing code blocks + celebration (re-applied after each render) ----------
    function typeCode(code) {
        const full = code.textContent; code.dataset.full = full;
        if (reduce || !full) return;
        const pre = code.parentElement; pre.style.minHeight = pre.offsetHeight + 'px'; // reserve space: no layout shift
        code.textContent = ''; code.classList.add('typing');
        let i = 0; const speed = Math.max(8, Math.min(28, 1400 / full.length));
        const tick = () => {
            if (code.dataset.full !== full) return; // re-rendered meanwhile
            i += 1; code.textContent = full.slice(0, i);
            if (i < full.length) setTimeout(tick, speed); else { code.classList.remove('typing'); pre.style.minHeight = ''; }
        };
        setTimeout(tick, 250);
    }
    function enhanceInstall() {
        once($$('#install .code code, #download .code code').filter((c) => !c.dataset.full && c.textContent), typeCode, { threshold: 0.6 });
        const last = $('#steps > li:last-child');
        if (last && !$('.done-badge', last)) {
            last.classList.add('celebrate');
            const t = (window.__ssDone || 'All set!');
            const badge = document.createElement('p'); badge.className = 'done-badge';
            badge.innerHTML = '<svg viewBox="0 0 44 44" aria-hidden="true"><circle pathLength="1" cx="22" cy="22" r="19"/><path pathLength="1" d="M13 23l6 6 12-13"/></svg><span></span>';
            $('span', badge).textContent = t;
            last.lastElementChild.append(badge);
            const conf = document.createElement('div'); conf.className = 'confetti'; conf.setAttribute('aria-hidden', 'true');
            const colors = ['#4f46e5', '#0d9488', '#f59e0b', '#e11d48', '#22c55e'];
            for (let k = 0; k < 26; k++) {
                const i = document.createElement('i'); const a = (k / 26) * Math.PI * 2; const d = 60 + (k % 5) * 22;
                i.style.cssText = `background:${colors[k % 5]};--cx:${Math.cos(a) * d}px;--cy:${Math.sin(a) * d - 30}px;--cr:${k * 47}deg;animation-delay:${(k % 4) * 40}ms`;
                conf.append(i);
            }
            last.append(conf);
            once([last], (n) => n.classList.add('go'), { threshold: 0.6 });
        }
    }

    // ---------- nav active section ----------
    const links = $$('.main-nav a[href^="#"]');
    const targets = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const navIO = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => { const on = a.getAttribute('href') === '#' + e.target.id; a.classList.toggle('active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
    }), { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach((t) => navIO.observe(t));

    // ---------- tilt + magnetic (mouse only, motion allowed) ----------
    if (finePointer && !reduce) {
        document.addEventListener('pointermove', (e) => {
            const c = e.target.closest('.tilt');
            if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 6 + 'deg'); c.style.setProperty('--rx', -((e.clientY - r.top) / r.height - 0.5) * 6 + 'deg'); }
            const b = e.target.closest('.btn-primary');
            if (b) { const r = b.getBoundingClientRect(); b.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5) * 8 + 'px'); b.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5) * 6 + 'px'); }
        }, { passive: true });
        document.addEventListener('pointerout', (e) => {
            const c = e.target.closest('.tilt, .btn-primary'); if (!c || c.contains(e.relatedTarget)) return;
            ['--rx', '--ry', '--mx', '--my'].forEach((p) => c.style.removeProperty(p));
        });
    }
    const markTilt = () => $$('.card, .feature, .stat').forEach((n) => n.classList.add('tilt'));

    // ---------- after app.js renders (first load and each language change) ----------
    document.addEventListener('ss:rendered', () => {
        window.__ssDone = $('#done-text')?.textContent || window.__ssDone;
        $$('.done-badge span').forEach((s) => { s.textContent = window.__ssDone; });
        markTilt(); applyReveal(); enhanceInstall(); req();
    });
    markTilt(); applyReveal();
})();
