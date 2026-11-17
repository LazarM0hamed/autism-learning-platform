// Building Logic Engine
// Autism Learning Platform - 3 Progressive Construction Challenges (Bridge, Pyramid, Size Tower)
// 60fps SVG animations, procedural Web Audio sound synthesis, bilingual speech & Button Controller support.

(() => {
    'use strict';

    const BLOCK_LIBRARY = {
        red_rect:      { id: 'red_rect',      shape: 'rect',     color: '#FF595E', stroke: '#C53030', label: { fr: 'Bloc Rouge',    en: 'Red Block' } },
        blue_square:   { id: 'blue_square',   shape: 'square',   color: '#1982C4', stroke: '#2B6CB0', label: { fr: 'Cube Bleu',     en: 'Blue Cube' } },
        yellow_tri:    { id: 'yellow_tri',    shape: 'triangle', color: '#FFCA3A', stroke: '#D69E2E', label: { fr: 'Triangle Jaune',en: 'Yellow Triangle' } },
        green_arch:    { id: 'green_arch',    shape: 'arch',     color: '#52B788', stroke: '#2F855A', label: { fr: 'Arche Verte',   en: 'Green Arch' } },
        purple_pillar: { id: 'purple_pillar', shape: 'pillar',   color: '#8338EC', stroke: '#553C9A', label: { fr: 'Pilier Violet', en: 'Purple Pillar' } },
        orange_cup:    { id: 'orange_cup',    shape: 'cup',      color: '#FB8C00', stroke: '#E65100', label: { fr: 'Gobelet Orange',en: 'Orange Cup' } },
        blue_cup:      { id: 'blue_cup',      shape: 'cup',      color: '#1E88E5', stroke: '#1565C0', label: { fr: 'Gobelet Bleu',  en: 'Blue Cup' } },
        pink_cup:      { id: 'pink_cup',      shape: 'cup',      color: '#EC407A', stroke: '#C2185B', label: { fr: 'Gobelet Rose',  en: 'Pink Cup' } },
        green_cup:     { id: 'green_cup',     shape: 'cup',      color: '#43A047', stroke: '#2E7D32', label: { fr: 'Gobelet Vert',  en: 'Green Cup' } }
    };

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentMode = 'bridge'; // 'bridge' | 'pyramid' | 'tower'
    let slots = [];
    let currentSlotIdx = 0;
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

    function playSnapSound(pitch = 320) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(pitch, now);
            osc.frequency.exponentialRampToValueAtTime(pitch * 1.4, now + 0.09);
            gain.gain.setValueAtTime(0.26, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    function playVictoryFanfare() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            [523.2, 659.3, 784.0, 1046.5].forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + i * 0.11);
                gain.gain.setValueAtTime(0.2, now + i * 0.11);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.11);
                osc.stop(now + i * 0.11 + 0.36);
            });
        } catch (e) {}
    }

    /* ============================================================================
       LEVEL GENERATORS FOR EACH MODE
       ============================================================================ */

    function initMode() {
        isAnimating = false;
        currentSlotIdx = 0;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`builder_${currentMode}`);
        }

        if (currentMode === 'bridge') {
            // 3 missing pieces in a bridge across a river
            const pool = ['yellow_tri', 'blue_square', 'green_arch', 'red_rect', 'purple_pillar']
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            slots = [
                { x: 105, y: 155, w: 68, h: 55, piece: BLOCK_LIBRARY[pool[0]], filled: false },
                { x: 196, y: 155, w: 68, h: 55, piece: BLOCK_LIBRARY[pool[1]], filled: false },
                { x: 287, y: 155, w: 68, h: 55, piece: BLOCK_LIBRARY[pool[2]], filled: false }
            ];
        } else if (currentMode === 'pyramid') {
            // 6-cup pyramid built row-by-row from bottom (3) -> middle (2) -> top (1)
            const cupKeys = ['orange_cup', 'blue_cup', 'pink_cup', 'green_cup'];
            const pickCup = () => BLOCK_LIBRARY[cupKeys[Math.floor(Math.random() * cupKeys.length)]];

            slots = [
                // Bottom Row (3)
                { x: 128, y: 205, w: 60, h: 56, piece: pickCup(), filled: false },
                { x: 200, y: 205, w: 60, h: 56, piece: pickCup(), filled: false },
                { x: 272, y: 205, w: 60, h: 56, piece: pickCup(), filled: false },
                // Middle Row (2)
                { x: 164, y: 147, w: 60, h: 56, piece: pickCup(), filled: false },
                { x: 236, y: 147, w: 60, h: 56, piece: pickCup(), filled: false },
                // Top Peak (1)
                { x: 200, y: 89,  w: 60, h: 56, piece: pickCup(), filled: false }
            ];
        } else if (currentMode === 'tower') {
            // Size-seriation tower: Largest block at bottom -> Smallest at top
            slots = [
                { x: 140, y: 214, w: 180, h: 46, sizeRank: 1, piece: { id: 'sz1', shape: 'rect', color: '#FF595E', stroke: '#C53030', label: { fr: 'Très grand bloc', en: 'Biggest Block' } }, filled: false },
                { x: 162, y: 166, w: 136, h: 46, sizeRank: 2, piece: { id: 'sz2', shape: 'rect', color: '#FB8C00', stroke: '#E65100', label: { fr: 'Grand bloc',      en: 'Large Block' } }, filled: false },
                { x: 184, y: 118, w: 92,  h: 46, sizeRank: 3, piece: { id: 'sz3', shape: 'rect', color: '#FFCA3A', stroke: '#D69E2E', label: { fr: 'Moyen bloc',      en: 'Medium Block' } }, filled: false },
                { x: 204, y: 70,  w: 52,  h: 46, sizeRank: 4, piece: { id: 'sz4', shape: 'rect', color: '#43A047', stroke: '#2E7D32', label: { fr: 'Tout petit bloc', en: 'Smallest Block' } }, filled: false }
            ];
        }

        renderTargetModel();
        renderScene();
        renderChoices();
        updatePrompt(true);
    }

    function getPromptText() {
        if (currentSlotIdx >= slots.length) {
            if (currentMode === 'bridge') return lang === 'fr' ? 'Bravo ! Le pont est réparé, la voiture passe ! 🚗' : 'Awesome! The bridge is fixed, the car crosses! 🚗';
            if (currentMode === 'pyramid') return lang === 'fr' ? 'Superbe pyramide ! 🌟' : 'Amazing pyramid! 🌟';
            return lang === 'fr' ? 'Magnifique tour bien équilibrée ! 🐦' : 'Wonderful balanced tower! 🐦';
        }

        const target = slots[currentSlotIdx].piece;
        if (currentMode === 'tower') {
            return lang === 'fr'
                ? 'Choisis le PLUS GRAND bloc pour la base de la tour'
                : 'Pick the BIGGEST block for the tower base';
        }
        return lang === 'fr'
            ? `Place la pièce : ${target.label[lang] || target.label.fr}`
            : `Place the piece: ${target.label[lang] || target.label.en}`;
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const pEl = document.getElementById('prompt-label');
        if (pEl) pEl.innerText = text;
        if (shouldSpeak) speak(text);
    }

    /* ============================================================================
       SVG PIECE & SCENE RENDERING
       ============================================================================ */

    function renderPieceSVGMarkup(piece, x, y, w, h) {
        if (piece.shape === 'triangle') {
            return `<polygon points="${x + w / 2},${y + 4} ${x + w - 4},${y + h - 4} ${x + 4},${y + h - 4}" fill="${piece.color}" stroke="${piece.stroke}" stroke-width="3" stroke-linejoin="round"/>`;
        }
        if (piece.shape === 'arch') {
            return `<path d="M${x + 4},${y + h - 4} L${x + 4},${y + 22} A${(w - 8) / 2},22 0 0,1 ${x + w - 4},${y + 22} L${x + w - 4},${y + h - 4} L${x + w - 18},${y + h - 4} A${(w - 36) / 2},16 0 0,0 ${x + 18},${y + h - 4} Z" fill="${piece.color}" stroke="${piece.stroke}" stroke-width="3"/>`;
        }
        if (piece.shape === 'cup') {
            return `<polygon points="${x + 10},${y + 4} ${x + w - 10},${y + 4} ${x + w - 3},${y + h - 4} ${x + 3},${y + h - 4}" fill="${piece.color}" stroke="${piece.stroke}" stroke-width="3" stroke-linejoin="round"/>`;
        }
        if (piece.shape === 'pillar') {
            return `<rect x="${x + 14}" y="${y + 4}" width="${w - 28}" height="${h - 8}" rx="8" fill="${piece.color}" stroke="${piece.stroke}" stroke-width="3"/>`;
        }
        // Default rect / square
        return `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="10" fill="${piece.color}" stroke="${piece.stroke}" stroke-width="3"/>`;
    }

    /* Target Construction Model Blueprint Display */
    function renderTargetModel() {
        const svg = document.getElementById('target-model-svg');
        if (!svg) return;
        let html = '';

        if (currentMode === 'bridge') {
            html += `
                <!-- Mini River & Grass Banks -->
                <rect width="460" height="210" fill="#EBF8FF"/>
                <rect x="0" y="145" width="460" height="65" fill="#63B3ED"/>
                <rect x="0" y="130" width="102" height="80" rx="6" fill="#68D391"/>
                <rect x="358" y="130" width="102" height="80" rx="6" fill="#68D391"/>
                <rect x="0" y="80" width="102" height="52" fill="#CBD5E0" stroke="#718096" stroke-width="2"/>
                <rect x="358" y="80" width="102" height="52" fill="#CBD5E0" stroke="#718096" stroke-width="2"/>
                <text x="32" y="65" font-size="34">🚗</text>
            `;
            slots.forEach(slot => {
                const yShift = slot.y - 75;
                html += renderPieceSVGMarkup(slot.piece, slot.x, yShift, slot.w, slot.h);
            });
            html += `<text x="420" y="55" font-size="28">✨</text>`;
        } else if (currentMode === 'pyramid') {
            html += `
                <!-- Table Base -->
                <rect width="460" height="210" fill="#FFFDF5"/>
                <rect x="40" y="180" width="380" height="22" rx="6" fill="#DDB892"/>
            `;
            slots.forEach(slot => {
                const yShift = slot.y - 45;
                html += renderPieceSVGMarkup(slot.piece, slot.x, yShift, slot.w, slot.h);
            });
            html += `
                <text x="230" y="38" font-size="32" text-anchor="middle">👑</text>
                <text x="180" y="44" font-size="22">⭐</text>
                <text x="265" y="44" font-size="22">🌟</text>
            `;
        } else if (currentMode === 'tower') {
            html += `
                <!-- Table Base -->
                <rect width="460" height="210" fill="#FFFDF5"/>
                <rect x="80" y="180" width="300" height="22" rx="6" fill="#DDB892"/>
            `;
            slots.forEach(slot => {
                const yShift = slot.y - 38;
                html += renderPieceSVGMarkup(slot.piece, slot.x, yShift, slot.w, slot.h);
            });
            html += `
                <text x="230" y="28" font-size="32" text-anchor="middle">🐦</text>
            `;
        }

        svg.innerHTML = html;
    }

    function renderScene() {
        const svg = document.getElementById('builder-svg');
        if (!svg) return;
        let html = '';

        if (currentMode === 'bridge') {
            html += `
                <!-- Sky & Clouds -->
                <rect width="460" height="300" fill="#EBF8FF"/>
                <circle cx="400" cy="48" r="22" fill="#F6E05E"/>
                <!-- River -->
                <rect x="0" y="218" width="460" height="82" fill="#63B3ED"/>
                <path d="M110,245 Q135,238 160,245 T210,245" stroke="#BEE3F8" stroke-width="4" fill="none" stroke-linecap="round"/>
                <path d="M250,268 Q275,261 300,268 T350,268" stroke="#BEE3F8" stroke-width="4" fill="none" stroke-linecap="round"/>
                <!-- Left & Right Grass Banks + Fixed Bridge Ends -->
                <rect x="0" y="205" width="102" height="95" rx="8" fill="#68D391"/>
                <rect x="358" y="205" width="102" height="95" rx="8" fill="#68D391"/>
                <rect x="0" y="155" width="102" height="52" fill="#CBD5E0" stroke="#718096" stroke-width="3"/>
                <rect x="358" y="155" width="102" height="52" fill="#CBD5E0" stroke="#718096" stroke-width="3"/>
            `;
        } else {
            html += `
                <!-- Playroom Background & Table -->
                <rect width="460" height="300" fill="#FFFBEB"/>
                <rect x="0" y="262" width="460" height="38" rx="6" fill="#DDB892"/>
            `;
        }

        // Draw Slots (Filled vs Dashed Target with Ghost Outline)
        slots.forEach((slot, idx) => {
            if (slot.filled) {
                html += renderPieceSVGMarkup(slot.piece, slot.x, slot.y, slot.w, slot.h);
            } else {
                const isCurrent = idx === currentSlotIdx;
                const strokeCol = isCurrent ? '#2B6CB0' : '#A0AEC0';
                const fillCol = isCurrent ? 'rgba(66, 153, 225, 0.12)' : 'rgba(203, 213, 224, 0.2)';
                html += `<rect x="${slot.x + 4}" y="${slot.y + 4}" width="${slot.w - 8}" height="${slot.h - 8}" rx="10" fill="${fillCol}" stroke="${strokeCol}" stroke-width="${isCurrent ? 3.5 : 2}" stroke-dasharray="7,5"/>`;
                html += `<g opacity="${isCurrent ? '0.35' : '0.12'}">${renderPieceSVGMarkup(slot.piece, slot.x, slot.y, slot.w, slot.h)}</g>`;
                if (isCurrent) {
                    html += `<text x="${slot.x + slot.w / 2}" y="${slot.y - 4}" font-size="18" text-anchor="middle" fill="#2B6CB0">⬇️</text>`;
                }
            }
        });

        // Dynamic Animation Layers
        html += `<g id="flying-piece-layer"></g>`;
        html += `<g id="celebration-layer"></g>`;

        if (currentMode === 'bridge') {
            html += `<g id="bridge-car" transform="translate(22, 114)"><text x="0" y="34" font-size="44">🚗</text></g>`;
        }

        svg.innerHTML = html;
    }

    function renderChoices() {
        const tray = document.getElementById('pieces-tray');
        if (!tray) return;
        tray.innerHTML = '';
        if (currentSlotIdx >= slots.length) return;

        const targetSlot = slots[currentSlotIdx];
        let choiceObjects = [];

        if (currentMode === 'tower') {
            // Show remaining unplaced size blocks in shuffled order
            choiceObjects = slots
                .slice(currentSlotIdx)
                .map(s => ({ piece: s.piece, previewW: Math.round(s.w * 0.55), previewH: 34 }))
                .sort(() => Math.random() - 0.5);
        } else {
            // Pick 1 correct piece + 2 distinct distractors
            const allKeys = Object.keys(BLOCK_LIBRARY).filter(k => k !== targetSlot.piece.id);
            const distractors = allKeys.sort(() => Math.random() - 0.5).slice(0, 2).map(k => BLOCK_LIBRARY[k]);
            choiceObjects = [targetSlot.piece, ...distractors]
                .sort(() => Math.random() - 0.5)
                .map(p => ({ piece: p, previewW: 68, previewH: 54 }));
        }

        choiceObjects.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'piece-card';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', item.piece.label[lang] || item.piece.label.fr);

            const miniSvg = `<svg width="110" height="64" viewBox="0 0 110 64">${renderPieceSVGMarkup(item.piece, (110 - item.previewW) / 2, (64 - item.previewH) / 2, item.previewW, item.previewH)}</svg>`;
            card.innerHTML = `${miniSvg}<div class="piece-label">${item.piece.label[lang] || item.piece.label.fr}</div>`;

            card.onclick = () => {
                if (isAnimating) return;
                const isCorrect = (item.piece.id === targetSlot.piece.id);

                if (window.AlpTracker) {
                    window.AlpTracker.onAttempt(isCorrect, item.piece.id);
                }

                if (isCorrect) {
                    card.classList.add('correct');
                    animatePieceIntoSlot(targetSlot, () => {
                        targetSlot.filled = true;
                        currentSlotIdx++;
                        renderScene();

                        if (currentSlotIdx >= slots.length) {
                            if (window.AlpTracker) {
                                window.AlpTracker.onTrialSuccess(`builder_${currentMode}`);
                            }
                            updatePrompt(true);
                            runCompletionCelebration();
                        } else {
                            renderChoices();
                            updatePrompt(true);
                        }
                    });
                } else {
                    // Gentle voice reminder without harsh buzzers
                    updatePrompt(true);
                }
            };

            tray.appendChild(card);
        });
    }

    /* Smooth Fly-Into-Place Animation */
    function animatePieceIntoSlot(slot, onDone) {
        isAnimating = true;
        const layer = document.getElementById('flying-piece-layer');
        const startX = 200;
        const startY = 275;
        const endX = slot.x;
        const endY = slot.y;
        const startTime = performance.now();
        const duration = 380;

        function step(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const ease = 1 - Math.pow(1 - t, 3);
            const cx = startX + (endX - startX) * ease;
            const cy = startY + (endY - startY) * ease;

            if (layer) {
                layer.innerHTML = renderPieceSVGMarkup(slot.piece, cx, cy, slot.w, slot.h);
            }

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                playSnapSound(300 + currentSlotIdx * 65);
                isAnimating = false;
                onDone();
            }
        }
        requestAnimationFrame(step);
    }

    /* Reward Physics Animation Once Structure Is Complete */
    function runCompletionCelebration() {
        isAnimating = true;
        playVictoryFanfare();
        const tray = document.getElementById('pieces-tray');
        if (tray) tray.innerHTML = '';

        if (currentMode === 'bridge') {
            const car = document.getElementById('bridge-car');
            const startTime = performance.now();
            const duration = 1700;

            function drive(now) {
                const t = Math.min(1, (now - startTime) / duration);
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                const x = 22 + 375 * ease;
                const bounce = Math.sin(t * Math.PI * 14) * 2;
                if (car) car.setAttribute('transform', `translate(${x.toFixed(1)}, ${(114 + bounce).toFixed(1)})`);

                if (t < 1) {
                    requestAnimationFrame(drive);
                } else {
                    isAnimating = false;
                    setTimeout(initMode, 1100);
                }
            }
            requestAnimationFrame(drive);
        } else if (currentMode === 'pyramid') {
            const celeb = document.getElementById('celebration-layer');
            const startTime = performance.now();
            const duration = 1500;

            function popStars(now) {
                const t = Math.min(1, (now - startTime) / duration);
                const rise = t * 55;
                if (celeb) {
                    celeb.innerHTML = `
                        <text x="230" y="${(82 - rise * 0.4).toFixed(1)}" font-size="38" text-anchor="middle">👑</text>
                        <text x="${(175 - rise * 0.6).toFixed(1)}" y="${(110 - rise).toFixed(1)}" font-size="28">⭐</text>
                        <text x="${(285 + rise * 0.6).toFixed(1)}" y="${(110 - rise).toFixed(1)}" font-size="28">🌟</text>
                    `;
                }
                if (t < 1) requestAnimationFrame(popStars);
                else { isAnimating = false; setTimeout(initMode, 1100); }
            }
            requestAnimationFrame(popStars);
        } else {
            // Tower: Bird flies in and lands on the top block
            const celeb = document.getElementById('celebration-layer');
            const startTime = performance.now();
            const duration = 1300;

            function flyBird(now) {
                const t = Math.min(1, (now - startTime) / duration);
                const ease = 1 - Math.pow(1 - t, 3);
                const bx = 420 - 190 * ease;
                const by = 20 + 44 * ease - Math.sin(t * Math.PI) * 25;
                if (celeb) {
                    celeb.innerHTML = `<text x="${bx.toFixed(1)}" y="${by.toFixed(1)}" font-size="38" text-anchor="middle">🐦</text>`;
                }
                if (t < 1) requestAnimationFrame(flyBird);
                else { isAnimating = false; setTimeout(initMode, 1200); }
            }
            requestAnimationFrame(flyBird);
        }
    }

    function setMode(mode, btnId) {
        currentMode = mode;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        document.getElementById(btnId)?.classList.add('active');
        initMode();
    }

    function setupControls() {
        document.getElementById('mode-bridge-btn')?.addEventListener('click', () => setMode('bridge', 'mode-bridge-btn'));
        document.getElementById('mode-pyramid-btn')?.addEventListener('click', () => setMode('pyramid', 'mode-pyramid-btn'));
        document.getElementById('mode-tower-btn')?.addEventListener('click', () => setMode('tower', 'mode-tower-btn'));
        document.getElementById('speak-prompt-btn')?.addEventListener('click', () => updatePrompt(true));

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

        // Direct number keys (1, 2, 3...) to trigger cards in tray
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (['1', '2', '3', '4'].includes(e.key)) {
                const idx = parseInt(e.key, 10) - 1;
                const cards = document.querySelectorAll('#pieces-tray .piece-card');
                if (cards[idx]) cards[idx].click();
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
                if (titleEl) titleEl.innerText = lang === 'fr' ? '🏗️ Logique de Construction' : '🏗️ Building Logic';

                const bBridge = document.getElementById('mode-bridge-btn');
                if (bBridge) bBridge.innerText = lang === 'fr' ? '🌉 Le Pont' : '🌉 The Bridge';

                const bPyramid = document.getElementById('mode-pyramid-btn');
                if (bPyramid) bPyramid.innerText = lang === 'fr' ? '🥤 La Pyramide' : '🥤 The Pyramid';

                const bTower = document.getElementById('mode-tower-btn');
                if (bTower) bTower.innerText = lang === 'fr' ? '🗼 La Tour (Grand → Petit)' : '🗼 Size Tower';

                const lblModel = document.getElementById('lbl-target-model');
                if (lblModel) lblModel.innerText = lang === 'fr' ? '🎯 Modèle à construire :' : '🎯 Target Model to Build:';

                renderChoices();
                renderTargetModel();
                updatePrompt(true);
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
        if (titleEl) titleEl.innerText = lang === 'fr' ? '🏗️ Logique de Construction' : '🏗️ Building Logic';

        const bBridge = document.getElementById('mode-bridge-btn');
        if (bBridge) bBridge.innerText = lang === 'fr' ? '🌉 Le Pont' : '🌉 The Bridge';

        const bPyramid = document.getElementById('mode-pyramid-btn');
        if (bPyramid) bPyramid.innerText = lang === 'fr' ? '🥤 La Pyramide' : '🥤 The Pyramid';

        const bTower = document.getElementById('mode-tower-btn');
        if (bTower) bTower.innerText = lang === 'fr' ? '🗼 La Tour (Grand → Petit)' : '🗼 Size Tower';

        const lblModel = document.getElementById('lbl-target-model');
        if (lblModel) lblModel.innerText = lang === 'fr' ? '🎯 Modèle à construire :' : '🎯 Target Model to Build:';

        setupControls();
        initMode();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
