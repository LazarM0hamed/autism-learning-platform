/**
 * Emotions & Social Context Engine (Activity #25)
 * Connects facial emotion recognition, situational social comprehension,
 * and comforting / self-regulation action strategies across 3 modes.
 */

(() => {
    'use strict';

    const EMOTIONS_LIST = [
        { id: 'happy',     color: '#EAB308', bg: '#FEF9C3', label: { fr: 'Joyeux',    en: 'Happy' } },
        { id: 'sad',       color: '#3B82F6', bg: '#EFF6FF', label: { fr: 'Triste',    en: 'Sad' } },
        { id: 'angry',     color: '#EF4444', bg: '#FEF2F2', label: { fr: 'En colère', en: 'Angry' } },
        { id: 'scared',    color: '#8B5CF6', bg: '#F5F3FF', label: { fr: 'Peur',      en: 'Scared' } },
        { id: 'surprised', color: '#F97316', bg: '#FFF7ED', label: { fr: 'Surpris',   en: 'Surprised' } },
        { id: 'tired',     color: '#06B6D4', bg: '#ECFEFF', label: { fr: 'Fatigué',   en: 'Tired' } }
    ];

    const SOCIAL_SITUATIONS = [
        {
            id: 'gift',
            emotion: 'happy',
            sceneType: 'gift',
            storyPrompt: {
                fr: 'Léo reçoit un beau cadeau d’anniversaire ! Comment se sent-il ?',
                en: 'Leo gets a birthday present! How does he feel?'
            },
            praise: {
                fr: 'Oui ! Il est très joyeux de recevoir un cadeau !',
                en: 'Yes! He feels very happy to get a gift!'
            }
        },
        {
            id: 'balloon_lost',
            emotion: 'sad',
            sceneType: 'balloon',
            storyPrompt: {
                fr: 'Oh non, le ballon de Léo s’est envolé dans le ciel ! Comment se sent-il ?',
                en: 'Oh no, Leo’s balloon flew away into the sky! How does he feel?'
            },
            praise: {
                fr: 'Oui, il est triste parce que son ballon est parti.',
                en: 'Yes, he feels sad because his balloon flew away.'
            },
            helpPrompt: {
                fr: 'Léo est triste pour son ballon. Que peut-on faire pour l’aider ?',
                en: 'Leo is sad about his balloon. What can we do to help?'
            },
            helpActions: [
                { id: 'new_balloon', isCorrect: true,  icon: '🎈', label: { fr: 'Donner un ballon', en: 'Give a balloon' } },
                { id: 'loud_drum',   isCorrect: false, icon: '🥁', label: { fr: 'Faire du bruit',   en: 'Make loud noise' } },
                { id: 'broom',       isCorrect: false, icon: '🧹', label: { fr: 'Balayer le sol',   en: 'Sweep the floor' } }
            ],
            helpSuccess: {
                fr: 'Merci ! Avec un nouveau ballon, Léo retrouve le sourire !',
                en: 'Thank you! With a new balloon, Leo smiles again!'
            }
        },
        {
            id: 'fallen_tower',
            emotion: 'angry',
            sceneType: 'tower',
            storyPrompt: {
                fr: 'Sa grande tour de cubes est tombée par terre ! Comment se sent-il ?',
                en: 'His tall block tower fell down! How does he feel?'
            },
            praise: {
                fr: 'Oui, il est en colère parce que sa tour s’est cassée.',
                en: 'Yes, he feels angry because his tower fell.'
            },
            helpPrompt: {
                fr: 'Léo est très en colère ! Que peut-il faire pour se calmer ?',
                en: 'Leo feels very angry! What helps him calm down?'
            },
            helpActions: [
                { id: 'breathe',     isCorrect: true,  icon: '🌬️', label: { fr: 'Respirer doucement', en: 'Breathe slowly' } },
                { id: 'throw_block', isCorrect: false, icon: '💥', label: { fr: 'Crier fort',         en: 'Shout loudly' } },
                { id: 'umbrella',    isCorrect: false, icon: '☂️', label: { fr: 'Ouvrir un parapluie',en: 'Open umbrella' } }
            ],
            helpSuccess: {
                fr: 'Bravo ! En respirant calmement, la colère s’en va !',
                en: 'Great job! Breathing slowly helps the anger go away!'
            }
        },
        {
            id: 'thunder',
            emotion: 'scared',
            sceneType: 'thunder',
            storyPrompt: {
                fr: 'Il fait noir et un gros éclair brille dehors ! Comment se sent-il ?',
                en: 'It is dark and lightning flashes outside! How does he feel?'
            },
            praise: {
                fr: 'Oui, il a peur de l’orage dans le noir.',
                en: 'Yes, he feels scared of the storm in the dark.'
            },
            helpPrompt: {
                fr: 'Léo a peur dans le noir. Que peut-on faire pour le rassurer ?',
                en: 'Leo is scared in the dark. How can we comfort him?'
            },
            helpActions: [
                { id: 'teddy',     isCorrect: true,  icon: '🧸', label: { fr: 'Donner son doudou', en: 'Give teddy bear' } },
                { id: 'ice_cube',  isCorrect: false, icon: '🧊', label: { fr: 'Donner un glaçon',  en: 'Give an ice cube' } },
                { id: 'scissors',  isCorrect: false, icon: '✂️', label: { fr: 'Couper du papier',  en: 'Cut paper' } }
            ],
            helpSuccess: {
                fr: 'Super ! Avec son doudou et la lumière, Léo est rassuré !',
                en: 'Awesome! With his teddy bear and light, Leo feels safe!'
            }
        },
        {
            id: 'jack_in_box',
            emotion: 'surprised',
            sceneType: 'box',
            storyPrompt: {
                fr: 'Coucou ! Un petit clown sort tout d’un coup de la boîte ! Comment est-il ?',
                en: 'Pop! A little toy pops right out of the box! How does he feel?'
            },
            praise: {
                fr: 'Oui ! Il est tout surpris, il ouvre grands les yeux !',
                en: 'Yes! He is surprised, his eyes are wide open!'
            }
        },
        {
            id: 'sleepy_park',
            emotion: 'tired',
            sceneType: 'bedtime',
            storyPrompt: {
                fr: 'Après une longue journée, Léo bâille devant son lit. Comment se sent-il ?',
                en: 'After a long day, Leo yawns by his bed. How does he feel?'
            },
            praise: {
                fr: 'Oui, il est fatigué, il a envie de dormir.',
                en: 'Yes, he feels tired and ready for sleep.'
            },
            helpPrompt: {
                fr: 'Léo est très fatigué. De quoi a-t-il besoin ?',
                en: 'Leo is very tired. What does he need?'
            },
            helpActions: [
                { id: 'blanket', isCorrect: true,  icon: '🛏️', label: { fr: 'Dormir dans son lit', en: 'Sleep in his bed' } },
                { id: 'soccer',  isCorrect: false, icon: '⚽', label: { fr: 'Courir vite',         en: 'Run fast' } },
                { id: 'trumpet', isCorrect: false, icon: '🎺', label: { fr: 'Jouer de la trompette', en: 'Play trumpet' } }
            ],
            helpSuccess: {
                fr: 'Bonne nuit Léo ! Il se repose bien au chaud !',
                en: 'Goodnight Leo! Resting warmly in bed!'
            }
        }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let gameMode = 'faces'; // 'faces' | 'situations' | 'help'
    let currentRound = null;
    let lastTargetId = null;
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

    function playWarmChime() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            [523.25, 659.25, 783.99].forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + i * 0.1);
                gain.gain.setValueAtTime(0.18, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.32);
            });
        } catch (e) {}
    }

    function getEmotionMeta(id) {
        return EMOTIONS_LIST.find(e => e.id === id) || EMOTIONS_LIST[0];
    }

    /* ============================================================================
       EXPRESSIVE SVG FACE RENDERER
       ============================================================================ */

    function getFaceSVGMarkup(emotionId, radius = 42) {
        const meta = getEmotionMeta(emotionId);
        const scale = radius / 42;
        let features = '';

        if (emotionId === 'happy') {
            features = `
                <path d="M-20,-14 Q-13,-21 -6,-14" stroke="#1E293B" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M6,-14 Q13,-21 20,-14" stroke="#1E293B" stroke-width="3" fill="none" stroke-linecap="round"/>
                <circle cx="-13" cy="-6" r="4" fill="#1E293B"/>
                <circle cx="13" cy="-6" r="4" fill="#1E293B"/>
                <circle cx="-22" cy="4" r="5" fill="#F472B6" opacity="0.65"/>
                <circle cx="22" cy="4" r="5" fill="#F472B6" opacity="0.65"/>
                <path d="M-16,8 Q0,26 16,8 Z" fill="#FFFFFF" stroke="#1E293B" stroke-width="3" stroke-linejoin="round"/>
            `;
        } else if (emotionId === 'sad') {
            features = `
                <path d="M-21,-13 L-7,-18" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
                <path d="M21,-13 L7,-18" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
                <circle cx="-13" cy="-5" r="4" fill="#1E293B"/>
                <circle cx="13" cy="-5" r="4" fill="#1E293B"/>
                <path d="M-18,2 Q-22,10 -18,14 Q-14,10 -18,2 Z" fill="#3B82F6"/>
                <path d="M-14,20 Q0,8 14,20" stroke="#1E293B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
            `;
        } else if (emotionId === 'angry') {
            features = `
                <circle cx="0" cy="0" r="40" fill="#FECACA" opacity="0.45"/>
                <path d="M-21,-17 L-6,-9" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/>
                <path d="M21,-17 L6,-9" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/>
                <circle cx="-13" cy="-3" r="4" fill="#1E293B"/>
                <circle cx="13" cy="-3" r="4" fill="#1E293B"/>
                <path d="M-14,18 L-6,12 L0,17 L6,12 L14,18" stroke="#1E293B" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            `;
        } else if (emotionId === 'scared') {
            features = `
                <path d="M-21,-16 Q-13,-24 -6,-17" stroke="#1E293B" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M6,-17 Q13,-24 21,-16" stroke="#1E293B" stroke-width="3" fill="none" stroke-linecap="round"/>
                <circle cx="-13" cy="-5" r="6" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5"/>
                <circle cx="13" cy="-5" r="6" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5"/>
                <circle cx="-13" cy="-5" r="2.5" fill="#1E293B"/>
                <circle cx="13" cy="-5" r="2.5" fill="#1E293B"/>
                <ellipse cx="0" cy="15" rx="9" ry="11" fill="#1E293B"/>
            `;
        } else if (emotionId === 'surprised') {
            features = `
                <path d="M-20,-19 Q-13,-27 -6,-19" stroke="#1E293B" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M6,-19 Q13,-27 20,-19" stroke="#1E293B" stroke-width="3" fill="none" stroke-linecap="round"/>
                <circle cx="-13" cy="-6" r="5.5" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5"/>
                <circle cx="13" cy="-6" r="5.5" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5"/>
                <circle cx="-13" cy="-6" r="2.5" fill="#1E293B"/>
                <circle cx="13" cy="-6" r="2.5" fill="#1E293B"/>
                <circle cx="0" cy="14" r="9" fill="#1E293B"/>
            `;
        } else {
            // Tired
            features = `
                <path d="M-20,-6 Q-13,0 -6,-6" stroke="#1E293B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                <path d="M6,-6 Q13,0 20,-6" stroke="#1E293B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
                <ellipse cx="0" cy="13" rx="7" ry="8" fill="#1E293B"/>
                <text x="24" y="-16" font-size="16" font-weight="bold" fill="#2563EB">z</text>
                <text x="33" y="-26" font-size="20" font-weight="bold" fill="#2563EB">Z</text>
            `;
        }

        return `
            <g transform="scale(${scale.toFixed(2)})">
                <circle cx="0" cy="0" r="40" fill="#FDE68A" stroke="${meta.color}" stroke-width="4"/>
                <path d="M-38,-14 Q0,-52 38,-14 Q22,-28 0,-26 Q-22,-28 -38,-14 Z" fill="#B45309"/>
                ${features}
            </g>
        `;
    }

    /* ============================================================================
       STORY STAGE RENDERER (Visual Context for Situations & Helping)
       ============================================================================ */

    function drawStage(overrideEmotion = null, resolvedHelp = false) {
        const svg = document.getElementById('emotion-svg');
        if (!svg) return;

        if (gameMode === 'faces') {
            const faceId = overrideEmotion || 'surprised';
            const showStars = overrideEmotion !== null;
            svg.innerHTML = `
                <rect width="520" height="265" fill="#EFF6FF"/>
                <rect x="0" y="210" width="520" height="55" fill="#CBD5E1"/>
                <g transform="translate(260, 118)">
                    <rect x="-42" y="42" width="84" height="65" rx="20" fill="#3B82F6"/>
                    ${overrideEmotion ? getFaceSVGMarkup(faceId, 52) : `
                        <circle cx="0" cy="0" r="50" fill="#FFFFFF" stroke="#3B82F6" stroke-width="4" stroke-dasharray="8,6"/>
                        <text x="0" y="16" font-size="46" font-weight="bold" fill="#3B82F6" text-anchor="middle">?</text>
                    `}
                </g>
                ${showStars ? '<text x="160" y="75" font-size="32">⭐</text><text x="340" y="75" font-size="32">🌟</text>' : ''}
            `;
            return;
        }

        const sit = currentRound;
        if (!sit) return;
        const activeFace = resolvedHelp ? 'happy' : (overrideEmotion || (gameMode === 'help' ? sit.emotion : null));
        let propMarkup = '';

        if (sit.sceneType === 'gift') {
            propMarkup = `
                <rect x="315" y="135" width="76" height="68" rx="10" fill="#EF4444" stroke="#B91C1C" stroke-width="3"/>
                <rect x="347" y="135" width="12" height="68" fill="#FBBF24"/>
                <rect x="315" y="162" width="76" height="12" fill="#FBBF24"/>
                <text x="353" y="130" font-size="34" text-anchor="middle">🎀</text>
            `;
        } else if (sit.sceneType === 'balloon') {
            propMarkup = resolvedHelp
                ? `<line x1="235" y1="165" x2="295" y2="95" stroke="#64748B" stroke-width="3"/><circle cx="295" cy="75" r="24" fill="#EF4444"/>`
                : `<line x1="365" y1="78" x2="365" y2="128" stroke="#64748B" stroke-width="2" stroke-dasharray="4,4"/><circle cx="365" cy="54" r="22" fill="#EF4444"/><text x="305" y="110" font-size="22" fill="#3B82F6">⬆️💨</text>`;
        } else if (sit.sceneType === 'tower') {
            propMarkup = resolvedHelp
                ? `<text x="345" y="175" font-size="52" text-anchor="middle">🌬️🍃</text>`
                : `
                    <rect x="305" y="178" width="44" height="28" rx="5" fill="#EF4444" transform="rotate(-18 305 178)"/>
                    <rect x="355" y="182" width="44" height="28" rx="5" fill="#FBBF24" transform="rotate(24 355 182)"/>
                    <polygon points="335,148 365,175 315,175" fill="#10B981" transform="rotate(35 340 160)"/>
                `;
        } else if (sit.sceneType === 'thunder') {
            propMarkup = resolvedHelp
                ? `<text x="350" y="170" font-size="56" text-anchor="middle">🧸💡</text>`
                : `
                    <rect x="295" y="34" width="145" height="125" rx="14" fill="#0F172A" stroke="#64748B" stroke-width="4"/>
                    <text x="368" y="88" font-size="44" text-anchor="middle">⛈️</text>
                    <text x="368" y="136" font-size="36" text-anchor="middle">⚡</text>
                `;
        } else if (sit.sceneType === 'box') {
            propMarkup = `
                <rect x="315" y="148" width="76" height="58" rx="8" fill="#8B5CF6" stroke="#6D28D9" stroke-width="3"/>
                <text x="353" y="135" font-size="54" text-anchor="middle">🤡</text>
                <text x="295" y="95" font-size="26">✨</text>
            `;
        } else if (sit.sceneType === 'bedtime') {
            propMarkup = `
                <rect x="290" y="152" width="155" height="54" rx="10" fill="#93C5FD" stroke="#2563EB" stroke-width="3"/>
                <rect x="290" y="128" width="18" height="78" rx="5" fill="#B45309"/>
                <text x="380" y="92" font-size="40" text-anchor="middle">🌙⭐</text>
            `;
        }

        const bgColor = (sit.sceneType === 'thunder' && !resolvedHelp) ? '#1E293B' : '#EFF6FF';

        svg.innerHTML = `
            <rect width="520" height="265" fill="${bgColor}"/>
            <rect x="0" y="206" width="520" height="59" fill="#CBD5E1"/>

            <!-- Boy Character on Left -->
            <g transform="translate(165, 118)">
                <rect x="-38" y="40" width="76" height="60" rx="18" fill="#3B82F6"/>
                ${activeFace ? getFaceSVGMarkup(activeFace, 48) : `
                    <circle cx="0" cy="0" r="46" fill="#FFFFFF" stroke="#3B82F6" stroke-width="4" stroke-dasharray="8,6"/>
                    <text x="0" y="15" font-size="42" font-weight="bold" fill="#3B82F6" text-anchor="middle">?</text>
                `}
            </g>

            <!-- Story Context Prop on Right -->
            ${propMarkup}
        `;
    }

    /* ============================================================================
       ROUND FLOW FOR ALL 3 MODES
       ============================================================================ */

    function startRound() {
        isSolved = false;
        const grid = document.getElementById('choices-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (gameMode === 'faces') {
            const pool = EMOTIONS_LIST.filter(e => e.id !== lastTargetId);
            const target = pool[Math.floor(Math.random() * pool.length)];
            lastTargetId = target.id;
            currentRound = target;

            if (window.AlpTracker) {
                window.AlpTracker.onQuestionStart(`emot_face_${target.id}`);
            }

            const prompt = lang === 'fr'
                ? `Montre le visage : ${target.label.fr.toUpperCase()}`
                : `Show the face: ${target.label.en.toUpperCase()}`;
            const promptEl = document.getElementById('prompt-label');
            if (promptEl) promptEl.innerText = prompt;
            drawStage(null);
            speak(prompt);

            const distractors = EMOTIONS_LIST.filter(e => e.id !== target.id).sort(() => Math.random() - 0.5).slice(0, 2);
            const choices = [target, ...distractors].sort(() => Math.random() - 0.5);

            choices.forEach(em => renderEmotionChoiceCard(em, em.id === target.id, () => {
                drawStage(em.id);
                if (window.AlpTracker) {
                    window.AlpTracker.onTrialSuccess(`emot_face_${em.id}`);
                }
                const praise = lang === 'fr' ? `Bravo ! C'est ${em.label.fr.toLowerCase()} !` : `Great job! That is ${em.label.en.toLowerCase()}!`;
                if (promptEl) promptEl.innerText = praise;
                speak(praise);
            }));
        } else if (gameMode === 'situations') {
            const pool = SOCIAL_SITUATIONS.filter(s => s.id !== lastTargetId);
            currentRound = pool[Math.floor(Math.random() * pool.length)];
            lastTargetId = currentRound.id;

            if (window.AlpTracker) {
                window.AlpTracker.onQuestionStart(`emot_sit_${currentRound.id}`);
            }

            const targetEm = getEmotionMeta(currentRound.emotion);
            const prompt = currentRound.storyPrompt[lang];
            const promptEl = document.getElementById('prompt-label');
            if (promptEl) promptEl.innerText = prompt;
            drawStage(null);
            speak(prompt);

            const distractors = EMOTIONS_LIST.filter(e => e.id !== targetEm.id).sort(() => Math.random() - 0.5).slice(0, 2);
            const choices = [targetEm, ...distractors].sort(() => Math.random() - 0.5);

            choices.forEach(em => renderEmotionChoiceCard(em, em.id === targetEm.id, () => {
                drawStage(em.id);
                if (window.AlpTracker) {
                    window.AlpTracker.onTrialSuccess(`emot_sit_${currentRound.id}`);
                }
                const praise = currentRound.praise[lang];
                if (promptEl) promptEl.innerText = praise;
                speak(praise);
            }));
        } else {
            // Help & Regulate Mode
            const helpSituations = SOCIAL_SITUATIONS.filter(s => s.helpActions && s.id !== lastTargetId);
            currentRound = helpSituations[Math.floor(Math.random() * helpSituations.length)];
            lastTargetId = currentRound.id;

            if (window.AlpTracker) {
                window.AlpTracker.onQuestionStart(`emot_help_${currentRound.id}`);
            }

            const prompt = currentRound.helpPrompt[lang];
            const promptEl = document.getElementById('prompt-label');
            if (promptEl) promptEl.innerText = prompt;
            drawStage(currentRound.emotion, false);
            speak(prompt);

            const shuffledActions = [...currentRound.helpActions].sort(() => Math.random() - 0.5);
            shuffledActions.forEach(act => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'emotion-card';
                card.innerHTML = `<span class="action-icon-big">${act.icon}</span><span class="emotion-label">${act.label[lang]}</span>`;
                card.onclick = () => {
                    if (isSolved) return;
                    if (act.isCorrect) {
                        isSolved = true;
                        card.classList.add('winner');
                        playWarmChime();
                        drawStage('happy', true);

                        if (window.AlpTracker) {
                            window.AlpTracker.onTrialSuccess(`emot_help_${currentRound.id}`);
                        }

                        const successText = currentRound.helpSuccess[lang];
                        if (promptEl) promptEl.innerText = successText;
                        speak(successText);
                        setTimeout(startRound, 2300);
                    } else {
                        card.classList.add('soft-dim');
                        if (window.AlpTracker) {
                            window.AlpTracker.onAttempt();
                        }
                        speak(prompt);
                    }
                };
                grid.appendChild(card);
            });
        }

        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function renderEmotionChoiceCard(em, isTarget, onSuccess) {
        const grid = document.getElementById('choices-grid');
        if (!grid) return;
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'emotion-card';
        card.style.borderColor = em.color;
        card.style.backgroundColor = em.bg;

        card.innerHTML = `
            <svg width="96" height="96" viewBox="-48 -48 96 96">${getFaceSVGMarkup(em.id, 42)}</svg>
            <span class="emotion-label">${em.label[lang]}</span>
        `;

        card.onclick = () => {
            if (isSolved) return;
            if (isTarget) {
                isSolved = true;
                card.classList.add('winner');
                playWarmChime();
                onSuccess();
                setTimeout(startRound, 2200);
            } else {
                card.classList.add('soft-dim');
                if (window.AlpTracker) {
                    window.AlpTracker.onAttempt();
                }
                const hint = lang === 'fr'
                    ? `Ça c'est ${em.label.fr.toLowerCase()}.`
                    : `That one is ${em.label.en.toLowerCase()}.`;
                speak(hint);
            }
        };

        grid.appendChild(card);
    }

    function setMode(mode, btnId) {
        gameMode = mode;
        lastTargetId = null;
        document.querySelectorAll('.routine-pill').forEach(b => b.classList.remove('active'));
        const activeBtn = document.getElementById(btnId);
        if (activeBtn) activeBtn.classList.add('active');
        startRound();
        if (window.AlpInputManager && typeof window.AlpInputManager.refresh === 'function') {
            window.AlpInputManager.refresh();
        }
    }

    function setupControls() {
        const facesBtn = document.getElementById('mode-faces-btn');
        if (facesBtn) facesBtn.onclick = () => setMode('faces', 'mode-faces-btn');

        const situationsBtn = document.getElementById('mode-situations-btn');
        if (situationsBtn) situationsBtn.onclick = () => setMode('situations', 'mode-situations-btn');

        const helpBtn = document.getElementById('mode-help-btn');
        if (helpBtn) helpBtn.onclick = () => setMode('help', 'mode-help-btn');

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) speakBtn.onclick = () => {
            const promptEl = document.getElementById('prompt-label');
            if (promptEl) speak(promptEl.innerText);
        };

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
                if (title) title.innerText = lang === 'fr' ? '😊 Émotions & Situations' : '😊 Emotions & Situations';

                if (facesBtn) facesBtn.innerText = lang === 'fr' ? '😊 Les Visages' : '😊 Faces';
                if (situationsBtn) situationsBtn.innerText = lang === 'fr' ? '🎬 Situations' : '🎬 Situations';
                if (helpBtn) helpBtn.innerText = lang === 'fr' ? '💛 Aider & Calmer' : '💛 Help & Calm';

                startRound();
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
