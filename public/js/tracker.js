// Universal Session Tracker, User Identification & Child Feedback Engine
// Autism Learning Platform - Privacy-conscious, local-first analytics & recommendations.

(() => {
    'use strict';

    // Local Storage Keys
    const KEY_NICKNAME = 'alp_profile_nickname';
    const KEY_EMOJI = 'alp_profile_emoji';
    const KEY_DEVICE_ID = 'alp_device_id';
    const KEY_SESSION_ID = 'alp_session_id';

    // State
    let currentNickname = localStorage.getItem(KEY_NICKNAME) || '';
    let currentEmoji = localStorage.getItem(KEY_EMOJI) || '👤';
    let currentDeviceId = localStorage.getItem(KEY_DEVICE_ID);
    let activeSessionId = sessionStorage.getItem(KEY_SESSION_ID) || null;
    let currentLang = localStorage.getItem('alp_lang') || 'en';

    if (!currentDeviceId) {
        currentDeviceId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem(KEY_DEVICE_ID, currentDeviceId);
    }

    // Active Trial Metrics
    let currentActivityId = detectCurrentActivityId();
    let currentCategoryId = getUrlParam('category') || 'all';
    let questionStartTime = null;
    let currentAttempts = 0;
    let currentTargetId = null;
    let pendingEventsQueue = [];

    // Helpers
    function getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function isParentPage() {
        const path = window.location.pathname.toLowerCase();
        return path.includes('parent.html') || path.endsWith('/parent') || path === '/parent';
    }

    function detectActivityFromPath(path) {
        if (path.includes('letters')) return 'letters_puzzle';
        if (path.includes('game')) return 'find_and_match';
        if (path.includes('pattern')) return 'pattern';
        if (path.includes('spelling')) return 'spelling';
        if (path.includes('sequence')) return 'sequence';
        if (path.includes('math')) return 'math';
        if (path.includes('spatial')) return 'spatial';
        if (path.includes('colors')) return 'colors';
        if (path.includes('time')) return 'time';
        if (path.includes('coloring')) return 'coloring';
        if (path.includes('comparisons')) return 'comparisons';
        if (path.includes('labyrinth')) return 'labyrinth';
        if (path.includes('sounds')) return 'sounds';
        if (path.includes('circuit')) return 'circuit';
        return null;
    }

    function isHubPage() {
        const path = window.location.pathname.toLowerCase();
        if (isParentPage()) return false;
        if (detectActivityFromPath(path)) return false;
        return path === '' || path === '/' || path.endsWith('/index.html') || path.endsWith('/index');
    }

    function detectCurrentActivityId() {
        const path = window.location.pathname.toLowerCase();
        return detectActivityFromPath(path) || 'general';
    }

    // Initialize or Resume Session
    async function initSession() {
        const nickname = currentNickname || 'Champion';

        // 1. Immediately render and bind UI without waiting for network
        updateHeaderProfileUI();
        if (isHubPage()) {
            loadDashboardRecommendations();
            loadDashboardLikes();
        } else if (!isParentPage()) {
            renderFeedbackWidget();
        }

        // 2. Connect session with server or local fallback
        try {
            const res = await fetch('/api/session/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickname,
                    deviceId: currentDeviceId
                })
            });
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success && data.session) {
                    activeSessionId = data.session.id;
                    sessionStorage.setItem(KEY_SESSION_ID, activeSessionId);
                }
            }
        } catch (e) {
            console.warn('Tracker: using local browser session:', e);
        }

        if (!activeSessionId) {
            activeSessionId = sessionStorage.getItem(KEY_SESSION_ID) || ('local_sess_' + Date.now());
            sessionStorage.setItem(KEY_SESSION_ID, activeSessionId);
        }

        // Flush any trial events queued before session response
        flushPendingEvents();

        // Notify activity start if inside an activity
        if (!isHubPage() && !isParentPage()) {
            recordEvent({
                type: 'activity_start',
                activityId: currentActivityId,
                categoryId: currentCategoryId
            });
        }
    }

    // Event Reporting with Resilient Queuing
    function recordEvent(eventData) {
        const eventObj = {
            ...eventData,
            activityId: eventData.activityId || currentActivityId,
            categoryId: eventData.categoryId || currentCategoryId,
            timestamp: new Date().toISOString()
        };

        if (!activeSessionId) {
            pendingEventsQueue.push(eventObj);
            return;
        }

        sendEvent(eventObj);
    }

    function sendEvent(eventObj) {
        // Persist locally for offline / static host analytics
        try {
            const stored = JSON.parse(localStorage.getItem('alp_local_events') || '[]');
            stored.push(eventObj);
            if (stored.length > 500) stored.shift();
            localStorage.setItem('alp_local_events', JSON.stringify(stored));
        } catch (e) {}

        const payload = {
            sessionId: activeSessionId,
            event: eventObj
        };

        if (navigator.sendBeacon && eventObj.type === 'activity_end') {
            navigator.sendBeacon('/api/session/event', JSON.stringify(payload));
        } else {
            fetch('/api/session/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => {});
        }
    }
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => {});
        }
    }

    function flushPendingEvents() {
        if (!activeSessionId || !pendingEventsQueue.length) return;
        const queue = [...pendingEventsQueue];
        pendingEventsQueue = [];
        queue.forEach(evt => sendEvent(evt));
    }

    // Trial Lifecycle Hooks for Activity Engines
    function onQuestionStart(targetId) {
        questionStartTime = Date.now();
        currentAttempts = 0;
        currentTargetId = targetId || 'item';
    }

    function onAttempt(isCorrect, selectedId) {
        currentAttempts++;
        const latencyMs = questionStartTime ? Math.max(100, Date.now() - questionStartTime) : 0;

        recordEvent({
            type: 'trial_attempt',
            targetId: currentTargetId,
            selectedId: selectedId || null,
            attemptNumber: currentAttempts,
            isCorrect: Boolean(isCorrect),
            latencyMs
        });
    }

    function onTrialSuccess(targetId = currentTargetId) {
        const latencyMs = questionStartTime ? Math.max(100, Date.now() - questionStartTime) : 0;

        recordEvent({
            type: 'trial_result',
            targetId,
            attempts: currentAttempts || 1,
            isCorrect: true,
            latencyMs
        });

        // Reset for next question
        questionStartTime = Date.now();
        currentAttempts = 0;
    }

    // Feedback Submission
    async function submitFeedback(reaction, comment = '') {
        if (!activeSessionId) {
            await initSession();
        }

        const payload = {
            sessionId: activeSessionId,
            nickname: currentNickname || 'Champion',
            activityId: currentActivityId,
            categoryId: currentCategoryId,
            reaction,
            comment
        };

        let serverSucceeded = false;
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success) {
                    serverSucceeded = true;
                    if (comment) {
                        flashFeedbackSuccess('📝');
                    } else if (data.userReaction === 'like') {
                        flashFeedbackSuccess('👍');
                    } else if (data.userReaction === 'unlike') {
                        flashFeedbackSuccess('👎');
                    } else {
                        flashFeedbackSuccess('↩️');
                    }
                    updateFeedbackCounters();
                }
            }
        } catch (e) {}

        if (!serverSucceeded) {
            // Local storage fallback for static hosting
            let localVotes = JSON.parse(localStorage.getItem('alp_local_votes') || '{}');
            let localSummary = JSON.parse(localStorage.getItem('alp_local_summary') || '{}');
            let localComments = JSON.parse(localStorage.getItem('alp_local_comments') || '[]');

            if (comment) {
                localComments.push({
                    nickname: currentNickname || 'Champion',
                    activityId: currentActivityId,
                    comment,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('alp_local_comments', JSON.stringify(localComments));
                flashFeedbackSuccess('📝');
                return;
            }

            const prev = localVotes[currentActivityId];
            let next = reaction;
            if (prev === reaction) {
                delete localVotes[currentActivityId];
                next = null;
                flashFeedbackSuccess('↩️');
            } else {
                localVotes[currentActivityId] = reaction;
                flashFeedbackSuccess(reaction === 'like' ? '👍' : '👎');
            }
            localStorage.setItem('alp_local_votes', JSON.stringify(localVotes));

            if (!localSummary[currentActivityId]) localSummary[currentActivityId] = { likes: 10, dislikes: 0 };
            if (prev === 'like') localSummary[currentActivityId].likes = Math.max(0, localSummary[currentActivityId].likes - 1);
            if (prev === 'unlike') localSummary[currentActivityId].dislikes = Math.max(0, localSummary[currentActivityId].dislikes - 1);
            if (next === 'like') localSummary[currentActivityId].likes++;
            if (next === 'unlike') localSummary[currentActivityId].dislikes++;
            localStorage.setItem('alp_local_summary', JSON.stringify(localSummary));

            updateFeedbackCounters();
        }
    }

    // Render In-Activity Feedback Widget (Child & Parent)
    async function renderFeedbackWidget() {
        let widget = document.getElementById('alp-feedback-widget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'alp-feedback-widget';
            widget.className = 'alp-feedback-widget';

            widget.innerHTML = `
                <div class="feedback-card">
                    <span class="feedback-prompt" id="fb-prompt-text">${currentLang === 'fr' ? 'Tu aimes ce jeu ?' : 'Do you like this game?'}</span>
                    <div class="feedback-actions">
                        <button class="feedback-btn like-btn" id="fb-like-btn" title="${currentLang === 'fr' ? 'J\'aime ce jeu !' : 'I like this game!'}">
                            <span class="fb-icon">👍</span>
                            <span class="fb-count" id="fb-likes-count">0</span>
                        </button>
                        <button class="feedback-btn unlike-btn" id="fb-unlike-btn" title="${currentLang === 'fr' ? 'Pas mon préféré' : 'Not my favorite'}">
                            <span class="fb-icon">👎</span>
                            <span class="fb-count" id="fb-unlikes-count">0</span>
                        </button>
                        <button class="feedback-btn comment-btn" id="fb-comment-btn" title="${currentLang === 'fr' ? 'Note parent / thérapeute' : 'Parent / Therapist note'}">
                            <span class="fb-icon">💬</span>
                            <span class="fb-text">${currentLang === 'fr' ? 'Note' : 'Note'}</span>
                        </button>
                    </div>
                </div>
            `;

            const header = document.querySelector('.game-header');
            if (header && header.nextSibling) {
                header.parentNode.insertBefore(widget, header.nextSibling);
            } else {
                document.body.insertBefore(widget, document.body.firstChild);
            }
        }

        const promptText = document.getElementById('fb-prompt-text');
        if (promptText) promptText.innerText = currentLang === 'fr' ? 'Tu aimes ce jeu ?' : 'Do you like this game?';

        const likeBtn = document.getElementById('fb-like-btn');
        if (likeBtn && !likeBtn.dataset.bound) {
            likeBtn.dataset.bound = 'true';
            likeBtn.addEventListener('click', () => submitFeedback('like'));
        }

        const unlikeBtn = document.getElementById('fb-unlike-btn');
        if (unlikeBtn && !unlikeBtn.dataset.bound) {
            unlikeBtn.dataset.bound = 'true';
            unlikeBtn.addEventListener('click', () => submitFeedback('unlike'));
        }

        const commentBtn = document.getElementById('fb-comment-btn');
        if (commentBtn && !commentBtn.dataset.bound) {
            commentBtn.dataset.bound = 'true';
            commentBtn.addEventListener('click', () => openCommentModal());
        }

        updateFeedbackCounters();
    }

    async function updateFeedbackCounters() {
        try {
            const url = currentNickname ? `/api/feedback/summary?nickname=${encodeURIComponent(currentNickname)}` : '/api/feedback/summary';
            const res = await fetch(url);
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success && data.summary) {
                    renderWidgetCounters(data.summary[currentActivityId], (data.userVotes && data.userVotes[currentActivityId]));
                    return;
                }
            }
        } catch (e) {}

        const localSummary = JSON.parse(localStorage.getItem('alp_local_summary') || '{}');
        const localVotes = JSON.parse(localStorage.getItem('alp_local_votes') || '{}');
        const defaultLikes = {
            'find_and_match': { likes: 0, dislikes: 0 },
            'colors': { likes: 0, dislikes: 0 },
            'pattern': { likes: 0, dislikes: 0 },
            'letters_puzzle': { likes: 0, dislikes: 0 },
            'coloring': { likes: 0, dislikes: 0 },
            'spelling': { likes: 0, dislikes: 0 },
            'spatial': { likes: 0, dislikes: 0 },
            'math': { likes: 0, dislikes: 0 },
            'comparisons': { likes: 0, dislikes: 0 },
            'time': { likes: 0, dislikes: 0 },
            'sequence': { likes: 0, dislikes: 0 },
            'labyrinth': { likes: 0, dislikes: 0 },
            'sounds': { likes: 0, dislikes: 0 },
            'circuit': { likes: 0, dislikes: 0 }
        };
        const s = localSummary[currentActivityId] || defaultLikes[currentActivityId] || { likes: 0, dislikes: 0 };
        renderWidgetCounters(s, localVotes[currentActivityId]);
    }

    function renderWidgetCounters(s, userVote) {
        const likeEl = document.getElementById('fb-likes-count');
        const unlikeEl = document.getElementById('fb-unlikes-count');
        if (likeEl) likeEl.innerText = (s && s.likes) || 0;
        if (unlikeEl) unlikeEl.innerText = (s && s.dislikes) || 0;

        const likeBtn = document.getElementById('fb-like-btn');
        const unlikeBtn = document.getElementById('fb-unlike-btn');
        if (likeBtn) likeBtn.classList.toggle('active', userVote === 'like');
        if (unlikeBtn) unlikeBtn.classList.toggle('active', userVote === 'unlike');
    }

    function flashFeedbackSuccess(emoji) {
        const toast = document.createElement('div');
        toast.className = 'feedback-toast';
        toast.innerText = `${emoji} ${currentLang === 'fr' ? 'Merci !' : 'Thank you!'}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1800);
    }

    // Modal for Therapist / Parent Observations
    function openCommentModal() {
        let modal = document.getElementById('alp-comment-modal');
        if (modal) modal.remove();

        modal = document.createElement('div');
        modal.id = 'alp-comment-modal';
        modal.className = 'alp-modal-overlay';

        modal.innerHTML = `
            <div class="alp-modal-box">
                <h3 class="modal-title">📝 ${currentLang === 'fr' ? 'Observation Parent / Thérapeute' : 'Parent / Therapist Observation'}</h3>
                <p class="modal-subtitle">${currentLang === 'fr' ? 'Ajoute une note sur la séance ou les réactions de l\'enfant :' : 'Add a quick note on engagement, strengths, or challenges:'}</p>
                <textarea id="alp-comment-input" class="alp-modal-textarea" rows="3" placeholder="${currentLang === 'fr' ? 'Ex: Très concentré aujourd\'hui, a réussi sans hésitation...' : 'Ex: Very focused, easily recognized animals on first attempt...'}"></textarea>
                <div class="modal-buttons">
                    <button class="modal-btn cancel-btn" id="modal-comment-cancel">${currentLang === 'fr' ? 'Annuler' : 'Cancel'}</button>
                    <button class="modal-btn save-btn" id="modal-comment-save">${currentLang === 'fr' ? 'Enregistrer la note' : 'Save Note'}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('modal-comment-cancel')?.addEventListener('click', () => modal.remove());
        document.getElementById('modal-comment-save')?.addEventListener('click', () => {
            const comment = document.getElementById('alp-comment-input')?.value || '';
            if (comment.trim()) {
                submitFeedback('neutral', comment.trim());
                flashFeedbackSuccess('📝');
            }
            modal.remove();
        });
    }

    // Profile Selection & Nickname Prompt Modal
    async function showProfileModal() {
        let modal = document.getElementById('alp-profile-modal');
        if (modal) modal.remove();

        let profiles = [];
        try {
            const res = await fetch('/api/profiles');
            const data = await res.json();
            if (data.success && data.profiles) profiles = data.profiles;
        } catch (e) {}

        modal = document.createElement('div');
        modal.id = 'alp-profile-modal';
        modal.className = 'alp-modal-overlay';

        const profilePills = profiles.map(p => `
            <button class="profile-quick-pill" data-nickname="${p.nickname}" data-emoji="${p.emoji || '🌟'}">
                <span class="profile-pill-emoji">${p.emoji || '🌟'}</span>
                <span class="profile-pill-name">${p.nickname}</span>
            </button>
        `).join('');

        modal.innerHTML = `
            <div class="alp-modal-box">
                <h2 class="modal-title">👋 ${currentLang === 'fr' ? 'Qui joue aujourd\'hui ?' : 'Who is playing today?'}</h2>
                <p class="modal-subtitle">${currentLang === 'fr' ? 'Choisis un profil existant ou écris ton prénom :' : 'Pick an existing profile or enter your name:'}</p>

                ${profiles.length ? `<div class="profile-quick-list">${profilePills}</div>` : ''}

                <div class="profile-input-group">
                    <input type="text" id="alp-nickname-input" class="alp-modal-input" placeholder="${currentLang === 'fr' ? 'Prénom ou surnom (ex: Ilyen)' : 'Name or nickname (e.g. Ilyen)'}" maxlength="24" value="${currentNickname || ''}" autofocus>
                </div>

                <div class="modal-buttons">
                    <button class="modal-btn save-btn" id="modal-profile-start">
                        🚀 ${currentLang === 'fr' ? 'C\'est parti !' : 'Let\'s Play!'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelectorAll('.profile-quick-pill').forEach(btn => {
            btn.onclick = () => {
                selectProfile(btn.getAttribute('data-nickname'), btn.getAttribute('data-emoji'));
                modal.remove();
            };
        });

        document.getElementById('modal-profile-start')?.addEventListener('click', () => {
            const input = document.getElementById('alp-nickname-input');
            const nick = (input?.value || '').trim() || 'Champion';
            selectProfile(nick, '🌟');
            modal.remove();
        });
    }

    function selectProfile(nickname, emoji = '🌟') {
        currentNickname = nickname;
        currentEmoji = emoji;
        localStorage.setItem(KEY_NICKNAME, currentNickname);
        localStorage.setItem(KEY_EMOJI, currentEmoji);

        initSession();
    }

    // Top Navigation Profile & Parent Dashboard Header Link
    function updateHeaderProfileUI() {
        const defaultName = currentLang === 'fr' ? 'Joueur' : 'Player';
        const nick = currentNickname || defaultName;
        const emoji = currentNickname ? currentEmoji : '👤';
        const isParent = isParentPage();

        let bar = document.getElementById('alp-user-header-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'alp-user-header-bar';
            bar.className = 'alp-user-header-bar';
            document.body.insertBefore(bar, document.body.firstChild);
        }

        const switchHint = currentLang === 'fr'
            ? (currentNickname ? 'Changer de joueur' : 'Choisir un prénom')
            : (currentNickname ? 'Switch player' : 'Set child name');

        bar.innerHTML = `
            <div class="user-chip" id="alp-user-chip" title="${switchHint}">
                <span class="user-chip-emoji">${emoji}</span>
                <span class="user-chip-name">${nick}</span>
                <span class="user-chip-switch">⇄</span>
            </div>

            <a href="${isParent ? 'index.html' : 'parent.html'}" class="parent-hub-link" title="${currentLang === 'fr' ? 'Espace Parents & Statistiques' : 'Parent Dashboard & Analytics'}">
                <span class="parent-link-icon">${isParent ? '🎮' : '📊'}</span>
                <span class="parent-link-text">${isParent ? (currentLang === 'fr' ? 'Retour aux Jeux' : 'Back to Games') : (currentLang === 'fr' ? 'Espace Parents' : 'Parent Dashboard')}</span>
            </a>
        `;

        document.getElementById('alp-user-chip')?.addEventListener('click', () => {
            showProfileModal();
        });
    }

    // Adaptive Recommendations for Hub Dashboard
    async function loadDashboardRecommendations() {
        if (!isHubPage()) return;

        try {
            const url = currentNickname ? `/api/parent/dashboard?nickname=${encodeURIComponent(currentNickname)}` : '/api/parent/dashboard';
            const res = await fetch(url);
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success && data.analytics && data.analytics.recommendations) {
                    applyDashboardBadges(data.analytics.recommendations);
                    return;
                }
            }
        } catch (e) {}

        // Fallback default recommendations
        applyDashboardBadges([
            { activityId: 'find_and_match', type: 'confidence_booster' },
            { activityId: 'coloring', type: 'practice_next' },
            { activityId: 'letters_puzzle', type: 'confidence_booster' },
            { activityId: 'sounds', type: 'practice_next' }
        ]);
    }

    function applyDashboardBadges(recommendations) {
        const idMap = {
            'find_and_match': '.activity-card.find',
            'letters_puzzle': '.activity-card.letters',
            'pattern': '.activity-card.pattern',
            'spelling': '.activity-card.spelling',
            'sequence': '.activity-card.sequence',
            'math': '.activity-card.math',
            'spatial': '.activity-card.spatial',
            'colors': '.activity-card.colors',
            'time': '.activity-card.time',
            'coloring': '.activity-card.coloring',
            'comparisons': '.activity-card.comparisons',
            'labyrinth': '.activity-card.labyrinth',
            'sounds': '.activity-card.sounds',
            'circuit': '.activity-card.circuit'
        };

        document.querySelectorAll('.alp-rec-badge').forEach(b => b.remove());

        recommendations.forEach(rec => {
            const selector = idMap[rec.activityId];
            if (!selector) return;

            const card = document.querySelector(selector);
            if (!card) return;

            const badge = document.createElement('span');
            badge.className = `alp-rec-badge rec-${rec.type}`;

            if (rec.type === 'confidence_booster') {
                badge.innerText = currentLang === 'fr' ? '💚 Favori' : '💚 Favorite';
            } else if (rec.type === 'practice_next') {
                badge.innerText = currentLang === 'fr' ? '⭐ Conseillé' : '⭐ Recommended';
            } else if (rec.type === 'needs_accommodation') {
                badge.innerText = currentLang === 'fr' ? '🎯 À consolider' : '🎯 Practice';
            }

            card.appendChild(badge);
        });
    }

    // YouTube-style Total Likes Display on Hub Activity Cards
    async function loadDashboardLikes() {
        if (!isHubPage()) return;

        const defaultLikes = {
            'find_and_match': { likes: 0, dislikes: 0 },
            'colors': { likes: 0, dislikes: 0 },
            'pattern': { likes: 0, dislikes: 0 },
            'letters_puzzle': { likes: 0, dislikes: 0 },
            'coloring': { likes: 0, dislikes: 0 },
            'spelling': { likes: 0, dislikes: 0 },
            'spatial': { likes: 0, dislikes: 0 },
            'math': { likes: 0, dislikes: 0 },
            'comparisons': { likes: 0, dislikes: 0 },
            'time': { likes: 0, dislikes: 0 },
            'sequence': { likes: 0, dislikes: 0 },
            'labyrinth': { likes: 0, dislikes: 0 },
            'sounds': { likes: 0, dislikes: 0 },
            'circuit': { likes: 0, dislikes: 0 }
        };

        try {
            const res = await fetch('/api/feedback/summary');
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success && data.summary) {
                    renderDashboardLikes(data.summary);
                    return;
                }
            }
        } catch (e) {}

        const localSummary = JSON.parse(localStorage.getItem('alp_local_summary') || '{}');
        renderDashboardLikes({ ...defaultLikes, ...localSummary });
    }

    function renderDashboardLikes(summary) {
        const idMap = {
            'find_and_match': '.activity-card.find',
            'letters_puzzle': '.activity-card.letters',
            'pattern': '.activity-card.pattern',
            'spelling': '.activity-card.spelling',
            'sequence': '.activity-card.sequence',
            'math': '.activity-card.math',
            'spatial': '.activity-card.spatial',
            'colors': '.activity-card.colors',
            'time': '.activity-card.time',
            'coloring': '.activity-card.coloring',
            'comparisons': '.activity-card.comparisons',
            'labyrinth': '.activity-card.labyrinth',
            'sounds': '.activity-card.sounds',
            'circuit': '.activity-card.circuit'
        };

        Object.keys(idMap).forEach(actId => {
            const selector = idMap[actId];
            const card = document.querySelector(selector);
            if (!card) return;

            let badge = card.querySelector('.activity-likes-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'activity-likes-badge';
                card.appendChild(badge);
            }

            const likes = summary[actId] ? (summary[actId].likes || 0) : 0;
            badge.innerHTML = `<span class="like-thumb">👍</span> <span class="like-number">${likes}</span>`;
            badge.title = `${likes} ${currentLang === 'fr' ? 'J\'aimes' : 'Likes'}`;
        });
    }

    // Public API for Game Engines & Pages
    window.AlpTracker = {
        initSession,
        showProfileModal,
        onQuestionStart,
        onAttempt,
        onTrialSuccess,
        submitFeedback,
        getNickname: () => currentNickname || 'Champion',
        getSessionId: () => activeSessionId,
        refreshRecommendations: loadDashboardRecommendations,
        refreshLikes: loadDashboardLikes
    };

    // Auto-initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSession);
    } else {
        initSession();
    }

    // Record session end on page leave
    window.addEventListener('beforeunload', () => {
        if (activeSessionId && !isHubPage() && !isParentPage()) {
            recordEvent({
                type: 'activity_end',
                activityId: currentActivityId,
                completed: false
            });
        }
    });
})();
