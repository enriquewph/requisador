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
        newId = `R${reqCounter.level1}`;
        reqCounter.level1++;
    } else {
        // For level 2, find how many children the parent already has
        const childrenCount = allRequirements.filter(req => req.parentId === parentId).length;
        const parentNumber = parentId.replace('R', ''); // Extract parent number
        newId = `R${parentNumber}-${childrenCount}`;
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
            <strong>💡 Jerarquía:</strong> Los requisitos de nivel 1 tienen ID R0, R1, R2, etc. 
            Los de nivel 2 tienen formato RN-M donde N es el índice del padre y M el índice del hijo (ej: R0-0, R0-1, R1-0). 
            Los botones de movimiento respetan la jerarquía y actualizan automáticamente los IDs.<br>
            <strong>🔄 Conversión:</strong> Usa el botón naranja (↴/↱) para convertir entre niveles. 
            Los requisitos de nivel 2 usan como padre el requisito de nivel 1 más cercano arriba.
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
        
        // Determine conversion button text and behavior
        const conversionText = req.level === 1 ? '↴' : '↱';
        const conversionTitle = req.level === 1 ? 'Convertir a nivel 2' : 'Convertir a nivel 1';
        
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
                    <button onclick="convertRequirementLevel(${index})" 
                            class="move-btn move-btn-orange" 
                            title="${conversionTitle}">
                        ${conversionText}
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
    const level2Counters = {}; // Para cada padre, contar sus hijos
    
    // Primero, asignar IDs a los requisitos de nivel 1 y preparar contadores
    allRequirements.forEach((req, index) => {
        if (req.level === 1) {
            const newId = `R${level1Counter}`;
            
            // Si el ID cambió, actualizar las referencias de los hijos
            if (req.id !== newId) {
                const oldId = req.id;
                req.id = newId;
                
                // Actualizar parentId de todos los hijos que referencian el ID antiguo
                allRequirements.forEach(childReq => {
                    if (childReq.parentId === oldId) {
                        childReq.parentId = newId;
                    }
                });
            }
            
            level2Counters[req.id] = 0;
            level1Counter++;
        }
    });
    
    // Luego, asignar IDs a los requisitos de nivel 2
    allRequirements.forEach((req, index) => {
        if (req.level === 2 && req.parentId) {
            if (level2Counters[req.parentId] !== undefined) {
                // Formato RN-M donde N es el índice del padre y M es el índice del hijo
                const parentNumber = req.parentId.replace('R', ''); // Extraer número del padre
                req.id = `R${parentNumber}-${level2Counters[req.parentId]}`;
                level2Counters[req.parentId]++;
            }
        }
    });
    
    // Actualizar contadores globales
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

// --- Level Conversion Functions ---
function convertRequirementLevel(index) {
    const req = allRequirements[index];
    
    if (req.level === 1) {
        // Convertir de nivel 1 a nivel 2
        convertToLevel2(index);
    } else if (req.level === 2) {
        // Convertir de nivel 2 a nivel 1
        convertToLevel1(index);
    }
}

function convertToLevel2(index) {
    const req = allRequirements[index];
    
    // Check if it's already level 2
    if (req.level === 2) {
        showToast('Este requisito ya es de nivel 2.', 'warning');
        return;
    }
    
    // Buscar el requisito de nivel 1 más cercano hacia arriba
    let parentIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
        if (allRequirements[i].level === 1) {
            parentIndex = i;
            break;
        }
    }
    
    if (parentIndex === -1) {
        showToast('No hay requisitos de nivel 1 arriba para usar como padre.', 'warning');
        return;
    }
    
    const parentReq = allRequirements[parentIndex];
    
    // Verificar si hay hijos del requisito que se va a convertir
    const children = allRequirements.filter(r => r.parentId === req.id);
    if (children.length > 0) {
        if (!confirm(`Este requisito tiene ${children.length} sub-requisito(s). Si lo conviertes a nivel 2, sus hijos se convertirán en requisitos de nivel 1. ¿Continuar?`)) {
            return;
        }
        
        // Convertir los hijos a nivel 1
        children.forEach(child => {
            child.level = 1;
            child.parentId = null;
        });
    }
    
    // Convertir el requisito a nivel 2
    req.level = 2;
    req.parentId = parentReq.id;
    
    recalculateIds();
    saveToLocalStorage();
    renderRequirementsList();
    updateParentRequirementOptions();
    showToast(`Requisito convertido a nivel 2 bajo ${parentReq.id}`, 'success');
}

function convertToLevel1(index) {
    const req = allRequirements[index];
    
    // Check if it's already level 1
    if (req.level === 1) {
        showToast('Este requisito ya es de nivel 1.', 'warning');
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres convertir este requisito a nivel 1?')) {
        return;
    }
    
    // Convertir el requisito a nivel 1
    req.level = 1;
    req.parentId = null;
    
    recalculateIds();
    saveToLocalStorage();
    renderRequirementsList();
    updateParentRequirementOptions();
    showToast('Requisito convertido a nivel 1', 'success');
}

// --- Local Storage Functions ---
function saveToLocalStorage() {
    const dataToSave = {
        requirements: allRequirements,
        counter: reqCounter,
        version: '3.0' // Add version to track data format - new RN-M format
    };
    localStorage.setItem('requirementsData', JSON.stringify(dataToSave));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('requirementsData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            allRequirements = data.requirements || [];
            
            // Check if this is legacy data (no version field or old version)
            const isLegacyData = !data.version || data.version !== '3.0';
            
            // Handle legacy data format
            if (typeof data.counter === 'number' || isLegacyData) {
                console.log('Migrating data to new RN-M ID format...');
                reqCounter = { level1: 0, level2: 0 };
                
                // Update ALL requirements to new format
                allRequirements.forEach((req, index) => {
                    req.level = 1; // All legacy requirements become level 1
                    req.parentId = null;
                });
                
                // Force save with new format
                recalculateIds();
                saveToLocalStorage();
                showToast('Datos migrados al nuevo formato RN-M de IDs', 'info');
            } else {
                reqCounter = data.counter || { level1: 0, level2: 0 };
            }
            
            // Ensure ALL requirements have proper level and structure
            allRequirements.forEach((req, index) => {
                // If level is missing, assume it's level 1
                if (!req.level) {
                    req.level = 1;
                    req.parentId = null;
                }
                
                // Ensure parentId is properly set
                if (req.level === 1) {
                    req.parentId = null;
                } else if (req.level === 2 && !req.parentId) {
                    // If it's level 2 but has no parent, convert to level 1
                    req.level = 1;
                    req.parentId = null;
                }
            });
            
            // Recalculate IDs to ensure consistency
            recalculateIds();
            
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
window.convertRequirementLevel = convertRequirementLevel;
window.convertRequirementLevel = convertRequirementLevel;
window.convertToLevel2 = convertToLevel2;
window.convertToLevel1 = convertToLevel1;
