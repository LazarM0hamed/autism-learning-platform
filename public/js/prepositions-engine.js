/**
 * Spatial Prepositions Engine (Activity #27)
 * Teaches 6 essential spatial prepositions (Sur, Sous, Dans, Devant, Derrière, À côté)
 * through true SVG depth layering, interactive hotspots, jump physics, and visual cards.
 */

(() => {
    'use strict';

    const CHARACTERS = [
        { id: 'cat',    icon: '🐱', name: { fr: 'le chat',   en: 'the cat' } },
        { id: 'teddy',  icon: '🧸', name: { fr: 'le doudou', en: 'the teddy bear' } },
        { id: 'rabbit', icon: '🐰', name: { fr: 'le lapin',  en: 'the rabbit' } },
        { id: 'ball',   icon: '⚽', name: { fr: 'le ballon', en: 'the ball' } }
    ];

    const PREPOSITIONS = [
        {
            id: 'sur',
            anchor: 'table',
            layer: 'front',
            x: 230,
            y: 126,
            label: { fr: 'SUR', en: 'ON' },
            placePrompt: {
                fr: (c) => `Mets ${c.fr} SUR la table !`,
                en: (c) => `Put ${c.en} ON the table!`
            },
            answerPhrase: {
                fr: (c) => `${capitalize(c.fr)} est SUR la table !`,
                en: (c) => `${capitalize(c.en)} is ON the table!`
            }
        },
        {
            id: 'sous',
            anchor: 'table',
            layer: 'under',
            x: 230,
            y: 224,
            label: { fr: 'SOUS', en: 'UNDER' },
            placePrompt: {
                fr: (c) => `Mets ${c.fr} SOUS la table !`,
                en: (c) => `Put ${c.en} UNDER the table!`
            },
            answerPhrase: {
                fr: (c) => `${capitalize(c.fr)} est SOUS la table !`,
                en: (c) => `${capitalize(c.en)} is UNDER the table!`
            }
        },
        {
            id: 'dans',
            anchor: 'box',
            layer: 'inside',
            x: 245,
            y: 172,
            label: { fr: 'DANS', en: 'IN' },
            placePrompt: {
                fr: (c) => `Mets ${c.fr} DANS la boîte !`,
                en: (c) => `Put ${c.en} IN the box!`
            },
            answerPhrase: {
                fr: (c) => `${capitalize(c.fr)} est DANS la boîte !`,
                en: (c) => `${capitalize(c.en)} is IN the box!`
            }
        },
        {
            id: 'devant',
            anchor: 'box',
            layer: 'front',
            x: 245,
            y: 236,
            label: { fr: 'DEVANT', en: 'IN FRONT' },
            placePrompt: {
                fr: (c) => `Mets ${c.fr} DEVANT la boîte !`,
                en: (c) => `Put ${c.en} IN FRONT of the box!`
            },
            answerPhrase: {
                fr: (c) => `${capitalize(c.fr)} est DEVANT la boîte !`,
                en: (c) => `${capitalize(c.en)} is IN FRONT of the box!`
            }
        },
        {
            id: 'derriere',
            anchor: 'box',
            layer: 'behind',
            x: 292,
            y: 158,
            label: { fr: 'DERRIÈRE', en: 'BEHIND' },
            placePrompt: {
                fr: (c) => `Cache ${c.fr} DERRIÈRE la boîte !`,
                en: (c) => `Hide ${c.en} BEHIND the box!`
            },
            answerPhrase: {
                fr: (c) => `${capitalize(c.fr)} est DERRIÈRE la boîte !`,
                en: (c) => `${capitalize(c.en)} is BEHIND the box!`
            }
        },
        {
            id: 'acote',
            anchor: 'table',
            layer: 'front',
            x: 388,
            y: 222,
            label: { fr: 'À CÔTÉ', en: 'NEXT TO' },
            placePrompt: {
                fr: (c) => `Mets ${c.fr} À CÔTÉ de la table !`,
                en: (c) => `Put ${c.en} NEXT TO the table!`
            },
            answerPhrase: {
                fr: (c) => `${capitalize(c.fr)} est À CÔTÉ de la table !`,
                en: (c) => `${capitalize(c.en)} is NEXT TO the table!`
            }
        }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let gameMode = 'place'; // 'place' | 'find' | 'all'
    let currentCharIdx = 0;
    let targetPrep = null;
    let lastPrepId = null;
    let currentChoices = [];
    let charPos = { x: 74, y: 74 };
    let charLayer = 'front';
    let isAnimating = false;
    let isSolved = false;
    let audioCtx = null;

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

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

    function playHopSound() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(640, now + 0.16);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.19);
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

    function renderCharacterBar() {
        const bar = document.getElementById('char-bar');
        if (!bar) return;
        bar.innerHTML = '';
        CHARACTERS.forEach((ch, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'char-btn' + (idx === currentCharIdx ? ' active' : '');
            btn.innerText = `${ch.icon} ${capitalize(ch.name[lang])}`;
            btn.onclick = () => {
                if (isAnimating) return;
                currentCharIdx = idx;
                renderCharacterBar();
                drawScene();
                updatePrompt(true);
            };
            bar.appendChild(btn);
        });
    }

    function getMiniDiagramSVG(prepId) {
        if (prepId === 'sur') {
            return `<svg width="78" height="58" viewBox="0 0 78 58">
                <rect x="18" y="30" width="42" height="22" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
                <circle cx="39" cy="18" r="11" fill="#3B82F6"/>
            </svg>`;
        }
        if (prepId === 'sous') {
            return `<svg width="78" height="58" viewBox="0 0 78 58">
                <rect x="14" y="10" width="50" height="8" rx="3" fill="#B45309"/>
                <rect x="18" y="18" width="6" height="32" fill="#78350F"/>
                <rect x="54" y="18" width="6" height="32" fill="#78350F"/>
                <circle cx="39" cy="39" r="11" fill="#3B82F6"/>
            </svg>`;
        }
        if (prepId === 'dans') {
            return `<svg width="78" height="58" viewBox="0 0 78 58">
                <rect x="18" y="18" width="42" height="32" rx="4" fill="#B45309"/>
                <circle cx="39" cy="22" r="11" fill="#3B82F6"/>
                <rect x="18" y="26" width="42" height="24" rx="4" fill="#FDE68A" stroke="#B45309" stroke-width="2"/>
            </svg>`;
        }
        if (prepId === 'devant') {
            return `<svg width="78" height="58" viewBox="0 0 78 58">
                <rect x="20" y="12" width="38" height="32" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
                <circle cx="39" cy="40" r="12" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2"/>
            </svg>`;
        }
        if (prepId === 'derriere') {
            return `<svg width="78" height="58" viewBox="0 0 78 58">
                <circle cx="48" cy="22" r="11" fill="#3B82F6"/>
                <rect x="18" y="18" width="38" height="32" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
            </svg>`;
        }
        return `<svg width="78" height="58" viewBox="0 0 78 58">
            <rect x="12" y="18" width="32" height="30" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
            <circle cx="58" cy="36" r="11" fill="#3B82F6"/>
        </svg>`;
    }

    function getPromptText() {
        const ch = CHARACTERS[currentCharIdx];
        if (!targetPrep) return '';

        if (isSolved) {
            return `⭐ ${targetPrep.answerPhrase[lang](ch.name)}`;
        }
        if (gameMode === 'find') {
            return lang === 'fr'
                ? `Où est ${ch.name.fr} ?`
                : `Where is ${ch.name.en}?`;
        }
        return targetPrep.placePrompt[lang](ch.name);
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const lbl = document.getElementById('prompt-label');
        if (lbl) lbl.innerText = text;
        if (shouldSpeak) speak(text);
    }

    function startRound() {
        isAnimating = false;
        isSolved = false;
        renderCharacterBar();

        const pool = gameMode === 'place'
            ? PREPOSITIONS.filter(p => ['sur', 'sous', 'dans', 'devant'].includes(p.id))
            : PREPOSITIONS;

        const candidates = pool.filter(p => p.id !== lastPrepId);
        targetPrep = candidates[Math.floor(Math.random() * candidates.length)];
        lastPrepId = targetPrep.id;

        const sameAnchor = PREPOSITIONS.filter(p => p.id !== targetPrep.id && p.anchor === targetPrep.anchor);
        const otherAnchor = PREPOSITIONS.filter(p => p.id !== targetPrep.id && p.anchor !== targetPrep.anchor);
        const distractors = [...sameAnchor.sort(() => Math.random() - 0.5), ...otherAnchor.sort(() => Math.random() - 0.5)].slice(0, 2);
        currentChoices = [targetPrep, ...distractors].sort(() => Math.random() - 0.5);

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`prep_${gameMode}_${targetPrep.id}`);
        }

        if (gameMode === 'find') {
            charPos = { x: targetPrep.x, y: targetPrep.y };
            charLayer = targetPrep.layer;
        } else {
            charPos = { x: 74, y: 74 };
            charLayer = 'front';
        }

        drawScene();
        renderChoiceCards();
        updatePrompt(true);

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    /* ============================================================================
       SVG SCENE RENDERING WITH TRUE DEPTH OCCLUSION
       ============================================================================ */

    function getCharacterMarkup(x, y) {
        const ch = CHARACTERS[currentCharIdx];
        return `
            <g id="active-character" transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})">
                <ellipse cx="0" cy="24" rx="22" ry="6" fill="rgba(0,0,0,0.12)"/>
                <text x="0" y="18" font-size="54" text-anchor="middle">${ch.icon}</text>
            </g>
        `;
    }

    function drawScene() {
        const svg = document.getElementById('prep-svg');
        if (!svg || !targetPrep) return;
        const anchorType = targetPrep.anchor;
        const charSvg = getCharacterMarkup(charPos.x, charPos.y);

        let hotspotsSvg = '';
        if (gameMode !== 'find' && !isSolved) {
            currentChoices
                .filter(c => c.anchor === anchorType)
                .forEach(c => {
                    hotspotsSvg += `
                        <g class="hotspot-zone" onclick="window.handlePrepositionSelect('${c.id}')">
                            <circle cx="${c.x}" cy="${c.y}" r="28" fill="rgba(59, 130, 246, 0.14)" stroke="#3B82F6" stroke-width="3" stroke-dasharray="6,5"/>
                            <text x="${c.x}" y="${c.y + 6}" font-size="18" font-weight="bold" fill="#1D4ED8" text-anchor="middle">?</text>
                        </g>
                    `;
                });
        }

        const starsSvg = isSolved ? `
            <text x="${charPos.x - 36}" y="${charPos.y - 26}" font-size="28">⭐</text>
            <text x="${charPos.x + 36}" y="${charPos.y - 26}" font-size="28">🌟</text>
        ` : '';

        if (anchorType === 'table') {
            const tabletop = `
                <rect x="135" y="142" width="190" height="18" rx="7" fill="#B45309" stroke="#78350F" stroke-width="3"/>
                <rect x="155" y="160" width="16" height="92" rx="4" fill="#92400E"/>
                <rect x="289" y="160" width="16" height="92" rx="4" fill="#92400E"/>
            `;

            svg.innerHTML = `
                <rect width="520" height="300" fill="#EFF6FF"/>
                <rect x="0" y="248" width="520" height="52" fill="#F3E5D8"/>
                <ellipse cx="230" cy="256" rx="145" ry="14" fill="#E2E8F0"/>

                ${gameMode !== 'find' ? '<rect x="26" y="96" width="94" height="12" rx="6" fill="#CBD5E1"/>' : ''}

                ${charLayer === 'behind' ? charSvg : ''}
                ${charLayer === 'under' ? charSvg : ''}
                ${tabletop}
                ${charLayer === 'front' ? charSvg : ''}
                ${hotspotsSvg}
                ${starsSvg}
            `;
        } else {
            const boxBack = `
                <polygon points="180,158 202,136 312,136 290,158" fill="#78350F" stroke="#451A03" stroke-width="2"/>
                <rect x="202" y="136" width="110" height="95" fill="#92400E"/>
            `;
            const boxFront = `
                <rect x="180" y="158" width="110" height="94" rx="8" fill="#FDE68A" stroke="#B45309" stroke-width="3"/>
                <line x1="182" y1="189" x2="288" y2="189" stroke="#D97706" stroke-width="3"/>
                <line x1="182" y1="220" x2="288" y2="220" stroke="#D97706" stroke-width="3"/>
                <polygon points="290,158 312,136 312,230 290,252" fill="#D97706" stroke="#92400E" stroke-width="3"/>
            `;

            svg.innerHTML = `
                <rect width="520" height="300" fill="#FEFCE8"/>
                <rect x="0" y="248" width="520" height="52" fill="#E2E8F0"/>

                ${gameMode !== 'find' ? '<rect x="26" y="96" width="94" height="12" rx="6" fill="#CBD5E1"/>' : ''}

                ${charLayer === 'behind' ? charSvg : ''}
                ${boxBack}
                ${charLayer === 'inside' ? charSvg : ''}
                ${boxFront}
                ${charLayer === 'front' ? charSvg : ''}
                ${hotspotsSvg}
                ${starsSvg}
            `;
        }
    }

    function renderChoiceCards() {
        const grid = document.getElementById('choices-grid');
        if (!grid) return;
        grid.innerHTML = '';

        currentChoices.forEach(prep => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'prep-card';
            card.id = `prep-card-${prep.id}`;
            card.innerHTML = `
                ${getMiniDiagramSVG(prep.id)}
                <span class="prep-label">${prep.label[lang]}</span>
            `;
            card.onclick = () => window.handlePrepositionSelect(prep.id);
            grid.appendChild(card);
        });

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    window.handlePrepositionSelect = function(chosenId) {
        if (isAnimating || isSolved) return;

        const chosenPrep = PREPOSITIONS.find(p => p.id === chosenId) || targetPrep;
        const cardEl = document.getElementById(`prep-card-${chosenId}`);

        if (chosenId === targetPrep.id) {
            isSolved = true;
            if (cardEl) cardEl.classList.add('winner');
            playSuccessChime();

            if (window.AlpTracker) {
                window.AlpTracker.onTrialSuccess(`prep_${gameMode}_${targetPrep.id}`);
            }

            if (gameMode === 'find') {
                drawScene();
                updatePrompt(true);
                setTimeout(startRound, 2100);
            } else {
                animateCharacterJump(targetPrep, () => {
                    drawScene();
                    updatePrompt(true);
                    setTimeout(startRound, 2100);
                });
            }
        } else {
            if (cardEl) cardEl.classList.add('soft-dim');
            playHopSound();

            if (window.AlpTracker) {
                window.AlpTracker.onAttempt();
            }

            if (gameMode === 'find') {
                const hint = lang === 'fr'
                    ? `Non, ce n'est pas ${chosenPrep.label.fr.toLowerCase()}. ${getPromptText()}`
                    : `Not ${chosenPrep.label.en.toLowerCase()}. ${getPromptText()}`;
                speak(hint);
            } else if (chosenPrep.anchor === targetPrep.anchor) {
                animateCharacterJump(chosenPrep, () => {
                    const hint = lang === 'fr'
                        ? `Là, c'est ${chosenPrep.label.fr.toLowerCase()}. ${getPromptText()}`
                        : `That is ${chosenPrep.label.en.toLowerCase()}. ${getPromptText()}`;
                    speak(hint);
                    setTimeout(() => {
                        animateCharacterJump({ x: 74, y: 74, layer: 'front' }, () => drawScene());
                    }, 750);
                });
            } else {
                speak(getPromptText());
            }
        }
    };

    function animateCharacterJump(dest, onDone) {
        isAnimating = true;
        playHopSound();
        const startX = charPos.x;
        const startY = charPos.y;
        const startTime = performance.now();
        const duration = 480;

        function frame(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const ease = 1 - Math.pow(1 - t, 3);
            const arcY = Math.sin(t * Math.PI) * -45;

            charPos.x = startX + (dest.x - startX) * ease;
            charPos.y = startY + (dest.y - startY) * ease + arcY;
            if (t > 0.55) charLayer = dest.layer;

            drawScene();

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                charPos = { x: dest.x, y: dest.y };
                charLayer = dest.layer;
                isAnimating = false;
                onDone();
            }
        }
        requestAnimationFrame(frame);
    }

    function setMode(mode, btnId) {
        gameMode = mode;
        lastPrepId = null;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add('active');
        startRound();
        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setupControls() {
        const placeBtn = document.getElementById('mode-place-btn');
        if (placeBtn) placeBtn.onclick = () => setMode('place', 'mode-place-btn');

        const findBtn = document.getElementById('mode-find-btn');
        if (findBtn) findBtn.onclick = () => setMode('find', 'mode-find-btn');

        const allBtn = document.getElementById('mode-all-btn');
        if (allBtn) allBtn.onclick = () => setMode('all', 'mode-all-btn');

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
                if (title) title.innerText = lang === 'fr' ? "📦 Sur, Sous, Dans..." : '📦 On, Under, In...';

                if (placeBtn) placeBtn.innerText = lang === 'fr' ? "🎮 Placer l'objet" : '🎮 Place Object';
                if (findBtn) findBtn.innerText = lang === 'fr' ? '👀 Où est-il ?' : '👀 Where is it?';
                if (allBtn) allBtn.innerText = lang === 'fr' ? '🌟 Les 6 positions' : '🌟 All 6 Positions';

                renderCharacterBar();
                renderChoiceCards();
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
