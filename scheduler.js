// scripts/scheduler.js
/**
 * Room for Improvement – Hotel Management System
 * Scheduler Module
 */
const schedulerModule = {
    scheduleData: {},
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    shifts: ['morning', 'afternoon', 'night'],
    async init() {
        try {
            console.log('📅 Initializing Scheduler...');
            this.scheduleData = RoomForImprovementSystem.storage.get('schedule_data') || {};
            RoomForImprovementSystem.modules.scheduler = this;
            this.populateStaffDropdowns();
            console.log('✅ Scheduler initialized');
        } catch (error) {
            console.warn('❌ Scheduler init failed:', error);
        }
    },
    populateStaffDropdowns() {
        const staffSelect = document.getElementById('staff-select');
        const laundryStaff = document.getElementById('laundry-staff');
        staffSelect.innerHTML = '<option value="">Assign staff...</option>';
        laundryStaff.innerHTML = '<option value="">Assign staff...</option>';
        const staffData = RoomForImprovementSystem.storage.get('staff_data') || [];
        staffData.filter(s => s.role === 'staff').forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.id;
            option.textContent = staff.name;
            staffSelect.appendChild(option.cloneNode(true));
            laundryStaff.appendChild(option);
        });
    },
    updateShift(staffId, day, shift, roomId) {
        if (!RoomForImprovementAuth.hasMinRole('supervisor')) return false;
        if (!this.days.includes(day) || !this.shifts.includes(shift)) return false;
        const weekId = `week_${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) + RoomForImprovementSystem.state.currentWeek}`;
        this.scheduleData[weekId] = this.scheduleData[weekId] || {};
        this.scheduleData[weekId][day] = this.scheduleData[weekId][day] || {};
        this.scheduleData[weekId][day][shift] = this.scheduleData[weekId][day][shift] || [];
        if (!this.scheduleData[weekId][day][shift].some(s => s.staffId === staffId)) {
            this.scheduleData[weekId][day][shift].push({ staffId, roomId });
        }
        RoomForImprovementSystem.storage.set('schedule_data', this.scheduleData);
        RoomForImprovementSystem.events.emit('shiftUpdated', { staffId, day, shift, weekId, roomId });
        return true;
    },
    renderCalendar() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + (RoomForImprovementSystem.state.currentWeek * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        document.getElementById('current-week').textContent = `Week of ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}`;
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';
        const weekId = `week_${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) + RoomForImprovementSystem.state.currentWeek}`;
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            const dayName = this.days[i];
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            dayElement.appendChild(dayHeader);
            const shifts = this.scheduleData[weekId]?.[dayName] || {};
            this.shifts.forEach(shift => {
                const shiftElement = document.createElement('div');
                shiftElement.className = 'calendar-event';
                shiftElement.textContent = shift;
                const staffList = shifts[shift] || [];
                staffList.forEach(({ staffId, roomId }) => {
                    const staff = RoomForImprovementSystem.storage.get('staff_data')?.find(s => s.id === staffId);
                    const room = RoomForImprovementSystem.modules.rooms.getRoomById(roomId);
                    const staffItem = document.createElement('div');
                    staffItem.textContent = `${staff?.name || 'Unknown'} (${room ? room[`name_${RoomForImprovementSystem.state.currentLanguage}`] : 'No Room'})`;
                    shiftElement.appendChild(staffItem);
                });
                dayElement.appendChild(shiftElement);
            });
            calendarGrid.appendChild(dayElement);
        }
    },
    generateSchedule() {
        if (!RoomForImprovementAuth.hasMinRole('supervisor')) return;
        const date = document.getElementById('schedule-date').valueAsDate;
        const shift = document.getElementById('schedule-shift').value;
        const dayName = this.days[date.getDay()];
        const staffId = document.getElementById('staff-select').value;
        const roomId = RoomForImprovementSystem.state.currentRoom;
        if (!staffId || !roomId) {
            alert(RoomForImprovementSystem.modules.i18n.t('select_staff_room'));
            return;
        }
        this.updateShift(staffId, dayName, shift, roomId);
        this.renderCalendar();
        alert(RoomForImprovementSystem.modules.i18n.t('schedule_generated'));
    },
    getState() {
        return { scheduleData: this.scheduleData };
    },
    handleQuery(query) {
        if (query.match(/working tomorrow morning/i)) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const day = tomorrow.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const weekId = `week_${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))}`;
            const staff = this.scheduleData[weekId]?.[day]?.morning?.map(s => {
                const staffData = RoomForImprovementSystem.storage.get('staff_data')?.find(st => st.id === s.staffId);
                return staffData?.name || 'Unknown';
            }) || [];
            return { response: `Morning shift tomorrow: ${staff.join(', ') || 'None'}` };
        }
        return { response: 'Unknown schedule query' };
    }
};

RoomForImprovementSystem.registerModule('scheduler', schedulerModule);