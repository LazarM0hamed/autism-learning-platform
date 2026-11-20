/**
 * Syllables & Musical Phonics Engine (Activity #24)
 * Uses DO – RÉ – MI – FA – SOL as musical vowel anchors to teach consonant-vowel blending
 * through animated magnetic blocks and concrete anchor words.
 */

(() => {
    'use strict';

    const VOWEL_NOTES = [
        { id: 'O', vowelTts: 'o',   noteName: 'DO',  noteTts: 'dos', freq: 261.63, color: '#FF595E', darkText: false },
        { id: 'É', vowelTts: 'é',   noteName: 'RÉ',  noteTts: 'ré',  freq: 293.66, color: '#F77F00', darkText: false },
        { id: 'I', vowelTts: 'i',   noteName: 'MI',  noteTts: 'mi',  freq: 329.63, color: '#FFCA3A', darkText: true  },
        { id: 'A', vowelTts: 'a',   noteName: 'FA',  noteTts: 'fa',  freq: 349.23, color: '#52B788', darkText: false },
        { id: 'U', vowelTts: 'u',   noteName: 'SOL', noteTts: 'sol', freq: 392.00, color: '#1982C4', darkText: false }
    ];

    const CONSONANTS = ['D', 'B', 'M', 'F', 'L', 'P', 'T', 'R'];

    // Phonetic French TTS strings + concrete anchor words for every Consonant + Vowel combination
    const SYLLABLE_DATA = {
        D: {
            O: { text: 'DO', tts: 'dos',  icon: '🐬', word: { fr: 'Dauphin',         en: 'Dolphin' } },
            É: { text: 'DÉ', tts: 'dé',   icon: '🎲', word: { fr: 'Dé',             en: 'Dice' } },
            I: { text: 'DI', tts: 'di',   icon: '🦖', word: { fr: 'Dinosaure',      en: 'Dinosaur' } },
            A: { text: 'DA', tts: 'da',   icon: '♟️', word: { fr: 'Dame',           en: 'Checkers' } },
            U: { text: 'DU', tts: 'du',   icon: '🏜️', word: { fr: 'Dune',           en: 'Sand Dune' } }
        },
        B: {
            O: { text: 'BO', tts: 'beau', icon: '🥣', word: { fr: 'Bol',            en: 'Bowl' } },
            É: { text: 'BÉ', tts: 'bé',   icon: '👶', word: { fr: 'Bébé',           en: 'Baby' } },
            I: { text: 'BI', tts: 'bi',   icon: '🚲', word: { fr: 'Bicyclette',     en: 'Bicycle' } },
            A: { text: 'BA', tts: 'ba',   icon: '🍌', word: { fr: 'Banane',         en: 'Banana' } },
            U: { text: 'BU', tts: 'bu',   icon: '🚌', word: { fr: 'Bus',            en: 'Bus' } }
        },
        M: {
            O: { text: 'MO', tts: 'mot',  icon: '🏍️', word: { fr: 'Moto',           en: 'Motorbike' } },
            É: { text: 'MÉ', tts: 'mé',   icon: '🏅', word: { fr: 'Médaille',       en: 'Medal' } },
            I: { text: 'MI', tts: 'mi',   icon: '🎤', word: { fr: 'Micro',          en: 'Microphone' } },
            A: { text: 'MA', tts: 'ma',   icon: '🤱', word: { fr: 'Maman',          en: 'Mommy' } },
            U: { text: 'MU', tts: 'mu',   icon: '🧱', word: { fr: 'Mur',            en: 'Wall' } }
        },
        F: {
            O: { text: 'FO', tts: 'faux', icon: '🌲', word: { fr: 'Forêt',          en: 'Forest' } },
            É: { text: 'FÉ', tts: 'fée',  icon: '🧚', word: { fr: 'Fée',            en: 'Fairy' } },
            I: { text: 'FI', tts: 'fi',   icon: '🧵', word: { fr: 'Fil',            en: 'Thread' } },
            A: { text: 'FA', tts: 'fa',   icon: '👪', word: { fr: 'Famille',        en: 'Family' } },
            U: { text: 'FU', tts: 'fût',  icon: '🚀', word: { fr: 'Fusée',          en: 'Rocket' } }
        },
        L: {
            O: { text: 'LO', tts: "l'eau",icon: '🚂', word: { fr: 'Locomotive',     en: 'Locomotive' } },
            É: { text: 'LÉ', tts: 'lé',   icon: '🦁', word: { fr: 'Léopard',        en: 'Leopard' } },
            I: { text: 'LI', tts: 'li',   icon: '🛏️', word: { fr: 'Lit',            en: 'Bed' } },
            A: { text: 'LA', tts: 'la',   icon: '🐰', word: { fr: 'Lapin',          en: 'Rabbit' } },
            U: { text: 'LU', tts: 'lu',   icon: '🌙', word: { fr: 'Lune',           en: 'Moon' } }
        },
        P: {
            O: { text: 'PO', tts: 'pot',  icon: '🍎', word: { fr: 'Pomme',          en: 'Apple' } },
            É: { text: 'PÉ', tts: 'pé',   icon: '🚲', word: { fr: 'Pédale',         en: 'Pedal' } },
            I: { text: 'PI', tts: 'pi',   icon: '🍕', word: { fr: 'Pizza',          en: 'Pizza' } },
            A: { text: 'PA', tts: 'pa',   icon: '🦋', word: { fr: 'Papillon',       en: 'Butterfly' } },
            U: { text: 'PU', tts: 'pu',   icon: '🧩', word: { fr: 'Puzzle',         en: 'Puzzle' } }
        },
        T: {
            O: { text: 'TO', tts: 'tôt',  icon: '🍅', word: { fr: 'Tomate',         en: 'Tomato' } },
            É: { text: 'TÉ', tts: 'té',   icon: '📺', word: { fr: 'Télé',           en: 'TV' } },
            I: { text: 'TI', tts: 'ti',   icon: '🐯', word: { fr: 'Tigre',          en: 'Tiger' } },
            A: { text: 'TA', tts: 'ta',   icon: '☕', word: { fr: 'Tasse',          en: 'Cup' } },
            U: { text: 'TU', tts: 'tu',   icon: '🌷', word: { fr: 'Tulipe',         en: 'Tulip' } }
        },
        R: {
            O: { text: 'RO', tts: 'rot',  icon: '🤖', word: { fr: 'Robot',          en: 'Robot' } },
            É: { text: 'RÉ', tts: 'ré',   icon: '⏰', word: { fr: 'Réveil',         en: 'Alarm Clock' } },
            I: { text: 'RI', tts: 'ri',   icon: '🍚', word: { fr: 'Riz',            en: 'Rice' } },
            A: { text: 'RA', tts: 'ra',   icon: '🐀', word: { fr: 'Rat',            en: 'Rat' } },
            U: { text: 'RU', tts: 'ru',   icon: '🛣️', word: { fr: 'Rue',            en: 'Street' } }
        }
    };

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let gameMode = 'explore'; // 'explore' | 'vowels' | 'music'
    let selectedConsonant = 'B';
    let activeVowelId = 'O';
    let targetVowelId = 'O';
    let lastTargetVowel = null;
    let isAnimating = false;
    let fusionState = {
        fused: false,
        progress: 0,
        highlightLeft: false,
        highlightRight: false
    };
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function speakFr(text, rate = 0.88) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'fr-FR';
            utter.rate = rate;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }

    function playNotePitch(freq, duration = 0.45) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + duration + 0.03);
        } catch (e) {}
    }

    function getVowelMeta(vId) {
        return VOWEL_NOTES.find(v => v.id === vId) || VOWEL_NOTES[0];
    }

    function renderConsonantBar() {
        const bar = document.getElementById('consonant-bar');
        if (!bar) return;
        bar.innerHTML = '';
        CONSONANTS.forEach(c => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cons-btn' + (c === selectedConsonant ? ' active' : '');
            btn.innerText = c;
            btn.onclick = () => {
                if (isAnimating) return;
                selectedConsonant = c;
                if (gameMode === 'explore') {
                    resetFusionVisual();
                    renderConsonantBar();
                    updateCompareButton();
                    updatePrompt(true);
                } else {
                    startChallengeRound();
                }
            };
            bar.appendChild(btn);
        });
    }

    function resetFusionVisual() {
        fusionState = { fused: false, progress: 0, highlightLeft: false, highlightRight: false };
        drawFusionMachine();
    }

    function updateCompareButton() {
        const vMeta = getVowelMeta(gameMode === 'explore' ? activeVowelId : targetVowelId);
        const syl = SYLLABLE_DATA[selectedConsonant][vMeta.id];
        const btn = document.getElementById('compare-note-btn');
        if (!btn) return;
        btn.innerText = lang === 'fr'
            ? `🎵 Écouter le lien musical (${vMeta.noteName} ➡️ ${syl.text})`
            : `🎵 Hear musical bridge (${vMeta.noteName} ➡️ ${syl.text})`;
    }

    function getPromptText() {
        const vMeta = getVowelMeta(gameMode === 'explore' ? activeVowelId : targetVowelId);
        const syl = SYLLABLE_DATA[selectedConsonant][vMeta.id];

        if (gameMode === 'explore') {
            return lang === 'fr'
                ? `Consonne « ${selectedConsonant} » + Voyelle musicale = ?`
                : `Consonant "${selectedConsonant}" + Musical Vowel = ?`;
        }
        if (gameMode === 'vowels') {
            return lang === 'fr'
                ? `Écoute et trouve la syllabe : « ${syl.text} »`
                : `Listen and find the syllable: "${syl.text}"`;
        }
        return lang === 'fr'
            ? `Comme la note ${vMeta.noteName} (${vMeta.id})... trouve « ${syl.text} » !`
            : `Like the note ${vMeta.noteName} (${vMeta.id})... find "${syl.text}"!`;
    }

    function speakCurrentInstruction() {
        const vMeta = getVowelMeta(gameMode === 'explore' ? activeVowelId : targetVowelId);
        const syl = SYLLABLE_DATA[selectedConsonant][vMeta.id];

        if (gameMode === 'explore') {
            speakFr(`Choisis une voyelle pour la lettre ${selectedConsonant.toLowerCase()}`, 0.92);
        } else if (gameMode === 'vowels') {
            playNotePitch(vMeta.freq, 0.35);
            setTimeout(() => speakFr(`Trouve : ${syl.tts}`, 0.85), 360);
        } else {
            playNotePitch(vMeta.freq, 0.42);
            setTimeout(() => speakFr(`Comme ${vMeta.noteTts}... trouve : ${syl.tts}`, 0.85), 440);
        }
    }

    function updatePrompt(shouldSpeak = false) {
        const lbl = document.getElementById('prompt-label');
        if (lbl) lbl.innerText = getPromptText();
        updateCompareButton();
        if (shouldSpeak) speakCurrentInstruction();
    }

    /* ============================================================================
       ANIMATED MAGNETIC BLOCK FUSION STAGE (SVG)
       ============================================================================ */

    function drawFusionMachine() {
        const svg = document.getElementById('fusion-svg');
        if (!svg) return;
        const vMeta = getVowelMeta(activeVowelId);
        const syl = SYLLABLE_DATA[selectedConsonant][activeVowelId];
        const p = fusionState.progress;

        const leftX = 115 + p * 83;
        const rightX = 335 - p * 83;
        const leftScale = fusionState.highlightLeft ? 1.1 : 1;
        const rightScale = fusionState.highlightRight ? 1.1 : 1;

        let stageContent = `
            <!-- Soft Playroom Backdrop & Track -->
            <rect width="540" height="245" fill="#F8FAFC"/>
            <rect x="65" y="148" width="410" height="14" rx="7" fill="#CBD5E1"/>
        `;

        if (!fusionState.fused) {
            stageContent += `
                <!-- Plus Sign in Center -->
                <text x="270" y="106" font-size="36" font-weight="bold" fill="#94A3B8" text-anchor="middle" opacity="${(1 - p).toFixed(2)}">+</text>

                <!-- Left Consonant Block -->
                <g transform="translate(${leftX.toFixed(1)}, 96) scale(${leftScale})">
                    <rect x="-46" y="-46" width="92" height="92" rx="20" fill="#2563EB" stroke="#1D4ED8" stroke-width="3"/>
                    <text x="0" y="18" font-size="52" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${selectedConsonant}</text>
                </g>

                <!-- Right Vowel + Musical Note Block -->
                <g transform="translate(${rightX.toFixed(1)}, 96) scale(${rightScale})">
                    <rect x="-46" y="-46" width="92" height="92" rx="20" fill="${vMeta.color}" stroke="rgba(0,0,0,0.18)" stroke-width="3"/>
                    <text x="0" y="12" font-size="48" font-weight="bold" fill="${vMeta.darkText ? '#1E293B' : '#FFFFFF'}" text-anchor="middle">${vMeta.id}</text>
                    <text x="0" y="36" font-size="14" font-weight="bold" fill="${vMeta.darkText ? '#1E293B' : '#FFFFFF'}" text-anchor="middle">🎵 ${vMeta.noteName}</text>
                </g>
            `;
        } else {
            // Fused Syllable Block + Illustrated Word Reveal
            stageContent += `
                <!-- Fused Syllable Card on Left -->
                <g transform="translate(175, 102)">
                    <rect x="-78" y="-56" width="156" height="112" rx="24" fill="${vMeta.color}" stroke="#FFFFFF" stroke-width="5"/>
                    <text x="0" y="16" font-size="58" font-weight="bold" fill="${vMeta.darkText ? '#1E293B' : '#FFFFFF'}" text-anchor="middle">${syl.text}</text>
                    <text x="0" y="42" font-size="15" font-weight="bold" fill="${vMeta.darkText ? '#1E293B' : '#FFFFFF'}" text-anchor="middle">🎵 Comme ${vMeta.noteName}</text>
                </g>

                <!-- Arrow & Concrete Word Card on Right -->
                <text x="282" y="112" font-size="30" fill="#64748B" text-anchor="middle">➡️</text>
                <g transform="translate(395, 102)">
                    <rect x="-82" y="-56" width="164" height="112" rx="24" fill="#FFFFFF" stroke="${vMeta.color}" stroke-width="4"/>
                    <text x="0" y="8" font-size="54" text-anchor="middle">${syl.icon}</text>
                    <text x="0" y="40" font-size="18" font-weight="bold" fill="#1E293B" text-anchor="middle">${syl.word[lang]}</text>
                </g>
            `;
        }

        svg.innerHTML = stageContent;
    }

    /* Sequence: Consonant Sound -> Musical Vowel -> Magnetic Snap -> Fused Syllable + Word */
    function runFusionSequence(vowelId, onComplete) {
        if (isAnimating) return;
        isAnimating = true;
        activeVowelId = vowelId;

        const vMeta = getVowelMeta(vowelId);
        const syl = SYLLABLE_DATA[selectedConsonant][vowelId];

        // Step 1: Pulse Consonant Block
        fusionState = { fused: false, progress: 0, highlightLeft: true, highlightRight: false };
        drawFusionMachine();
        speakFr(selectedConsonant.toLowerCase(), 0.85);

        // Step 2: Pulse Vowel Block + Play Its Musical Note Pitch
        setTimeout(() => {
            fusionState = { fused: false, progress: 0, highlightLeft: false, highlightRight: true };
            drawFusionMachine();
            playNotePitch(vMeta.freq, 0.45);
            speakFr(vMeta.vowelTts, 0.85);
        }, 520);

        // Step 3: Magnetic Slide & Snap Together
        setTimeout(() => {
            const startTime = performance.now();
            const duration = 360;

            function snapFrame(now) {
                const t = Math.min(1, (now - startTime) / duration);
                const ease = t * t * (3 - 2 * t);
                fusionState = { fused: false, progress: ease, highlightLeft: false, highlightRight: false };
                drawFusionMachine();

                if (t < 1) {
                    requestAnimationFrame(snapFrame);
                } else {
                    // Step 4: Reveal Fused Syllable + Sing Note + Speak Syllable & Word
                    fusionState.fused = true;
                    drawFusionMachine();
                    playNotePitch(vMeta.freq, 0.55);
                    speakFr(`${syl.tts} ! Comme ${syl.word.fr}`, 0.88);
                    isAnimating = false;
                    if (onComplete) onComplete();
                }
            }
            requestAnimationFrame(snapFrame);
        }, 1060);
    }

    /* ============================================================================
       EXPLORER MODE VS CHALLENGE MODES
       ============================================================================ */

    function renderExplorerControls() {
        const area = document.getElementById('controls-area');
        if (!area) return;
        const tray = document.createElement('div');
        tray.className = 'vowel-keys-tray';

        VOWEL_NOTES.forEach(v => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'vowel-key-btn' + (v.darkText ? ' dark-text' : '');
            btn.style.backgroundColor = v.color;
            btn.innerHTML = `
                <span class="vk-letter">${v.id}</span>
                <span class="vk-note-tag">🎵 ${v.noteName}</span>
            `;
            btn.onclick = () => {
                if (isAnimating) return;
                runFusionSequence(v.id, () => updateCompareButton());
            };
            tray.appendChild(btn);
        });

        area.innerHTML = '';
        area.appendChild(tray);
        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function startChallengeRound() {
        isAnimating = false;
        renderConsonantBar();

        const candidates = VOWEL_NOTES.filter(v => v.id !== lastTargetVowel);
        const chosenVowel = candidates[Math.floor(Math.random() * candidates.length)];
        targetVowelId = chosenVowel.id;
        activeVowelId = targetVowelId;
        lastTargetVowel = targetVowelId;

        resetFusionVisual();
        updatePrompt(true);

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`syl_${selectedConsonant}${targetVowelId}`);
        }

        const distractors = VOWEL_NOTES
            .filter(v => v.id !== targetVowelId)
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);

        const choices = [chosenVowel, ...distractors].sort(() => Math.random() - 0.5);

        const area = document.getElementById('controls-area');
        if (!area) return;
        const row = document.createElement('div');
        row.className = 'syllable-choices-row';

        choices.forEach(v => {
            const syl = SYLLABLE_DATA[selectedConsonant][v.id];
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'syl-choice-card';
            card.style.borderColor = v.color;
            card.innerHTML = `
                <span class="syl-big-text" style="color:${v.darkText ? '#D97706' : v.color};">${syl.text}</span>
                <span class="syl-note-sub">🎵 ${v.noteName} (${v.id})</span>
            `;

            card.onclick = () => {
                if (isAnimating) return;

                if (v.id === targetVowelId) {
                    card.classList.add('winner');
                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(`syl_${selectedConsonant}${targetVowelId}`);
                    }
                    runFusionSequence(v.id, () => {
                        setTimeout(() => {
                            if (Math.random() > 0.45) {
                                const nextCons = CONSONANTS[(CONSONANTS.indexOf(selectedConsonant) + 1) % CONSONANTS.length];
                                selectedConsonant = nextCons;
                            }
                            startChallengeRound();
                        }, 1500);
                    });
                } else {
                    card.classList.add('soft-dim');
                    playNotePitch(v.freq, 0.25);
                    speakFr(`Non, ça c'est ${syl.tts}.`, 0.92);
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt();
                    }
                    setTimeout(() => speakCurrentInstruction(), 1300);
                }
            };

            row.appendChild(card);
        });

        area.innerHTML = '';
        area.appendChild(row);
        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setMode(mode, btnId) {
        gameMode = mode;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add('active');

        if (mode === 'explore') {
            resetFusionVisual();
            renderConsonantBar();
            renderExplorerControls();
            updatePrompt(true);
        } else {
            startChallengeRound();
        }
        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setupControls() {
        const compareBtn = document.getElementById('compare-note-btn');
        if (compareBtn) {
            compareBtn.onclick = () => {
                if (isAnimating) return;
                const vId = gameMode === 'explore' ? activeVowelId : targetVowelId;
                const vMeta = getVowelMeta(vId);
                const syl = SYLLABLE_DATA[selectedConsonant][vId];

                playNotePitch(vMeta.freq, 0.42);
                speakFr(vMeta.noteTts, 0.85);

                setTimeout(() => {
                    playNotePitch(vMeta.freq, 0.48);
                    speakFr(syl.tts, 0.85);
                }, 680);
            };
        }

        const exploreBtn = document.getElementById('mode-explore-btn');
        if (exploreBtn) exploreBtn.onclick = () => setMode('explore', 'mode-explore-btn');

        const vowelsBtn = document.getElementById('mode-vowels-btn');
        if (vowelsBtn) vowelsBtn.onclick = () => setMode('vowels', 'mode-vowels-btn');

        const musicBtn = document.getElementById('mode-music-btn');
        if (musicBtn) musicBtn.onclick = () => setMode('music', 'mode-music-btn');

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) speakBtn.onclick = () => speakCurrentInstruction();

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
                if (title) title.innerText = lang === 'fr' ? '🎶 Syllabes & Voyelles' : '🎶 Musical Syllables';

                if (exploreBtn) exploreBtn.innerText = lang === 'fr' ? '🎹 Explorer (Fusion)' : '🎹 Explore (Blend)';
                if (vowelsBtn) vowelsBtn.innerText = lang === 'fr' ? '🎯 Défi : Voyelles' : '🎯 Challenge: Vowels';
                if (musicBtn) musicBtn.innerText = lang === 'fr' ? '🎶 Défi : Comme la note' : '🎶 Challenge: Like the Note';

                drawFusionMachine();
                updatePrompt(true);
            };
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupControls();
            setMode('explore', 'mode-explore-btn');
        });
    } else {
        setupControls();
        setMode('explore', 'mode-explore-btn');
    }
})();
