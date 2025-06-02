// scripts/i18n.js
/**
 * Room for Improvement – Hotel Management System
 * Internationalization Module
 */
const i18nModule = {
    currentLanguage: 'en',
    async init() {
        try {
            console.log('🌐 Initializing I18n...');
            this.currentLanguage = RoomForImprovementSystem.storage.get('language_pref') || 'en';
            RoomForImprovementSystem.modules.i18n = this;
            this.updateUI();
            RoomForImprovementSystem.events.on('languageChanged', () => this.updateUI());
            console.log('✅ I18n initialized');
        } catch (error) {
            console.warn('❌ I18n init failed:', error);
        }
    },
    toggleLanguage() {
        const languages = ['en', 'id', 'mnc'];
        const currentIndex = languages.indexOf(this.currentLanguage);
        this.currentLanguage = languages[(currentIndex + 1) % languages.length];
        RoomForImprovementSystem.storage.set('language_pref', this.currentLanguage);
        RoomForImprovementSystem.events.emit('languageChanged', this.currentLanguage);
    },
    t(key) {
        const strings = {
            en: {
                app_title: 'Room for Improvement',
                login: 'Login',
                rooms_cleaned: 'Rooms Cleaned Today',
                laundry_status: 'Laundry Status',
                spot_checks: 'Spot Checks',
                staff_on_duty: 'Staff on Duty',
                alerts: 'Alerts',
                start_cleaning: 'Start Cleaning',
                complete_cleaning: 'Complete Cleaning',
                report_issue: 'Report Issue',
                add_laundry: 'Add Laundry',
                prev_week: 'Previous Week',
                next_week: 'Next Week',
                generate_schedule: 'Generate Schedule',
                submit_issue: 'Submit Issue',
                complete_task: 'Complete Task',
                add_comment: 'Add Comment',
                pending: 'Pending',
                in_progress: 'In Progress',
                completed: 'Completed'
            },
            id: {
                app_title: 'Ruang untuk Perbaikan',
                login: 'Masuk',
                rooms_cleaned: 'Kamar Dibersihkan Hari Ini',
                laundry_status: 'Status Cucian',
                spot_checks: 'Pemeriksaan Spot',
                staff_on_duty: 'Staf Bertugas',
                alerts: 'Peringatan',
                start_cleaning: 'Mulai Membersihkan',
                complete_cleaning: 'Selesai Membersihkan',
                report_issue: 'Laporkan Masalah',
                add_laundry: 'Tambah Cucian',
                prev_week: 'Minggu Sebelumnya',
                next_week: 'Minggu Berikutnya',
                generate_schedule: 'Buat Jadwal',
                submit_issue: 'Kirim Masalah',
                complete_task: 'Selesaikan Tugas',
                add_comment: 'Tambah Komentar',
                pending: 'Menunggu',
                in_progress: 'Sedang Berlangsung',
                completed: 'Selesai'
            },
            mnc: {
                app_title: 'Room for a Proper Job',
                login: 'Get In',
                rooms_cleaned: 'Pads Cleaned Today',
                laundry_status: 'Washing Status',
                spot_checks: 'Quick Checks',
                staff_on_duty: 'Lads on Duty',
                alerts: 'Heads Up',
                start_cleaning: 'Start Scrubbin’',
                complete_cleaning: 'Done Scrubbin’',
                report_issue: 'Flag a Problem',
                add_laundry: 'Chuck in Washing',
                prev_week: 'Last Week',
                next_week: 'Next Week',
                generate_schedule: 'Sort Shifts',
                submit_issue: 'Send Problem',
                complete_task: 'Finish Job',
                add_comment: 'Add a Note',
                pending: 'Waitin’',
                in_progress: 'Gettin’ Done',
                completed: 'Sorted'
            }
        };
        return strings[this.currentLanguage]?.[key] || key;
    },
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.getAttribute('data-i18n');
            elem.textContent = this.t(key);
        });
        RoomForImprovementSystem.updateUI();
        if (RoomForImprovementSystem.state.currentRoom) {
            RoomForImprovementSystem.modules.rooms.loadRoomTasks(RoomForImprovementSystem.state.currentRoom);
        }
        RoomForImprovementSystem.modules.laundry.renderLaundryList();
        RoomForImprovementSystem.modules.maintenance.updateIssues();
        RoomForImprovementSystem.modules.scheduler.renderCalendar();
        if (RoomForImprovementSystem.modules.auth.hasMinRole('manager')) {
            RoomForImprovementSystem.modules.dashboard.updateDashboard();
        }
    },
    getState() {
        return { currentLanguage: this.currentLanguage };
    },
    handleQuery(query) {
        return { response: 'I18n query not supported' };
    }
};

RoomForImprovementSystem.registerModule('i18n', i18nModule);