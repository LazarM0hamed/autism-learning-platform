// Lignes Magiques (Magic Lines) Engine
// Autism Learning Platform - Pre-Writing Graphomotor Path Assembly & Curve Following
// 1-to-1 Blueprint Model, Ghost Slot Anchors, Trajectory Travel Physics with Star Trail & Button Controller Support.

(() => {
    'use strict';

    const MOTIF_LIBRARY = {
        straight_h: {
            id: 'straight_h',
            shape: 'straight_h',
            label: { fr: 'Ligne droite', en: 'Straight line' },
            color: '#3B82F6',
            stroke: '#2563EB',
            renderSvg: (w, h, col = '#3B82F6') => `<line x1="10" y1="${h / 2}" x2="${w - 10}" y2="${h / 2}" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`
        },
        straight_v: {
            id: 'straight_v',
            shape: 'straight_v',
            label: { fr: 'Ligne verticale', en: 'Vertical line' },
            color: '#EC4899',
            stroke: '#DB2777',
            renderSvg: (w, h, col = '#EC4899') => `<line x1="${w / 2}" y1="8" x2="${w / 2}" y2="${h - 8}" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`
        },
        zigzag: {
            id: 'zigzag',
            shape: 'zigzag',
            label: { fr: 'Ligne en zigzag', en: 'Zigzag line' },
            color: '#F59E0B',
            stroke: '#D97706',
            renderSvg: (w, h, col = '#F59E0B') => `<path d="M 10,${h * 0.72} L ${w * 0.32},${h * 0.28} L ${w * 0.68},${h * 0.72} L ${w - 10},${h * 0.28}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
        },
        wave: {
            id: 'wave',
            shape: 'wave',
            label: { fr: 'Ligne en vagues', en: 'Wavy line' },
            color: '#06B6D4',
            stroke: '#0891B2',
            renderSvg: (w, h, col = '#06B6D4') => `<path d="M 10,${h / 2} C ${w * 0.28},${h * 0.15} ${w * 0.32},${h * 0.15} ${w * 0.5},${h / 2} C ${w * 0.68},${h * 0.85} ${w * 0.72},${h * 0.85} ${w - 10},${h / 2}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round"/>`
        },
        crenel: {
            id: 'crenel',
            shape: 'crenel',
            label: { fr: 'Créneaux (Château)', en: 'Castle crenels' },
            color: '#10B981',
            stroke: '#059669',
            renderSvg: (w, h, col = '#10B981') => `<path d="M 10,${h * 0.68} L ${w * 0.32},${h * 0.68} L ${w * 0.32},${h * 0.32} L ${w * 0.68},${h * 0.32} L ${w * 0.68},${h * 0.68} L ${w - 10},${h * 0.68}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
        }
    };

    const LINE_CHALLENGES = [
        {
            id: 'horizontal',
            pill: { fr: '➖ Horizontale', en: '➖ Horizontal' },
            story: { fr: 'Relie la voiture à la maison !', en: 'Connect the car to the house!' },
            praise: { fr: 'Bravo ! La voiture est arrivée à la maison ! 🚗', en: 'Awesome! The car arrived home! 🚗' },
            charStart: '🚗',
            charEnd: '🏠',
            motifId: 'straight_h',
            startX: 52,
            endX: 408,
            trackY: 110,
            slotsCount: 3,
            evalCurve: (t) => {
                const x = 52 + t * (408 - 52);
                const y = 110;
                return { x, y, angle: 0 };
            }
        },
        {
            id: 'waves',
            pill: { fr: '🌊 Vagues', en: '🌊 Waves' },
            story: { fr: 'Fais voguer le bateau sur les vagues vers l’île !', en: 'Sail the boat across the waves to the island!' },
            praise: { fr: 'Superbe ! Le bateau a traversé les vagues ! ⛵', en: 'Fantastic! The boat sailed across the waves! ⛵' },
            charStart: '⛵',
            charEnd: '🏝️',
            motifId: 'wave',
            startX: 52,
            endX: 408,
            trackY: 110,
            slotsCount: 3,
            evalCurve: (t) => {
                const x = 52 + t * (408 - 52);
                const waveCycles = 3;
                const amp = 32;
                const y = 110 - Math.sin(t * Math.PI * 2 * waveCycles) * amp;
                const dy = -Math.cos(t * Math.PI * 2 * waveCycles) * (Math.PI * 2 * waveCycles * amp) / (408 - 52);
                const angle = Math.atan(dy) * (180 / Math.PI) * 0.65;
                return { x, y, angle };
            }
        },
        {
            id: 'zigzag',
            pill: { fr: '⚡ Zigzag', en: '⚡ Zigzag' },
            story: { fr: 'Fais sautiller le lapin vers la carotte !', en: 'Hop the rabbit across the zigzags to the carrot!' },
            praise: { fr: 'Youpi ! Le lapin a attrapé la carotte ! 🥕', en: 'Yum! The rabbit caught the carrot! 🥕' },
            charStart: '🐰',
            charEnd: '🥕',
            motifId: 'zigzag',
            startX: 52,
            endX: 408,
            trackY: 110,
            slotsCount: 3,
            evalCurve: (t) => {
                const x = 52 + t * (408 - 52);
                const period = 1 / 3;
                const phase = (t % period) / period;
                const triangle = phase < 0.5 ? (phase * 2) : (2 - phase * 2);
                const y = 142 - triangle * 64;
                const angle = phase < 0.5 ? -25 : 25;
                return { x, y, angle };
            }
        },
        {
            id: 'vertical',
            pill: { fr: '丨 Verticale', en: '丨 Vertical' },
            story: { fr: 'Fais décoller la fusée vers l’étoile !', en: 'Launch the rocket up to the golden star!' },
            praise: { fr: 'Magnifique décollage vers l’étoile ! ⭐', en: 'Magnificent liftoff to the star! ⭐' },
            charStart: '🚀',
            charEnd: '⭐',
            motifId: 'straight_v',
            startX: 230,
            endX: 230,
            startY: 185,
            endY: 35,
            slotsCount: 3,
            isVertical: true,
            evalCurve: (t) => {
                const x = 230;
                const y = 185 - t * (185 - 35);
                return { x, y, angle: -90 };
            }
        },
        {
            id: 'castles',
            pill: { fr: '🏰 Créneaux', en: '🏰 Castles' },
            story: { fr: 'Guide le chevalier vers la couronne royale !', en: 'Guide the knight to the royal crown!' },
            praise: { fr: 'Bravo ! Le chevalier a conquis la couronne ! 👑', en: 'Victory! The knight reached the crown! 👑' },
            charStart: '🏰',
            charEnd: '👑',
            motifId: 'crenel',
            startX: 52,
            endX: 408,
            trackY: 110,
            slotsCount: 3,
            evalCurve: (t) => {
                const x = 52 + t * (408 - 52);
                const period = 1 / 3;
                const phase = (t % period) / period;
                let y = 135;
                if (phase >= 0.25 && phase <= 0.75) y = 85;
                return { x, y, angle: 0 };
            }
        }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let isMixAllMode = true;
    let currentChallengeIdx = 0;
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

    function playSnapSound(pitch = 360) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(pitch, now);
            osc.frequency.exponentialRampToValueAtTime(pitch * 1.45, now + 0.08);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.11);
        } catch (e) {}
    }

    function playTravelTone(pitch, dur = 0.09) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(pitch, now);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + dur + 0.01);
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
                osc.frequency.setValueAtTime(f, now + i * 0.1);
                gain.gain.setValueAtTime(0.22, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.36);
            });
        } catch (e) {}
    }

    /* ============================================================================
       CHALLENGE GENERATION & BLUEPRINT MODEL RENDERING
       ============================================================================ */

    function initChallenge() {
        isAnimating = false;
        currentSlotIdx = 0;

        const ch = LINE_CHALLENGES[currentChallengeIdx];
        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`lines_${ch.id}`);
        }

        const motif = MOTIF_LIBRARY[ch.motifId];
        const spanTotal = ch.isVertical ? (ch.startY - ch.endY) : (ch.endX - ch.startX);
        const slotSpan = spanTotal / ch.slotsCount;

        slots = [];
        for (let i = 0; i < ch.slotsCount; i++) {
            if (ch.isVertical) {
                const slotY = ch.startY - (i + 1) * slotSpan;
                slots.push({
                    x: ch.startX - 30,
                    y: slotY,
                    w: 60,
                    h: slotSpan,
                    motif,
                    filled: false
                });
            } else {
                const slotX = ch.startX + i * slotSpan;
                slots.push({
                    x: slotX,
                    y: ch.trackY - 30,
                    w: slotSpan,
                    h: 60,
                    motif,
                    filled: false
                });
            }
        }

        renderPills();
        renderTargetBlueprint();
        renderAssemblyTrack();
        renderChoices();
        updatePrompt(true);
    }

    function renderPills() {
        const nav = document.getElementById('lines-pills');
        if (!nav) return;
        nav.innerHTML = '';

        // Mix All Pill
        const allBtn = document.createElement('button');
        allBtn.className = 'routine-pill' + (isMixAllMode ? ' active' : '');
        allBtn.innerText = lang === 'fr' ? '🎲 Tout mélanger' : '🎲 Mix All';
        allBtn.onclick = () => {
            if (isMixAllMode) return;
            isMixAllMode = true;
            advanceToNextChallenge();
        };
        nav.appendChild(allBtn);

        // Individual Family Pills
        LINE_CHALLENGES.forEach((ch, idx) => {
            const btn = document.createElement('button');
            btn.className = 'routine-pill' + (!isMixAllMode && idx === currentChallengeIdx ? ' active' : '');
            btn.innerText = ch.pill[lang] || ch.pill.fr;
            btn.onclick = () => {
                isMixAllMode = false;
                currentChallengeIdx = idx;
                initChallenge();
            };
            nav.appendChild(btn);
        });
    }

    function renderTargetBlueprint() {
        const svg = document.getElementById('target-model-svg');
        if (!svg) return;
        const ch = LINE_CHALLENGES[currentChallengeIdx];
        const motif = MOTIF_LIBRARY[ch.motifId];

        let html = `
            <!-- Blueprint Soft Grid & Boundary -->
            <rect width="460" height="110" fill="#F8FAFC"/>
            <rect x="0" y="0" width="460" height="110" fill="none" stroke="#E2E8F0" stroke-width="2"/>
        `;

        if (ch.isVertical) {
            // Horizontal preview in blueprint for clean 460x110 aspect ratio
            html += `
                <text x="42" y="65" font-size="36" text-anchor="middle">${ch.charStart}</text>
                <text x="418" y="65" font-size="36" text-anchor="middle">${ch.charEnd}</text>
                <line x1="72" y1="55" x2="388" y2="55" stroke="${motif.color}" stroke-width="7" stroke-linecap="round"/>
            `;
        } else {
            html += `
                <text x="38" y="66" font-size="36" text-anchor="middle">${ch.charStart}</text>
                <text x="422" y="66" font-size="36" text-anchor="middle">${ch.charEnd}</text>
            `;
            // Draw continuous model line
            const segmentSpan = (422 - 68) / ch.slotsCount;
            for (let i = 0; i < ch.slotsCount; i++) {
                const sx = 68 + i * segmentSpan;
                html += `<g transform="translate(${sx}, 25)">${motif.renderSvg(segmentSpan, 60, motif.color)}</g>`;
            }
        }

        html += `<text x="442" y="28" font-size="20">✨</text>`;
        svg.innerHTML = html;
    }

    function renderAssemblyTrack() {
        const svg = document.getElementById('assembly-svg');
        if (!svg) return;
        const ch = LINE_CHALLENGES[currentChallengeIdx];
        const motif = MOTIF_LIBRARY[ch.motifId];

        let html = `
            <!-- Stage Canvas -->
            <rect width="460" height="220" fill="#FFFDF9"/>
            <rect x="10" y="10" width="440" height="200" rx="16" fill="none" stroke="#E2E8F0" stroke-width="3"/>
        `;

        // Start & Destination Characters
        if (ch.isVertical) {
            html += `
                <g id="travel-char" transform="translate(${ch.startX}, ${ch.startY})"><text x="0" y="12" font-size="42" text-anchor="middle">${ch.charStart}</text></g>
                <g id="target-char" transform="translate(${ch.endX}, ${ch.endY})"><text x="0" y="12" font-size="42" text-anchor="middle">${ch.charEnd}</text></g>
            `;
        } else {
            html += `
                <g id="travel-char" transform="translate(${ch.startX - 22}, ${ch.trackY})"><text x="0" y="12" font-size="42" text-anchor="middle">${ch.charStart}</text></g>
                <g id="target-char" transform="translate(${ch.endX + 22}, ${ch.trackY})"><text x="0" y="12" font-size="42" text-anchor="middle">${ch.charEnd}</text></g>
            `;
        }

        // Draw Slots (Dashed Target vs Filled Segment)
        slots.forEach((slot, idx) => {
            if (slot.filled) {
                html += `<g transform="translate(${slot.x}, ${slot.y})">${slot.motif.renderSvg(slot.w, slot.h, slot.motif.color)}</g>`;
            } else {
                const isCurrent = (idx === currentSlotIdx);
                const strokeCol = isCurrent ? '#7C3AED' : '#CBD5E0';
                const fillCol = isCurrent ? 'rgba(124, 58, 237, 0.08)' : 'rgba(203, 213, 224, 0.14)';

                html += `<rect x="${slot.x}" y="${slot.y}" width="${slot.w}" height="${slot.h}" rx="12" fill="${fillCol}" stroke="${strokeCol}" stroke-width="${isCurrent ? 3 : 2}" stroke-dasharray="6,5"/>`;
                html += `<g opacity="${isCurrent ? '0.35' : '0.12'}" transform="translate(${slot.x}, ${slot.y})">${slot.motif.renderSvg(slot.w, slot.h, slot.motif.color)}</g>`;

                if (isCurrent) {
                    if (ch.isVertical) {
                        html += `<text x="${slot.x + slot.w + 14}" y="${slot.y + slot.h / 2 + 6}" font-size="18" fill="#7C3AED">⬅️</text>`;
                    } else {
                        html += `<text x="${slot.x + slot.w / 2}" y="${slot.y - 6}" font-size="18" text-anchor="middle" fill="#7C3AED">⬇️</text>`;
                    }
                }
            }
        });

        // Dynamic Animation Layers
        html += `<g id="star-trail-layer"></g>`;
        html += `<g id="flying-motif-layer"></g>`;

        svg.innerHTML = html;
    }

    function renderChoices() {
        const tray = document.getElementById('motifs-tray');
        if (!tray) return;
        tray.innerHTML = '';
        if (currentSlotIdx >= slots.length) return;

        const ch = LINE_CHALLENGES[currentChallengeIdx];
        const targetSlot = slots[currentSlotIdx];

        // 1 correct matching motif + 2 distinct distractors
        const allKeys = Object.keys(MOTIF_LIBRARY).filter(k => k !== targetSlot.motif.id);
        const distractors = allKeys.sort(() => Math.random() - 0.5).slice(0, 2).map(k => MOTIF_LIBRARY[k]);
        const choices = [targetSlot.motif, ...distractors].sort(() => Math.random() - 0.5);

        choices.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'motif-card';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', item.label[lang] || item.label.fr);

            const preview = `<svg class="motif-preview-svg" viewBox="0 0 110 60">${item.renderSvg(110, 60, item.color)}</svg>`;
            card.innerHTML = `${preview}<div class="motif-label">${item.label[lang] || item.label.fr}</div>`;

            card.onclick = () => {
                if (isAnimating) return;
                const isCorrect = (item.id === targetSlot.motif.id);

                if (window.AlpTracker) {
                    window.AlpTracker.onAttempt(isCorrect, item.id);
                }

                if (isCorrect) {
                    card.classList.add('correct');
                    animateMotifIntoSlot(targetSlot, item, () => {
                        targetSlot.filled = true;
                        currentSlotIdx++;
                        renderAssemblyTrack();

                        if (currentSlotIdx >= slots.length) {
                            if (window.AlpTracker) {
                                window.AlpTracker.onTrialSuccess(`lines_${ch.id}`);
                            }
                            updatePrompt(false);
                            runTravelRewardAnimation();
                        } else {
                            renderChoices();
                            updatePrompt(true);
                        }
                    });
                } else {
                    updatePrompt(true);
                }
            };

            tray.appendChild(card);
        });
    }

    function animateMotifIntoSlot(slot, item, onDone) {
        isAnimating = true;
        const layer = document.getElementById('flying-motif-layer');
        const startX = 230;
        const startY = 240;
        const endX = slot.x;
        const endY = slot.y;
        const startTime = performance.now();
        const duration = 340;

        function step(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const ease = 1 - Math.pow(1 - t, 3);
            const cx = startX + (endX - startX) * ease;
            const cy = startY + (endY - startY) * ease;

            if (layer) {
                layer.innerHTML = `<g transform="translate(${cx.toFixed(1)}, ${cy.toFixed(1)})">${item.renderSvg(slot.w, slot.h, item.color)}</g>`;
            }

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                if (layer) layer.innerHTML = '';
                playSnapSound(340 + currentSlotIdx * 70);
                isAnimating = false;
                onDone();
            }
        }
        requestAnimationFrame(step);
    }

    /* Trajectory Curve Following & Glowing Star Trail Celebration */
    function runTravelRewardAnimation() {
        isAnimating = true;
        const ch = LINE_CHALLENGES[currentChallengeIdx];
        const tray = document.getElementById('motifs-tray');
        if (tray) tray.innerHTML = '';

        const charEl = document.getElementById('travel-char');
        const trailLayer = document.getElementById('star-trail-layer');
        const startTime = performance.now();
        const duration = 2100;

        let stars = [];
        let lastStarTime = 0;

        function travelStep(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const pos = ch.evalCurve(t);

            if (charEl) {
                charEl.setAttribute('transform', `translate(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}) rotate(${pos.angle.toFixed(1)})`);
            }

            // Emit sparkling stars along trajectory wake
            if (now - lastStarTime > 110 && t < 0.95) {
                lastStarTime = now;
                stars.push({ x: pos.x, y: pos.y, opacity: 1 });
                playTravelTone(440 + t * 440);
            }

            // Draw decaying star trail
            if (trailLayer) {
                let trailHtml = '';
                for (let i = stars.length - 1; i >= 0; i--) {
                    const st = stars[i];
                    st.opacity -= 0.018;
                    if (st.opacity <= 0) {
                        stars.splice(i, 1);
                        continue;
                    }
                    const icon = (i % 2 === 0) ? '⭐' : '✨';
                    trailHtml += `<text x="${st.x.toFixed(1)}" y="${(st.y + 4).toFixed(1)}" font-size="20" text-anchor="middle" opacity="${st.opacity.toFixed(2)}">${icon}</text>`;
                }
                trailLayer.innerHTML = trailHtml;
            }

            if (t < 1) {
                requestAnimationFrame(travelStep);
            } else {
                playVictoryFanfare();
                const praiseMsg = ch.praise[lang] || ch.praise.fr;
                const pEl = document.getElementById('prompt-label');
                if (pEl) pEl.innerText = praiseMsg;
                speak(praiseMsg);

                setTimeout(() => {
                    isAnimating = false;
                    advanceToNextChallenge();
                }, 1800);
            }
        }
        requestAnimationFrame(travelStep);
    }

    function advanceToNextChallenge() {
        if (isMixAllMode) {
            currentChallengeIdx = (currentChallengeIdx + 1) % LINE_CHALLENGES.length;
        }
        initChallenge();
    }

    function getPromptText() {
        const ch = LINE_CHALLENGES[currentChallengeIdx];
        if (currentSlotIdx >= slots.length) {
            return ch.praise[lang] || ch.praise.fr;
        }
        return ch.story[lang] || ch.story.fr;
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const pEl = document.getElementById('prompt-label');
        if (pEl) pEl.innerText = text;
        if (shouldSpeak) speak(text);
    }

    function setupControls() {
        document.getElementById('speak-prompt-btn')?.addEventListener('click', () => speak(getPromptText()));

        document.getElementById('next-challenge-btn')?.addEventListener('click', () => {
            if (isAnimating) return;
            advanceToNextChallenge();
        });

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

        // Direct number keys 1, 2, 3 to trigger motif cards
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (['1', '2', '3'].includes(e.key)) {
                const idx = parseInt(e.key, 10) - 1;
                const cards = document.querySelectorAll('#motifs-tray .motif-card');
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
                if (titleEl) titleEl.innerText = lang === 'fr' ? '〰️ Lignes Magiques' : '〰️ Magic Lines';

                const lblModel = document.getElementById('lbl-target-model');
                if (lblModel) lblModel.innerText = lang === 'fr' ? '🎯 Modèle de ligne :' : '🎯 Line Model:';

                const nextBtn = document.getElementById('next-challenge-btn');
                if (nextBtn) {
                    nextBtn.title = lang === 'fr' ? 'Défi suivant' : 'Next Challenge';
                    nextBtn.setAttribute('aria-label', nextBtn.title);
                }

                renderPills();
                renderTargetBlueprint();
                renderChoices();
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
        if (titleEl) titleEl.innerText = lang === 'fr' ? '〰️ Lignes Magiques' : '〰️ Magic Lines';

        const lblModel = document.getElementById('lbl-target-model');
        if (lblModel) lblModel.innerText = lang === 'fr' ? '🎯 Modèle de ligne :' : '🎯 Line Model:';

        const nextBtn = document.getElementById('next-challenge-btn');
        if (nextBtn) {
            nextBtn.title = lang === 'fr' ? 'Défi suivant' : 'Next Challenge';
            nextBtn.setAttribute('aria-label', nextBtn.title);
        }

        setupControls();
        initChallenge();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
