/**
 * Visual Patterns & Sequences Engine (Activity #29)
 * Cheerful locomotive convoy pulling colored wagons with rhythmic audio scan,
 * 3 pattern complexity modes (AB, AAB, ABC), and train departure animation.
 */

(() => {
    'use strict';

    const PATTERN_SETS = [
        [
            { icon: '🍎', pitch: 329.63, name: { fr: 'Pomme',     en: 'Apple' } },
            { icon: '🍌', pitch: 440.00, name: { fr: 'Banane',    en: 'Banana' } },
            { icon: '🍓', pitch: 523.25, name: { fr: 'Fraise',    en: 'Strawberry' } }
        ],
        [
            { icon: '🔴', pitch: 293.66, name: { fr: 'Rond rouge',en: 'Red Circle' } },
            { icon: '🔵', pitch: 392.00, name: { fr: 'Rond bleu', en: 'Blue Circle' } },
            { icon: '🟡', pitch: 493.88, name: { fr: 'Rond jaune',en: 'Yellow Circle' } }
        ],
        [
            { icon: '⭐', pitch: 349.23, name: { fr: 'Étoile',    en: 'Star' } },
            { icon: '🌙', pitch: 440.00, name: { fr: 'Lune',      en: 'Moon' } },
            { icon: '☀️', pitch: 587.33, name: { fr: 'Soleil',    en: 'Sun' } }
        ],
        [
            { icon: '🐶', pitch: 261.63, name: { fr: 'Chien',     en: 'Dog' } },
            { icon: '🐱', pitch: 392.00, name: { fr: 'Chat',      en: 'Cat' } },
            { icon: '🐰', pitch: 523.25, name: { fr: 'Lapin',     en: 'Rabbit' } }
        ],
        [
            { icon: '🚗', pitch: 293.66, name: { fr: 'Voiture',   en: 'Car' } },
            { icon: '✈️', pitch: 440.00, name: { fr: 'Avion',     en: 'Airplane' } },
            { icon: '⛵', pitch: 523.25, name: { fr: 'Bateau',    en: 'Boat' } }
        ],
        [
            { icon: '🐝', pitch: 329.63, name: { fr: 'Abeille',   en: 'Bee' } },
            { icon: '🐞', pitch: 392.00, name: { fr: 'Coccinelle',en: 'Ladybug' } },
            { icon: '🦋', pitch: 493.88, name: { fr: 'Papillon',  en: 'Butterfly' } }
        ]
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let patternMode = 'ab'; // 'ab' | 'aab' | 'abc'
    let currentSetIdx = 0;
    let sequence = [];
    let targetItem = null;
    let choiceOptions = [];
    let isSolved = false;
    let isScanning = false;
    let scanTimers = [];
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

    function playBeatTone(freq, dur = 0.24) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + dur + 0.02);
        } catch (e) {}
    }

    function playTrainDepartureSound() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            [587.33, 739.99].forEach(f => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, now);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.36);

                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(f, now + 0.44);
                gain2.gain.setValueAtTime(0.18, now + 0.44);
                gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(now + 0.44);
                osc2.stop(now + 0.96);
            });
        } catch (e) {}
    }

    function clearScanTimers() {
        scanTimers.forEach(t => clearTimeout(t));
        scanTimers = [];
        isScanning = false;
    }

    function startRound() {
        clearScanTimers();
        isSolved = false;

        const nextIdx = (currentSetIdx + 1 + Math.floor(Math.random() * (PATTERN_SETS.length - 1))) % PATTERN_SETS.length;
        currentSetIdx = nextIdx;
        const items = [...PATTERN_SETS[currentSetIdx]].sort(() => Math.random() - 0.5);
        const [A, B, C] = items;

        if (patternMode === 'ab') {
            sequence = [A, B, A, B, A];
        } else if (patternMode === 'aab') {
            sequence = Math.random() > 0.5
                ? [A, A, B, A, A, B]
                : [A, B, B, A, B, B];
        } else {
            sequence = [A, B, C, A, B, C];
        }

        targetItem = sequence[sequence.length - 1];
        choiceOptions = [A, B, C].sort(() => Math.random() - 0.5);

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`pat_${patternMode}_${targetItem.icon}`);
        }

        const convoy = document.getElementById('train-convoy');
        if (convoy) convoy.classList.remove('departing');

        renderTrain();
        renderChoices();
        updatePrompt(true);

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function getPromptText() {
        if (isSolved) {
            return lang === 'fr'
                ? `Bravo ! C'est ${targetItem.name.fr.toLowerCase()} ! Le train part ! 🚂`
                : `Great job! It's ${targetItem.name.en.toLowerCase()}! Train departing! 🚂`;
        }
        return lang === 'fr'
            ? 'Observe le rythme : quelle image vient après ?'
            : 'Look at the pattern: which picture comes next?';
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const lbl = document.getElementById('prompt-label');
        if (lbl) lbl.innerText = text;
        if (shouldSpeak) speak(text);
    }

    function renderTrain() {
        const convoy = document.getElementById('train-convoy');
        if (!convoy) return;
        convoy.innerHTML = `<div class="locomotive-box">🚂</div>`;

        sequence.forEach((item, idx) => {
            const isLast = idx === sequence.length - 1;
            const wagon = document.createElement('div');
            wagon.id = `wagon-${idx}`;

            if (isLast && !isSolved) {
                wagon.className = 'wagon-card missing-slot';
                wagon.innerText = '?';
            } else {
                wagon.className = 'wagon-card' + (isLast && isSolved ? ' solved-slot' : '');
                wagon.innerText = item.icon;
            }

            convoy.appendChild(wagon);
        });
    }

    function renderChoices() {
        const row = document.getElementById('pattern-choices');
        if (!row) return;
        row.innerHTML = '';

        choiceOptions.forEach(item => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'pat-choice-card';
            card.innerHTML = `
                <span class="pat-icon">${item.icon}</span>
                <span class="pat-label">${item.name[lang]}</span>
            `;

            card.onclick = () => {
                if (isSolved) return;
                clearScanTimers();

                if (item.icon === targetItem.icon) {
                    isSolved = true;
                    card.classList.add('winner');
                    renderTrain();
                    updatePrompt(true);
                    playTrainDepartureSound();

                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(`pat_${patternMode}_${targetItem.icon}`);
                    }

                    setTimeout(() => {
                        const convoy = document.getElementById('train-convoy');
                        if (convoy) convoy.classList.add('departing');
                    }, 650);

                    setTimeout(startRound, 2000);
                } else {
                    card.classList.add('soft-dim');
                    playBeatTone(210, 0.16);
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt();
                    }
                    const hint = lang === 'fr'
                        ? `Pas ${item.name.fr.toLowerCase()}. Écoute bien le rythme !`
                        : `Not ${item.name.en.toLowerCase()}. Listen to the rhythm!`;
                    speak(hint);
                }
            };

            row.appendChild(card);
        });

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function playRhythmScan() {
        if (isScanning || isSolved) return;
        clearScanTimers();
        isScanning = true;

        const visibleCount = sequence.length - 1;
        const stepMs = 430;

        for (let i = 0; i < visibleCount; i++) {
            const item = sequence[i];
            const tOn = setTimeout(() => {
                playBeatTone(item.pitch, 0.25);
                const w = document.getElementById(`wagon-${i}`);
                if (w) w.classList.add('pulse-beat');
            }, i * stepMs);

            const tOff = setTimeout(() => {
                const w = document.getElementById(`wagon-${i}`);
                if (w) w.classList.remove('pulse-beat');
            }, i * stepMs + 320);

            scanTimers.push(tOn, tOff);
        }

        const tQuestion = setTimeout(() => {
            const lastWagon = document.getElementById(`wagon-${visibleCount}`);
            if (lastWagon) lastWagon.classList.add('pulse-beat');
            playBeatTone(620, 0.22);
        }, visibleCount * stepMs);

        const tEnd = setTimeout(() => {
            const lastWagon = document.getElementById(`wagon-${visibleCount}`);
            if (lastWagon) lastWagon.classList.remove('pulse-beat');
            isScanning = false;
        }, visibleCount * stepMs + 360);

        scanTimers.push(tQuestion, tEnd);
    }

    function setPatternMode(mode, btnId) {
        patternMode = mode;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add('active');
        startRound();
        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setupControls() {
        const abBtn = document.getElementById('mode-ab-btn');
        if (abBtn) abBtn.onclick = () => setPatternMode('ab', 'mode-ab-btn');

        const aabBtn = document.getElementById('mode-aab-btn');
        if (aabBtn) aabBtn.onclick = () => setPatternMode('aab', 'mode-aab-btn');

        const abcBtn = document.getElementById('mode-abc-btn');
        if (abcBtn) abcBtn.onclick = () => setPatternMode('abc', 'mode-abc-btn');

        const playRhythmBtn = document.getElementById('play-rhythm-btn');
        if (playRhythmBtn) playRhythmBtn.onclick = () => playRhythmScan();

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) speakBtn.onclick = () => updatePrompt(true);

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
                if (title) title.innerText = lang === 'fr' ? '🚂 Suites & Rythmes' : '🚂 Visual Patterns';

                if (abBtn) abBtn.innerText = lang === 'fr' ? '🔴🔵 Rythme AB' : '🔴🔵 AB Pattern';
                if (aabBtn) aabBtn.innerText = lang === 'fr' ? '🟡🟡🟢 Rythme AAB' : '🟡🟡🟢 AAB Pattern';
                if (abcBtn) abcBtn.innerText = lang === 'fr' ? '🔺⬜🔵 Rythme ABC' : '🔺⬜🔵 ABC Pattern';

                const scanText = document.getElementById('play-rhythm-text');
                if (scanText) scanText.innerText = lang === 'fr' ? 'Écouter le rythme' : 'Hear the rhythm';

                renderChoices();
                updatePrompt(true);
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
