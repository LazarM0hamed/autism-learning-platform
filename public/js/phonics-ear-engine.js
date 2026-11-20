/**
 * Phonemic Ear Engine (Activity #33 - J'entends le son / CP Bridge)
 * Trains children to detect target phonemes inside spoken words and identify positional placement
 * (au début vs. à la fin) using consistent musical vowel colors.
 */

(() => {
    'use strict';

    const PHONEME_BANK = [
        {
            id: 'O',
            symbol: '[ O ]',
            tts: 'o',
            noteTag: '🎵 DO',
            color: '#FF595E',
            darkText: false,
            wordsWith: [
                { word: 'MOTO',   tts: 'moto',   icon: '🏍️', pos: 'end',   highlightIdx: [1, 3] },
                { word: 'VÉLO',   tts: 'vélo',   icon: '🚲', pos: 'end',   highlightIdx: [3] },
                { word: 'ORANGE', tts: 'orange', icon: '🍊', pos: 'start', highlightIdx: [0] },
                { word: 'ROBOT',  tts: 'robot',  icon: '🤖', pos: 'end',   highlightIdx: [1, 3] },
                { word: 'OLIVE',  tts: 'olive',  icon: '🫒', pos: 'start', highlightIdx: [0] }
            ],
            wordsWithout: [
                { word: 'BANANE', tts: 'banane', icon: '🍌' },
                { word: 'CHAT',   tts: 'chat',   icon: '🐱' },
                { word: 'LIVRE',  tts: 'livre',  icon: '📖' },
                { word: 'FUSÉE',  tts: 'fusée',  icon: '🚀' }
            ]
        },
        {
            id: 'A',
            symbol: '[ A ]',
            tts: 'a',
            noteTag: '🎵 FA',
            color: '#52B788',
            darkText: false,
            wordsWith: [
                { word: 'AVION',  tts: 'avion',  icon: '✈️', pos: 'start', highlightIdx: [0] },
                { word: 'BANANE', tts: 'banane', icon: '🍌', pos: 'start', highlightIdx: [1, 3] },
                { word: 'PAPA',   tts: 'papa',   icon: '👨', pos: 'end',   highlightIdx: [1, 3] },
                { word: 'SOFA',   tts: 'sofa',   icon: '🛋️', pos: 'end',   highlightIdx: [3] },
                { word: 'ABEILLE',tts: 'abeille',icon: '🐝', pos: 'start', highlightIdx: [0] }
            ],
            wordsWithout: [
                { word: 'MOTO',   tts: 'moto',   icon: '🏍️' },
                { word: 'KIWI',   tts: 'kiwi',   icon: '🥝' },
                { word: 'LUNE',   tts: 'lune',   icon: '🌙' },
                { word: 'VÉLO',   tts: 'vélo',   icon: '🚲' }
            ]
        },
        {
            id: 'I',
            symbol: '[ I ]',
            tts: 'i',
            noteTag: '🎵 MI',
            color: '#FFCA3A',
            darkText: true,
            wordsWith: [
                { word: 'KIWI',   tts: 'kiwi',   icon: '🥝', pos: 'end',   highlightIdx: [1, 3] },
                { word: 'IGLOO',  tts: 'igloo',  icon: '🧊', pos: 'start', highlightIdx: [0] },
                { word: 'SOURIS', tts: 'souris', icon: '🐭', pos: 'end',   highlightIdx: [4] },
                { word: 'IMAGE',  tts: 'image',  icon: '🖼️', pos: 'start', highlightIdx: [0] },
                { word: 'MIDI',   tts: 'midi',   icon: '🕛', pos: 'end',   highlightIdx: [1, 3] }
            ],
            wordsWithout: [
                { word: 'POMME',  tts: 'pomme',  icon: '🍎' },
                { word: 'BATEAU', tts: 'bateau', icon: '⛵' },
                { word: 'LAMA',   tts: 'lama',   icon: '🦙' },
                { word: 'ROBOT',  tts: 'robot',  icon: '🤖' }
            ]
        },
        {
            id: 'U',
            symbol: '[ U ]',
            tts: 'u',
            noteTag: '🎵 SOL',
            color: '#1982C4',
            darkText: false,
            wordsWith: [
                { word: 'LUNE',   tts: 'lune',   icon: '🌙', pos: 'start', highlightIdx: [1] },
                { word: 'TORTUE', tts: 'tortue', icon: '🐢', pos: 'end',   highlightIdx: [4] },
                { word: 'USINE',  tts: 'usine',  icon: '🏭', pos: 'start', highlightIdx: [0] },
                { word: 'BUS',    tts: 'bus',    icon: '🚌', pos: 'start', highlightIdx: [1] }
            ],
            wordsWithout: [
                { word: 'CHIEN',  tts: 'chien',  icon: '🐶' },
                { word: 'FRAISE', tts: 'fraise', icon: '🍓' },
                { word: 'VÉLO',   tts: 'vélo',   icon: '🚲' },
                { word: 'POMME',  tts: 'pomme',  icon: '🍎' }
            ]
        },
        {
            id: 'L',
            symbol: '[ L ]',
            tts: 'lll',
            noteTag: 'Consonne',
            color: '#8338EC',
            darkText: false,
            wordsWith: [
                { word: 'LAPIN',  tts: 'lapin',  icon: '🐰', pos: 'start', highlightIdx: [0] },
                { word: 'LION',   tts: 'lion',   icon: '🦁', pos: 'start', highlightIdx: [0] },
                { word: 'BOL',    tts: 'bol',    icon: '🥣', pos: 'end',   highlightIdx: [2] },
                { word: 'SOLEIL', tts: 'soleil', icon: '☀️', pos: 'end',   highlightIdx: [2, 5] }
            ],
            wordsWithout: [
                { word: 'MOTO',   tts: 'moto',   icon: '🏍️' },
                { word: 'CHAT',   tts: 'chat',   icon: '🐱' },
                { word: 'PIANO',  tts: 'piano',  icon: '🎹' },
                { word: 'FUSÉE',  tts: 'fusée',  icon: '🚀' }
            ]
        },
        {
            id: 'M',
            symbol: '[ M ]',
            tts: 'mmm',
            noteTag: 'Consonne',
            color: '#F77F00',
            darkText: false,
            wordsWith: [
                { word: 'MOTO',   tts: 'moto',   icon: '🏍️', pos: 'start', highlightIdx: [0] },
                { word: 'MAISON', tts: 'maison', icon: '🏡', pos: 'start', highlightIdx: [0] },
                { word: 'POMME',  tts: 'pomme',  icon: '🍎', pos: 'end',   highlightIdx: [2, 3] },
                { word: 'PLUME',  tts: 'plume',  icon: '🪶', pos: 'end',   highlightIdx: [3] }
            ],
            wordsWithout: [
                { word: 'VÉLO',   tts: 'vélo',   icon: '🚲' },
                { word: 'TORTUE', tts: 'tortue', icon: '🐢' },
                { word: 'ROBOT',  tts: 'robot',  icon: '🤖' },
                { word: 'KIWI',   tts: 'kiwi',   icon: '🥝' }
            ]
        }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let phonicsMode = 'yesno'; // 'yesno' | 'findword' | 'position'
    let currentPhoneme = null;
    let lastPhonemeId = null;
    let targetWordObj = null;
    let yesNoExpected = true;
    let optionCardsData = [];
    let isSolved = false;
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

    function playSuccessChime() {
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

    function playSoftClick() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(360, now);
            gain.gain.setValueAtTime(0.14, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.11);
        } catch (e) {}
    }

    function formatHighlightedWord(wordObj) {
        const chars = wordObj.word.split('');
        const highlights = new Set(wordObj.highlightIdx || []);
        return chars.map((ch, idx) => {
            if (highlights.has(idx)) {
                return `<span style="color:${currentPhoneme.color};text-decoration:underline;font-weight:900;">${ch}</span>`;
            }
            return ch;
        }).join('');
    }

    function startRound() {
        isSolved = false;

        const candidates = PHONEME_BANK.filter(p => p.id !== lastPhonemeId);
        currentPhoneme = candidates[Math.floor(Math.random() * candidates.length)];
        lastPhonemeId = currentPhoneme.id;

        const badge = document.getElementById('phoneme-badge');
        if (badge) {
            badge.innerText = currentPhoneme.symbol;
            badge.style.backgroundColor = currentPhoneme.color;
            badge.className = 'phoneme-badge' + (currentPhoneme.darkText ? ' dark-text' : '');
        }

        const heroBtn = document.getElementById('phoneme-hero-btn');
        if (heroBtn) {
            heroBtn.style.borderColor = currentPhoneme.color;
        }

        const heroText = document.getElementById('phoneme-hero-text');
        if (heroText) {
            heroText.innerText = lang === 'fr'
                ? `🔊 Écouter le son ${currentPhoneme.symbol}`
                : `🔊 Hear sound ${currentPhoneme.symbol}`;
        }

        if (phonicsMode === 'yesno') {
            yesNoExpected = Math.random() > 0.45;
            const pool = yesNoExpected ? currentPhoneme.wordsWith : currentPhoneme.wordsWithout;
            targetWordObj = pool[Math.floor(Math.random() * pool.length)];
        } else if (phonicsMode === 'findword') {
            targetWordObj = currentPhoneme.wordsWith[Math.floor(Math.random() * currentPhoneme.wordsWith.length)];
            const distractors = [...currentPhoneme.wordsWithout].sort(() => Math.random() - 0.5).slice(0, 2);
            optionCardsData = [
                { ...targetWordObj, isMatch: true },
                ...distractors.map(d => ({ ...d, isMatch: false }))
            ].sort(() => Math.random() - 0.5);
        } else {
            targetWordObj = currentPhoneme.wordsWith[Math.floor(Math.random() * currentPhoneme.wordsWith.length)];
        }

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`phonics_${phonicsMode}_${currentPhoneme.id}`);
        }

        renderBoard();
        renderChoices();
        updatePrompt(true);

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function getPromptText() {
        if (isSolved) {
            if (phonicsMode === 'yesno') {
                return yesNoExpected
                    ? (lang === 'fr' ? `Oui ! On entend ${currentPhoneme.symbol} dans ${targetWordObj.word} ! 🌟` : `Yes! We hear ${currentPhoneme.symbol} in ${targetWordObj.word}! 🌟`)
                    : (lang === 'fr' ? `Exact ! On n'entend pas ${currentPhoneme.symbol} dans ${targetWordObj.word} ! 🌟` : `Right! No ${currentPhoneme.symbol} in ${targetWordObj.word}! 🌟`);
            }
            if (phonicsMode === 'findword') {
                return lang === 'fr'
                    ? `Bravo ! On entend ${currentPhoneme.symbol} dans ${targetWordObj.word} ! 🌟`
                    : `Great job! We hear ${currentPhoneme.symbol} in ${targetWordObj.word}! 🌟`;
            }
            const whereFr = targetWordObj.pos === 'start' ? 'AU DÉBUT' : 'À LA FIN';
            const whereEn = targetWordObj.pos === 'start' ? 'AT THE START' : 'AT THE END';
            return lang === 'fr'
                ? `Bravo ! Le son ${currentPhoneme.symbol} est ${whereFr} de ${targetWordObj.word} ! 🌟`
                : `Great job! Sound ${currentPhoneme.symbol} is ${whereEn} of ${targetWordObj.word}! 🌟`;
        }

        if (phonicsMode === 'yesno') {
            return lang === 'fr'
                ? `Entends-tu le son ${currentPhoneme.symbol} dans « ${targetWordObj.word} » ?`
                : `Do you hear ${currentPhoneme.symbol} in "${targetWordObj.word}"?`;
        }
        if (phonicsMode === 'findword') {
            return lang === 'fr'
                ? `Dans quel mot entends-tu le son ${currentPhoneme.symbol} ?`
                : `Which word has the sound ${currentPhoneme.symbol}?`;
        }
        return lang === 'fr'
            ? `Où entends-tu ${currentPhoneme.symbol} dans « ${targetWordObj.word} » ?`
            : `Where do you hear ${currentPhoneme.symbol} in "${targetWordObj.word}"?`;
    }

    function speakRoundInstruction() {
        if (isSolved) {
            speakFr(targetWordObj.tts, 0.88);
            return;
        }

        if (phonicsMode === 'yesno') {
            speakFr(`Entends-tu le son : ${currentPhoneme.tts}... dans : ${targetWordObj.tts} ?`, 0.86);
        } else if (phonicsMode === 'findword') {
            speakFr(`Trouve le mot où on entend : ${currentPhoneme.tts}`, 0.88);
        } else {
            speakFr(`Où entends-tu ${currentPhoneme.tts}... dans : ${targetWordObj.tts} ? Au début, ou à la fin ?`, 0.86);
        }
    }

    function updatePrompt(shouldSpeak = false) {
        const lbl = document.getElementById('prompt-label');
        if (lbl) lbl.innerText = getPromptText();
        if (shouldSpeak) speakRoundInstruction();
    }

    /* ============================================================================
       BOARD & CHOICES RENDERING
       ============================================================================ */

    function renderBoard() {
        const board = document.getElementById('phonics-board');
        if (!board) return;
        board.innerHTML = '';

        if (phonicsMode === 'yesno') {
            const card = document.createElement('div');
            card.className = 'single-word-card';
            if (isSolved) card.classList.add(yesNoExpected ? 'solved-yes' : 'solved-no');

            const wordHtml = (isSolved && yesNoExpected)
                ? formatHighlightedWord(targetWordObj)
                : targetWordObj.word;

            card.innerHTML = `
                <div class="word-emoji-big">${targetWordObj.icon}</div>
                <div class="word-letters-display">${wordHtml}</div>
                <div class="tap-listen-hint">🔊 ${lang === 'fr' ? 'Touche pour écouter' : 'Tap to hear word'}</div>
            `;
            card.onclick = () => speakFr(targetWordObj.tts, 0.84);
            board.appendChild(card);
            return;
        }

        if (phonicsMode === 'findword') {
            const hint = document.createElement('div');
            hint.className = 'tap-listen-hint';
            hint.style.fontSize = '1.05rem';
            hint.innerText = lang === 'fr'
                ? `👆 Touche chaque image pour écouter le mot et cherche le son ${currentPhoneme.symbol}`
                : `👆 Tap each picture to hear the word and find sound ${currentPhoneme.symbol}`;
            board.appendChild(hint);

            const row = document.createElement('div');
            row.className = 'phonics-choices-row';

            optionCardsData.forEach((item, idx) => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'word-option-card';
                card.id = `word-opt-${idx}`;

                const labelHtml = (isSolved && item.isMatch)
                    ? formatHighlightedWord(item)
                    : item.word;

                card.innerHTML = `
                    <div style="font-size:3.8rem;line-height:1.05;">${item.icon}</div>
                    <div style="font-size:1.3rem;font-weight:800;color:#1E293B;">${labelHtml}</div>
                `;

                card.onclick = () => {
                    if (isSolved) return;
                    speakFr(item.tts, 0.85);

                    if (item.isMatch) {
                        isSolved = true;
                        card.classList.add('winner');
                        playSuccessChime();

                        if (window.AlpTracker) {
                            window.AlpTracker.onTrialSuccess(`phonics_${phonicsMode}_${currentPhoneme.id}`);
                        }

                        renderBoard();
                        updatePrompt(false);
                        setTimeout(() => speakFr(`Bravo ! ${item.tts} !`, 0.9), 550);
                        setTimeout(startRound, 2300);
                    } else {
                        card.classList.add('soft-dim');
                        if (window.AlpTracker) {
                            window.AlpTracker.onAttempt();
                        }
                    }
                };

                row.appendChild(card);
            });

            board.appendChild(row);
            return;
        }

        // Position Mode ('start' vs 'end' 2-wagon train)
        const wordCard = document.createElement('div');
        wordCard.className = 'single-word-card' + (isSolved ? ' solved-yes' : '');
        wordCard.style.width = '200px';
        wordCard.style.padding = '12px';

        const labelHtml = isSolved ? formatHighlightedWord(targetWordObj) : targetWordObj.word;
        wordCard.innerHTML = `
            <div style="font-size:3.8rem;line-height:1.05;">${targetWordObj.icon}</div>
            <div class="word-letters-display" style="font-size:1.65rem;">${labelHtml}</div>
        `;
        wordCard.onclick = () => speakFr(targetWordObj.tts, 0.82);
        board.appendChild(wordCard);

        const trainRow = document.createElement('div');
        trainRow.className = 'position-train-row';
        trainRow.innerHTML = `<div style="font-size:3.2rem;line-height:1;">🚂</div>`;

        [
            { pos: 'start', num: '1', label: { fr: 'Au Début', en: 'At the Start' } },
            { pos: 'end',   num: '2', label: { fr: 'À la Fin', en: 'At the End' } }
        ].forEach(w => {
            const wagon = document.createElement('button');
            wagon.type = 'button';
            wagon.className = 'pos-wagon-btn';
            if (isSolved && w.pos === targetWordObj.pos) wagon.classList.add('winner');

            wagon.innerHTML = `
                <span style="font-size:1.35rem;font-weight:800;color:#1D4ED8;">${w.num}. ${w.label[lang]}</span>
                <span style="font-size:1.4rem;">${w.pos === 'start' ? '⬅️' : '➡️'}</span>
            `;

            wagon.onclick = () => {
                if (isSolved) return;

                if (w.pos === targetWordObj.pos) {
                    isSolved = true;
                    playSuccessChime();

                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(`phonics_${phonicsMode}_${currentPhoneme.id}`);
                    }

                    renderBoard();
                    updatePrompt(false);
                    const wherePhrase = w.pos === 'start' ? 'au début' : 'à la fin';
                    speakFr(`Bravo ! On entend ${currentPhoneme.tts} ${wherePhrase} de ${targetWordObj.tts} !`, 0.9);
                    setTimeout(startRound, 2400);
                } else {
                    wagon.classList.add('soft-dim');
                    playSoftClick();
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt();
                    }
                    speakFr(`Écoute bien : ${targetWordObj.tts}. Est-ce au début ou à la fin ?`, 0.85);
                }
            };

            trainRow.appendChild(wagon);
        });

        board.appendChild(trainRow);

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function renderChoices() {
        const area = document.getElementById('phonics-choices');
        if (!area) return;
        area.innerHTML = '';

        if (phonicsMode !== 'yesno') {
            if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
                window.AlpInputManager.refresh();
            }
            return;
        }

        [
            { val: true,  cls: 'btn-yes', icon: '👍', label: { fr: "Oui, j'entends !", en: 'Yes, I hear it!' } },
            { val: false, cls: 'btn-no',  icon: '👎', label: { fr: 'Non, pas du tout', en: 'No, not there' } }
        ].forEach(opt => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `yesno-btn ${opt.cls}`;
            btn.innerHTML = `<span>${opt.icon}</span><span>${opt.label[lang]}</span>`;

            btn.onclick = () => {
                if (isSolved) return;

                if (opt.val === yesNoExpected) {
                    isSolved = true;
                    playSuccessChime();

                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(`phonics_${phonicsMode}_${currentPhoneme.id}`);
                    }

                    renderBoard();
                    updatePrompt(false);
                    const feedback = yesNoExpected
                        ? `Bravo ! On entend ${currentPhoneme.tts} dans ${targetWordObj.tts} !`
                        : `Bravo ! Il n'y a pas le son ${currentPhoneme.tts} dans ${targetWordObj.tts} !`;
                    speakFr(feedback, 0.9);
                    setTimeout(startRound, 2300);
                } else {
                    btn.classList.add('soft-dim');
                    playSoftClick();
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt();
                    }
                    speakFr(`Écoute encore : ${currentPhoneme.tts}... ${targetWordObj.tts}.`, 0.84);
                }
            };

            area.appendChild(btn);
        });

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setPhonicsMode(mode, btnId) {
        phonicsMode = mode;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add('active');
        startRound();
        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setupControls() {
        const heroBtn = document.getElementById('phoneme-hero-btn');
        if (heroBtn) {
            heroBtn.onclick = () => {
                if (currentPhoneme) speakFr(currentPhoneme.tts, 0.84);
            };
        }

        const mYesnoBtn = document.getElementById('mode-yesno-btn');
        if (mYesnoBtn) mYesnoBtn.onclick = () => setPhonicsMode('yesno', 'mode-yesno-btn');

        const mFindwordBtn = document.getElementById('mode-findword-btn');
        if (mFindwordBtn) mFindwordBtn.onclick = () => setPhonicsMode('findword', 'mode-findword-btn');

        const mPosBtn = document.getElementById('mode-position-btn');
        if (mPosBtn) mPosBtn.onclick = () => setPhonicsMode('position', 'mode-position-btn');

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) speakBtn.onclick = () => speakRoundInstruction();

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
                if (title) title.innerText = lang === 'fr' ? "👂 J'entends le son (CP)" : '👂 Phonemic Ear (CP)';

                if (mYesnoBtn) mYesnoBtn.innerText = lang === 'fr' ? '✅ Oui ou Non ?' : '✅ Yes or No?';
                if (mFindwordBtn) mFindwordBtn.innerText = lang === 'fr' ? '🔍 Trouve le mot' : '🔍 Find the Word';
                if (mPosBtn) mPosBtn.innerText = lang === 'fr' ? '🚂 Début ou Fin ?' : '🚂 Start or End?';

                renderBoard();
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
