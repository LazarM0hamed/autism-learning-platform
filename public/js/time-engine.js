// Time & Calendar Engine
// Autism Learning Platform - Concrete Day Moments, Maternelle Visual Schedule Anchors & Chronological Week Order.

(() => {
    'use strict';

    const DAY_MOMENTS = [
        { id: 'morning', img: 'assets/photos/time-morning.svg', fallback: '🌅', label: { fr: 'Le Matin', en: 'Morning' } },
        { id: 'afternoon', img: 'assets/photos/time-afternoon.svg', fallback: '☀️', label: { fr: "L'Après-midi", en: 'Afternoon' } },
        { id: 'evening', img: 'assets/photos/time-evening.svg', fallback: '🌇', label: { fr: 'Le Soir', en: 'Evening' } },
        { id: 'night', img: 'assets/photos/time-night.svg', fallback: '🌙', label: { fr: 'La Nuit', en: 'Night' } }
    ];

    const MOMENT_QUESTIONS = [
        { target: 'morning', prompt: { fr: "Quand est-ce qu'on se réveille dans son lit et qu'on prend le petit-déjeuner ?", en: "When do we wake up in bed and eat breakfast?" } },
        { target: 'afternoon', prompt: { fr: "Quand est-ce qu'on joue dehors au parc sous le grand soleil ?", en: "When do we play outside in the sunny park?" } },
        { target: 'evening', prompt: { fr: "Quand est-ce qu'on met son pyjama et qu'on lit une histoire ?", en: "When do we put on pajamas and read a bedtime story?" } },
        { target: 'night', prompt: { fr: "Quand est-ce qu'on dort dans son lit sous la lune et les étoiles ?", en: "When do we sleep peacefully under the moon and stars?" } }
    ];

    const DAYS_OF_WEEK = [
        { id: 'lundi', type: 'school', icon: '🏫', name: { fr: 'Lundi', en: 'Monday' }, ctx: { fr: 'École', en: 'School' } },
        { id: 'mardi', type: 'school', icon: '🏫', name: { fr: 'Mardi', en: 'Tuesday' }, ctx: { fr: 'École', en: 'School' } },
        { id: 'mercredi', type: 'activity', icon: '⚽', name: { fr: 'Mercredi', en: 'Wednesday' }, ctx: { fr: 'Parc / Jeux', en: 'Park / Play' } },
        { id: 'jeudi', type: 'school', icon: '🏫', name: { fr: 'Jeudi', en: 'Thursday' }, ctx: { fr: 'École', en: 'School' } },
        { id: 'vendredi', type: 'school', icon: '🏫', name: { fr: 'Vendredi', en: 'Friday' }, ctx: { fr: 'École', en: 'School' } },
        { id: 'samedi', type: 'weekend', icon: '🏡', name: { fr: 'Samedi', en: 'Saturday' }, ctx: { fr: 'Week-end', en: 'Weekend' } },
        { id: 'dimanche', type: 'weekend', icon: '🏡', name: { fr: 'Dimanche', en: 'Sunday' }, ctx: { fr: 'Week-end', en: 'Weekend' } }
    ];

    let currentMode = 'phases'; // 'phases' | 'days' | 'order'
    let currentQuestion = null;
    let orderIndex = 0;
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'fr';

    const uiStrings = {
        en: {
            title: "☀️ Time & Calendar",
            home: "⬅️ Home",
            modePhases: "☀️ Day Moments",
            modeDays: "📅 Days (Mon–Sun)",
            modeOrder: "🚂 Order the Week",
            orderPromptPrefix: "Place day",
            orderComplete: "Great job! The whole week is in order! 🌟"
        },
        fr: {
            title: "☀️ Le temps & les moments",
            home: "⬅️ Accueil",
            modePhases: "☀️ Moments du jour",
            modeDays: "📅 Jours (Lundi–Dimanche)",
            modeOrder: "🚂 L'ordre de la semaine",
            orderPromptPrefix: "Place le jour",
            orderComplete: "Bravo ! Toute la semaine est dans l'ordre ! 🌟"
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

    function playGentleSuccessSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
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

    function playSoftNudgeSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    function speakText(text) {
        if (!soundEnabled || !('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = currentLang === 'fr' ? 'fr-FR' : 'en-US';
            utterance.rate = 0.92;
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

        const phasesBtn = document.getElementById('mode-phases-btn');
        if (phasesBtn) phasesBtn.innerText = t.modePhases;

        const daysBtn = document.getElementById('mode-days-btn');
        if (daysBtn) daysBtn.innerText = t.modeDays;

        const orderBtn = document.getElementById('mode-order-btn');
        if (orderBtn) orderBtn.innerText = t.modeOrder;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

        startCurrentMode();
    }

    function setupControls() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => {
                const selected = btn.getAttribute('data-lang');
                if (selected === currentLang) return;
                currentLang = selected;
                localStorage.setItem('alp_lang', currentLang);
                updateUIStaticText();
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

        document.getElementById('mode-phases-btn')?.addEventListener('click', () => switchMode('phases'));
        document.getElementById('mode-days-btn')?.addEventListener('click', () => switchMode('days'));
        document.getElementById('mode-order-btn')?.addEventListener('click', () => switchMode('order'));
    }

    function switchMode(newMode) {
        if (currentMode === newMode && !isTransitioning) return;
        currentMode = newMode;

        document.getElementById('mode-phases-btn')?.classList.toggle('active', currentMode === 'phases');
        document.getElementById('mode-days-btn')?.classList.toggle('active', currentMode === 'days');
        document.getElementById('mode-order-btn')?.classList.toggle('active', currentMode === 'order');

        startCurrentMode();
    }

    function startCurrentMode() {
        isTransitioning = false;
        if (currentMode === 'phases') loadPhasesMode();
        else if (currentMode === 'days') loadDaysMode();
        else loadOrderMode();
    }

    /* ---------------- MODE 1: MOMENTS DU JOUR ---------------- */
    function loadPhasesMode() {
        isTransitioning = false;
        currentQuestion = MOMENT_QUESTIONS[Math.floor(Math.random() * MOMENT_QUESTIONS.length)];
        const promptText = currentQuestion.prompt[currentLang] || currentQuestion.prompt.fr;

        const promptElem = document.getElementById('prompt-label');
        if (promptElem) promptElem.innerText = promptText;
        speakText(promptText);

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`time_phases_${currentQuestion.target}`);
        }

        // Horizontal Visual Day Arc
        const anchor = document.getElementById('visual-context-anchor');
        if (anchor) {
            anchor.innerHTML = `
                <div class="day-arc-bar" role="region" aria-label="Day cycle progression">
                    ${DAY_MOMENTS.map((m, i) => `
                        <span class="arc-step" id="arc-${m.id}">${m.fallback} ${m.label[currentLang] || m.label.fr}</span>
                        ${i < DAY_MOMENTS.length - 1 ? '<span style="color:#94A3B8;">➡️</span>' : ''}
                    `).join('')}
                </div>
            `;
        }

        const grid = document.getElementById('options-container');
        if (!grid) return;
        grid.innerHTML = '';

        DAY_MOMENTS.forEach(moment => {
            const card = document.createElement('div');
            card.className = 'moment-card';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            const momentLabel = moment.label[currentLang] || moment.label.fr;
            card.setAttribute('aria-label', momentLabel);

            const img = document.createElement('img');
            img.src = moment.img;
            img.alt = momentLabel;
            img.className = 'moment-img';
            img.onerror = () => {
                img.style.display = 'none';
            };
            card.appendChild(img);

            const lbl = document.createElement('div');
            lbl.className = 'moment-label';
            lbl.innerText = momentLabel;
            card.appendChild(lbl);

            card.onclick = () => {
                if (isTransitioning) return;
                speakText(momentLabel);

                if (moment.id === currentQuestion.target) {
                    isTransitioning = true;
                    playGentleSuccessSound();
                    card.classList.add('correct');
                    document.getElementById(`arc-${moment.id}`)?.classList.add('highlight');

                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, moment.id);
                        window.AlpTracker.onTrialSuccess(`time_phases_${currentQuestion.target}`);
                    }

                    setTimeout(() => {
                        loadPhasesMode();
                    }, 1700);
                } else {
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, moment.id);
                    }
                    card.classList.remove('gentle-retry');
                    void card.offsetWidth;
                    card.classList.add('gentle-retry');
                    playSoftNudgeSound();
                }
            };

            grid.appendChild(card);
        });
    }

    /* ---------------- MODE 2: JOURS DE LA SEMAINE ---------------- */
    function loadDaysMode() {
        isTransitioning = false;
        const anchor = document.getElementById('visual-context-anchor');
        if (anchor) {
            anchor.innerHTML = `<div class="week-strip" id="reference-week-strip" role="region" aria-label="Weekly visual schedule"></div>`;
            const strip = document.getElementById('reference-week-strip');
            DAYS_OF_WEEK.forEach(d => {
                const badge = document.createElement('div');
                badge.className = `day-badge ${d.type}`;
                const dayName = d.name[currentLang] || d.name.fr;
                const dayCtx = d.ctx[currentLang] || d.ctx.fr;
                badge.setAttribute('tabindex', '0');
                badge.setAttribute('role', 'button');
                badge.setAttribute('aria-label', `${dayName}, ${dayCtx}`);
                badge.innerHTML = `<span class="day-icon">${d.icon}</span><span class="day-name">${dayName}</span><span class="day-context">${dayCtx}</span>`;
                badge.onclick = () => speakText(`${dayName}, ${dayCtx}`);
                strip.appendChild(badge);
            });
        }

        // Pick a contextual question (either next day or find day)
        const idx = Math.floor(Math.random() * 6);
        const askNext = Math.random() > 0.5;
        const targetDay = askNext ? DAYS_OF_WEEK[idx + 1] : DAYS_OF_WEEK[idx];
        const dayA = DAYS_OF_WEEK[idx].name[currentLang] || DAYS_OF_WEEK[idx].name.fr;
        const targetName = targetDay.name[currentLang] || targetDay.name.fr;
        const targetCtx = targetDay.ctx[currentLang] || targetDay.ctx.fr;

        const promptText = askNext
            ? (currentLang === 'fr' ? `Quel jour vient juste après ${dayA} ?` : `Which day comes right after ${dayA}?`)
            : (currentLang === 'fr' ? `Touche ${targetName} (${targetCtx})` : `Tap ${targetName} (${targetCtx})`);

        currentQuestion = { target: targetDay.id, prompt: promptText };

        const promptElem = document.getElementById('prompt-label');
        if (promptElem) promptElem.innerText = promptText;
        speakText(promptText);

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`time_days_${targetDay.id}`);
        }

        // 3 Choices (1 target + 2 distractors)
        const distractors = DAYS_OF_WEEK.filter(d => d.id !== targetDay.id).sort(() => 0.5 - Math.random()).slice(0, 2);
        const choices = [targetDay, ...distractors].sort(() => 0.5 - Math.random());

        const grid = document.getElementById('options-container');
        if (!grid) return;
        grid.innerHTML = '';

        choices.forEach(day => {
            const card = document.createElement('div');
            card.className = `day-badge ${day.type}`;
            card.style.width = 'clamp(140px, 22vw, 175px)';
            card.style.padding = '18px 10px';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            const dName = day.name[currentLang] || day.name.fr;
            const dCtx = day.ctx[currentLang] || day.ctx.fr;
            card.setAttribute('aria-label', `${dName}, ${dCtx}`);

            card.innerHTML = `
                <span class="day-icon" style="font-size:2.4rem;">${day.icon}</span>
                <span class="day-name" style="font-size:1.25rem;">${dName}</span>
                <span class="day-context" style="font-size:0.95rem;">${dCtx}</span>
            `;

            card.onclick = () => {
                if (isTransitioning) return;
                speakText(dName);

                if (day.id === targetDay.id) {
                    isTransitioning = true;
                    playGentleSuccessSound();
                    card.style.borderColor = '#34D399';
                    card.style.background = '#ECFDF5';

                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, day.id);
                        window.AlpTracker.onTrialSuccess(`time_days_${targetDay.id}`);
                    }

                    setTimeout(() => {
                        loadDaysMode();
                    }, 1500);
                } else {
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, day.id);
                    }
                    card.classList.remove('gentle-retry');
                    void card.offsetWidth;
                    card.classList.add('gentle-retry');
                    playSoftNudgeSound();
                }
            };

            grid.appendChild(card);
        });
    }

    /* ---------------- MODE 3: L'ORDRE DE LA SEMAINE ---------------- */
    function loadOrderMode() {
        orderIndex = 0;
        isTransitioning = false;
        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart('time_order_week');
        }
        renderOrderBoard(true);
    }

    function renderOrderBoard(shouldSpeak = false) {
        const t = uiStrings[currentLang] || uiStrings.fr;
        const promptText = orderIndex < DAYS_OF_WEEK.length
            ? `${t.orderPromptPrefix} ${orderIndex + 1} (${DAYS_OF_WEEK[orderIndex].name[currentLang] || DAYS_OF_WEEK[orderIndex].name.fr})`
            : t.orderComplete;

        const promptElem = document.getElementById('prompt-label');
        if (promptElem) promptElem.innerText = promptText;
        if (shouldSpeak) speakText(promptText);

        const anchor = document.getElementById('visual-context-anchor');
        if (anchor) {
            anchor.innerHTML = `<div class="week-strip" id="order-slots" role="region" aria-label="Chronological week slots"></div>`;
            const slots = document.getElementById('order-slots');

            DAYS_OF_WEEK.forEach((d, idx) => {
                const slot = document.createElement('div');
                const dName = d.name[currentLang] || d.name.fr;
                const dCtx = d.ctx[currentLang] || d.ctx.fr;

                if (idx < orderIndex) {
                    slot.className = `day-badge ${d.type}`;
                    slot.innerHTML = `<span class="day-icon">${d.icon}</span><span class="day-name">${d.name[currentLang] || d.name.fr}</span><span class="day-context">${dCtx}</span>`;
                } else {
                    slot.className = 'day-badge empty-slot' + (idx === orderIndex ? ' target-slot' : '');
                    slot.innerHTML = `<span class="day-name" style="color:#64748B; font-size:1.4rem;">${idx + 1}</span>`;
                }
                slots.appendChild(slot);
            });
        }

        const grid = document.getElementById('options-container');
        if (!grid) return;
        grid.innerHTML = '';

        if (orderIndex >= DAYS_OF_WEEK.length) {
            isTransitioning = true;
            playGentleSuccessSound();
            if (window.AlpTracker) {
                window.AlpTracker.onTrialSuccess('time_order_week');
            }
            setTimeout(() => {
                orderIndex = 0;
                renderOrderBoard(true);
            }, 3000);
            return;
        }

        const remaining = DAYS_OF_WEEK.slice(orderIndex).sort(() => 0.5 - Math.random());
        remaining.forEach(day => {
            const card = document.createElement('div');
            card.className = `day-badge ${day.type}`;
            card.style.width = 'clamp(118px, 18vw, 145px)';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            const dName = day.name[currentLang] || day.name.fr;
            const dCtx = day.ctx[currentLang] || day.ctx.fr;
            card.setAttribute('aria-label', `${dName}, ${dCtx}`);

            card.innerHTML = `
                <span class="day-icon">${day.icon}</span>
                <span class="day-name">${dName}</span>
                <span class="day-context">${dCtx}</span>
            `;

            card.onclick = () => {
                if (isTransitioning) return;
                speakText(dName);

                if (day.id === DAYS_OF_WEEK[orderIndex].id) {
                    orderIndex++;
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, day.id);
                    }
                    setTimeout(() => renderOrderBoard(true), 400);
                } else {
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, day.id);
                    }
                    card.classList.remove('gentle-retry');
                    void card.offsetWidth;
                    card.classList.add('gentle-retry');
                    playSoftNudgeSound();
                }
            };

            grid.appendChild(card);
        });
    }

    function speakCurrentPrompt() {
        const promptElem = document.getElementById('prompt-label');
        if (promptElem) speakText(promptElem.innerText);
    }

    function init() {
        setupControls();
        updateUIStaticText();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
