/**
 * Body Parts Learning Engine (Activity #22)
 * Features the Magic Butterfly companion, dual game modes (Name It & Touch/Fly),
 * responsive SVG child character anatomy, Web Audio synthesizer, and sensory rewards.
 */

(() => {
    'use strict';

    // Default Fallback Dataset
    const FALLBACK_DATA = {
        title: { fr: "Le Corps Humain", en: "Human Body Parts" },
        categories: [
            { id: "all", label: { fr: "🌟 Tout mélanger", en: "🌟 Mix All" } },
            { id: "face", label: { fr: "😊 Le Visage", en: "😊 The Face" } },
            { id: "upper", label: { fr: "💪 Haut du corps", en: "💪 Upper Body" } },
            { id: "lower", label: { fr: "🦵 Bas du corps", en: "🦵 Lower Body" } }
        ],
        parts: [
            { id: "head", name: { fr: "La tête", en: "Head" }, emoji: "👦", category: "face", coords: { x: 200, y: 78, r: 34 }, hint: { fr: "Tout en haut du corps !", en: "At the very top of your body!" }, praise: { fr: "Bravo ! C'est la tête ! 👦", en: "Awesome! That's the head! 👦" } },
            { id: "hair", name: { fr: "Les cheveux", en: "Hair" }, emoji: "💇", category: "face", coords: { x: 200, y: 48, r: 24 }, hint: { fr: "Sur le dessus de la tête !", en: "On top of the head!" }, praise: { fr: "Bravo ! Ce sont les cheveux ! 💇", en: "Awesome! That's the hair! 💇" } },
            { id: "eyes", name: { fr: "Les yeux", en: "Eyes" }, emoji: "👁️", category: "face", coords: { x: 200, y: 94, r: 24 }, hint: { fr: "Pour regarder le monde !", en: "To look at the world!" }, praise: { fr: "Super ! Ce sont les yeux ! 👁️", en: "Great! Those are the eyes! 👁️" } },
            { id: "ears", name: { fr: "Les oreilles", en: "Ears" }, emoji: "👂", category: "face", coords: { x: 148, y: 100, r: 22 }, altCoords: { x: 252, y: 100, r: 22 }, hint: { fr: "Pour écouter la musique !", en: "To listen to music!" }, praise: { fr: "Bravo ! Ce sont les oreilles ! 👂", en: "Awesome! Those are the ears! 👂" } },
            { id: "nose", name: { fr: "Le nez", en: "Nose" }, emoji: "👃", category: "face", coords: { x: 200, y: 110, r: 20 }, hint: { fr: "Au milieu du visage pour sentir !", en: "In the center of the face to smell!" }, praise: { fr: "Oui ! C'est le nez ! 👃", en: "Yes! That's the nose! 👃" } },
            { id: "mouth", name: { fr: "La bouche", en: "Mouth" }, emoji: "👄", category: "face", coords: { x: 200, y: 128, r: 22 }, hint: { fr: "Pour parler et sourire !", en: "To speak and smile!" }, praise: { fr: "Très bien ! C'est la bouche ! 👄", en: "Very good! That's the mouth! 👄" } },
            { id: "shoulders", name: { fr: "Les épaules", en: "Shoulders" }, emoji: "🥋", category: "upper", coords: { x: 138, y: 178, r: 24 }, altCoords: { x: 262, y: 178, r: 24 }, hint: { fr: "En haut des bras, de chaque côté du cou !", en: "At the top of the arms, on each side of the neck!" }, praise: { fr: "Génial ! Ce sont les épaules ! 🥋", en: "Great! Those are the shoulders! 🥋" } },
            { id: "arms", name: { fr: "Les bras", en: "Arms" }, emoji: "💪", category: "upper", coords: { x: 118, y: 228, r: 24 }, altCoords: { x: 282, y: 228, r: 24 }, hint: { fr: "Pour faire de gros câlins !", en: "To give big warm hugs!" }, praise: { fr: "Bravo ! Ce sont les bras ! 💪", en: "Awesome! Those are the arms! 💪" } },
            { id: "hands", name: { fr: "Les mains", en: "Hands" }, emoji: "✋", category: "upper", coords: { x: 88, y: 298, r: 24 }, altCoords: { x: 312, y: 298, r: 24 }, hint: { fr: "Pour toucher et applaudir !", en: "To touch and clap!" }, praise: { fr: "Parfait ! Ce sont les mains ! ✋", en: "Perfect! Those are the hands! ✋" } },
            { id: "belly", name: { fr: "Le ventre", en: "Belly" }, emoji: "👕", category: "upper", coords: { x: 200, y: 238, r: 26 }, hint: { fr: "Tout doux au milieu du corps !", en: "Soft in the center of the body!" }, praise: { fr: "Bravo ! C'est le ventre ! 👕", en: "Awesome! That's the belly! 👕" } },
            { id: "legs", name: { fr: "Les jambes", en: "Legs" }, emoji: "🦵", category: "lower", coords: { x: 165, y: 358, r: 26 }, altCoords: { x: 235, y: 358, r: 26 }, hint: { fr: "Pour courir et sauter !", en: "To run and jump!" }, praise: { fr: "Oui ! Ce sont les jambes ! 🦵", en: "Yes! Those are the legs! 🦵" } },
            { id: "knees", name: { fr: "Les genoux", en: "Knees" }, emoji: "🦿", category: "lower", coords: { x: 165, y: 398, r: 22 }, altCoords: { x: 235, y: 398, r: 22 }, hint: { fr: "Pour plier les jambes !", en: "To bend your legs!" }, praise: { fr: "Bravo ! Ce sont les genoux ! 🦿", en: "Awesome! Those are the knees! 🦿" } },
            { id: "feet", name: { fr: "Les pieds", en: "Feet" }, emoji: "🦶", category: "lower", coords: { x: 155, y: 472, r: 26 }, altCoords: { x: 245, y: 472, r: 26 }, hint: { fr: "Tout en bas pour marcher !", en: "At the very bottom to walk!" }, praise: { fr: "Super ! Ce sont les pieds ! 🦶", en: "Super! Those are the feet! 🦶" } }
        ]
    };

    let dataset = FALLBACK_DATA;
    let lang = localStorage.getItem('alp_lang') || localStorage.getItem('appLang') || 'fr';
    let soundEnabled = localStorage.getItem('alp_sound') !== 'false';
    let activeCategory = 'all';
    let activeMode = 'name'; // 'name' (Mode A) or 'touch' (Mode B)
    let currentPart = null;
    let consecutiveCorrect = 0;
    let isTransitioning = false;
    let audioCtx = null;

    // Butterfly current coordinates on SVG plane
    let butterflyPos = { x: 200, y: 20 };

    function getAudioContext() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    // Sensory Web Audio Sound Synthesizer
    function playSound(type) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            const now = ctx.currentTime;

            if (type === 'flap') {
                // Delicate gentle flutter whoosh
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'correct') {
                // Rising harp chime arpeggio: C5, E5, G5, C6
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                    gain.gain.setValueAtTime(0.18, now + idx * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.08);
                    osc.stop(now + idx * 0.08 + 0.48);
                });
            } else if (type === 'incorrect') {
                // Soft gentle boing (non-punitive)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
            } else if (type === 'celebration') {
                // Grand celebratory fanfare chord
                const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                chord.forEach(freq => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now);
                    gain.gain.setValueAtTime(0.14, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 1.25);
                });
            }
        } catch (e) {
            console.warn('Audio playback error:', e);
        }
    }

    // Speech Prompt Synthesizer
    function speakText(text) {
        if (!soundEnabled || !window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
            utterance.rate = 0.92;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        } catch (e) {}
    }

    // Render Anatomical SVG Character
    function renderAnatomySvg() {
        const svg = document.getElementById('anatomy-svg');
        if (!svg) return;

        svg.innerHTML = `
            <defs>
                <radialGradient id="hotspot-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#EC4899" stop-opacity="0.85"/>
                    <stop offset="60%" stop-color="#F472B6" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#DB2777" stop-opacity="0"/>
                </radialGradient>
                <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.12"/>
                </filter>
                <linearGradient id="skin-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#FDE68A"/>
                    <stop offset="100%" stop-color="#FCD34D"/>
                </linearGradient>
                <linearGradient id="shirt-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#38BDF8"/>
                    <stop offset="100%" stop-color="#0284C7"/>
                </linearGradient>
                <linearGradient id="shorts-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#818CF8"/>
                    <stop offset="100%" stop-color="#4F46E5"/>
                </linearGradient>
                <linearGradient id="shoe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#F43F5E"/>
                    <stop offset="100%" stop-color="#E11D48"/>
                </linearGradient>
                <linearGradient id="wing-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#F43F5E"/>
                    <stop offset="50%" stop-color="#EC4899"/>
                    <stop offset="100%" stop-color="#8B5CF6"/>
                </linearGradient>
                <linearGradient id="wing-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#F43F5E"/>
                    <stop offset="50%" stop-color="#EC4899"/>
                    <stop offset="100%" stop-color="#8B5CF6"/>
                </linearGradient>
            </defs>

            <!-- Ground Shadow -->
            <ellipse cx="200" cy="502" rx="140" ry="14" fill="#E2E8F0" opacity="0.8"/>

            <!-- Character Body Layers -->
            <g id="char-body-group" filter="url(#soft-shadow)">
                <!-- Legs -->
                <!-- Left Leg -->
                <rect x="150" y="320" width="30" height="140" rx="15" fill="url(#skin-grad)" stroke="#D97706" stroke-width="2.5"/>
                <!-- Right Leg -->
                <rect x="220" y="320" width="30" height="140" rx="15" fill="url(#skin-grad)" stroke="#D97706" stroke-width="2.5"/>

                <!-- Knees subtle crease lines -->
                <path d="M 154,398 Q 165,404 176,398" fill="none" stroke="#D97706" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M 224,398 Q 235,404 246,398" fill="none" stroke="#D97706" stroke-width="2.5" stroke-linecap="round"/>

                <!-- Shoes -->
                <!-- Left Shoe -->
                <path d="M 134,460 C 134,448 180,448 180,460 L 184,484 C 184,490 128,490 128,484 Z" fill="url(#shoe-grad)" stroke="#BE123C" stroke-width="2.5"/>
                <rect x="128" y="482" width="56" height="8" rx="4" fill="#FFFFFF" stroke="#BE123C" stroke-width="1.5"/>
                <!-- Right Shoe -->
                <path d="M 220,460 C 220,448 266,448 266,460 L 272,484 C 272,490 216,490 216,484 Z" fill="url(#shoe-grad)" stroke="#BE123C" stroke-width="2.5"/>
                <rect x="216" y="482" width="56" height="8" rx="4" fill="#FFFFFF" stroke="#BE123C" stroke-width="1.5"/>

                <!-- Arms (Behind torso slightly) -->
                <!-- Left Arm -->
                <path d="M 148,180 Q 112,230 92,290" fill="none" stroke="url(#skin-grad)" stroke-width="24" stroke-linecap="round"/>
                <!-- Left Hand -->
                <circle cx="88" cy="298" r="16" fill="url(#skin-grad)" stroke="#D97706" stroke-width="2"/>
                <!-- Right Arm -->
                <path d="M 252,180 Q 288,230 308,290" fill="none" stroke="url(#skin-grad)" stroke-width="24" stroke-linecap="round"/>
                <!-- Right Hand -->
                <circle cx="312" cy="298" r="16" fill="url(#skin-grad)" stroke="#D97706" stroke-width="2"/>

                <!-- Shorts -->
                <path d="M 140,280 L 260,280 L 255,335 L 210,335 L 200,305 L 190,335 L 145,335 Z" fill="url(#shorts-grad)" stroke="#3730A3" stroke-width="2.5"/>

                <!-- Torso / T-Shirt -->
                <path d="M 144,175 C 160,165 240,165 256,175 L 268,285 C 268,290 132,290 132,285 Z" fill="url(#shirt-grad)" stroke="#0369A1" stroke-width="3"/>

                <!-- Shoulders / Sleeves -->
                <path d="M 144,175 C 130,185 125,205 120,225 C 134,232 144,228 152,215 Z" fill="#0284C7"/>
                <path d="M 256,175 C 270,185 275,205 280,225 C 266,232 256,228 248,215 Z" fill="#0284C7"/>

                <!-- Neck -->
                <rect x="188" y="140" width="24" height="28" rx="6" fill="url(#skin-grad)" stroke="#D97706" stroke-width="2"/>

                <!-- Head & Face -->
                <circle cx="200" cy="100" r="48" fill="url(#skin-grad)" stroke="#D97706" stroke-width="2.5"/>

                <!-- Ears -->
                <circle cx="148" cy="100" r="11" fill="url(#skin-grad)" stroke="#D97706" stroke-width="2"/>
                <circle cx="252" cy="100" r="11" fill="url(#skin-grad)" stroke="#D97706" stroke-width="2"/>

                <!-- Hair -->
                <path d="M 148,88 C 146,55 175,40 200,40 C 225,40 254,55 252,88 C 242,72 230,68 215,70 C 200,62 185,62 170,70 C 158,68 152,78 148,88 Z" fill="#B45309" stroke="#78350F" stroke-width="2"/>

                <!-- Eyes with friendly shine -->
                <!-- Left Eye -->
                <circle cx="182" cy="94" r="6" fill="#1E293B"/>
                <circle cx="180" cy="92" r="2" fill="#FFFFFF"/>
                <!-- Right Eye -->
                <circle cx="218" cy="94" r="6" fill="#1E293B"/>
                <circle cx="216" cy="92" r="2" fill="#FFFFFF"/>

                <!-- Cheeks (Blush) -->
                <circle cx="172" cy="108" r="8" fill="#F472B6" opacity="0.4"/>
                <circle cx="228" cy="108" r="8" fill="#F472B6" opacity="0.4"/>

                <!-- Nose -->
                <path d="M 197,106 Q 200,114 204,111" fill="none" stroke="#B45309" stroke-width="2.5" stroke-linecap="round"/>

                <!-- Cheerful Mouth -->
                <path d="M 186,124 Q 200,138 214,124" fill="none" stroke="#BE123C" stroke-width="3" stroke-linecap="round"/>
            </g>

            <!-- Hotspot Targeting Beacons (Interactive SVG Circles) -->
            <g id="hotspots-layer"></g>

            <!-- Sparkle Trail Container -->
            <g id="sparkle-trail-layer"></g>

            <!-- The Magic Butterfly 🦋 Element -->
            <g id="magic-butterfly" transform="translate(200, 20)" style="cursor: pointer; transition: transform 0.05s linear;">
                <!-- Glowing Aura -->
                <circle cx="0" cy="0" r="26" fill="#FDE047" opacity="0.25" filter="url(#soft-shadow)"/>

                <!-- Left Wings -->
                <g class="butterfly-wing wing-left">
                    <path d="M -2,-2 C -18,-24 -36,-12 -28,8 C -22,18 -10,12 -2,4 Z" fill="url(#wing-grad-left)" stroke="#BE123C" stroke-width="1.5"/>
                    <circle cx="-18" cy="-6" r="3.5" fill="#FFFFFF" opacity="0.85"/>
                    <path d="M -2,4 C -14,12 -22,24 -14,28 C -8,30 -4,18 -1,8 Z" fill="url(#wing-grad-left)" stroke="#BE123C" stroke-width="1.2"/>
                </g>

                <!-- Right Wings -->
                <g class="butterfly-wing wing-right">
                    <path d="M 2,-2 C 18,-24 36,-12 28,8 C 22,18 10,12 2,4 Z" fill="url(#wing-grad-right)" stroke="#BE123C" stroke-width="1.5"/>
                    <circle cx="18" cy="-6" r="3.5" fill="#FFFFFF" opacity="0.85"/>
                    <path d="M 2,4 C 14,12 22,24 14,28 C 8,30 4,18 1,8 Z" fill="url(#wing-grad-right)" stroke="#BE123C" stroke-width="1.2"/>
                </g>

                <!-- Slender Body -->
                <ellipse cx="0" cy="4" rx="3.5" ry="14" fill="#3B0764"/>
                <circle cx="0" cy="-10" r="4.5" fill="#581C87"/>

                <!-- Antennae with Glowing Star Tips -->
                <path d="M -1,-14 Q -8,-24 -12,-20" fill="none" stroke="#581C87" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="-12" cy="-20" r="2.5" fill="#FDE047"/>
                <path d="M 1,-14 Q 8,-24 12,-20" fill="none" stroke="#581C87" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="12" cy="-20" r="2.5" fill="#FDE047"/>
            </g>
        `;

        renderHotspots();
    }

    function createHotspotCircle(part, coords) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', coords.x);
        circle.setAttribute('cy', coords.y);
        circle.setAttribute('r', coords.r);
        circle.setAttribute('fill', 'transparent');
        circle.setAttribute('stroke', '#EC4899');
        circle.setAttribute('stroke-width', '2.5');
        circle.setAttribute('stroke-dasharray', '4,3');
        circle.setAttribute('opacity', activeMode === 'touch' ? '0.75' : '0.2');
        circle.setAttribute('class', 'body-hotspot');
        circle.setAttribute('data-id', part.id);
        circle.setAttribute('tabindex', '0');
        circle.setAttribute('role', 'button');
        circle.setAttribute('aria-label', part.name[lang]);

        // Touch interaction (Mode B)
        circle.addEventListener('click', (e) => {
            e.stopPropagation();
            onHotspotTapped(part, coords);
        });

        // Enter key support for accessibility
        circle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onHotspotTapped(part, coords);
            }
        });

        return circle;
    }

    // Render Hotspot Targets (Supports primary and symmetrical altCoords)
    function renderHotspots() {
        const layer = document.getElementById('hotspots-layer');
        if (!layer) return;

        layer.innerHTML = '';
        dataset.parts.forEach(part => {
            layer.appendChild(createHotspotCircle(part, part.coords));
            if (part.altCoords) {
                layer.appendChild(createHotspotCircle(part, part.altCoords));
            }
        });
    }

    // Butterfly Flight Animation Engine (Smooth Bezier trajectory with stardust trail)
    function flyButterflyTo(targetX, targetY, onLanded) {
        const butterfly = document.getElementById('magic-butterfly');
        if (!butterfly) {
            if (onLanded) onLanded();
            return;
        }

        playSound('flap');
        const startX = butterflyPos.x;
        const startY = butterflyPos.y;
        const duration = 750; // ms
        const startTime = performance.now();

        // Arched control point for natural curving flight
        const midX = (startX + targetX) / 2 + (targetX > startX ? 40 : -40);
        const midY = Math.min(startY, targetY) - 50;

        butterfly.classList.add('is-flying');

        function animateFrame(now) {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);
            // Ease-in-out cubic
            const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            // Quadratic Bezier formula
            const currX = (1 - ease) * (1 - ease) * startX + 2 * (1 - ease) * ease * midX + ease * ease * targetX;
            const currY = (1 - ease) * (1 - ease) * startY + 2 * (1 - ease) * ease * midY + ease * ease * targetY;

            butterfly.setAttribute('transform', `translate(${currX.toFixed(1)}, ${currY.toFixed(1)})`);

            // Generate sparkling fairy dust particles along the flight path
            if (Math.random() < 0.4) {
                spawnSparkle(currX, currY);
            }

            if (t < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                butterflyPos = { x: targetX, y: targetY };
                butterfly.classList.remove('is-flying');
                if (onLanded) onLanded();
            }
        }

        requestAnimationFrame(animateFrame);
    }

    // Sparkle Particle Trail
    function spawnSparkle(x, y) {
        const layer = document.getElementById('sparkle-trail-layer');
        if (!layer) return;

        const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        star.setAttribute('cx', x + (Math.random() * 16 - 8));
        star.setAttribute('cy', y + (Math.random() * 16 - 8));
        star.setAttribute('r', (Math.random() * 3.5 + 1.5).toFixed(1));
        const colors = ['#FDE047', '#EC4899', '#A855F7', '#38BDF8', '#34D399'];
        star.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)]);
        star.setAttribute('opacity', '0.9');
        layer.appendChild(star);

        let opacity = 0.9;
        const fadeInterval = setInterval(() => {
            opacity -= 0.12;
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                if (star.parentNode) star.parentNode.removeChild(star);
            } else {
                star.setAttribute('opacity', opacity.toFixed(2));
            }
        }, 35);
    }

    // Active Parts Pool based on current category
    function getCategoryParts() {
        if (activeCategory === 'all') return dataset.parts;
        return dataset.parts.filter(p => p.category === activeCategory);
    }

    // Setup Challenge / Turn
    function nextTurn() {
        isTransitioning = false;
        const parts = getCategoryParts();
        if (!parts.length) return;

        // Pick random part different from previous
        let available = parts;
        if (currentPart && parts.length > 1) {
            available = parts.filter(p => p.id !== currentPart.id);
        }
        currentPart = available[Math.floor(Math.random() * available.length)];

        // Clear active beacons
        document.querySelectorAll('.body-hotspot').forEach(el => {
            el.classList.remove('active-target');
            el.setAttribute('fill', 'transparent');
        });

        // Highlight hotspot of current target
        const activeHotspot = document.querySelector(`.body-hotspot[data-id="${currentPart.id}"]`);
        if (activeHotspot) {
            activeHotspot.classList.add('active-target');
            if (activeMode === 'name') {
                activeHotspot.setAttribute('fill', 'url(#hotspot-glow)');
            }
        }

        updatePrompt();

        if (activeMode === 'name') {
            // Mode A: Fly to part and land on it, then enable choice buttons
            flyButterflyTo(currentPart.coords.x, currentPart.coords.y, () => {
                renderChoiceCards();
                speakPrompt();
            });
        } else {
            // Mode B: Fly to neutral staging spot, prompt child to touch part
            flyButterflyTo(200, 20, () => {
                renderTouchHint();
                speakPrompt();
            });
        }

        // Notify tracker of new question start
        if (window.AlpTracker) {
            window.AlpTracker.onQuestionStart(currentPart.id);
        }
    }

    // Prompt Banner Display
    function updatePrompt() {
        const promptLabel = document.getElementById('prompt-label');
        if (!promptLabel || !currentPart) return;

        if (activeMode === 'name') {
            promptLabel.innerText = lang === 'fr'
                ? "Où s'est posé le papillon ?"
                : "Where did the butterfly land?";
        } else {
            promptLabel.innerText = lang === 'fr'
                ? `Pose le papillon sur : ${currentPart.name.fr} !`
                : `Land the butterfly on the: ${currentPart.name.en}!`;
        }
    }

    function speakPrompt() {
        if (!currentPart) return;
        if (activeMode === 'name') {
            speakText(lang === 'fr' ? "Où s'est posé le papillon ?" : "Where did the butterfly land?");
        } else {
            speakText(lang === 'fr'
                ? `Pose le papillon sur : ${currentPart.name.fr} !`
                : `Land the butterfly on the ${currentPart.name.en}!`);
        }
    }

    // Mode A: Render 2 to 4 Choice Cards
    function renderChoiceCards() {
        const tray = document.getElementById('body-choices-tray');
        if (!tray || !currentPart) return;

        tray.innerHTML = '';

        // Select 3 distractors
        const allOtherParts = dataset.parts.filter(p => p.id !== currentPart.id);
        const shuffled = allOtherParts.sort(() => 0.5 - Math.random());
        const choices = [currentPart, ...shuffled.slice(0, 3)].sort(() => 0.5 - Math.random());

        choices.forEach(part => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'body-choice-btn';
            btn.setAttribute('data-id', part.id);
            btn.innerHTML = `
                <span class="choice-emoji">${part.emoji}</span>
                <span class="choice-label">${part.name[lang]}</span>
            `;

            btn.onclick = () => onChoiceSelected(part, btn);
            tray.appendChild(btn);
        });
    }

    // Mode B: Render Touch Hint
    function renderTouchHint() {
        const tray = document.getElementById('body-choices-tray');
        if (!tray || !currentPart) return;

        tray.innerHTML = `
            <div style="background: #F5F3FF; border: 2.5px dashed #C4B5FD; border-radius: 20px; padding: 12px 28px; display: inline-flex; align-items: center; gap: 12px;">
                <span style="font-size: 2rem;">${currentPart.emoji}</span>
                <span style="font-size: 1.15rem; font-weight: 800; color: #6D28D9;">${lang === 'fr' ? 'Touche :' : 'Touch:'} ${currentPart.name[lang]}</span>
            </div>
        `;
    }

    // Mode A: Choice Selection Handler
    function onChoiceSelected(chosenPart, btnEl) {
        if (isTransitioning || !currentPart) return;

        if (chosenPart.id === currentPart.id) {
            // Correct!
            isTransitioning = true;
            btnEl.classList.add('correct');
            playSound('correct');
            speakText(currentPart.praise[lang]);
            consecutiveCorrect++;

            // Butterfly happy celebration flutter
            const butterfly = document.getElementById('magic-butterfly');
            if (butterfly) {
                butterfly.classList.add('is-celebrating');
                setTimeout(() => butterfly.classList.remove('is-celebrating'), 800);
            }

            if (window.AlpTracker) {
                window.AlpTracker.onTrialSuccess(currentPart.id);
            }

            // Check milestone reward (every 5 correct answers)
            if (consecutiveCorrect > 0 && consecutiveCorrect % 5 === 0) {
                setTimeout(triggerMilestoneCelebration, 900);
            } else {
                setTimeout(nextTurn, 1400);
            }
        } else {
            // Incorrect
            btnEl.classList.add('incorrect');
            playSound('incorrect');
            speakText(chosenPart.hint[lang]);

            if (window.AlpTracker) {
                window.AlpTracker.onAttempt();
            }

            setTimeout(() => {
                btnEl.classList.remove('incorrect');
            }, 600);
        }
    }

    // Mode B: Hotspot Tapped Handler
    function onHotspotTapped(tappedPart, coords = null) {
        if (isTransitioning || !currentPart) return;

        const targetCoords = coords || tappedPart.coords;

        if (activeMode === 'touch') {
            if (tappedPart.id === currentPart.id) {
                // Correct target tapped!
                isTransitioning = true;
                playSound('correct');
                consecutiveCorrect++;

                // Fly directly to the specific tapped spot (e.g. left or right shoulder)!
                flyButterflyTo(targetCoords.x, targetCoords.y, () => {
                    speakText(currentPart.praise[lang]);

                    if (window.AlpTracker) {
                        window.AlpTracker.onTrialSuccess(currentPart.id);
                    }

                    if (consecutiveCorrect > 0 && consecutiveCorrect % 5 === 0) {
                        setTimeout(triggerMilestoneCelebration, 900);
                    } else {
                        setTimeout(nextTurn, 1400);
                    }
                });
            } else {
                // Incorrect part tapped
                playSound('incorrect');
                speakText(lang === 'fr'
                    ? `Ici c'est : ${tappedPart.name.fr}. Trouve : ${currentPart.name.fr} !`
                    : `Here is: ${tappedPart.name.en}. Find: ${currentPart.name.en}!`);

                if (window.AlpTracker) {
                    window.AlpTracker.onAttempt();
                }
            }
        } else {
            // In Mode A, tapping the target repeats its hint
            speakText(tappedPart.hint[lang]);
        }
    }

    // Milestone Reward: Fullscreen Meadow of Butterflies & Confetti
    function triggerMilestoneCelebration() {
        playSound('celebration');

        const canvas = document.getElementById('celebration-canvas');
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');

        const butterflies = [];
        const colors = ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#F43F5E'];

        for (let i = 0; i < 16; i++) {
            butterflies.push({
                x: Math.random() * canvas.width,
                y: canvas.height + Math.random() * 100,
                targetY: Math.random() * (canvas.height * 0.6) + 40,
                speedX: (Math.random() - 0.5) * 4,
                speedY: -(Math.random() * 3 + 2.5),
                size: Math.random() * 12 + 16,
                color: colors[i % colors.length],
                wingAngle: 0,
                wingSpeed: Math.random() * 0.15 + 0.15
            });
        }

        let frame = 0;
        function renderCelebration() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            butterflies.forEach(b => {
                b.x += b.speedX + Math.sin(frame * 0.05) * 1.5;
                b.y += b.speedY;
                b.wingAngle += b.wingSpeed;

                ctx.save();
                ctx.translate(b.x, b.y);

                const flapScale = Math.sin(b.wingAngle);
                ctx.fillStyle = b.color;

                // Left wing
                ctx.beginPath();
                ctx.ellipse(-b.size * 0.6, -b.size * 0.2, Math.abs(flapScale) * b.size * 0.8, b.size * 0.6, -0.2, 0, Math.PI * 2);
                ctx.fill();

                // Right wing
                ctx.beginPath();
                ctx.ellipse(b.size * 0.6, -b.size * 0.2, Math.abs(flapScale) * b.size * 0.8, b.size * 0.6, 0.2, 0, Math.PI * 2);
                ctx.fill();

                // Butterfly Body
                ctx.fillStyle = '#1E1B4B';
                ctx.beginPath();
                ctx.ellipse(0, 0, b.size * 0.15, b.size * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });

            frame++;
            if (frame < 180) {
                requestAnimationFrame(renderCelebration);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                showMilestoneModal();
            }
        }

        requestAnimationFrame(renderCelebration);
    }

    // Modal after 5 consecutive correct answers
    function showMilestoneModal() {
        let modal = document.getElementById('body-milestone-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'body-milestone-modal';
            modal.className = 'alp-modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="alp-modal-box" style="text-align: center; max-width: 440px;">
                <div style="font-size: 3.8rem; margin-bottom: 8px;">🦋🌸✨</div>
                <h2 style="font-size: 1.5rem; margin-bottom: 8px; color: #1E293B;">
                    ${lang === 'fr' ? 'Magnifique !' : 'Splendid!'}
                </h2>
                <p style="font-size: 1.05rem; color: #64748B; margin-bottom: 22px;">
                    ${lang === 'fr'
                        ? 'Tu connais très bien les parties du corps ! Le papillon est ravi !'
                        : 'You know your body parts so well! The butterfly is joyful!'}
                </p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button type="button" class="modal-btn save-btn" id="modal-continue-btn" style="background: #7C3AED;">
                        ${lang === 'fr' ? 'Continuer 🚀' : 'Keep Playing 🚀'}
                    </button>
                    <a href="index.html" class="modal-btn cancel-btn" style="text-decoration: none; display: inline-flex; align-items: center;">
                        ${lang === 'fr' ? 'Accueil 🏠' : 'Home 🏠'}
                    </a>
                </div>
            </div>
        `;

        document.getElementById('modal-continue-btn').onclick = () => {
            modal.remove();
            nextTurn();
        };
    }

    // Render Category Pills
    function renderCategoryPills() {
        const nav = document.getElementById('body-pills');
        if (!nav) return;

        nav.innerHTML = '';
        dataset.categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `routine-pill ${cat.id === activeCategory ? 'active' : ''}`;
            btn.innerText = cat.label[lang];
            btn.onclick = () => {
                activeCategory = cat.id;
                renderCategoryPills();
                nextTurn();
            };
            nav.appendChild(btn);
        });
    }

    // Setup Mode Switcher Buttons
    function setupModeSwitcher() {
        const nameBtn = document.getElementById('mode-name-btn');
        const touchBtn = document.getElementById('mode-touch-btn');

        if (nameBtn) {
            nameBtn.onclick = () => {
                activeMode = 'name';
                nameBtn.classList.add('active');
                if (touchBtn) touchBtn.classList.remove('active');
                renderHotspots();
                nextTurn();
            };
        }

        if (touchBtn) {
            touchBtn.onclick = () => {
                activeMode = 'touch';
                touchBtn.classList.add('active');
                if (nameBtn) nameBtn.classList.remove('active');
                renderHotspots();
                nextTurn();
            };
        }
    }

    // Setup Header & Control Bindings
    function setupControls() {
        // Sound toggle
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            soundBtn.onclick = () => {
                soundEnabled = !soundEnabled;
                localStorage.setItem('alp_sound', soundEnabled ? 'true' : 'false');
                soundBtn.innerText = soundEnabled ? '🔊' : '🔇';
            };
        }

        // Language switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
            btn.onclick = () => {
                lang = btn.getAttribute('data-lang');
                localStorage.setItem('alp_lang', lang);
                document.querySelectorAll('.lang-btn').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
                });
                updateLanguageLabels();
                renderCategoryPills();
                updatePrompt();
                if (activeMode === 'name') renderChoiceCards();
                else renderTouchHint();
            };
        });

        // Speak prompt button
        const speakBtn = document.getElementById('speak-prompt-btn');
        if (speakBtn) speakBtn.onclick = speakPrompt;

        // Skip to next challenge button
        const nextBtn = document.getElementById('next-challenge-btn');
        if (nextBtn) nextBtn.onclick = nextTurn;

        // Visual size profile switcher (Normal, Grande, XL)
        const storedSize = localStorage.getItem('alp_size_profile') || 'normal';
        applySize(storedSize);

        document.querySelectorAll('#body-size-pills .size-pill, .size-pill-group .size-pill').forEach(btn => {
            btn.onclick = () => {
                const s = btn.getAttribute('data-size');
                applySize(s);
            };
        });
    }

    function applySize(size) {
        if (!size) return;
        document.body.setAttribute('data-size', size);
        localStorage.setItem('alp_size_profile', size);
        document.querySelectorAll('.size-pill').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-size') === size);
        });
    }

    function updateLanguageLabels() {
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = lang === 'fr' ? '⬅️ Accueil' : '⬅️ Home';

        const title = document.getElementById('activity-title');
        if (title) title.innerText = lang === 'fr' ? '🦋 Le Corps Humain' : '🦋 Human Body';

        const modeName = document.getElementById('lbl-mode-name');
        if (modeName) modeName.innerText = lang === 'fr' ? 'Nommer la partie' : 'Name It';

        const modeTouch = document.getElementById('lbl-mode-touch');
        if (modeTouch) modeTouch.innerText = lang === 'fr' ? 'Pose le papillon' : 'Touch & Fly';

        const lblSize = document.getElementById('lbl-body-size');
        if (lblSize) lblSize.innerText = lang === 'fr' ? 'Taille :' : 'Size:';
    }

    // Fetch JSON Dataset or Fallback
    async function init() {
        try {
            const res = await fetch('data/body.json');
            if (res.ok) {
                dataset = await res.json();
            }
        } catch (e) {
            console.warn('Using fallback body dataset:', e);
        }

        setupControls();
        setupModeSwitcher();
        updateLanguageLabels();
        renderCategoryPills();
        renderAnatomySvg();
        nextTurn();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
