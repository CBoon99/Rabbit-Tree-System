// scripts/main.js
/**
 * Room for Improvement – Hotel Management System
 * Main Application Controller
 */
const RoomForImprovementSystem = {
    version: '1.0.0',
    buildDate: '2025-06-01',
    state: {
        initialized: false,
        currentUser: null,
        currentRole: null,
        currentLanguage: 'en',
        currentRoom: null,
        currentTask: null,
        currentLaundryTab: 'pending',
        currentWeek: 0
    },
    modules: {},
    plugins: { frontOfHouse: {}, backOfHouse: {} },
    events: {
        listeners: {},
        on(event, callback) {
            this.listeners[event] = this.listeners[event] || [];
            this.listeners[event].push(callback);
        },
        emit(event, data) {
            this.listeners[event]?.forEach(cb => {
                try {
                    cb(data);
                } catch (error) {
                    console.warn(`Error in event ${event}:`, error);
                }
            });
        }
    },
    storage: {
        set(key, value) {
            try {
                const data = { value, timestamp: Date.now(), version: RoomForImprovementSystem.version };
                localStorage.setItem(`rfi_${key}`, JSON.stringify(data));
                return true;
            } catch (error) {
                console.warn('Storage set error:', error);
                return false;
            }
        },
        get(key) {
            try {
                const item = localStorage.getItem(`rfi_${key}`);
                return item ? JSON.parse(item).value : null;
            } catch (error) {
                console.warn('Storage get error:', error);
                return null;
            }
        }
    },
    async init() {
        try {
            console.log('🏨 Initializing RFI...');
            window.addEventListener('online', () => this.state.onlineStatus = true);
            window.addEventListener('offline', () => this.state.onlineStatus = false);

            // Auto-detect language
            const browserLang = navigator.language.split('-')[0];
            this.state.currentLanguage = ['en', 'id', 'mnc'].includes(browserLang) ? browserLang : 'en';
            this.storage.set('language_pref', this.state.currentLanguage);

            const moduleOrder = ['auth', 'i18n', 'rooms', 'scheduler', 'laundry', 'maintenance', 'aiManager', 'dashboard'];
            for (const mod of moduleOrder) {
                if (this.modules[mod]) {
                    await this.modules[mod].init();
                }
            }

            // Setup UI listeners
            this.setupUIListeners();
            this.updateUI();

            this.state.initialized = true;
            this.events.emit('systemInitialized');
            console.log('✅ RFI initialized');
        } catch (error) {
            console.warn('❌ RFI init failed:', error);
        }
    },
    setupUIListeners() {
        const sectionLinks = document.querySelectorAll('.main-nav li');
        sectionLinks.forEach(link => {
            link.addEventListener('click', () => {
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        document.getElementById('language-toggle').addEventListener('click', () => this.modules.i18n.toggleLanguage());
        document.getElementById('room-select').addEventListener('change', (e) => {
            this.state.currentRoom = e.target.value;
            if (this.state.currentRoom) {
                this.modules.rooms.loadRoomTasks(this.state.currentRoom);
                document.getElementById('current-room').textContent = this.state.currentRoom;
            }
        });
        document.getElementById('start-cleaning').addEventListener('click', () => this.modules.rooms.startCleaning());
        document.getElementById('complete-cleaning').addEventListener('click', () => this.modules.rooms.completeCleaning());
        document.getElementById('report-issue').addEventListener('click', () => document.getElementById('issue-modal').classList.add('active'));
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => btn.closest('.modal').classList.remove('active'));
        });
        document.getElementById('issue-form').addEventListener('submit', (e) => this.modules.maintenance.submitIssue(e));
        document.querySelectorAll('.laundry-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.laundry-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.state.currentLaundryTab = tab.getAttribute('data-status');
                this.modules.laundry.renderLaundryList();
            });
        });
        document.getElementById('add-laundry').addEventListener('click', () => this.modules.laundry.addLaundry());
        document.getElementById('prev-week').addEventListener('click', () => {
            this.state.currentWeek--;
            this.modules.scheduler.renderCalendar();
        });
        document.getElementById('next-week').addEventListener('click', () => {
            this.state.currentWeek++;
            this.modules.scheduler.renderCalendar();
        });
        document.getElementById('generate-schedule').addEventListener('click', () => this.modules.scheduler.generateSchedule());
    },
    showSection(section) {
        document.querySelectorAll('.main-nav li').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === section);
        });
        document.querySelectorAll('.section-content').forEach(content => {
            content.classList.toggle('active', content.id === `${section}-section`);
        });
        document.getElementById('section-title').textContent = document.querySelector(`#${section}-section h2`)?.textContent || section;
        if (section === 'dashboard' && this.modules.auth.hasMinRole('manager')) {
            this.modules.dashboard.updateDashboard();
        }
    },
    updateUI() {
        document.getElementById('language-toggle').textContent = this.state.currentLanguage.toUpperCase();
        document.querySelectorAll('.main-nav li').forEach(link => {
            if (link.getAttribute('data-section') === 'dashboard') {
                link.classList.toggle('hidden', !this.modules.auth.hasMinRole('manager'));
            }
        });
    },
    registerModule(name, module) {
        this.modules[name] = module;
        if (this.state.initialized && module.init) {
            module.init();
        }
    },
    registerPlugin(category, name, plugin) {
        this.plugins[category][name] = plugin;
        if (this.state.initialized && plugin.init) {
            plugin.init();
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RoomForImprovementSystem.init());
} else {
    RoomForImprovementSystem.init();
}