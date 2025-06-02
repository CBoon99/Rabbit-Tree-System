// scripts/dashboard.js
/**
 * Room for Improvement – Hotel Management System
 * Dashboard Module
 */
const dashboard = {
    mockData: {
        roomsCleaned: 12,
        totalRooms: 20,
        staffOnDuty: 5,
        laundryPending: 8,
        laundryInProgress: 3,
        laundryCompleted: 15,
        spotChecksPassed: 10,
        spotChecksFailed: 2,
        staffList: ['John D.', 'Sarah M.', 'Mike R.', 'Lisa K.', 'Tom B.']
    },

    init() {
        this.updateDashboard();
        this.setupRefresh();
    },

    updateDashboard() {
        // Update rooms cleaned
        document.getElementById('cleaned-today').textContent = 
            `${this.mockData.roomsCleaned}/${this.mockData.totalRooms}`;

        // Update laundry status
        document.getElementById('laundry-pending').textContent = 
            `Pending: ${this.mockData.laundryPending}`;
        document.getElementById('laundry-inprogress').textContent = 
            `In Progress: ${this.mockData.laundryInProgress}`;
        document.getElementById('laundry-completed').textContent = 
            `Completed: ${this.mockData.laundryCompleted}`;

        // Update spot checks
        document.getElementById('spot-checks-passed').textContent = 
            `Passed: ${this.mockData.spotChecksPassed}`;
        document.getElementById('spot-checks-failed').textContent = 
            `Failed: ${this.mockData.spotChecksFailed}`;

        // Update staff on duty
        document.getElementById('staff-on-duty').textContent = 
            this.mockData.staffOnDuty;
        
        // Update staff list
        const staffList = document.getElementById('staff-list');
        staffList.innerHTML = this.mockData.staffList
            .map(staff => `<div class="staff-member">${staff}</div>`)
            .join('');
    },

    setupRefresh() {
        // Refresh dashboard every 5 minutes
        setInterval(() => this.updateDashboard(), 300000);
    },

    register() {
        return {
            name: 'dashboard',
            version: '1.0.0',
            description: 'Owner/Manager dashboard with system overview'
        };
    }
};

RoomForImprovementSystem.modules.dashboard = dashboard;