// scripts/maintenance.js
/**
 * Room for Improvement – Hotel Management System
 * Maintenance Module
 */
const maintenanceModule = {
    issues: [],
    async init() {
        try {
            console.log('🔧 Initializing Maintenance...');
            this.issues = RoomForImprovementSystem.storage.get('maintenance_data') || [];
            RoomForImprovementSystem.modules.maintenance = this;
            this.updateIssues();
            console.log('✅ Maintenance initialized');
        } catch (error) {
            console.warn('❌ Maintenance init failed:', error);
        }
    },
    submitIssue(e) {
        e.preventDefault();
        if (!RoomForImprovementAuth.hasPermission('report_maintenance')) return;
        const issue = {
            id: Date.now(),
            room: document.getElementById('issue-room').value,
            type: document.getElementById('issue-type').value,
            description: document.getElementById('issue-description').value,
            urgency: document.getElementById('issue-urgency').value,
            reportedBy: RoomForImprovementSystem.modules.auth.currentUser,
            date: new Date().toISOString(),
            status: 'open'
        };
        this.issues.push(issue);
        RoomForImprovementSystem.storage.set('maintenance_data', this.issues);
        document.getElementById('issue-form').reset();
        document.getElementById('issue-modal').classList.remove('active');
        this.updateIssues();
        RoomForImprovementSystem.modules.dashboard.updateDashboard();
        alert(RoomForImprovementSystem.modules.i18n.t('issue_reported'));
    },
    updateIssueStatus(id, newStatus) {
        if (!RoomForImprovementAuth.hasMinRole('supervisor')) return;
        const issue = this.issues.find(i => i.id === id);
        if (!issue) return;
        issue.status = newStatus;
        RoomForImprovementSystem.storage.set('maintenance_data', this.issues);
        this.updateIssues();
        RoomForImprovementSystem.modules.dashboard.updateDashboard();
    },
    updateIssues() {
        const issuesReported = document.getElementById('issues-reported');
        const recentIssues = document.getElementById('recent-issues');
        issuesReported.textContent = `${RoomForImprovementSystem.modules.i18n.t('issues_reported')}: ${this.issues.length}`;
        recentIssues.innerHTML = '';
        const recent = this.issues.slice(-3).reverse();
        recent.forEach(issue => {
            const issueItem = document.createElement('div');
            issueItem.innerHTML = `
                <strong>${issue.room}</strong>: ${issue.description.substring(0, 30)}...
                <button class="action-btn" data-id="${issue.id}" data-action="acknowledge">${RoomForImprovementSystem.modules.i18n.t('acknowledge')}</button>
                <button class="action-btn" data-id="${issue.id}" data-action="in-progress">${RoomForImprovementSystem.modules.i18n.t('in_progress')}</button>
                <button class="action-btn" data-id="${issue.id}" data-action="fixed">${RoomForImprovementSystem.modules.i18n.t('fixed')}</button>
            `;
            recentIssues.appendChild(issueItem);
        });
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const action = btn.getAttribute('data-action');
                this.updateIssueStatus(id, action);
            });
        });
    },
    getState() {
        return { issues: this.issues };
    },
    handleQuery(query) {
        return { response: 'Maintenance query not supported' };
    }
};

RoomForImprovementSystem.registerModule('maintenance', maintenanceModule);