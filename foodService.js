const foodService = {
    init() {
        console.log('Food Service module initialized');
    },
    
    log(message) {
        console.log(`[Food Service] ${message}`);
    },
    
    register() {
        return {
            name: 'foodService',
            version: '1.0.0',
            description: 'Meal delivery and task log'
        };
    }
};

RoomForImprovementSystem.modules.foodService = foodService; 