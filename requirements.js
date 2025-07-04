/**
 * Requirements Management Module
 * Handles CRUD operations for requirements
 */

// --- Requirement Management Functions ---
function addRequirement() {
    console.log('addRequirement function called');
    
    if (!domElements.behaviorInput?.value || !domElements.justificationInput?.value || !domElements.latencyInput?.value) {
        showToast('Por favor, completa todos los campos para añadir el requisito.', 'warning');
        return;
    }
    
    const newReq = {
        id: `R${reqCounter}`,
        component: domElements.componentSelect?.value,
        func: domElements.functionSelect?.value,
        variable: domElements.variableSelect?.value,
        mode: domElements.modeSelect?.value,
        condition: domElements.conditionInput?.value || '-',
        behavior: domElements.behaviorInput?.value,
        latency: domElements.latencyInput?.value,
        tolerance: domElements.toleranceInput?.value,
        justification: domElements.justificationInput?.value
    };
    
    console.log('New requirement:', newReq);
    
    allRequirements.push(newReq);
    reqCounter++;
    saveToLocalStorage();
    renderRequirementsList();
    clearForm();
    updatePreview();
    showToast('Requisito añadido exitosamente', 'success');
    
    console.log('Requirement added successfully');
}

function renderRequirementsList() {
    if (!domElements.requirementsList) return;
    
    if (allRequirements.length === 0) {
        domElements.requirementsList.innerHTML = `
            <div class="text-center text-gray-500 p-8 border-2 border-dashed rounded-lg">
                Aún no has añadido ningún requisito. ¡Usa el constructor de arriba para empezar!
            </div>
        `;
        return;
    }
    
    domElements.requirementsList.innerHTML = '';
    
    // Add helpful info about organization
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-box';
    infoDiv.innerHTML = `
        <p>
            <strong>💡 Organización:</strong> Usa los botones ▲▼ para mover requisitos uno a uno, o ⇈⇊ para mover al inicio/final. Los IDs se actualizan automáticamente.
        </p>
    `;
    domElements.requirementsList.appendChild(infoDiv);
    
    const table = document.createElement('div');
    table.className = 'bg-white shadow-md rounded-lg overflow-x-auto';
    table.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable Controlada</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condición</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comportamiento</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latencia</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizar/Acciones</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            </tbody>
        </table>
    `;
    
    const tbody = table.querySelector('tbody');
    allRequirements.forEach((req, index) => {
        const component = req.component === 'Ambos' ? 'HMI, ECI' : req.component;
        const row = document.createElement('tr');
        row.className = 'table-row';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">R${index}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${req.variable}</td>
            <td class="px-6 py-4 text-sm text-gray-500"><b>En modo ${req.mode}:</b> ${req.condition}</td>
            <td class="px-6 py-4 text-sm text-blue-600 font-semibold">${req.behavior}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${req.latency}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-1">
                    <button onclick="moveRequirementUp(${index})" 
                            ${index === 0 ? 'disabled' : ''}
                            class="move-btn move-btn-blue ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
                            title="Mover arriba">
                        ▲
                    </button>
                    <button onclick="moveRequirementDown(${index})" 
                            ${index === allRequirements.length - 1 ? 'disabled' : ''}
                            class="move-btn move-btn-blue ${index === allRequirements.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                            title="Mover abajo">
                        ▼
                    </button>
                    <button onclick="moveRequirementToTop(${index})" 
                            ${index === 0 ? 'disabled' : ''}
                            class="move-btn move-btn-green ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
                            title="Mover al inicio">
                        ⇈
                    </button>
                    <button onclick="moveRequirementToBottom(${index})" 
                            ${index === allRequirements.length - 1 ? 'disabled' : ''}
                            class="move-btn move-btn-green ${index === allRequirements.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                            title="Mover al final">
                        ⇊
                    </button>
                    <button onclick="deleteRequirement(${index})" 
                            class="move-btn move-btn-red" 
                            title="Eliminar">
                        ✕
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    domElements.requirementsList.appendChild(table);
    
    // Update requirements count
    const countElement = document.getElementById('requirementsCount');
    if (countElement) {
        countElement.textContent = `Total: ${allRequirements.length} requisito${allRequirements.length !== 1 ? 's' : ''}`;
    }
}

function clearForm() {
    if (domElements.conditionInput) domElements.conditionInput.value = '';
    if (domElements.behaviorInput) domElements.behaviorInput.value = '';
    if (domElements.latencyInput) domElements.latencyInput.value = '';
    if (domElements.toleranceInput) domElements.toleranceInput.value = 'N/A';
    if (domElements.justificationInput) domElements.justificationInput.value = '';
}

function deleteRequirement(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este requisito?')) {
        allRequirements.splice(index, 1);
        recalculateIds();
        saveToLocalStorage();
        renderRequirementsList();
        updatePreview();
        showToast('Requisito eliminado', 'info');
    }
}

function clearAllRequirements() {
    if (allRequirements.length === 0) {
        showToast('No hay requisitos para limpiar.', 'warning');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar todos los requisitos? Esta acción no se puede deshacer.')) {
        allRequirements = [];
        reqCounter = 0;
        saveToLocalStorage();
        renderRequirementsList();
        updatePreview();
        showToast('Todos los requisitos han sido eliminados', 'info');
    }
}

function recalculateIds() {
    allRequirements.forEach((req, index) => {
        req.id = `R${index}`;
    });
    reqCounter = allRequirements.length;
}

// --- Movement Functions ---
function moveRequirementUp(index) {
    if (index > 0) {
        [allRequirements[index], allRequirements[index - 1]] = [allRequirements[index - 1], allRequirements[index]];
        recalculateIds();
        saveToLocalStorage();
        renderRequirementsList();
        showToast('Requisito movido hacia arriba', 'info');
        console.log(`Moved requirement from position ${index} to ${index - 1}`);
    }
}

function moveRequirementDown(index) {
    if (index < allRequirements.length - 1) {
        [allRequirements[index], allRequirements[index + 1]] = [allRequirements[index + 1], allRequirements[index]];
        recalculateIds();
        saveToLocalStorage();
        renderRequirementsList();
        showToast('Requisito movido hacia abajo', 'info');
        console.log(`Moved requirement from position ${index} to ${index + 1}`);
    }
}

function moveRequirementToTop(index) {
    if (index > 0) {
        const requirement = allRequirements.splice(index, 1)[0];
        allRequirements.unshift(requirement);
        recalculateIds();
        saveToLocalStorage();
        renderRequirementsList();
        showToast('Requisito movido al inicio', 'info');
        console.log(`Moved requirement from position ${index} to top (position 0)`);
    }
}

function moveRequirementToBottom(index) {
    if (index < allRequirements.length - 1) {
        const requirement = allRequirements.splice(index, 1)[0];
        allRequirements.push(requirement);
        recalculateIds();
        saveToLocalStorage();
        renderRequirementsList();
        showToast('Requisito movido al final', 'info');
        console.log(`Moved requirement from position ${index} to bottom (position ${allRequirements.length - 1})`);
    }
}

// --- Local Storage Functions ---
function saveToLocalStorage() {
    localStorage.setItem('requirementsData', JSON.stringify({
        requirements: allRequirements,
        counter: reqCounter
    }));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('requirementsData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            allRequirements = data.requirements || [];
            reqCounter = data.counter || 0;
            renderRequirementsList();
            updatePreview();
        } catch (error) {
            console.error('Error loading saved data:', error);
            allRequirements = [];
            reqCounter = 0;
        }
    }
}

// Make functions globally available
window.addRequirement = addRequirement;
window.clearAllRequirements = clearAllRequirements;
window.loadFromLocalStorage = loadFromLocalStorage;
window.saveToLocalStorage = saveToLocalStorage;
window.renderRequirementsList = renderRequirementsList;
window.deleteRequirement = deleteRequirement;
window.moveRequirementUp = moveRequirementUp;
window.moveRequirementDown = moveRequirementDown;
window.moveRequirementToTop = moveRequirementToTop;
window.moveRequirementToBottom = moveRequirementToBottom;
window.recalculateIds = recalculateIds;
