// scripts/rooms.js
/**
 * Room for Improvement – Hotel Management System
 * Rooms Management Module
 */
const roomsModule = {
    rooms: [],
    roomSessions: {},
    roomHistory: {},
    spotChecks: {},
    async init() {
        try {
            const housekeepingData = JSON.parse(localStorage.getItem('housekeepingData') || '{}');
            this.rooms = housekeepingData.rooms || [];
            this.roomHistory = housekeepingData.cleaningStatus || {};
            this.spotChecks = housekeepingData.spotChecks || {};
            
            RoomForImprovementSystem.modules.rooms = this;
            this.populateRoomDropdowns();
        } catch (error) {
            console.warn('Rooms initialization failed:', error);
        }
    },
    populateRoomDropdowns() {
        const roomSelect = document.getElementById('room-select');
        const issueRoomSelect = document.getElementById('issue-room');
        
        if (!roomSelect || !issueRoomSelect) return;
        
        const defaultOption = '<option value="">Select a room...</option>';
        roomSelect.innerHTML = defaultOption;
        issueRoomSelect.innerHTML = defaultOption;
        
        this.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room[`name_${RoomForImprovementSystem.state.currentLanguage}`];
            roomSelect.appendChild(option.cloneNode(true));
            issueRoomSelect.appendChild(option);
        });
    },
    loadRoomTasks(roomId) {
        if (!RoomForImprovementAuth.hasPermission('view_tasks')) return;
        const tasks = this.getTasksForRoom(roomId);
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        const tasksBySection = {};
        tasks.forEach(task => {
            if (!tasksBySection[task.section]) tasksBySection[task.section] = [];
            tasksBySection[task.section].push(task);
        });
        for (const section in tasksBySection) {
            const sectionHeader = document.createElement('h4');
            sectionHeader.textContent = section;
            sectionHeader.style.margin = '15px 0 5px';
            sectionHeader.style.color = 'var(--secondary-color)';
            taskList.appendChild(sectionHeader);
            tasksBySection[section].forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                if (task.done) taskItem.classList.add('completed');
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''}>
                    <span>${task[`name_${RoomForImprovementSystem.state.currentLanguage}`]}</span>
                `;
                taskItem.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'INPUT') {
                        RoomForImprovementSystem.state.currentTask = task;
                        this.showTaskModal(task);
                    }
                });
                const checkbox = taskItem.querySelector('.task-checkbox');
                checkbox.addEventListener('change', () => {
                    task.done = checkbox.checked;
                    taskItem.classList.toggle('completed', checkbox.checked);
                    this.updateTaskStatus(roomId, task.id, task.done);
                    this.checkAllTasksCompleted(roomId);
                });
                taskList.appendChild(taskItem);
            });
        }
        this.checkAllTasksCompleted(roomId);
        const room = this.rooms.find(r => r.id === roomId);
        const startCleaningBtn = document.getElementById('start-cleaning');
        startCleaningBtn.disabled = room.status !== 'pending';
        startCleaningBtn.textContent = RoomForImprovementSystem.modules.i18n.t(room.status === 'in-progress' ? 'continue_cleaning' : 'start_cleaning');
    },
    getTasksForRoom(roomId) {
        const tasksData = RoomForImprovementSystem.storage.get('tasks_data') || [];
        return tasksData.filter(t => t.roomId === roomId).map(task => ({
            ...task,
            done: this.roomSessions[roomId]?.tasksCompleted?.includes(task.id) || false
        }));
    },
    startCleaning() {
        if (!RoomForImprovementAuth.hasPermission('complete_tasks')) return;
        const staffId = document.getElementById('staff-select').value;
        const roomId = RoomForImprovementSystem.state.currentRoom;
        if (!staffId) {
            alert(RoomForImprovementSystem.modules.i18n.t('select_staff'));
            return;
        }
        if (!roomId) {
            alert(RoomForImprovementSystem.modules.i18n.t('select_room'));
            return;
        }
        const room = this.rooms.find(r => r.id === roomId);
        room.status = 'in-progress';
        this.roomSessions[roomId] = {
            sessionId: `session_${Date.now()}`,
            roomId,
            staffId,
            startTime: new Date().toISOString(),
            tasksCompleted: []
        };
        this.roomHistory[roomId] = this.roomHistory[roomId] || [];
        this.roomHistory[roomId].push({ ...this.roomSessions[roomId] });
        RoomForImprovementSystem.storage.set('room_data', this.rooms);
        RoomForImprovementSystem.storage.set('task_history', this.roomHistory);
        const startCleaningBtn = document.getElementById('start-cleaning');
        startCleaningBtn.disabled = true;
        startCleaningBtn.textContent = RoomForImprovementSystem.modules.i18n.t('cleaning_in_progress');
        this.updateRoomStatusList();
        RoomForImprovementSystem.modules.dashboard.updateDashboard();
    },
    completeCleaning() {
        if (!RoomForImprovementAuth.hasMinRole('supervisor')) return;
        const roomId = RoomForImprovementSystem.state.currentRoom;
        const session = this.roomSessions[roomId];
        if (!session) return;
        session.endTime = new Date().toISOString();
        session.duration = Math.round((new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60));
        const room = this.rooms.find(r => r.id === roomId);
        room.status = 'completed';
        room.lastCleaned = new Date().toISOString();
        this.roomHistory[roomId].push({ ...session });
        delete this.roomSessions[roomId];
        RoomForImprovementSystem.storage.set('room_data', this.rooms);
        RoomForImprovementSystem.storage.set('task_history', this.roomHistory);
        document.getElementById('start-cleaning').textContent = RoomForImprovementSystem.modules.i18n.t('completed');
        document.getElementById('complete-cleaning').disabled = true;
        this.updateRoomStatusList();
        RoomForImprovementSystem.modules.dashboard.updateDashboard();
        alert(RoomForImprovementSystem.modules.i18n.t('cleaning_completed'));
    },
    updateTaskStatus(roomId, taskId, done) {
        const session = this.roomSessions[roomId];
        if (!session) return;
        if (done) {
            if (!session.tasksCompleted.includes(taskId)) {
                session.tasksCompleted.push(taskId);
            }
        } else {
            session.tasksCompleted = session.tasksCompleted.filter(id => id !== taskId);
        }
        RoomForImprovementSystem.storage.set('task_history', this.roomHistory);
    },
    checkAllTasksCompleted(roomId) {
        const tasks = this.getTasksForRoom(roomId);
        const allDone = tasks.every(task => task.done);
        document.getElementById('complete-cleaning').disabled = !allDone;
    },
    showTaskModal(task) {
        document.getElementById('task-modal-title').textContent = task.section;
        document.getElementById('task-modal-content').innerHTML = `
            <p><strong>${RoomForImprovementSystem.modules.i18n.t('task')}:</strong> ${task[`name_${RoomForImprovementSystem.state.currentLanguage}`]}</p>
            <p><strong>${RoomForImprovementSystem.modules.i18n.t('status')}:</strong> ${task.done ? RoomForImprovementSystem.modules.i18n.t('completed') : RoomForImprovementSystem.modules.i18n.t('pending')}</p>
        `;
        document.getElementById('complete-task').textContent = task.done ? RoomForImprovementSystem.modules.i18n.t('mark_incomplete') : RoomForImprovementSystem.modules.i18n.t('complete_task');
        document.getElementById('complete-task').onclick = () => {
            task.done = !task.done;
            this.updateTaskStatus(RoomForImprovementSystem.state.currentRoom, task.id, task.done);
            this.loadRoomTasks(RoomForImprovementSystem.state.currentRoom);
            document.getElementById('task-modal').classList.remove('active');
        };
        document.getElementById('add-comment').onclick = () => {
            const comment = prompt(RoomForImprovementSystem.modules.i18n.t('enter_comment'));
            if (comment) {
                task.comments = task.comments || [];
                task.comments.push({ text: comment, date: new Date().toISOString() });
                RoomForImprovementSystem.storage.set('tasks_data', this.tasks);
            }
        };
        document.getElementById('task-modal').classList.add('active');
    },
    updateRoomStatusList() {
        const roomStatusList = document.getElementById('room-status-list');
        roomStatusList.innerHTML = '';
        this.rooms.forEach(room => {
            const roomItem = document.createElement('div');
            roomItem.className = 'room-status-item';
            const statusColor = room.status === 'completed' ? 'var(--success-color)' :
                               room.status === 'in-progress' ? 'var(--warning-color)' : 'var(--danger-color)';
            roomItem.innerHTML = `
                <span>${room[`name_${RoomForImprovementSystem.state.currentLanguage}`]}</span>
                <span style="color: ${statusColor}">${RoomForImprovementSystem.modules.i18n.t(room.status)}</span>
            `;
            roomStatusList.appendChild(roomItem);
        });
    },
    performSpotCheck(roomId, checkerRole, passed) {
        if (!RoomForImprovementAuth.hasMinRole(checkerRole)) return false;
        const today = new Date().toDateString();
        this.spotChecks[today] = this.spotChecks[today] || {};
        this.spotChecks[today][roomId] = this.spotChecks[today][roomId] || {};
        if (checkerRole === 'supervisor' && this.spotChecks[today][roomId].supervisor) return false;
        if (checkerRole === 'manager' && this.spotChecks[today][roomId].manager) return false;
        this.spotChecks[today][roomId][checkerRole] = { passed, timestamp: new Date().toISOString() };
        RoomForImprovementSystem.storage.set('spot_checks', this.spotChecks);
        RoomForImprovementSystem.modules.dashboard.updateDashboard();
        return true;
    },
    getState() {
        return { rooms: this.rooms, roomSessions: this.roomSessions, roomHistory: this.roomHistory, spotChecks: this.spotChecks };
    },
    handleQuery(query) {
        const q = query.toLowerCase();
        if (q.includes('who cleaned') && q.includes('room')) {
            const roomMatch = q.match(/room\s+(\w+)/i);
            if (roomMatch) {
                const roomId = roomMatch[1].toLowerCase();
                const room = this.getRoomById(roomId);
                if (!room) return { response: `Room ${roomId} not found.` };
                const lastSession = this.roomHistory[roomId]?.slice(-1)[0];
                if (!lastSession) return { response: `Room ${roomId} has not been cleaned recently.` };
                const staff = RoomForImprovementSystem.storage.get('staff_data')?.find(s => s.id === lastSession.staffId);
                const timestamp = new Date(lastSession.startTime).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                });
                return { response: `Room ${roomId} (${room.name_en}) was cleaned by ${staff?.name || 'Unknown'} on ${timestamp}.` };
            }
        }
        if (q.includes('overdue')) {
            const overdueRooms = this.rooms.filter(r => r.status === 'dirty').map(r => r.name_en).join(', ');
            return { response: `Overdue rooms: ${overdueRooms || 'None'}` };
        }
        return { response: 'Unknown room query' };
    }
};

RoomForImprovementSystem.modules.rooms = roomsModule;