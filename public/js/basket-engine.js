// Basket Shape Engine
// Autism Learning Platform - Shape Recognition Basketball with Morphing Hoops & Parabolic Projectiles
// 60fps SVG physics animations, procedural Web Audio net swish & bounce, bilingual speech & Button Controller support.

(() => {
    'use strict';

    const BASKET_SHAPES = [
        { id: 'circle',    color: '#F77F00', stroke: '#C05621', name: { fr: 'CERCLE (Rond)',  en: 'CIRCLE' } },
        { id: 'square',    color: '#1982C4', stroke: '#2B6CB0', name: { fr: 'CARRÉ',          en: 'SQUARE' } },
        { id: 'triangle',  color: '#52B788', stroke: '#2F855A', name: { fr: 'TRIANGLE',       en: 'TRIANGLE' } },
        { id: 'rectangle', color: '#8338EC', stroke: '#553C9A', name: { fr: 'RECTANGLE',      en: 'RECTANGLE' } },
        { id: 'star',      color: '#FFCA3A', stroke: '#D69E2E', name: { fr: 'ÉTOILE',         en: 'STAR' } },
        { id: 'diamond',   color: '#FF595E', stroke: '#C53030', name: { fr: 'LOSANGE',        en: 'DIAMOND' } }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let shapePoolSize = 4;
    let score = 0;
    let targetShape = null;
    let lastShapeId = null;
    let floorChoices = [];
    let isShooting = false;
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

    function playSwishSound() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;

            // Crisp net swish + joyful ascending chord
            const bufferSize = ctx.sampleRate * 0.28;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1600, now);
            filter.frequency.exponentialRampToValueAtTime(600, now + 0.28);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);

            [523.2, 659.3, 784.0, 1046.5].forEach((f, idx) => {
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + 0.08 + idx * 0.08);
                g.gain.setValueAtTime(0.16, now + 0.08 + idx * 0.08);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + idx * 0.08 + 0.3);
                osc.connect(g);
                g.connect(ctx.destination);
                osc.start(now + 0.08 + idx * 0.08);
                osc.stop(now + 0.08 + idx * 0.08 + 0.32);
            });
        } catch (e) {}
    }

    function playGentleBounceSound() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(240, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.16);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.19);
        } catch (e) {}
    }

    function getStarPoints(cx, cy, rOuter, rInner) {
        const pts = [];
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI / 5) * i - Math.PI / 2;
            const r = i % 2 === 0 ? rOuter : rInner;
            pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
        }
        return pts.join(' ');
    }

    /* Renders either a Hollow Shaped Hoop Rim or a Solid Shaped Ball centered at (0,0) */
    function getShapeGraphic(shapeId, isRim = false, fill = '#F77F00', stroke = '#C05621') {
        const sw = isRim ? 6 : 3;
        const f = isRim ? 'rgba(255, 255, 255, 0.75)' : fill;
        const s = isRim ? '#EA580C' : stroke;

        if (shapeId === 'circle') {
            return `<circle cx="0" cy="0" r="26" fill="${f}" stroke="${s}" stroke-width="${sw}"/>` +
                   (!isRim ? `<path d="M-24,0 L24,0 M0,-24 L0,24" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>` : '');
        }
        if (shapeId === 'square') {
            return `<rect x="-24" y="-24" width="48" height="48" rx="6" fill="${f}" stroke="${s}" stroke-width="${sw}"/>` +
                   (!isRim ? `<line x1="-22" y1="0" x2="22" y2="0" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>` : '');
        }
        if (shapeId === 'triangle') {
            return `<polygon points="0,-28 28,22 -28,22" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;
        }
        if (shapeId === 'rectangle') {
            return `<rect x="-34" y="-17" width="68" height="34" rx="6" fill="${f}" stroke="${s}" stroke-width="${sw}"/>` +
                   (!isRim ? `<line x1="-30" y1="0" x2="30" y2="0" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>` : '');
        }
        if (shapeId === 'star') {
            return `<polygon points="${getStarPoints(0, 0, 30, 13)}" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;
        }
        // Diamond
        return `<polygon points="0,-28 26,0 0,28 -26,0" fill="${f}" stroke="${s}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    }

    function startRound() {
        isShooting = false;
        const available = BASKET_SHAPES.slice(0, shapePoolSize);
        const candidates = available.filter(s => s.id !== lastShapeId);
        targetShape = candidates[Math.floor(Math.random() * candidates.length)];
        lastShapeId = targetShape.id;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`basket_${targetShape.id}`);
        }

        // Pick 2 distractors + target = 3 balls on the floor
        const distractors = available.filter(s => s.id !== targetShape.id).sort(() => Math.random() - 0.5).slice(0, 2);
        floorChoices = [targetShape, ...distractors].sort(() => Math.random() - 0.5);

        updatePrompt(true);
        renderCourt();
    }

    function getPromptText() {
        if (!targetShape) return '';
        return lang === 'fr'
            ? `Lance le ballon ${targetShape.name.fr} dans le panier !`
            : `Shoot the ${targetShape.name.en} ball into the hoop!`;
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const pEl = document.getElementById('prompt-label');
        if (pEl) pEl.innerText = text;
        const sPill = document.getElementById('score-pill');
        if (sPill) sPill.innerText = lang === 'fr' ? `⭐ Paniers : ${score}` : `⭐ Baskets: ${score}`;
        if (shouldSpeak) speak(text);
    }

    function renderCourt() {
        const svg = document.getElementById('basket-svg');
        if (!svg) return;
        const floorPositions = [105, 230, 355];
        const badgeColors = ['#E53E3E', '#38A169', '#D69E2E'];

        let ballsHtml = '';
        floorChoices.forEach((shape, idx) => {
            const bx = floorPositions[idx];
            const by = 328;
            const bCol = badgeColors[idx] || '#3182CE';
            ballsHtml += `
                <g id="floor-ball-pos-${idx}" transform="translate(${bx}, ${by})">
                    <g class="ball-launch-btn" id="floor-ball-${idx}" onclick="handleBallClick(${idx})" tabindex="0" role="button" aria-label="${shape.name[lang] || shape.name.fr}">
                        <ellipse cx="0" cy="30" rx="24" ry="6" fill="rgba(0,0,0,0.12)"/>
                        ${getShapeGraphic(shape.id, false, shape.color, shape.stroke)}
                        <g transform="translate(-24, -24)" pointer-events="none">
                            <circle cx="0" cy="0" r="13" fill="${bCol}" stroke="#FFFFFF" stroke-width="2.5"/>
                            <text x="0" y="4.5" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">${idx + 1}</text>
                        </g>
                    </g>
                </g>
            `;
        });

        svg.innerHTML = `
            <!-- Gymnasium Wall & Wooden Floor -->
            <rect width="460" height="390" fill="#EBF8FF"/>
            <rect x="0" y="285" width="460" height="105" fill="#F3E5D8"/>
            <line x1="0" y1="285" x2="460" y2="285" stroke="#DDB892" stroke-width="4"/>

            <!-- Basketball Pole & Backboard -->
            <rect x="222" y="135" width="16" height="155" fill="#718096"/>
            <rect x="135" y="24" width="190" height="122" rx="14" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="5"/>
            <rect x="148" y="36" width="164" height="98" rx="8" fill="none" stroke="#FEB2B2" stroke-width="3"/>

            <!-- Net Below the Shaped Hoop -->
            <g id="hoop-net" transform="translate(230, 112)">
                <polygon points="-24,0 24,0 16,44 -16,44" fill="rgba(255,255,255,0.65)" stroke="#A0AEC0" stroke-width="2" stroke-dasharray="5,4"/>
                <line x1="-12" y1="0" x2="-8" y2="44" stroke="#CBD5E0" stroke-width="2"/>
                <line x1="12" y1="0" x2="8" y2="44" stroke="#CBD5E0" stroke-width="2"/>
            </g>

            <!-- Shaped Hoop Target ("Cerceau de basket") -->
            <g id="shaped-hoop" transform="translate(230, 92)">
                ${getShapeGraphic(targetShape.id, true)}
            </g>

            <!-- Floor Balls -->
            ${ballsHtml}

            <!-- Flying Projectile Layer & Swish Stars -->
            <g id="projectile-layer"></g>
            <g id="swish-stars-layer"></g>
        `;
    }

    window.handleBallClick = function(idx) {
        if (isShooting) return;
        const chosen = floorChoices[idx];
        const floorPositions = [105, 230, 355];
        const startX = floorPositions[idx];
        const startY = 328;
        const isCorrect = chosen.id === targetShape.id;

        if (window.AlpTracker) {
            window.AlpTracker.onAttempt(isCorrect, chosen.id);
        }

        isShooting = true;
        const floorBallEl = document.getElementById(`floor-ball-${idx}`);
        if (floorBallEl) floorBallEl.style.opacity = '0';

        const projLayer = document.getElementById('projectile-layer');

        if (isCorrect) {
            if (window.AlpTracker) {
                window.AlpTracker.onTrialSuccess(`basket_${targetShape.id}`);
            }

            // Parabolic arc peaking above the hoop, then dropping cleanly through (230, 92) -> (230, 155)
            const startTime = performance.now();
            const duration = 680;

            function shootFrame(now) {
                const t = Math.min(1, (now - startTime) / duration);
                const inv = 1 - t;
                const ctrlX = (startX + 230) / 2;
                const ctrlY = -15;
                const x = inv * inv * startX + 2 * inv * t * ctrlX + t * t * 230;
                const y = inv * inv * startY + 2 * inv * t * ctrlY + t * t * 96;
                const spin = t * 360;

                if (projLayer) {
                    projLayer.innerHTML = `<g transform="translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${spin.toFixed(0)})">${getShapeGraphic(chosen.id, false, chosen.color, chosen.stroke)}</g>`;
                }

                if (t < 1) {
                    requestAnimationFrame(shootFrame);
                } else {
                    // Swoosh through the net!
                    playSwishSound();
                    score++;
                    updatePrompt(false);
                    animateNetSwishAndStars(chosen, () => {
                        isShooting = false;
                        startRound();
                    });
                }
            }
            requestAnimationFrame(shootFrame);
        } else {
            // Gentle rim bounce back to the floor without any harsh buzzer
            const startTime = performance.now();
            const duration = 760;

            function bounceFrame(now) {
                const t = Math.min(1, (now - startTime) / duration);
                let x, y;
                if (t < 0.5) {
                    const u = t * 2;
                    x = startX + (268 - startX) * u;
                    y = startY + (92 - startY) * (1 - Math.pow(1 - u, 2));
                } else {
                    if (t - 0.03 < 0.5) playGentleBounceSound();
                    const u = (t - 0.5) * 2;
                    x = 268 + (startX - 268) * u;
                    y = 92 + (startY - 92) * (u * u);
                }

                if (projLayer) {
                    projLayer.innerHTML = `<g transform="translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${(t * 180).toFixed(0)})">${getShapeGraphic(chosen.id, false, chosen.color, chosen.stroke)}</g>`;
                }

                if (t < 1) {
                    requestAnimationFrame(bounceFrame);
                } else {
                    if (projLayer) projLayer.innerHTML = '';
                    if (floorBallEl) floorBallEl.style.opacity = '1';
                    isShooting = false;
                    updatePrompt(true);
                }
            }
            requestAnimationFrame(bounceFrame);
        }
    };

    function animateNetSwishAndStars(ball, onDone) {
        const net = document.getElementById('hoop-net');
        const stars = document.getElementById('swish-stars-layer');
        const projLayer = document.getElementById('projectile-layer');
        const startTime = performance.now();
        const duration = 750;

        function swish(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const stretchY = 1 + Math.sin(t * Math.PI) * 0.35;
            const dropY = 96 + t * 75;

            if (net) net.setAttribute('transform', `translate(230, 112) scale(1, ${stretchY.toFixed(2)})`);
            if (projLayer && t < 0.7) {
                projLayer.innerHTML = `<g transform="translate(230, ${dropY.toFixed(1)})" opacity="${(1 - t).toFixed(2)}">${getShapeGraphic(ball.id, false, ball.color, ball.stroke)}</g>`;
            } else if (projLayer) {
                projLayer.innerHTML = '';
            }

            if (stars) {
                const spread = t * 55;
                stars.innerHTML = `
                    <text x="${(165 - spread).toFixed(1)}" y="${(80 - spread * 0.5).toFixed(1)}" font-size="30">⭐</text>
                    <text x="${(275 + spread).toFixed(1)}" y="${(80 - spread * 0.5).toFixed(1)}" font-size="30">🌟</text>
                `;
            }

            if (t < 1) requestAnimationFrame(swish);
            else onDone();
        }
        requestAnimationFrame(swish);
    }

    function setShapePool(size, btnId) {
        shapePoolSize = size;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        document.getElementById(btnId)?.classList.add('active');
        startRound();
    }

    function setupControls() {
        document.getElementById('mode-4shapes-btn')?.addEventListener('click', () => setShapePool(4, 'mode-4shapes-btn'));
        document.getElementById('mode-6shapes-btn')?.addEventListener('click', () => setShapePool(6, 'mode-6shapes-btn'));
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

        // Direct number keys (1, 2, 3) to trigger floor balls
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            if (['1', '2', '3'].includes(e.key)) {
                const idx = parseInt(e.key, 10) - 1;
                if (idx >= 0 && idx < floorChoices.length) {
                    window.handleBallClick(idx);
                }
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
                if (titleEl) titleEl.innerText = lang === 'fr' ? '🏀 Basket des Formes' : '🏀 Basket Shape';

                const b4 = document.getElementById('mode-4shapes-btn');
                if (b4) b4.innerText = lang === 'fr' ? '🔷 4 Formes' : '🔷 4 Shapes';

                const b6 = document.getElementById('mode-6shapes-btn');
                if (b6) b6.innerText = lang === 'fr' ? '⭐ 6 Formes' : '⭐ 6 Shapes';

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
        if (titleEl) titleEl.innerText = lang === 'fr' ? '🏀 Basket des Formes' : '🏀 Basket Shape';

        const b4 = document.getElementById('mode-4shapes-btn');
        if (b4) b4.innerText = lang === 'fr' ? '🔷 4 Formes' : '🔷 4 Shapes';

        const b6 = document.getElementById('mode-6shapes-btn');
        if (b6) b6.innerText = lang === 'fr' ? '⭐ 6 Formes' : '⭐ 6 Shapes';

        setupControls();
        startRound();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
