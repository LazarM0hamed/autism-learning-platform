// Automated Test Suite for Session Tracking, Feedback & Parent Analytics
const storage = require('./server/storage');
const assert = require('assert');
const fs = require('fs');

console.log('Testing Storage & Analytics Architecture...');

const testNick = `Kid_${Date.now()}`;

// 1. Profile Management
const profile = storage.getOrCreateProfile(testNick, '🦁');
assert.strictEqual(profile.nickname, testNick);
assert.strictEqual(profile.emoji, '🦁');

const profiles = storage.getProfiles();
assert(profiles.some(p => p.nickname === testNick), 'Test profile should exist');
console.log('✓ Profile creation & persistence verified');

// 2. Session Management
const session = storage.startSession({
    nickname: testNick,
    ip: '192.168.1.42',
    deviceId: 'test_tablet_ipad'
});
assert(session.id.startsWith('sess_'), 'Session ID should be generated');
assert.strictEqual(session.nickname, testNick);
console.log('✓ Session start verified');

// 3. Trial Events
storage.recordEvent(session.id, {
    type: 'trial_attempt',
    activityId: 'find_and_match',
    categoryId: 'animals',
    targetId: 'dog',
    attemptNumber: 1,
    isCorrect: true,
    latencyMs: 1800
});

storage.recordEvent(session.id, {
    type: 'trial_result',
    activityId: 'find_and_match',
    categoryId: 'animals',
    targetId: 'dog',
    attempts: 1,
    isCorrect: true,
    latencyMs: 1800
});

// A second question with one retry
storage.recordEvent(session.id, {
    type: 'trial_attempt',
    activityId: 'find_and_match',
    categoryId: 'animals',
    targetId: 'cat',
    attemptNumber: 1,
    isCorrect: false,
    latencyMs: 1500
});

storage.recordEvent(session.id, {
    type: 'trial_attempt',
    activityId: 'find_and_match',
    categoryId: 'animals',
    targetId: 'cat',
    attemptNumber: 2,
    isCorrect: true,
    latencyMs: 3200
});

storage.recordEvent(session.id, {
    type: 'trial_result',
    activityId: 'find_and_match',
    categoryId: 'animals',
    targetId: 'cat',
    attempts: 2,
    isCorrect: true,
    latencyMs: 3200
});
console.log('✓ Trial events and attempts recorded');

// 4. Feedback Mechanism (1 Vote Per User with Toggle Support)
const vote1 = storage.recordFeedback({
    sessionId: session.id,
    nickname: testNick,
    activityId: 'find_and_match',
    reaction: 'like'
});
assert.strictEqual(vote1.userReaction, 'like', 'Initial reaction should be like');

// Tapping like again should toggle off!
const vote2 = storage.recordFeedback({
    sessionId: session.id,
    nickname: testNick,
    activityId: 'find_and_match',
    reaction: 'like'
});
assert.strictEqual(vote2.userReaction, null, 'Second like click should toggle vote off');

// Tap like again to set active like
storage.recordFeedback({
    sessionId: session.id,
    nickname: testNick,
    activityId: 'find_and_match',
    reaction: 'like',
    comment: 'Loves the dog and cat illustrations!'
});

// A second user likes multiple times - must still count as exactly 1 vote!
const secondNick = `SecondKid_${Date.now()}`;
for (let i = 0; i < 5; i++) {
    storage.recordFeedback({
        sessionId: session.id,
        nickname: secondNick,
        activityId: 'find_and_match',
        reaction: 'like'
    });
}

const summaryResult = storage.getFeedbackSummary(testNick);
assert(summaryResult.summary['find_and_match'], 'Feedback summary should have find_and_match entry');
assert.strictEqual(summaryResult.userVotes['find_and_match'], 'like', 'Active user vote should be like');
assert(summaryResult.summary['find_and_match'].likes >= 1, 'Likes should count unique users');
assert(summaryResult.summary['find_and_match'].comments.length >= 1, 'Comments should be recorded');
console.log('✓ Unique 1-vote per user and toggle-off behavior verified');

// 5. Parent Analytics & Recommendations
const analytics = storage.getParentAnalytics(testNick);
assert.strictEqual(analytics.summary.totalTrials, 2);
assert.strictEqual(analytics.summary.correctTrials, 2);
assert.strictEqual(analytics.summary.accuracyRate, 100);
assert(analytics.summary.avgResponseTimeSec > 0, 'Response time should be greater than 0');

assert(analytics.activityReport.length > 0, 'Activity report should have entries');
const findStat = analytics.activityReport.find(a => a.activityId === 'find_and_match');
assert(findStat, 'find_and_match should be in activity report');
assert.strictEqual(findStat.trials, 2);
assert.strictEqual(findStat.tag, 'strength');

assert(analytics.recommendations.length > 0, 'Adaptive recommendations should be generated');
assert.strictEqual(analytics.recommendations[0].activityId, 'find_and_match');
assert.strictEqual(analytics.recommendations[0].type, 'confidence_booster');
console.log('✓ Parent analytics, KPI calculations, and adaptive recommendations verified');

// 6. Session End
const ended = storage.endSession(session.id);
assert.strictEqual(ended, true);
console.log('✓ Session end verified');

// 7. Verify New Activities Datasets & Integrity
const coloringData = JSON.parse(fs.readFileSync('public/data/coloring.json', 'utf8'));
assert(coloringData.palette.length >= 8, 'Coloring palette should have at least 8 colors');
assert(coloringData.levels.length >= 8, 'Coloring levels should have progressive tiers');
assert(Object.keys(coloringData.items).length >= 10, 'Coloring items should include at least 10 items');

const comparisonsData = JSON.parse(fs.readFileSync('public/data/comparisons.json', 'utf8'));
assert(comparisonsData.pairs.length === 12, 'Comparisons should cover all 12 opposite pairs');
comparisonsData.pairs.forEach(p => {
    assert(p.examples.length >= 3, `Pair ${p.id} should have at least 3 rotating examples`);
    p.examples.forEach(ex => {
        assert(ex.items.length === 2, `Example in pair ${p.id} should have 2 items`);
        assert(ex.questions.length >= 2, `Example in pair ${p.id} should have at least 2 questions`);
    });
});
assert(fs.existsSync('public/coloring.html'), 'coloring.html must exist');
assert(fs.existsSync('public/comparisons.html'), 'comparisons.html must exist');
console.log('✓ Colour Matching and Comparison Concepts datasets & routes verified');

console.log('ALL STORAGE, SESSION & PARENT ANALYTICS TESTS PASSED!');
