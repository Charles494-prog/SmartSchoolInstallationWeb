// Theme toggle
document.getElementById('theme').addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
});

// Accessible tabs (arrow keys, Home/End)
const tabs = [...document.querySelectorAll('[role="tab"]')];
function select(tab, focus = true) {
    tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
}
tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
        const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault();
        select(tabs[(k + tabs.length) % tabs.length]);
    });
});
document.querySelectorAll('[data-tab-link]').forEach(a => a.addEventListener('click', () => {
    select(document.getElementById('tab-' + a.dataset.tabLink), false);
}));

// Copy buttons
document.querySelectorAll('.copy').forEach(b => b.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(b.previousElementSibling.innerText);
        b.textContent = 'Copied';
    } catch { b.textContent = 'Press Ctrl+C'; }
    setTimeout(() => (b.textContent = 'Copy'), 1600);
}));
