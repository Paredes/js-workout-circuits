import {StorageModule} from './storage.js';
import {TimerModule} from './timer.js';

// --- App State ---
let circuits = StorageModule.load();
let selectedCircuitId = null;
let editingCircuitId = null;
let editingExerciseId = null;

// Bind HTML elements to TimerModule
TimerModule.initUI({
    phaseDisplay: document.getElementById('phase-display'),
    exerciseDisplay: document.getElementById('exercise-display'),
    timerDisplay: document.getElementById('timer-display')
})


// --- DOM References ---
// (circuit form)

const circuitModal = document.getElementById('circuit-modal');
const openCircuitModalBtn = document.getElementById('open-circuit-modal-btn');
const closeCircuitModalX = document.getElementById('close-modal-x');
const circuitForm = document.getElementById('circuit-form');
const formCircuitTitle = circuitForm.querySelector('h2');
const submitBtn = document.getElementById('submit-btn');

const circuitNameInput = document.getElementById('circuit-name-input');
const restCheckbox = document.getElementById('rest-checkbox');
const restTimeInput = document.getElementById('rest-time-input');
const roundsInput = document.getElementById('rounds-input');
const restTimeContainer = document.getElementById('rest-time-container');

// --- DOM References ---
// (exercise form)
const openExerciseModalBtn = document.getElementById('open-exercise-modal-btn');
const exerciseModal = document.getElementById('exercise-modal');
const exerciseForm = document.getElementById('exercise-form');
const exerciseSection = document.getElementById('exercise-section');
const submitExerciseBtn = document.getElementById('submit-exercise-btn');
const selectedCircuitTitle = document.getElementById('selected-circuit-title');
const exerciseFormTitle = document.getElementById('exercise-form-title');
const exerciseNameInput = document.getElementById('exercise-name-input');
const exerciseDurationInput = document.getElementById('exercise-duration-input');
const closeExerciseModalX = document.getElementById('close-exercise-modal-x');

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');

// lists
const exerciseList = document.getElementById('exercise-list');
const circuitList = document.getElementById('circuit-list');


// --- Helper Methods ---
function resetCircuitForm() {
    circuitForm.reset();
    editingCircuitId = null;
    // Restablecer la UI del formulario
    roundsInput.value = 3;
    formCircuitTitle.textContent = 'Crear Circuito';
    submitBtn.textContent = 'Guardar Circuito';
    circuitForm.classList.remove('editing-mode');
}

function resetExerciseForm() {
    exerciseForm.reset();
    editingExerciseId = null;
    submitExerciseBtn.textContent = 'Guardar Ejercicio';
    exerciseForm.classList.remove('editing-mode');
}
function openCircuitModal(title = 'Crear Circuito') {
    formCircuitTitle.textContent = title;
    circuitModal.showModal();
}

function closeCircuitModal() {
    resetCircuitForm();
    editingCircuitId = null;
    circuitModal.close();
}

function closeExerciseModal() {
    resetExerciseForm();
    editingExerciseId = null;
    exerciseModal.close();
}

function openExerciseModal(title = 'Crear Ejercicio') {
    exerciseFormTitle.textContent = title;
    exerciseForm.style.display = '';
    exerciseModal.showModal();
}

function startEditingCircuit(circuit) {
    editingCircuitId = circuit.id;
    
    // Poblar el formulario con los datos actuales
    circuitNameInput.value = circuit.name;
    restCheckbox.checked = circuit.hasRest;
    restTimeInput.value = circuit.restTimeSeconds;
    roundsInput.value = circuit.rounds || 1;
    
    // Cambiar la UI del formulario
    formCircuitTitle.textContent = `Editando: ${circuit.name}`;
    submitBtn.textContent = 'Actualizar Circuito';
    circuitForm.classList.add('editing-mode');
    console.log('prev');
    circuitNameInput.focus();
    console.log('pasamos');
    openCircuitModal('Editar Circuito');
}

function startEditingExercise(ex) {
    editingExerciseId = ex.id;
    exerciseNameInput.value = ex.name;
    exerciseDurationInput.value = ex.durationSeconds;
    submitExerciseBtn.textContent = 'Actualizar Ejercicio';
    exerciseForm.classList.add('editing-mode');
    openExerciseModal('Editar Ejercicio');
}

function moveExercise(circuit, fromIndex, toIndex) {
    [circuit.exercises[fromIndex], circuit.exercises[toIndex]] =
    [circuit.exercises[toIndex], circuit.exercises[fromIndex]];
    
    StorageModule.save(circuits);

    renderExercises(circuit);

}

// --- Render Methods ---
function renderCircuits() {
    circuitList.innerHTML = '';

    if (circuits.length === 0) {
        circuitList.innerHTML = '<li>No hay circuitos creados aún</li>';
        exerciseSection.style.display = 'none';
        return;
    }
    circuits.forEach(circuit => {
        const li = document.createElement('li');
        const isSelected = circuit.id === selectedCircuitId ? '🟢 (Seleccionado)': '';
        li.innerHTML = `
            <strong>${circuit.name}</strong> ${isSelected}<br>
            <small>Rondas: ${circuit.rounds || 1} | Descanso: ${circuit.hasRest ? `${circuit.restTimeSeconds}s` : 'Sin descanso'} | Ejercicios: ${circuit.exercises.length}</small><br>
            <button class="btn-primary btn-select" data-id="${circuit.id}">Seleccionar</button>
            <button class="btn-secondary btn-edit" data-id="${circuit.id}">Editar</button>
            <button class="btn-danger btn-delete" data-id="${circuit.id}">Eliminar</button>
        `;
        circuitList.appendChild(li);
    });

    renderExercises();
}

function renderExercises() {
    const currentCircuit = circuits.find(c => c.id === selectedCircuitId);

    if (!currentCircuit) {
        exerciseSection.style.display = 'none';
        return;
    }

    exerciseSection.style.display = 'block';
    selectedCircuitTitle.textContent = `Ejercicios de: ${currentCircuit.name}`;
    exerciseList.innerHTML = '';

    if (currentCircuit.exercises.length === 0) {
        exerciseList.innerHTML = '<li>Aún no has agregado ejercicios a este circuito.</li>';
        return;
    }

    currentCircuit.exercises.forEach((ex, index) => {
        const isFirst = index === 0;
        const isLast = index === currentCircuit.exercises.length - 1;
        const li = document.createElement('li');
        li.className = 'exercise-item';
        li.innerHTML = `
            <span class="exercise-name">${ex.name}</span>
            <span class="exercise-duration">${ex.durationSeconds}s</span>
            <div class="btn-group">
              <button
              class="btn-move-up btn-icon"
              data-index="${index}"
              ${isFirst ? 'disabled style="opacity: 0.3;"': ''}
              title="Mover arriba">▲</button>
              <button
                class="btn-move-down btn-icon"
                data-index="${index}"
                ${isLast ? 'disabled style="opacity: 0.3;"': ''}
                title="Mover abajo">▼</button>
              <button class="btn-secondary btn-edit-exercise" data-id="${ex.id}">Editar</button>
              <button class="btn-danger btn-delete-exercise" data-index="${index}">Eliminar</button>
            </div>
        `;
        exerciseList.appendChild(li);
    });
}

// --- Event Handlers ---

restCheckbox.addEventListener('change', () => {
    if (restCheckbox.checked) {
        if (Number(restTimeInput.value <= 0)) {
            restTimeInput.value = 20;
        }
        restTimeContainer.style.display = 'block';
        restTimeInput.setAttribute('required', 'required');
    } else {
        restTimeInput.removeAttribute('required');
        restTimeContainer.style.display = 'none';
        restTimeInput.value = "";
    }
});

circuitForm.addEventListener('invalid', function(e) {
    console.log('The culprit element is:', e.target);
})

closeExerciseModalX.addEventListener('click', closeExerciseModal);

exerciseModal.addEventListener('click', (e) => {
    if (e.target === exerciseModal) {
        closeExerciseModal();
    }
});

exerciseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentCircuit = circuits.find(c => c.id === selectedCircuitId);
    if (!currentCircuit) return;
    const name = exerciseNameInput.value.trim();
    const durationSeconds = Math.max(1, Number(exerciseDurationInput.value));
    if (editingExerciseId) {
        const exercise = currentCircuit.exercises.find(ex => ex.id === editingExerciseId);
        if (exercise) {
            exercise.name = name;
            exercise.durationSeconds = durationSeconds;
        }
    } else {
        const newExercise = {
            id: Date.now().toString(),
            name,
            durationSeconds
        }
        currentCircuit.exercises.push(newExercise);
    }

    StorageModule.save(circuits);
    renderExercises(currentCircuit);
    closeExerciseModal();
})

circuitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = circuitNameInput.value.trim();
    const rounds = Math.max(1, Number(roundsInput.value));
    const isDuplicate = circuits.some(
        circuit => circuit.name.toLowerCase() === name.toLowerCase() && circuit.id !== editingCircuitId
    );

    if (isDuplicate) {
        alert(`Ya existe un circuito con el nombre "${name}". Por favor elige otro.`);
        return;
    }
    if (editingCircuitId) {
        const circuit = circuits.find(c => c.id === editingCircuitId);
        if (circuit) {
            circuit.name = name;
            circuit.rounds = rounds;
            circuit.hasRest = restCheckbox.checked;
            circuit.restTimeSeconds = Number(restTimeInput.value);
        }
    } else {
        const hasRest = restCheckbox.checked;
        const restTimeSeconds = hasRest ? Math.max(1, Number(restTimeInput.value)) : 0;
        const newCircuit = {
            id: Date.now().toString(),
            name: name,
            hasRest: hasRest,
            restTimeSeconds: restTimeSeconds,
            rounds: rounds,
            exercises: []
        };
        circuits.push(newCircuit);
    }

    StorageModule.save(circuits);
    renderCircuits();
    closeCircuitModal();
});

openCircuitModalBtn.addEventListener('click', () => {
    openCircuitModal('Crear Circuito');

});

openExerciseModalBtn.addEventListener('click', () => {
    openExerciseModal('Crear Ejercicio');
});

circuitList.addEventListener('click', (event) => {
    const id = event.target.dataset.id;
    if (!id) return;

    if (event.target.classList.contains('btn-select')) {
        selectedCircuitId = id;
        renderCircuits();
        const exerciseSection = document.getElementById('exercise-section');
        if (exerciseSection) {
            exerciseSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    if (event.target.classList.contains('btn-edit')) {
        const circuitToEdit = circuits.find(c => c.id === id);
        if (circuitToEdit) {
            startEditingCircuit(circuitToEdit);
        }
    }

    if (event.target.classList.contains('btn-delete')) {
        const circuitToDelete = circuits.find(c => c.id === id);
        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el circuito ${circuitToDelete.name}`)

        if (confirmDelete) {
            circuits = circuits.filter(c => c.id !== id);

            if (selectedCircuitId === id) selectedCircuitId = null;
            if (editingCircuitId === id) resetCircuitForm();
            StorageModule.save(circuits);
            renderCircuits();
        }
    }
});

exerciseList.addEventListener('click', (e) => {
    const exerciseIndex = Number(e.target.dataset.index);
    const currentCircuit = circuits.find(c => c.id === selectedCircuitId);
    if (!currentCircuit) return;

    if (e.target.classList.contains('btn-delete-exercise')) {   
        currentCircuit.exercises.splice(exerciseIndex, 1);    
        StorageModule.save(circuits);
        renderCircuits();
    } else if (e.target.classList.contains('btn-edit-exercise')) {
        const exerciseId = e.target.dataset.id;
        const exerciseToEdit = currentCircuit.exercises.find(ex => ex.id === exerciseId);
        if (exerciseToEdit) {
            startEditingExercise(exerciseToEdit);
        }
    } else if(e.target.classList.contains('btn-move-up')) {
        const index = exerciseIndex;
        if (index > 0) {
            moveExercise(currentCircuit, index, index -1);
        }
    } else if (e.target.classList.contains('btn-move-down')) {
        const index = exerciseIndex;
        if (index < currentCircuit.exercises.length -1) {
            moveExercise(currentCircuit, index, index + 1);
        }
    }
})

// Timer Controls
startBtn.addEventListener('click', () => {
    const circuit = circuits.find(c => c.id === selectedCircuitId);
    if (!circuit) {
        alert('Primero selecciona un circuito de la lista.');
        return;
    }

    TimerModule.start(circuit);
});

pauseBtn.addEventListener('click', () => {
    if (TimerModule.status === 'RUNNING') {
        TimerModule.pause();
        pauseBtn.textContent = 'Reanudar';
    } else if (TimerModule.status === 'PAUSED') {
        TimerModule.resume();
        pauseBtn.textContent = 'Pausar';
    }
});

stopBtn.addEventListener('click', () => {
    TimerModule.stop();
    pauseBtn.textContent = 'Pausar';
});

closeCircuitModalX.addEventListener('click', closeCircuitModal);


circuitModal.addEventListener('click', (e) => {
    if (e.target === circuitModal) {
        closeCircuitModal();
    }
});

// Initialize UI
renderCircuits();