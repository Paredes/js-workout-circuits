import {SoundModule} from './sound.js'


export const TimerModule = {
    STATUS: {
        STOPPED: 'STOPPED',
        RUNNING: 'RUNNING',
        PAUSED: 'PAUSED'
    },

    PHASE: {
        EXERCISE: 'EJERCICIO',
        REST: 'DESCANSO',
        FINISHED: '¡COMPLETADO!'
    },

    status: 'STOPPED',
    currentCircuit: null,
    currentExerciseIndex: 0,
    currentPhase: null,
    currentRound: 1,
    timeRemaining: 0,
    timerId: null,
    hasAnnouncedNext: false,

    ui: {
        phaseDisplay: null,
        exerciseDisplay: null,
        timerDisplay: null
    },

    initUI(elements) {
        this.ui.phaseDisplay = elements.phaseDisplay;
        this.ui.exerciseDisplay = elements.exerciseDisplay;
        this.ui.timerDisplay = elements.timerDisplay;
        this.updateUI();
    },
    start(circuit) {
        if (!circuit || circuit.exercises.length === 0) {
            alert('El circuito seleccionado no tiene ejercicios.');
            return;
        }

        this.currentCircuit = circuit;
        this.currentExerciseIndex = 0;
        this.currentRound = 1;
        this.status = this.STATUS.RUNNING;

        // Comenzar con el primer ejercicio
        this.setupExercisePhase();
        this.run();
    },

    pause() {
        if (this.status !== this.STATUS.RUNNING) return;
        this.status = this.STATUS.PAUSED;
        clearInterval(this.timerId);
        this.timerId = null;
        this.ui.phaseDisplay.textContent = `${this.currentPhase} (PAUSADO)`;
    },

    resume() {
        if (this.status !== this.STATUS.PAUSED) return;
        this.status = this.STATUS.RUNNING;
        this.run();
    },

    stop() {
        clearInterval(this.timerId);
        this.timerId = null;
        this.status = this.STATUS.STOPPED;
        this.currentCircuit = null;
        this.currentExerciseIndex = 0;
        this.currentPhase = null;
        this.timeRemaining = 0;

        if (this.ui.phaseDisplay) this.ui.phaseDisplay.textContent = 'LISTO';
        if (this.ui.exerciseDisplay) this.ui.exerciseDisplay.textContent = '-';
        if (this.ui.timerDisplay) this.ui.timerDisplay.textContent = '0s';
    },

    run() {
        clearInterval(this.timerId);

        this.timerId = setInterval(() => {
            if (this.status !== this.STATUS.RUNNING) return;
            this.timeRemaining--;

            if (this.timeRemaining === 8 && !this.hasAnnouncedNext) {
                this.announceNext();
                this.hasAnnouncedNext = true;
            }

            if (this.timeRemaining > 0 && this.timeRemaining <= 3) {
                SoundModule.speak(this.timeRemaining);
            }

            if (this.timeRemaining <= 0) {
                this.nextPhase();
            } else {
                this.updateUI();
            }
        }, 1000);
    },
    nextPhase() {
        if (this.currentPhase === this.PHASE.EXERCISE && this.currentCircuit.hasRest) {
            this.setupRestPhase();
        } else {
            this.currentExerciseIndex++;
            // Quedan ejercicios en la ronda actual
            if (this.currentExerciseIndex < this.currentCircuit.exercises.length) {
                this.setupExercisePhase();
            } else {
                // --- FIN DE LA RONDA ---
                const totalRounds = this.currentCircuit.rounds || 1;
                if (this.currentRound < totalRounds) {
                    // Si quedan rondas, incrementamos y reiniciamos el índice de ejercicios
                    this.currentRound++;
                    this.currentExerciseIndex = 0;
                    this.setupExercisePhase();
                } else {
                    this.finishCircuit();
                }
            }
        }
    },
    setupExercisePhase() {
        const currentExercise = this.currentCircuit.exercises[this.currentExerciseIndex];
        this.currentPhase = this.PHASE.EXERCISE;
        this.timeRemaining = currentExercise.durationSeconds;
        this.hasAnnouncedNext = false;

        SoundModule.speak(currentExercise.name);
        this.updateUI();
    },
    setupRestPhase() {
        this.currentPhase = this.PHASE.REST;
        this.timeRemaining = this.currentCircuit.restTimeSeconds;
        this.hasAnnouncedNext = false;
        
        SoundModule.speak('Descanso');
        this.updateUI();
    },

    finishCircuit() {
        clearInterval(this.timerId);
        this.timerId = null;
        this.status = this.STATUS.STOPPED;

        SoundModule.playFinished();

        if (this.ui.phaseDisplay) this.ui.phaseDisplay.textContent = '🎉 ¡COMPLETADO!';
        if (this.ui.exerciseDisplay) this.ui.exerciseDisplay.textContent = '¡Buen trabajo!';
        if (this.ui.timerDisplay) this.ui.timerDisplay.textContent = '0s';
    },
    updateUI() {
        if (!this.ui.phaseDisplay || !this.ui.timerDisplay) return;
        if (this.status === this.STATUS.STOPPED) return;

        const totalRounds = this.currentCircuit.rounds || 1;
        this.ui.phaseDisplay.textContent = `${this.currentPhase} (Ronda ${this.currentRound}/${totalRounds})`;
        this.ui.timerDisplay.textContent = `${this.timeRemaining}s`;

        if (this.currentPhase === this.PHASE.EXERCISE) {
            const currentExercise =this.currentCircuit.exercises[this.currentExerciseIndex];
            const totalExercises = this.currentCircuit.exercises.length;
            this.ui.exerciseDisplay.textContent = `${currentExercise.name} (${this.currentExerciseIndex + 1}/${totalExercises})`;
        } else if (this.currentPhase === this.PHASE.REST) {
            const isLastExerciseInRound = this.currentExerciseIndex + 1 >= this.currentCircuit.exercises.length;
            if (isLastExerciseInRound && this.currentRound < totalRounds) {
                const firstExercise = this.currentCircuit.exercises[0];
                this.ui.exerciseDisplay.textContent = `Descansa - Siguiente: Ronda ${this.currentRound + 1} (${firstExercise.name})`

            } else {
                const nextExercise = this.currentCircuit.exercises[this.currentExerciseIndex + 1];
                const nextText = nextExercise ? `Siguiente: ${nextExercise.name}`: 'Último descanso';
                this.ui.exerciseDisplay.textContent = `Descansa - ${nextText}`;
            }
        }
        
    },
    announceNext() {
        const totalRounds = this.currentCircuit.rounds || 1;
        const totalExercises = this.currentCircuit.exercises.length;

        if (this.currentPhase === this.PHASE.EXERCISE && this.currentCircuit.hasRest) {
                SoundModule.speak('Siguiente: Descanso'); 
        } else {
            const isLastExerciseInRound = this.currentExerciseIndex + 1 >= totalExercises;
            if (isLastExerciseInRound && this.currentRound < totalRounds) {
                const nextExercise = this.currentCircuit.exercises[0];
                SoundModule.speak(`Siguiente: Ronda ${this.currentRound + 1}, ${nextExercise.name}`);
            } else if (!isLastExerciseInRound) {
                const nextExercise = this.currentCircuit.exercises[this.currentExerciseIndex + 1];
                SoundModule.speak(`Siguiente: ${nextExercise.name}`);
            }
        }
    }
}