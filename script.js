document.addEventListener('DOMContentLoaded', () => { // Ensure this wraps the entire script
    // --- Globals ---
    const bodyElement = document.body;
    // Login elements removed
    const appContainer = document.getElementById('app-container');
    const settingsCog = document.getElementById('settings-cog');
    const searchInput = document.getElementById('search-input');
    const openFilterBtn = document.getElementById('open-filter-btn');

    const tabButtons = document.querySelectorAll('.tab-button');
    const watchlists = document.querySelectorAll('.watchlist');

    // Add Modal Elements - VERIFIED IDs match HTML
    const openAddModalBtn = document.getElementById('open-add-modal-btn');
    const addModal = document.getElementById('add-modal');
    const addTitleInput = document.getElementById('add-title');
    const addTypeRadios = document.querySelectorAll('input[name="add-item-type"]');
    const addTagsInput = document.getElementById('add-tags-input');
    const addTagsContainer = document.getElementById('add-tags-container');
    const addDurationInput = document.getElementById('add-duration');
    const addUpcomingCheckbox = document.getElementById('add-upcoming-checkbox');
    const saveAddBtn = document.getElementById('save-add-btn');
    const cancelAddBtn = document.getElementById('cancel-add-btn');

    // Edit Modal Elements - VERIFIED IDs match HTML
    const editModal = document.getElementById('edit-modal');
    const editItemIdInput = document.getElementById('edit-item-id');
    const editItemTypeInput = document.getElementById('edit-item-type');
    const editTitleInput = document.getElementById('edit-title');
    const editTagsInput = document.getElementById('edit-tags-input');
    const editTagsContainer = document.getElementById('edit-tags-container');
    const editDurationDateInput = document.getElementById('edit-duration-date'); // Matches HTML ID
    const editUpcomingCheckboxGroup = document.getElementById('edit-upcoming-checkbox-group');
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

      // Extended Search Modal Elements
     const extendedSearchModal = document.getElementById('extended-search-modal');
     const filterTagsContainer = document.getElementById('filter-tags-container');
     const filterTypeCheckboxes = document.querySelectorAll('input[name="filter-type"]');
     const resetFiltersBtn = document.getElementById('reset-filters-btn');
     const applyFiltersBtn = document.getElementById('apply-filters-btn');

    // D&D State
    let draggedItemElement = null;
    let dropIndicator = null;

    // App State
    let watchListsData = { serien: [], filme: [] };
    let activeTabId = 'serien';
    let lastActiveTabBeforeSearch = 'serien';
    let currentSearchTerm = '';
    let activeFilters = { type: ['serien', 'filme'], tags: [] };

    // --- Data Persistence ---
    function saveData() { try { localStorage.setItem('watchListsData_v10', JSON.stringify(watchListsData)); localStorage.setItem('activeTab_v10', lastActiveTabBeforeSearch); } catch (e) { console.error("Error saving data:", e); } }
    function loadData() {
        const savedData = localStorage.getItem('watchListsData_v10'); const savedTab = localStorage.getItem('activeTab_v10');
        watchListsData = { serien: [], filme: [] };
        if (savedData) { try { const parsedData = JSON.parse(savedData); if (typeof parsedData === 'object' && parsedData !== null && Array.isArray(parsedData.serien) && Array.isArray(parsedData.filme)) { watchListsData.serien = parsedData.serien.map(sanitizeItem('serien')); watchListsData.filme = parsedData.filme.map(sanitizeItem('filme')); } else { throw new Error("Invalid V10 structure"); } } catch (e) { console.error("Error parsing V10 saved data:", e); } }
        activeTabId = ['serien', 'filme', 'upcoming'].includes(savedTab) ? savedTab : 'serien';
        lastActiveTabBeforeSearch = activeTabId;
        currentSearchTerm = ''; searchInput.value = ''; resetActiveFilters();
    }
    function sanitizeItem(typeKey) { return item => ({ id: item.id || (Date.now().toString() + Math.random()), type: typeKey, title: typeof item.title === 'string' ? item.title : "Unbenannt", tags: Array.isArray(item.tags) ? item.tags.filter(t => typeof t === 'string') : (Array.isArray(item.genres) ? item.genres.filter(g => typeof g === 'string') : []), duration: typeof item.duration === 'string' ? item.duration : "N/A", isUpcoming: typeof item.isUpcoming === 'boolean' ? item.isUpcoming : false }); }

     // --- Setup Event Listeners ---
    function addEventListeners() {
        tabButtons.forEach(button => { button.addEventListener('click', () => { searchInput.value = ''; currentSearchTerm = ''; setActiveTab(button.getAttribute('data-tab')); }); });
        searchInput.addEventListener('input', handleSearchInput);
        openFilterBtn.addEventListener('click', openExtendedSearchModal);
        openAddModalBtn.addEventListener('click', openAddModal);
        cancelAddBtn.addEventListener('click', closeAddModal);
        saveAddBtn.addEventListener('click', saveAddItem);
        addTagsInput.addEventListener('keypress', (e) => handleTagInputKeyPress(e, addTagsContainer)); // Pass specific container
        cancelEditBtn.addEventListener('click', closeEditModal);
        saveEditBtn.addEventListener('click', saveEditItem);
        editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });
        editTagsInput.addEventListener('keypress', (e) => handleTagInputKeyPress(e, editTagsContainer)); // Pass specific container
        settingsCog.addEventListener('click', openSettingsModal);
        closeSettingsBtn.addEventListener('click', closeSettingsModal);
        settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettingsModal(); });
        exportBtn.addEventListener('click', exportData);
        importBtn.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', importData);
        copyHelpBtn.addEventListener('click', copyHelpText);
        extendedSearchModal.addEventListener('click', (e) => { if (e.target === extendedSearchModal) closeExtendedSearchModal(false); });
        resetFiltersBtn.addEventListener('click', resetAndCloseFilters);
        applyFiltersBtn.addEventListener('click', applyAndCloseFilters);
        filterTypeCheckboxes.forEach(checkbox => { checkbox.addEventListener('change', handleFilterTypeChange); });
    }

    // --- Search Input Handling ---
    function handleSearchInput() {
        const newSearchTerm = searchInput.value.toLowerCase();
        if (newSearchTerm !== currentSearchTerm) {
            currentSearchTerm = newSearchTerm;
            if (currentSearchTerm && activeTabId !== 'upcoming') {
                setActiveTab('search', true);
            } else if (!currentSearchTerm && activeTabId === 'search') {
                setActiveTab(lastActiveTabBeforeSearch);
            }
            renderLists();
        }
    }

    // --- Tab Switching & Search Mode ---
    function setActiveTab(tabId, isInternalCall = false) {
         activeTabId = tabId;
         if (activeTabId !== 'search') { lastActiveTabBeforeSearch = tabId; if (!isInternalCall) saveData(); }
         updateTabButtonVisuals();
         if (!isInternalCall || activeTabId === 'search') renderLists();
    }
    function updateTabButtonVisuals() { tabButtons.forEach(btn => { const btnTabId = btn.getAttribute('data-tab'); if (activeTabId === 'search' && btnTabId !== 'upcoming') { btn.classList.remove('active'); btn.classList.add('inactive-search'); } else { btn.classList.toggle('active', btnTabId === activeTabId); btn.classList.remove('inactive-search'); } }); }

    // --- Filtering Logic ---
    function applyFilters(items) {
         let filtered = items;
         if (currentSearchTerm) filtered = filtered.filter(item => item.title.toLowerCase().includes(currentSearchTerm));
         if (activeTabId !== 'upcoming') {
             if (activeFilters.type && activeFilters.type.length > 0 && activeFilters.type.length < 2) { filtered = filtered.filter(item => activeFilters.type.includes(item.type)); }
             if (activeFilters.tags && activeFilters.tags.length > 0) { filtered = filtered.filter(item => Array.isArray(item.tags) && item.tags.some(itemTag => activeFilters.tags.includes(itemTag))); }
         }
         return filtered;
     }

    // --- Rendering Lists ---
    function renderLists() {
        let baseItems = []; let targetListElementId = 'serien-list'; let showTypeIndicator = false;
        if (activeTabId === 'search') { baseItems = [...watchListsData.serien.filter(item => !item.isUpcoming), ...watchListsData.filme.filter(item => !item.isUpcoming)]; targetListElementId = 'serien-list'; showTypeIndicator = true; }
        else if (activeTabId === 'upcoming') { baseItems = [...watchListsData.serien.filter(item => item.isUpcoming), ...watchListsData.filme.filter(item => item.isUpcoming)]; targetListElementId = 'upcoming-list'; showTypeIndicator = true; }
        else if (activeTabId === 'serien') { baseItems = watchListsData.serien.filter(item => !item.isUpcoming); targetListElementId = 'serien-list'; }
        else if (activeTabId === 'filme') { baseItems = watchListsData.filme.filter(item => !item.isUpcoming); targetListElementId = 'filme-list'; }
        const itemsToDisplay = applyFilters(baseItems);

        watchlists.forEach(list => list.classList.remove('active')); const listElement = document.getElementById(targetListElementId); if (!listElement) { console.error(`List element #${targetListElementId} not found!`); return; } listElement.innerHTML = '';
        if (itemsToDisplay.length === 0) { listElement.innerHTML = '<li style="text-align:center; color: var(--text-muted-color); cursor: default; background: none; border: none;">Keine Einträge gefunden.</li>'; }
        else { itemsToDisplay.forEach(item => { try { listElement.appendChild(createListItemElement(item, showTypeIndicator)); } catch (e) { console.error("Error creating list item:", item, e); } }); }
        listElement.classList.add('active'); addDragAndDropListeners(); updateTabButtonVisuals();
    }

    function createListItemElement(item, showTypeIndicator = false) {
        // Basic validation at the start
        if (!item || !item.id || !item.type || typeof item.title === 'undefined') {
            console.error("Rendering Error: Invalid item data received:", item);
            const li = document.createElement('li');
            li.textContent = "Fehlerhafter Eintrag";
            li.style.color = 'red';
            li.style.cursor = 'default';
            return li;
        }

        const li = document.createElement('li');
        const isDraggable = activeTabId !== 'upcoming' && activeTabId !== 'search';
        li.setAttribute('draggable', isDraggable);
        li.dataset.id = item.id;
        li.dataset.type = item.type;

        // Safely access properties with defaults
        const tagsText = (Array.isArray(item.tags) && item.tags.length > 0) ? item.tags.map(escapeHtml).join(', ') : 'Keine Angabe';
        const durationText = item.duration ?? 'N/A';
        const titleText = item.title ?? 'Unbekannter Titel';
        let titleHtml = escapeHtml(titleText);

        if (showTypeIndicator) {
            const typeLabel = item.type === 'serien' ? 'Serie' : 'Film';
            titleHtml += ` <span class="item-type-label">(${typeLabel})</span>`;
        }

  
        li.innerHTML = `
            <div class="item-details">
                <strong>${titleHtml}</strong>
                <div class="item-meta">
                    <span><span class="label">Tags:</span> ${tagsText}</span>
                    <span><span class="label">Dauer:</span> ${escapeHtml(durationText)}</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="icon-btn edit-icon-btn" title="Bearbeiten">✏️</button>
                <button class="icon-btn delete-icon-btn" title="Löschen">🗑️</button>
            </div>`;

        // Attach listeners
        const editBtn = li.querySelector('.edit-icon-btn');
        if (editBtn) { 
             editBtn.addEventListener('click', () => { openEditModal(item); });
        }

        const deleteBtn = li.querySelector('.delete-icon-btn');
        if(deleteBtn) { 
             deleteBtn.addEventListener('click', () => deleteItem(item.id, item.type));
        }

        if (!isDraggable) li.style.cursor = 'default';
        return li;
    } // End of createListItemElement

    function escapeHtml(unsafe) { if (typeof unsafe !== 'string') return unsafe; return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }

    // --- Tag Handling ---
    function handleTagInputKeyPress(event, containerElement) { if (event.key === 'Enter') { event.preventDefault(); const inputElement = event.target; const tagText = inputElement.value.trim(); if (tagText && containerElement) { const existingTags = Array.from(containerElement.querySelectorAll('.tag span:first-child')).map(span => span.textContent.toLowerCase()); if (!existingTags.includes(tagText.toLowerCase())) { addTag(tagText, containerElement); inputElement.value = ''; } else { inputElement.value = ''; } } } }
    function addTag(tagText, containerElement) { const tag = document.createElement('div'); tag.classList.add('tag'); tag.innerHTML = `<span>${escapeHtml(tagText)}</span><span class="remove-tag" title="Tag entfernen">×</span>`; tag.querySelector('.remove-tag').addEventListener('click', (e) => { e.stopPropagation(); tag.remove(); if (containerElement.childElementCount === 0) containerElement.classList.remove('visible'); }); containerElement.appendChild(tag); containerElement.classList.add('visible'); }
    function getTagsFromTagsContainer(containerElement) { if (!containerElement) { console.error("Tag container not found!"); return []; } return Array.from(containerElement.querySelectorAll('.tag span:first-child')).map(span => span.textContent); } // Added check
    function populateTagsContainer(tagsArray, containerElement) { if (!containerElement) { console.error("Tag container not found for populating!"); return; } containerElement.innerHTML = ''; (tagsArray || []).forEach(tagText => addTag(tagText, containerElement)); containerElement.classList.toggle('visible', containerElement.childElementCount > 0); }

    // --- Modal Management ---
    function openModal(modalElement) { modalElement.style.display = 'flex'; bodyElement.classList.add('modal-open'); }
    function closeModal(modalElement) { modalElement.style.display = 'none'; bodyElement.classList.remove('modal-open'); }

    // --- Add Item ---
    function openAddModal() { clearAddModal(); openModal(addModal); addTitleInput.focus(); }
    function closeAddModal() { closeModal(addModal); addTagsContainer.classList.remove('visible'); }
    function clearAddModal() { addTitleInput.value = ''; addTagsInput.value = ''; addTagsContainer.innerHTML = ''; addTagsContainer.classList.remove('visible'); addDurationInput.value = ''; addUpcomingCheckbox.checked = false; document.querySelector('input[name="add-item-type"][value="serien"]').checked = true; }
    function saveAddItem() { // Double-checked element variable names
        const title = addTitleInput.value.trim(); if (!title) { alert("Bitte gebe einen Titel an."); addTitleInput.focus(); return; }
        const itemType = document.querySelector('input[name="add-item-type"]:checked').value;
        const tags = getTagsFromTagsContainer(addTagsContainer); // Ensure this uses addTagsContainer
        const duration = addDurationInput.value.trim() || 'N/A'; // Ensure this uses addDurationInput
        const isUpcoming = addUpcomingCheckbox.checked;
        const newItem = { id: Date.now().toString() + Math.random(), type: itemType, title: title, tags: tags, duration: duration, isUpcoming: isUpcoming };
        // console.log("Saving New Item:", JSON.stringify(newItem)); // Keep for debugging if needed
        if (!watchListsData[itemType]) watchListsData[itemType] = [];
        watchListsData[itemType].push(newItem);
        if (activeTabId === 'search') { searchInput.value = ''; currentSearchTerm = ''; setActiveTab(newItem.isUpcoming ? 'upcoming' : newItem.type); } else { renderLists(); }
         saveData(); closeAddModal();
    }

    // --- Delete Item ---
    function deleteItem(itemId, itemType) { if (!itemId || !itemType || !watchListsData[itemType]) return; const list = watchListsData[itemType]; const itemIndex = list.findIndex(item => item?.id === itemId); if (itemIndex > -1) { if (confirm(`"${list[itemIndex].title}" wirklich löschen?`)) { list.splice(itemIndex, 1); renderLists(); saveData(); } } else { console.warn("Item to delete not found:", itemId, itemType); } }

    // --- Edit Item ---
    function openEditModal(item) {
        if (!item || !item.id || !item.type) return; editItemIdInput.value = item.id; editItemTypeInput.value = item.type; editTitleInput.value = item.title;
        populateTagsContainer(item.tags || [], editTagsContainer); // Use correct container ID
        editTagsInput.value = '';
        editDurationDateInput.value = item.duration || ''; // Use correct input ID
        editUpcomingCheckboxGroup.classList.toggle('hidden', !item.isUpcoming); editUpcomingCheckbox.checked = item.isUpcoming;
        openModal(editModal); editTitleInput.focus();
     }
    function closeEditModal() { closeModal(editModal); editTagsContainer.classList.remove('visible'); }
    function saveEditItem() { // Double-checked element variable names
        const itemId = editItemIdInput.value; const itemType = editItemTypeInput.value;
        if (!itemId || !itemType || !watchListsData[itemType]) return;
        const list = watchListsData[itemType]; const itemIndex = list.findIndex(item => item?.id === itemId);
        if (itemIndex > -1) {
            const item = list[itemIndex]; item.title = editTitleInput.value.trim() || 'Unbenannt';
            item.tags = getTagsFromTagsContainer(editTagsContainer); // Use correct container ID
            item.duration = editDurationDateInput.value.trim() || 'N/A'; // Use correct input ID
            if (!editUpcomingCheckboxGroup.classList.contains('hidden')) { item.isUpcoming = editUpcomingCheckbox.checked; }
            // console.log("Saving Updated Item:", JSON.stringify(item)); // Keep for debugging if needed
            if (activeTabId === 'search') { searchInput.value = ''; currentSearchTerm = ''; setActiveTab(item.isUpcoming ? 'upcoming' : item.type); } else { renderLists(); }
            saveData(); closeEditModal();
        } else { alert("Fehler: Eintrag nicht gefunden."); closeEditModal(); }
    }

     // --- Extended Search Modal ---
     function openExtendedSearchModal() { populateFilterTags(); filterTypeCheckboxes.forEach(cb => { cb.checked = activeFilters.type.includes(cb.value); }); filterTagsContainer.querySelectorAll('.filter-tag-btn').forEach(btn => { btn.classList.toggle('active', activeFilters.tags.includes(btn.dataset.tag)); }); openModal(extendedSearchModal); }
     function closeExtendedSearchModal(shouldApplyFilters = false) { if (shouldApplyFilters) { activeFilters.type = []; filterTypeCheckboxes.forEach(cb => { if (cb.checked) activeFilters.type.push(cb.value); }); activeFilters.tags = []; filterTagsContainer.querySelectorAll('.filter-tag-btn.active').forEach(btn => { activeFilters.tags.push(btn.dataset.tag); }); if (!currentSearchTerm && activeTabId === 'search') { setActiveTab(lastActiveTabBeforeSearch); } else { renderLists(); } } closeModal(extendedSearchModal); }
     function populateFilterTags() { const allTags = new Set(); watchListsData.serien.forEach(item => item.tags?.forEach(tag => allTags.add(tag))); watchListsData.filme.forEach(item => item.tags?.forEach(tag => allTags.add(tag))); filterTagsContainer.innerHTML = ''; if (allTags.size === 0) { filterTagsContainer.innerHTML = '<span style="color: var(--text-muted-color);">Keine Tags zum Filtern vorhanden.</span>'; return; } const sortedTags = Array.from(allTags).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); sortedTags.forEach(tag => { const btn = document.createElement('button'); btn.classList.add('filter-tag-btn'); btn.textContent = tag; btn.dataset.tag = tag; btn.addEventListener('click', () => { btn.classList.toggle('active'); }); btn.classList.toggle('active', activeFilters.tags.includes(tag)); filterTagsContainer.appendChild(btn); }); }
     function resetActiveFilters() { activeFilters.type = ['serien', 'filme']; activeFilters.tags = []; }
     function resetAndCloseFilters() { resetActiveFilters(); if (currentSearchTerm) { renderLists(); } else { setActiveTab(lastActiveTabBeforeSearch); } closeModal(extendedSearchModal); }
     function applyAndCloseFilters() { closeExtendedSearchModal(true); }
     function handleFilterTypeChange(event) { const checkedCheckboxes = document.querySelectorAll('input[name="filter-type"]:checked'); if (checkedCheckboxes.length === 0) { event.target.checked = true; } }

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
    function exportData() { try { 
        const now = new Date();
        const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19); // Format: YYYY-MM-DDTHH-mm-ss
        const dataStr = JSON.stringify(watchListsData, null, 2);
        const dataBlob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `watchlist_export_${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showStatus(exportStatus, "Export erfolgreich!", 'success');
    } catch (error) {
        console.error("Export failed:", error);
        showStatus(exportStatus, "Export fehlgeschlagen.", 'error');
    } }
     function importData(event) { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const importedRaw = JSON.parse(e.target.result); if (typeof importedRaw === 'object' && importedRaw !== null && Array.isArray(importedRaw.serien) && Array.isArray(importedRaw.filme)) { if (confirm("Aktuelle Watchlist ersetzen?")) { localStorage.setItem('watchListsData_v10', JSON.stringify(importedRaw)); loadData(); setActiveTab('serien'); renderLists(); showStatus(importStatus, "Import erfolgreich!", 'success'); } else { showStatus(importStatus, "Import abgebrochen."); } } else { throw new Error("Ungültiges Dateiformat."); } } catch (error) { console.error("Import failed:", error); showStatus(importStatus, `Import fehlgeschlagen: ${error.message}`, 'error'); } finally { importFileInput.value = null; } }; reader.onerror = () => { showStatus(importStatus, "Fehler beim Lesen der Datei.", 'error'); importFileInput.value = null; }; reader.readAsText(file); }
        const aiHelpPrompt = `
    Bitte formatiere die folgende Liste von Filmen und Serien in das JSON-Format für meine Watchlist-Anwendung. Das JSON-Hauptobjekt muss zwei Schlüssel enthalten: "serien" und "filme". Beide Schlüssel sollten ein Array von Objekten als Wert haben.

Jedes Objekt innerhalb der Arrays repräsentiert einen Film oder eine Serie und sollte die folgenden Schlüssel haben:
- "id": Ein eindeutiger String (kannst du generieren, z.B. mit Zeitstempel + Zufallszahl).
- "type": Ein String, entweder "serien" oder "filme", je nachdem, in welchem Array es sich befindet.
- "title": Der Titel des Films oder der Serie (String).
- "tags": Ein Array von Strings, das die Tags (früher Genres) auflistet (z.B. ["Action", "Sci-Fi"]). Wenn keine Tags angegeben sind, verwende ein leeres Array [].
- "duration": Ein String, der die Dauer beschreibt (z.B. "148 min", "3 Staffeln", "N/A"). Wenn keine Dauer angegeben ist, verwende "N/A".
- "isUpcoming": Ein boolescher Wert (true oder false). Setze ihn standardmäßig auf false, es sei denn, die Liste deutet darauf hin, dass er "upcoming" ist.

Hier ist die Liste, die du formatieren sollst:
[HIER DIE UNFORMATIERTE LISTE EINFÜGEN]

Beispiel für ein Objekt im "filme"-Array:
{
  "id": "1700000000000-0.123",
  "type": "filme",
  "title": "Inception",
  "tags": ["Action", "Sci-Fi", "Thriller"],
  "duration": "148 min",
  "isUpcoming": false
}

Beispiel für ein Objekt im "serien"-Array:
{
  "id": "1700000000001-0.456",
  "type": "serien",
  "title": "Stranger Things",
  "tags": ["Drama", "Fantasy", "Horror"],
  "duration": "4 Staffeln",
  "isUpcoming": true
}

Bitte gib nur das vollständige JSON-Objekt zurück, beginnend mit { und endend mit }.
`;
     function copyHelpText() { if (!navigator.clipboard) { showStatus(copyStatus, "Clipboard API nicht verfügbar.", 'error'); return; } const v10Prompt = aiHelpPrompt.replace(/"genres"/g, '"tags"').replace(/Genre/g, 'Tag').replace(/genres/g, 'tags'); navigator.clipboard.writeText(v10Prompt.trim()).then(() => { showStatus(copyStatus, "AI Prompt kopiert!", 'success'); }).catch(err => { console.error('Kopieren fehlgeschlagen:', err); showStatus(copyStatus, "Kopieren fehlgeschlagen.", 'error'); }); }

    // --- Initial Load ---
    loadData();
    setActiveTab(activeTabId, true); // Set initial tab without saving again
    addEventListeners();
    renderLists(); // Initial render

}); // End DOMContentLoaded wrapper