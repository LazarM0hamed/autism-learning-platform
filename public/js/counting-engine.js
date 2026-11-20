/**
 * Counting & Quantity Correspondence Engine (Activity #26)
 * Features interactive touch-to-count objects, structured 5-column grid (boîtes de 10),
 * 3 progressive modes (Compter, Remplis le panier, Points & Quantités),
 * and 1-5 / 1-10 range switcher.
 */

(() => {
    'use strict';

    const COUNTABLE_THEMES = [
        { id: 'apples',       icon: '🍎', plural: { fr: 'pommes',      en: 'apples' },       singular: { fr: 'une pomme',      en: 'an apple' } },
        { id: 'stars',        icon: '⭐', plural: { fr: 'étoiles',     en: 'stars' },        singular: { fr: 'une étoile',     en: 'a star' } },
        { id: 'cars',         icon: '🚗', plural: { fr: 'voitures',    en: 'cars' },         singular: { fr: 'une voiture',    en: 'a car' } },
        { id: 'strawberries', icon: '🍓', plural: { fr: 'fraises',     en: 'strawberries' }, singular: { fr: 'une fraise',     en: 'a strawberry' } },
        { id: 'butterflies',  icon: '🦋', plural: { fr: 'papillons',   en: 'butterflies' },  singular: { fr: 'un papillon',    en: 'a butterfly' } },
        { id: 'fish',         icon: '🐟', plural: { fr: 'poissons',    en: 'fish' },         singular: { fr: 'un poisson',     en: 'a fish' } }
    ];

    const NUMBER_WORDS_FR = ['', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix'];
    const NUMBER_WORDS_EN = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let gameMode = 'count'; // 'count' | 'basket' | 'dots'
    let maxNumber = 5;
    let targetCount = 3;
    let lastTargetCount = null;
    let currentTheme = COUNTABLE_THEMES[0];
    let countedIndices = [];
    let basketCount = 0;
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

    function playCountPop(stepNum) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(340 + stepNum * 38, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {}
    }

    function playSuccessFanfare() {
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

    function getNumberWord(n) {
        return lang === 'fr' ? NUMBER_WORDS_FR[n] : NUMBER_WORDS_EN[n];
    }

    function startRound() {
        isSolved = false;
        countedIndices = [];
        basketCount = 0;

        const candidates = [];
        for (let n = 1; n <= maxNumber; n++) {
            if (n !== lastTargetCount) candidates.push(n);
        }
        targetCount = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : 1;
        lastTargetCount = targetCount;

        currentTheme = COUNTABLE_THEMES[Math.floor(Math.random() * COUNTABLE_THEMES.length)];

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`count_${gameMode}_${targetCount}`);
        }

        updatePrompt(true);
        renderBoard();
        renderInteractionArea();

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function getPromptText() {
        if (gameMode === 'basket') {
            return lang === 'fr'
                ? `Mets ${targetCount} ${currentTheme.plural.fr} dans le panier !`
                : `Put ${targetCount} ${currentTheme.plural.en} in the basket!`;
        }
        return lang === 'fr'
            ? `Combien y a-t-il de ${currentTheme.plural.fr} ?`
            : `How many ${currentTheme.plural.en} are there?`;
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const lbl = document.getElementById('prompt-label');
        if (lbl) lbl.innerText = text;
        if (shouldSpeak) speak(text);
    }

    /* ============================================================================
       MAIN BOARD RENDERING (Touch-to-Count Grid or Basket View)
       ============================================================================ */

    function renderBoard() {
        const board = document.getElementById('counting-board');
        if (!board) return;
        board.innerHTML = '';

        if (gameMode === 'basket') {
            const badge = document.createElement('div');
            badge.className = 'basket-header-badge';
            badge.innerHTML = `<span>🧺</span><span>${lang === 'fr' ? 'Objectif :' : 'Target:'} <strong style="font-size:1.75rem;color:#2563EB;">${targetCount}</strong> ${currentTheme.icon}</span>`;
            board.appendChild(badge);

            const grid = document.createElement('div');
            grid.className = 'objects-five-grid';
            for (let i = 0; i < basketCount; i++) {
                const cell = document.createElement('div');
                cell.className = 'countable-item counted';
                cell.innerHTML = `${currentTheme.icon}<span class="count-stamp">${i + 1}</span>`;
                grid.appendChild(cell);
            }
            board.appendChild(grid);
            return;
        }

        // Modes 'count' & 'dots': Interactive Touch-to-Count Objects
        const hint = document.createElement('div');
        hint.className = 'helper-hint';
        hint.innerText = lang === 'fr'
            ? '👆 Touche chaque objet pour compter ensemble'
            : '👆 Tap each object to count together';
        board.appendChild(hint);

        const grid = document.createElement('div');
        grid.className = 'objects-five-grid';

        for (let i = 0; i < targetCount; i++) {
            const cell = document.createElement('div');
            const orderIndex = countedIndices.indexOf(i);
            const isCounted = orderIndex !== -1;

            cell.className = 'countable-item' + (isCounted ? ' counted' : '');
            cell.innerHTML = currentTheme.icon + (isCounted ? `<span class="count-stamp">${orderIndex + 1}</span>` : '');

            cell.onclick = () => {
                if (isSolved) return;
                if (!countedIndices.includes(i)) {
                    countedIndices.push(i);
                    const countNow = countedIndices.length;
                    playCountPop(countNow);
                    speak(getNumberWord(countNow));
                    renderBoard();
                } else {
                    const num = countedIndices.indexOf(i) + 1;
                    playCountPop(num);
                    speak(getNumberWord(num));
                }
            };

            grid.appendChild(cell);
        }

        board.appendChild(grid);
    }

    /* ============================================================================
       BOTTOM INTERACTION AREA (Number Cards, Basket Button, or Dot Cards)
       ============================================================================ */

    function renderInteractionArea() {
        const area = document.getElementById('interaction-area');
        if (!area) return;
        area.innerHTML = '';

        if (gameMode === 'basket') {
            const row = document.createElement('div');
            row.className = 'basket-controls-row';

            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.className = 'add-item-btn';
            addBtn.innerHTML = `<span style="font-size:1.8rem;">${currentTheme.icon}</span><span>${
                lang === 'fr' ? `Ajouter ${currentTheme.singular.fr}` : `Add ${currentTheme.singular.en}`
            }</span>`;

            addBtn.onclick = () => {
                if (isSolved || basketCount >= maxNumber) return;
                basketCount++;
                playCountPop(basketCount);
                renderBoard();

                if (basketCount === targetCount) {
                    isSolved = true;
                    playSuccessFanfare();
                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(`count_${gameMode}_${targetCount}`);
                    }
                    const praise = lang === 'fr'
                        ? `Bravo ! Il y a exactement ${targetCount} ${currentTheme.plural.fr} !`
                        : `Great job! There are exactly ${targetCount} ${currentTheme.plural.en}!`;
                    const promptEl = document.getElementById('prompt-label');
                    if (promptEl) promptEl.innerText = praise;
                    speak(praise);
                    setTimeout(startRound, 2100);
                } else {
                    speak(getNumberWord(basketCount));
                }
            };

            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'clear-basket-btn';
            clearBtn.innerText = lang === 'fr' ? '🔄 Vider' : '🔄 Empty';
            clearBtn.onclick = () => {
                if (isSolved) return;
                basketCount = 0;
                renderBoard();
            };

            row.appendChild(addBtn);
            row.appendChild(clearBtn);
            area.appendChild(row);

            if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
                window.AlpInputManager.refresh();
            }
            return;
        }

        const allNums = [];
        for (let n = 1; n <= maxNumber; n++) allNums.push(n);
        const distractors = allNums.filter(n => n !== targetCount).sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [targetCount, ...distractors].sort(() => Math.random() - 0.5);

        const grid = document.createElement('div');
        grid.className = 'number-choices-grid';

        choices.forEach(num => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'num-choice-card';

            const dotsHtml = Array.from({ length: num })
                .map(() => `<span class="mini-dot" style="${gameMode === 'dots' ? 'width:16px;height:16px;' : ''}"></span>`)
                .join('');

            if (gameMode === 'dots') {
                card.innerHTML = `<div class="mini-dots-row" style="min-height:64px;align-items:center;">${dotsHtml}</div>`;
            } else {
                card.innerHTML = `
                    <span class="big-digit">${num}</span>
                    <div class="mini-dots-row">${dotsHtml}</div>
                `;
            }

            card.onclick = () => {
                if (isSolved) return;

                if (num === targetCount) {
                    isSolved = true;
                    card.classList.add('winner');
                    playSuccessFanfare();

                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(`count_${gameMode}_${targetCount}`);
                    }

                    countedIndices = Array.from({ length: targetCount }, (_, idx) => idx);
                    renderBoard();

                    const praise = lang === 'fr'
                        ? `Bravo ! Il y en a ${targetCount} !`
                        : `Great job! There are ${targetCount}!`;
                    const promptEl = document.getElementById('prompt-label');
                    if (promptEl) promptEl.innerText = praise;
                    speak(praise);
                    setTimeout(startRound, 2000);
                } else {
                    card.classList.add('soft-dim');
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt();
                    }
                    const hint = lang === 'fr'
                        ? `Ça c'est ${num}. Compte bien les ${currentTheme.plural.fr} !`
                        : `That is ${num}. Count the ${currentTheme.plural.en} carefully!`;
                    speak(hint);
                }
            };

            grid.appendChild(card);
        });

        area.appendChild(grid);

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
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
        const countBtn = document.getElementById('mode-count-btn');
        if (countBtn) countBtn.onclick = () => setMode('count', 'mode-count-btn');

        const basketBtn = document.getElementById('mode-basket-btn');
        if (basketBtn) basketBtn.onclick = () => setMode('basket', 'mode-basket-btn');

        const dotsBtn = document.getElementById('mode-dots-btn');
        if (dotsBtn) dotsBtn.onclick = () => setMode('dots', 'mode-dots-btn');

        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                maxNumber = parseInt(btn.getAttribute('data-max'), 10) || 5;
                lastTargetCount = null;
                startRound();
            };
        });

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
                if (title) title.innerText = lang === 'fr' ? '🔢 Compter & Quantités' : '🔢 Counting & Quantities';

                if (countBtn) countBtn.innerText = lang === 'fr' ? '🍎 Compter les objets' : '🍎 Count Objects';
                if (basketBtn) basketBtn.innerText = lang === 'fr' ? '🧺 Remplis le panier' : '🧺 Fill the Basket';
                if (dotsBtn) dotsBtn.innerText = lang === 'fr' ? '🎲 Points & Quantités' : '🎲 Dots & Quantities';

                const r5 = document.getElementById('range-5-btn');
                if (r5) r5.innerText = lang === 'fr' ? '⭐ De 1 à 5' : '⭐ 1 to 5';
                const r10 = document.getElementById('range-10-btn');
                if (r10) r10.innerText = lang === 'fr' ? '🌟 De 1 à 10' : '🌟 1 to 10';

                updatePrompt(true);
                renderBoard();
                renderInteractionArea();
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
