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
    
    const parentId = domElements.parentRequirementSelect?.value;
    let level = 1;
    let parentIndex = null;
    
    if (parentId) {
        // Find parent requirement
        parentIndex = allRequirements.findIndex(req => req.id === parentId);
        if (parentIndex === -1) {
            showToast('Requisito padre no encontrado.', 'error');
            return;
        }
        level = 2;
    }
    
    // Generate new ID based on level
    let newId;
    if (level === 1) {
        newId = `R1-${reqCounter.level1}`;
        reqCounter.level1++;
    } else {
        // For level 2, find how many children the parent already has
        const childrenCount = allRequirements.filter(req => req.parentId === parentId).length;
        newId = `R2-${childrenCount}`;
    }
    
    const newReq = {
        id: newId,
        level: level,
        parentId: parentId || null,
        parentIndex: parentIndex,
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
    
    // Insert requirement in the correct position
    if (level === 1) {
        allRequirements.push(newReq);
    } else {
        // Insert after parent and its existing children
        const insertIndex = findInsertionIndex(parentId);
        allRequirements.splice(insertIndex, 0, newReq);
    }
    
    saveToLocalStorage();
    renderRequirementsList();
    updateParentRequirementOptions();
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
            <strong>💡 Jerarquía:</strong> Los requisitos de nivel 2 (R2-X) aparecen indentados bajo su requisito padre (R1-X). 
            Los botones de movimiento respetan la jerarquía.
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
        
        // Add different styling for level 2 requirements
        if (req.level === 2) {
            row.className = 'table-row bg-blue-50';
        } else {
            row.className = 'table-row';
        }
        
        // Create indentation for level 2 requirements
        const indentation = req.level === 2 ? '<span class="text-blue-600 mr-2">└─</span>' : '';
        const idDisplay = req.level === 2 ? `<span class="text-blue-600">${req.id}</span>` : req.id;
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${indentation}${idDisplay}
            </td>
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
        const level1Count = allRequirements.filter(req => req.level === 1).length;
        const level2Count = allRequirements.filter(req => req.level === 2).length;
        countElement.textContent = `Total: ${allRequirements.length} requisitos (${level1Count} nivel 1, ${level2Count} nivel 2)`;
    }
}

function clearForm() {
    if (domElements.parentRequirementSelect) domElements.parentRequirementSelect.value = '';
    if (domElements.conditionInput) domElements.conditionInput.value = '';
    if (domElements.behaviorInput) domElements.behaviorInput.value = '';
    if (domElements.latencyInput) domElements.latencyInput.value = '';
    if (domElements.toleranceInput) domElements.toleranceInput.value = 'N/A';
    if (domElements.justificationInput) domElements.justificationInput.value = '';
}

function deleteRequirement(index) {
    const req = allRequirements[index];
    let confirmMessage = '¿Estás seguro de que quieres eliminar este requisito?';
    
    // Check if it's a parent requirement with children
    if (req.level === 1) {
        const children = allRequirements.filter(r => r.parentId === req.id);
        if (children.length > 0) {
            confirmMessage = `Este requisito tiene ${children.length} sub-requisito(s). Si lo eliminas, todos sus sub-requisitos también serán eliminados. ¿Continuar?`;
        }
    }
    
    if (confirm(confirmMessage)) {
        if (req.level === 1) {
            // Remove parent and all its children
            allRequirements = allRequirements.filter(r => r.id !== req.id && r.parentId !== req.id);
        } else {
            // Just remove the child requirement
            allRequirements.splice(index, 1);
        }
        
        recalculateIds();
        saveToLocalStorage();
        renderRequirementsList();
        updateParentRequirementOptions();
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
        reqCounter = { level1: 0, level2: 0 };
        saveToLocalStorage();
        renderRequirementsList();
        updateParentRequirementOptions();
        updatePreview();
        showToast('Todos los requisitos han sido eliminados', 'info');
    }
}

function recalculateIds() {
    let level1Counter = 0;
    const level2Counters = {};
    
    allRequirements.forEach((req) => {
        if (req.level === 1) {
            req.id = `R1-${level1Counter}`;
            level2Counters[req.id] = 0;
            level1Counter++;
        } else if (req.level === 2 && req.parentId) {
            // Find the updated parent ID
            const parentIndex = allRequirements.findIndex(r => r.level === 1 && r === allRequirements.find(parent => parent.id === req.parentId || (parent.originalId && parent.originalId === req.parentId)));
            if (parentIndex >= 0) {
                const newParentId = `R1-${parentIndex}`;
                req.parentId = newParentId;
                req.id = `R2-${level2Counters[newParentId] || 0}`;
                level2Counters[newParentId] = (level2Counters[newParentId] || 0) + 1;
            }
        }
    });
    
    // Update global counters
    reqCounter.level1 = level1Counter;
    reqCounter.level2 = Math.max(...Object.values(level2Counters), 0);
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
            
            // Handle legacy data format
            if (typeof data.counter === 'number') {
                reqCounter = { level1: data.counter, level2: 0 };
                // Update legacy requirements to new format
                allRequirements.forEach((req, index) => {
                    if (!req.level) {
                        req.level = 1;
                        req.parentId = null;
                        req.id = `R1-${index}`;
                    }
                });
                reqCounter.level1 = allRequirements.filter(r => r.level === 1).length;
            } else {
                reqCounter = data.counter || { level1: 0, level2: 0 };
            }
            
            renderRequirementsList();
            updateParentRequirementOptions();
            updatePreview();
        } catch (error) {
            console.error('Error loading saved data:', error);
            allRequirements = [];
            reqCounter = { level1: 0, level2: 0 };
        }
    }
}

// --- Helper Functions for Nested Requirements ---
function findInsertionIndex(parentId) {
    const parentIndex = allRequirements.findIndex(req => req.id === parentId);
    if (parentIndex === -1) return allRequirements.length;
    
    // Find the last child of this parent
    let insertIndex = parentIndex + 1;
    while (insertIndex < allRequirements.length && 
           allRequirements[insertIndex].parentId === parentId) {
        insertIndex++;
    }
    
    return insertIndex;
}

function updateParentRequirementOptions() {
    if (!domElements.parentRequirementSelect) return;
    
    // Clear existing options except the first one
    domElements.parentRequirementSelect.innerHTML = '<option value="">Sin requisito padre (Nivel 1)</option>';
    
    // Add only level 1 requirements as possible parents
    const level1Requirements = allRequirements.filter(req => req.level === 1);
    level1Requirements.forEach(req => {
        const option = document.createElement('option');
        option.value = req.id;
        option.textContent = `${req.id} - ${req.variable} (${req.behavior.substring(0, 50)}...)`;
        domElements.parentRequirementSelect.appendChild(option);
    });
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
window.updateParentRequirementOptions = updateParentRequirementOptions;
