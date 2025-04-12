// No DOMContentLoaded needed because of 'defer'

// --- Globals ---
const bodyElement = document.body;
// Login elements removed
const appContainer = document.getElementById('app-container');
const settingsCog = document.getElementById('settings-cog');
const searchInput = document.getElementById('search-input');
// Filter button removed

const tabButtons = document.querySelectorAll('.tab-button');
const watchlists = document.querySelectorAll('.watchlist');

// Add Modal Elements
const openAddModalBtn = document.getElementById('open-add-modal-btn');
const addModal = document.getElementById('add-modal');
const addTitleInput = document.getElementById('add-title');
const addTypeRadios = document.querySelectorAll('input[name="add-item-type"]');
const addGenreInput = document.getElementById('add-genre'); // Simplified Genre
// Tag elements removed
const addDurationInput = document.getElementById('add-duration');
const addUpcomingCheckbox = document.getElementById('add-upcoming-checkbox');
const saveAddBtn = document.getElementById('save-add-btn');
const cancelAddBtn = document.getElementById('cancel-add-btn');

// Edit Modal Elements
const editModal = document.getElementById('edit-modal');
const editItemIdInput = document.getElementById('edit-item-id');
const editItemTypeInput = document.getElementById('edit-item-type');
const editTitleInput = document.getElementById('edit-title');
const editGenreInput = document.getElementById('edit-genre'); // Simplified Genre
// Tag elements removed
const editDurationInput = document.getElementById('edit-duration'); // Correct variable name
const editUpcomingCheckboxGroup = document.getElementById('edit-upcoming-checkbox-group'); // Keep group for consistency if needed later
const editUpcomingCheckbox = document.getElementById('edit-upcoming-checkbox');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

 // Settings Modal Elements
 const settingsModal = document.getElementById('settings-modal');
 const exportBtn = document.getElementById('export-btn');
 const importBtn = document.getElementById('import-btn');
 const importFileInput = document.getElementById('import-file-input');
 const copyHelpBtn = document.getElementById('copy-help-btn');
 const closeSettingsBtn = document.getElementById('close-settings-btn');
 const exportStatus = document.getElementById('export-status');
 const importStatus = document.getElementById('import-status');
 const copyStatus = document.getElementById('copy-status');

 // Extended Search elements removed

// D&D State
let draggedItemElement = null;
let dropIndicator = null;

// App State
let watchListsData = { serien: [], filme: [] }; // Simplified data structure
let activeTabId = 'serien'; // Current visually active tab
let currentSearchTerm = '';
// Filter state removed

// --- Data Persistence ---
function saveData() {
    try {
        localStorage.setItem('watchListsData_v1.1', JSON.stringify(watchListsData));
        localStorage.setItem('activeTab_v1.1', activeTabId);
    } catch (e) { console.error("Error saving data:", e); }
}

function loadData() {
    const savedData = localStorage.getItem('watchListsData_v1.1');
    const savedTab = localStorage.getItem('activeTab_v1.1');
    watchListsData = { serien: [], filme: [] }; // Start fresh
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            if (typeof parsedData === 'object' && parsedData !== null && Array.isArray(parsedData.serien) && Array.isArray(parsedData.filme)) {
                watchListsData.serien = parsedData.serien.map(sanitizeItem('serien'));
                watchListsData.filme = parsedData.filme.map(sanitizeItem('filme'));
            } else { throw new Error("Invalid V1.1 structure"); }
        } catch (e) { console.error("Error parsing V1.1 saved data:", e); }
    }
    activeTabId = ['serien', 'filme', 'upcoming'].includes(savedTab) ? savedTab : 'serien';
    currentSearchTerm = '';
    searchInput.value = '';
}

function sanitizeItem(typeKey) { // Simplified for V1.1
    return item => ({
        id: item.id || (Date.now().toString() + Math.random()),
        type: typeKey,
        title: typeof item.title === 'string' ? item.title : "Unbenannt",
        genre: typeof item.genre === 'string' ? item.genre : "", // Single genre string
        duration: typeof item.duration === 'string' ? item.duration : "N/A",
        isUpcoming: typeof item.isUpcoming === 'boolean' ? item.isUpcoming : false
    });
}

 // --- Setup Event Listeners ---
function addEventListeners() {
    // Tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            searchInput.value = ''; // Clear search when changing tabs
            currentSearchTerm = '';
            setActiveTab(button.getAttribute('data-tab'));
        });
    });

    // Search Input
    searchInput.addEventListener('input', () => {
        currentSearchTerm = searchInput.value.toLowerCase();
        renderLists(); // Re-render on search input
    });

    // Add Item Modal
    openAddModalBtn.addEventListener('click', openAddModal);
    cancelAddBtn.addEventListener('click', closeAddModal);
    saveAddBtn.addEventListener('click', saveAddItem);
    // No tag input listener needed

    // Edit Item Modal
    cancelEditBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEditItem);
    editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });
     // No tag input listener needed

    // Settings
    settingsCog.addEventListener('click', openSettingsModal);
    closeSettingsBtn.addEventListener('click', closeSettingsModal);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettingsModal(); });
    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', importData);
    copyHelpBtn.addEventListener('click', copyHelpText);

    // Extended Search listeners removed
}

// --- Tab Switching ---
function setActiveTab(tabId) {
    activeTabId = tabId;
    updateTabButtonVisuals();
    renderLists(); // Render lists based on the new active tab
    saveData(); // Save the new active tab
}

function updateTabButtonVisuals() {
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === activeTabId);
        // Remove search-specific class logic
    });
}

// --- Filtering Logic (Simplified for V1.1) ---
function applySearchFilter(items) {
     if (!currentSearchTerm) return items;
     return items.filter(item =>
         item.title.toLowerCase().includes(currentSearchTerm)
     );
}


// --- Rendering Lists ---
function renderLists() {
    let baseItems = [];
    const targetListElementId = `${activeTabId}-list`; // Use activeTabId directly

    // 1. Determine base items based ONLY on activeTabId and isUpcoming
    if (activeTabId === 'serien') {
        baseItems = watchListsData.serien.filter(item => !item.isUpcoming);
    } else if (activeTabId === 'filme') {
        baseItems = watchListsData.filme.filter(item => !item.isUpcoming);
    } else if (activeTabId === 'upcoming') {
        baseItems = [
            ...watchListsData.serien.filter(item => item.isUpcoming),
            ...watchListsData.filme.filter(item => item.isUpcoming)
        ];
    }

    // 2. Apply search filter to the determined base items
    const itemsToDisplay = applySearchFilter(baseItems);

    // 3. Render to the target list
    watchlists.forEach(list => list.classList.remove('active'));
    const listElement = document.getElementById(targetListElementId);
    if (!listElement) { console.error(`List element #${targetListElementId} not found!`); return; }

    listElement.innerHTML = '';
    if (itemsToDisplay.length === 0) { listElement.innerHTML = '<li style="text-align:center; color: var(--text-muted-color); cursor: default; background: none; border: none;">Keine Einträge gefunden.</li>'; }
    else { itemsToDisplay.forEach(item => { try { listElement.appendChild(createListItemElement(item, activeTabId === 'upcoming')); } catch (e) { console.error("Error creating list item:", item, e); } }); } // Pass upcoming flag for potential future use

    listElement.classList.add('active');
    addDragAndDropListeners();
}


function createListItemElement(item, isUpcomingView = false) { // isUpcomingView flag kept for now
    if (!item || !item.id || !item.type || typeof item.title === 'undefined') { const li = document.createElement('li'); li.textContent="Error"; li.style.color='red'; return li; }
    const li = document.createElement('li');
    const isDraggable = activeTabId !== 'upcoming'; // Only upcoming is not draggable
    li.setAttribute('draggable', isDraggable);
    li.dataset.id = item.id; li.dataset.type = item.type;
    // Use 'genre' property now
    const genreText = item.genre || 'Keine Angabe'; // Use genre, provide default
    const durationText = item.duration ?? 'N/A';
    const titleText = item.title ?? 'Unbekannter Titel';
    let titleHtml = escapeHtml(titleText);
    // No type indicator needed for V1.1

    li.innerHTML = `
        <div class="item-details"><strong>${titleHtml}</strong><div class="item-meta"><span><span class="label">Genre:</span> ${escapeHtml(genreText)}</span><span><span class="label">Dauer:</span> ${escapeHtml(durationText)}</span></div></div>
        <div class="item-actions"><button class="icon-btn edit-icon-btn" title="Bearbeiten">✏️</button><button class="icon-btn delete-icon-btn" title="Löschen">🗑️</button></div>`;
    const editBtn = li.querySelector('.edit-icon-btn'); editBtn.addEventListener('click', () => { openEditModal(item); });
    const deleteBtn = li.querySelector('.delete-icon-btn'); deleteBtn.addEventListener('click', () => deleteItem(item.id, item.type));
    if (!isDraggable) li.style.cursor = 'default';
    return li;
}

function escapeHtml(unsafe) { if (typeof unsafe !== 'string') return unsafe; return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }

// --- Tag Handling Removed ---

// --- Modal Management ---
function openModal(modalElement) { modalElement.style.display = 'flex'; bodyElement.classList.add('modal-open'); }
function closeModal(modalElement) { modalElement.style.display = 'none'; bodyElement.classList.remove('modal-open'); }

// --- Add Item ---
function openAddModal() { clearAddModal(); openModal(addModal); addTitleInput.focus(); }
function closeAddModal() { closeModal(addModal); }
function clearAddModal() {
    addTitleInput.value = '';
    addGenreInput.value = ''; // Clear genre input
    addDurationInput.value = '';
    addUpcomingCheckbox.checked = false;
    document.querySelector('input[name="add-item-type"][value="serien"]').checked = true;
}
function saveAddItem() { // Simplified for V1.1
    const title = addTitleInput.value.trim(); if (!title) { alert("Titel?"); addTitleInput.focus(); return; }
    const itemType = document.querySelector('input[name="add-item-type"]:checked').value;
    const genre = addGenreInput.value.trim(); // Read single genre
    const duration = addDurationInput.value.trim() || 'N/A';
    const isUpcoming = addUpcomingCheckbox.checked;
    const newItem = {
        id: Date.now().toString() + Math.random(),
        type: itemType,
        title: title,
        genre: genre, // Save single genre
        duration: duration,
        isUpcoming: isUpcoming
    };
    if (!watchListsData[itemType]) watchListsData[itemType] = [];
    watchListsData[itemType].push(newItem);
    renderLists(); saveData(); closeAddModal();
}

// --- Delete Item ---
function deleteItem(itemId, itemType) {
    if (!itemId || !itemType || !watchListsData[itemType]) return; const list = watchListsData[itemType]; const itemIndex = list.findIndex(item => item?.id === itemId); if (itemIndex > -1) { if (confirm(`"${list[itemIndex].title}" wirklich löschen?`)) { list.splice(itemIndex, 1); renderLists(); saveData(); } } else { console.warn("Item to delete not found:", itemId, itemType); }
}

// --- Edit Item ---
function openEditModal(item) { // Simplified for V1.1
    if (!item || !item.id || !item.type) return;
    editItemIdInput.value = item.id;
    editItemTypeInput.value = item.type;
    editTitleInput.value = item.title;
    editGenreInput.value = item.genre || ''; // Use genre property
    editDurationInput.value = item.duration || ''; // Use correct ID
    editUpcomingCheckbox.checked = item.isUpcoming;
    // No need to hide checkbox group
    openModal(editModal);
    editTitleInput.focus();
 }
function closeEditModal() { closeModal(editModal); }
function saveEditItem() { // Simplified for V1.1
    const itemId = editItemIdInput.value; const itemType = editItemTypeInput.value;
    if (!itemId || !itemType || !watchListsData[itemType]) return;
    const list = watchListsData[itemType]; const itemIndex = list.findIndex(item => item?.id === itemId);
    if (itemIndex > -1) {
        const item = list[itemIndex];
        item.title = editTitleInput.value.trim() || 'Unbenannt';
        item.genre = editGenreInput.value.trim(); // Read single genre
        item.duration = editDurationInput.value.trim() || 'N/A'; // Use correct ID
        item.isUpcoming = editUpcomingCheckbox.checked;
        renderLists(); saveData(); closeEditModal();
    } else { alert("Fehler: Eintrag nicht gefunden."); closeEditModal(); }
}

 // --- Extended Search Modal Removed ---

// --- Drag and Drop ---
function addDragAndDropListeners() { const draggableItems = document.querySelectorAll('.watchlist:not(#upcoming-list) li[draggable="true"]'); draggableItems.forEach(item => { item.removeEventListener('dragstart', handleDragStart); item.removeEventListener('dragend', handleDragEnd); item.addEventListener('dragstart', handleDragStart); item.addEventListener('dragend', handleDragEnd); }); ['serien-list', 'filme-list'].forEach(listId => { const el = document.getElementById(listId); if(el){ el.removeEventListener('dragover', handleDragOver); el.removeEventListener('drop', handleDrop); el.removeEventListener('dragleave', handleDragLeave); el.addEventListener('dragover', handleDragOver); el.addEventListener('drop', handleDrop); el.addEventListener('dragleave', handleDragLeave); } }); }
function handleDragStart(e) { if (e.target.closest('#upcoming-list')) { e.preventDefault(); return; } draggedItemElement = e.target.closest('li'); if (!draggedItemElement || !draggedItemElement.dataset.id || !draggedItemElement.dataset.type) return; e.dataTransfer.setData('text/plain', draggedItemElement.dataset.id); e.dataTransfer.setData('text/itemtype', draggedItemElement.dataset.type); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => { if (draggedItemElement) draggedItemElement.classList.add('dragging'); }, 0); if (!dropIndicator) { dropIndicator = document.createElement('div'); dropIndicator.classList.add('drop-indicator'); } }
function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; const listElement = e.target.closest('.watchlist:not(#upcoming-list)'); if (!listElement || !draggedItemElement || !dropIndicator) return; if (dropIndicator.parentNode !== listElement) listElement.appendChild(dropIndicator); const targetLi = e.target.closest('li:not(.dragging)'); let indicatorY = -1; if (targetLi && targetLi !== draggedItemElement) { const rect = targetLi.getBoundingClientRect(); const midpoint = rect.top + rect.height / 2; if (e.clientY < midpoint) { indicatorY = targetLi.offsetTop - 3; } else { indicatorY = targetLi.offsetTop + targetLi.offsetHeight + 2; } } else { const lastLi = listElement.querySelector('li:not(.dragging):last-child'); if(lastLi && e.clientY > lastLi.offsetTop + lastLi.offsetHeight / 2) { indicatorY = lastLi.offsetTop + lastLi.offsetHeight + 2; } else if (!listElement.querySelector('li:not(.dragging)')) { indicatorY = 5; } else { const firstLi = listElement.querySelector('li:not(.dragging)'); if (firstLi && e.clientY < firstLi.offsetTop + firstLi.offsetHeight / 2) { indicatorY = firstLi.offsetTop - 3; } else if (firstLi) { indicatorY = (lastLi) ? lastLi.offsetTop + lastLi.offsetHeight + 2 : 5; } else { indicatorY = 5; } } } if (indicatorY !== -1) { dropIndicator.style.top = `${indicatorY}px`; dropIndicator.style.display = 'block'; } else { dropIndicator.style.display = 'none'; } }
function handleDragLeave(e) { const listElement = e.target.closest('.watchlist'); if (listElement && dropIndicator && !listElement.contains(e.relatedTarget)) { if(dropIndicator.parentNode === listElement) dropIndicator.style.display = 'none'; } }
function handleDragEnd() { if (draggedItemElement) { draggedItemElement.classList.remove('dragging'); } draggedItemElement = null; if (dropIndicator?.parentNode) dropIndicator.parentNode.removeChild(dropIndicator); }
function handleDrop(e) { e.preventDefault(); if (!draggedItemElement) { handleDragEnd(); return; } const targetListElement = e.target.closest('.watchlist'); if (!targetListElement || !['serien-list', 'filme-list'].includes(targetListElement.id)) { handleDragEnd(); return; } const targetListType = targetListElement.id.replace('-list', ''); const draggedItemId = e.dataTransfer.getData('text/plain'); const originalListType = e.dataTransfer.getData('text/itemtype'); if (!draggedItemId || !originalListType || !watchListsData[originalListType] || !watchListsData[targetListType]) { console.error("D&D Error: Invalid data"); handleDragEnd(); return; } const originalList = watchListsData[originalListType]; const targetList = watchListsData[targetListType]; const itemIndex = originalList.findIndex(item => item?.id === draggedItemId); if (itemIndex === -1) { console.error("D&D Error: Item not found"); handleDragEnd(); return; } const [itemData] = originalList.splice(itemIndex, 1); if (originalListType !== targetListType) { itemData.type = targetListType; } let insertBeforeIndex = targetList.length; if (dropIndicator && dropIndicator.parentNode === targetListElement && dropIndicator.style.display !== 'none') { const indicatorTop = dropIndicator.offsetTop; const nextElement = Array.from(targetListElement.children).find(child => child.offsetTop >= indicatorTop && !child.classList.contains('dragging') && !child.classList.contains('drop-indicator')); if (nextElement?.dataset?.id) { const idx = targetList.findIndex(item => item?.id === nextElement.dataset.id); if (idx !== -1) insertBeforeIndex = idx; } } targetList.splice(insertBeforeIndex, 0, itemData); handleDragEnd(); renderLists(); saveData(); }

 // --- Settings Modal Logic ---
 function openSettingsModal() { openModal(settingsModal); clearStatusMessages(); }
 function closeSettingsModal() { closeModal(settingsModal); }
 function clearStatusMessages() { exportStatus.textContent = ''; exportStatus.className = ''; importStatus.textContent = ''; importStatus.className = ''; copyStatus.textContent = ''; copyStatus.className = ''; }
 function showStatus(element, message, type = 'info') { element.textContent = message; element.className = type; setTimeout(() => { element.textContent = ''; element.className = ''; }, 4000); }
 function exportData() { try { const dataStr = JSON.stringify(watchListsData, null, 2); const dataBlob = new Blob([dataStr], {type: "application/json"}); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = "watchlist_export_v1.1.json"; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); showStatus(exportStatus, "Export erfolgreich!", 'success'); } catch (error) { console.error("Export failed:", error); showStatus(exportStatus, "Export fehlgeschlagen.", 'error'); } }
 function importData(event) { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const importedRaw = JSON.parse(e.target.result); if (typeof importedRaw === 'object' && importedRaw !== null && Array.isArray(importedRaw.serien) && Array.isArray(importedRaw.filme)) { if (confirm("Aktuelle Watchlist ersetzen?")) { localStorage.setItem('watchListsData_v1.1', JSON.stringify(importedRaw)); loadData(); setActiveTab('serien'); renderLists(); showStatus(importStatus, "Import erfolgreich!", 'success'); } else { showStatus(importStatus, "Import abgebrochen."); } } else { throw new Error("Ungültiges Dateiformat."); } } catch (error) { console.error("Import failed:", error); showStatus(importStatus, `Import fehlgeschlagen: ${error.message}`, 'error'); } finally { importFileInput.value = null; } }; reader.onerror = () => { showStatus(importStatus, "Fehler beim Lesen der Datei.", 'error'); importFileInput.value = null; }; reader.readAsText(file); }
 // Simplified AI prompt for V1.1
 const aiHelpPrompt = `
Bitte formatiere die folgende Liste von Filmen und Serien in das JSON-Format für meine Watchlist-Anwendung V1.1. Das JSON-Hauptobjekt muss zwei Schlüssel enthalten: "serien" und "filme". Beide Schlüssel sollten ein Array von Objekten als Wert haben.

Jedes Objekt innerhalb der Arrays repräsentiert einen Film oder eine Serie und sollte die folgenden Schlüssel haben:
- "id": Ein eindeutiger String (z.B. Zeitstempel + Zufallszahl).
- "type": Ein String, entweder "serien" oder "filme".
- "title": Der Titel des Films oder der Serie (String).
- "genre": Ein String, der das Genre beschreibt (z.B. "Action", "Sci-Fi, Thriller"). Wenn kein Genre angegeben ist, leer lassen "".
- "duration": Ein String, der die Dauer beschreibt (z.B. "148 min", "3 Staffeln", "N/A"). Wenn keine Dauer angegeben ist, verwende "N/A".
- "isUpcoming": Ein boolescher Wert (true oder false), standardmäßig false.

Hier ist die Liste, die du formatieren sollst:
[HIER DIE UNFORMATIERTE LISTE EINFÜGEN]

Beispiel für ein Objekt im "filme"-Array:
{
  "id": "1700000000000-0.123",
  "type": "filme",
  "title": "Inception",
  "genre": "Action, Sci-Fi, Thriller",
  "duration": "148 min",
  "isUpcoming": false
}

Bitte gib nur das vollständige JSON-Objekt zurück.
`;
 function copyHelpText() { if (!navigator.clipboard) { showStatus(copyStatus, "Clipboard API nicht verfügbar.", 'error'); return; } navigator.clipboard.writeText(aiHelpPrompt.trim()).then(() => { showStatus(copyStatus, "AI Prompt kopiert!", 'success'); }).catch(err => { console.error('Kopieren fehlgeschlagen:', err); showStatus(copyStatus, "Kopieren fehlgeschlagen.", 'error'); }); }

// --- Initial Load ---
loadData();
setActiveTab(activeTabId, true); // Set initial tab without saving again
addEventListeners();
renderLists(); // Initial render