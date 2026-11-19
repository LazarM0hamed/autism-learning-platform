/**
 * Language & Communication Mini-Film Engine (Activity #23)
 * Implements functional communication & PECS visual sentence strip practice
 * across 4 narrative acts: Bonjour -> Je veux... -> Merci -> Au revoir.
 */

(() => {
    'use strict';

    const ANIMAL_FRIENDS = [
        { id: 'panda',  icon: '🐼', name: { fr: 'Le Panda', en: 'Panda' } },
        { id: 'bear',   icon: '🐻', name: { fr: "L'Ours",   en: 'Bear' } },
        { id: 'fox',    icon: '🦊', name: { fr: 'Le Renard', en: 'Fox' } },
        { id: 'rabbit', icon: '🐰', name: { fr: 'Le Lapin', en: 'Rabbit' } }
    ];

    const DEMAND_SCENARIOS = [
        {
            id: 'cake',
            wanted: {
                icon: '🍰',
                short: { fr: 'un gâteau', en: 'a cake' },
                fullPhrase: { fr: 'Je veux un gâteau !', en: 'I want a cake!' },
                animalOffer: { fr: 'Tu veux un gâteau ou un trombone ?', en: 'Do you want a cake or a paperclip?' },
                enjoyMsg: { fr: 'Miam ! Le gâteau est délicieux !', en: 'Yum! The cake is delicious!' }
            },
            distractor: { icon: '📎', short: { fr: 'un trombone', en: 'a paperclip' } }
        },
        {
            id: 'drink',
            wanted: {
                icon: '🧃',
                short: { fr: 'boire', en: 'a drink' },
                fullPhrase: { fr: 'Je veux boire !', en: 'I want to drink!' },
                animalOffer: { fr: 'Tu veux boire ou un caillou ?', en: 'Do you want a drink or a pebble?' },
                enjoyMsg: { fr: 'Glou glou ! Ça rafraîchit !', en: 'Sip sip! So refreshing!' }
            },
            distractor: { icon: '🪨', short: { fr: 'un caillou', en: 'a pebble' } }
        },
        {
            id: 'bubbles',
            wanted: {
                icon: '🫧',
                short: { fr: 'faire des bulles', en: 'bubbles' },
                fullPhrase: { fr: 'Je veux faire des bulles !', en: 'I want to blow bubbles!' },
                animalOffer: { fr: 'Tu veux des bulles ou un trombone ?', en: 'Do you want bubbles or a paperclip?' },
                enjoyMsg: { fr: 'Oh ! Regarde toutes les belles bulles !', en: 'Ooh! Look at all the pretty bubbles!' }
            },
            distractor: { icon: '📎', short: { fr: 'un trombone', en: 'a paperclip' } }
        },
        {
            id: 'ball',
            wanted: {
                icon: '⚽',
                short: { fr: 'le ballon', en: 'the ball' },
                fullPhrase: { fr: 'Je veux le ballon !', en: 'I want the ball!' },
                animalOffer: { fr: 'Tu veux le ballon ou une éponge ?', en: 'Do you want the ball or a sponge?' },
                enjoyMsg: { fr: 'Super ! On joue au ballon !', en: 'Awesome! Playing with the ball!' }
            },
            distractor: { icon: '🧽', short: { fr: 'une éponge', en: 'a sponge' } }
        },
        {
            id: 'strawberry',
            wanted: {
                icon: '🍓',
                short: { fr: 'une fraise', en: 'a strawberry' },
                fullPhrase: { fr: 'Je veux une fraise !', en: 'I want a strawberry!' },
                animalOffer: { fr: 'Tu veux une fraise ou un bouton ?', en: 'Do you want a strawberry or a button?' },
                enjoyMsg: { fr: 'Miam, une bonne fraise sucrée !', en: 'Yum, a sweet strawberry!' }
            },
            distractor: { icon: '🔘', short: { fr: 'un bouton', en: 'a button' } }
        }
    ];

    const CORE_PHRASES = [
        { id: 'bonjour',  css: 'card-bonjour',  icon: '👋', text: { fr: 'Bonjour !',    en: 'Hello!' } },
        { id: 'jeveux',   css: 'card-jeveux',   icon: '🙋', text: { fr: 'Je veux...',   en: 'I want...' } },
        { id: 'merci',    css: 'card-merci',    icon: '🙏', text: { fr: 'Merci !',      en: 'Thank you!' } },
        { id: 'aurevoir', css: 'card-aurevoir', icon: '👋', text: { fr: 'Au revoir !',  en: 'Goodbye!' } }
    ];

    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentAnimalIdx = 0;
    let currentDemand = null;
    let lastDemandId = null;

    // Story Act: 0 = Greeting (Bonjour), 1 = Demand (Je veux...), 2 = Gratitude (Merci), 3 = Farewell (Au revoir), 4 = Finale
    let storyAct = 0;
    let isAnimating = false;
    let sentenceTokens = [];
    let sceneVisual = {
        animalX: 430,
        waveAngle: 0,
        animalBubble: '',
        boyBubble: '',
        showTray: false,
        kidHasItem: false,
        effectProgress: 0
    };
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function speak(text, pitch = 1.0) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
            utter.rate = 0.92;
            utter.pitch = pitch;
            window.speechSynthesis.speak(utter);
        } catch (e) {}
    }

    function playHappyChime() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;
            [523.25, 659.25, 783.99].forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now + i * 0.09);
                gain.gain.setValueAtTime(0.18, now + i * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.28);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.09);
                osc.stop(now + i * 0.09 + 0.3);
            });
        } catch (e) {}
    }

    function renderAnimalPills() {
        const nav = document.getElementById('animal-pills');
        if (!nav) return;
        nav.innerHTML = '';
        ANIMAL_FRIENDS.forEach((an, idx) => {
            const btn = document.createElement('button');
            btn.className = 'routine-pill' + (idx === currentAnimalIdx ? ' active' : '');
            btn.innerText = `${an.icon} ${an.name[lang]}`;
            btn.onclick = () => startStory(idx);
            nav.appendChild(btn);
        });
    }

    function startStory(animalIdx = currentAnimalIdx) {
        currentAnimalIdx = animalIdx;
        storyAct = 0;
        isAnimating = true;
        sentenceTokens = [];

        // Pick a motivating demand scenario (avoid repeating twice in a row)
        const pool = DEMAND_SCENARIOS.filter(d => d.id !== lastDemandId);
        currentDemand = pool[Math.floor(Math.random() * pool.length)];
        lastDemandId = currentDemand.id;

        sceneVisual = {
            animalX: 500,
            waveAngle: 0,
            animalBubble: '',
            boyBubble: '',
            showTray: false,
            kidHasItem: false,
            effectProgress: 0
        };

        renderAnimalPills();
        renderStepsBar();
        renderSentenceStrip();
        renderChoiceCards();
        drawStage();

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`comm_${currentDemand.id}_act0`);
        }

        // Animate animal walking onto the stage and waving Hello!
        const animal = ANIMAL_FRIENDS[currentAnimalIdx];
        const startTime = performance.now();
        const duration = 850;

        function enterFrame(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const ease = 1 - Math.pow(1 - t, 3);
            sceneVisual.animalX = 500 - 115 * ease;
            sceneVisual.waveAngle = Math.sin(t * Math.PI * 5) * 28;
            drawStage();

            if (t < 1) {
                requestAnimationFrame(enterFrame);
            } else {
                sceneVisual.waveAngle = 15;
                sceneVisual.animalBubble = lang === 'fr' ? 'Bonjour ! 👋' : 'Hello! 👋';
                drawStage();
                isAnimating = false;
                updatePrompt(false);
                speak(lang === 'fr' ? 'Bonjour !' : 'Hello!', 1.12);
            }
        }
        requestAnimationFrame(enterFrame);
    }

    function renderStepsBar() {
        const labels = lang === 'fr'
            ? ['1. Bonjour', '2. Je veux...', '3. Merci', '4. Au revoir']
            : ['1. Hello', '2. I want...', '3. Thank you', '4. Goodbye'];

        const bar = document.getElementById('story-steps-bar');
        if (!bar) return;
        bar.innerHTML = labels.map((lbl, idx) => {
            let cls = 'story-step-chip';
            if (idx < storyAct) cls += ' done';
            else if (idx === storyAct) cls += ' active';
            return `<span class="${cls}">${lbl}</span>`;
        }).join('');
    }

    function renderSentenceStrip() {
        const strip = document.getElementById('sentence-strip');
        if (!strip) return;
        if (sentenceTokens.length === 0) {
            strip.innerHTML = `<span style="color:#94A3B8; font-weight:800;">${
                lang === 'fr' ? '💬 Choisis une carte pour parler...' : '💬 Tap a card to speak...'
            }</span>`;
            return;
        }
        strip.innerHTML = sentenceTokens
            .map(tok => `<span class="sentence-token"><span>${tok.icon}</span><span>${tok.label}</span></span>`)
            .join('<span style="font-weight:800; color:#3B82F6; font-size:1.2rem;">+</span>');
    }

    function getPromptText() {
        if (storyAct === 0) {
            return lang === 'fr' ? '« Bonjour ! » 👋' : '"Hello!" 👋';
        }
        if (storyAct === 1) {
            return currentDemand.wanted.animalOffer[lang];
        }
        if (storyAct === 2) {
            return lang === 'fr' ? '« Tiens, voilà ! » 😊' : '"Here you go!" 😊';
        }
        if (storyAct === 3) {
            return lang === 'fr' ? '« Au revoir ! » 👋' : '"Goodbye!" 👋';
        }
        return lang === 'fr' ? 'Bravo ! 🌟' : 'Great job! 🌟';
    }

    function updatePrompt(shouldSpeak = false) {
        const text = getPromptText();
        const lbl = document.getElementById('prompt-label');
        if (lbl) lbl.innerText = text;
        if (shouldSpeak) {
            if (storyAct === 0) speak(lang === 'fr' ? 'Bonjour !' : 'Hello!', 1.12);
            else if (storyAct === 1) speak(currentDemand.wanted.animalOffer[lang], 1.05);
            else if (storyAct === 2) speak(lang === 'fr' ? 'Tiens, voilà !' : 'Here you go!', 1.08);
            else if (storyAct === 3) speak(lang === 'fr' ? 'Au revoir !' : 'Goodbye!', 1.1);
        }
    }

    /* Render Either the 4 Phrase Cards (Acts 0, 2, 3) or the 2 Demand Objects (Act 1) */
    function renderChoiceCards() {
        const grid = document.getElementById('comm-cards');
        if (!grid) return;
        grid.innerHTML = '';
        if (storyAct > 3) return;

        if (storyAct === 1) {
            // Act 1: Choose between the motivating item and the silly distractor
            const options = [
                { isTarget: true,  icon: currentDemand.wanted.icon,     label: `${lang === 'fr' ? 'Je veux' : 'I want'} ${currentDemand.wanted.short[lang]}` },
                { isTarget: false, icon: currentDemand.distractor.icon, label: `${lang === 'fr' ? 'Je veux' : 'I want'} ${currentDemand.distractor.short[lang]}` }
            ].sort(() => Math.random() - 0.5);

            options.forEach(opt => {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'comm-card card-object';
                card.innerHTML = `<span class="comm-icon">${opt.icon}</span><span class="comm-text">${opt.label}</span>`;
                card.onclick = () => handleObjectDemand(opt.isTarget, card);
                grid.appendChild(card);
            });
            return;
        }

        // Acts 0, 2, 3: Choose from the 4 core communication phrases
        const expectedMap = { 0: 'bonjour', 2: 'merci', 3: 'aurevoir' };
        const expectedId = expectedMap[storyAct];

        CORE_PHRASES.forEach(phrase => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = `comm-card ${phrase.css}`;
            card.innerHTML = `<span class="comm-icon">${phrase.icon}</span><span class="comm-text">${phrase.text[lang]}</span>`;
            card.onclick = () => handlePhraseChoice(phrase, phrase.id === expectedId, card);
            grid.appendChild(card);
        });
    }

    function handlePhraseChoice(phrase, isExpected, cardEl) {
        if (isAnimating) return;

        if (!isExpected) {
            cardEl.classList.add('soft-dim');
            updatePrompt(true);
            if (window.AlpTracker) {
                window.AlpTracker.onAttempt();
            }
            return;
        }

        cardEl.classList.add('chosen-flash');
        playHappyChime();
        sentenceTokens = [{ icon: phrase.icon, label: phrase.text[lang] }];
        sceneVisual.boyBubble = `${phrase.text[lang]} ${phrase.icon}`;
        renderSentenceStrip();
        drawStage();
        speak(phrase.text[lang], 1.0);

        if (window.AlpTracker) {
            window.AlpTracker.onTrialSuccess(`comm_${currentDemand.id}_act${storyAct}`);
        }

        if (storyAct === 0) {
            // Transition to Act 1: Animal brings out tray with desired item & paperclip
            isAnimating = true;
            setTimeout(() => {
                storyAct = 1;
                sceneVisual.boyBubble = '';
                sceneVisual.showTray = true;
                sceneVisual.animalBubble = currentDemand.wanted.animalOffer[lang];
                sentenceTokens = [{ icon: '👦', label: lang === 'fr' ? 'Je veux...' : 'I want...' }];
                renderStepsBar();
                renderSentenceStrip();
                renderChoiceCards();
                drawStage();
                isAnimating = false;
                updatePrompt(true);
            }, 1250);
        } else if (storyAct === 2) {
            // Boy says "Merci !", animal pauses naturally, then responds "De rien !"
            isAnimating = true;
            setTimeout(() => {
                sceneVisual.animalBubble = lang === 'fr' ? 'De rien ! 😊' : "You're welcome! 😊";
                drawStage();
                speak(lang === 'fr' ? 'De rien !' : "You're welcome!", 1.12);

                setTimeout(() => {
                    storyAct = 3;
                    sceneVisual.boyBubble = '';
                    sceneVisual.animalBubble = lang === 'fr' ? 'Au revoir ! 👋' : 'Goodbye! 👋';
                    sceneVisual.waveAngle = 25;
                    sentenceTokens = [];
                    renderStepsBar();
                    renderSentenceStrip();
                    renderChoiceCards();
                    drawStage();
                    isAnimating = false;
                    updatePrompt(true);
                }, 1300);
            }, 1200);
        } else if (storyAct === 3) {
            // Finale: Animal waves and walks off happily
            isAnimating = true;
            storyAct = 4;
            renderStepsBar();
            renderChoiceCards();

            const startTime = performance.now();
            const duration = 1200;
            function exitFrame(now) {
                const t = Math.min(1, (now - startTime) / duration);
                sceneVisual.animalX = 385 + 145 * (t * t);
                sceneVisual.waveAngle = Math.sin(t * Math.PI * 6) * 30;
                sceneVisual.effectProgress = t;
                drawStage();

                if (t < 1) {
                    requestAnimationFrame(exitFrame);
                } else {
                    isAnimating = false;
                    setTimeout(() => startStory((currentAnimalIdx + 1) % ANIMAL_FRIENDS.length), 900);
                }
            }
            requestAnimationFrame(exitFrame);
        }
    }

    function handleObjectDemand(isTarget, cardEl) {
        if (isAnimating) return;

        if (!isTarget) {
            cardEl.classList.add('soft-dim');
            sceneVisual.animalBubble = `${currentDemand.distractor.icon} ?! 😅`;
            drawStage();
            speak(lang === 'fr' ? 'Non merci !' : 'No thanks!', 1.12);

            if (window.AlpTracker) {
                window.AlpTracker.onAttempt();
            }
            return;
        }

        // Child initiated the request! Build full sentence & animate item to the boy
        isAnimating = true;
        cardEl.classList.add('chosen-flash');
        playHappyChime();

        const fullDemandText = currentDemand.wanted.fullPhrase[lang];
        sentenceTokens = [
            { icon: '👦', label: lang === 'fr' ? 'Je veux' : 'I want' },
            { icon: currentDemand.wanted.icon, label: currentDemand.wanted.short[lang] }
        ];
        sceneVisual.boyBubble = `${fullDemandText} ${currentDemand.wanted.icon}`;
        sceneVisual.animalBubble = lang === 'fr' ? 'Tiens, voilà ! 😊' : 'Here you go! 😊';
        renderSentenceStrip();
        drawStage();
        speak(fullDemandText, 1.0);

        if (window.AlpTracker) {
            window.AlpTracker.onTrialSuccess(`comm_${currentDemand.id}_act1`);
        }

        // Animate item transfer + fun celebration
        setTimeout(() => {
            sceneVisual.showTray = false;
            sceneVisual.kidHasItem = true;
            const startTime = performance.now();
            const duration = 1200;

            function enjoyFrame(now) {
                const t = Math.min(1, (now - startTime) / duration);
                sceneVisual.effectProgress = t;
                drawStage();

                if (t < 1) {
                    requestAnimationFrame(enjoyFrame);
                } else {
                    storyAct = 2;
                    sceneVisual.boyBubble = '';
                    sceneVisual.animalBubble = lang === 'fr' ? 'Tiens, voilà ! 😊' : 'Here you go! 😊';
                    sentenceTokens = [];
                    renderStepsBar();
                    renderSentenceStrip();
                    renderChoiceCards();
                    drawStage();
                    isAnimating = false;
                    updatePrompt(true);
                }
            }
            requestAnimationFrame(enjoyFrame);
        }, 1300);
    }

    /* ============================================================================
       SVG MINI-FILM RENDERER
       ============================================================================ */

    function getAnimalCharacterSVG(id) {
        if (id === 'panda') {
            return `
                <!-- Panda Ears -->
                <circle cx="-26" cy="-42" r="13" fill="#2D3748"/>
                <circle cx="26" cy="-42" r="13" fill="#2D3748"/>
                <!-- Body & Head -->
                <ellipse cx="0" cy="28" rx="34" ry="42" fill="#FFFFFF" stroke="#2D3748" stroke-width="3"/>
                <ellipse cx="0" cy="28" rx="22" ry="26" fill="#EDF2F7"/>
                <circle cx="0" cy="-18" r="32" fill="#FFFFFF" stroke="#2D3748" stroke-width="3"/>
                <!-- Eye Patches & Eyes -->
                <ellipse cx="-12" cy="-20" rx="9" ry="7" transform="rotate(-15 -12 -20)" fill="#2D3748"/>
                <ellipse cx="12" cy="-20" rx="9" ry="7" transform="rotate(15 12 -20)" fill="#2D3748"/>
                <circle cx="-11" cy="-20" r="3" fill="#FFFFFF"/>
                <circle cx="11" cy="-20" r="3" fill="#FFFFFF"/>
                <ellipse cx="0" cy="-10" rx="6" ry="4" fill="#2D3748"/>
                <path d="M-7,-3 Q0,4 7,-3" stroke="#2D3748" stroke-width="3" fill="none" stroke-linecap="round"/>
                <!-- Waving Left Arm -->
                <g transform="translate(-30, 10) rotate(${sceneVisual.waveAngle})">
                    <rect x="-26" y="-8" width="28" height="16" rx="8" fill="#2D3748"/>
                </g>
            `;
        }
        if (id === 'bear') {
            return `
                <circle cx="-25" cy="-42" r="12" fill="#975A16"/>
                <circle cx="25" cy="-42" r="12" fill="#975A16"/>
                <ellipse cx="0" cy="28" rx="35" ry="42" fill="#B7791F" stroke="#744210" stroke-width="3"/>
                <ellipse cx="0" cy="30" rx="20" ry="25" fill="#F6E05E" opacity="0.65"/>
                <circle cx="0" cy="-18" r="32" fill="#B7791F" stroke="#744210" stroke-width="3"/>
                <ellipse cx="0" cy="-10" rx="14" ry="11" fill="#FBD38D"/>
                <circle cx="-11" cy="-22" r="3.5" fill="#2D3748"/>
                <circle cx="11" cy="-22" r="3.5" fill="#2D3748"/>
                <ellipse cx="0" cy="-13" rx="5" ry="3.5" fill="#2D3748"/>
                <path d="M-6,-6 Q0,1 6,-6" stroke="#2D3748" stroke-width="3" fill="none" stroke-linecap="round"/>
                <g transform="translate(-30, 10) rotate(${sceneVisual.waveAngle})">
                    <rect x="-26" y="-8" width="28" height="16" rx="8" fill="#975A16"/>
                </g>
            `;
        }
        if (id === 'fox') {
            return `
                <polygon points="-30,-32 -18,-62 -4,-38" fill="#DD6B20" stroke="#9C4221" stroke-width="3"/>
                <polygon points="30,-32 18,-62 4,-38" fill="#DD6B20" stroke="#9C4221" stroke-width="3"/>
                <ellipse cx="0" cy="28" rx="32" ry="42" fill="#ED8936" stroke="#9C4221" stroke-width="3"/>
                <circle cx="0" cy="-18" r="31" fill="#ED8936" stroke="#9C4221" stroke-width="3"/>
                <path d="M-28,-12 Q0,6 28,-12 Q18,12 0,12 Q-18,12 -28,-12 Z" fill="#FFFFFF"/>
                <circle cx="-11" cy="-22" r="3.5" fill="#2D3748"/>
                <circle cx="11" cy="-22" r="3.5" fill="#2D3748"/>
                <circle cx="0" cy="-10" r="4.5" fill="#2D3748"/>
                <g transform="translate(-28, 10) rotate(${sceneVisual.waveAngle})">
                    <rect x="-26" y="-8" width="28" height="16" rx="8" fill="#DD6B20"/>
                </g>
            `;
        }
        // Rabbit
        return `
            <ellipse cx="-14" cy="-64" rx="9" ry="26" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="3"/>
            <ellipse cx="14" cy="-64" rx="9" ry="26" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="3"/>
            <ellipse cx="-14" cy="-64" rx="4" ry="18" fill="#FBB6CE"/>
            <ellipse cx="14" cy="-64" rx="4" ry="18" fill="#FBB6CE"/>
            <ellipse cx="0" cy="28" rx="32" ry="42" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="3"/>
            <circle cx="0" cy="-18" r="30" fill="#FFFFFF" stroke="#CBD5E0" stroke-width="3"/>
            <circle cx="-11" cy="-21" r="3.5" fill="#2D3748"/>
            <circle cx="11" cy="-21" r="3.5" fill="#2D3748"/>
            <ellipse cx="0" cy="-12" rx="5" ry="3.5" fill="#F687B3"/>
            <path d="M-6,-5 Q0,2 6,-5" stroke="#2D3748" stroke-width="3" fill="none" stroke-linecap="round"/>
            <g transform="translate(-28, 10) rotate(${sceneVisual.waveAngle})">
                <rect x="-26" y="-8" width="28" height="16" rx="8" fill="#EDF2F7" stroke="#CBD5E0" stroke-width="2"/>
            </g>
        `;
    }

    function drawStage() {
        const svg = document.getElementById('film-svg');
        if (!svg) return;
        const animal = ANIMAL_FRIENDS[currentAnimalIdx];

        // Speech Bubbles
        const boySpeech = sceneVisual.boyBubble ? `
            <g transform="translate(35, 22)">
                <rect x="0" y="0" width="215" height="44" rx="16" fill="#EBF8FF" stroke="#3B82F6" stroke-width="3"/>
                <polygon points="85,44 100,44 92,56" fill="#3B82F6"/>
                <text x="107" y="28" font-size="16" font-weight="bold" fill="#1D4ED8" text-anchor="middle">${sceneVisual.boyBubble}</text>
            </g>
        ` : '';

        const animalSpeech = sceneVisual.animalBubble ? `
            <g transform="translate(260, 22)">
                <rect x="0" y="0" width="255" height="44" rx="16" fill="#FFFBEB" stroke="#F59E0B" stroke-width="3"/>
                <polygon points="120,44 135,44 128,56" fill="#F59E0B"/>
                <text x="127" y="28" font-size="14" font-weight="bold" fill="#92400E" text-anchor="middle">${sceneVisual.animalBubble}</text>
            </g>
        ` : '';

        // Tray with 2 items during Act 1
        const traySvg = sceneVisual.showTray ? `
            <g transform="translate(235, 195)">
                <rect x="-48" y="26" width="96" height="12" rx="6" fill="#B45309"/>
                <text x="-22" y="18" font-size="36" text-anchor="middle">${currentDemand.wanted.icon}</text>
                <text x="24" y="18" font-size="34" text-anchor="middle">${currentDemand.distractor.icon}</text>
            </g>
        ` : '';

        // Kid holding & enjoying the requested item in Acts 2 & 3
        let kidItemSvg = '';
        if (sceneVisual.kidHasItem) {
            const p = sceneVisual.effectProgress;
            const bobY = Math.sin(p * Math.PI * 4) * 5;
            kidItemSvg = `<text x="182" y="${(195 - bobY).toFixed(1)}" font-size="40" text-anchor="middle">${currentDemand.wanted.icon}</text>`;

            if (currentDemand.id === 'bubbles') {
                kidItemSvg += `
                    <text x="${(195 + p * 70).toFixed(1)}" y="${(165 - p * 85).toFixed(1)}" font-size="28">🫧</text>
                    <text x="${(165 + p * 40).toFixed(1)}" y="${(150 - p * 105).toFixed(1)}" font-size="24">🫧</text>
                    <text x="${(215 + p * 90).toFixed(1)}" y="${(180 - p * 65).toFixed(1)}" font-size="22">🫧</text>
                `;
            } else {
                kidItemSvg += `<text x="182" y="${(148 - p * 35).toFixed(1)}" font-size="24" text-anchor="middle">✨</text>`;
            }
        }

        // Finale stars when saying Au revoir
        const finaleStars = storyAct === 4 ? `
            <text x="270" y="${(110 - sceneVisual.effectProgress * 45).toFixed(1)}" font-size="36" text-anchor="middle">🌟</text>
            <text x="225" y="${(130 - sceneVisual.effectProgress * 35).toFixed(1)}" font-size="28">⭐</text>
            <text x="315" y="${(130 - sceneVisual.effectProgress * 35).toFixed(1)}" font-size="28">⭐</text>
        ` : '';

        svg.innerHTML = `
            <!-- Sunny Park Backdrop -->
            <rect width="540" height="300" fill="#EBF8FF"/>
            <circle cx="65" cy="48" r="22" fill="#FDE047"/>
            <rect x="0" y="242" width="540" height="58" fill="#86EFAC"/>

            <!-- Boy Character on the Left -->
            <g transform="translate(130, 178)">
                <rect x="-24" y="8" width="48" height="58" rx="14" fill="#3B82F6"/>
                <circle cx="0" cy="-24" r="26" fill="#FDE68A"/>
                <path d="M-26,-28 Q0,-58 26,-28" fill="#B45309"/>
                <circle cx="-9" cy="-25" r="3" fill="#1E293B"/>
                <circle cx="9" cy="-25" r="3" fill="#1E293B"/>
                <path d="M-8,-14 Q0,-6 8,-14" stroke="#1E293B" stroke-width="3" fill="none" stroke-linecap="round"/>
            </g>

            <!-- Animal Friend on the Right -->
            <g transform="translate(${sceneVisual.animalX.toFixed(1)}, 176)">
                ${getAnimalCharacterSVG(animal.id)}
            </g>

            ${traySvg}
            ${kidItemSvg}
            ${boySpeech}
            ${animalSpeech}
            ${finaleStars}
        `;
    }

    function setupControls() {
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
                if (title) title.innerText = lang === 'fr' ? '💬 Langage & Communication' : '💬 Language & Communication';

                startStory(currentAnimalIdx);
            };
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupControls();
            startStory(0);
        });
    } else {
        setupControls();
        startStory(0);
    }
})();
