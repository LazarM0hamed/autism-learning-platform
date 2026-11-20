/**
 * Two-Syllable Word Assembly Engine (Activity #28)
 * Blends two fused syllables into everyday words (MOTO, VÉLO, PAPA, etc.)
 * while maintaining consistent musical vowel color coding from syllables.html.
 */

(() => {
    'use strict';

    // Consistent musical vowel colors matching syllables.html
    const VOWEL_STYLES = {
        O: { note: 'DO',  freq: 261.63, color: '#FF595E', darkText: false },
        É: { note: 'RÉ',  freq: 293.66, color: '#F77F00', darkText: false },
        I: { note: 'MI',  freq: 329.63, color: '#FFCA3A', darkText: true  },
        A: { note: 'FA',  freq: 349.23, color: '#52B788', darkText: false },
        U: { note: 'SOL', freq: 392.00, color: '#1982C4', darkText: false }
    };

    const TWO_SYLLABLE_WORDS = [
        {
            id: 'moto',
            word: 'MOTO',
            icon: '🏍️',
            meaning: { fr: 'la moto', en: 'the motorbike' },
            syllables: [
                { text: 'MO', tts: 'mot',  vowel: 'O' },
                { text: 'TO', tts: 'tôt',  vowel: 'O' }
            ]
        },
        {
            id: 'velo',
            word: 'VÉLO',
            icon: '🚲',
            meaning: { fr: 'le vélo', en: 'the bicycle' },
            syllables: [
                { text: 'VÉ', tts: 'vé',   vowel: 'É' },
                { text: 'LO', tts: "l'eau",vowel: 'O' }
            ]
        },
        {
            id: 'papa',
            word: 'PAPA',
            icon: '👨',
            meaning: { fr: 'papa', en: 'daddy' },
            syllables: [
                { text: 'PA', tts: 'pa',   vowel: 'A' },
                { text: 'PA', tts: 'pa',   vowel: 'A' }
            ]
        },
        {
            id: 'bobo',
            word: 'BOBO',
            icon: '🩹',
            meaning: { fr: 'le bobo', en: 'the boo-boo' },
            syllables: [
                { text: 'BO', tts: 'beau', vowel: 'O' },
                { text: 'BO', tts: 'beau', vowel: 'O' }
            ]
        },
        {
            id: 'sofa',
            word: 'SOFA',
            icon: '🛋️',
            meaning: { fr: 'le sofa', en: 'the sofa' },
            syllables: [
                { text: 'SO', tts: 'seau', vowel: 'O' },
                { text: 'FA', tts: 'fa',   vowel: 'A' }
            ]
        },
        {
            id: 'dodo',
            word: 'DODO',
            icon: '🛌',
            meaning: { fr: 'le dodo', en: 'sleep / bed' },
            syllables: [
                { text: 'DO', tts: 'dos',  vowel: 'O' },
                { text: 'DO', tts: 'dos',  vowel: 'O' }
            ]
        },
        {
            id: 'kiwi',
            word: 'KIWI',
            icon: '🥝',
            meaning: { fr: 'le kiwi', en: 'the kiwi' },
            syllables: [
                { text: 'KI', tts: 'qui',  vowel: 'I' },
                { text: 'WI', tts: 'oui',  vowel: 'I' }
            ]
        },
        {
            id: 'puma',
            word: 'PUMA',
            icon: '🐆',
            meaning: { fr: 'le puma', en: 'the puma' },
            syllables: [
                { text: 'PU', tts: 'pu',   vowel: 'U' },
                { text: 'MA', tts: 'ma',   vowel: 'A' }
            ]
        },
        {
            id: 'lama',
            word: 'LAMA',
            icon: '🦙',
            meaning: { fr: 'le lama', en: 'the llama' },
            syllables: [
                { text: 'LA', tts: 'la',   vowel: 'A' },
                { text: 'MA', tts: 'ma',   vowel: 'A' }
            ]
        },
        {
            id: 'midi',
            word: 'MIDI',
            icon: '🕛',
            meaning: { fr: 'midi', en: 'noon' },
            syllables: [
                { text: 'MI', tts: 'mi',   vowel: 'I' },
                { text: 'DI', tts: 'di',   vowel: 'I' }
            ]
        }
    ];

    const EXTRA_DISTRACTORS = [
        { text: 'BA', tts: 'ba',  vowel: 'A' },
        { text: 'LI', tts: 'li',  vowel: 'I' },
        { text: 'RÉ', tts: 'ré',  vowel: 'É' },
        { text: 'BU', tts: 'bu',  vowel: 'U' },
        { text: 'PO', tts: 'pot', vowel: 'O' },
        { text: 'FÉ', tts: 'fée', vowel: 'É' },
        { text: 'TI', tts: 'ti',  vowel: 'I' },
        { text: 'RO', tts: 'rot', vowel: 'O' }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let gameMode = 'complete'; // 'complete' | 'build' | 'listen'
    let currentWord = null;
    let lastWordId = null;
    let placedCount = 0; // 0, 1, or 2
    let isFused = false;
    let snapProgress = 0;
    let isAnimating = false;
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

    function playNotePitch(freq, duration = 0.36) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + duration + 0.02);
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
                osc.type = 'sine';
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
        isAnimating = false;
        isFused = false;
        snapProgress = 0;

        const candidates = TWO_SYLLABLE_WORDS.filter(w => w.id !== lastWordId);
        currentWord = candidates[Math.floor(Math.random() * candidates.length)];
        lastWordId = currentWord.id;

        placedCount = gameMode === 'complete' ? 1 : 0;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`wb_${gameMode}_${currentWord.id}`);
        }

        updateBreakButton();
        drawStage();
        renderChoices();
        updatePrompt(true);

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function updateBreakButton() {
        const s1 = currentWord.syllables[0].text;
        const s2 = currentWord.syllables[1].text;
        const btn = document.getElementById('break-word-btn');
        if (btn) {
            btn.innerText = lang === 'fr'
                ? `🎵 Écouter les 2 syllabes (${s1} - ${s2})`
                : `🎵 Hear both syllables (${s1} - ${s2})`;
        }
    }

    function getPromptText() {
        if (isFused) {
            return lang === 'fr'
                ? `Bravo ! ${currentWord.syllables[0].text} + ${currentWord.syllables[1].text} = ${currentWord.word} !`
                : `Great job! ${currentWord.syllables[0].text} + ${currentWord.syllables[1].text} = ${currentWord.word}!`;
        }
        const targetSyl = currentWord.syllables[placedCount];
        if (gameMode === 'listen') {
            return lang === 'fr'
                ? `Trouve la syllabe ${placedCount + 1} du mot « ${currentWord.word} »`
                : `Find syllable ${placedCount + 1} of "${currentWord.word}"`;
        }
        return lang === 'fr'
            ? `Mot « ${currentWord.word} » : choisis la syllabe ${targetSyl.text}`
            : `Word "${currentWord.word}": pick syllable ${targetSyl.text}`;
    }

    function speakInstruction() {
        if (isFused) {
            speakFr(`Bravo ! ${currentWord.word.toLowerCase()} !`, 0.9);
            return;
        }
        const targetSyl = currentWord.syllables[placedCount];
        const vStyle = VOWEL_STYLES[targetSyl.vowel];
        playNotePitch(vStyle.freq, 0.34);

        if (gameMode === 'listen') {
            setTimeout(() => speakFr(`${currentWord.syllables[0].tts}... ${currentWord.syllables[1].tts}. Trouve : ${targetSyl.tts}`, 0.85), 360);
        } else {
            setTimeout(() => speakFr(`Trouve la syllabe : ${targetSyl.tts}`, 0.86), 360);
        }
    }

    function updatePrompt(shouldSpeak = false) {
        const lbl = document.getElementById('prompt-label');
        if (lbl) lbl.innerText = getPromptText();
        if (shouldSpeak) speakInstruction();
    }

    /* ============================================================================
       SVG MAGNETIC WORD FUSION STAGE
       ============================================================================ */

    function drawStage() {
        const svg = document.getElementById('wb-svg');
        if (!svg || !currentWord) return;
        const s1 = currentWord.syllables[0];
        const s2 = currentWord.syllables[1];
        const v1 = VOWEL_STYLES[s1.vowel];
        const v2 = VOWEL_STYLES[s2.vowel];

        const iconBounce = isFused ? -6 : 0;
        const topCard = `
            <g transform="translate(270, ${66 + iconBounce})">
                <rect x="-78" y="-48" width="156" height="96" rx="22" fill="#FFFFFF" stroke="${isFused ? '#10B981' : '#CBD5E1'}" stroke-width="4"/>
                <text x="0" y="14" font-size="54" text-anchor="middle">${currentWord.icon}</text>
                ${isFused ? `<text x="0" y="40" font-size="17" font-weight="bold" fill="#047857" text-anchor="middle">${currentWord.word}</text>` : ''}
            </g>
        `;

        const track = `<rect x="85" y="232" width="370" height="14" rx="7" fill="#CBD5E1"/>`;

        if (isFused) {
            svg.innerHTML = `
                <rect width="540" height="270" fill="#ECFDF5"/>
                ${topCard}
                ${track}
                <g transform="translate(270, 180)">
                    <rect x="-136" y="-44" width="272" height="88" rx="22" fill="#10B981" stroke="#FFFFFF" stroke-width="5"/>
                    <text x="0" y="18" font-size="50" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${currentWord.word}</text>
                </g>
                <text x="108" y="165" font-size="30">⭐</text>
                <text x="415" y="165" font-size="30">🌟</text>
            `;
            return;
        }

        const x1 = 175 + snapProgress * 43;
        const x2 = 365 - snapProgress * 43;

        const slot1Markup = placedCount >= 1
            ? `
                <g transform="translate(${x1.toFixed(1)}, 180)">
                    <rect x="-52" y="-42" width="104" height="84" rx="18" fill="${v1.color}" stroke="#FFFFFF" stroke-width="4"/>
                    <text x="0" y="14" font-size="40" font-weight="bold" fill="${v1.darkText ? '#1E293B' : '#FFFFFF'}" text-anchor="middle">${s1.text}</text>
                </g>
            `
            : `
                <g transform="translate(${x1.toFixed(1)}, 180)">
                    <rect x="-52" y="-42" width="104" height="84" rx="18" fill="#EFF6FF" stroke="#3B82F6" stroke-width="3" stroke-dasharray="7,5"/>
                    <text x="0" y="12" font-size="28" font-weight="bold" fill="#3B82F6" text-anchor="middle">${gameMode === 'listen' ? '1' : s1.text}</text>
                </g>
            `;

        const slot2Markup = placedCount >= 2
            ? `
                <g transform="translate(${x2.toFixed(1)}, 180)">
                    <rect x="-52" y="-42" width="104" height="84" rx="18" fill="${v2.color}" stroke="#FFFFFF" stroke-width="4"/>
                    <text x="0" y="14" font-size="40" font-weight="bold" fill="${v2.darkText ? '#1E293B' : '#FFFFFF'}" text-anchor="middle">${s2.text}</text>
                </g>
            `
            : `
                <g transform="translate(${x2.toFixed(1)}, 180)">
                    <rect x="-52" y="-42" width="104" height="84" rx="18" fill="${placedCount === 1 ? '#EFF6FF' : '#F8FAFC'}" stroke="${placedCount === 1 ? '#3B82F6' : '#CBD5E1'}" stroke-width="3" stroke-dasharray="7,5"/>
                    <text x="0" y="12" font-size="28" font-weight="bold" fill="${placedCount === 1 ? '#3B82F6' : '#94A3B8'}" text-anchor="middle">${gameMode === 'listen' ? '2' : (placedCount === 1 ? s2.text : '2')}</text>
                </g>
            `;

        const plusSign = `<text x="270" y="190" font-size="30" font-weight="bold" fill="#94A3B8" text-anchor="middle" opacity="${(1 - snapProgress).toFixed(2)}">+</text>`;

        svg.innerHTML = `
            <rect width="540" height="270" fill="#EFF6FF"/>
            ${topCard}
            ${track}
            ${plusSign}
            ${slot1Markup}
            ${slot2Markup}
        `;
    }

    /* ============================================================================
       SYLLABLE CHOICES & FUSION ANIMATION
       ============================================================================ */

    function renderChoices() {
        const row = document.getElementById('wb-choices');
        if (!row) return;
        row.innerHTML = '';
        if (placedCount >= 2) return;

        const targetSyl = currentWord.syllables[placedCount];

        const allSyls = [
            ...TWO_SYLLABLE_WORDS.flatMap(w => w.syllables),
            ...EXTRA_DISTRACTORS
        ];
        const uniqueDistractors = [];
        const seenTexts = new Set([targetSyl.text]);

        allSyls.sort(() => Math.random() - 0.5).forEach(s => {
            if (!seenTexts.has(s.text) && uniqueDistractors.length < 2) {
                seenTexts.add(s.text);
                uniqueDistractors.push(s);
            }
        });

        const choices = [targetSyl, ...uniqueDistractors].sort(() => Math.random() - 0.5);

        choices.forEach(syl => {
            const vStyle = VOWEL_STYLES[syl.vowel];
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'wb-syl-card';
            card.style.borderColor = vStyle.color;
            card.innerHTML = `
                <span class="wb-syl-text" style="color:${vStyle.darkText ? '#D97706' : vStyle.color};">${syl.text}</span>
                <span class="wb-syl-note">🎵 ${vStyle.note} (${syl.vowel})</span>
            `;

            card.onclick = () => {
                if (isAnimating || placedCount >= 2) return;

                if (syl.text === targetSyl.text) {
                    card.classList.add('winner');
                    playNotePitch(vStyle.freq, 0.35);
                    speakFr(syl.tts, 0.88);
                    placedCount++;
                    drawStage();

                    if (placedCount < 2) {
                        setTimeout(() => {
                            renderChoices();
                            updatePrompt(true);
                        }, 550);
                    } else {
                        if (window.AlpTracker) {
                            window.AlpTracker.onTrialSuccess(`wb_${gameMode}_${currentWord.id}`);
                        }
                        runWordSnapAnimation();
                    }
                } else {
                    card.classList.add('soft-dim');
                    playNotePitch(vStyle.freq, 0.22);
                    speakFr(`Non, ça c'est ${syl.tts}.`, 0.92);
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt();
                    }
                    setTimeout(() => speakInstruction(), 1200);
                }
            };

            row.appendChild(card);
        });

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function runWordSnapAnimation() {
        isAnimating = true;
        const row = document.getElementById('wb-choices');
        if (row) row.innerHTML = '';

        setTimeout(() => {
            const startTime = performance.now();
            const duration = 420;

            function frame(now) {
                const t = Math.min(1, (now - startTime) / duration);
                snapProgress = t * t * (3 - 2 * t);
                drawStage();

                if (t < 1) {
                    requestAnimationFrame(frame);
                } else {
                    isFused = true;
                    drawStage();
                    playVictoryChime();
                    updatePrompt(true);
                    setTimeout(() => {
                        isAnimating = false;
                        startRound();
                    }, 2200);
                }
            }
            requestAnimationFrame(frame);
        }, 450);
    }

    function setMode(mode, btnId) {
        gameMode = mode;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add('active');
        startRound();
        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setupControls() {
        const breakBtn = document.getElementById('break-word-btn');
        if (breakBtn) {
            breakBtn.onclick = () => {
                if (isAnimating || !currentWord) return;
                const s1 = currentWord.syllables[0];
                const s2 = currentWord.syllables[1];
                const v1 = VOWEL_STYLES[s1.vowel];
                const v2 = VOWEL_STYLES[s2.vowel];

                playNotePitch(v1.freq, 0.35);
                speakFr(s1.tts, 0.82);

                setTimeout(() => {
                    playNotePitch(v2.freq, 0.35);
                    speakFr(s2.tts, 0.82);
                }, 620);

                setTimeout(() => {
                    speakFr(currentWord.word.toLowerCase(), 0.9);
                }, 1250);
            };
        }

        const completeBtn = document.getElementById('mode-complete-btn');
        if (completeBtn) completeBtn.onclick = () => setMode('complete', 'mode-complete-btn');

        const buildBtn = document.getElementById('mode-build-btn');
        if (buildBtn) buildBtn.onclick = () => setMode('build', 'mode-build-btn');

        const listenBtn = document.getElementById('mode-listen-btn');
        if (listenBtn) listenBtn.onclick = () => setMode('listen', 'mode-listen-btn');

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) speakBtn.onclick = () => speakInstruction();

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
                if (title) title.innerText = lang === 'fr' ? '🧩 Assembler des Mots' : '🧩 Word Assembly';

                if (completeBtn) completeBtn.innerText = lang === 'fr' ? '🧩 Finir le mot (2e syllabe)' : '🧩 Finish Word (2nd Syllable)';
                if (buildBtn) buildBtn.innerText = lang === 'fr' ? '🏗️ Construire (2 syllabes)' : '🏗️ Build Word (2 Syllables)';
                if (listenBtn) listenBtn.innerText = lang === 'fr' ? '👂 Sans indice' : '👂 Listen Only';

                updateBreakButton();
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
