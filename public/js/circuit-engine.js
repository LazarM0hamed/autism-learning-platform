// Wooden Ball Circuit / Marble Run Engine
// Autism Learning Platform - 5-Ramp Zig-Zag Tower with Wooden Click-Clack Audio & Auditory Color Phonics.

(() => {
    'use strict';

    const ALL_BALL_COLORS = [
        { id: 'red',    hex: '#FF595E', name: { fr: 'ROUGE',    en: 'RED' } },
        { id: 'blue',   hex: '#1982C4', name: { fr: 'BLEUE',    en: 'BLUE' } },
        { id: 'yellow', hex: '#FFCA3A', name: { fr: 'JAUNE',    en: 'YELLOW' } },
        { id: 'green',  hex: '#52B788', name: { fr: 'VERTE',    en: 'GREEN' } },
        { id: 'orange', hex: '#F77F00', name: { fr: 'ORANGE',   en: 'ORANGE' } },
        { id: 'purple', hex: '#8338EC', name: { fr: 'VIOLETTE', en: 'PURPLE' } }
    ];

    let ballCount = 4;          // 4 or 6
    let hideSwatchHint = false; // true in pure Listening Mode
    let remainingBalls = [];
    let collectedBalls = [];
    let targetBall = null;
    let isAnimating = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
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

    /* Realistic wooden "click-clack" sound when the ball drops onto each ramp */
    function playWoodClack(pitchBoost = 0) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(340 + pitchBoost, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);
            gain.gain.setValueAtTime(0.28, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.09);
        } catch (e) {}
    }

    function playCelebrationChime() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;
            [523.2, 659.3, 784.0, 1046.5].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                gain.gain.setValueAtTime(0.18, now + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.36);
            });
        } catch (e) {}
    }

    function initCircuit() {
        isAnimating = false;
        collectedBalls = [];
        remainingBalls = ALL_BALL_COLORS.slice(0, ballCount).sort(() => 0.5 - Math.random());
        const layer = document.getElementById('collected-balls-layer');
        if (layer) layer.innerHTML = '';
        const group = document.getElementById('active-ball-group');
        if (group) group.style.display = 'none';
        pickNextTarget();
    }

    function getPromptText() {
        if (!targetBall) {
            return lang === 'fr'
                ? 'Bravo ! Toutes les billes ont roulé ! 🌟'
                : 'Great job! All balls rolled down! 🌟';
        }
        return lang === 'fr'
            ? `Choisis la bille ${targetBall.name.fr}`
            : `Pick the ${targetBall.name.en} ball`;
    }

    function pickNextTarget() {
        if (remainingBalls.length === 0) {
            targetBall = null;
            renderTray();
            updatePromptBanner(true);
            playCelebrationChime();
            setTimeout(initCircuit, 2600);
            return;
        }

        targetBall = remainingBalls[Math.floor(Math.random() * remainingBalls.length)];

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`circuit_${targetBall.id}`);
        }

        renderTray();
        updatePromptBanner(true);
    }

    function updatePromptBanner(shouldSpeak = false) {
        const prompt = getPromptText();
        const promptEl = document.getElementById('prompt-label');
        if (promptEl) promptEl.innerText = prompt;

        const swatch = document.getElementById('target-swatch');
        if (swatch) {
            if (!targetBall || hideSwatchHint) {
                swatch.style.display = 'none';
            } else {
                swatch.style.display = 'inline-block';
                swatch.style.backgroundColor = targetBall.hex;
            }
        }

        if (shouldSpeak) speak(prompt);
    }

    function renderTray() {
        const tray = document.getElementById('ball-tray');
        if (!tray) return;
        tray.innerHTML = '';

        const allInRound = ALL_BALL_COLORS.slice(0, ballCount);
        allInRound.forEach(ball => {
            const isAlreadyUsed = !remainingBalls.some(b => b.id === ball.id);
            const btn = document.createElement('button');
            btn.className = 'ball-choice-btn' + (isAlreadyUsed ? ' used' : '');
            btn.style.backgroundColor = ball.hex;
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('role', 'button');
            const ballName = ball.name[lang] || ball.name.fr;
            btn.setAttribute('aria-label', ballName);

            btn.onclick = () => {
                if (isAnimating || !targetBall || isAlreadyUsed) return;

                if (ball.id === targetBall.id) {
                    isAnimating = true;

                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, ball.id);
                        window.AlpTracker.onTrialSuccess(`circuit_${ball.id}`);
                    }

                    remainingBalls = remainingBalls.filter(b => b.id !== ball.id);
                    renderTray();
                    animateBallDownCircuit(ball, () => {
                        collectedBalls.push(ball);
                        renderCollectedBalls();
                        isAnimating = false;
                        pickNextTarget();
                    });
                } else {
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, ball.id);
                    }
                    // Gentle support: repeat requested color name without harsh error buzzers
                    speak(getPromptText());
                }
            };

            tray.appendChild(btn);
        });
    }

    /* Smoothly animates the ball dropping and rolling down the 5 zig-zag ramps */
    function animateBallDownCircuit(ball, onComplete) {
        const group = document.getElementById('active-ball-group');
        const baseCircle = document.getElementById('active-ball-base');
        const shadeCircle = document.getElementById('active-ball-shade');

        if (!group || !baseCircle || !shadeCircle) {
            onComplete();
            return;
        }

        baseCircle.setAttribute('fill', ball.hex);
        group.style.display = 'block';

        // Final resting X coordinate at bottom right, stacking leftwards as balls collect
        const finalRestX = 352 - collectedBalls.length * 34;
        const finalRestY = 388 + ((finalRestX - 48) / (372 - 48)) * (420 - 388) - 16;

        // Waypoints: [x, y, durationMs, playClackOnArrival]
        const waypoints = [
            { x: 72,  y: 32,  dur: 0,   clack: false },
            { x: 72,  y: 66,  dur: 160, clack: true  }, // Drop onto Ramp 1
            { x: 348, y: 109, dur: 520, clack: false }, // Roll right along Ramp 1
            { x: 348, y: 140, dur: 150, clack: true  }, // Drop onto Ramp 2
            { x: 72,  y: 183, dur: 520, clack: false }, // Roll left along Ramp 2
            { x: 72,  y: 214, dur: 150, clack: true  }, // Drop onto Ramp 3
            { x: 348, y: 257, dur: 520, clack: false }, // Roll right along Ramp 3
            { x: 348, y: 288, dur: 150, clack: true  }, // Drop onto Ramp 4
            { x: 72,  y: 331, dur: 520, clack: false }, // Roll left along Ramp 4
            { x: 72,  y: 361, dur: 150, clack: true  }, // Drop onto Ramp 5 (collector)
            { x: finalRestX, y: finalRestY, dur: 480, clack: true } // Roll to resting spot
        ];

        let segIndex = 1;
        let segStartTime = performance.now();

        function step(now) {
            if (segIndex >= waypoints.length) {
                group.style.display = 'none';
                onComplete();
                return;
            }

            const prev = waypoints[segIndex - 1];
            const curr = waypoints[segIndex];
            const elapsed = now - segStartTime;
            const t = Math.min(1, elapsed / curr.dur);

            // Ease-in for vertical drops, smooth roll for slanted ramps
            const eased = curr.clack ? (t * t) : (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

            const cx = prev.x + (curr.x - prev.x) * eased;
            const cy = prev.y + (curr.y - prev.y) * eased;

            baseCircle.setAttribute('cx', cx.toFixed(1));
            baseCircle.setAttribute('cy', cy.toFixed(1));
            shadeCircle.setAttribute('cx', cx.toFixed(1));
            shadeCircle.setAttribute('cy', cy.toFixed(1));

            if (t >= 1) {
                if (curr.clack) playWoodClack(segIndex * 18);
                segIndex++;
                segStartTime = now;
            }
            requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    function renderCollectedBalls() {
        const layer = document.getElementById('collected-balls-layer');
        if (!layer) return;
        layer.innerHTML = '';

        collectedBalls.forEach((ball, idx) => {
            const cx = 352 - idx * 34;
            const cy = 388 + ((cx - 48) / (372 - 48)) * (420 - 388) - 16;

            const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c1.setAttribute('cx', cx.toFixed(1));
            c1.setAttribute('cy', cy.toFixed(1));
            c1.setAttribute('r', '16');
            c1.setAttribute('fill', ball.hex);

            const c2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c2.setAttribute('cx', cx.toFixed(1));
            c2.setAttribute('cy', cy.toFixed(1));
            c2.setAttribute('r', '16');
            c2.setAttribute('fill', 'url(#ballShine)');

            layer.appendChild(c1);
            layer.appendChild(c2);
        });
    }

    // Mode Switchers
    function setCircuitMode(count, hideHint, activeBtnId) {
        ballCount = count;
        hideSwatchHint = hideHint;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        document.getElementById(activeBtnId)?.classList.add('active');
        initCircuit();
    }

    function setupControls() {
        document.getElementById('mode-4-btn')?.addEventListener('click', () => setCircuitMode(4, false, 'mode-4-btn'));
        document.getElementById('mode-6-btn')?.addEventListener('click', () => setCircuitMode(6, false, 'mode-6-btn'));
        document.getElementById('mode-listen-btn')?.addEventListener('click', () => setCircuitMode(4, true, 'mode-listen-btn'));

        document.getElementById('speak-prompt-btn')?.addEventListener('click', () => speak(getPromptText()));

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (soundEnabled) speak(getPromptText());
                else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            };
        }

        // Direct number key shortcuts 1-6
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            const key = e.key;
            if (['1', '2', '3', '4', '5', '6'].includes(key)) {
                const idx = parseInt(key, 10) - 1;
                const allInRound = ALL_BALL_COLORS.slice(0, ballCount);
                if (allInRound[idx]) {
                    const btns = document.querySelectorAll('.ball-choice-btn');
                    if (btns[idx]) btns[idx].click();
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
                if (titleEl) titleEl.innerText = lang === 'fr' ? '🎢 Circuit à billes' : '🎢 Ball Circuit';

                const m4 = document.getElementById('mode-4-btn');
                if (m4) m4.innerText = lang === 'fr' ? '🎨 4 Couleurs' : '🎨 4 Colors';

                const m6 = document.getElementById('mode-6-btn');
                if (m6) m6.innerText = lang === 'fr' ? '🌈 6 Couleurs' : '🌈 6 Colors';

                const ml = document.getElementById('mode-listen-btn');
                if (ml) ml.innerText = lang === 'fr' ? '👂 Écoute seule' : '👂 Listening Only';

                updatePromptBanner(true);
            };
        });
    }

    function init() {
        setupControls();
        initCircuit();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
