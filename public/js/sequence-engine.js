// Routine Scene & Step Sequencing Engine
// Autism Learning Platform - Concrete Task Analysis with Story Goals, Directional Arrows & 3-Step Scaffolding.

(() => {
    'use strict';

    let routines = [];
    let currentRoutineIndex = 0;
    let easyMode = true; // 3 steps (D'abord / Ensuite / Enfin) by default for low cognitive load
    let activeSteps = [];
    let currentStepIndex = 0; // 0-based index of next required step in activeSteps
    let placedStepNumbers = [];
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'fr';

    const uiStrings = {
        en: {
            title: "🦷 Routine Steps",
            home: "⬅️ Home",
            easyBtn: "⭐ 3 Steps (First / Next / Last)",
            fullBtn: "🌟 All Steps",
            stepPrompt: "What is step",
            complete: "Great job! You completed the routine! 🌟",
            cues: [
                "First: what do we do first?",
                "Next: what happens next?",
                "Last: what is the final step?"
            ]
        },
        fr: {
            title: "🦷 Étapes du quotidien",
            home: "⬅️ Accueil",
            easyBtn: "⭐ 3 Étapes (D'abord / Ensuite / Enfin)",
            fullBtn: "🌟 Toutes les étapes",
            stepPrompt: "Quelle est l'étape",
            complete: "Bravo ! Tu as réussi toute la suite ! 🌟",
            cues: [
                "D'abord : que fait-on en premier ?",
                "Ensuite : que fait-on après ?",
                "Enfin : quelle est la dernière étape ?"
            ]
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

    function playStepPlacedSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
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

    function getLabel(obj) {
        if (!obj) return '';
        if (typeof obj === 'object') {
            return obj[currentLang] || obj.en || obj.fr || '';
        }
        return obj || '';
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

        const diffEasy = document.getElementById('diff-easy-btn');
        if (diffEasy) diffEasy.innerText = t.easyBtn;

        const diffFull = document.getElementById('diff-full-btn');
        if (diffFull) diffFull.innerText = t.fullBtn;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

        renderPills();
        updateStoryGoal();
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
                startRoutine();
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

        const easyBtn = document.getElementById('diff-easy-btn');
        const fullBtn = document.getElementById('diff-full-btn');

        if (easyBtn) {
            easyBtn.onclick = () => {
                if (easyMode) return;
                easyMode = true;
                easyBtn.classList.add('active');
                fullBtn?.classList.remove('active');
                startRoutine();
            };
        }

        if (fullBtn) {
            fullBtn.onclick = () => {
                if (!easyMode) return;
                easyMode = false;
                fullBtn.classList.add('active');
                easyBtn?.classList.remove('active');
                startRoutine();
            };
        }
    }

    function init() {
        setupControls();
        updateUIStaticText();

        fetch('data/sequences.json')
            .then(res => res.json())
            .then(data => {
                routines = data.routines || [];
                if (routines.length > 0) {
                    currentRoutineIndex = 0;
                    renderPills();
                    startRoutine();
                }
            })
            .catch(err => console.error(err));
    }

    function renderPills() {
        const pillsContainer = document.getElementById('routine-pills');
        if (!pillsContainer) return;
        pillsContainer.innerHTML = '';

        routines.forEach((routine, idx) => {
            const pill = document.createElement('button');
            pill.className = `routine-pill ${idx === currentRoutineIndex ? 'active' : ''}`;
            pill.innerText = `${routine.emoji || '✨'} ${getLabel(routine.title)}`;

            pill.onclick = () => {
                if (idx === currentRoutineIndex) return;
                currentRoutineIndex = idx;
                renderPills();
                startRoutine();
            };

            pillsContainer.appendChild(pill);
        });
    }

    function startRoutine() {
        const routine = routines[currentRoutineIndex];
        if (!routine) return;

        currentStepIndex = 0;
        placedStepNumbers = [];
        isTransitioning = false;

        // In 3-step mode, pick first, middle, and last step so the sequence makes sense without working memory overload
        if (easyMode && routine.steps.length > 3) {
            const s = routine.steps;
            activeSteps = [s[0], s[Math.floor(s.length / 2)], s[s.length - 1]];
        } else {
            activeSteps = [...routine.steps];
        }

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`sequence_${routine.id}_${easyMode ? 'easy' : 'full'}`);
        }

        updateStoryGoal();
        updatePrompt();
        renderTimelineSlots();
        renderChoices();
        speakCurrentPrompt();
    }

    function updateStoryGoal() {
        const routine = routines[currentRoutineIndex];
        if (!routine) return;

        const goalIcon = document.getElementById('goal-icon');
        const goalText = document.getElementById('goal-text');

        if (goalIcon) goalIcon.innerText = routine.emoji || '✨';
        if (goalText) {
            const gText = getLabel(routine.goal) || getLabel(routine.title);
            goalText.innerText = gText;
        }
    }

    function getPromptText() {
        const t = uiStrings[currentLang] || uiStrings.fr;
        if (currentStepIndex >= activeSteps.length) {
            return t.complete;
        }
        if (easyMode && activeSteps.length === 3 && t.cues && t.cues[currentStepIndex]) {
            return t.cues[currentStepIndex];
        }
        return `${t.stepPrompt} ${currentStepIndex + 1} ?`;
    }

    function updatePrompt() {
        const promptElem = document.getElementById('prompt-label');
        if (!promptElem) return;
        promptElem.innerText = getPromptText();
    }

    function speakCurrentPrompt() {
        speakText(getPromptText());
    }

    function renderTimelineSlots() {
        const slotsContainer = document.getElementById('timeline-slots');
        if (!slotsContainer) return;
        slotsContainer.innerHTML = '';

        activeSteps.forEach((step, idx) => {
            const slot = document.createElement('div');
            slot.className = 'slot-card';
            slot.id = `slot-${idx}`;

            if (idx < currentStepIndex) {
                // Already placed step
                slot.classList.add('filled');

                const img = document.createElement('img');
                img.src = step.image;
                img.alt = getLabel(step.label);
                img.className = 'step-visual';
                img.onerror = () => {
                    img.style.display = 'none';
                };
                slot.appendChild(img);

                const cap = document.createElement('div');
                cap.className = 'step-caption';
                cap.innerText = `${idx + 1}. ${getLabel(step.label)}`;
                slot.appendChild(cap);
            } else {
                if (idx === currentStepIndex) {
                    slot.classList.add('current-target');
                }
                slot.innerHTML = `<span class="slot-num">${idx + 1}</span>`;
            }

            slotsContainer.appendChild(slot);

            // Add directional arrow between slots (left-to-right progression)
            if (idx < activeSteps.length - 1) {
                const arrow = document.createElement('span');
                arrow.className = 'timeline-arrow';
                arrow.innerText = '➡️';
                slotsContainer.appendChild(arrow);
            }
        });
    }

    function renderChoices() {
        const cardsContainer = document.getElementById('step-cards-container');
        if (!cardsContainer) return;
        cardsContainer.innerHTML = '';

        if (currentStepIndex >= activeSteps.length) return;

        // Show remaining unplaced steps in randomized order
        const remainingSteps = activeSteps.slice(currentStepIndex);
        const shuffledSteps = [...remainingSteps].sort(() => 0.5 - Math.random());

        shuffledSteps.forEach(step => {
            const card = document.createElement('div');
            card.className = 'option-card';
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            const stepText = getLabel(step.label);
            card.setAttribute('aria-label', stepText);

            const img = document.createElement('img');
            img.src = step.image;
            img.alt = stepText;
            img.className = 'step-visual';
            img.onerror = () => {
                img.style.display = 'none';
            };
            card.appendChild(img);

            const cap = document.createElement('div');
            cap.className = 'step-caption';
            cap.innerText = stepText;
            card.appendChild(cap);

            card.onclick = () => {
                if (isTransitioning) return;

                speakText(stepText);

                const requiredStep = activeSteps[currentStepIndex];
                if (step.stepNumber === requiredStep.stepNumber) {
                    // Correct step!
                    playStepPlacedSound();
                    placedStepNumbers.push(step.stepNumber);
                    currentStepIndex++;

                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, step.stepNumber);
                    }

                    renderTimelineSlots();

                    if (currentStepIndex >= activeSteps.length) {
                        isTransitioning = true;
                        playGentleSuccessSound();
                        updatePrompt();

                        if (window.AlpTracker) {
                            const routine = routines[currentRoutineIndex];
                            window.AlpTracker.onTrialSuccess(`sequence_${routine.id}_${easyMode ? 'easy' : 'full'}`);
                        }

                        cardsContainer.innerHTML = '';
                        speakCurrentPrompt();

                        // Move to next routine after celebration
                        setTimeout(() => {
                            currentRoutineIndex = (currentRoutineIndex + 1) % routines.length;
                            renderPills();
                            startRoutine();
                        }, 2600);
                    } else {
                        updatePrompt();
                        setTimeout(() => {
                            renderChoices();
                            speakCurrentPrompt();
                        }, 500);
                    }
                } else {
                    // Non-punitive gentle retry
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, step.stepNumber);
                    }
                    card.classList.remove('gentle-retry');
                    void card.offsetWidth;
                    card.classList.add('gentle-retry');
                    playSoftNudgeSound();
                }
            };

            cardsContainer.appendChild(card);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
