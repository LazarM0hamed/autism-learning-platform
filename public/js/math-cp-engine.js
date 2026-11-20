/**
 * Ten-Frame Math & First Additions Engine (Activity #30)
 * Introduces the French CP Boîte de 10 (2x5 grid) to make number bonds (compléments à 5 & 10)
 * and early additions concrete, visual, and tactile.
 */

(() => {
    'use strict';

    const NUM_WORDS_FR = ['Zéro', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix'];
    const NUM_WORDS_EN = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let mathMode = 'comp5'; // 'comp5' | 'comp10' | 'add'
    let blueCount = 2;
    let orangeCount = 3;
    let targetAnswer = 3;
    let lastBlueCount = null;
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

    function playTokenTone(index) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(330 + index * 35, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {}
    }

    function playVictoryFanfare() {
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

        if (mathMode === 'comp5') {
            const choices = [1, 2, 3, 4].filter(n => n !== lastBlueCount);
            blueCount = choices[Math.floor(Math.random() * choices.length)];
            lastBlueCount = blueCount;
            orangeCount = 5 - blueCount;
            targetAnswer = orangeCount;
        } else if (mathMode === 'comp10') {
            const choices = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => n !== lastBlueCount);
            blueCount = choices[Math.floor(Math.random() * choices.length)];
            lastBlueCount = blueCount;
            orangeCount = 10 - blueCount;
            targetAnswer = orangeCount;
        } else {
            const a = 1 + Math.floor(Math.random() * 5);
            const maxB = Math.min(5, 10 - a);
            const b = 1 + Math.floor(Math.random() * maxB);
            blueCount = a;
            orangeCount = b;
            targetAnswer = a + b;
        }

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`mathcp_${mathMode}_${targetAnswer}`);
        }

        renderEquation();
        renderTenFrame();
        renderChoices();
        updatePrompt(true);

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function getPromptText() {
        if (isSolved) {
            if (mathMode === 'comp5') {
                return lang === 'fr' ? `Bravo ! ${blueCount} + ${orangeCount} = 5 ! 🌟` : `Great job! ${blueCount} + ${orangeCount} = 5! 🌟`;
            }
            if (mathMode === 'comp10') {
                return lang === 'fr' ? `Bravo ! ${blueCount} + ${orangeCount} = 10 ! 🌟` : `Great job! ${blueCount} + ${orangeCount} = 10! 🌟`;
            }
            return lang === 'fr' ? `Bravo ! ${blueCount} + ${orangeCount} = ${targetAnswer} ! 🌟` : `Great job! ${blueCount} + ${orangeCount} = ${targetAnswer}! 🌟`;
        }

        if (mathMode === 'comp5') {
            return lang === 'fr'
                ? `Il y a ${blueCount} jetons bleus. Combien manque-t-il pour faire 5 ?`
                : `There are ${blueCount} blue tokens. How many more to make 5?`;
        }
        if (mathMode === 'comp10') {
            return lang === 'fr'
                ? `Il y a ${blueCount} jetons bleus. Combien manque-t-il pour remplir la boîte de 10 ?`
                : `There are ${blueCount} blue tokens. How many more to fill the box of 10?`;
        }
        return lang === 'fr'
            ? `Combien font ${blueCount} + ${orangeCount} en tout ?`
            : `How much is ${blueCount} + ${orangeCount} altogether?`;
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const lbl = document.getElementById('prompt-label');
        if (lbl) lbl.innerText = text;
        if (shouldSpeak) speak(text);
    }

    function renderEquation() {
        const banner = document.getElementById('equation-banner');
        if (!banner) return;

        if (mathMode === 'comp5' || mathMode === 'comp10') {
            const goal = mathMode === 'comp5' ? 5 : 10;
            const missingHtml = isSolved
                ? `<span class="eq-mystery solved">${orangeCount}</span>`
                : `<span class="eq-mystery">?</span>`;

            banner.innerHTML = `
                <span class="eq-num-blue">${blueCount}</span>
                <span>+</span>
                ${missingHtml}
                <span>=</span>
                <span class="eq-num-green">${goal}</span>
            `;
        } else {
            const sumHtml = isSolved
                ? `<span class="eq-mystery solved">${targetAnswer}</span>`
                : `<span class="eq-mystery">?</span>`;

            banner.innerHTML = `
                <span class="eq-num-blue">${blueCount}</span>
                <span>+</span>
                <span class="eq-num-orange">${orangeCount}</span>
                <span>=</span>
                ${sumHtml}
            `;
        }
    }

    function renderTenFrame() {
        const grid = document.getElementById('ten-frame-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const totalSlots = mathMode === 'comp5' ? 5 : 10;

        for (let i = 0; i < totalSlots; i++) {
            const cell = document.createElement('div');
            cell.className = 'tf-cell';

            const showBlue = i < blueCount;
            const showOrange = (mathMode === 'add' || isSolved) && i >= blueCount && i < (blueCount + orangeCount);

            if (showBlue || showOrange) {
                cell.classList.add('has-token');
                const colorClass = showBlue ? 'token-blue' : 'token-orange';
                const displayNum = i + 1;
                cell.innerHTML = `<div class="token-marble ${colorClass}">${displayNum}</div>`;
                cell.onclick = () => {
                    playTokenTone(displayNum);
                    const word = lang === 'fr' ? NUM_WORDS_FR[displayNum] : NUM_WORDS_EN[displayNum];
                    speak(word);
                };
            }

            grid.appendChild(cell);
        }
    }

    function renderChoices() {
        const row = document.getElementById('math-choices');
        if (!row) return;
        row.innerHTML = '';
        const maxVal = mathMode === 'comp5' ? 5 : 10;

        const pool = [];
        for (let n = 1; n <= maxVal; n++) {
            if (n !== targetAnswer) pool.push(n);
        }
        const distractors = pool.sort(() => Math.random() - 0.5).slice(0, 2);
        const options = [targetAnswer, ...distractors].sort(() => Math.random() - 0.5);

        options.forEach(num => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'math-choice-btn';
            btn.innerText = num;

            btn.onclick = () => {
                if (isSolved) return;

                if (num === targetAnswer) {
                    isSolved = true;
                    btn.classList.add('winner');
                    playVictoryFanfare();

                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(`mathcp_${mathMode}_${targetAnswer}`);
                    }

                    renderEquation();
                    renderTenFrame();
                    updatePrompt(true);
                    setTimeout(startRound, 2200);
                } else {
                    btn.classList.add('soft-dim');
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt();
                    }
                    const hint = mathMode === 'add'
                        ? (lang === 'fr' ? `Non, pas ${num}. Compte tous les jetons dans la boîte !` : `Not ${num}. Count all tokens in the box!`)
                        : (lang === 'fr' ? `Non, pas ${num}. Compte les cases vides !` : `Not ${num}. Count the empty spaces!`);
                    speak(hint);
                }
            };

            row.appendChild(btn);
        });

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setMathMode(mode, btnId) {
        mathMode = mode;
        lastBlueCount = null;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add('active');
        startRound();
        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setupControls() {
        const comp5Btn = document.getElementById('mode-comp5-btn');
        if (comp5Btn) comp5Btn.onclick = () => setMathMode('comp5', 'mode-comp5-btn');

        const comp10Btn = document.getElementById('mode-comp10-btn');
        if (comp10Btn) comp10Btn.onclick = () => setMathMode('comp10', 'mode-comp10-btn');

        const addBtn = document.getElementById('mode-add-btn');
        if (addBtn) addBtn.onclick = () => setMathMode('add', 'mode-add-btn');

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
                if (title) title.innerText = lang === 'fr' ? '🔟 Boîtes de 10 & Additions' : '🔟 Ten-Frame Math';

                if (comp5Btn) comp5Btn.innerText = lang === 'fr' ? '🖐️ Compléments à 5' : '🖐️ Make 5';
                if (comp10Btn) comp10Btn.innerText = lang === 'fr' ? '🔟 Compléments à 10' : '🔟 Make 10';
                if (addBtn) addBtn.innerText = lang === 'fr' ? '➕ Premières additions' : '➕ First Additions';

                const hint = document.getElementById('tf-hint');
                if (hint) hint.innerText = lang === 'fr' ? '👆 Touche les jetons pour compter' : '👆 Tap tokens to count';

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
