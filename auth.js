// scripts/auth.js
/**
 * Room for Improvement – Hotel Management System
 * Authentication Module
 */
const authModule = {
    currentUser: null,
    currentRole: null,
    roleHierarchy: { staff: 1, supervisor: 2, manager: 3, owner: 4 },
    permissions: {
        staff: ['view_tasks', 'complete_tasks', 'scan_qr', 'update_laundry_own', 'view_schedule', 'report_maintenance', 'manage_food_orders', 'check_in'],
        supervisor: ['view_tasks', 'complete_tasks', 'scan_qr', 'update_laundry_all', 'edit_schedule', 'resolve_maintenance', 'manage_food_orders', 'check_in', 'manage_bookings'],
        manager: ['view_tasks', 'complete_tasks', 'scan_qr', 'update_laundry_all', 'edit_schedule', 'view_analytics', 'manage_inventory', 'manage_finances', 'check_in', 'manage_bookings'],
        owner: ['all']
    },
    async init() {
        try {
            console.log('🔐 Initializing Auth...');
            this.currentUser = RoomForImprovementSystem.storage.get('user_sessions')?.userId;
            this.currentRole = RoomForImprovementSystem.storage.get('user_sessions')?.role;
            if (!this.currentUser) {
                this.seedDefaultAccounts();
            }
            RoomForImprovementSystem.modules.auth = this;
            this.updateUI();
            RoomForImprovementSystem.events.on('userLoggedIn', () => this.updateUI());
            console.log('✅ Auth initialized');
        } catch (error) {
            console.warn('❌ Auth init failed:', error);
        }
    },
    seedDefaultAccounts() {
        const staffData = RoomForImprovementSystem.storage.get('staff_data') || [];
        if (staffData.length === 0) {
            const defaultStaff = [
                ...Array(15).fill().map((_, i) => ({ id: `staff-${i+1}`, name: `Staff ${i+1}`, role: 'staff' })),
                ...Array(10).fill().map((_, i) => ({ id: `supervisor-${i+1}`, name: `Supervisor ${i+1}`, role: 'supervisor' })),
                { id: 'manager', name: 'Manager One', role: 'manager' },
                { id: 'owner', name: 'Owner One', role: 'owner' }
            ];
            RoomForImprovementSystem.storage.set('staff_data', defaultStaff);
        }
    },
    login(userId, role) {
        try {
            if (!this.roleHierarchy[role]) throw new Error('Invalid role');
            const staffData = RoomForImprovementSystem.storage.get('staff_data') || [];
            if (!staffData.find(s => s.id === userId && s.role === role)) throw new Error('Invalid user');
            this.currentUser = userId;
            this.currentRole = role;
            RoomForImprovementSystem.storage.set('user_sessions', { userId, role });
            RoomForImprovementSystem.events.emit('userLoggedIn', { userId, role });
            return true;
        } catch (error) {
            console.warn('Login failed:', error);
            return false;
        }
    },
    updateUI() {
        const loginSection = document.getElementById('login-section');
        const userDisplay = document.getElementById('user-display');
        const sections = ['rooms-section', 'tasks-section', 'schedule-section', 'analytics-section', 'laundry-section', 'front-office-section', 'dashboard-section'];
        
        if (this.currentUser) {
            if (loginSection) loginSection.classList.add('hidden');
            if (userDisplay) userDisplay.textContent = `${this.currentUser} (${this.currentRole})`;
            
            sections.forEach(id => {
                if (id === 'dashboard-section' && !this.hasMinRole('manager')) return;
                const section = document.getElementById(id);
                if (section) section.classList.remove('hidden');
            });
            
            RoomForImprovementSystem.updateUI();
        } else {
            if (loginSection) loginSection.classList.remove('hidden');
            if (userDisplay) userDisplay.textContent = '';
            
            sections.forEach(id => {
                const section = document.getElementById(id);
                if (section) section.classList.add('hidden');
            });
        }
    },
    hasMinRole(role) {
        return this.roleHierarchy[this.currentRole] >= this.roleHierarchy[role];
    },
    hasPermission(perm) {
        return this.permissions[this.currentRole]?.includes(perm) || this.currentRole === 'owner';
    },
    getState() {
        return { currentUser: this.currentUser, currentRole: this.currentRole };
    },
    handleQuery(query) {
        return { response: 'Auth query not supported' };
    }
};

RoomForImprovementSystem.registerModule('auth', authModule);