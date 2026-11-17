// Parent Dashboard & Child Progress Monitoring Engine
// Autism Learning Platform - Actionable insights, strengths identification, and progress tracking.

(() => {
    'use strict';

    let currentLang = localStorage.getItem('alp_lang') || 'en';
    let selectedNickname = localStorage.getItem('alp_profile_nickname') || '';

    const ACTIVITY_METADATA = {
        'find_and_match': {
            icon: '🔍',
            name: { en: 'Find & Match', fr: 'Trouve l\'image' }
        },
        'letters_puzzle': {
            icon: '🔤',
            name: { en: 'Letter Inset Puzzle', fr: 'Puzzle des lettres' }
        },
        'pattern': {
            icon: '🧩',
            name: { en: 'Complete Pattern', fr: 'Complète la suite' }
        },
        'spelling': {
            icon: '🔤',
            name: { en: 'Spell the Word', fr: 'Écris le mot' }
        },
        'sequence': {
            icon: '🦷',
            name: { en: 'Routine Steps', fr: 'Étapes du quotidien' }
        },
        'math': {
            icon: '🔢',
            name: { en: 'Counting & Math', fr: 'Compter & Petits Calculs' }
        },
        'spatial': {
            icon: '🧭',
            name: { en: 'Space & Directions', fr: 'Repérage dans l\'espace' }
        },
        'colors': {
            icon: '🎨',
            name: { en: 'Colors', fr: 'Couleurs' }
        },
        'time': {
            icon: '☀️',
            name: { en: 'Time & Calendar', fr: 'Le Temps & Les Moments' }
        },
        'general': {
            icon: '🌟',
            name: { en: 'General Learning', fr: 'Apprentissages généraux' }
        }
    };

    const UI_STRINGS = {
        en: {
            back: "⬅️ Back to Games",
            title: "📊 Parent Dashboard & Child Progress",
            subtitle: "Observe engagement, celebrate strengths, and guide learning at the child's natural pace.",
            profileLabel: "Child Profile:",
            allChildren: "All Children (Consolidated)",
            refresh: "Refresh",
            kpiTime: "Total Time Spent",
            kpiAccuracy: "Success Rate",
            kpiTrials: "Questions Completed",
            kpiLatency: "Avg Response Time",
            recTitle: "💡 Adaptive Recommendations & Next Steps",
            breakdownTitle: "📈 Performance & Engagement by Activity",
            notesTitle: "📝 Parent & Therapist Observations Log",
            thActivity: "Activity",
            thTrials: "Questions",
            thAccuracy: "Accuracy",
            thAttempts: "Avg Attempts",
            thLatency: "Response Time",
            thReactions: "Feedback",
            thStatus: "Profile Status",
            statusStrength: "🌟 Strength",
            statusLoved: "❤️ Favorite",
            statusPractice: "🎯 Active Practice",
            statusChallenge: "💡 Needs Fading",
            emptyNotes: "No notes recorded yet. You can add observations during play sessions using the 💬 Note button on any activity!",
            noRecs: "Play a few rounds with your child to generate personalized recommendations!",
            noData: "No activity sessions recorded yet for this profile."
        },
        fr: {
            back: "⬅️ Retour aux Jeux",
            title: "📊 Espace Parents & Suivi des Progrès",
            subtitle: "Observer l'engagement, valoriser les réussites et guider l'enfant à son propre rythme.",
            profileLabel: "Profil de l'enfant :",
            allChildren: "Tous les enfants (Vue globale)",
            refresh: "Actualiser",
            kpiTime: "Temps Total Passé",
            kpiAccuracy: "Taux de Réussite",
            kpiTrials: "Questions Réussies",
            kpiLatency: "Temps de Réponse Moyen",
            recTitle: "💡 Recommandations Adaptées & Prochaines Étapes",
            breakdownTitle: "📈 Performance & Engagement par Activité",
            notesTitle: "📝 Journal des Observations (Parents & Thérapeutes)",
            thActivity: "Activité",
            thTrials: "Questions",
            thAccuracy: "Réussite",
            thAttempts: "Essais Moyens",
            thLatency: "Temps de Réponse",
            thReactions: "Appréciation",
            thStatus: "Statut Pédagogique",
            statusStrength: "🌟 Point Fort",
            statusLoved: "❤️ Jeu Favori",
            statusPractice: "🎯 En Consolidation",
            statusChallenge: "💡 Adaptation Conseillée",
            emptyNotes: "Aucune observation enregistrée. Vous pouvez ajouter des notes pendant les sessions de jeu grâce au bouton 💬 Note !",
            noRecs: "Jouez quelques parties pour générer des recommandations personnalisées !",
            noData: "Aucune session enregistrée pour ce profil."
        }
    };

    function updateStaticText() {
        document.documentElement.lang = currentLang;
        const t = UI_STRINGS[currentLang] || UI_STRINGS.en;

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) homeBtn.innerText = t.back;

        document.getElementById('p-title').innerText = t.title;
        document.getElementById('p-subtitle').innerText = t.subtitle;
        document.getElementById('p-profile-label').innerText = t.profileLabel;

        const refreshLabel = document.getElementById('lbl-refresh');
        if (refreshLabel) refreshLabel.innerText = t.refresh;

        document.getElementById('lbl-kpi-time').innerText = t.kpiTime;
        document.getElementById('lbl-kpi-accuracy').innerText = t.kpiAccuracy;
        document.getElementById('lbl-kpi-trials').innerText = t.kpiTrials;
        document.getElementById('lbl-kpi-latency').innerText = t.kpiLatency;

        document.getElementById('p-rec-title').innerText = t.recTitle;
        document.getElementById('p-breakdown-title').innerText = t.breakdownTitle;
        document.getElementById('p-notes-title').innerText = t.notesTitle;

        document.getElementById('th-activity').innerText = t.thActivity;
        document.getElementById('th-trials').innerText = t.thTrials;
        document.getElementById('th-accuracy').innerText = t.thAccuracy;
        document.getElementById('th-attempts').innerText = t.thAttempts;
        document.getElementById('th-latency').innerText = t.thLatency;
        document.getElementById('th-reactions').innerText = t.thReactions;
        document.getElementById('th-status').innerText = t.thStatus;

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
        });
    }

    async function loadProfiles() {
        try {
            const res = await fetch('/api/profiles');
            const data = await res.json();
            const select = document.getElementById('p-profile-select');
            if (!select) return;

            select.innerHTML = '';
            const t = UI_STRINGS[currentLang] || UI_STRINGS.en;

            const allOpt = document.createElement('option');
            allOpt.value = '';
            allOpt.innerText = t.allChildren;
            select.appendChild(allOpt);

            if (data.success && data.profiles) {
                data.profiles.forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = p.nickname;
                    opt.innerText = `${p.emoji || '🌟'} ${p.nickname}`;
                    if (selectedNickname && p.nickname.toLowerCase() === selectedNickname.toLowerCase()) {
                        opt.selected = true;
                    }
                    select.appendChild(opt);
                });
            }

            // New profile creation shortcut
            const newOpt = document.createElement('option');
            newOpt.value = '__new__';
            newOpt.innerText = currentLang === 'fr' ? '➕ Nouveau profil...' : '➕ New Profile...';
            select.appendChild(newOpt);

            select.onchange = (e) => {
                if (e.target.value === '__new__') {
                    if (window.AlpTracker) window.AlpTracker.showProfileModal();
                    select.value = selectedNickname || '';
                    return;
                }
                selectedNickname = e.target.value;
                localStorage.setItem('alp_profile_nickname', selectedNickname);
                loadDashboardData();
            };
        } catch (e) {
            console.error('Error loading profiles:', e);
        }
    }

    async function loadDashboardData() {
        const query = selectedNickname ? `?nickname=${encodeURIComponent(selectedNickname)}` : '';
        try {
            const res = await fetch(`/api/parent/dashboard${query}`);
            const data = await res.json();

            if (data.success && data.analytics) {
                renderDashboard(data.analytics);
            }
        } catch (e) {
            console.error('Error fetching dashboard analytics:', e);
        }
    }

    function renderDashboard(analytics) {
        const t = UI_STRINGS[currentLang] || UI_STRINGS.en;
        const summary = analytics.summary || {};

        // 1. KPI Cards
        document.getElementById('kpi-time').innerText = `${summary.totalDurationMinutes || 0} min`;
        document.getElementById('kpi-accuracy').innerText = `${summary.accuracyRate || 0}%`;
        document.getElementById('kpi-trials').innerText = summary.totalTrials || 0;
        document.getElementById('kpi-latency').innerText = `${summary.avgResponseTimeSec || 0}s`;

        // 2. Recommendations
        const recContainer = document.getElementById('rec-container');
        if (recContainer) {
            recContainer.innerHTML = '';
            const recs = analytics.recommendations || [];

            if (!recs.length) {
                recContainer.innerHTML = `<div class="empty-rec">${t.noRecs}</div>`;
            } else {
                recs.forEach(rec => {
                    const meta = ACTIVITY_METADATA[rec.activityId] || { icon: '🌟', name: { en: rec.activityId, fr: rec.activityId } };
                    const actName = meta.name[currentLang] || meta.name.en;
                    const reason = rec.reason[currentLang] || rec.reason.en;

                    let badgeClass = 'rec-confidence';
                    let badgeTitle = 'Confidence Booster';
                    if (rec.type === 'practice_next') {
                        badgeClass = 'rec-practice';
                        badgeTitle = currentLang === 'fr' ? 'À consolider' : 'Practice Next';
                    } else if (rec.type === 'needs_accommodation') {
                        badgeClass = 'rec-fading';
                        badgeTitle = currentLang === 'fr' ? 'Adaptation conseillée' : 'Fading Recommended';
                    } else {
                        badgeTitle = currentLang === 'fr' ? 'Point Fort' : 'Confidence Booster';
                    }

                    const card = document.createElement('div');
                    card.className = `rec-card ${badgeClass}`;
                    card.innerHTML = `
                        <div class="rec-header">
                            <span class="rec-badge-pill">${badgeTitle}</span>
                            <span class="rec-activity-name">${meta.icon} ${actName}</span>
                        </div>
                        <p class="rec-reason">${reason}</p>
                    `;
                    recContainer.appendChild(card);
                });
            }
        }

        // 3. Activity Breakdown Table
        const tbody = document.getElementById('analytics-tbody');
        if (tbody) {
            tbody.innerHTML = '';
            const report = analytics.activityReport || [];

            if (!report.length) {
                tbody.innerHTML = `<tr><td colspan="7" class="loading-state">${t.noData}</td></tr>`;
            } else {
                report.forEach(act => {
                    const meta = ACTIVITY_METADATA[act.activityId] || { icon: '🎮', name: { en: act.activityId, fr: act.activityId } };
                    const actName = meta.name[currentLang] || meta.name.en;

                    let statusBadge = `<span class="status-pill status-neutral">${t.statusPractice}</span>`;
                    if (act.tag === 'strength') {
                        statusBadge = `<span class="status-pill status-strength">${t.statusStrength}</span>`;
                    } else if (act.tag === 'loved') {
                        statusBadge = `<span class="status-pill status-loved">${t.statusLoved}</span>`;
                    } else if (act.tag === 'challenge') {
                        statusBadge = `<span class="status-pill status-challenge">${t.statusChallenge}</span>`;
                    }

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="td-activity">
                            <span class="activity-table-icon">${meta.icon}</span>
                            <strong>${actName}</strong>
                        </td>
                        <td>${act.trials}</td>
                        <td>
                            <div class="accuracy-bar-container">
                                <div class="accuracy-bar-fill" style="width: ${act.accuracy}%"></div>
                                <span class="accuracy-text">${act.accuracy}%</span>
                            </div>
                        </td>
                        <td>${act.avgAttempts}</td>
                        <td>${act.avgLatencySec}s</td>
                        <td>
                            <span class="reaction-tag">👍 ${act.likes}</span>
                            <span class="reaction-tag">👎 ${act.dislikes}</span>
                        </td>
                        <td>${statusBadge}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }

        // 4. Observations & Notes Log
        const notesContainer = document.getElementById('notes-container');
        if (notesContainer) {
            notesContainer.innerHTML = '';
            const feedbackWithNotes = (analytics.recentFeedback || []).filter(f => f.comment && f.comment.trim());

            if (!feedbackWithNotes.length) {
                notesContainer.innerHTML = `<div class="empty-notes">${t.emptyNotes}</div>`;
            } else {
                feedbackWithNotes.forEach(fb => {
                    const meta = ACTIVITY_METADATA[fb.activityId] || { icon: '💬', name: { en: fb.activityId, fr: fb.activityId } };
                    const actName = meta.name[currentLang] || meta.name.en;
                    const dateFormatted = new Date(fb.createdAt).toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    const card = document.createElement('div');
                    card.className = 'note-log-card';
                    card.innerHTML = `
                        <div class="note-log-header">
                            <span class="note-author">👤 ${fb.nickname} (${meta.icon} ${actName})</span>
                            <span class="note-date">${dateFormatted}</span>
                        </div>
                        <p class="note-comment">"${fb.comment}"</p>
                    `;
                    notesContainer.appendChild(card);
                });
            }
        }
    }

    function setupLanguageSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const selected = btn.getAttribute('data-lang');
                if (selected === currentLang) return;
                currentLang = selected;
                localStorage.setItem('alp_lang', currentLang);
                updateStaticText();
                loadProfiles();
                loadDashboardData();
            });
        });
    }

    function setupRefreshControls() {
        const refreshBtn = document.getElementById('p-refresh-btn');
        if (refreshBtn) {
            refreshBtn.onclick = () => {
                loadProfiles().then(loadDashboardData);
            };
        }

        // Auto-refresh every 8 seconds for live monitoring
        setInterval(loadDashboardData, 8000);
    }

    function init() {
        updateStaticText();
        setupLanguageSwitcher();
        setupRefreshControls();
        loadProfiles().then(() => {
            loadDashboardData();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
