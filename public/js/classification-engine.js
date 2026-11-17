// Classification & Tri Engine
// Autism Learning Platform - Tap-to-Sort Visual Classification across 6 Multi-Sensory Themes
// Animated spotlight fly-in, basket collection accumulation, procedural Web Audio & Button Controller support.

(() => {
    'use strict';

    const CLASSIFICATION_THEMES = [
        {
            id: 'colors',
            pill: { fr: '🎨 Couleurs', en: '🎨 Colors' },
            getRoundData: () => {
                const palettes = [
                    {
                        left:  { id: 'red',  icon: '🔴', color: '#FFE5E6', border: '#FF595E', label: { fr: 'Rouge', en: 'Red' } },
                        right: { id: 'blue', icon: '🔵', color: '#E0F2FE', border: '#1982C4', label: { fr: 'Bleu',  en: 'Blue' } },
                        items: [
                            { group: 'red',  icon: '🍓', name: { fr: 'Fraise rouge',   en: 'Red Strawberry' } },
                            { group: 'red',  icon: '🚒', name: { fr: 'Camion rouge',   en: 'Red Fire Truck' } },
                            { group: 'red',  icon: '🐞', name: { fr: 'Coccinelle rouge', en: 'Red Ladybug' } },
                            { group: 'blue', icon: '🐳', name: { fr: 'Baleine bleue',  en: 'Blue Whale' } },
                            { group: 'blue', icon: '🫐', name: { fr: 'Myrtille bleue', en: 'Blueberry' } },
                            { group: 'blue', icon: '🧢', name: { fr: 'Casquette bleue', en: 'Blue Cap' } }
                        ]
                    },
                    {
                        left:  { id: 'yellow', icon: '🟡', color: '#FEF9C3', border: '#EAB308', label: { fr: 'Jaune', en: 'Yellow' } },
                        right: { id: 'green',  icon: '🟢', color: '#DCFCE7', border: '#22C55E', label: { fr: 'Vert',  en: 'Green' } },
                        items: [
                            { group: 'yellow', icon: '🍌', name: { fr: 'Banane jaune',  en: 'Yellow Banana' } },
                            { group: 'yellow', icon: '☀️', name: { fr: 'Soleil jaune',  en: 'Yellow Sun' } },
                            { group: 'yellow', icon: '🐥', name: { fr: 'Poussin jaune', en: 'Yellow Chick' } },
                            { group: 'green',  icon: '🐸', name: { fr: 'Grenouille verte', en: 'Green Frog' } },
                            { group: 'green',  icon: '🥦', name: { fr: 'Brocoli vert',  en: 'Green Broccoli' } },
                            { group: 'green',  icon: '🐢', name: { fr: 'Tortue verte',  en: 'Green Turtle' } }
                        ]
                    }
                ];
                return palettes[Math.floor(Math.random() * palettes.length)];
            }
        },
        {
            id: 'fruits_veg',
            pill: { fr: '🍎 Fruits / 🥕 Légumes', en: '🍎 Fruits / 🥕 Veggies' },
            getRoundData: () => ({
                left:  { id: 'fruit', icon: '🍎', color: '#FFF5F5', border: '#FC8181', label: { fr: 'Fruits',  en: 'Fruits' } },
                right: { id: 'veg',   icon: '🥕', color: '#F0FFF4', border: '#68D391', label: { fr: 'Légumes', en: 'Vegetables' } },
                items: [
                    { group: 'fruit', icon: '🍌', name: { fr: 'Banane',    en: 'Banana' } },
                    { group: 'fruit', icon: '🍓', name: { fr: 'Fraise',    en: 'Strawberry' } },
                    { group: 'fruit', icon: '🍊', name: { fr: 'Orange',    en: 'Orange' } },
                    { group: 'fruit', icon: '🍇', name: { fr: 'Raisin',    en: 'Grapes' } },
                    { group: 'veg',   icon: '🥕', name: { fr: 'Carotte',   en: 'Carrot' } },
                    { group: 'veg',   icon: '🥦', name: { fr: 'Brocoli',   en: 'Broccoli' } },
                    { group: 'veg',   icon: '🌽', name: { fr: 'Maïs',      en: 'Corn' } },
                    { group: 'veg',   icon: '🍆', name: { fr: 'Aubergine', en: 'Eggplant' } }
                ]
            })
        },
        {
            id: 'letters_numbers',
            pill: { fr: '🔤 Lettres / 🔢 Chiffres', en: '🔤 Letters / 🔢 Numbers' },
            getRoundData: () => ({
                left:  { id: 'letter', icon: '🔤', color: '#EBF8FF', border: '#63B3ED', label: { fr: 'Lettres',  en: 'Letters' } },
                right: { id: 'number', icon: '🔢', color: '#FAF5FF', border: '#B794F4', label: { fr: 'Chiffres', en: 'Numbers' } },
                items: [
                    { group: 'letter', icon: 'A', isText: true, name: { fr: 'Lettre A', en: 'Letter A' } },
                    { group: 'letter', icon: 'B', isText: true, name: { fr: 'Lettre B', en: 'Letter B' } },
                    { group: 'letter', icon: 'M', isText: true, name: { fr: 'Lettre M', en: 'Letter M' } },
                    { group: 'letter', icon: 'S', isText: true, name: { fr: 'Lettre S', en: 'Letter S' } },
                    { group: 'number', icon: '1', isText: true, name: { fr: 'Chiffre 1', en: 'Number 1' } },
                    { group: 'number', icon: '3', isText: true, name: { fr: 'Chiffre 3', en: 'Number 3' } },
                    { group: 'number', icon: '5', isText: true, name: { fr: 'Chiffre 5', en: 'Number 5' } },
                    { group: 'number', icon: '8', isText: true, name: { fr: 'Chiffre 8', en: 'Number 8' } }
                ]
            })
        },
        {
            id: 'animals_insects',
            pill: { fr: '🐾 Animaux / 🐝 Insectes', en: '🐾 Animals / 🐝 Insects' },
            getRoundData: () => ({
                left:  { id: 'animal', icon: '🐾', color: '#FFFBEB', border: '#F6AD55', label: { fr: 'Animaux',  en: 'Animals' } },
                right: { id: 'insect', icon: '🐝', color: '#F0FFF4', border: '#48BB78', label: { fr: 'Insectes', en: 'Insects' } },
                items: [
                    { group: 'animal', icon: '🐶', name: { fr: 'Chien',      en: 'Dog' } },
                    { group: 'animal', icon: '🐱', name: { fr: 'Chat',       en: 'Cat' } },
                    { group: 'animal', icon: '🐘', name: { fr: 'Éléphant',   en: 'Elephant' } },
                    { group: 'animal', icon: '🐰', name: { fr: 'Lapin',      en: 'Rabbit' } },
                    { group: 'insect', icon: '🐝', name: { fr: 'Abeille',    en: 'Bee' } },
                    { group: 'insect', icon: '🦋', name: { fr: 'Papillon',   en: 'Butterfly' } },
                    { group: 'insect', icon: '🐞', name: { fr: 'Coccinelle', en: 'Ladybug' } },
                    { group: 'insect', icon: '🐜', name: { fr: 'Fourmi',     en: 'Ant' } }
                ]
            })
        },
        {
            id: 'fly_swim',
            pill: { fr: '🦅 Vole / 🐟 Nage', en: '🦅 Flying / 🐟 Swimming' },
            getRoundData: () => ({
                left:  { id: 'fly',  icon: '☁️', color: '#EBF8FF', border: '#4299E1', label: { fr: 'Dans le ciel (Vole)', en: 'In the Sky (Flies)' } },
                right: { id: 'swim', icon: '🌊', color: '#E6FFFA', border: '#319795', label: { fr: "Dans l'eau (Nage)",   en: 'In Water (Swims)' } },
                items: [
                    { group: 'fly',  icon: '🦅', name: { fr: 'Aigle',     en: 'Eagle' } },
                    { group: 'fly',  icon: '✈️', name: { fr: 'Avion',     en: 'Airplane' } },
                    { group: 'fly',  icon: '🦋', name: { fr: 'Papillon',  en: 'Butterfly' } },
                    { group: 'fly',  icon: '🚁', name: { fr: 'Hélicoptère', en: 'Helicopter' } },
                    { group: 'swim', icon: '🐟', name: { fr: 'Poisson',   en: 'Fish' } },
                    { group: 'swim', icon: '🐬', name: { fr: 'Dauphin',   en: 'Dolphin' } },
                    { group: 'swim', icon: '🐙', name: { fr: 'Poulpe',    en: 'Octopus' } },
                    { group: 'swim', icon: '🦈', name: { fr: 'Requin',    en: 'Shark' } }
                ]
            })
        },
        {
            id: 'flowers_rocks',
            pill: { fr: '🌸 Fleurs / 🪨 Cailloux', en: '🌸 Flowers / 🪨 Rocks' },
            getRoundData: () => ({
                left:  { id: 'flower', icon: '🌸', color: '#FFF5F7', border: '#F687B3', label: { fr: 'Fleurs & Plantes', en: 'Flowers & Plants' } },
                right: { id: 'rock',   icon: '🪨', color: '#EDF2F7', border: '#718096', label: { fr: 'Cailloux & Pierres', en: 'Rocks & Stones' } },
                items: [
                    { group: 'flower', icon: '🌸', name: { fr: 'Fleur rose',  en: 'Pink Flower' } },
                    { group: 'flower', icon: '🌻', name: { fr: 'Tournesol',   en: 'Sunflower' } },
                    { group: 'flower', icon: '🌷', name: { fr: 'Tulipe',      en: 'Tulip' } },
                    { group: 'flower', icon: '🌹', name: { fr: 'Rose',        en: 'Rose' } },
                    { group: 'rock',   icon: '🪨', name: { fr: 'Gros caillou', en: 'Big Rock' } },
                    { group: 'rock',   icon: '⛰️', name: { fr: 'Montagne de pierre', en: 'Rocky Mountain' } },
                    { group: 'rock',   icon: '💎', name: { fr: 'Pierre précieuse', en: 'Gemstone' } },
                    { group: 'rock',   icon: '🧱', name: { fr: 'Brique de pierre', en: 'Stone Brick' } }
                ]
            })
        }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentThemeIdx = 0;
    let roundConfig = null;
    let queue = [];
    let currentIdx = 0;
    let leftCollected = [];
    let rightCollected = [];
    let isAnimating = false;
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

    function playSortTone(pitch = 480) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(pitch, now);
            osc.frequency.exponentialRampToValueAtTime(pitch * 1.35, now + 0.14);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.17);
        } catch (e) {}
    }

    function playRoundCompleteSound() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            [523.2, 659.3, 784.0, 1046.5].forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, now + i * 0.1);
                gain.gain.setValueAtTime(0.2, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.32);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.34);
            });
        } catch (e) {}
    }

    function renderThemePills() {
        const nav = document.getElementById('classify-pills');
        if (!nav) return;
        nav.innerHTML = '';
        CLASSIFICATION_THEMES.forEach((th, idx) => {
            const btn = document.createElement('button');
            btn.className = 'routine-pill' + (idx === currentThemeIdx ? ' active' : '');
            btn.innerText = th.pill[lang] || th.pill.fr;
            btn.onclick = () => startTheme(idx);
            nav.appendChild(btn);
        });
    }

    function startTheme(idx) {
        currentThemeIdx = idx;
        isAnimating = false;
        roundConfig = CLASSIFICATION_THEMES[currentThemeIdx].getRoundData();

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`classification_${roundConfig.left.id}_${roundConfig.right.id}`);
        }

        // Pick 3 from left group + 3 from right group and shuffle (6 items total per round)
        const leftPool = roundConfig.items.filter(i => i.group === roundConfig.left.id).sort(() => Math.random() - 0.5).slice(0, 3);
        const rightPool = roundConfig.items.filter(i => i.group === roundConfig.right.id).sort(() => Math.random() - 0.5).slice(0, 3);
        queue = [...leftPool, ...rightPool].sort(() => Math.random() - 0.5);

        currentIdx = 0;
        leftCollected = [];
        rightCollected = [];

        renderThemePills();
        renderAll(true);
    }

    function getPromptText() {
        if (currentIdx >= queue.length) {
            return lang === 'fr'
                ? 'Bravo ! Tout est bien rangé ! 🌟'
                : 'Awesome! Everything is sorted! 🌟';
        }
        const item = queue[currentIdx];
        return lang === 'fr'
            ? `Où va : ${item.name.fr} ?`
            : `Where does ${item.name.en} go?`;
    }

    function renderProgressDots() {
        const dotsEl = document.getElementById('progress-dots');
        if (!dotsEl) return;
        dotsEl.innerHTML = '';
        queue.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.className = 'p-dot';
            if (idx < currentIdx) dot.classList.add('done');
            else if (idx === currentIdx) dot.classList.add('current');
            dotsEl.appendChild(dot);
        });
    }

    function renderSpotlight() {
        const card = document.getElementById('spotlight-card');
        if (!card) return;
        card.style.transform = 'translate(0, 0) scale(1)';
        card.style.opacity = '1';

        if (currentIdx >= queue.length) {
            card.innerHTML = `<div class="spotlight-visual">🏆</div><div class="spotlight-name">${lang === 'fr' ? 'Terminé !' : 'All Done!'}</div>`;
            return;
        }

        const item = queue[currentIdx];
        const visualStyle = item.isText ? 'font-family: Arial Rounded MT Bold, sans-serif; color: #2B6CB0; font-size: 4.8rem;' : '';
        card.innerHTML = `
            <div class="spotlight-visual" style="${visualStyle}">${item.icon}</div>
            <div class="spotlight-name">${item.name[lang] || item.name.fr}</div>
        `;
        card.onclick = () => speak(item.name[lang] || item.name.fr);
    }

    function renderBaskets() {
        const row = document.getElementById('baskets-row');
        if (!row) return;
        row.innerHTML = '';

        [
            { side: 'left',  cfg: roundConfig.left,  items: leftCollected },
            { side: 'right', cfg: roundConfig.right, items: rightCollected }
        ].forEach((b, idx) => {
            const box = document.createElement('div');
            box.className = 'sort-basket';
            box.id = `basket-${b.side}`;
            box.style.backgroundColor = b.cfg.color;
            box.style.borderColor = b.cfg.border;
            box.setAttribute('tabindex', '0');
            box.setAttribute('role', 'button');
            box.setAttribute('aria-label', b.cfg.label[lang] || b.cfg.label.fr);

            const badgesHtml = b.items.map(it => `<span class="mini-sorted-badge">${it.icon}</span>`).join('');
            box.innerHTML = `
                <div class="basket-header">
                    <span style="font-size:1.8rem;">${b.cfg.icon}</span>
                    <span>${b.cfg.label[lang] || b.cfg.label.fr}</span>
                </div>
                <div class="basket-collected">${badgesHtml}</div>
            `;

            box.onclick = () => handleBasketChoice(b.side, b.cfg.id, box);
            row.appendChild(box);
        });
    }

    function renderAll(shouldSpeak = false) {
        const prompt = getPromptText();
        const pEl = document.getElementById('prompt-label');
        if (pEl) pEl.innerText = prompt;
        if (shouldSpeak) speak(prompt);

        renderProgressDots();
        renderSpotlight();
        renderBaskets();
    }

    function handleBasketChoice(side, groupId, basketEl) {
        if (isAnimating || currentIdx >= queue.length) return;
        const currentItem = queue[currentIdx];
        const isCorrect = (currentItem.group === groupId);

        if (window.AlpTracker) {
            window.AlpTracker.onAttempt(isCorrect, groupId);
        }

        if (isCorrect) {
            isAnimating = true;
            playSortTone(460 + currentIdx * 40);
            basketEl.classList.add('flash-success');

            // Animate spotlight card flying toward the chosen basket
            const card = document.getElementById('spotlight-card');
            const offsetX = side === 'left' ? -155 : 155;
            if (card) {
                card.style.transform = `translate(${offsetX}px, 145px) scale(0.35)`;
                card.style.opacity = '0';
            }

            setTimeout(() => {
                if (side === 'left') leftCollected.push(currentItem);
                else rightCollected.push(currentItem);

                currentIdx++;
                isAnimating = false;
                renderAll(true);

                if (currentIdx >= queue.length) {
                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(`classification_${roundConfig.left.id}_${roundConfig.right.id}`);
                    }
                    playRoundCompleteSound();
                    setTimeout(() => startTheme(currentThemeIdx), 2100);
                }
            }, 360);
        } else {
            // Gentle voice prompt reminder without error buzzers
            speak(getPromptText());
        }
    }

    function setupControls() {
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

        // Direct number keys 1 and 2 to choose Left Basket or Right Basket
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (e.key === '1') {
                const bLeft = document.getElementById('basket-left');
                if (bLeft) bLeft.click();
            } else if (e.key === '2') {
                const bRight = document.getElementById('basket-right');
                if (bRight) bRight.click();
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
                if (titleEl) titleEl.innerText = lang === 'fr' ? '🗂️ Classification & Tri' : '🗂️ Classification & Sorting';

                renderThemePills();
                renderAll(true);
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
        if (titleEl) titleEl.innerText = lang === 'fr' ? '🗂️ Classification & Tri' : '🗂️ Classification & Sorting';

        setupControls();
        startTheme(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
