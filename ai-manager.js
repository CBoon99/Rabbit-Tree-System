// scripts/ai-manager.js
/**
 * Room for Improvement – Hotel Management System
 * AI Manager Module
 */
const aiManagerModule = {
    aiProvider: 'local',
    async init() {
        try {
            console.log('🦙 Initializing AI Manager...');
            this.aiProvider = RoomForImprovementSystem.storage.get('ai_provider') || 'local';
            RoomForImprovementSystem.modules.aiManager = this;
            console.log('✅ AI Manager initialized');
        } catch (error) {
            console.warn('❌ AI Manager init failed:', error);
        }
    },
    async handleQuery(query, role) {
        try {
            if (!RoomForImprovementAuth.hasMinRole(role === 'guest' ? 'staff' : role)) {
                throw new Error('Permission denied');
            }
            return RoomForImprovementSystem.modules.rooms.handleQuery(query) ||
                   RoomForImprovementSystem.modules.scheduler.handleQuery(query) ||
                   { response: 'Query not recognized' };
        } catch (error) {
            console.warn('AI query failed:', error);
            return { response: 'Error processing query' };
        }
    },
    getState() {
        return { aiProvider: this.aiProvider };
    }
};

RoomForImprovementSystem.registerModule('aiManager', aiManagerModule);