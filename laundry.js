// scripts/laundry.js
/**
 * Room for Improvement – Hotel Management System
 * Laundry Module
 */
const laundryModule = {
    laundryItems: [],
    async init() {
        try {
            console.log('🧺 Initializing Laundry...');
            this.laundryItems = RoomForImprovementSystem.storage.get('laundry_data') || [];
            RoomForImprovementSystem.modules.laundry = this;
            this.renderLaundryList();
            console.log('✅ Laundry initialized');
        } catch (error) {
            console.warn('❌ Laundry init failed:', error);
        }
    },
    addLaundry() {
        if (!RoomForImprovementAuth.hasPermission('update_laundry_own')) return;
        const type = document.getElementById('laundry-type').value;
        const quantity = parseInt(document.getElementById('laundry-quantity').value) || 1;
        const staffId = document.getElementById('laundry-staff').value;
        const roomId = RoomForImprovementSystem.state.currentRoom;
        if (!staffId || !roomId) {
            alert(RoomForImprovementSystem.modules.i18n.t('select_staff_room'));
            return;
        }
        const staff = RoomForImprovementSystem.storage.get('staff_data')?.find(s => s.id === staffId);
        const laundryItem = {
            id: Date.now(),
            type,
            quantity,
            roomId,
            assignedTo: staff?.name || 'Unknown',
            staffId,
            date: new Date().toISOString(),
            status: 'pending'
        };
        this.laundryItems.push(laundryItem);
        RoomForImprovementSystem.storage.set('laundry_data', this.laundryItems);
        document.getElementById('laundry-quantity').value = '1';
        this.renderLaundryList();
        RoomForImprovementSystem.modules.dashboard.updateDashboard();
        alert(RoomForImprovementSystem.modules.i18n.t('laundry_added'));
    },
    updateLaundryStatus(id, newStatus) {
        if (!RoomForImprovementAuth.hasMinRole('supervisor')) return;
        const item = this.laundryItems.find(i => i.id === id);
        if (!item) return;
        item.status = newStatus;
        RoomForImprovementSystem.storage.set('laundry_data', this.laundryItems);
        this.renderLaundryList();
        RoomForImprovementSystem.modules.dashboard.updateDashboard();
    },
    renderLaundryList() {
        const laundryList = document.getElementById('laundry-list');
        laundryList.innerHTML = '';
        const currentTab = RoomForImprovementSystem.state.currentLaundryTab;
        const items = this.laundryItems.filter(item => item.status === currentTab);
        if (items.length === 0) {
            laundryList.innerHTML = `<div class="empty-state">${RoomForImprovementSystem.modules.i18n.t('no_items')}</div>`;
            return;
        }
        items.forEach(item => {
            const laundryItem = document.createElement('div');
            laundryItem.className = 'laundry-item';
            const typeText = RoomForImprovementSystem.modules.i18n.t(item.type);
            const room = RoomForImprovementSystem.modules.rooms.getRoomById(item.roomId);
            laundryItem.innerHTML = `
                <div class="laundry-info">
                    <strong>${typeText}</strong> (${item.quantity})
                    <div>${RoomForImprovementSystem.modules.i18n.t('assigned_to')} ${item.assignedTo}</div>
                    <div>${RoomForImprovementSystem.modules.i18n.t('room')}: ${room ? room[`name_${RoomForImprovementSystem.state.currentLanguage}`] : 'Unknown'}</div>
                </div>
                <div class="laundry-actions">
                    ${currentTab === 'pending' ? `
                        <button class="progress-btn" data-id="${item.id}">${RoomForImprovementSystem.modules.i18n.t('start')}</button>
                    ` : ''}
                    ${currentTab === 'in-progress' ? `
                        <button class="complete-btn" data-id="${item.id}">${RoomForImprovementSystem.modules.i18n.t('complete')}</button>
                    ` : ''}
                </div>
            `;
            laundryList.appendChild(laundryItem);
        });
        document.querySelectorAll('.progress-btn').forEach(btn => {
            btn.addEventListener('click', () => this.updateLaundryStatus(parseInt(btn.getAttribute('data-id')), 'in-progress'));
        });
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.updateLaundryStatus(parseInt(btn.getAttribute('data-id')), 'completed'));
        });
    },
    getState() {
        return { laundryItems: this.laundryItems };
    },
    handleQuery(query) {
        return { response: 'Laundry query not supported' };
    }
};

RoomForImprovementSystem.registerModule('laundry', laundryModule);