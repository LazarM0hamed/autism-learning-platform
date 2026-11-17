// Match & Colour Engine
// Autism Learning Platform - 3-4 Reference Models in Row 1, Single Active Object in Row 2, Direct Arrow Key Color Palette in Row 3.

(() => {
    'use strict';

    let coloringData = null;
    let activeTier = 2; // Default: 3 Models (Tier 2) or 4 Models (Tier 3)
    let filteredLevels = [];
    let currentLevelIndex = 0;
    let activeLevel = null;
    let currentItemIndex = 0; // Index of the single item currently being coloured in Row 2
    let activePencilIndex = 0; // Index of the currently highlighted pencil in Row 3
    let currentShuffledPalette = []; // Shuffled pencils palette for visual discrimination
    let completedItemIds = new Set();
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'fr';

    const uiStrings = {
        en: {
            title: "🖍️ Match & Colour",
            home: "⬅️ Home",
            tier2: "⭐ 3 Models",
            tier3: "🌟 4 Models",
            rowModels: "👁️ Reference Models:",
            rowCanvas: "🎨 Object to Colour (Match the model with arrow ⬇️):",
            rowPalette: "🖍️ Select Colour (Use arrows ⬅️ ➡️ and press Enter):",
            promptColorObject: "Colour the",
            promptLikeModel: "like the model above!",
            promptSuccessSet: "Awesome! All models are coloured! 🌟",
            andNow: "And now: colour the"
        },
        fr: {
            title: "🖍️ Colorie le modèle",
            home: "⬅️ Accueil",
            tier2: "⭐ 3 Modèles",
            tier3: "🌟 4 Modèles",
            rowModels: "👁️ Modèles de référence :",
            rowCanvas: "🎨 Dessin à colorier (regarde le modèle avec la flèche ⬇️) :",
            rowPalette: "🖍️ Choisis la couleur (Flèches ⬅️ ➡️ puis Entrée) :",
            promptColorObject: "Colorie :",
            promptLikeModel: "comme sur le modèle en haut !",
            promptSuccessSet: "Bravo ! Tous les modèles sont coloriés ! 🌟",
            andNow: "Et maintenant : colorie"
        }
    };

    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playCrayonSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    function playSoftStepSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    function playSuccessChime() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (index * 0.08));
            gain.gain.setValueAtTime(0, now + (index * 0.08));
            gain.gain.linearRampToValueAtTime(0.12, now + (index * 0.08) + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.08) + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + (index * 0.08));
            osc.stop(now + (index * 0.08) + 0.55);
        });
    }

    function playItemSuccessChime() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25]; // C5, E5
        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (index * 0.07));
            gain.gain.setValueAtTime(0, now + (index * 0.07));
            gain.gain.linearRampToValueAtTime(0.1, now + (index * 0.07) + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.07) + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + (index * 0.07));
            osc.stop(now + (index * 0.07) + 0.4);
        });
    }

    function getLabel(obj) {
        if (!obj) return '';
        if (typeof obj === 'object') {
            return obj[currentLang] || obj.fr || obj.en || '';
        }
        return obj || '';
    }

    function speakText(text) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentLang === 'fr' ? 'fr-FR' : 'en-US';
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
            const voices = window.speechSynthesis.getVoices();
            const voicePrefix = currentLang === 'fr' ? 'fr' : 'en';
            const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(voicePrefix));
            if (matchedVoice) utterance.voice = matchedVoice;
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn(e);
        }
    }

    function updateUIStaticText() {
        document.documentElement.lang = currentLang;
        const t = uiStrings[currentLang] || uiStrings.fr;

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = t.home;

        const titleElem = document.getElementById('activity-title');
        if (titleElem) titleElem.innerText = t.title;

        const lblModels = document.getElementById('lbl-row-models');
        if (lblModels) lblModels.innerText = t.rowModels;

        const lblCanvas = document.getElementById('lbl-row-canvas');
        if (lblCanvas) lblCanvas.innerText = t.rowCanvas;

        const lblPalette = document.getElementById('lbl-row-palette');
        if (lblPalette) lblPalette.innerText = t.rowPalette;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

        renderTierPills();
        renderPalette();
        updatePrompt();
    }

    function setupControls() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => {
                const selected = btn.getAttribute('data-lang');
                if (selected === currentLang) return;
                currentLang = selected;
                localStorage.setItem('alp_lang', currentLang);
                updateUIStaticText();
                renderLevel();
            };
        });

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (soundEnabled) speakCurrentPrompt();
                else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            };
        }

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) {
            speakBtn.onclick = () => speakCurrentPrompt();
        }

        // Direct Arrow Key Palette Navigation + Enter to Paint
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            const code = e.code;
            const key = e.key;

            if (code === 'ArrowLeft' || key === 'ArrowLeft') {
                e.preventDefault();
                navigatePencil(-1);
            } else if (code === 'ArrowRight' || key === 'ArrowRight') {
                e.preventDefault();
                navigatePencil(1);
            } else if (code === 'Enter' || key === 'Enter' || code === 'Space' || key === ' ') {
                e.preventDefault();
                if (currentShuffledPalette && currentShuffledPalette[activePencilIndex]) {
                    applyColor(currentShuffledPalette[activePencilIndex].id);
                }
            } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', '1', '2', '3', '4', '5', '6', '7', '8'].includes(key)) {
                const pIdx = parseInt(key, 10) - 1;
                if (currentShuffledPalette && currentShuffledPalette[pIdx]) {
                    activePencilIndex = pIdx;
                    highlightActivePencil();
                    applyColor(currentShuffledPalette[pIdx].id);
                }
            }
        });
    }

    function renderTierPills() {
        const container = document.getElementById('tier-pills');
        if (!container) return;
        container.innerHTML = '';

        const t = uiStrings[currentLang] || uiStrings.fr;
        const tiers = [
            { tier: 2, label: t.tier2 },
            { tier: 3, label: t.tier3 }
        ];

        tiers.forEach(item => {
            const pill = document.createElement('button');
            pill.className = `routine-pill ${item.tier === activeTier ? 'active' : ''}`;
            pill.innerText = item.label;
            pill.onclick = () => {
                if (item.tier === activeTier) return;
                activeTier = item.tier;
                renderTierPills();
                loadTierLevels();
            };
            container.appendChild(pill);
        });
    }

    function loadTierLevels() {
        if (!coloringData || !coloringData.levels) return;
        filteredLevels = coloringData.levels.filter(l => l.tier === activeTier);
        if (filteredLevels.length === 0) filteredLevels = coloringData.levels;
        currentLevelIndex = 0;
        renderLevel();
    }

    function shufflePalette() {
        if (!coloringData || !coloringData.palette) return;
        currentShuffledPalette = [...coloringData.palette].sort(() => 0.5 - Math.random());
        activePencilIndex = 0;
        renderPalette();
    }

    function renderLevel() {
        if (!filteredLevels || filteredLevels.length === 0) return;
        activeLevel = filteredLevels[currentLevelIndex % filteredLevels.length];

        currentItemIndex = 0;
        completedItemIds = new Set();
        isTransitioning = false;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`coloring_tier${activeTier}_lvl${currentLevelIndex}`);
        }

        shufflePalette();
        renderModelsRow();
        renderSingleCanvas();
        updatePrompt();
        speakCurrentPrompt();
    }

    function renderModelsRow() {
        const container = document.getElementById('models-container');
        if (!container) return;
        container.innerHTML = '';

        activeLevel.items.forEach((itemId, idx) => {
            const item = coloringData.items[itemId];
            if (!item) return;

            const card = document.createElement('div');
            const isCurrentTarget = (idx === currentItemIndex);
            const isCompleted = completedItemIds.has(itemId);

            card.className = `coloring-model-card ${isCurrentTarget ? 'current-model-target' : ''} ${isCompleted ? 'is-completed' : ''}`;

            const targetHex = getHexForColor(item.targetColor);
            const targetColorObj = coloringData.palette.find(p => p.id === item.targetColor);
            const colorName = targetColorObj ? getLabel(targetColorObj.name) : '';

            card.innerHTML = `
                <div class="coloring-svg-wrapper">
                    ${renderSvgItem(item, targetHex)}
                </div>
                <div class="coloring-card-badge" style="background: ${targetHex}20; color: ${targetHex}; border: 1.5px solid ${targetHex}40;">
                    ${getLabel(item.name)} (${colorName})
                    ${isCompleted ? ' ✅' : ''}
                </div>
            `;

            container.appendChild(card);
        });
    }

    function renderSingleCanvas(fillOverride = null) {
        const container = document.getElementById('canvas-container');
        if (!container || !activeLevel) return;
        container.innerHTML = '';

        const currentItemId = activeLevel.items[currentItemIndex];
        const item = coloringData.items[currentItemId];
        if (!item) return;

        const isMatched = completedItemIds.has(currentItemId);
        const fillHex = fillOverride || (isMatched ? getHexForColor(item.targetColor) : '#FFFFFF');

        const card = document.createElement('div');
        card.className = `coloring-single-canvas-card ${isMatched ? 'is-matched' : ''}`;
        card.setAttribute('aria-label', `${getLabel(item.name)}`);

        card.innerHTML = `
            <div class="coloring-svg-wrapper">
                ${renderSvgItem(item, fillHex)}
            </div>
            <div class="coloring-card-caption" style="font-size: 1.3rem; margin-top: 6px;">
                ${getLabel(item.name)}
                ${isMatched ? '<span class="coloring-match-check">✅</span>' : ''}
            </div>
        `;

        container.appendChild(card);
    }

    function renderPalette() {
        const container = document.getElementById('palette-container');
        if (!container || !currentShuffledPalette) return;
        container.innerHTML = '';

        currentShuffledPalette.forEach((pencil, idx) => {
            const btn = document.createElement('button');
            btn.className = `pencil-btn ${idx === activePencilIndex ? 'active-pencil' : ''}`;
            btn.id = `pencil-${idx}`;
            btn.style.setProperty('--pencil-color', pencil.hex);
            btn.setAttribute('aria-label', getLabel(pencil.name));
            btn.setAttribute('title', getLabel(pencil.name));

            btn.innerHTML = `
                <div class="pencil-body" style="background: ${pencil.hex};">
                    <div class="pencil-tip" style="border-bottom-color: ${pencil.hex};"></div>
                    <div class="pencil-lead" style="border-bottom-color: #1E293B;"></div>
                </div>
                <span class="pencil-label">${getLabel(pencil.name)}</span>
            `;

            btn.onclick = () => {
                if (isTransitioning) return;
                activePencilIndex = idx;
                highlightActivePencil();
                applyColor(pencil.id);
            };

            container.appendChild(btn);
        });
    }

    function navigatePencil(direction) {
        if (!currentShuffledPalette || currentShuffledPalette.length === 0) return;
        const total = currentShuffledPalette.length;
        activePencilIndex = (activePencilIndex + direction + total) % total;
        highlightActivePencil();
        playSoftStepSound();

        const activePencil = currentShuffledPalette[activePencilIndex];
        if (activePencil) {
            speakText(getLabel(activePencil.name));
        }
    }

    function highlightActivePencil() {
        const buttons = document.querySelectorAll('.pencil-btn');
        buttons.forEach((btn, idx) => {
            btn.classList.toggle('active-pencil', idx === activePencilIndex);
        });
    }

    function applyColor(colorId) {
        if (isTransitioning || !activeLevel) return;
        const currentItemId = activeLevel.items[currentItemIndex];
        const item = coloringData.items[currentItemId];
        if (!item) return;

        const colorObj = coloringData.palette.find(p => p.id === colorId);
        const colorName = colorObj ? getLabel(colorObj.name) : '';
        const isCorrect = (colorId === item.targetColor);

        playCrayonSound();

        if (window.AlpTracker) {
            window.AlpTracker.onAttempt(isCorrect, colorId);
        }

        if (isCorrect) {
            // Correct match!
            completedItemIds.add(currentItemId);
            playItemSuccessChime();
            renderSingleCanvas(getHexForColor(colorId));
            renderModelsRow();

            // Speak praise for this item
            const itemName = getLabel(item.name);
            const praiseText = currentLang === 'fr'
                ? `Oui ! ${itemName} est bien ${colorName.toLowerCase()} !`
                : `Yes! The ${itemName.toLowerCase()} is ${colorName.toLowerCase()}!`;
            speakText(praiseText);

            // Check if all items in current level are completed
            if (completedItemIds.size >= activeLevel.items.length) {
                isTransitioning = true;
                playSuccessChime();

                if (window.AlpTracker) {
                    window.AlpTracker.onTrialSuccess(`coloring_tier${activeTier}_lvl${currentLevelIndex}`);
                }

                const t = uiStrings[currentLang] || uiStrings.fr;
                const promptElem = document.getElementById('prompt-label');
                if (promptElem) promptElem.innerText = t.promptSuccessSet;

                setTimeout(() => {
                    speakText(t.promptSuccessSet);
                }, 100);

                // Advance to next set after celebration
                setTimeout(() => {
                    currentLevelIndex++;
                    renderLevel();
                }, 2600);
            } else {
                // Move to next item in this set after short pause
                isTransitioning = true;
                setTimeout(() => {
                    isTransitioning = false;
                    currentItemIndex++;
                    shufflePalette();
                    renderModelsRow();
                    renderSingleCanvas();
                    updatePrompt();
                    speakCurrentPrompt();
                }, 1400);
            }
        } else {
            // Incorrect color: still tint the canvas for immediate cause-and-effect, but prompt to retry
            const appliedHex = getHexForColor(colorId);
            renderSingleCanvas(appliedHex);

            const card = document.querySelector('.coloring-single-canvas-card');
            if (card) {
                card.classList.remove('gentle-retry');
                void card.offsetWidth;
                card.classList.add('gentle-retry');
            }

            const hintText = currentLang === 'fr'
                ? `C'est du ${colorName.toLowerCase()} ! Regarde bien la couleur du modèle en haut.`
                : `That is ${colorName.toLowerCase()}! Look closely at the model above.`;
            speakText(hintText);
        }
    }

    function getHexForColor(colorId) {
        if (!coloringData) return '#CBD5E1';
        const p = coloringData.palette.find(c => c.id === colorId);
        return p ? p.hex : '#CBD5E1';
    }

    function renderSvgItem(item, fillHex) {
        return `
            <svg viewBox="0 0 100 110" class="coloring-svg-canvas" width="100%" height="100%">
                <path d="${item.path}" fill="${fillHex}" stroke="#1E293B" stroke-width="3.5" stroke-linejoin="round" class="color-fill-wash" />
                ${item.stem ? `<path d="${item.stem}" fill="none" stroke="#78350F" stroke-width="4" stroke-linecap="round" />` : ''}
                ${item.leaf ? `<path d="${item.leaf}" fill="#22C55E" stroke="#15803D" stroke-width="2" />` : ''}
            </svg>
        `;
    }

    function getPromptText() {
        const t = uiStrings[currentLang] || uiStrings.fr;
        if (!activeLevel) return t.title;

        const currentItemId = activeLevel.items[currentItemIndex];
        const item = coloringData ? coloringData.items[currentItemId] : null;
        if (item) {
            return `${t.promptColorObject} ${getLabel(item.name)} ${t.promptLikeModel}`;
        }
        return t.title;
    }

    function updatePrompt() {
        const promptElem = document.getElementById('prompt-label');
        if (!promptElem) return;
        promptElem.innerText = getPromptText();
    }

    function speakCurrentPrompt() {
        speakText(getPromptText());
    }

    function init() {
        setupControls();
        updateUIStaticText();

        fetch('data/coloring.json')
            .then(res => res.json())
            .then(data => {
                coloringData = data;
                loadTierLevels();
            })
            .catch(err => console.error(err));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
