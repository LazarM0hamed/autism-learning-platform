/**
 * Odd One Out Engine (Activity #32 - L'Intrus)
 * Builds rule-checking, categorization, and inhibitory control across 3 progressive modes
 * (3 Images, 4 Images, Couleurs & Règles) with supportive visual coaching tags.
 */

(() => {
    'use strict';

    const CLASSIC_FAMILIES = [
        {
            id: 'animals',
            familyName: { fr: 'les animaux', en: 'animals' },
            tag: { fr: 'Animal', en: 'Animal' },
            members: [
                { icon: '🐶', name: { fr: 'Chien',    en: 'Dog' } },
                { icon: '🐱', name: { fr: 'Chat',     en: 'Cat' } },
                { icon: '🐰', name: { fr: 'Lapin',    en: 'Rabbit' } },
                { icon: '🐘', name: { fr: 'Éléphant', en: 'Elephant' } },
                { icon: '🦁', name: { fr: 'Lion',     en: 'Lion' } }
            ],
            intruders: [
                { icon: '🚗', name: { fr: 'Voiture',  en: 'Car' } },
                { icon: '🍎', name: { fr: 'Pomme',    en: 'Apple' } },
                { icon: '👟', name: { fr: 'Chaussure',en: 'Shoe' } }
            ]
        },
        {
            id: 'fruits',
            familyName: { fr: 'les fruits', en: 'fruits' },
            tag: { fr: 'Fruit', en: 'Fruit' },
            members: [
                { icon: '🍎', name: { fr: 'Pomme',    en: 'Apple' } },
                { icon: '🍌', name: { fr: 'Banane',   en: 'Banana' } },
                { icon: '🍓', name: { fr: 'Fraise',   en: 'Strawberry' } },
                { icon: '🍊', name: { fr: 'Orange',   en: 'Orange' } },
                { icon: '🍇', name: { fr: 'Raisin',   en: 'Grapes' } }
            ],
            intruders: [
                { icon: '⚽', name: { fr: 'Ballon',   en: 'Ball' } },
                { icon: '🚌', name: { fr: 'Bus',      en: 'Bus' } },
                { icon: '🧸', name: { fr: 'Doudou',   en: 'Teddy Bear' } }
            ]
        },
        {
            id: 'vehicles',
            familyName: { fr: 'les transports', en: 'vehicles' },
            tag: { fr: 'Transport', en: 'Vehicle' },
            members: [
                { icon: '🚗', name: { fr: 'Voiture',  en: 'Car' } },
                { icon: '🚂', name: { fr: 'Train',    en: 'Train' } },
                { icon: '✈️', name: { fr: 'Avion',    en: 'Airplane' } },
                { icon: '🚲', name: { fr: 'Vélo',     en: 'Bicycle' } },
                { icon: '⛵', name: { fr: 'Bateau',   en: 'Boat' } }
            ],
            intruders: [
                { icon: '🍌', name: { fr: 'Banane',   en: 'Banana' } },
                { icon: '🐶', name: { fr: 'Chien',    en: 'Dog' } },
                { icon: '🌸', name: { fr: 'Fleur',    en: 'Flower' } }
            ]
        },
        {
            id: 'clothes',
            familyName: { fr: 'les vêtements', en: 'clothes' },
            tag: { fr: 'Vêtement', en: 'Clothes' },
            members: [
                { icon: '👕', name: { fr: 'T-shirt',    en: 'T-shirt' } },
                { icon: '👖', name: { fr: 'Pantalon',   en: 'Pants' } },
                { icon: '🧦', name: { fr: 'Chaussettes',en: 'Socks' } },
                { icon: '🧥', name: { fr: 'Manteau',    en: 'Coat' } },
                { icon: '🧢', name: { fr: 'Casquette',  en: 'Cap' } }
            ],
            intruders: [
                { icon: '🥕', name: { fr: 'Carotte',  en: 'Carrot' } },
                { icon: '🐟', name: { fr: 'Poisson',  en: 'Fish' } },
                { icon: '🎸', name: { fr: 'Guitare',  en: 'Guitar' } }
            ]
        },
        {
            id: 'instruments',
            familyName: { fr: 'les instruments de musique', en: 'musical instruments' },
            tag: { fr: 'Musique', en: 'Music' },
            members: [
                { icon: '🎹', name: { fr: 'Piano',     en: 'Piano' } },
                { icon: '🥁', name: { fr: 'Tambour',   en: 'Drum' } },
                { icon: '🎸', name: { fr: 'Guitare',   en: 'Guitar' } },
                { icon: '🎺', name: { fr: 'Trompette', en: 'Trumpet' } }
            ],
            intruders: [
                { icon: '🥦', name: { fr: 'Brocoli',   en: 'Broccoli' } },
                { icon: '🦆', name: { fr: 'Canard',    en: 'Duck' } },
                { icon: '🛏️', name: { fr: 'Lit',       en: 'Bed' } }
            ]
        },
        {
            id: 'vegetables',
            familyName: { fr: 'les légumes', en: 'vegetables' },
            tag: { fr: 'Légume', en: 'Vegetable' },
            members: [
                { icon: '🥕', name: { fr: 'Carotte',   en: 'Carrot' } },
                { icon: '🥦', name: { fr: 'Brocoli',   en: 'Broccoli' } },
                { icon: '🌽', name: { fr: 'Maïs',      en: 'Corn' } },
                { icon: '🍅', name: { fr: 'Tomate',    en: 'Tomato' } }
            ],
            intruders: [
                { icon: '✈️', name: { fr: 'Avion',     en: 'Airplane' } },
                { icon: '🐱', name: { fr: 'Chat',      en: 'Cat' } },
                { icon: '✏️', name: { fr: 'Crayon',    en: 'Pencil' } }
            ]
        }
    ];

    const PROPERTY_FAMILIES = [
        {
            id: 'red_objects',
            familyName: { fr: 'les objets rouges', en: 'red objects' },
            tag: { fr: 'Rouge 🔴', en: 'Red 🔴' },
            members: [
                { icon: '🍓', name: { fr: 'Fraise',     en: 'Strawberry' } },
                { icon: '🚒', name: { fr: 'Camion pompier', en: 'Fire Truck' } },
                { icon: '🐞', name: { fr: 'Coccinelle', en: 'Ladybug' } },
                { icon: '🌹', name: { fr: 'Rose',       en: 'Rose' } }
            ],
            intruders: [
                { icon: '🍌', name: { fr: 'Banane jaune', en: 'Yellow Banana' } },
                { icon: '🐳', name: { fr: 'Baleine bleue',en: 'Blue Whale' } },
                { icon: '🐸', name: { fr: 'Grenouille verte', en: 'Green Frog' } }
            ]
        },
        {
            id: 'flying_things',
            familyName: { fr: 'ceux qui volent dans le ciel', en: 'things that fly' },
            tag: { fr: 'Vole ☁️', en: 'Flies ☁️' },
            members: [
                { icon: '🦅', name: { fr: 'Aigle',       en: 'Eagle' } },
                { icon: '✈️', name: { fr: 'Avion',       en: 'Airplane' } },
                { icon: '🦋', name: { fr: 'Papillon',    en: 'Butterfly' } },
                { icon: '🚁', name: { fr: 'Hélicoptère', en: 'Helicopter' } }
            ],
            intruders: [
                { icon: '🐟', name: { fr: 'Poisson',     en: 'Fish' } },
                { icon: '🐢', name: { fr: 'Tortue',      en: 'Turtle' } },
                { icon: '🚂', name: { fr: 'Train',       en: 'Train' } }
            ]
        },
        {
            id: 'swimming_things',
            familyName: { fr: 'ceux qui nagent dans l’eau', en: 'animals that swim' },
            tag: { fr: 'Nage 🌊', en: 'Swims 🌊' },
            members: [
                { icon: '🐟', name: { fr: 'Poisson',  en: 'Fish' } },
                { icon: '🐬', name: { fr: 'Dauphin',  en: 'Dolphin' } },
                { icon: '🐙', name: { fr: 'Poulpe',   en: 'Octopus' } },
                { icon: '🐳', name: { fr: 'Baleine',  en: 'Whale' } }
            ],
            intruders: [
                { icon: '🦁', name: { fr: 'Lion',     en: 'Lion' } },
                { icon: '🚲', name: { fr: 'Vélo',     en: 'Bicycle' } },
                { icon: '🐦', name: { fr: 'Oiseau',   en: 'Bird' } }
            ]
        },
        {
            id: 'letters_only',
            familyName: { fr: 'les lettres', en: 'letters' },
            tag: { fr: 'Lettre 🔤', en: 'Letter 🔤' },
            members: [
                { icon: 'A', isText: true, name: { fr: 'Lettre A', en: 'Letter A' } },
                { icon: 'B', isText: true, name: { fr: 'Lettre B', en: 'Letter B' } },
                { icon: 'M', isText: true, name: { fr: 'Lettre M', en: 'Letter M' } },
                { icon: 'S', isText: true, name: { fr: 'Lettre S', en: 'Letter S' } }
            ],
            intruders: [
                { icon: '3', isText: true, name: { fr: 'Chiffre 3', en: 'Number 3' } },
                { icon: '5', isText: true, name: { fr: 'Chiffre 5', en: 'Number 5' } },
                { icon: '8', isText: true, name: { fr: 'Chiffre 8', en: 'Number 8' } }
            ]
        },
        {
            id: 'numbers_only',
            familyName: { fr: 'les chiffres', en: 'numbers' },
            tag: { fr: 'Chiffre 🔢', en: 'Number 🔢' },
            members: [
                { icon: '1', isText: true, name: { fr: 'Chiffre 1', en: 'Number 1' } },
                { icon: '2', isText: true, name: { fr: 'Chiffre 2', en: 'Number 2' } },
                { icon: '4', isText: true, name: { fr: 'Chiffre 4', en: 'Number 4' } },
                { icon: '7', isText: true, name: { fr: 'Chiffre 7', en: 'Number 7' } }
            ],
            intruders: [
                { icon: 'D', isText: true, name: { fr: 'Lettre D', en: 'Letter D' } },
                { icon: 'P', isText: true, name: { fr: 'Lettre P', en: 'Letter P' } },
                { icon: 'R', isText: true, name: { fr: 'Lettre R', en: 'Letter R' } }
            ]
        }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let gameMode = '3'; // '3' | '4' | 'props'
    let currentFamily = null;
    let lastFamilyId = null;
    let cardsData = [];
    let checkedMemberIndices = new Set();
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
            utter.rate = 0.92;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }

    function playSoftClick() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(380, now);
            gain.gain.setValueAtTime(0.14, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.11);
        } catch (e) {}
    }

    function playVictoryChime() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, now + i * 0.09);
                gain.gain.setValueAtTime(0.2, now + i * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.09);
                osc.stop(now + i * 0.09 + 0.32);
            });
        } catch (e) {}
    }

    function startRound() {
        isSolved = false;
        checkedMemberIndices.clear();

        const pool = gameMode === 'props' ? PROPERTY_FAMILIES : CLASSIC_FAMILIES;
        const candidates = pool.filter(f => f.id !== lastFamilyId);
        currentFamily = candidates[Math.floor(Math.random() * candidates.length)];
        lastFamilyId = currentFamily.id;

        const familySize = gameMode === '3' ? 2 : 3;
        const chosenMembers = [...currentFamily.members]
            .sort(() => Math.random() - 0.5)
            .slice(0, familySize)
            .map(m => ({ ...m, isIntruder: false }));

        const chosenIntruder = {
            ...currentFamily.intruders[Math.floor(Math.random() * currentFamily.intruders.length)],
            isIntruder: true
        };

        cardsData = [...chosenMembers, chosenIntruder].sort(() => Math.random() - 0.5);

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`intruder_${gameMode}_${currentFamily.id}`);
        }

        updateBanner();
        renderCards();
        speak(getPromptText());

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function getPromptText() {
        if (isSolved) {
            const intr = cardsData.find(c => c.isIntruder);
            return lang === 'fr'
                ? `Bravo ! ${intr ? intr.name.fr : ''} est l'intrus ! 🌟`
                : `Great job! ${intr ? intr.name.en : ''} is the odd one out! 🌟`;
        }
        return lang === 'fr'
            ? "Trouve l'intrus : lequel ne va pas avec les autres ?"
            : 'Find the odd one out: which one does not belong?';
    }

    function updateBanner() {
        const promptEl = document.getElementById('prompt-label');
        if (promptEl) promptEl.innerText = getPromptText();

        const banner = document.getElementById('rule-banner');
        const ruleText = document.getElementById('rule-text');
        if (!banner || !ruleText) return;

        if (isSolved) {
            banner.classList.add('solved-rule');
            ruleText.innerText = lang === 'fr'
                ? `✨ Les autres sont tous ${currentFamily.familyName.fr} !`
                : `✨ All the others are ${currentFamily.familyName.en}!`;
        } else {
            banner.classList.remove('solved-rule');
            const count = gameMode === '3' ? 2 : 3;
            ruleText.innerText = lang === 'fr'
                ? `${count} images vont ensemble, 1 est différente`
                : `${count} pictures belong together, 1 is different`;
        }
    }

    function renderCards() {
        const grid = document.getElementById('intruder-grid');
        if (!grid) return;
        grid.innerHTML = '';

        cardsData.forEach((item, idx) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'intruder-card';

            if (isSolved) {
                if (item.isIntruder) {
                    card.classList.add('intruder-found');
                } else {
                    card.classList.add('family-confirmed');
                }
            } else if (checkedMemberIndices.has(idx)) {
                card.classList.add('checked-member');
            }

            const badgeHtml = isSolved
                ? (item.isIntruder
                    ? `<span class="intruder-star-badge">⭐</span>`
                    : `<span class="family-tag" style="background:#10B981;">${currentFamily.tag[lang]}</span>`)
                : (checkedMemberIndices.has(idx)
                    ? `<span class="family-tag">${currentFamily.tag[lang]}</span>`
                    : '');

            const symbolClass = item.isText ? 'card-text-symbol' : 'card-emoji';

            card.innerHTML = `
                ${badgeHtml}
                <div class="${symbolClass}">${item.icon}</div>
                <div class="card-title">${item.name[lang]}</div>
            `;

            card.onclick = () => {
                if (isSolved) return;

                if (item.isIntruder) {
                    isSolved = true;
                    playVictoryChime();
                    updateBanner();
                    renderCards();

                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(`intruder_${gameMode}_${currentFamily.id}`);
                    }

                    const fullExplanation = lang === 'fr'
                        ? `Bravo ! ${item.name.fr} est l'intrus ! Les autres sont ${currentFamily.familyName.fr}.`
                        : `Great job! ${item.name.en} is the odd one out! The others are ${currentFamily.familyName.en}.`;
                    speak(fullExplanation);

                    setTimeout(startRound, 2400);
                } else {
                    checkedMemberIndices.add(idx);
                    playSoftClick();
                    renderCards();

                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt();
                    }

                    const coachHint = lang === 'fr'
                        ? `Oui, ${item.name.fr.toLowerCase()} fait partie de ${currentFamily.familyName.fr}. Cherche celui qui est différent !`
                        : `Yes, ${item.name.en.toLowerCase()} belongs to ${currentFamily.familyName.en}. Find the one that is different!`;
                    speak(coachHint);
                }
            };

            grid.appendChild(card);
        });

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setMode(mode, btnId) {
        gameMode = mode;
        lastFamilyId = null;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add('active');
        startRound();
        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setupControls() {
        const m3Btn = document.getElementById('mode-3-btn');
        if (m3Btn) m3Btn.onclick = () => setMode('3', 'mode-3-btn');

        const m4Btn = document.getElementById('mode-4-btn');
        if (m4Btn) m4Btn.onclick = () => setMode('4', 'mode-4-btn');

        const mPropsBtn = document.getElementById('mode-props-btn');
        if (mPropsBtn) mPropsBtn.onclick = () => setMode('props', 'mode-props-btn');

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) speakBtn.onclick = () => speak(getPromptText());

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled ? 'true' : 'false');
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            };
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            btn.onclick = () => {
                lang = btn.getAttribute('data-lang');
                localStorage.setItem('alp_lang', lang);
                document.querySelectorAll('.lang-btn').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
                });

                const homeBtn = document.getElementById('home-btn');
                if (homeBtn) homeBtn.innerText = lang === 'fr' ? '⬅️ Accueil' : '⬅️ Home';

                const title = document.getElementById('activity-title');
                if (title) title.innerText = lang === 'fr' ? "🕵️ L'Intrus" : '🕵️ Odd One Out';

                if (m3Btn) m3Btn.innerText = lang === 'fr' ? '⭐ 3 Images' : '⭐ 3 Pictures';
                if (m4Btn) m4Btn.innerText = lang === 'fr' ? '⭐⭐ 4 Images' : '⭐⭐ 4 Pictures';
                if (mPropsBtn) mPropsBtn.innerText = lang === 'fr' ? '⭐⭐⭐ Couleurs & Règles' : '⭐⭐⭐ Colors & Rules';

                updateBanner();
                renderCards();
                speak(getPromptText());
            };
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupControls();
            startRound();
        });
    } else {
        setupControls();
        startRound();
    }
})();
