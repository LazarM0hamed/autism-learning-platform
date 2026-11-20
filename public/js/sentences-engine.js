/**
 * Sentence Builder Engine (Activity #34 - Construire une phrase)
 * Teaches 3-part sentence structure (Qui ? + Action + Quoi ?)
 * with color-coded grammar blocks and an animated SVG action theatre.
 */

(() => {
    'use strict';

    const SUBJECTS = [
        { id: 'cat',    icon: '🐱', label: { fr: 'Le chat',   en: 'The cat' } },
        { id: 'dog',    icon: '🐶', label: { fr: 'Le chien',  en: 'The dog' } },
        { id: 'boy',    icon: '👦', label: { fr: 'Léo',       en: 'Leo' } },
        { id: 'rabbit', icon: '🐰', label: { fr: 'Le lapin',  en: 'The rabbit' } },
        { id: 'panda',  icon: '🐼', label: { fr: 'Le panda',  en: 'The panda' } }
    ];

    const VERBS = [
        { id: 'eats',   icon: '😋', label: { fr: 'mange',     en: 'eats' } },
        { id: 'drinks', icon: '🥤', label: { fr: 'boit',      en: 'drinks' } },
        { id: 'throws', icon: '🙌', label: { fr: 'lance',     en: 'throws' } },
        { id: 'reads',  icon: '👀', label: { fr: 'regarde',   en: 'looks at' } }
    ];

    const OBJECTS = [
        { id: 'milk',   icon: '🥛', label: { fr: 'le lait.',    en: 'the milk.' } },
        { id: 'apple',  icon: '🍎', label: { fr: 'la pomme.',   en: 'the apple.' } },
        { id: 'carrot', icon: '🥕', label: { fr: 'la carotte.', en: 'the carrot.' } },
        { id: 'ball',   icon: '⚽', label: { fr: 'le ballon.',  en: 'the ball.' } },
        { id: 'book',   icon: '📖', label: { fr: 'le livre.',   en: 'the book.' } }
    ];

    const GUIDED_SENTENCES = [
        { s: 'cat',    v: 'drinks', o: 'milk' },
        { s: 'rabbit', v: 'eats',   o: 'carrot' },
        { s: 'boy',    v: 'throws', o: 'ball' },
        { s: 'panda',  v: 'eats',   o: 'apple' },
        { s: 'boy',    v: 'reads',  o: 'book' },
        { s: 'dog',    v: 'throws', o: 'ball' },
        { s: 'dog',    v: 'drinks', o: 'milk' },
        { s: 'cat',    v: 'reads',  o: 'book' },
        { s: 'boy',    v: 'eats',   o: 'apple' },
        { s: 'rabbit', v: 'reads',  o: 'book' }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let gameMode = 'finish'; // 'finish' | 'build' | 'free'
    let targetSentence = null;
    let lastSentenceKey = '';
    let chosenBlocks = [null, null, null];
    let activeSlotIdx = 0;
    let isAnimating = false;
    let animProgress = 0;
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function speak(text, rate = 0.92) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
            utter.rate = rate;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }

    function playBlockSnap(pitch = 420) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(pitch, now);
            osc.frequency.exponentialRampToValueAtTime(pitch * 1.3, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.13);
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

    function findById(list, id) {
        return list.find(item => item.id === id) || list[0];
    }

    function getFullSentenceText(s, v, o) {
        return `${s.label[lang]} ${v.label[lang]} ${o.label[lang]}`;
    }

    function startRound() {
        isAnimating = false;
        animProgress = 0;

        if (gameMode === 'free') {
            targetSentence = null;
            chosenBlocks = [null, null, null];
            activeSlotIdx = 0;
            drawTheatre();
            renderTrack();
            renderChoices();
            updatePrompt(true);

            if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
                window.AlpInputManager.refresh();
            }
            return;
        }

        const candidates = GUIDED_SENTENCES.filter(item => `${item.s}-${item.v}-${item.o}` !== lastSentenceKey);
        const picked = candidates[Math.floor(Math.random() * candidates.length)];
        lastSentenceKey = `${picked.s}-${picked.v}-${picked.o}`;

        targetSentence = {
            subject: findById(SUBJECTS, picked.s),
            verb:    findById(VERBS, picked.v),
            object:  findById(OBJECTS, picked.o)
        };

        if (gameMode === 'finish') {
            chosenBlocks = [targetSentence.subject, targetSentence.verb, null];
            activeSlotIdx = 2;
        } else {
            chosenBlocks = [null, null, null];
            activeSlotIdx = 0;
        }

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`sentences_${gameMode}_${lastSentenceKey}`);
        }

        drawTheatre();
        renderTrack();
        renderChoices();
        updatePrompt(true);

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function getPromptText() {
        if (activeSlotIdx >= 3 && chosenBlocks[0] && chosenBlocks[1] && chosenBlocks[2]) {
            return `⭐ « ${getFullSentenceText(chosenBlocks[0], chosenBlocks[1], chosenBlocks[2])} »`;
        }

        if (gameMode === 'free') {
            const promptsFr = [
                'Étape 1 : Choisis QUI fait l’action !',
                'Étape 2 : Choisis l’ACTION (le verbe) !',
                'Étape 3 : Choisis l’OBJET pour finir ta phrase !'
            ];
            const promptsEn = [
                'Step 1: Pick WHO does the action!',
                'Step 2: Pick the ACTION (verb)!',
                'Step 3: Pick the OBJECT to finish your sentence!'
            ];
            return lang === 'fr' ? promptsFr[activeSlotIdx] : promptsEn[activeSlotIdx];
        }

        const fullStr = getFullSentenceText(targetSentence.subject, targetSentence.verb, targetSentence.object);
        if (gameMode === 'finish') {
            return lang === 'fr'
                ? `Finis la phrase : « ${targetSentence.subject.label.fr} ${targetSentence.verb.label.fr} ... ? »`
                : `Finish the sentence: "${targetSentence.subject.label.en} ${targetSentence.verb.label.en} ...?"`;
        }
        return lang === 'fr'
            ? `Construis la phrase : « ${fullStr} »`
            : `Build the sentence: "${fullStr}"`;
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const lbl = document.getElementById('prompt-label');
        if (lbl) lbl.innerText = text;

        if (shouldSpeak) {
            if (gameMode === 'build' && activeSlotIdx === 0) {
                speak(getFullSentenceText(targetSentence.subject, targetSentence.verb, targetSentence.object));
            } else {
                speak(text);
            }
        }
    }

    function renderTrack() {
        const track = document.getElementById('grammar-track');
        if (!track) return;
        track.innerHTML = '';

        const roles = [
            { idx: 0, cls: 'slot-subject', hint: { fr: '1. Qui ?',   en: '1. Who?' } },
            { idx: 1, cls: 'slot-verb',    hint: { fr: '2. Action',  en: '2. Action' } },
            { idx: 2, cls: 'slot-object',  hint: { fr: '3. Quoi ?',  en: '3. What?' } }
        ];

        roles.forEach(r => {
            const block = chosenBlocks[r.idx];
            const slot = document.createElement('div');
            slot.className = `grammar-slot ${r.cls}`;
            if (block) slot.classList.add('filled');
            else if (r.idx === activeSlotIdx) slot.classList.add('active-slot');

            if (block) {
                slot.innerHTML = `
                    <span class="slot-role-hint">${r.hint[lang]}</span>
                    <div class="slot-content"><span>${block.icon}</span><span>${block.label[lang]}</span></div>
                `;
            } else {
                slot.innerHTML = `
                    <span class="slot-role-hint">${r.hint[lang]}</span>
                    <div class="slot-content" style="color:#94A3B8;">?</div>
                `;
            }
            track.appendChild(slot);
        });

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function renderChoices() {
        const row = document.getElementById('word-choices');
        if (!row) return;
        row.innerHTML = '';
        if (activeSlotIdx >= 3) {
            if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
                window.AlpInputManager.refresh();
            }
            return;
        }

        const listsBySlot = [SUBJECTS, VERBS, OBJECTS];
        const roleClasses = ['role-subject', 'role-verb', 'role-object'];
        const currentPool = listsBySlot[activeSlotIdx];
        const roleClass = roleClasses[activeSlotIdx];

        let options = [];
        if (gameMode === 'free') {
            options = [...currentPool];
        } else {
            const targetObj = [targetSentence.subject, targetSentence.verb, targetSentence.object][activeSlotIdx];
            const distractors = currentPool.filter(i => i.id !== targetObj.id).sort(() => Math.random() - 0.5).slice(0, 2);
            options = [targetObj, ...distractors].sort(() => Math.random() - 0.5);
        }

        options.forEach(item => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `grammar-card ${roleClass}`;
            card.innerHTML = `
                <span class="gc-icon">${item.icon}</span>
                <span class="gc-label">${item.label[lang]}</span>
            `;

            card.onclick = () => {
                if (isAnimating || activeSlotIdx >= 3) return;

                if (gameMode === 'free') {
                    acceptBlock(item, card);
                    return;
                }

                const expected = [targetSentence.subject, targetSentence.verb, targetSentence.object][activeSlotIdx];
                if (item.id === expected.id) {
                    acceptBlock(item, card);
                } else {
                    card.classList.add('soft-dim');
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt();
                    }
                    speak(item.label[lang]);
                }
            };

            row.appendChild(card);
        });

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function acceptBlock(item, cardEl) {
        cardEl.classList.add('winner');
        playBlockSnap(380 + activeSlotIdx * 80);
        chosenBlocks[activeSlotIdx] = item;
        activeSlotIdx++;

        drawTheatre();
        renderTrack();

        if (activeSlotIdx < 3) {
            speak(item.label[lang]);
            setTimeout(() => {
                renderChoices();
                updatePrompt(false);
            }, 420);
        } else {
            if (window.AlpTracker && targetSentence) {
                window.AlpTracker.onTrialSuccess(`sentences_${gameMode}_${lastSentenceKey}`);
            }
            runSentenceAnimation();
        }
    }

    function drawTheatre() {
        const svg = document.getElementById('sentence-svg');
        if (!svg) return;
        const subj = chosenBlocks[0] || (targetSentence ? targetSentence.subject : null);
        const verb = chosenBlocks[1] || (targetSentence ? targetSentence.verb : null);
        const obj  = chosenBlocks[2] || (targetSentence && gameMode !== 'finish' ? targetSentence.object : null);

        const p = animProgress;
        const subjX = 145 + p * 135;
        const subjBounce = Math.sin(p * Math.PI * 3) * 6;

        let objX = 385;
        let objY = 166;
        if (verb && verb.id === 'throws' && p > 0) {
            objX = 340 + p * 110;
            objY = 166 - Math.sin(p * Math.PI) * 105;
        }

        const subjSvg = subj ? `
            <g transform="translate(${subjX.toFixed(1)}, ${(156 - subjBounce).toFixed(1)})">
                <ellipse cx="0" cy="36" rx="28" ry="7" fill="rgba(0,0,0,0.12)"/>
                <text x="0" y="24" font-size="68" text-anchor="middle">${subj.icon}</text>
            </g>
        ` : `
            <g transform="translate(145, 156)">
                <circle cx="0" cy="0" r="34" fill="#EFF6FF" stroke="#2563EB" stroke-width="3" stroke-dasharray="6,5"/>
                <text x="0" y="12" font-size="30" font-weight="bold" fill="#2563EB" text-anchor="middle">?</text>
            </g>
        `;

        const verbBadgeSvg = verb ? `
            <g transform="translate(270, 56)">
                <rect x="-66" y="-22" width="132" height="44" rx="16" fill="#FFFBEB" stroke="#EA580C" stroke-width="3"/>
                <text x="0" y="8" font-size="20" font-weight="bold" fill="#C2410C" text-anchor="middle">${verb.icon} ${verb.label[lang]}</text>
            </g>
        ` : '';

        const objSvg = obj ? `
            <g transform="translate(${objX.toFixed(1)}, ${objY.toFixed(1)})">
                <ellipse cx="0" cy="28" rx="24" ry="6" fill="rgba(0,0,0,0.1)"/>
                <text x="0" y="18" font-size="58" text-anchor="middle">${obj.icon}</text>
            </g>
        ` : `
            <g transform="translate(385, 166)">
                <circle cx="0" cy="0" r="32" fill="#ECFDF5" stroke="#16A34A" stroke-width="3" stroke-dasharray="6,5"/>
                <text x="0" y="12" font-size="28" font-weight="bold" fill="#16A34A" text-anchor="middle">?</text>
            </g>
        `;

        const celebrationStars = p > 0.6 ? `
            <text x="270" y="${(115 - p * 35).toFixed(1)}" font-size="34" text-anchor="middle">⭐</text>
            <text x="220" y="${(125 - p * 25).toFixed(1)}" font-size="26">✨</text>
            <text x="320" y="${(125 - p * 25).toFixed(1)}" font-size="26">✨</text>
        ` : '';

        svg.innerHTML = `
            <rect width="540" height="240" fill="#EFF6FF"/>
            <circle cx="65" cy="44" r="20" fill="#FACC15"/>
            <rect x="0" y="192" width="540" height="48" fill="#4ADE80"/>
            ${verbBadgeSvg}
            ${subjSvg}
            ${objSvg}
            ${celebrationStars}
        `;
    }

    function runSentenceAnimation() {
        isAnimating = true;
        const row = document.getElementById('word-choices');
        if (row) row.innerHTML = '';

        const fullText = getFullSentenceText(chosenBlocks[0], chosenBlocks[1], chosenBlocks[2]);
        const promptLbl = document.getElementById('prompt-label');
        if (promptLbl) promptLbl.innerText = `⭐ « ${fullText} »`;

        playVictoryFanfare();
        speak(fullText, 0.92);

        const startTime = performance.now();
        const duration = 1350;

        function frame(now) {
            const t = Math.min(1, (now - startTime) / duration);
            animProgress = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            drawTheatre();

            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                isAnimating = false;
                setTimeout(startRound, 1400);
            }
        }
        requestAnimationFrame(frame);
    }

    function setSentenceMode(mode, btnId) {
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
        const mFinishBtn = document.getElementById('mode-finish-btn');
        if (mFinishBtn) mFinishBtn.onclick = () => setSentenceMode('finish', 'mode-finish-btn');

        const mBuildBtn = document.getElementById('mode-build-btn');
        if (mBuildBtn) mBuildBtn.onclick = () => setSentenceMode('build', 'mode-build-btn');

        const mFreeBtn = document.getElementById('mode-free-btn');
        if (mFreeBtn) mFreeBtn.onclick = () => setSentenceMode('free', 'mode-free-btn');

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
                if (title) title.innerText = lang === 'fr' ? '💬 Construire une phrase' : '💬 Sentence Builder';

                if (mFinishBtn) mFinishBtn.innerText = lang === 'fr' ? '🧩 Finir la phrase (3e bloc)' : '🧩 Finish Sentence (3rd Block)';
                if (mBuildBtn) mBuildBtn.innerText = lang === 'fr' ? '🏗️ Construire (3 blocs)' : '🏗️ Build Sentence (3 Blocks)';
                if (mFreeBtn) mFreeBtn.innerText = lang === 'fr' ? '🎨 Créer librement' : '🎨 Free Sandbox';

                drawTheatre();
                renderTrack();
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
