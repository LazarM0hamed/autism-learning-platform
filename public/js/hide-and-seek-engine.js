// Hide & Seek Engine (Cache-Cache Visuel)
// Autism Learning Platform - Progressive Visual Discrimination & Sustained Attention
// Visual Similarity Grid, Gentle Error Dimming, Procedural Chimes & Button Controller Support.

(() => {
    'use strict';

    const HIDE_AND_SEEK_THEMES = [
        {
            id: 'similar_animals',
            pill: { fr: '🦊 Animaux proches', en: '🦊 Similar Animals' },
            groups: [
                [
                    { icon: '🦊', name: { fr: 'le renard',  en: 'the fox' } },
                    { icon: '🐶', name: { fr: 'le chien',   en: 'the dog' } },
                    { icon: '🐱', name: { fr: 'le chat',    en: 'the cat' } },
                    { icon: '🐻', name: { fr: "l'ours",     en: 'the bear' } },
                    { icon: '🦁', name: { fr: 'le lion',    en: 'the lion' } },
                    { icon: '🐯', name: { fr: 'le tigre',   en: 'the tiger' } }
                ],
                [
                    { icon: '🐸', name: { fr: 'la grenouille', en: 'the frog' } },
                    { icon: '🐢', name: { fr: 'la tortue',     en: 'the turtle' } },
                    { icon: '🐊', name: { fr: 'le crocodile',  en: 'the crocodile' } },
                    { icon: '🦎', name: { fr: 'le lézard',     en: 'the lizard' } },
                    { icon: '🦖', name: { fr: 'le dinosaure',  en: 'the dinosaur' } }
                ]
            ]
        },
        {
            id: 'red_items',
            pill: { fr: '🍎 Objets rouges', en: '🍎 Red Objects' },
            groups: [
                [
                    { icon: '🍎', name: { fr: 'la pomme',      en: 'the apple' } },
                    { icon: '🍅', name: { fr: 'la tomate',     en: 'the tomato' } },
                    { icon: '🍓', name: { fr: 'la fraise',     en: 'the strawberry' } },
                    { icon: '🍒', name: { fr: 'les cerises',   en: 'the cherries' } },
                    { icon: '🍉', name: { fr: 'la pastèque',   en: 'the watermelon' } },
                    { icon: '🌹', name: { fr: 'la rose',       en: 'the rose' } }
                ]
            ]
        },
        {
            id: 'bugs',
            pill: { fr: '🐝 Petites bêtes', en: '🐝 Little Bugs' },
            groups: [
                [
                    { icon: '🐝', name: { fr: "l'abeille",     en: 'the bee' } },
                    { icon: '🐞', name: { fr: 'la coccinelle', en: 'the ladybug' } },
                    { icon: '🦋', name: { fr: 'le papillon',   en: 'the butterfly' } },
                    { icon: '🐛', name: { fr: 'la chenille',   en: 'the caterpillar' } },
                    { icon: '🐜', name: { fr: 'la fourmi',     en: 'the ant' } },
                    { icon: '🪲', name: { fr: 'le scarabée',   en: 'the beetle' } }
                ]
            ]
        },
        {
            id: 'vehicles',
            pill: { fr: '🚒 Transports', en: '🚒 Vehicles' },
            groups: [
                [
                    { icon: '🚒', name: { fr: 'le camion de pompiers', en: 'the fire truck' } },
                    { icon: '🚗', name: { fr: 'la voiture',            en: 'the car' } },
                    { icon: '🚕', name: { fr: 'le taxi',               en: 'the taxi' } },
                    { icon: '🚌', name: { fr: 'le bus',                en: 'the bus' } },
                    { icon: '🚐', name: { fr: 'la camionnette',        en: 'the van' } },
                    { icon: '🚜', name: { fr: 'le tracteur',           en: 'the tractor' } }
                ]
            ]
        },
        {
            id: 'faces',
            pill: { fr: '🥳 Visages', en: '🥳 Faces' },
            groups: [
                [
                    { icon: '🥳', name: { fr: 'le visage qui fait la fête', en: 'the party face' } },
                    { icon: '😊', name: { fr: 'le visage souriant',         en: 'the smiling face' } },
                    { icon: '😎', name: { fr: 'le visage avec lunettes',    en: 'the sunglasses face' } },
                    { icon: '🤩', name: { fr: 'le visage avec étoiles',     en: 'the star-eyes face' } },
                    { icon: '😮', name: { fr: 'le visage surpris',          en: 'the surprised face' } }
                ]
            ]
        },
        {
            id: 'letters_numbers',
            pill: { fr: '🔤 Lettres & Chiffres', en: '🔤 Letters & Numbers' },
            groups: [
                [
                    { icon: 'B', isText: true, name: { fr: 'la lettre B', en: 'letter B' } },
                    { icon: 'D', isText: true, name: { fr: 'la lettre D', en: 'letter D' } },
                    { icon: 'P', isText: true, name: { fr: 'la lettre P', en: 'letter P' } },
                    { icon: 'R', isText: true, name: { fr: 'la lettre R', en: 'letter R' } },
                    { icon: '8', isText: true, name: { fr: 'le chiffre 8', en: 'number 8' } }
                ],
                [
                    { icon: '6', isText: true, name: { fr: 'le chiffre 6', en: 'number 6' } },
                    { icon: '9', isText: true, name: { fr: 'le chiffre 9', en: 'number 9' } },
                    { icon: '0', isText: true, name: { fr: 'le chiffre 0', en: 'number 0' } },
                    { icon: '5', isText: true, name: { fr: 'le chiffre 5', en: 'number 5' } },
                    { icon: '3', isText: true, name: { fr: 'le chiffre 3', en: 'number 3' } }
                ]
            ]
        }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentThemeIdx = 0;
    let cols = 3;
    let rows = 3;
    let targetItem = null;
    let lastTargetIcon = null;
    let isSolved = false;
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function speak(text) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
            utter.rate = 0.94;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }

    function playFoundChime() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            [523.2, 659.3, 784.0, 1046.5].forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + i * 0.08);
                gain.gain.setValueAtTime(0.2, now + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.08);
                osc.stop(now + i * 0.08 + 0.32);
            });
        } catch (e) {}
    }

    function renderPills() {
        const nav = document.getElementById('has-pills');
        if (!nav) return;
        nav.innerHTML = '';
        HIDE_AND_SEEK_THEMES.forEach((th, idx) => {
            const btn = document.createElement('button');
            btn.className = 'routine-pill' + (idx === currentThemeIdx ? ' active' : '');
            btn.innerText = th.pill[lang] || th.pill.fr;
            btn.onclick = () => {
                currentThemeIdx = idx;
                lastTargetIcon = null;
                startRound();
            };
            nav.appendChild(btn);
        });
    }

    function getPromptText() {
        if (!targetItem) return '';
        return lang === 'fr'
            ? `Trouve ${targetItem.name.fr} !`
            : `Find ${targetItem.name.en}!`;
    }

    function startRound() {
        isSolved = false;
        renderPills();

        const theme = HIDE_AND_SEEK_THEMES[currentThemeIdx];
        const group = theme.groups[Math.floor(Math.random() * theme.groups.length)];

        // Pick 1 unique target (avoid repeating the exact same target twice in a row)
        const candidates = group.filter(item => item.icon !== lastTargetIcon);
        targetItem = candidates[Math.floor(Math.random() * candidates.length)];
        lastTargetIcon = targetItem.icon;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`hide_and_seek_${targetItem.icon}`);
        }

        const distractors = group.filter(item => item.icon !== targetItem.icon);
        const totalCells = cols * rows;

        // Build grid cells: exactly 1 target + (totalCells - 1) similar distractors
        const cellsData = [{ ...targetItem, isTarget: true }];
        for (let i = 1; i < totalCells; i++) {
            const d = distractors[Math.floor(Math.random() * distractors.length)];
            cellsData.push({ ...d, isTarget: false });
        }
        cellsData.sort(() => Math.random() - 0.5);

        // Update target banner
        const preview = document.getElementById('target-preview');
        if (preview) {
            preview.innerText = targetItem.icon;
            preview.style.fontFamily = targetItem.isText ? 'Arial Rounded MT Bold, sans-serif' : 'inherit';
        }

        const prompt = getPromptText();
        const pEl = document.getElementById('prompt-label');
        if (pEl) pEl.innerText = prompt;
        speak(prompt);

        // Render Grid
        const gridEl = document.getElementById('search-grid');
        if (!gridEl) return;
        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = `repeat(${cols}, auto)`;

        cellsData.forEach((cell, idx) => {
            const btn = document.createElement('button');
            btn.className = 'search-cell';
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-label', cell.name[lang] || cell.name.fr);
            if (cell.isText) btn.style.fontFamily = 'Arial Rounded MT Bold, sans-serif';
            btn.innerText = cell.icon;

            btn.onclick = () => {
                if (isSolved) return;

                if (window.AlpTracker) {
                    window.AlpTracker.onAttempt(cell.isTarget, cell.icon);
                }

                if (cell.isTarget) {
                    isSolved = true;
                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(`hide_and_seek_${targetItem.icon}`);
                    }
                    btn.classList.add('found-winner');
                    btn.innerHTML = `${cell.icon}<span style="position:absolute;top:-10px;right:-8px;font-size:1.5rem;" aria-hidden="true">⭐</span>`;
                    playFoundChime();

                    const praise = lang === 'fr'
                        ? `Bravo ! Tu as trouvé ${targetItem.name.fr} !`
                        : `Great job! You found ${targetItem.name.en}!`;
                    const promptLabel = document.getElementById('prompt-label');
                    if (promptLabel) promptLabel.innerText = praise;
                    speak(praise);

                    setTimeout(startRound, 1750);
                } else {
                    // Softly dim checked cell to narrow visual search without harsh errors
                    btn.classList.add('checked-miss');
                }
            };

            gridEl.appendChild(btn);
        });
    }

    function setupControls() {
        // Grid Size Switcher
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                cols = parseInt(btn.dataset.cols, 10);
                rows = parseInt(btn.dataset.rows, 10);
                startRound();
            };
        });

        document.getElementById('speak-prompt-btn')?.addEventListener('click', () => speak(getPromptText()));

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (!soundEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
            };
        }

        // Keyboard navigation support: numbers 1-9 to click grid cells
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (/^[1-9]$/.test(e.key)) {
                const idx = parseInt(e.key, 10) - 1;
                const cells = document.querySelectorAll('#search-grid .search-cell');
                if (cells[idx]) cells[idx].click();
            }
        });

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                lang = btn.dataset.lang;
                localStorage.setItem('alp_lang', lang);
                localStorage.setItem('appLang', lang);

                const homeBtn = document.getElementById('home-btn');
                if (homeBtn) homeBtn.innerText = lang === 'fr' ? '⬅️ Accueil' : '⬅️ Home';

                const titleEl = document.getElementById('activity-title');
                if (titleEl) titleEl.innerText = lang === 'fr' ? '🔍 Cache-Cache Visuel' : '🔍 Hide & Seek';

                const b3 = document.getElementById('grid-3x3-btn');
                if (b3) b3.innerText = lang === 'fr' ? '⭐ Grille 3×3 (9)' : '⭐ 3×3 Grid (9)';

                const b4 = document.getElementById('grid-4x4-btn');
                if (b4) b4.innerText = lang === 'fr' ? '⭐⭐ Grille 4×4 (16)' : '⭐⭐ 4×4 Grid (16)';

                const b5 = document.getElementById('grid-5x4-btn');
                if (b5) b5.innerText = lang === 'fr' ? '⭐⭐⭐ Grille 5×4 (20)' : '⭐⭐⭐ 5×4 Grid (20)';

                renderPills();
                const pEl = document.getElementById('prompt-label');
                if (pEl) pEl.innerText = getPromptText();
                speak(getPromptText());
            };
        });
    }

    function init() {
        document.querySelectorAll('.lang-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = lang === 'fr' ? '⬅️ Accueil' : '⬅️ Home';

        const titleEl = document.getElementById('activity-title');
        if (titleEl) titleEl.innerText = lang === 'fr' ? '🔍 Cache-Cache Visuel' : '🔍 Hide & Seek';

        const b3 = document.getElementById('grid-3x3-btn');
        if (b3) b3.innerText = lang === 'fr' ? '⭐ Grille 3×3 (9)' : '⭐ 3×3 Grid (9)';

        const b4 = document.getElementById('grid-4x4-btn');
        if (b4) b4.innerText = lang === 'fr' ? '⭐⭐ Grille 4×4 (16)' : '⭐⭐ 4×4 Grid (16)';

        const b5 = document.getElementById('grid-5x4-btn');
        if (b5) b5.innerText = lang === 'fr' ? '⭐⭐⭐ Grille 5×4 (20)' : '⭐⭐⭐ 5×4 Grid (20)';

        setupControls();
        startRound();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
