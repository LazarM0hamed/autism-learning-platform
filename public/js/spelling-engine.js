// Spelling / Letter Selection Engine
(() => {
    let words = [];
    let currentIndex = 0;
    let currentWordObj = null;
    let targetWord = "";
    let targetLetters = [];
    let currentLetterIndex = 0;
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'en';

    const uiStrings = {
        en: {
            title: "🔤 Spell the Word",
            prompt: "Spell the word:",
            home: "⬅️ Home",
            goodJob: "Great job!"
        },
        fr: {
            title: "🔤 Écris le mot",
            prompt: "Écris le mot :",
            home: "⬅️ Accueil",
            goodJob: "Bravo !"
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
        const notes = [523.25, 659.25, 783.99];
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
            utterance.rate = 0.9;
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
        const t = uiStrings[currentLang] || uiStrings.en;
        const titleElem = document.getElementById('activity-title');
        if (titleElem) titleElem.innerText = t.title;
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = t.home;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });
    }

    function setupControls() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.onclick = () => {
                const selected = btn.getAttribute('data-lang');
                if (selected === currentLang) return;
                currentLang = selected;
                localStorage.setItem('alp_lang', currentLang);
                updateUIStaticText();
                if (currentWordObj) {
                    renderSpellingRound();
                }
            };
        });

        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled);
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
                if (soundEnabled && targetWord) speakText(targetWord);
                else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            };
        }

        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) {
            speakBtn.onclick = () => {
                if (targetWord) speakText(targetWord);
            };
        }
    }

    function init() {
        setupControls();
        updateUIStaticText();

        fetch('data/words.json')
            .then(res => res.json())
            .then(data => {
                words = data.words || [];
                if (words.length > 0) {
                    currentIndex = 0;
                    renderSpellingRound();
                }
            })
            .catch(err => console.error(err));
    }

    function renderSpellingRound() {
        if (!words.length) return;
        isTransitioning = false;
        currentWordObj = words[currentIndex % words.length];

        targetWord = (currentWordObj.word[currentLang] || currentWordObj.word.en).toUpperCase();
        targetLetters = targetWord.split('');
        currentLetterIndex = 0;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(targetWord);
        }

        // Prompt
        const promptElem = document.getElementById('prompt-label');
        if (promptElem) {
            const t = uiStrings[currentLang] || uiStrings.en;
            promptElem.innerText = `${t.prompt} ${targetWord}`;
        }

        // Image
        const imgElem = document.getElementById('word-image');
        if (imgElem) {
            imgElem.src = currentWordObj.image;
            imgElem.alt = targetWord;
        }

        // Letter Slots
        const slotsContainer = document.getElementById('letter-slots');
        if (!slotsContainer) return;
        slotsContainer.innerHTML = '';

        targetLetters.forEach((_, idx) => {
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            slot.id = `slot-${idx}`;
            slot.innerText = '';
            slotsContainer.appendChild(slot);
        });

        // Letter Tray buttons
        const trayContainer = document.getElementById('letter-tray');
        if (!trayContainer) return;
        trayContainer.innerHTML = '';

        // Pool of letters: target letters + 1 random distractor letter
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const distractor = alphabet[Math.floor(Math.random() * alphabet.length)];
        const trayLetters = [...targetLetters, distractor].sort(() => 0.5 - Math.random());

        trayLetters.forEach((letter) => {
            const btn = document.createElement('button');
            btn.className = 'letter-btn';
            btn.innerText = letter;

            btn.onclick = () => {
                if (isTransitioning) return;

                const expectedLetter = targetLetters[currentLetterIndex];

                if (letter === expectedLetter) {
                    // Correct letter placed
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, letter);
                    }
                    const activeSlot = document.getElementById(`slot-${currentLetterIndex}`);
                    if (activeSlot) {
                        activeSlot.innerText = letter;
                        activeSlot.classList.add('filled');
                    }

                    btn.classList.add('used');
                    speakText(letter);
                    currentLetterIndex++;

                    // Word completed?
                    if (currentLetterIndex === targetLetters.length) {
                        isTransitioning = true;
                        if (window.AlpTracker) {
                            window.AlpTracker.onTrialSuccess(targetWord);
                        }
                        playGentleSuccessSound();
                        setTimeout(() => {
                            speakText(targetWord);
                        }, 400);

                        setTimeout(() => {
                            currentIndex++;
                            renderSpellingRound();
                        }, 1800);
                    }
                } else {
                    // Non-punitive gentle retry
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, letter);
                    }
                    btn.classList.remove('gentle-retry');
                    void btn.offsetWidth;
                    btn.classList.add('gentle-retry');
                    playSoftNudgeSound();
                    speakText(letter);
                }
            };

            trayContainer.appendChild(btn);
        });

        speakText(targetWord);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
