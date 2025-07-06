/**
 * Requirements Management Module (Legacy - to be replaced by CreateTab and ListTab)
 * Handles CRUD operations for requirements
 *
 * NOTE: This module is kept for backward compatibility.
 * New functionality should use the CreateTab and ListTab modules instead.
 */

/* global AppGlobals, DOMUtils */

// Legacy requirement management functions using new modular structure

// --- Requirement Management Functions ---
function addRequirement() {
  console.log('Legacy addRequirement function called, delegating to CreateTab');
  if (typeof window.CreateTab !== 'undefined' && window.CreateTab.addRequirement) {
    window.CreateTab.addRequirement();
  } else {
    console.error('CreateTab module not available');
  }
}

function clearAllRequirements() {
  console.log('Legacy clearAllRequirements function called, delegating to ListTab');
  if (typeof window.ListTab !== 'undefined' && window.ListTab.clearAllRequirements) {
    window.ListTab.clearAllRequirements();
  } else {
    console.error('ListTab module not available');
  }
}

function deleteRequirement(index) {
  console.log('Legacy deleteRequirement function called, delegating to ListTab');
  if (typeof window.ListTab !== 'undefined' && window.ListTab.deleteRequirement) {
    window.ListTab.deleteRequirement(index);
  } else {
    console.error('ListTab module not available');
  }
}

function moveRequirementUp(index) {
  console.log('Legacy moveRequirementUp function called, delegating to ListTab');
  if (typeof window.ListTab !== 'undefined' && window.ListTab.moveRequirement) {
    window.ListTab.moveRequirement(index, 'up');
  } else {
    console.error('ListTab module not available');
  }
}

function moveRequirementDown(index) {
  console.log('Legacy moveRequirementDown function called, delegating to ListTab');
  if (typeof window.ListTab !== 'undefined' && window.ListTab.moveRequirement) {
    window.ListTab.moveRequirement(index, 'down');
  } else {
    console.error('ListTab module not available');
  }
}

function moveRequirementToTop(index) {
  console.log('Legacy moveRequirementToTop function called');
  // Move to top functionality
  if (index > 0 && AppGlobals.state.allRequirements[index]) {
    const req = AppGlobals.state.allRequirements.splice(index, 1)[0];
    AppGlobals.state.allRequirements.unshift(req);

    // Update UI
    if (typeof window.ListTab !== 'undefined' && window.ListTab.renderRequirementsList) {
      window.ListTab.renderRequirementsList();
    }
    if (typeof window.TreeTab !== 'undefined' && window.TreeTab.renderTreeView) {
      window.TreeTab.renderTreeView();
    }

    DOMUtils.showToast('Requisito movido al inicio.', 'success');
  }
}

function moveRequirementToBottom(index) {
  console.log('Legacy moveRequirementToBottom function called');
  // Move to bottom functionality
  if (index < AppGlobals.state.allRequirements.length - 1 && AppGlobals.state.allRequirements[index]) {
    const req = AppGlobals.state.allRequirements.splice(index, 1)[0];
    AppGlobals.state.allRequirements.push(req);

    // Update UI
    if (typeof window.ListTab !== 'undefined' && window.ListTab.renderRequirementsList) {
      window.ListTab.renderRequirementsList();
    }
    if (typeof window.TreeTab !== 'undefined' && window.TreeTab.renderTreeView) {
      window.TreeTab.renderTreeView();
    }

    DOMUtils.showToast('Requisito movido al final.', 'success');
  }
}

function convertRequirementLevel(index) {
  console.log('Legacy convertRequirementLevel function called, delegating to ListTab');
  if (typeof window.ListTab !== 'undefined' && window.ListTab.convertRequirementLevel) {
    window.ListTab.convertRequirementLevel(index);
  } else {
    console.error('ListTab module not available');
  }
}

function convertToLevel1(index) {
  console.log('Legacy convertToLevel1 function called');
  const req = AppGlobals.state.allRequirements[index];
  if (!req) {return;}

  req.level = 1;
  req.parentId = null;
  req.id = `R${AppGlobals.state.reqCounter.level1}`;
  AppGlobals.state.reqCounter.level1++;

  // Update UI
  if (typeof window.ListTab !== 'undefined' && window.ListTab.renderRequirementsList) {
    window.ListTab.renderRequirementsList();
  }
  if (typeof window.TreeTab !== 'undefined' && window.TreeTab.renderTreeView) {
    window.TreeTab.renderTreeView();
  }
  if (typeof window.CreateTab !== 'undefined' && window.CreateTab.updateParentRequirementOptions) {
    window.CreateTab.updateParentRequirementOptions();
  }

  DOMUtils.showToast('Requisito convertido a Nivel 1.', 'success');
}

function convertToLevel2(index) {
  console.log('Legacy convertToLevel2 function called');
  const req = AppGlobals.state.allRequirements[index];
  if (!req) {return;}

  // Ask user to select parent
  const level1Reqs = AppGlobals.state.allRequirements.filter(r => r.level === 1 && r.id !== req.id);
  if (level1Reqs.length === 0) {
    DOMUtils.showToast('No hay requisitos de nivel 1 disponibles como padre.', 'warning');
    return;
  }

  const parentOptions = level1Reqs.map(r => `${r.id} - ${r.behavior.substring(0, 50)}...`);
  const selectedParent = prompt(`Selecciona un requisito padre:\n${parentOptions.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nIngresa el número:`);

  if (selectedParent && !isNaN(selectedParent) && selectedParent > 0 && selectedParent <= level1Reqs.length) {
    const parentReq = level1Reqs[selectedParent - 1];
    req.level = 2;
    req.parentId = parentReq.id;

    // Update ID
    const childrenCount = AppGlobals.state.allRequirements.filter(r => r.parentId === parentReq.id).length - 1;
    const parentNumber = parentReq.id.replace('R', '');
    req.id = `R${parentNumber}-${childrenCount}`;

    // Update UI
    if (typeof window.ListTab !== 'undefined' && window.ListTab.renderRequirementsList) {
      window.ListTab.renderRequirementsList();
    }
    if (typeof window.TreeTab !== 'undefined' && window.TreeTab.renderTreeView) {
      window.TreeTab.renderTreeView();
    }
    if (typeof window.CreateTab !== 'undefined' && window.CreateTab.updateParentRequirementOptions) {
      window.CreateTab.updateParentRequirementOptions();
    }

    DOMUtils.showToast('Requisito convertido a Nivel 2.', 'success');
  }
}

function renderRequirementsList() {
  console.log('Legacy renderRequirementsList function called, delegating to ListTab');
  if (typeof window.ListTab !== 'undefined' && window.ListTab.renderRequirementsList) {
    window.ListTab.renderRequirementsList();
  } else {
    console.error('ListTab module not available');
  }
}

function renderTreeView() {
  console.log('Legacy renderTreeView function called, delegating to TreeTab');
  if (typeof window.TreeTab !== 'undefined' && window.TreeTab.renderTreeView) {
    window.TreeTab.renderTreeView();
  } else {
    console.error('TreeTab module not available');
  }
}

function clearForm() {
  console.log('Legacy clearForm function called, delegating to CreateTab');
  if (typeof window.CreateTab !== 'undefined' && window.CreateTab.clearForm) {
    window.CreateTab.clearForm();
  } else {
    console.error('CreateTab module not available');
  }
}

function updateParentRequirementOptions() {
  console.log('Legacy updateParentRequirementOptions function called, delegating to CreateTab');
  if (typeof window.CreateTab !== 'undefined' && window.CreateTab.updateParentRequirementOptions) {
    window.CreateTab.updateParentRequirementOptions();
  } else {
    console.error('CreateTab module not available');
  }
}

function updatePreview() {
  console.log('Legacy updatePreview function called, delegating to CreateTab');
  if (typeof window.CreateTab !== 'undefined' && window.CreateTab.updatePreview) {
    window.CreateTab.updatePreview();
  } else {
    console.error('CreateTab module not available');
  }
}

function expandAllTreeNodes() {
  console.log('Legacy expandAllTreeNodes function called, delegating to TreeTab');
  if (typeof window.TreeTab !== 'undefined' && window.TreeTab.expandAllTreeNodes) {
    window.TreeTab.expandAllTreeNodes();
  } else {
    console.error('TreeTab module not available');
  }
}

function collapseAllTreeNodes() {
  console.log('Legacy collapseAllTreeNodes function called, delegating to TreeTab');
  if (typeof window.TreeTab !== 'undefined' && window.TreeTab.collapseAllTreeNodes) {
    window.TreeTab.collapseAllTreeNodes();
  } else {
    console.error('TreeTab module not available');
  }
}

// Storage functions
function saveToLocalStorage() {
  console.log('Legacy saveToLocalStorage function called, delegating to Storage');
  if (typeof window.Storage !== 'undefined' && window.Storage.saveRequirements) {
    window.Storage.saveRequirements();
  } else {
    console.error('Storage module not available');
  }
}

function loadFromLocalStorage() {
  console.log('Legacy loadFromLocalStorage function called, delegating to Storage');
  if (typeof window.Storage !== 'undefined' && window.Storage.loadRequirements) {
    window.Storage.loadRequirements();
  } else {
    console.error('Storage module not available');
  }
}

// Make functions globally available for backward compatibility
window.addRequirement = addRequirement;
window.clearAllRequirements = clearAllRequirements;
window.deleteRequirement = deleteRequirement;
window.moveRequirementUp = moveRequirementUp;
window.moveRequirementDown = moveRequirementDown;
window.moveRequirementToTop = moveRequirementToTop;
window.moveRequirementToBottom = moveRequirementToBottom;
window.convertRequirementLevel = convertRequirementLevel;
window.convertToLevel1 = convertToLevel1;
window.convertToLevel2 = convertToLevel2;
window.renderRequirementsList = renderRequirementsList;
window.renderTreeView = renderTreeView;
window.clearForm = clearForm;
window.updateParentRequirementOptions = updateParentRequirementOptions;
window.updatePreview = updatePreview;
window.expandAllTreeNodes = expandAllTreeNodes;
window.collapseAllTreeNodes = collapseAllTreeNodes;
window.saveToLocalStorage = saveToLocalStorage;
window.loadFromLocalStorage = loadFromLocalStorage;

console.log('✅ Requirements Management Module (Legacy) loaded successfully');
