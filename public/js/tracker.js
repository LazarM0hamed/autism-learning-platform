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
        if (path.includes('causality')) return 'causality';
        if (path.includes('builder')) return 'builder';
        if (path.includes('basket')) return 'basket';
        if (path.includes('music')) return 'music';
        if (path.includes('classification')) return 'classification';
        if (path.includes('hide-and-seek') || path.includes('hide_and_seek')) return 'hide_and_seek';
        if (path.includes('lines')) return 'lines';
        if (path.includes('body')) return 'body';
        if (path.includes('language')) return 'language';
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
            loadConnectionsCount();
            updateBookmarksUI();
            setupFilterBar();

            // First-time visit auto-prompt on hub
            const stored = localStorage.getItem(KEY_NICKNAME);
            if ((!stored || stored === 'Champion') && !sessionStorage.getItem('alp_prompted_profile')) {
                sessionStorage.setItem('alp_prompted_profile', 'true');
                if (stored === 'Champion') {
                    localStorage.removeItem(KEY_NICKNAME);
                    localStorage.removeItem(KEY_EMOJI);
                }
                setTimeout(showProfileModal, 350);
            }
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
                    if (typeof data.totalConnections === 'number') {
                        localStorage.setItem('alp_total_connections', data.totalConnections);
                        updateConnectionsUI(data.totalConnections);
                    }
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
            deviceId: currentDeviceId,
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
            const params = new URLSearchParams();
            if (currentNickname) params.set('nickname', currentNickname);
            if (currentDeviceId) params.set('deviceId', currentDeviceId);
            const query = params.toString() ? `?${params.toString()}` : '';
            const res = await fetch(`/api/feedback/summary${query}`);
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
            'circuit': { likes: 0, dislikes: 0 },
            'causality': { likes: 0, dislikes: 0 },
            'builder': { likes: 0, dislikes: 0 },
            'basket': { likes: 0, dislikes: 0 },
            'music': { likes: 0, dislikes: 0 },
            'classification': { likes: 0, dislikes: 0 },
            'hide_and_seek': { likes: 0, dislikes: 0 },
            'lines': { likes: 0, dislikes: 0 },
            'body': { likes: 0, dislikes: 0 },
            'language': { likes: 0, dislikes: 0 }
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

    // Canonical Multi-Child Profile Switcher & Modal
    function showProfileModal() {
        let modal = document.getElementById('alp-profile-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'alp-profile-modal';
            modal.className = 'alp-modal-overlay';
            document.body.appendChild(modal);
        }

        const AVATARS = ['🦊', '🦁', '🐼', '🐰', '🐶', '🐱', '🚀', '🦄', '🐻', '🦖'];
        let chosenAvatar = currentEmoji !== '👤' ? currentEmoji : '🦊';

        const profiles = JSON.parse(localStorage.getItem('alp_profiles_list') || localStorage.getItem('alp_local_profiles') || '[]');
        const activeNick = localStorage.getItem(KEY_NICKNAME) || '';

        const childrenCardsHtml = profiles.length > 0 ? `
            <div class="modal-children-section" style="margin-bottom: 12px;">
                <p style="font-weight: 800; font-size: 0.95rem; margin: 0 0 8px 0; color: var(--text-primary);">
                    ${currentLang === 'fr' ? 'Enfants enregistrés (touche pour changer) :' : 'Registered children (tap to switch):'}
                </p>
                <div class="child-profiles-grid">
                    ${profiles.map(p => {
                        const isActive = p.nickname.toLowerCase() === activeNick.toLowerCase();
                        return `
                            <div class="child-profile-card ${isActive ? 'active' : ''}" data-nick="${p.nickname}" data-emoji="${p.emoji || '🦊'}">
                                <span class="child-card-emoji">${p.emoji || '🦊'}</span>
                                <span class="child-card-name">${p.nickname}</span>
                                ${isActive ? '<span class="child-card-badge">✓</span>' : ''}
                                <button type="button" class="child-card-delete" title="${currentLang === 'fr' ? 'Supprimer ce profil' : 'Delete profile'}" data-del="${p.nickname}">✕</button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : '';

        const avatarButtonsHtml = AVATARS.map(a => `
            <button type="button" class="avatar-opt-btn ${a === chosenAvatar ? 'active' : ''}" data-emoji="${a}" title="${a}">
                ${a}
            </button>
        `).join('');

        modal.innerHTML = `
            <div class="alp-modal-box">
                <h2 class="modal-title">👋 ${currentLang === 'fr' ? 'Qui joue aujourd\'hui ?' : 'Who is playing today?'}</h2>
                <p class="modal-subtitle">${currentLang === 'fr' ? 'Choisis un enfant ou ajoute un nouveau profil :' : 'Pick a child or add a new profile:'}</p>

                ${childrenCardsHtml}

                <div class="profile-add-section" style="${profiles.length ? 'border-top: 1px solid #E2E8F0; padding-top: 12px;' : ''}">
                    <p style="font-weight: 800; font-size: 0.95rem; margin: 0 0 8px 0; color: var(--text-primary);">
                        ${currentLang === 'fr' ? '➕ Ajouter un enfant :' : '➕ Add a child:'}
                    </p>
                    <div class="profile-input-group">
                        <input type="text" id="alp-nickname-input" class="alp-modal-input" placeholder="${currentLang === 'fr' ? 'Prénom (ex: Ilyen, Sarah, Lucas...)' : 'Name (e.g. Ilyen, Sarah, Leo...)'}" maxlength="24" autocomplete="off">
                    </div>

                    <div class="avatar-picker-row" id="modal-avatar-picker" style="margin-top: 8px;">
                        ${avatarButtonsHtml}
                    </div>
                </div>

                <div class="modal-buttons">
                    <button type="button" class="modal-btn cancel-btn" id="modal-profile-cancel">
                        ${currentLang === 'fr' ? 'Fermer' : 'Close'}
                    </button>
                    <button type="button" class="modal-btn save-btn" id="modal-profile-start">
                        🚀 ${currentLang === 'fr' ? 'Ajouter & Jouer' : 'Add & Play'}
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';

        // Bind switch to child cards
        modal.querySelectorAll('.child-profile-card').forEach(card => {
            card.onclick = (e) => {
                if (e.target.classList.contains('child-card-delete')) return;
                const nick = card.getAttribute('data-nick');
                const emo = card.getAttribute('data-emoji');
                selectProfile(nick, emo);
                modal.style.display = 'none';
            };
        });

        // Bind delete buttons
        modal.querySelectorAll('.child-card-delete').forEach(delBtn => {
            delBtn.onclick = (e) => {
                e.stopPropagation();
                const delNick = delBtn.getAttribute('data-del');
                const conf = confirm(currentLang === 'fr' ? `Supprimer le profil de ${delNick} ?` : `Delete profile for ${delNick}?`);
                if (conf) {
                    deleteProfile(delNick);
                    showProfileModal();
                }
            };
        });

        // Bind avatar selection
        modal.querySelectorAll('.avatar-opt-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.avatar-opt-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                chosenAvatar = btn.getAttribute('data-emoji') || '🦊';
            };
        });

        const input = document.getElementById('alp-nickname-input');
        setTimeout(() => input?.focus(), 60);

        const saveAction = () => {
            const rawNick = (input?.value || '').trim();
            if (rawNick) {
                selectProfile(rawNick, chosenAvatar);
                modal.style.display = 'none';
            } else if (profiles.length > 0) {
                modal.style.display = 'none';
            } else {
                selectProfile(currentLang === 'fr' ? 'Joueur' : 'Player', chosenAvatar);
                modal.style.display = 'none';
            }
        };

        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveAction();
            }
        });

        document.getElementById('modal-profile-start')?.addEventListener('click', saveAction);
        document.getElementById('modal-profile-cancel')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    function deleteProfile(nickname) {
        let profiles = JSON.parse(localStorage.getItem('alp_profiles_list') || localStorage.getItem('alp_local_profiles') || '[]');
        profiles = profiles.filter(p => p.nickname.toLowerCase() !== nickname.toLowerCase());
        localStorage.setItem('alp_profiles_list', JSON.stringify(profiles));
        localStorage.setItem('alp_local_profiles', JSON.stringify(profiles));

        if (currentNickname && currentNickname.toLowerCase() === nickname.toLowerCase()) {
            if (profiles.length > 0) {
                selectProfile(profiles[0].nickname, profiles[0].emoji || '🦊');
            } else {
                currentNickname = '';
                currentEmoji = '👤';
                localStorage.removeItem(KEY_NICKNAME);
                localStorage.removeItem(KEY_EMOJI);
                updateHeaderProfileUI();
            }
        }
    }

    function selectProfile(nickname, emoji = '🦊') {
        currentNickname = nickname;
        currentEmoji = emoji;
        localStorage.setItem(KEY_NICKNAME, currentNickname);
        localStorage.setItem(KEY_EMOJI, currentEmoji);

        // Save into local profiles array for multi-child households
        const localProfiles = JSON.parse(localStorage.getItem('alp_profiles_list') || localStorage.getItem('alp_local_profiles') || '[]');
        const idx = localProfiles.findIndex(p => p.nickname.toLowerCase() === nickname.toLowerCase());
        if (idx >= 0) {
            localProfiles[idx].emoji = emoji;
        } else {
            localProfiles.push({ nickname, emoji, createdAt: new Date().toISOString() });
        }
        localStorage.setItem('alp_profiles_list', JSON.stringify(localProfiles));
        localStorage.setItem('alp_local_profiles', JSON.stringify(localProfiles));

        // Background server sync if available
        try {
            fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, emoji })
            }).catch(() => {});
        } catch (e) {}

        updateHeaderProfileUI();
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
            <button type="button" class="user-chip" id="alp-user-chip" title="${switchHint}">
                <span class="user-chip-emoji">${emoji}</span>
                <span class="user-chip-name">${nick}</span>
                <span class="user-chip-switch">⇄</span>
            </button>

            <a href="${isParent ? 'index.html' : 'parent.html'}" class="parent-hub-link" title="${currentLang === 'fr' ? 'Espace Parents & Statistiques' : 'Parent Dashboard & Analytics'}">
                <span class="parent-link-icon">${isParent ? '🎮' : '📊'}</span>
                <span class="parent-link-text">${isParent ? (currentLang === 'fr' ? 'Retour aux Jeux' : 'Back to Games') : (currentLang === 'fr' ? 'Espace Parents' : 'Parent Dashboard')}</span>
            </a>
        `;

        const chip = document.getElementById('alp-user-chip');
        if (chip) {
            chip.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                showProfileModal();
            };
        }
    }

    // Global Event Delegation for Player Chip across all pages
    document.addEventListener('click', (e) => {
        const chip = e.target && e.target.closest && e.target.closest('#alp-user-chip');
        if (chip) {
            e.preventDefault();
            e.stopPropagation();
            showProfileModal();
        }
    });

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
            'circuit': '.activity-card.circuit',
            'causality': '.activity-card.causality',
            'builder': '.activity-card.builder',
            'basket': '.activity-card.basket',
            'music': '.activity-card.music',
            'classification': '.activity-card.classification',
            'hide_and_seek': '.activity-card.hide_and_seek',
            'lines': '.activity-card.lines',
            'body': '.activity-card.body',
            'language': '.activity-card.language'
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
            'circuit': { likes: 0, dislikes: 0 },
            'causality': { likes: 0, dislikes: 0 },
            'builder': { likes: 0, dislikes: 0 },
            'basket': { likes: 0, dislikes: 0 },
            'music': { likes: 0, dislikes: 0 },
            'classification': { likes: 0, dislikes: 0 },
            'hide_and_seek': { likes: 0, dislikes: 0 },
            'lines': { likes: 0, dislikes: 0 },
            'body': { likes: 0, dislikes: 0 },
            'language': { likes: 0, dislikes: 0 }
        };

        try {
            const res = await fetch('/api/feedback/summary');
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success && data.summary) {
                    localStorage.setItem('alp_local_summary', JSON.stringify(data.summary));
                    renderDashboardLikes(data.summary);
                    return;
                }
            }
        } catch (e) {}

        const localSummary = JSON.parse(localStorage.getItem('alp_local_summary') || '{}');
        renderDashboardLikes({ ...defaultLikes, ...localSummary });
    }

    // Total Connections Counter Display on Hub
    async function loadConnectionsCount() {
        if (!isHubPage()) return;

        try {
            const res = await fetch('/api/session/connections');
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success && typeof data.totalConnections === 'number') {
                    localStorage.setItem('alp_total_connections', data.totalConnections);
                    updateConnectionsUI(data.totalConnections);
                    return;
                }
            }
        } catch (e) {}

        const localCount = parseInt(localStorage.getItem('alp_total_connections') || '0', 10);
        if (localCount > 0) {
            updateConnectionsUI(localCount);
        }
    }

    function updateConnectionsUI(count) {
        const el = document.getElementById('connections-count');
        const lbl = document.getElementById('connections-label');
        const activeLang = localStorage.getItem('alp_lang') || document.documentElement.lang || 'fr';
        if (!el) return;
        if (typeof count === 'number' && count > 0) {
            el.innerText = Number(count).toLocaleString(activeLang === 'fr' ? 'fr-FR' : 'en-US');
        }
        if (lbl) {
            lbl.innerText = activeLang === 'fr' ? 'connexions' : 'connections';
        }
    }

    function renderDashboardLikes(summary) {
        const activeLang = localStorage.getItem('alp_lang') || document.documentElement.lang || 'fr';
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
            'circuit': '.activity-card.circuit',
            'causality': '.activity-card.causality',
            'builder': '.activity-card.builder',
            'basket': '.activity-card.basket',
            'music': '.activity-card.music',
            'classification': '.activity-card.classification',
            'hide_and_seek': '.activity-card.hide_and_seek',
            'lines': '.activity-card.lines',
            'body': '.activity-card.body',
            'language': '.activity-card.language'
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
            badge.title = `${likes} ${activeLang === 'fr' ? 'J\'aimes' : 'Likes'}`;
        });
    }

    // Direct Feedback & Suggestion Modal (Dispatched safely without exposing personal email)
    function openContactFeedbackModal() {
        let modal = document.getElementById('alp-contact-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'alp-contact-modal';
            modal.className = 'alp-modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="alp-modal-box" style="max-width: 520px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
                    <img src="assets/icons/logo.svg" alt="Logo" style="width: 38px; height: 38px; object-fit: contain;">
                    <div>
                        <h2 class="modal-title" style="margin: 0; font-size: 1.3rem;">💌 ${currentLang === 'fr' ? 'Votre avis & suggestions' : 'Feedback & Suggestions'}</h2>
                        <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">${currentLang === 'fr' ? 'Transmis directement à l\'équipe éducative' : 'Sent directly to the development team'}</span>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 180px;">
                        <label style="font-size: 0.82rem; font-weight: 800; color: var(--text-primary); display: block; margin-bottom: 4px;">
                            ${currentLang === 'fr' ? 'Vous êtes :' : 'You are:'}
                        </label>
                        <select id="cf-role-select" class="alp-modal-input" style="padding: 8px 12px; font-size: 0.95rem;">
                            <option value="parent">${currentLang === 'fr' ? '👨‍👩‍👦 Parent' : '👨‍👩‍👦 Parent'}</option>
                            <option value="therapist">${currentLang === 'fr' ? '🩺 Thérapeute / Pro' : '🩺 Therapist / Pro'}</option>
                            <option value="educator">${currentLang === 'fr' ? '🏫 Enseignant / AESH' : '🏫 Educator / Special Ed'}</option>
                            <option value="other">${currentLang === 'fr' ? '🌟 Autre' : '🌟 Other'}</option>
                        </select>
                    </div>

                    <div style="flex: 1; min-width: 180px;">
                        <label style="font-size: 0.82rem; font-weight: 800; color: var(--text-primary); display: block; margin-bottom: 4px;">
                            ${currentLang === 'fr' ? 'Catégorie :' : 'Category:'}
                        </label>
                        <select id="cf-type-select" class="alp-modal-input" style="padding: 8px 12px; font-size: 0.95rem;">
                            <option value="idea">${currentLang === 'fr' ? '💡 Idée d\'activité' : '💡 Activity Idea'}</option>
                            <option value="praise">${currentLang === 'fr' ? '⭐ Ce qui plaît à mon enfant' : '⭐ What my child loves'}</option>
                            <option value="bug">${currentLang === 'fr' ? '🔧 Problème / Amélioration' : '🔧 Issue / Suggestion'}</option>
                            <option value="other">${currentLang === 'fr' ? '💬 Message général' : '💬 General message'}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style="font-size: 0.82rem; font-weight: 800; color: var(--text-primary); display: block; margin-bottom: 4px;">
                        ${currentLang === 'fr' ? 'Votre message :' : 'Your message:'}
                    </label>
                    <textarea id="cf-feedback-text" class="alp-modal-textarea" rows="4" placeholder="${currentLang === 'fr' ? 'Partagez vos impressions, besoins d\'accessibilité ou idées de nouveaux jeux...' : 'Share your impressions, accessibility needs or ideas for new activities...'}" required></textarea>
                </div>

                <div>
                    <label style="font-size: 0.82rem; font-weight: 800; color: var(--text-primary); display: block; margin-bottom: 4px;">
                        ${currentLang === 'fr' ? 'Votre contact (facultatif si vous souhaitez une réponse) :' : 'Your contact (optional if you want a reply):'}
                    </label>
                    <input type="text" id="cf-replyto-input" class="alp-modal-input" placeholder="${currentLang === 'fr' ? 'Ex: mon.email@domaine.com' : 'e.g. my.email@example.com'}">
                </div>

                <div id="cf-status-banner" style="display: none; padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; font-weight: bold; text-align: center;"></div>

                <div class="modal-buttons" style="margin-top: 10px;">
                    <button type="button" class="modal-btn cancel-btn" id="cf-modal-cancel">
                        ${currentLang === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                    <button type="button" class="modal-btn save-btn" id="cf-modal-send">
                        ✉️ ${currentLang === 'fr' ? 'Envoyer mon message' : 'Send message'}
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';

        const textarea = document.getElementById('cf-feedback-text');
        setTimeout(() => textarea?.focus(), 60);

        document.getElementById('cf-modal-cancel')?.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.getElementById('cf-modal-send')?.addEventListener('click', async () => {
            const message = (textarea?.value || '').trim();
            if (!message) {
                alert(currentLang === 'fr' ? 'Veuillez écrire un message avant d\'envoyer.' : 'Please enter a message before sending.');
                return;
            }

            const sendBtn = document.getElementById('cf-modal-send');
            if (sendBtn) {
                sendBtn.disabled = true;
                sendBtn.innerText = currentLang === 'fr' ? '⏳ Envoi en cours...' : '⏳ Sending...';
            }

            const payload = {
                role: document.getElementById('cf-role-select')?.value || 'parent',
                feedbackType: document.getElementById('cf-type-select')?.value || 'general',
                message,
                replyTo: (document.getElementById('cf-replyto-input')?.value || '').trim(),
                activityId: currentActivityId || 'hub',
                nickname: currentNickname || 'Anonymous'
            };

            try {
                await fetch('/api/send-feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const banner = document.getElementById('cf-status-banner');
                if (banner) {
                    banner.style.display = 'block';
                    banner.style.background = '#ECFDF5';
                    banner.style.color = '#065F46';
                    banner.innerText = currentLang === 'fr' ? '✅ Merci beaucoup ! Votre message a bien été transmis.' : '✅ Thank you! Your feedback has been sent.';
                }
                setTimeout(() => { modal.style.display = 'none'; }, 2200);
            } catch (err) {
                alert(currentLang === 'fr' ? '✅ Merci ! Votre message a été enregistré localement.' : '✅ Thank you! Your message was saved.');
                modal.style.display = 'none';
            }
        });
    }

    // Global Event Delegation for Contact / Feedback Button
    document.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest && e.target.closest('#open-contact-feedback-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            openContactFeedbackModal();
        }
    });

    // Bookmarking & Favorites Management (Persisted per Child Profile)
    function getBookmarksKey() {
        const nick = (currentNickname || 'default').trim().toLowerCase();
        return `alp_bookmarks_${nick}`;
    }

    function getBookmarkedActivities() {
        return JSON.parse(localStorage.getItem(getBookmarksKey()) || '[]');
    }

    function toggleBookmarkActivity(activityId) {
        let list = getBookmarkedActivities();
        const exists = list.includes(activityId);
        if (exists) {
            list = list.filter(id => id !== activityId);
        } else {
            list.push(activityId);
        }
        localStorage.setItem(getBookmarksKey(), JSON.stringify(list));
        updateBookmarksUI();
        return !exists;
    }

    function normalizeSearchText(str) {
        if (!str) return '';
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function applyHubFilters() {
        if (!isHubPage()) return;

        const bookmarks = getBookmarkedActivities();
        const activeCategory = localStorage.getItem('alp_hub_active_category') || 'all';
        const activeLang = localStorage.getItem('alp_lang') || document.documentElement.lang || 'fr';
        let activeAge = localStorage.getItem('alp_hub_active_age') || 'all';
        if (activeAge !== 'all' && activeAge !== '3-6' && activeAge !== '6-10') {
            activeAge = 'all';
            localStorage.setItem('alp_hub_active_age', 'all');
        }
        const searchInput = document.getElementById('hub-search-input');
        const clearBtn = document.getElementById('hub-search-clear');
        const rawQuery = (searchInput && searchInput.value) || '';
        const query = normalizeSearchText(rawQuery);

        if (clearBtn) {
            clearBtn.style.display = rawQuery.length > 0 ? 'flex' : 'none';
        }

        const favCountBadge = document.getElementById('count-fav');
        if (favCountBadge) favCountBadge.innerText = bookmarks.length;

        // Update bookmark buttons state
        document.querySelectorAll('.activity-bookmark-btn').forEach(btn => {
            const actId = btn.getAttribute('data-activity');
            const isFav = bookmarks.includes(actId);
            btn.classList.toggle('is-bookmarked', isFav);
            btn.title = isFav ? (activeLang === 'fr' ? 'Retirer des favoris' : 'Remove from favorites') : (activeLang === 'fr' ? 'Ajouter aux favoris' : 'Add to favorites');
            const star = btn.querySelector('.bookmark-star');
            if (star) star.innerText = isFav ? '⭐' : '☆';
        });

        const cards = document.querySelectorAll('.activities-grid .activity-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const actId = card.getAttribute('data-activity') || '';
            const cat = card.getAttribute('data-category') || 'all';
            const cardAge = card.getAttribute('data-age') || '3-6';
            const keywords = normalizeSearchText(card.getAttribute('data-keywords') || '');
            const titleEl = card.querySelector('.activity-card-title');
            const descEl = card.querySelector('.activity-card-desc');
            const titleText = normalizeSearchText(titleEl ? titleEl.innerText : '');
            const descText = normalizeSearchText(descEl ? descEl.innerText : '');

            // 1. Favorite check
            const matchesFav = (activeCategory !== 'fav') || bookmarks.includes(actId);

            // 2. Category check
            const matchesCat = (activeCategory === 'all' || activeCategory === 'fav') || (cat === activeCategory);

            // 3. Age check (3-6 years category matches all current platform games)
            const matchesAge = (activeAge === 'all') || (activeAge === '3-6' && cardAge === '3-6') || (cardAge === activeAge);

            // 4. Search query check
            let matchesSearch = true;
            if (query) {
                matchesSearch = titleText.includes(query) || descText.includes(query) || keywords.includes(query) || cat.includes(query);
            }

            const isVisible = matchesFav && matchesCat && matchesAge && matchesSearch;
            card.style.display = isVisible ? 'flex' : 'none';
            if (isVisible) visibleCount++;
        });

        // Results counter chip
        const countBadge = document.getElementById('hub-results-count');
        if (countBadge) {
            countBadge.innerText = `${visibleCount} ${activeLang === 'fr' ? (visibleCount <= 1 ? 'activité' : 'activités') : (visibleCount <= 1 ? 'activity' : 'activities')}`;
        }

        // Empty state banners
        const emptyFavHint = document.getElementById('empty-favorites-hint');
        if (emptyFavHint) {
            emptyFavHint.style.display = (activeCategory === 'fav' && visibleCount === 0 && !query) ? 'flex' : 'none';
        }

        const emptySearchHint = document.getElementById('empty-search-hint');
        if (emptySearchHint) {
            emptySearchHint.style.display = (visibleCount === 0 && (query.length > 0 || activeCategory !== 'fav')) ? 'flex' : 'none';
        }

        // Category pills UI sync
        document.querySelectorAll('.hub-filter-pill').forEach(pill => {
            const pillCat = pill.getAttribute('data-category') || 'all';
            const isActive = pillCat === activeCategory;
            pill.classList.toggle('active', isActive);
            pill.setAttribute('aria-selected', String(isActive));
        });

        // Age chips UI sync
        document.querySelectorAll('.hub-age-chip').forEach(chip => {
            const chipAge = chip.getAttribute('data-age') || 'all';
            const isActive = chipAge === activeAge;
            chip.classList.toggle('active', isActive);
        });
    }

    function updateBookmarksUI() {
        applyHubFilters();
    }

    function setupFilterBar() {
        if (!isHubPage()) return;

        // Category pills
        document.querySelectorAll('.hub-filter-pill').forEach(pill => {
            if (!pill.dataset.bound) {
                pill.dataset.bound = 'true';
                pill.onclick = () => {
                    const cat = pill.getAttribute('data-category') || 'all';
                    localStorage.setItem('alp_hub_active_category', cat);
                    applyHubFilters();
                };
            }
        });

        // Age filter chips
        document.querySelectorAll('.hub-age-chip').forEach(chip => {
            if (!chip.dataset.bound) {
                chip.dataset.bound = 'true';
                chip.onclick = () => {
                    const age = chip.getAttribute('data-age') || 'all';
                    localStorage.setItem('alp_hub_active_age', age);
                    applyHubFilters();
                };
            }
        });

        // Search Input
        const searchInput = document.getElementById('hub-search-input');
        if (searchInput && !searchInput.dataset.bound) {
            searchInput.dataset.bound = 'true';
            searchInput.addEventListener('input', () => {
                applyHubFilters();
            });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    applyHubFilters();
                }
            });
        }

        // Search Clear Button
        const clearBtn = document.getElementById('hub-search-clear');
        if (clearBtn && !clearBtn.dataset.bound) {
            clearBtn.dataset.bound = 'true';
            clearBtn.onclick = () => {
                if (searchInput) searchInput.value = '';
                applyHubFilters();
                if (searchInput) searchInput.focus();
            };
        }

        // Reset Filters Button
        const resetBtn = document.getElementById('hub-reset-btn');
        if (resetBtn && !resetBtn.dataset.bound) {
            resetBtn.dataset.bound = 'true';
            resetBtn.onclick = () => {
                if (searchInput) searchInput.value = '';
                localStorage.setItem('alp_hub_active_category', 'all');
                localStorage.setItem('alp_hub_active_age', 'all');
                applyHubFilters();
            };
        }

        applyHubFilters();
    }

    // Global Event Delegation for Activity Bookmark Stars
    document.addEventListener('click', (e) => {
        const starBtn = e.target && e.target.closest && e.target.closest('.activity-bookmark-btn');
        if (starBtn) {
            e.preventDefault();
            e.stopPropagation();
            const actId = starBtn.getAttribute('data-activity');
            if (actId) {
                toggleBookmarkActivity(actId);
            }
        }
    });

    // Public API for Game Engines & Pages
    window.AlpTracker = {
        initSession,
        showProfileModal,
        selectProfile,
        openContactFeedbackModal,
        toggleBookmark: toggleBookmarkActivity,
        getBookmarks: getBookmarkedActivities,
        updateBookmarks: updateBookmarksUI,
        onQuestionStart,
        onAttempt,
        onTrialSuccess,
        submitFeedback,
        getNickname: () => currentNickname || (currentLang === 'fr' ? 'Joueur' : 'Player'),
        getSessionId: () => activeSessionId,
        refreshRecommendations: loadDashboardRecommendations,
        refreshLikes: loadDashboardLikes,
        refreshConnections: loadConnectionsCount,
        applyHubFilters: applyHubFilters
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
