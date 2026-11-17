/*!
 * InfyniPay Documentation — small, dependency-free page behaviour.
 *
 * 1. Light/dark switch      — header button, remembered per browser.
 * 2. Sidebar scroll-spy     — highlights the section you are reading.
 * 3. Copy buttons           — one per code block.
 * 4. Mobile contents toggle — collapses the long sidebar on small screens.
 *
 * The theme is applied by the inline snippet in <head> before first paint;
 * this file only handles the click. Everything degrades gracefully: with JS
 * off you get the OS theme, a static sidebar and plain code blocks.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'ph-docs-theme';

    /* ---------------------------------------------------------------- theme */

    function systemTheme() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') || systemTheme();
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        var toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            var next = theme === 'dark' ? 'light' : 'dark';
            toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
            toggle.setAttribute('title', 'Switch to ' + next + ' theme');
        }
    }

    function initTheme() {
        var toggle = document.querySelector('.theme-toggle');
        if (!toggle) return;

        applyTheme(currentTheme());

        toggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch (e) {
                /* private mode — the choice just won't survive a reload */
            }
        });

        // Follow the OS while the reader has not chosen explicitly.
        if (window.matchMedia) {
            var query = window.matchMedia('(prefers-color-scheme: dark)');
            var onChange = function (event) {
                var stored = null;
                try {
                    stored = localStorage.getItem(STORAGE_KEY);
                } catch (e) { /* ignore */ }
                if (!stored) applyTheme(event.matches ? 'dark' : 'light');
            };
            if (query.addEventListener) query.addEventListener('change', onChange);
            else if (query.addListener) query.addListener(onChange);
        }
    }

    /* ------------------------------------------------------------ scroll-spy */

    // Sidebar links used to be same-page anchors and this decided which was
    // active by watching the scroll position. After the split they are real
    // URLs across fourteen pages, and the active one is now marked at BUILD
    // time from page.url — correct before first paint rather than after it.
    //
    // What remains worth doing on the client is an on-page contents list: on a
    // long page (the payments reference runs past 17KB) the sub-headings are
    // still worth tracking. It is built only where there is enough to track,
    // so short pages get no clutter.
    function initOnThisPage() {
        var content = document.querySelector('.content');
        var sidebar = document.querySelector('.sidebar');
        if (!content || !sidebar || !('IntersectionObserver' in window)) return;

        var heads = Array.prototype.slice.call(content.querySelectorAll('h2[id], h3[id]'));
        if (heads.length < 3) return;

        var box = document.createElement('div');
        box.className = 'sidebar-section on-this-page';
        var label = document.createElement('div');
        label.className = 'sidebar-heading';
        label.id = 'sidebar-on-this-page';
        label.textContent = 'On this page';
        var list = document.createElement('ul');
        list.className = 'sidebar-nav';
        list.setAttribute('aria-labelledby', label.id);

        var byId = {};
        heads.forEach(function (h) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent.trim();
            li.appendChild(a);
            list.appendChild(li);
            byId[h.id] = a;
        });
        box.appendChild(label);
        box.appendChild(list);
        sidebar.appendChild(box);

        var visible = new Set();
        function paint() {
            // Topmost heading still on screen wins, so scrolling past a short
            // one never leaves two lit or none.
            var best = null, bestTop = Infinity;
            visible.forEach(function (el) {
                var top = el.getBoundingClientRect().top;
                if (top < bestTop) { bestTop = top; best = el; }
            });
            heads.forEach(function (h) {
                var on = !!best && best.id === h.id;
                byId[h.id].classList.toggle('active', on);
                if (on) byId[h.id].setAttribute('aria-current', 'true');
                else byId[h.id].removeAttribute('aria-current');
            });
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) visible.add(entry.target);
                else visible.delete(entry.target);
            });
            paint();
        }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

        heads.forEach(function (h) { observer.observe(h); });
    }

    /* ---------------------------------------------------------- copy buttons */

    function initCopyButtons() {
        if (!navigator.clipboard) return;

        Array.prototype.forEach.call(document.querySelectorAll('.code-block'), function (block) {
            var pre = block.querySelector('pre');
            if (!pre) return;

            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'code-copy';
            button.textContent = 'Copy';
            button.setAttribute('aria-label', 'Copy code to clipboard');

            button.addEventListener('click', function () {
                navigator.clipboard.writeText(pre.textContent.trim()).then(
                    function () {
                        button.textContent = 'Copied';
                        setTimeout(function () {
                            button.textContent = 'Copy';
                        }, 1600);
                    },
                    function () {
                        button.textContent = 'Press Ctrl+C';
                        setTimeout(function () {
                            button.textContent = 'Copy';
                        }, 1600);
                    }
                );
            });

            block.appendChild(button);
        });
    }

    /* -------------------------------------------------------- mobile sidebar */

    function initSidebarToggle() {
        var toggle = document.querySelector('.sidebar-toggle');
        var sidebar = document.querySelector('.sidebar');
        if (!toggle || !sidebar) return;

        // Only collapse once JS can reopen it.
        sidebar.classList.add('is-collapsible');
        toggle.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');

        toggle.addEventListener('click', function () {
            var open = sidebar.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        // Picking a section on mobile should close the menu again.
        sidebar.addEventListener('click', function (event) {
            if (event.target.closest('a') && sidebar.classList.contains('is-open')) {
                sidebar.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function init() {
        initTheme();
        initOnThisPage();
        initCopyButtons();
        initSidebarToggle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
