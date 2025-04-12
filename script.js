document.addEventListener('DOMContentLoaded', () => {
    // --- Globals ---
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    // --- Element References (Declared with let) ---
    let appContainer, settingsCog, searchInput, openFilterBtn, tabButtons, watchlists,
        openAddModalBtn, addModal, addTitleInput, addTypeRadios, addTagsInput, addTagsContainer,
        addDurationInput, addUpcomingCheckbox, saveAddBtn, cancelAddBtn,
        editModal, editItemIdInput, editItemTypeInput, editTitleInput, editTagsInput, editTagsContainer,
        editDurationDateInput, editUpcomingCheckboxGroup, editUpcomingCheckbox, saveEditBtn, cancelEditBtn,
        settingsModal, themeToggleButton, accentColorPicker, textSizeSlider, textSizeValue, maxItemsInput,
        resetSettingsBtn, exportBtn, importBtn, importFileInput, copyHelpBtn, closeSettingsBtn,
        exportStatus, importStatus, copyStatus,
        extendedSearchModal, filterTagsContainer, filterTypeCheckboxes, resetFiltersBtn, applyFiltersBtn;

    // --- D&D State --- (remains the same)
    let draggedItemElement = null;
    let dropIndicator = null;
    let scrollInterval = null;
    const SCROLL_SPEED = 10;
    const SCROLL_ZONE = 60;

    // --- App State --- (remains the same)
    const DEFAULT_THEME = 'dark';
    const DEFAULT_ACCENT_COLOR_DARK = '#4a90e2';
    const DEFAULT_ACCENT_COLOR_LIGHT = '#007bff';
    const DEFAULT_TEXT_SIZE = 16;
    const DEFAULT_MAX_ITEMS = 10;
    let watchListsData = { serien: [], filme: [] };
    let activeTabId = 'serien';
    let lastActiveTabBeforeSearch = 'serien';
    let currentSearchTerm = '';
    let activeFilters = { type: ['serien', 'filme'], tags: [] };
    let currentTheme = DEFAULT_THEME;
    let userAccentColorLight = null;
    let userAccentColorDark = null;
    let currentAppliedAccentColor = DEFAULT_ACCENT_COLOR_DARK;
    let currentTextSize = DEFAULT_TEXT_SIZE;
    let currentMaxItems = DEFAULT_MAX_ITEMS;
    const LS_PREFIX = 'watchlistApp_v12_'; // Keep version
    const LS_KEYS = { DATA: `${LS_PREFIX}data`, ACTIVE_TAB: `${LS_PREFIX}activeTab`, THEME: `${LS_PREFIX}theme`, ACCENT_COLOR_LIGHT: `${LS_PREFIX}accentColorLight`, ACCENT_COLOR_DARK: `${LS_PREFIX}accentColorDark`, TEXT_SIZE: `${LS_PREFIX}textSize`, MAX_ITEMS: `${LS_PREFIX}maxItems`, };

    // --- Function to Assign Element References --- (remains the same)
    function assignElementVariables() { /* ... assignments ... */
        appContainer = document.getElementById('app-container');
        settingsCog = document.getElementById('settings-cog');
        searchInput = document.getElementById('search-input'); // Assignment happens now
        openFilterBtn = document.getElementById('open-filter-btn');
        tabButtons = document.querySelectorAll('.tab-button');
        watchlists = document.querySelectorAll('.watchlist');
        openAddModalBtn = document.getElementById('open-add-modal-btn');
        addModal = document.getElementById('add-modal');
        addTitleInput = document.getElementById('add-title');
        addTypeRadios = document.querySelectorAll('input[name="add-item-type"]');
        addTagsInput = document.getElementById('add-tags-input');
        addTagsContainer = document.getElementById('add-tags-container');
        addDurationInput = document.getElementById('add-duration');
        addUpcomingCheckbox = document.getElementById('add-upcoming-checkbox');
        saveAddBtn = document.getElementById('save-add-btn');
        cancelAddBtn = document.getElementById('cancel-add-btn');
        editModal = document.getElementById('edit-modal');
        editItemIdInput = document.getElementById('edit-item-id');
        editItemTypeInput = document.getElementById('edit-item-type');
        editTitleInput = document.getElementById('edit-title');
        editTagsInput = document.getElementById('edit-tags-input');
        editTagsContainer = document.getElementById('edit-tags-container');
        editDurationDateInput = document.getElementById('edit-duration-date');
        editUpcomingCheckboxGroup = document.getElementById('edit-upcoming-checkbox-group');
        editUpcomingCheckbox = document.getElementById('edit-upcoming-checkbox');
        saveEditBtn = document.getElementById('save-edit-btn');
        cancelEditBtn = document.getElementById('cancel-edit-btn');
        settingsModal = document.getElementById('settings-modal');
        themeToggleButton = document.getElementById('theme-toggle-btn');
        accentColorPicker = document.getElementById('accent-color-picker');
        textSizeSlider = document.getElementById('text-size-slider');
        textSizeValue = document.getElementById('text-size-value');
        maxItemsInput = document.getElementById('max-items-input');
        resetSettingsBtn = document.getElementById('reset-settings-btn');
        exportBtn = document.getElementById('export-btn');
        importBtn = document.getElementById('import-btn');
        importFileInput = document.getElementById('import-file-input');
        copyHelpBtn = document.getElementById('copy-help-btn');
        closeSettingsBtn = document.getElementById('close-settings-btn');
        exportStatus = document.getElementById('export-status');
        importStatus = document.getElementById('import-status');
        copyStatus = document.getElementById('copy-status');
        extendedSearchModal = document.getElementById('extended-search-modal');
        filterTagsContainer = document.getElementById('filter-tags-container');
        filterTypeCheckboxes = document.querySelectorAll('input[name="filter-type"]');
        resetFiltersBtn = document.getElementById('reset-filters-btn');
        applyFiltersBtn = document.getElementById('apply-filters-btn');
        console.log("DOM Elements Assigned.");
     }

    // --- Data Persistence --- (remains the same)
    function saveData() { try { localStorage.setItem(LS_KEYS.DATA, JSON.stringify(watchListsData)); localStorage.setItem(LS_KEYS.ACTIVE_TAB, lastActiveTabBeforeSearch); localStorage.setItem(LS_KEYS.THEME, currentTheme); localStorage.setItem(LS_KEYS.ACCENT_COLOR_LIGHT, userAccentColorLight || ''); localStorage.setItem(LS_KEYS.ACCENT_COLOR_DARK, userAccentColorDark || ''); localStorage.setItem(LS_KEYS.TEXT_SIZE, currentTextSize.toString()); localStorage.setItem(LS_KEYS.MAX_ITEMS, currentMaxItems.toString()); } catch (e) { console.error("Error saving data:", e); } }
    function loadData() { const savedData = localStorage.getItem(LS_KEYS.DATA); watchListsData = { serien: [], filme: [] }; if (savedData) { try { const p = JSON.parse(savedData); if (p && Array.isArray(p.serien) && Array.isArray(p.filme)) { watchListsData.serien = p.serien.map(sanitizeItem('serien')); watchListsData.filme = p.filme.map(sanitizeItem('filme')); } else throw new Error("Invalid structure"); } catch (e) { console.error("Error parsing watchlist data:", e); } } const savedTab = localStorage.getItem(LS_KEYS.ACTIVE_TAB); activeTabId = ['serien', 'filme', 'upcoming'].includes(savedTab) ? savedTab : 'serien'; lastActiveTabBeforeSearch = activeTabId; const savedTheme = localStorage.getItem(LS_KEYS.THEME); currentTheme = savedTheme === 'light' ? 'light' : DEFAULT_THEME; userAccentColorLight = localStorage.getItem(LS_KEYS.ACCENT_COLOR_LIGHT) || null; userAccentColorDark = localStorage.getItem(LS_KEYS.ACCENT_COLOR_DARK) || null; if (currentTheme === 'dark') { currentAppliedAccentColor = userAccentColorDark || DEFAULT_ACCENT_COLOR_DARK; } else { currentAppliedAccentColor = userAccentColorLight || DEFAULT_ACCENT_COLOR_LIGHT; } const savedTextSize = localStorage.getItem(LS_KEYS.TEXT_SIZE); currentTextSize = parseInt(savedTextSize, 10) || DEFAULT_TEXT_SIZE; if (currentTextSize < 12 || currentTextSize > 20) currentTextSize = DEFAULT_TEXT_SIZE; const savedMaxItems = localStorage.getItem(LS_KEYS.MAX_ITEMS); currentMaxItems = parseInt(savedMaxItems, 10) || DEFAULT_MAX_ITEMS; if (currentMaxItems < 3 || currentMaxItems > 50) currentMaxItems = DEFAULT_MAX_ITEMS; currentSearchTerm = ''; if (searchInput) searchInput.value = ''; resetActiveFilters(); }
    function sanitizeItem(typeKey) { return item => ({ id: item.id || (Date.now().toString() + Math.random()), type: typeKey, title: typeof item.title === 'string' ? item.title : "Unbenannt", tags: Array.isArray(item.tags) ? item.tags.filter(t => typeof t === 'string') : [], duration: typeof item.duration === 'string' ? item.duration : "N/A", isUpcoming: typeof item.isUpcoming === 'boolean' ? item.isUpcoming : false }); }

    // --- Setup Event Listeners --- (remains the same)
    function addEventListeners() { /* ... listeners ... */
        if (tabButtons) tabButtons.forEach(button => { button.addEventListener('click', () => { if(searchInput) searchInput.value = ''; currentSearchTerm = ''; setActiveTab(button.getAttribute('data-tab')); }); });
        if (searchInput) searchInput.addEventListener('input', handleSearchInput);
        if (openFilterBtn) openFilterBtn.addEventListener('click', openExtendedSearchModal);
        if (openAddModalBtn) openAddModalBtn.addEventListener('click', openAddModal);
        if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddModal);
        if (saveAddBtn) saveAddBtn.addEventListener('click', saveAddItem);
        if (addTagsInput) addTagsInput.addEventListener('keypress', (e) => handleTagInputKeyPress(e, addTagsContainer));
        if (addModal) addModal.addEventListener('click', (e) => { if (e.target === addModal) closeAddModal(); });
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
        if (saveEditBtn) saveEditBtn.addEventListener('click', saveEditItem);
        if (editTagsInput) editTagsInput.addEventListener('keypress', (e) => handleTagInputKeyPress(e, editTagsContainer));
        if (editModal) editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });
        if (settingsCog) settingsCog.addEventListener('click', openSettingsModal);
        if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsModal);
        if (settingsModal) settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettingsModal(); });
        if (themeToggleButton) themeToggleButton.addEventListener('click', handleThemeToggle);
        if (accentColorPicker) accentColorPicker.addEventListener('input', handleAccentColorChange);
        if (textSizeSlider) textSizeSlider.addEventListener('input', handleTextSizeChange);
        if (maxItemsInput) maxItemsInput.addEventListener('input', handleMaxItemsChange);
        if (resetSettingsBtn) resetSettingsBtn.addEventListener('click', handleResetSettings);
        if (exportBtn) exportBtn.addEventListener('click', exportData);
        if (importBtn) importBtn.addEventListener('click', () => {if(importFileInput) importFileInput.click()});
        if (importFileInput) importFileInput.addEventListener('change', importData);
        if (copyHelpBtn) copyHelpBtn.addEventListener('click', copyHelpText);
        if (extendedSearchModal) extendedSearchModal.addEventListener('click', (e) => { if (e.target === extendedSearchModal) closeExtendedSearchModal(false); });
        if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAndCloseFilters);
        if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', applyAndCloseFilters);
        if (filterTypeCheckboxes) filterTypeCheckboxes.forEach(checkbox => { checkbox.addEventListener('change', handleFilterTypeChange); });
        addDragAndDropListeners();
        console.log("Event listeners setup complete.");
     }

    // --- Helper Function ---
    function adjustColor(hex, percent) {
        if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex; // Return original if invalid hex
        const num = parseInt(hex.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    // --- Settings Application ---
    function applyAllSettings() {
        // Apply theme FIRST to set body class
        applyThemeVisuals(currentTheme);
        // Determine and apply the correct accent color for the now-set theme
        applyAccentColorForCurrentTheme();
        // Apply other settings
        applyTextSize(currentTextSize);
        applyMaxItems(currentMaxItems);
        // Update controls to reflect the current state
        updateSettingsControls();
        console.log(`Applied settings: Theme=${currentTheme}, Accent=${currentAppliedAccentColor}, Size=${currentTextSize}, MaxItems=${currentMaxItems}`);
    }

    function applyThemeVisuals(theme) {
        bodyElement.classList.toggle('dark-mode', theme === 'dark');
        if(themeToggleButton){
            themeToggleButton.textContent = theme === 'dark' ? '☀️' : '🌙';
            themeToggleButton.title = theme === 'dark' ? "Light Mode wechseln" : "Dark Mode wechseln";
        }
        console.log(`Applied theme visual: ${theme}`);
    }

    function applyAccentColorForCurrentTheme() {
        let colorToApply;
        if (currentTheme === 'dark') {
            colorToApply = userAccentColorDark || DEFAULT_ACCENT_COLOR_DARK;
        } else {
            colorToApply = userAccentColorLight || DEFAULT_ACCENT_COLOR_LIGHT;
        }
        // Apply the chosen/default color
        setAccentCssVariables(colorToApply);
    }

    // This function NOW ONLY sets the CSS variables
    function setAccentCssVariables(color) {
        const hoverPercent = currentTheme === 'dark' ? 15 : -15; // Lighten dark, darken light slightly more
        const hoverColor = adjustColor(color, hoverPercent);

        // Apply variables to the :root (html element) - this is correct
        htmlElement.style.setProperty('--primary-color', color);
        htmlElement.style.setProperty('--primary-hover-color', hoverColor);

        currentAppliedAccentColor = color; // Update state tracking the *applied* color
        console.log(`Set CSS Vars: --primary-color=${color}, --primary-hover-color=${hoverColor}`);
    }

    function applyTextSize(size) { htmlElement.style.fontSize = `${size}px`; }
    function applyMaxItems(count) { const itemHeightEstimate = 65; const listPadding = 20; const maxHeight = (count * itemHeightEstimate) + listPadding; if(watchlists) watchlists.forEach(list => { list.style.maxHeight = `${maxHeight}px`; }); }
    function updateSettingsControls() { if(accentColorPicker) accentColorPicker.value = currentAppliedAccentColor; if(textSizeSlider) textSizeSlider.value = currentTextSize; if(textSizeValue) textSizeValue.textContent = `${currentTextSize}px`; if(maxItemsInput) maxItemsInput.value = currentMaxItems; }


    // --- Event Handlers for Settings ---
    function handleThemeToggle() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyThemeVisuals(currentTheme); // Apply class, button icon
        applyAccentColorForCurrentTheme(); // Apply correct accent for the NEW theme
        updateSettingsControls(); // Update picker to show the NEW theme's color
        saveData(); // Save all changes
    }

    function handleAccentColorChange(event) {
        const newColor = event.target.value;
        // Store user preference for the *current* theme
        if (currentTheme === 'dark') {
            userAccentColorDark = newColor;
        } else {
            userAccentColorLight = newColor;
        }
        // Apply the new color visually immediately
        setAccentCssVariables(newColor);
        // Save the updated user preferences
        saveData();
    }

    function handleTextSizeChange(event) { const newSize = parseInt(event.target.value, 10); currentTextSize = newSize; applyTextSize(newSize); if(textSizeValue) textSizeValue.textContent = `${newSize}px`; saveData(); }
    function handleMaxItemsChange(event) { let newCount = parseInt(event.target.value, 10); if (isNaN(newCount) || newCount < 3) { newCount = 3; event.target.value = newCount; } else if (newCount > 50) { newCount = 50; event.target.value = newCount; } currentMaxItems = newCount; applyMaxItems(newCount); saveData(); }
    function handleResetSettings() { if (confirm("Möchtest du die Darstellungseinstellungen (Theme, Akzentfarbe, Textgröße, Max. Einträge) wirklich auf die Standardwerte zurücksetzen?")) { currentTheme = DEFAULT_THEME; userAccentColorLight = null; userAccentColorDark = null; currentTextSize = DEFAULT_TEXT_SIZE; currentMaxItems = DEFAULT_MAX_ITEMS; localStorage.removeItem(LS_KEYS.THEME); localStorage.removeItem(LS_KEYS.ACCENT_COLOR_LIGHT); localStorage.removeItem(LS_KEYS.ACCENT_COLOR_DARK); localStorage.removeItem(LS_KEYS.TEXT_SIZE); localStorage.removeItem(LS_KEYS.MAX_ITEMS); applyAllSettings(); console.log("Settings reset to defaults."); } }


    // --- Search, Tab, Filtering Logic --- (Definitions - no changes)
    // ... (handleSearchInput, setActiveTab, updateTabButtonVisuals, applyFilters) ...
    function handleSearchInput() { if(!searchInput) return; const newSearchTerm = searchInput.value.toLowerCase(); if (newSearchTerm !== currentSearchTerm) { currentSearchTerm = newSearchTerm; if (currentSearchTerm && activeTabId !== 'upcoming' && activeTabId !== 'search') { setActiveTab('search', true); } else if (!currentSearchTerm && activeTabId === 'search') { setActiveTab(lastActiveTabBeforeSearch); } else { renderLists(); } } }
    function setActiveTab(tabId, isInternalCall = false) { activeTabId = tabId; if (activeTabId !== 'search') { lastActiveTabBeforeSearch = tabId; if (!isInternalCall) saveData(); } updateTabButtonVisuals(); if (!isInternalCall || activeTabId === 'search') renderLists(); }
    function updateTabButtonVisuals() { if(!tabButtons) return; tabButtons.forEach(btn => { const btnTabId = btn.getAttribute('data-tab'); if (activeTabId === 'search' && btnTabId !== 'upcoming') { btn.classList.remove('active'); btn.classList.add('inactive-search'); } else { btn.classList.toggle('active', btnTabId === activeTabId); btn.classList.remove('inactive-search'); } }); }
    function applyFilters(items) { let filtered = items; if (currentSearchTerm) filtered = filtered.filter(item => item.title.toLowerCase().includes(currentSearchTerm)); if (activeTabId !== 'upcoming') { if (activeFilters.type.length > 0 && activeFilters.type.length < 2) { filtered = filtered.filter(item => activeFilters.type.includes(item.type)); } if (activeFilters.tags.length > 0) { filtered = filtered.filter(item => Array.isArray(item.tags) && item.tags.some(itemTag => activeFilters.tags.includes(itemTag))); } } return filtered; }


    // --- Rendering Lists --- (Definitions - no changes)
    // ... (renderLists, createListItemElement, escapeHtml) ...
    function renderLists() { let baseItems = []; let targetListElementId = 'serien-list'; let showTypeIndicator = false; if (activeTabId === 'search') { baseItems = [...watchListsData.serien.filter(item => !item.isUpcoming), ...watchListsData.filme.filter(item => !item.isUpcoming)]; targetListElementId = 'serien-list'; showTypeIndicator = true; } else if (activeTabId === 'upcoming') { baseItems = [...watchListsData.serien.filter(item => item.isUpcoming), ...watchListsData.filme.filter(item => item.isUpcoming)]; targetListElementId = 'upcoming-list'; showTypeIndicator = true; } else if (activeTabId === 'serien') { baseItems = watchListsData.serien.filter(item => !item.isUpcoming); targetListElementId = 'serien-list'; } else if (activeTabId === 'filme') { baseItems = watchListsData.filme.filter(item => !item.isUpcoming); targetListElementId = 'filme-list'; } const itemsToDisplay = applyFilters(baseItems); if(!watchlists) return; watchlists.forEach(list => list.classList.remove('active')); const listElement = document.getElementById(targetListElementId); if (!listElement) { console.error(`List element #${targetListElementId} not found!`); return; } listElement.innerHTML = ''; if (itemsToDisplay.length === 0) { const li = document.createElement('li'); li.classList.add('no-entries'); li.textContent = (currentSearchTerm || activeFilters.tags.length > 0 || (activeFilters.type.length > 0 && activeFilters.type.length < 2)) ? 'Keine Einträge entsprechen den Filtern.' : 'Keine Einträge vorhanden.'; listElement.appendChild(li); } else { itemsToDisplay.forEach(item => { try { listElement.appendChild(createListItemElement(item, showTypeIndicator)); } catch (e) { console.error("Error creating list item:", item, e); } }); } listElement.classList.add('active'); addDragAndDropListeners(); updateTabButtonVisuals(); }
    function createListItemElement(item, showTypeIndicator = false) { if (!item || !item.id || !item.type || typeof item.title === 'undefined') { console.error("Rendering Error: Invalid item data:", item); const li = document.createElement('li'); li.textContent = "Fehlerhafter Eintrag"; li.style.color = 'red'; return li; } const li = document.createElement('li'); const isDraggable = activeTabId === 'serien' || activeTabId === 'filme'; li.setAttribute('draggable', isDraggable); li.dataset.id = item.id; li.dataset.type = item.type; const tagsText = (Array.isArray(item.tags) && item.tags.length > 0) ? item.tags.map(escapeHtml).join(', ') : 'Keine Angabe'; const durationText = item.duration ?? 'N/A'; const titleText = item.title ?? 'Unbekannter Titel'; let titleHtml = escapeHtml(titleText); if (showTypeIndicator) { const typeLabel = item.type === 'serien' ? 'Serie' : 'Film'; titleHtml += ` <span class="item-type-label">(${typeLabel})</span>`; } li.innerHTML = `<div class="item-details"><strong>${titleHtml}</strong><div class="item-meta"><span><span class="label">Tags:</span> ${tagsText}</span><span><span class="label">Dauer:</span> ${escapeHtml(durationText)}</span></div></div><div class="item-actions"><button class="icon-btn edit-icon-btn" title="Bearbeiten">✏️</button><button class="icon-btn delete-icon-btn" title="Löschen">🗑️</button></div>`; const editBtn = li.querySelector('.edit-icon-btn'); if (editBtn) { editBtn.addEventListener('click', (e) => { e.stopPropagation(); openEditModal(item); }); } const deleteBtn = li.querySelector('.delete-icon-btn'); if (deleteBtn) { deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteItem(item.id, item.type); }); } if (!isDraggable) li.style.cursor = 'default'; return li; }
    function escapeHtml(unsafe) { if (typeof unsafe !== 'string') return unsafe; return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }


    // --- Tag Handling --- (Definitions - no changes)
    // ... (handleTagInputKeyPress, addTag, getTagsFromTagsContainer, populateTagsContainer) ...
    function handleTagInputKeyPress(event, containerElement) { if (event.key === 'Enter') { event.preventDefault(); const inputElement = event.target; if(!inputElement) return; const tagText = inputElement.value.trim(); if (tagText && containerElement) { const existingTags = Array.from(containerElement.querySelectorAll('.tag span:first-child')).map(span => span.textContent.toLowerCase()); if (!existingTags.includes(tagText.toLowerCase())) { addTag(tagText, containerElement); } inputElement.value = ''; } } }
    function addTag(tagText, containerElement) { const tag = document.createElement('div'); tag.classList.add('tag'); tag.innerHTML = `<span>${escapeHtml(tagText)}</span><span class="remove-tag" title="Tag entfernen">×</span>`; tag.querySelector('.remove-tag').addEventListener('click', (e) => { e.stopPropagation(); tag.remove(); if (containerElement.childElementCount === 0) containerElement.classList.remove('visible'); }); containerElement.appendChild(tag); containerElement.classList.add('visible'); }
    function getTagsFromTagsContainer(containerElement) { if (!containerElement) { console.error("Tag container not found!"); return []; } return Array.from(containerElement.querySelectorAll('.tag span:first-child')).map(span => span.textContent); }
    function populateTagsContainer(tagsArray, containerElement) { if (!containerElement) { console.error("Tag container not found for populating!"); return; } containerElement.innerHTML = ''; (tagsArray || []).forEach(tagText => addTag(tagText, containerElement)); containerElement.classList.toggle('visible', containerElement.childElementCount > 0); }


    // --- Modal Management --- (Definitions - no changes)
    // ... (openModal, closeModal) ...
    function openModal(modalElement) { if (!modalElement) return; modalElement.style.display = 'flex'; bodyElement.classList.add('modal-open'); }
    function closeModal(modalElement) { if (!modalElement) return; modalElement.style.display = 'none'; bodyElement.classList.remove('modal-open'); clearScrollInterval(); }


    // --- Add Item / Delete Item / Edit Item --- (Definitions - no changes)
    // ... (openAddModal, closeAddModal, clearAddModal, saveAddItem) ...
    function openAddModal() { clearAddModal(); openModal(addModal); if(addTitleInput) addTitleInput.focus(); }
    function closeAddModal() { closeModal(addModal); }
    function clearAddModal() { if(addTitleInput) addTitleInput.value = ''; if(addTagsInput) addTagsInput.value = ''; if(addTagsContainer) { addTagsContainer.innerHTML = ''; addTagsContainer.classList.remove('visible'); } if(addDurationInput) addDurationInput.value = ''; if(addUpcomingCheckbox) addUpcomingCheckbox.checked = false; const defaultRadio = document.querySelector('input[name="add-item-type"][value="serien"]'); if(defaultRadio) defaultRadio.checked = true; }
    function saveAddItem() { const title = addTitleInput?.value.trim(); if (!title) { alert("Bitte gebe einen Titel an."); if(addTitleInput) addTitleInput.focus(); return; } const itemTypeRadio = document.querySelector('input[name="add-item-type"]:checked'); const itemType = itemTypeRadio ? itemTypeRadio.value : 'serien'; const tags = getTagsFromTagsContainer(addTagsContainer); const duration = addDurationInput ? addDurationInput.value.trim() || 'N/A' : 'N/A'; const isUpcoming = addUpcomingCheckbox ? addUpcomingCheckbox.checked : false; const newItem = { id: Date.now().toString() + Math.random(), type: itemType, title: title, tags: tags, duration: duration, isUpcoming: isUpcoming }; if (!watchListsData[itemType]) watchListsData[itemType] = []; watchListsData[itemType].push(newItem); if (activeTabId === 'search') { if(searchInput) searchInput.value = ''; currentSearchTerm = ''; setActiveTab(newItem.isUpcoming ? 'upcoming' : newItem.type); } else { renderLists(); } saveData(); closeAddModal(); }

    // ... (deleteItem) ...
    function deleteItem(itemId, itemType) { if (!itemId || !itemType || !watchListsData[itemType]) return; const list = watchListsData[itemType]; const itemIndex = list.findIndex(item => item?.id === itemId); if (itemIndex > -1) { if (confirm(`"${list[itemIndex].title}" wirklich löschen?`)) { list.splice(itemIndex, 1); renderLists(); saveData(); } } else { console.warn("Item to delete not found:", itemId, itemType); alert("Fehler: Eintrag zum Löschen nicht gefunden."); } }

    // ... (openEditModal, closeEditModal, saveEditItem) ...
    function openEditModal(item) { if (!item || !item.id || !item.type) return; if(editItemIdInput) editItemIdInput.value = item.id; if(editItemTypeInput) editItemTypeInput.value = item.type; if(editTitleInput) editTitleInput.value = item.title; populateTagsContainer(item.tags || [], editTagsContainer); if(editTagsInput) editTagsInput.value = ''; if(editDurationDateInput) editDurationDateInput.value = item.duration || ''; if(editUpcomingCheckboxGroup) editUpcomingCheckboxGroup.classList.toggle('hidden', activeTabId !== 'upcoming' && !item.isUpcoming); if(editUpcomingCheckbox) editUpcomingCheckbox.checked = item.isUpcoming; openModal(editModal); if(editTitleInput) { editTitleInput.focus(); editTitleInput.select(); } }
    function closeEditModal() { closeModal(editModal); }
    function saveEditItem() { const itemId = editItemIdInput?.value; const itemType = editItemTypeInput?.value; if (!itemId || !itemType || !watchListsData[itemType]) { alert("Fehler beim Speichern: Ungültige Daten."); return; } const list = watchListsData[itemType]; const itemIndex = list.findIndex(item => item?.id === itemId); if (itemIndex > -1) { const item = list[itemIndex]; item.title = editTitleInput ? editTitleInput.value.trim() || 'Unbenannt' : 'Unbenannt'; item.tags = getTagsFromTagsContainer(editTagsContainer); item.duration = editDurationDateInput ? editDurationDateInput.value.trim() || 'N/A' : 'N/A'; if (editUpcomingCheckboxGroup && !editUpcomingCheckboxGroup.classList.contains('hidden') && editUpcomingCheckbox) { const newUpcomingStatus = editUpcomingCheckbox.checked; if (newUpcomingStatus !== item.isUpcoming) item.isUpcoming = newUpcomingStatus; } if (activeTabId === 'search') { if(searchInput) searchInput.value = ''; currentSearchTerm = ''; setActiveTab(item.isUpcoming ? 'upcoming' : item.type); } else { renderLists(); } saveData(); closeEditModal(); } else { alert("Fehler: Eintrag zum Bearbeiten nicht gefunden."); closeEditModal(); } }


    // --- Extended Search Modal --- (Definitions - no changes)
    // ... (openExtendedSearchModal, closeExtendedSearchModal, populateFilterTags, resetActiveFilters, resetAndCloseFilters, applyAndCloseFilters, handleFilterTypeChange) ...
    function openExtendedSearchModal() { populateFilterTags(); if(filterTypeCheckboxes) filterTypeCheckboxes.forEach(cb => { cb.checked = activeFilters.type.includes(cb.value); }); if(filterTagsContainer) filterTagsContainer.querySelectorAll('.filter-tag-btn').forEach(btn => { btn.classList.toggle('active', activeFilters.tags.includes(btn.dataset.tag)); }); openModal(extendedSearchModal); }
    function closeExtendedSearchModal(shouldApplyFilters = false) { if (shouldApplyFilters) { activeFilters.type = []; if(filterTypeCheckboxes) filterTypeCheckboxes.forEach(cb => { if (cb.checked) activeFilters.type.push(cb.value); }); activeFilters.tags = []; if(filterTagsContainer) filterTagsContainer.querySelectorAll('.filter-tag-btn.active').forEach(btn => { activeFilters.tags.push(btn.dataset.tag); }); if (!currentSearchTerm && activeTabId === 'search') { setActiveTab(lastActiveTabBeforeSearch); } else if (currentSearchTerm || activeFilters.tags.length > 0 || (activeFilters.type.length > 0 && activeFilters.type.length < 2)) { if(activeTabId !== 'search' && activeTabId !== 'upcoming') { setActiveTab('search', true); } else { renderLists(); } } else { if (activeTabId === 'search') { setActiveTab(lastActiveTabBeforeSearch); } else { renderLists(); } } } closeModal(extendedSearchModal); }
    function populateFilterTags() { const allTags = new Set(); watchListsData.serien.forEach(item => item.tags?.forEach(tag => allTags.add(tag))); watchListsData.filme.forEach(item => item.tags?.forEach(tag => allTags.add(tag))); if(!filterTagsContainer) return; filterTagsContainer.innerHTML = ''; if (allTags.size === 0) { filterTagsContainer.innerHTML = '<span style="color: var(--text-muted-color);">Keine Tags zum Filtern vorhanden.</span>'; return; } const sortedTags = Array.from(allTags).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); sortedTags.forEach(tag => { const btn = document.createElement('button'); btn.classList.add('filter-tag-btn'); btn.textContent = tag; btn.dataset.tag = tag; btn.addEventListener('click', () => { btn.classList.toggle('active'); }); btn.classList.toggle('active', activeFilters.tags.includes(tag)); filterTagsContainer.appendChild(btn); }); }
    function resetActiveFilters() { activeFilters.type = ['serien', 'filme']; activeFilters.tags = []; }
    function resetAndCloseFilters() { resetActiveFilters(); if (currentSearchTerm) { renderLists(); } else { setActiveTab(lastActiveTabBeforeSearch); } closeModal(extendedSearchModal); }
    function applyAndCloseFilters() { closeExtendedSearchModal(true); }
    function handleFilterTypeChange(event) { const checkedCheckboxes = document.querySelectorAll('input[name="filter-type"]:checked'); if (checkedCheckboxes.length === 0 && event.target) { event.target.checked = true; } }


    // --- Drag and Drop --- (Definitions - no changes)
    // ... (clearScrollInterval, addDragAndDropListeners, handleDragStart, handleDragOver, handleDragLeave, handleDragEnd, handleDrop) ...
    function clearScrollInterval() { if (scrollInterval) { clearInterval(scrollInterval); scrollInterval = null; } }
    function addDragAndDropListeners() { const draggableItems = document.querySelectorAll('.watchlist:not(#upcoming-list) li[draggable="true"]'); draggableItems.forEach(item => { item.removeEventListener('dragstart', handleDragStart); item.removeEventListener('dragend', handleDragEnd); item.addEventListener('dragstart', handleDragStart); item.addEventListener('dragend', handleDragEnd); }); ['serien-list', 'filme-list'].forEach(listId => { const el = document.getElementById(listId); if(el){ el.removeEventListener('dragover', handleDragOver); el.removeEventListener('drop', handleDrop); el.removeEventListener('dragleave', handleDragLeave); el.addEventListener('dragover', handleDragOver); el.addEventListener('drop', handleDrop); el.addEventListener('dragleave', handleDragLeave); } }); }
    function handleDragStart(e) { const listItem = e.target.closest('li[draggable="true"]'); if (!listItem) { e.preventDefault(); return; } draggedItemElement = listItem; if (!draggedItemElement.dataset.id || !draggedItemElement.dataset.type) { e.preventDefault(); return; } e.dataTransfer.setData('text/plain', draggedItemElement.dataset.id); e.dataTransfer.setData('text/itemtype', draggedItemElement.dataset.type); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => { if (draggedItemElement) draggedItemElement.classList.add('dragging'); }, 0); if (!dropIndicator) { dropIndicator = document.createElement('div'); dropIndicator.classList.add('drop-indicator'); } clearScrollInterval(); }
    function handleDragOver(e) { e.preventDefault(); if (!draggedItemElement) return; e.dataTransfer.dropEffect = 'move'; const listElement = e.target.closest('.watchlist:not(#upcoming-list)'); if (!listElement) { clearScrollInterval(); return; } const listRect = listElement.getBoundingClientRect(); const mouseY = e.clientY; let scrollDirection = 0; if (mouseY < listRect.top + SCROLL_ZONE) scrollDirection = -1; else if (mouseY > listRect.bottom - SCROLL_ZONE) scrollDirection = 1; if (scrollDirection !== 0) { if (!scrollInterval) { scrollInterval = setInterval(() => { listElement.scrollTop += scrollDirection * SCROLL_SPEED; }, 30); } } else { clearScrollInterval(); } if (dropIndicator && dropIndicator.parentNode !== listElement) { listElement.appendChild(dropIndicator); } const targetLi = e.target.closest('li:not(.dragging):not(.no-entries)'); if (targetLi === draggedItemElement || (targetLi && targetLi.classList.contains('no-entries'))) { if(dropIndicator) dropIndicator.style.display = 'none'; return; } let indicatorY = -1; if (targetLi) { const rect = targetLi.getBoundingClientRect(); const midpoint = rect.top + rect.height / 2; if (e.clientY < midpoint) indicatorY = targetLi.offsetTop - 3; else indicatorY = targetLi.offsetTop + targetLi.offsetHeight + 2; } else { const listItems = listElement.querySelectorAll('li:not(.dragging):not(.no-entries)'); if (listItems.length === 0) { indicatorY = 5; } else { let inserted = false; for (const li of listItems) { const rect = li.getBoundingClientRect(); if (e.clientY < rect.top + rect.height / 2) { indicatorY = li.offsetTop - 3; inserted = true; break; } } if (!inserted) { const lastLi = listItems[listItems.length - 1]; indicatorY = lastLi.offsetTop + lastLi.offsetHeight + 2; } } } if (dropIndicator && indicatorY !== -1) { dropIndicator.style.top = `${indicatorY}px`; dropIndicator.style.display = 'block'; } else if (dropIndicator) { dropIndicator.style.display = 'none'; } }
    function handleDragLeave(e) { const listElement = e.target.closest('.watchlist'); if (listElement && !listElement.contains(e.relatedTarget)) { clearScrollInterval(); if (dropIndicator?.parentNode === listElement) { dropIndicator.style.display = 'none'; } } }
    function handleDragEnd() { if (draggedItemElement) draggedItemElement.classList.remove('dragging'); draggedItemElement = null; if (dropIndicator?.parentNode) dropIndicator.parentNode.removeChild(dropIndicator); clearScrollInterval(); }
    function handleDrop(e) { e.preventDefault(); clearScrollInterval(); if (!draggedItemElement) { handleDragEnd(); return; } const targetListElement = e.target.closest('.watchlist:not(#upcoming-list)'); if (!targetListElement) { handleDragEnd(); return; } const potentialTargetLi = e.target.closest('li'); if (potentialTargetLi === draggedItemElement) { handleDragEnd(); return; } const targetListType = targetListElement.id.replace('-list', ''); const draggedItemId = e.dataTransfer.getData('text/plain'); const originalListType = e.dataTransfer.getData('text/itemtype'); if (!draggedItemId || !originalListType || !watchListsData[originalListType] || !watchListsData[targetListType]) { console.error("D&D Error: Invalid data."); handleDragEnd(); return; } const originalList = watchListsData[originalListType]; const targetList = watchListsData[targetListType]; const itemIndex = originalList.findIndex(item => item?.id === draggedItemId); if (itemIndex === -1) { console.error("D&D Error: Item not found."); handleDragEnd(); return; } const [itemData] = originalList.splice(itemIndex, 1); if (originalListType !== targetListType) itemData.type = targetListType; let insertBeforeIndex = -1; if (dropIndicator && dropIndicator.parentNode === targetListElement && dropIndicator.style.display !== 'none') { const indicatorTop = dropIndicator.offsetTop; const nextElement = Array.from(targetListElement.children).find(child => child.offsetTop >= indicatorTop && !child.classList.contains('dragging') && !child.classList.contains('drop-indicator') && !child.classList.contains('no-entries')); if (nextElement?.dataset?.id) { const idx = targetList.findIndex(item => item?.id === nextElement.dataset.id); if (idx !== -1) insertBeforeIndex = idx; } else { insertBeforeIndex = targetList.length; } } if (insertBeforeIndex === -1) { const listItems = Array.from(targetListElement.querySelectorAll('li:not(.dragging):not(.no-entries)')); if (listItems.length === 0) { insertBeforeIndex = 0; } else { let foundPosition = false; for(let i = 0; i < listItems.length; i++) { const li = listItems[i]; const rect = li.getBoundingClientRect(); if (e.clientY < rect.top + rect.height / 2) { const idx = targetList.findIndex(item => item?.id === li.dataset.id); if (idx !== -1) insertBeforeIndex = idx; foundPosition = true; break; } } if (!foundPosition) { insertBeforeIndex = targetList.length; } } } insertBeforeIndex = Math.max(0, Math.min(targetList.length, insertBeforeIndex)); targetList.splice(insertBeforeIndex, 0, itemData); handleDragEnd(); renderLists(); saveData(); }


    // --- Settings Modal Data Logic --- (Definitions - no changes)
    // ... (openSettingsModal, closeSettingsModal, clearStatusMessages, showStatus, exportData, importData, aiHelpPrompt, copyHelpText) ...
    function openSettingsModal() { applyAllSettings(); openModal(settingsModal); clearStatusMessages(); }
    function closeSettingsModal() { closeModal(settingsModal); }
    function clearStatusMessages() { if(exportStatus) exportStatus.textContent = ''; if(exportStatus) exportStatus.className = ''; if(importStatus) importStatus.textContent = ''; if(importStatus) importStatus.className = ''; if(copyStatus) copyStatus.textContent = ''; if(copyStatus) copyStatus.className = ''; }
    function showStatus(element, message, type = 'info', duration = 4000) { if (!element) return; element.textContent = message; element.className = type; setTimeout(() => { if (element.textContent === message) { element.textContent = ''; element.className = ''; } }, duration); }
    function exportData() { try { const now = new Date(); const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19); const dataToExport = { serien: watchListsData.serien, filme: watchListsData.filme }; const dataStr = JSON.stringify(dataToExport, null, 2); const dataBlob = new Blob([dataStr], {type: "application/json;charset=utf-8"}); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a'); link.href = url; link.download = `watchlist_export_${dateStr}.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); showStatus(exportStatus, "Export erfolgreich!", 'success'); } catch (error) { console.error("Export failed:", error); showStatus(exportStatus, "Export fehlgeschlagen.", 'error'); } }
    function importData(event) { const file = event.target?.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const importedRaw = JSON.parse(e.target.result); if (typeof importedRaw === 'object' && importedRaw !== null && Array.isArray(importedRaw.serien) && Array.isArray(importedRaw.filme)) { if (confirm("Aktuelle Watchlist wirklich durch die importierte Datei ersetzen? Dies kann nicht rückgängig gemacht werden.")) { localStorage.setItem(LS_KEYS.DATA, JSON.stringify(importedRaw)); loadData(); applyAllSettings(); setActiveTab('serien'); renderLists(); showStatus(importStatus, "Import erfolgreich!", 'success'); closeSettingsModal(); } else { showStatus(importStatus, "Import abgebrochen.", 'info'); } } else { throw new Error("Ungültiges Dateiformat."); } } catch (error) { console.error("Import failed:", error); showStatus(importStatus, `Import fehlgeschlagen: ${error.message}`, 'error'); } finally { if(importFileInput) importFileInput.value = null; } }; reader.onerror = () => { showStatus(importStatus, "Fehler beim Lesen der Datei.", 'error'); if(importFileInput) importFileInput.value = null; }; reader.readAsText(file); }
    const aiHelpPrompt = 
    `
    Bitte formatiere die folgende Liste von Filmen und Serien in das JSON-Format für meine Watchlist-Anwendung. Das JSON-Hauptobjekt muss zwei Schlüssel enthalten: "serien" und "filme". Beide Schlüssel sollten ein Array von Objekten als Wert haben.
Jedes Objekt innerhalb der Arrays repräsentiert einen Film oder eine Serie und sollte die folgenden Schlüssel haben:
"id": Ein eindeutiger String (kannst du generieren, z.B. mit Zeitstempel + Zufallszahl).
"type": Ein String, entweder "serien" oder "filme", je nachdem, in welchem Array es sich befindet.
"title": Der Titel des Films oder der Serie (String).
"tags": Ein Array von Strings, das die Tags (früher Tags) auflistet (z.B. ["Action", "Sci-Fi"]). Wenn keine Tags angegeben sind, verwende ein leeres Array [].
"duration": Ein String, der die Dauer beschreibt (z.B. "148 min", "3 Staffeln", "N/A"). Wenn keine Dauer angegeben ist, verwende "N/A".
"isUpcoming": Ein boolescher Wert (true oder false). Setze ihn standardmäßig auf false, es sei denn, die Liste deutet darauf hin, dass er "upcoming" ist.
Hier ist die Liste, die du formatieren sollst:
[SIEHE ANGEHÄNGTE Watchlist]
Nutze von der Watchlist nur den Tab Serien, Upcoming und Filme ignoriere die anderen
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
    function copyHelpText() { if (!navigator.clipboard) { showStatus(copyStatus, "Clipboard API nicht verfügbar.", 'error'); return; } const promptToCopy = aiHelpPrompt.trim(); navigator.clipboard.writeText(promptToCopy).then(() => { showStatus(copyStatus, "AI Prompt kopiert!", 'success'); }).catch(err => { console.error('Kopieren fehlgeschlagen:', err); showStatus(copyStatus, "Kopieren fehlgeschlagen.", 'error'); }); }


    // --- Initial Load ---
    try {
        assignElementVariables(); // Assign element references first
        loadData();               // Load state data
        applyAllSettings();       // Apply visual styles based on loaded state
        setActiveTab(activeTabId, true); // Set the active tab
        addEventListeners();        // Add listeners to elements
        renderLists();            // Perform the initial render

        console.log("Watchlist App Initialized Successfully (V1.4 Fix 4)");
    } catch (error) {
        console.error("Error during app initialization:", error);
        bodyElement.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Ein Fehler ist aufgetreten. Die Anwendung konnte nicht initialisiert werden. Bitte überprüfe die Konsole (F12) für Details.</div>';
    }

}); // End DOMContentLoaded wrapper