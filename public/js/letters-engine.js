// Letter Inset Puzzle Engine (Puzzle d'Encastrement des Lettres)
// Autism Learning Platform - Montessori-style recessed wooden cutout matching with phonics.

(() => {
    'use strict';

    // State
    let boards = [];
    let currentBoardIndex = 0;
    let currentSlotIndex = 0;
    let currentTargetLetter = null;
    let isTransitioning = false;
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let currentLang = localStorage.getItem('alp_lang') || 'en';

    // UI Translations
    const uiStrings = {
        en: {
            home: "⬅️ Home",
            title: "🔤 Letter Inset Puzzle",
            promptPrefix: "Place letter",
            complete: "Well done! Puzzle completed!",
            waiting: "Cutout slot"
        },
        fr: {
            home: "⬅️ Accueil",
            title: "🔤 Puzzle d'encastrement",
            promptPrefix: "Place la lettre",
            complete: "Bravo ! Puzzle terminé !",
            waiting: "Empreinte"
        }
    };

    // Audio Context (Web Audio API)
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

    // Wood-snap tone + harmonic chime
    function playWoodSnapSuccessSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        // 1. Tactile wood snap click (short filtered pop)
        const snapOsc = ctx.createOscillator();
        const snapGain = ctx.createGain();
        snapOsc.type = 'triangle';
        snapOsc.frequency.setValueAtTime(320, now);
        snapOsc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

        snapGain.gain.setValueAtTime(0.15, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        snapOsc.connect(snapGain);
        snapGain.connect(ctx.destination);
        snapOsc.start(now);
        snapOsc.stop(now + 0.09);

        // 2. Gentle chime harmonic
        const notes = [523.25, 659.25]; // C5, E5
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + 0.05 + (idx * 0.08));

            gain.gain.setValueAtTime(0, now + 0.05 + (idx * 0.08));
            gain.gain.linearRampToValueAtTime(0.1, now + 0.05 + (idx * 0.08) + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05 + (idx * 0.08) + 0.4);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + 0.05 + (idx * 0.08));
            osc.stop(now + 0.05 + (idx * 0.08) + 0.45);
        });
    }

    // Gentle woodblock nudge
    function playSoftNudgeSound() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(170, now + 0.15);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
    }

    // Text to Speech
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

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = t.home;

        const titleElem = document.getElementById('category-title');
        if (titleElem) titleElem.innerText = t.title;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });

        renderBoardPills();
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
                renderBoardPills();
                renderPuzzleRound();
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
    }

    function renderBoardPills() {
        const container = document.getElementById('board-pills');
        if (!container) return;
        container.innerHTML = '';

        boards.forEach((b, idx) => {
            const pill = document.createElement('button');
            pill.className = `routine-pill ${idx === currentBoardIndex ? 'active' : ''}`;
            const boardName = b.name[currentLang] || b.name.en;
            pill.innerText = boardName;

            pill.onclick = () => {
                if (idx === currentBoardIndex) return;
                currentBoardIndex = idx;
                renderBoardPills();
                renderPuzzleRound();
            };

            container.appendChild(pill);
        });
    }

    function renderPuzzleRound() {
        const board = boards[currentBoardIndex];
        if (!board) return;

        currentSlotIndex = 0;
        isTransitioning = false;

        renderCutoutSlots(board);
        renderAvailablePieces(board);
        updatePrompt();
        speakCurrentPrompt();
    }

    // Bilingual Letter Data Helper (Resolves words, media & phonics matching active language)
    function getLetterData(item, lang = currentLang) {
        if (!item) return { word: '', phonics: '', image: null, emoji: '🌟' };
        const l = (lang === 'fr') ? 'fr' : 'en';
        const word = (item.word && (item.word[l] || item.word.en)) || '';
        const phonics = (item.phonics && (item.phonics[l] || item.phonics.en)) || `${item.letter}! ${word}`;

        let image = null;
        let emoji = null;

        if (item.media && item.media[l]) {
            image = item.media[l].image || null;
            emoji = item.media[l].emoji || null;
        } else if (item.media && item.media.en) {
            image = item.media.en.image || null;
            emoji = item.media.en.emoji || null;
        } else {
            image = typeof item.image === 'object' ? item.image?.[l] : item.image;
            emoji = typeof item.emoji === 'object' ? item.emoji?.[l] : item.emoji;
        }

        if (!image && !emoji) emoji = '🌟';

        return { word, phonics, image, emoji };
    }

    // Render Wooden Cutout Slots on Inset Board
    function renderCutoutSlots(board) {
        const boardElem = document.getElementById('inset-puzzle-board');
        if (!boardElem) return;
        boardElem.innerHTML = '';

        board.letters.forEach((item, idx) => {
            const data = getLetterData(item, currentLang);
            const slot = document.createElement('div');
            slot.className = `inset-slot ${idx === currentSlotIndex ? 'targeted' : ''}`;
            slot.id = `inset-slot-${idx}`;
            slot.setAttribute('data-letter', item.letter);

            // Hollow cutout silhouette watermark
            slot.innerHTML = `
                <div class="inset-watermark" style="color: ${item.color}40;">${item.letter}</div>
                <div class="inset-guide-label">${data.word}</div>
            `;

            boardElem.appendChild(slot);
        });
    }

    // Render Available Tactile Wooden Pieces in Tray
    function renderAvailablePieces(board) {
        const container = document.getElementById('options-container');
        if (!container) return;
        container.innerHTML = '';

        const currentTarget = board.letters[currentSlotIndex];
        if (!currentTarget) return;
        currentTargetLetter = currentTarget;

        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(`letter_${currentTarget.letter}`);
        }

        // Remaining unplaced letters on this board
        const remainingLetters = board.letters.slice(currentSlotIndex);

        // Add 1 random distractor letter from other boards if only 1-2 remain
        const otherLetters = boards.flatMap(b => b.letters).filter(l => !board.letters.some(bl => bl.letter === l.letter));
        const distractor = otherLetters[Math.floor(Math.random() * otherLetters.length)];

        let choices = [...remainingLetters];
        if (choices.length < 3 && distractor) {
            choices.push(distractor);
        }

        const shuffledChoices = choices.sort(() => 0.5 - Math.random());

        shuffledChoices.forEach(item => {
            const data = getLetterData(item, currentLang);
            const piece = document.createElement('div');
            piece.className = 'option-card puzzle-piece';
            piece.setAttribute('role', 'button');
            piece.setAttribute('tabindex', '0');
            piece.setAttribute('data-letter', item.letter);

            piece.setAttribute('aria-label', `${item.letter} - ${data.word}`);

            piece.innerHTML = `
                <span class="piece-letter-badge" style="color: ${item.color};">${item.letter}</span>
                ${data.image ? `<img class="option-img" src="${data.image}" alt="${data.word}">` : `<span class="piece-emoji">${data.emoji}</span>`}
                <span class="option-label">${data.word}</span>
            `;

            piece.onclick = () => {
                if (isTransitioning) return;

                if (item.letter === currentTargetLetter.letter) {
                    // Match found! Snap into inset cutout slot
                    isTransitioning = true;
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(true, item.letter);
                    }

                    piece.classList.add('success');
                    playWoodSnapSuccessSound();

                    // Animate and fill cutout slot
                    const slot = document.getElementById(`inset-slot-${currentSlotIndex}`);
                    if (slot) {
                        slot.classList.remove('targeted');
                        slot.classList.add('filled');
                        slot.style.borderColor = item.color;
                        slot.innerHTML = `
                            <span class="filled-letter" style="color: ${item.color};">${item.letter}</span>
                            ${data.image ? `<img class="filled-img" src="${data.image}" alt="${data.word}">` : `<span class="filled-emoji">${data.emoji}</span>`}
                            <span class="filled-label">${data.word}</span>
                        `;
                    }

                    // Phonics vocalization (e.g. "D ! Comme Dauphin !" or "D ! As in Dog!")
                    speakText(data.phonics);

                    currentSlotIndex++;

                    // Check if whole board is completed
                    if (currentSlotIndex >= board.letters.length) {
                        if (window.AlpTracker) {
                            window.AlpTracker.onTrialSuccess(board.id);
                        }

                        setTimeout(() => {
                            speakText(uiStrings[currentLang].complete);
                        }, 500);

                        // Advance to next board after celebration
                        setTimeout(() => {
                            currentBoardIndex = (currentBoardIndex + 1) % boards.length;
                            renderBoardPills();
                            renderPuzzleRound();
                        }, 2800);
                    } else {
                        // Move to next slot in board
                        setTimeout(() => {
                            isTransitioning = false;
                            updateTargetSlotHighlight();
                            renderAvailablePieces(board);
                            updatePrompt();
                            speakCurrentPrompt();
                        }, 1200);
                    }
                } else {
                    // Gentle retry wobble
                    if (window.AlpTracker) {
                        window.AlpTracker.onAttempt(false, item.letter);
                    }
                    piece.classList.remove('gentle-retry');
                    void piece.offsetWidth;
                    piece.classList.add('gentle-retry');
                    playSoftNudgeSound();
                    speakText(item.letter);
                }
            };

            container.appendChild(piece);
        });
    }

    function updateTargetSlotHighlight() {
        document.querySelectorAll('.inset-slot').forEach((slot, idx) => {
            slot.classList.toggle('targeted', idx === currentSlotIndex);
        });
    }

    function updatePrompt() {
        const promptElem = document.getElementById('prompt-label');
        if (!promptElem) return;
        const t = uiStrings[currentLang] || uiStrings.en;
        const board = boards[currentBoardIndex];
        if (!board) return;

        if (currentSlotIndex < board.letters.length) {
            const target = board.letters[currentSlotIndex];
            const data = getLetterData(target, currentLang);
            promptElem.innerText = `${t.promptPrefix} ${target.letter} (${data.word})`;
        } else {
            promptElem.innerText = t.complete;
        }
    }

    function speakCurrentPrompt() {
        const board = boards[currentBoardIndex];
        if (!board) return;
        const t = uiStrings[currentLang] || uiStrings.en;

        if (currentSlotIndex < board.letters.length) {
            const target = board.letters[currentSlotIndex];
            const data = getLetterData(target, currentLang);
            speakText(`${t.promptPrefix} ${target.letter}`);
        }
    }

    function init() {
        setupControls();
        updateUIStaticText();

        fetch('data/letters.json')
            .then(res => res.json())
            .then(data => {
                boards = data.boards || [];
                if (boards.length > 0) {
                    renderBoardPills();
                    renderPuzzleRound();
                }
            })
            .catch(err => console.error('Error loading letters data:', err));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
