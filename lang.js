const languageSupport = {
    currentLang: 'en',
    translations: {
        en: {
            app_title: 'Room for Improvement',
            rooms_cleaned: 'Rooms Cleaned Today',
            laundry_status: 'Laundry Status',
            spot_checks: 'Spot Checks',
            staff_on_duty: 'Staff on Duty',
            alerts: 'Alerts',
            start_cleaning: 'Start Cleaning',
            complete_cleaning: 'Complete Cleaning',
            pending: 'Pending',
            in_progress: 'In Progress',
            completed: 'Completed',
            add_laundry: 'Add Laundry',
            report_issue: 'Report Issue',
            prev_week: 'Previous Week',
            next_week: 'Next Week',
            generate_schedule: 'Generate Schedule',
            submit_issue: 'Submit Issue',
            complete_task: 'Complete Task',
            add_comment: 'Add Comment'
        },
        id: {
            app_title: 'Room for Improvement',
            rooms_cleaned: 'Kamar Dibersihkan Hari Ini',
            laundry_status: 'Status Cucian',
            spot_checks: 'Pemeriksaan Mendadak',
            staff_on_duty: 'Staf Bertugas',
            alerts: 'Peringatan',
            start_cleaning: 'Mulai Membersihkan',
            complete_cleaning: 'Selesai Membersihkan',
            pending: 'Menunggu',
            in_progress: 'Dalam Proses',
            completed: 'Selesai',
            add_laundry: 'Tambah Cucian',
            report_issue: 'Laporkan Masalah',
            prev_week: 'Minggu Sebelumnya',
            next_week: 'Minggu Berikutnya',
            generate_schedule: 'Buat Jadwal',
            submit_issue: 'Kirim Masalah',
            complete_task: 'Selesaikan Tugas',
            add_comment: 'Tambah Komentar'
        },
        manc: {
            app_title: 'Room for Improvement',
            rooms_cleaned: 'Rooms Cleaned Today',
            laundry_status: 'Laundry Status',
            spot_checks: 'Spot Checks',
            staff_on_duty: 'Staff on Duty',
            alerts: 'Alerts',
            start_cleaning: 'Start Cleanin\'',
            complete_cleaning: 'Finish Cleanin\'',
            pending: 'Waitin\'',
            in_progress: 'Doin\' It',
            completed: 'Done',
            add_laundry: 'Add Washin\'',
            report_issue: 'Report Problem',
            prev_week: 'Last Week',
            next_week: 'Next Week',
            generate_schedule: 'Sort Schedule',
            submit_issue: 'Send Problem',
            complete_task: 'Finish Job',
            add_comment: 'Add Comment'
        }
    },

    init() {
        console.log('Language support initialized');
        this.setupLanguageToggle();
        this.applyLanguage(this.currentLang);
    },

    setupLanguageToggle() {
        const toggle = document.getElementById('language-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const langs = ['en', 'id', 'manc'];
                const currentIndex = langs.indexOf(this.currentLang);
                const nextIndex = (currentIndex + 1) % langs.length;
                this.toggleLanguage(langs[nextIndex]);
            });
        }
    },

    toggleLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.applyLanguage(lang);
            document.getElementById('language-toggle').textContent = lang.toUpperCase();
        }
    },

    applyLanguage(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[lang][key]) {
                element.textContent = this.translations[lang][key];
            }
        });
    },

    translate(key) {
        return this.translations[this.currentLang][key] || key;
    },

    register() {
        return {
            name: 'languageSupport',
            version: '1.0.0',
            description: 'Multi-language support for the system'
        };
    }
};

RoomForImprovementSystem.modules.language = languageSupport; 