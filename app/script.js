// ============================================================================
// IMPORTANT: TP (Technical Points) REMOVAL NOTICE
// ============================================================================
// TP (Technical Points) has been completely removed from this database.
// DO NOT add any TP-related functionality, UI elements, or references.
// ============================================================================

let allSkills = [];
let filteredSkills = [];
let selectedSkillId = null;
let allStates = [];
let filteredStates = [];
let selectedStateId = null;
let allWeapons = [];
let filteredWeapons = [];
let selectedWeaponId = null;
let allArmors = [];
let filteredArmors = [];
let selectedArmorId = null;
let allEnemies = [];
let filteredEnemies = [];
let selectedEnemyId = null;
let allItems = [];
let filteredItems = [];
let selectedItemId = null;
let allElements = [];
let filteredElements = [];
let selectedElementId = null;
let currentGame = null;
let currentSection = null;

// Navigation history for cross-references
// NOTE: We now rely entirely on browser history API instead of a custom stack
// This ensures consistency between cross-reference navigation and regular navigation

// Browser History API integration
// Flag to prevent recursive history updates
let isRestoringState = false;

// Build a navigation state object
function buildNavigationState() {
    // Safely check if elements exist
    const sectionsViewEl = document.getElementById('sections-view');
    const searchInputEl = document.getElementById('search-input');
    const resultsListEl = document.getElementById('results-list');
    const detailPanelEl = document.getElementById('detail-panel');
    
    return {
        view: currentSection || (sectionsViewEl && sectionsViewEl.classList.contains('hidden') ? 'games' : 'sections'),
        game: currentGame,
        selectedId: getCurrentSelectedId(),
        searchQuery: searchInputEl ? searchInputEl.value : null,
        resultsListScrollTop: resultsListEl ? resultsListEl.scrollTop : 0,
        detailPanelScrollTop: detailPanelEl ? detailPanelEl.scrollTop : 0
    };
}

// Build a URL from navigation state
// Uses hash-based URLs for GitHub Pages compatibility
function buildURL(state) {
    if (!state) state = buildNavigationState();
    
    if (state.view === 'games') {
        return '#/';
    } else if (state.view === 'sections') {
        const game = state.game === 'bs2' ? 'bs2' : (state.game || 'bs2');
        return `#/${game}`;
    } else if (state.view && state.selectedId) {
        const section = state.view;
        const game = state.game === 'bs2' ? 'bs2' : (state.game || 'bs2');
        return `#/${game}/${section}/${state.selectedId}`;
    } else if (state.view) {
        const section = state.view;
        const game = state.game === 'bs2' ? 'bs2' : (state.game || 'bs2');
        return `#/${game}/${section}`;
    }
    return '#/';
}

// Check if state has changed compared to current history state
function hasStateChanged(newState) {
    const currentState = history.state;
    if (!currentState) return true;
    
    // Compare key properties that affect navigation
    // Note: We don't compare scroll positions because they can change without navigation
    // We only compare properties that represent actual navigation changes
    const viewChanged = currentState.view !== newState.view;
    const gameChanged = currentState.game !== newState.game;
    const selectedIdChanged = currentState.selectedId !== newState.selectedId;
    const searchQueryChanged = currentState.searchQuery !== newState.searchQuery;
    
    // If any key property changed, state has changed
    if (viewChanged || gameChanged || selectedIdChanged || searchQueryChanged) {
        return true;
    }
    
    // Even if all properties are the same, if we're navigating via cross-reference
    // we might want to create a new history entry to preserve the navigation path
    // But for now, we'll only create entries when something actually changes
    return false;
}

// Push state to browser history
function pushHistoryState(state, replace = false, force = false) {
    if (isRestoringState) {
        console.log('[pushHistoryState] Blocked - isRestoringState=true', { replace, force, state });
        return;
    }
    
    // If not replacing and not forcing, check if state actually changed to avoid duplicates
    if (!replace && !force && !hasStateChanged(state)) {
        console.log('[pushHistoryState] Skipped duplicate state', state);
        return; // Don't push duplicate states
    }
    
    const hash = buildURL(state);
    const title = getPageTitle(state);
    
    // For GitHub Pages compatibility, always use '/' as base path with hash for routing
    // This ensures GitHub Pages serves index.html for all routes
    const url = hash.startsWith('#') ? hash : `#${hash}`;
    
    if (replace) {
        history.replaceState(state, title, url);
    } else {
        history.pushState(state, title, url);
    }
    
    // Update page title
    document.title = title;
}

// Get page title from state
function getPageTitle(state) {
    if (!state) return 'Black Souls Database';
    
    // Format game name for display (bs2 -> BS2)
    const formatGameName = (game) => {
        if (game === 'bs2') return 'BS2';
        return game || 'Black Souls II';
    };
    
    if (state.view === 'games') {
        return 'Black Souls Database';
    } else if (state.view === 'sections') {
        return `${formatGameName(state.game)} - Sections`;
    } else if (state.view && state.selectedId) {
        // Properly handle plural section names
        let sectionName = state.view;
        if (sectionName.endsWith('s')) {
            sectionName = sectionName.slice(0, -1); // Remove 's' from plural
        }
        sectionName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        return `${formatGameName(state.game)} - ${sectionName} ${state.selectedId}`;
    } else if (state.view) {
        const sectionName = state.view.charAt(0).toUpperCase() + state.view.slice(1);
        return `${formatGameName(state.game)} - ${sectionName}`;
    }
    return 'Black Souls Database';
}

// Restore state from history
function restoreStateFromHistory(state, forceRestore = false) {
    if (!state) return;
    
    // Check if we're already on this state to avoid unnecessary restoration
    // But allow restoration if forceRestore is true (e.g., when replacing null state entries)
    if (!forceRestore) {
        const currentState = buildNavigationState();
        if (currentState.view === state.view && 
            currentState.selectedId === state.selectedId &&
            currentState.game === state.game &&
            currentState.searchQuery === state.searchQuery) {
            // Already on this state, no need to restore
            return;
        }
    }
    
    isRestoringState = true;
    
    try {
        const savedView = state.view;
        const savedGame = state.game;
        const savedSelectedId = state.selectedId;
        const savedSearchQuery = state.searchQuery;
        const savedResultsListScrollTop = state.resultsListScrollTop || 0;
        const savedDetailPanelScrollTop = state.detailPanelScrollTop || 0;
        
        // Update page title immediately
        const title = getPageTitle(state);
        document.title = title;
        
        // Track pending async operations to know when restoration is complete
        let pendingOperations = 0;
        const markOperationComplete = () => {
            pendingOperations--;
            if (pendingOperations === 0) {
                // All async operations complete, safe to reset flag
                isRestoringState = false;
            }
        };
        
        // Restore view
        if (savedView === 'games') {
            showGamesView();
            isRestoringState = false; // No async operations for games view
        } else if (savedView === 'sections') {
            showSectionsView(savedGame || 'bs2');
            isRestoringState = false; // No async operations for sections view
        } else if (savedView) {
            // Restore section
            showSection(savedView, true); // preserveSearch = true
            
            // Restore search query and trigger search
            if (savedSearchQuery && searchInput) {
                pendingOperations++;
                setTimeout(() => {
                    searchInput.value = savedSearchQuery;
                    // Trigger search with the query
                    if (savedView === 'skills') {
                        searchSkills(savedSearchQuery);
                        renderResults();
                    } else if (savedView === 'states') {
                        searchStates(savedSearchQuery);
                        renderStatesResults();
                    } else if (savedView === 'weapons') {
                        searchWeapons(savedSearchQuery);
                        renderWeaponsResults();
                    } else if (savedView === 'armors') {
                        searchArmors(savedSearchQuery);
                        renderArmorsResults();
                    } else if (savedView === 'items') {
                        searchItems(savedSearchQuery);
                        renderItemsResults();
                    } else if (savedView === 'enemies') {
                        searchEnemies(savedSearchQuery);
                        renderEnemiesResults();
                    } else if (savedView === 'elements') {
                        searchElements(savedSearchQuery);
                        renderElementsResults();
                    }
                    updateResultsCount(); // Update results count after search
                    markOperationComplete();
                }, 100);
            } else {
                // No search query, but still update results count
                pendingOperations++;
                setTimeout(() => {
                    updateResultsCount();
                    markOperationComplete();
                }, 100);
            }
            
            // Restore selection and scroll positions after a delay to ensure section is loaded
            if (savedSelectedId) {
                // Use a longer delay to ensure section is fully loaded
                pendingOperations++;
                setTimeout(() => {
                    // Restore selection based on view with retry logic
                    let selectionAttempts = 0;
                    const maxSelectionAttempts = 5;
                    const restoreSelection = () => {
                        selectionAttempts++;
                        let restored = false;
                        
                        // Restore selection based on view
                        if (savedView === 'skills') {
                            selectSkill(savedSelectedId);
                            restored = (getCurrentSelectedId() === savedSelectedId);
                        } else if (savedView === 'states') {
                            selectState(savedSelectedId);
                            restored = (getCurrentSelectedId() === savedSelectedId);
                        } else if (savedView === 'weapons') {
                            selectWeapon(savedSelectedId);
                            restored = (getCurrentSelectedId() === savedSelectedId);
                        } else if (savedView === 'armors') {
                            selectArmor(savedSelectedId);
                            restored = (getCurrentSelectedId() === savedSelectedId);
                        } else if (savedView === 'items') {
                            selectItem(savedSelectedId);
                            restored = (getCurrentSelectedId() === savedSelectedId);
                        } else if (savedView === 'enemies') {
                            selectEnemy(savedSelectedId);
                            restored = (getCurrentSelectedId() === savedSelectedId);
                        } else if (savedView === 'elements') {
                            selectElement(savedSelectedId);
                            restored = (getCurrentSelectedId() === savedSelectedId);
                        }
                        
                        // Retry if selection wasn't restored
                        if (!restored && selectionAttempts < maxSelectionAttempts) {
                            setTimeout(restoreSelection, 100);
                            return;
                        }
                        
                        // Restore scroll positions after selection is restored and content is loaded
                        // Use multiple attempts to ensure content is rendered
                        let scrollAttempts = 0;
                        const maxScrollAttempts = 5;
                        const restoreScrolls = () => {
                            scrollAttempts++;
                            if (resultsList) {
                                resultsList.scrollTop = savedResultsListScrollTop;
                            }
                            if (detailPanel) {
                                detailPanel.scrollTop = savedDetailPanelScrollTop;
                            }
                            // Retry if content might not be loaded yet
                            if (scrollAttempts < maxScrollAttempts && (!detailPanel || detailPanel.scrollHeight === 0)) {
                                setTimeout(restoreScrolls, 100);
                            } else {
                                // All scroll restoration attempts complete
                                markOperationComplete();
                            }
                        };
                        setTimeout(restoreScrolls, 100);
                    };
                    restoreSelection();
                }, 300); // Increased delay to ensure section is fully loaded
            } else {
                // Even if no selection, restore scroll positions
                pendingOperations++;
                setTimeout(() => {
                    if (resultsList) {
                        resultsList.scrollTop = savedResultsListScrollTop;
                    }
                    // Restore detail panel scroll with a longer delay to ensure content is rendered
                    pendingOperations++;
                    setTimeout(() => {
                        if (detailPanel) {
                            detailPanel.scrollTop = savedDetailPanelScrollTop;
                        }
                        markOperationComplete();
                    }, 100);
                    markOperationComplete();
                }, 200);
            }
            
            // If no async operations were scheduled, reset flag immediately
            if (pendingOperations === 0) {
                isRestoringState = false;
            }
        }
    } catch (error) {
        // On error, reset flag to prevent getting stuck
        isRestoringState = false;
        throw error;
    }
}

// Parse URL and return state
function parseURL() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // Handle hash-based URLs (fallback for GitHub Pages)
    if (hash && hash.startsWith('#/')) {
        const hashPath = hash.substring(2);
        const parts = hashPath.split('/').filter(p => p);
        
        if (parts.length === 0) {
            return { view: 'games' };
        } else if (parts.length === 1 && parts[0] === 'sections') {
            return { view: 'sections', game: 'bs2' };
        } else if (parts.length === 1 && parts[0] === 'bs2') {
            return { view: 'sections', game: 'bs2' };
        } else if (parts.length === 1) {
            return { view: parts[0], game: 'bs2' };
        } else if (parts.length === 2) {
            // Handle /bs2/section format
            if (parts[0] === 'bs2') {
                const section = parts[1];
                if (['skills', 'states', 'weapons', 'armors', 'items', 'enemies', 'elements'].includes(section)) {
                    return { view: section, game: 'bs2' };
                }
            }
            const section = parts[0];
            const id = parseInt(parts[1]);
            if (!isNaN(id)) {
                return { view: section, selectedId: id, game: 'bs2' };
            }
        } else if (parts.length === 3) {
            // Handle /bs2/section/id format
            if (parts[0] === 'bs2') {
                const section = parts[1];
                const id = parseInt(parts[2]);
                if (!isNaN(id) && ['skills', 'states', 'weapons', 'armors', 'items', 'enemies', 'elements'].includes(section)) {
                    return { view: section, selectedId: id, game: 'bs2' };
                }
            }
        }
    }
    
    // Handle path-based URLs
    const parts = path.split('/').filter(p => p);
    
    if (parts.length === 0) {
        return { view: 'games' };
    } else if (parts.length === 1 && parts[0] === 'sections') {
        return { view: 'sections', game: 'bs2' };
    } else if (parts.length === 1 && parts[0] === 'bs2') {
        return { view: 'sections', game: 'bs2' };
    } else if (parts.length === 1) {
        const section = parts[0];
        if (['skills', 'states', 'weapons', 'armors', 'items', 'enemies', 'elements'].includes(section)) {
            return { view: section, game: 'bs2' };
        }
    } else if (parts.length === 2) {
        // Handle /bs2/section format
        if (parts[0] === 'bs2') {
            const section = parts[1];
            if (['skills', 'states', 'weapons', 'armors', 'items', 'enemies', 'elements'].includes(section)) {
                return { view: section, game: 'bs2' };
            }
        }
        const section = parts[0];
        const id = parseInt(parts[1]);
        if (!isNaN(id) && ['skills', 'states', 'weapons', 'armors', 'items', 'enemies', 'elements'].includes(section)) {
            return { view: section, selectedId: id, game: 'bs2' };
        }
    } else if (parts.length === 3 && parts[0] === 'sections') {
        return { view: 'sections', game: parts[1] === 'bs2' ? 'bs2' : parts[1] };
    } else if (parts.length === 3) {
        const game = parts[0];
        const section = parts[1];
        const id = parseInt(parts[2]);
        if (!isNaN(id) && ['skills', 'states', 'weapons', 'armors', 'items', 'enemies', 'elements'].includes(section)) {
            return { view: section, selectedId: id, game: game === 'bs2' ? 'bs2' : game };
        }
    } else if (parts.length === 2 && parts[1] === 'sections') {
        return { view: 'sections', game: parts[0] === 'bs2' ? 'bs2' : parts[0] };
    }
    
    return { view: 'games' };
}

// Helper function to calculate icon sprite position
function getIconPosition(iconIndex, scale = 1) {
    if (!iconIndex || iconIndex === 0) return 'none';
    
    const cols = 16;
    const iconSize = 32; // Base icon size in sprite sheet
    
    const col = iconIndex % cols;
    const row = Math.floor(iconIndex / cols);
    
    const x = col * iconSize * scale;
    const y = row * iconSize * scale;
    
    return `-${x}px -${y}px`;
}

// Convert cross-reference markers to clickable links
// Format: [[TYPE:ID:NAME]] becomes a clickable link
// This function works on raw text (before HTML escaping)
function convertCrossReferences(text) {
    if (!text || typeof text !== 'string') return text;
    
    // Pattern: [[TYPE:ID:NAME]]
    const markerRegex = /\[\[(SKILL|STATE|WEAPON|ARMOR|ITEM|ENEMY|ELEMENT):(\d+):([^\]]+)\]\]/g;
    
    return text.replace(markerRegex, (match, type, id, name) => {
        const typeLower = type.toLowerCase();
        // Create a link with data attributes for navigation
        // The name is already in the text, so we escape it for HTML
        return `<a href="#" class="cross-reference" data-ref-type="${typeLower}" data-ref-id="${id}" data-ref-name="${escapeHtml(name)}" title="Click to view ${escapeHtml(name)}">${escapeHtml(name)}</a>`;
    });
}

// Convert cross-references and escape HTML in one step
// This ensures cross-references are converted before escaping
function convertCrossReferencesAndEscape(text) {
    if (!text || typeof text !== 'string') return text;
    
    // First convert cross-references (this returns HTML with <a> tags)
    let result = convertCrossReferences(text);
    
    // Now we need to escape the remaining text, but preserve the HTML tags we just created
    // Split by the cross-reference links, escape the parts between them
    const parts = result.split(/(<a[^>]*>.*?<\/a>)/g);
    return parts.map(part => {
        // If it's already an <a> tag, keep it as is
        if (part.startsWith('<a') && part.endsWith('</a>')) {
            return part;
        }
        // Otherwise escape HTML
        return escapeHtml(part);
    }).join('');
}

// Navigate to a cross-referenced object
function navigateToCrossReference(type, id) {
    // Determine target section first (before any state changes)
    let targetSection = null;
    if (type === 'skill') targetSection = 'skills';
    else if (type === 'state') targetSection = 'states';
    else if (type === 'weapon') targetSection = 'weapons';
    else if (type === 'armor') targetSection = 'armors';
    else if (type === 'item') targetSection = 'items';
    else if (type === 'enemy') targetSection = 'enemies';
    else if (type === 'element') targetSection = 'elements';
    
    // Always save current state to browser history before navigating via cross-reference
    // This ensures the navigation path is preserved for back/forward navigation
    // IMPORTANT: Build state BEFORE calling showSection, which changes currentSection
    if (!isRestoringState && targetSection && currentSection !== targetSection) {
        const currentState = buildNavigationState();
        // Only push if the state is different from the current history state
        // This prevents creating duplicate entries when navigating
        const historyState = history.state;
        if (!historyState || hasStateChanged(currentState)) {
            // Push before navigating to preserve navigation path
            // Don't use force=true here - let hasStateChanged prevent duplicates
            pushHistoryState(currentState, false, false);
        }
    }
    
    // Navigate to the appropriate section and select the item
    if (targetSection && currentSection !== targetSection) {
        // Navigating to a different section - showSection will clear search (expected)
        // Temporarily set isRestoringState to prevent showSection from pushing state
        // We already pushed the previous state above, and selectState will push the new state
        const wasRestoring = isRestoringState;
        isRestoringState = true; // Prevent showSection from pushing state
        showSection(targetSection);
        // Wait for section to load, then select and scroll
        // Keep isRestoringState true during selection to prevent duplicate pushes
        // We'll manually push the new state after selection
        setTimeout(() => {
            // Temporarily keep isRestoringState true to prevent selectX from pushing
            isRestoringState = true;
            let newState = null;
            if (targetSection === 'skills') {
                selectSkill(parseInt(id));
                newState = buildNavigationState();
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'states') {
                selectState(parseInt(id));
                newState = buildNavigationState();
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'weapons') {
                selectWeapon(parseInt(id));
                newState = buildNavigationState();
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'armors') {
                selectArmor(parseInt(id));
                newState = buildNavigationState();
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'items') {
                selectItem(parseInt(id));
                newState = buildNavigationState();
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'enemies') {
                selectEnemy(parseInt(id));
                newState = buildNavigationState();
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'elements') {
                selectElement(parseInt(id));
                newState = buildNavigationState();
                scrollToSelectedItem(targetSection, parseInt(id));
            }
            // Now restore isRestoringState and push the new state
            isRestoringState = wasRestoring;
            if (newState && !wasRestoring) {
                pushHistoryState(newState);
            }
        }, 200);
    } else {
        // Navigating within the same section - clear search bar when navigating via cross-reference
        // First, push current state to preserve navigation path
        const wasRestoring = isRestoringState;
        if (!isRestoringState) {
            const currentState = buildNavigationState();
            // Only push if state is different from current history state
            const historyState = history.state;
            if (!historyState || hasStateChanged(currentState)) {
                pushHistoryState(currentState, false, false);
            }
        }
        
        // Clear search input and reset filtered arrays
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Temporarily set isRestoringState to prevent selectX from pushing
        // We'll manually push the new state after selection
        isRestoringState = true;
        let newState = null;
        
        // Reset search for the current section
        if (targetSection === 'skills') {
            searchSkills('');
            renderResults();
            updateResultsCount();
            selectSkill(parseInt(id));
            newState = buildNavigationState();
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'states') {
            searchStates('');
            renderStatesResults();
            updateResultsCount();
            selectState(parseInt(id));
            newState = buildNavigationState();
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'weapons') {
            searchWeapons('');
            renderWeaponsResults();
            updateResultsCount();
            selectWeapon(parseInt(id));
            newState = buildNavigationState();
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'armors') {
            searchArmors('');
            renderArmorsResults();
            updateResultsCount();
            selectArmor(parseInt(id));
            newState = buildNavigationState();
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'items') {
            searchItems('');
            renderItemsResults();
            updateResultsCount();
            selectItem(parseInt(id));
            newState = buildNavigationState();
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'enemies') {
            searchEnemies('');
            renderEnemiesResults();
            updateResultsCount();
            selectEnemy(parseInt(id));
            newState = buildNavigationState();
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'elements') {
            searchElements('');
            renderElementsResults();
            updateResultsCount();
            selectElement(parseInt(id));
            newState = buildNavigationState();
            scrollToSelectedItem(targetSection, parseInt(id));
        }
        
        // Restore isRestoringState and push the new state
        isRestoringState = wasRestoring;
        if (newState && !wasRestoring) {
            pushHistoryState(newState);
        }
    }
}

// Get currently selected ID based on current section
function getCurrentSelectedId() {
    if (currentSection === 'skills') return selectedSkillId;
    if (currentSection === 'states') return selectedStateId;
    if (currentSection === 'weapons') return selectedWeaponId;
    if (currentSection === 'armors') return selectedArmorId;
    if (currentSection === 'items') return selectedItemId;
    if (currentSection === 'enemies') return selectedEnemyId;
    if (currentSection === 'elements') return selectedElementId;
    return null;
}

// Scroll the results list to show the selected item
function scrollToSelectedItem(section, itemId) {
    if (!resultsList || !itemId) return;
    
    let selector = null;
    if (section === 'skills') selector = `.skill-card[data-skill-id="${itemId}"]`;
    else if (section === 'states') selector = `.skill-card[data-state-id="${itemId}"]`;
    else if (section === 'weapons') selector = `.skill-card[data-weapon-id="${itemId}"]`;
    else if (section === 'armors') selector = `.skill-card[data-armor-id="${itemId}"]`;
    else if (section === 'items') selector = `.skill-card[data-item-id="${itemId}"]`;
    else if (section === 'enemies') selector = `.skill-card[data-enemy-id="${itemId}"]`;
    else if (section === 'elements') selector = `.skill-card[data-element-id="${itemId}"]`;
    
    if (selector) {
        // Try multiple times in case the DOM hasn't fully rendered yet
        let attempts = 0;
        const maxAttempts = 10;
        const tryScroll = () => {
            const card = document.querySelector(selector);
            if (card) {
                // Use scrollIntoView with smooth behavior and block: 'center' to ensure item is visible
                card.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
                return true;
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryScroll, 50);
            }
            return false;
        };
        tryScroll();
    }
}

// Attach event listeners to cross-reference links
function attachCrossReferenceListeners() {
    document.querySelectorAll('.cross-reference').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const type = link.dataset.refType;
            const id = link.dataset.refId;
            const name = link.dataset.refName;
            navigateToCrossReference(type, id);
        });
    });
}

// Navigate back from cross-reference (restore previous view)
// NOTE: This function is now deprecated - we rely entirely on browser history
// It's kept as a fallback for edge cases, but should rarely be used
function navigateBackFromCrossReference() {
    // Just use browser history - it has all the state we need
    handleUpButton();
}


// DOM Elements
const gamesView = document.getElementById('games-view');
const sectionsView = document.getElementById('sections-view');
const searchSection = document.getElementById('search-section');
const mainContent = document.getElementById('main-content');
const upButton = document.getElementById('up-button');
const headerTitle = document.getElementById('header-title');
const headerSubtitle = document.getElementById('header-subtitle');

// Navigation function to go back to up level (same as clicking title)
function navigateToUpLevel() {
    const titleText = headerTitle.textContent;
    
    if (titleText === 'Black Souls Database') {
        // Already on games view, do nothing
        return;
    } else if (titleText === 'Black Souls II Database') {
        // On sections view, go back to games
        showGamesView();
    } else if (titleText.startsWith('Black Souls II Database - ')) {
        // On a section view (Skills, States, etc.), go back to sections
        showSectionsView('bs2');
    }
}

// Make header title clickable for navigation
headerTitle.classList.add('clickable-title');
headerTitle.addEventListener('click', navigateToUpLevel);

// Make up button navigate to up level
upButton.addEventListener('click', handleUpButton);
const searchInput = document.getElementById('search-input');
const resultsList = document.getElementById('results-list');
const resultsCount = document.getElementById('results-count');
const detailPanel = document.getElementById('detail-panel');
const detailContent = document.getElementById('detail-content');
const helpContent = document.getElementById('help-content');

// Dynamic Help Content
function updateHelpContent(view) {
    if (view === 'games') {
        helpContent.innerHTML = `
            <section class="help-section">
                <p class="help-note"><em>Note: This help content adapts to show information relevant to your current location in the database.</em></p>
            </section>
            
            <section class="help-section">
                <h3>Welcome to Black Souls Database</h3>
                <p>This database provides comprehensive information about the Black Souls game series.</p>
            </section>
            
            <section class="help-section">
                <h3>Getting Started</h3>
                <p>Select a game card to explore its database:</p>
                <ul>
                    <li><strong>Black Souls II:</strong> Complete database of skills, abilities, items, and game mechanics</li>
                </ul>
                <p>More games may be added in future updates.</p>
            </section>
            
            <section class="help-section">
                <h3>What's Inside</h3>
                <p>Each game database contains organized sections with detailed information:</p>
                <ul>
                    <li>Searchable and filterable content</li>
                    <li>Original game icons and graphics</li>
                    <li>Translated Japanese text</li>
                    <li>Technical formulas and calculations</li>
                    <li>Complete statistics and attributes</li>
                </ul>
            </section>
        `;
    } else if (view === 'sections') {
        helpContent.innerHTML = `
            <section class="help-section">
                <p class="help-note"><em>Note: This help content adapts to show information relevant to your current location in the database.</em></p>
            </section>
            
            <section class="help-section">
                <h3>Database Sections</h3>
                <p>Choose a section to explore different types of game content:</p>
            </section>
            
                    <section class="help-section">
                        <h3>Available Sections</h3>
                        <ul>
                            <li><strong>Skills:</strong> Browse all skills, abilities, spells, and special moves available in the game. Includes detailed statistics, damage formulas, effects, and usage conditions.</li>
                            <li><strong>States:</strong> Browse all status effects, buffs, debuffs, and ailments. Includes duration, removal conditions, stat modifications, and battle messages.</li>
                            <li><strong>Weapons:</strong> Browse all weapons and equipment. Includes stat bonuses, traits, special properties, and purchase prices.</li>
                            <li><strong>Armors:</strong> Browse all armor and defensive equipment. Includes stat bonuses, traits, armor types, and purchase prices.</li>
                            <li><strong>Enemies:</strong> Browse all enemies and monsters. Includes base stats, traits, actions (skills), drops, and rewards.</li>
                            <li><strong>Items:</strong> Browse all consumable items and equipment. Includes effects, usage conditions, damage information, and purchase prices.</li>
                            <li><strong>Elements:</strong> Browse all damage elements and their interactions. Includes skills and items using each element, element rate modifiers, and attack element additions from equipment and states.</li>
                        </ul>
                    </section>
            
            <section class="help-section">
                <h3>Navigation</h3>
                <p>Click on a section card to view its contents. Use the up button (↑) in the header to return to the game selection.</p>
            </section>
        `;
    } else if (view === 'skills') {
        helpContent.innerHTML = `
            <section class="help-section">
                <p class="help-note"><em>Note: This help content adapts to show information relevant to your current location in the database.</em></p>
            </section>
            
            <section class="help-section">
                <h3>Searching Skills</h3>
                <p>Use the search bar to filter skills in real-time. Search works across:</p>
                <ul>
                    <li>Skill names</li>
                    <li>Descriptions</li>
                    <li>Battle messages</li>
                    <li>Special notes and conditions</li>
                </ul>
                <p>Search is case-insensitive and updates instantly as you type.</p>
            </section>
            
            <section class="help-section">
                <h3>Viewing Skill Details</h3>
                <p>Click any skill card to view its complete information. Each skill displays:</p>
                <ul>
                    <li><strong>Description:</strong> What the skill does</li>
                    <li><strong>Basic Info:</strong> Cost, target, success rate, hit type, speed, usability</li>
                    <li><strong>Damage Info:</strong> Type, element, variance, critical hit capability</li>
                    <li><strong>Formulas:</strong> How damage and effects are calculated</li>
                    <li><strong>Effects:</strong> Status changes, stat modifications, special triggers</li>
                    <li><strong>Messages:</strong> Text displayed during battle</li>
                    <li><strong>Notes:</strong> Special mechanics, cooldowns, and conditions</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Understanding Statistics</h3>
                <ul>
                    <li><strong>Cost:</strong> MP required to use the skill</li>
                    <li><strong>Target:</strong> Who is affected (1 Enemy, All Allies, User, etc.)</li>
                    <li><strong>Success Rate:</strong> Base hit chance before evasion is calculated</li>
                    <li><strong>Hit Type:</strong> Physical Attack, Magical Attack, or Certain Hit</li>
                    <li><strong>Repeats:</strong> Number of times the skill hits per use</li>
                    <li><strong>Speed Modifier:</strong> Turn order adjustment (positive = faster, negative = slower)</li>
                    <li><strong>Usable:</strong> Where the skill can be used (Battle Screen, Menu, or Both)</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Damage Formulas</h3>
                <p>Damage formulas show how damage is calculated using character statistics:</p>
                <p class="help-note"><strong>Common Variables:</strong> ATK (Attack), DEF (Defense), MAT (Magic Attack), MDF (Magic Defense), AGI (Agility), LUK (Luck), HP/MP (current values), Max HP/Max MP (maximum values)</p>
                <ul>
                    <li><strong>Variance:</strong> Random damage range (e.g., ±20% means 80%-120% of calculated damage)</li>
                    <li><strong>Element:</strong> Physical, Fire, Ice, Lightning, or other elemental affinities</li>
                    <li><strong>Can Critical:</strong> Whether the skill can trigger critical hits for bonus damage</li>
                </ul>
                <p>Click "Show Original Formula" to view the raw game calculation code.</p>
            </section>
            
            <section class="help-section">
                <h3>Effects & Translations</h3>
                <p>Skills can inflict status effects, modify stats, trigger events, and more. Effects are shown in readable English by default.</p>
                <ul>
                    <li>Click "Show Original Data" on effects to see technical details</li>
                    <li>Click "Show Original (Japanese)" on notes to view the untranslated text</li>
                </ul>
                <p>All Japanese text has been automatically translated and converted from technical tags to readable descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Cross-References</h3>
                <p>All references to skills, states, weapons, armors, items, and enemies in skill descriptions and notes are clickable cross-references.</p>
                <ul>
                    <li>Click any reference to navigate to that item's detail page</li>
                    <li>Use the up button or browser history to return to the previous view</li>
                </ul>
                <p>This makes it easy to explore how skills interact with other game mechanics.</p>
            </section>
        `;
    } else if (view === 'states') {
        helpContent.innerHTML = `
            <section class="help-section">
                <p class="help-note"><em>Note: This help content adapts to show information relevant to your current location in the database.</em></p>
            </section>
            
            <section class="help-section">
                <h3>Searching States</h3>
                <p>Use the search bar to filter states in real-time. Search works across:</p>
                <ul>
                    <li>State names</li>
                    <li>Battle messages</li>
                    <li>Effect descriptions</li>
                    <li>Removal conditions</li>
                    <li>Special notes and conditions</li>
                </ul>
                <p>Search is case-insensitive and updates instantly as you type.</p>
            </section>
            
            <section class="help-section">
                <h3>Viewing State Details</h3>
                <p>Click any state card to view its complete information. Each state displays:</p>
                <ul>
                    <li><strong>Battle Messages:</strong> Text displayed when the state is inflicted, active, or removed</li>
                    <li><strong>Basic Info:</strong> Duration, priority, auto removal timing, and restrictions</li>
                    <li><strong>Removal Conditions:</strong> How the state can be removed</li>
                    <li><strong>Effects:</strong> Stat modifications, resistances, and special properties</li>
                    <li><strong>Notes:</strong> Special mechanics and conditions</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Understanding State Properties</h3>
                <ul>
                    <li><strong>Duration:</strong> How long the state lasts (in turns)</li>
                    <li><strong>Priority:</strong> Display order when multiple states are active (higher = shown first)</li>
                    <li><strong>Auto Removal:</strong> When the state automatically checks for removal (Action End, Turn End, or Never)</li>
                    <li><strong>Restriction:</strong> Action limitations while under this state (Cannot Attack, Cannot Move, etc.)</li>
                    <li><strong>Removal Conditions:</strong> Specific ways the state can be removed (damage, battle end, walking, etc.)</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>State Effects</h3>
                <p>States can modify statistics, provide resistances, change behavior, and more:</p>
                <ul>
                    <li><strong>Regeneration:</strong> HP or MP regeneration per turn</li>
                    <li><strong>Parameter Modifications:</strong> Increases or decreases to stats (Attack, Defense, Magic, etc.)</li>
                    <li><strong>Element Resistance:</strong> Reduced or increased damage from specific elements</li>
                    <li><strong>State Resistance:</strong> Protection against other status effects</li>
                    <li><strong>Damage Modifiers:</strong> Changes to physical or magical damage taken</li>
                    <li><strong>Action Modifiers:</strong> Changes to action speed, attack times, or guard effectiveness</li>
                </ul>
                <p>All effects are shown in readable English with clear descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Effects & Translations</h3>
                <p>States can have complex interactions with skills and other states. All information is shown in readable English by default.</p>
                <ul>
                    <li>Click "Show Original (Japanese)" on notes to view the untranslated text</li>
                </ul>
                <p>All Japanese text has been automatically translated and converted from technical tags to readable descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Cross-References</h3>
                <p>All references to skills, states, weapons, armors, items, and enemies in state descriptions and notes are clickable cross-references.</p>
                <ul>
                    <li>Click any reference to navigate to that item's detail page</li>
                    <li>Use the up button or browser history to return to the previous view</li>
                </ul>
                <p>This makes it easy to explore how states interact with other game mechanics.</p>
            </section>
        `;
    } else if (view === 'weapons') {
        helpContent.innerHTML = `
            <section class="help-section">
                <p class="help-note"><em>Note: This help content adapts to show information relevant to your current location in the database.</em></p>
            </section>
            
            <section class="help-section">
                <h3>Searching Weapons</h3>
                <p>Use the search bar to filter weapons in real-time. Search works across:</p>
                <ul>
                    <li>Weapon names</li>
                    <li>Descriptions</li>
                    <li>Trait descriptions</li>
                    <li>Special notes and conditions</li>
                </ul>
                <p>Search is case-insensitive and updates instantly as you type.</p>
            </section>
            
            <section class="help-section">
                <h3>Viewing Weapon Details</h3>
                <p>Click any weapon card to view its complete information. Each weapon displays:</p>
                <ul>
                    <li><strong>Description:</strong> What the weapon is and its lore</li>
                    <li><strong>Basic Info:</strong> Purchase price</li>
                    <li><strong>Parameter Bonuses:</strong> Stat bonuses provided when equipped (Max HP, Attack, Defense, etc.)</li>
                    <li><strong>Traits:</strong> Special properties and effects</li>
                    <li><strong>Notes:</strong> Special mechanics and conditions</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Understanding Weapon Properties</h3>
                <ul>
                    <li><strong>Price:</strong> Purchase cost in gold (0 = not purchasable)</li>
                    <li><strong>Parameter Bonuses:</strong> Direct stat increases provided when equipped</li>
                    <li><strong>Traits:</strong> Special effects, resistances, or modifications applied while equipped</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Weapon Traits</h3>
                <p>Weapons can modify statistics, provide resistances, change behavior, and more:</p>
                <ul>
                    <li><strong>Parameter Modifications:</strong> Increases or decreases to stats (Attack, Defense, Magic, etc.)</li>
                    <li><strong>Element Resistance:</strong> Reduced or increased damage from specific elements</li>
                    <li><strong>State Resistance:</strong> Protection against status effects</li>
                    <li><strong>Damage Modifiers:</strong> Changes to physical or magical damage dealt or taken</li>
                    <li><strong>Action Modifiers:</strong> Changes to action speed, attack times, or guard effectiveness</li>
                </ul>
                <p>All traits are shown in readable English with clear descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Effects & Translations</h3>
                <p>Weapons can have complex interactions with skills and states. All information is shown in readable English by default.</p>
                <ul>
                    <li>Click "Show Original Data" on traits to view the technical details</li>
                    <li>Click "Show Original (Japanese)" on notes to view the untranslated text</li>
                </ul>
                <p>All Japanese text has been automatically translated and converted from technical tags to readable descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Cross-References</h3>
                <p>All references to skills, states, weapons, armors, items, and enemies in weapon descriptions and notes are clickable cross-references.</p>
                <ul>
                    <li>Click any reference to navigate to that item's detail page</li>
                    <li>Use the up button or browser history to return to the previous view</li>
                </ul>
            </section>
        `;
    } else if (view === 'armors') {
        helpContent.innerHTML = `
            <section class="help-section">
                <p class="help-note"><em>Note: This help content adapts to show information relevant to your current location in the database.</em></p>
            </section>
            
            <section class="help-section">
                <h3>Searching Armors</h3>
                <p>Use the search bar to filter armors in real-time. Search works across:</p>
                <ul>
                    <li>Armor names</li>
                    <li>Descriptions</li>
                    <li>Trait descriptions</li>
                    <li>Special notes and conditions</li>
                </ul>
                <p>Search is case-insensitive and updates instantly as you type.</p>
            </section>
            
            <section class="help-section">
                <h3>Viewing Armor Details</h3>
                <p>Click any armor card to view its complete information. Each armor displays:</p>
                <ul>
                    <li><strong>Description:</strong> What the armor is and its lore</li>
                    <li><strong>Basic Info:</strong> Purchase price, armor type, and equip slot</li>
                    <li><strong>Parameter Bonuses:</strong> Stat bonuses provided when equipped (Max HP, Attack, Defense, etc.)</li>
                    <li><strong>Traits:</strong> Special properties and effects</li>
                    <li><strong>Notes:</strong> Special mechanics and conditions</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Understanding Armor Properties</h3>
                <ul>
                    <li><strong>Price:</strong> Purchase cost in gold (0 = not purchasable)</li>
                    <li><strong>Armor Type:</strong> General Armor, Magic Armor, Light Armor, Heavy Armor, Small Shield, Large Shield</li>
                    <li><strong>Equip Slot:</strong> Weapon, Shield, Head, Body, or Ring</li>
                    <li><strong>Parameter Bonuses:</strong> Direct stat increases provided when equipped</li>
                    <li><strong>Traits:</strong> Special effects, resistances, or modifications applied while equipped</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Armor Traits</h3>
                <p>Armors can modify statistics, provide resistances, change behavior, and more:</p>
                <ul>
                    <li><strong>Parameter Modifications:</strong> Increases or decreases to stats (Attack, Defense, Magic, etc.)</li>
                    <li><strong>Element Resistance:</strong> Reduced or increased damage from specific elements</li>
                    <li><strong>State Resistance:</strong> Protection against status effects</li>
                    <li><strong>Damage Modifiers:</strong> Changes to physical or magical damage dealt or taken</li>
                    <li><strong>Action Modifiers:</strong> Changes to action speed, attack times, or guard effectiveness</li>
                </ul>
                <p>All traits are shown in readable English with clear descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Effects & Translations</h3>
                <p>Armors can have complex interactions with skills and states. All information is shown in readable English by default.</p>
                <ul>
                    <li>Click "Show Original Data" on traits to view the technical details</li>
                    <li>Click "Show Original (Japanese)" on notes to view the untranslated text</li>
                </ul>
                <p>All Japanese text has been automatically translated and converted from technical tags to readable descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Cross-References</h3>
                <p>All references to skills, states, weapons, armors, items, and enemies in armor descriptions and notes are clickable cross-references.</p>
                <ul>
                    <li>Click any reference to navigate to that item's detail page</li>
                    <li>Use the up button or browser history to return to the previous view</li>
                </ul>
            </section>
        `;
    } else if (view === 'enemies') {
        helpContent.innerHTML = `
            <section class="help-section">
                <p class="help-note"><em>Note: This help content adapts to show information relevant to your current location in the database.</em></p>
            </section>
            
            <section class="help-section">
                <h3>Searching Enemies</h3>
                <p>Use the search bar to filter enemies in real-time. Search works across:</p>
                <ul>
                    <li>Enemy names</li>
                    <li>Trait descriptions</li>
                    <li>Skill names used in actions</li>
                    <li>Special notes and conditions</li>
                </ul>
                <p>Search is case-insensitive and updates instantly as you type.</p>
            </section>
            
            <section class="help-section">
                <h3>Viewing Enemy Details</h3>
                <p>Click any enemy card to view its complete information. Each enemy displays:</p>
                <ul>
                    <li><strong>Base Stats:</strong> HP, MP, Attack, Defense, Magic Attack, Magic Defense, Agility, Luck</li>
                    <li><strong>Traits:</strong> Special properties, resistances, and modifications</li>
                    <li><strong>Actions:</strong> Skills the enemy can use in battle</li>
                    <li><strong>Drops:</strong> Items, weapons, armors, or gold that can be obtained</li>
                    <li><strong>Rewards:</strong> Experience points and gold earned upon defeat</li>
                    <li><strong>Notes:</strong> Special mechanics and conditions</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Understanding Enemy Properties</h3>
                <ul>
                    <li><strong>Base Stats:</strong> The enemy's fundamental statistics in battle</li>
                    <li><strong>Traits:</strong> Special effects, resistances, or modifications that affect combat</li>
                    <li><strong>Actions:</strong> Skills the enemy can use, shown with their rating (priority)</li>
                    <li><strong>Drops:</strong> Items that can be obtained, with drop chance (1/denominator)</li>
                    <li><strong>Experience:</strong> EXP points awarded when the enemy is defeated</li>
                    <li><strong>Gold:</strong> Gold awarded when the enemy is defeated</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Enemy Traits</h3>
                <p>Enemies can have various traits that affect battle:</p>
                <ul>
                    <li><strong>Parameter Modifications:</strong> Changes to stats</li>
                    <li><strong>Element Resistance:</strong> Reduced or increased damage from specific elements</li>
                    <li><strong>State Resistance:</strong> Protection against status effects</li>
                    <li><strong>Damage Modifiers:</strong> Changes to physical or magical damage taken</li>
                    <li><strong>Action Modifiers:</strong> Changes to action speed or attack patterns</li>
                </ul>
                <p>All traits are shown in readable English with clear descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Effects & Translations</h3>
                <p>Enemy information is shown in readable English by default.</p>
                <ul>
                    <li>Click "Show Original Data" on traits to view the technical details</li>
                    <li>Click "Show Original (Japanese)" on notes to view the untranslated text</li>
                </ul>
                <p>All Japanese text has been automatically translated and converted from technical tags to readable descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Cross-References</h3>
                <p>All references to skills, states, weapons, armors, items, and enemies in enemy descriptions, actions, and drops are clickable cross-references.</p>
                <ul>
                    <li>Click any reference to navigate to that item's detail page</li>
                    <li>Use the up button or browser history to return to the previous view</li>
                </ul>
            </section>
        `;
    } else if (view === 'items') {
        helpContent.innerHTML = `
            <section class="help-section">
                <p class="help-note"><em>Note: This help content adapts to show information relevant to your current location in the database.</em></p>
            </section>
            
            <section class="help-section">
                <h3>Searching Items</h3>
                <p>Use the search bar to filter items in real-time. Search works across:</p>
                <ul>
                    <li>Item names</li>
                    <li>Descriptions</li>
                    <li>Effect descriptions</li>
                    <li>Special notes and conditions</li>
                </ul>
                <p>Search is case-insensitive and updates instantly as you type.</p>
            </section>
            
            <section class="help-section">
                <h3>Viewing Item Details</h3>
                <p>Click any item card to view its complete information. Each item displays:</p>
                <ul>
                    <li><strong>Description:</strong> What the item is and its lore</li>
                    <li><strong>Basic Info:</strong> Price, consumable status, usage location, scope, and success rate</li>
                    <li><strong>Effects:</strong> What the item does when used</li>
                    <li><strong>Damage Info:</strong> For offensive items, shows damage type, element, and formula</li>
                    <li><strong>Notes:</strong> Special mechanics and conditions</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Understanding Item Properties</h3>
                <ul>
                    <li><strong>Price:</strong> Purchase cost in gold (0 = not purchasable)</li>
                    <li><strong>Consumable:</strong> Whether the item is consumed on use</li>
                    <li><strong>Usage:</strong> Where the item can be used (Always, Battle Screen, Menu Screen, Never)</li>
                    <li><strong>Scope:</strong> Who is affected (1 Enemy, All Allies, User, etc.)</li>
                    <li><strong>Success Rate:</strong> Base chance of effect applying (100% = always succeeds)</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Item Effects</h3>
                <p>Items can have various effects when used:</p>
                <ul>
                    <li><strong>HP/MP Recovery:</strong> Restores health or mana</li>
                    <li><strong>State Application:</strong> Applies status effects to targets</li>
                    <li><strong>State Removal:</strong> Removes status effects from targets</li>
                    <li><strong>Common Events:</strong> Triggers special game events</li>
                    <li><strong>Damage:</strong> Some items deal damage to enemies</li>
                </ul>
                <p>All effects are shown in readable English with clear descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Effects & Translations</h3>
                <p>Item information is shown in readable English by default.</p>
                <ul>
                    <li>Click "Show Original (Japanese)" on notes to view the untranslated text</li>
                </ul>
                <p>All Japanese text has been automatically translated and converted from technical tags to readable descriptions.</p>
            </section>
            
            <section class="help-section">
                <h3>Cross-References</h3>
                <p>All references to skills, states, weapons, armors, items, and enemies in item descriptions and notes are clickable cross-references.</p>
                <ul>
                    <li>Click any reference to navigate to that item's detail page</li>
                    <li>Use the up button or browser history to return to the previous view</li>
                </ul>
            </section>
        `;
    } else if (view === 'elements') {
        helpContent.innerHTML = `
            <section class="help-section">
                <p class="help-note"><em>Note: This help content adapts to show information relevant to your current location in the database.</em></p>
            </section>
            
            <section class="help-section">
                <h3>Searching Elements</h3>
                <p>Use the search bar to filter elements in real-time. Search works across:</p>
                <ul>
                    <li>Element names (English and Japanese)</li>
                    <li>Skills using this element</li>
                    <li>Items using this element</li>
                    <li>Equipment that modifies element rates</li>
                    <li>Equipment that adds elements to attacks</li>
                </ul>
                <p>Search is case-insensitive and updates instantly as you type.</p>
            </section>
            
            <section class="help-section">
                <h3>Viewing Element Details</h3>
                <p>Click any element card to view its complete information. Each element displays:</p>
                <ul>
                    <li><strong>Element Information:</strong> Japanese name (if available), English name, and status</li>
                    <li><strong>Skills Using This Element:</strong> All skills that deal damage with this element</li>
                    <li><strong>Items Using This Element:</strong> All items that deal damage with this element</li>
                    <li><strong>Element Rate Modifiers:</strong> Equipment, states, and enemies that modify damage rates for this element</li>
                    <li><strong>Attack Element Additions:</strong> Equipment and states that add this element to attacks</li>
                </ul>
            </section>
            
            <section class="help-section">
                <h3>Understanding Element Interactions</h3>
                <ul>
                    <li><strong>Element Rate:</strong> Modifies damage taken from this element (100% = normal, 200% = double damage, 50% = half damage)</li>
                    <li><strong>Attack Element:</strong> Adds this element to all attacks (useful for dealing elemental damage)</li>
                    <li><strong>Skills/Items:</strong> Skills and items can deal damage with specific elements</li>
                </ul>
                <p>Elements are used to determine damage type and can be modified by equipment, states, and enemy traits.</p>
            </section>
            
            <section class="help-section">
                <h3>Cross-References</h3>
                <p>All references to skills, items, weapons, armors, states, and enemies are clickable cross-references.</p>
                <ul>
                    <li>Click any reference to navigate to that item's detail page</li>
                    <li>Use the up button or browser history to return to the element page</li>
                </ul>
                <p>This makes it easy to explore how elements interact with other game mechanics.</p>
            </section>
        `;
    }
}

// Navigation Hierarchy: Games -> Sections -> Details

// Show Games View (initial landing page)
function showGamesView() {
    gamesView.classList.remove('hidden');
    sectionsView.classList.add('hidden');
    searchSection.classList.add('hidden');
    mainContent.classList.add('hidden');
    upButton.classList.add('hidden');
    
    headerTitle.textContent = 'Black Souls Database';
    headerSubtitle.textContent = 'Select a game to explore';
    headerTitle.classList.remove('hidden');
    headerSubtitle.classList.add('hidden');
    
    currentGame = null;
    currentSection = null;
    
    updateHelpContent('games');
    
    // Update browser history
    // Use replaceState if state hasn't meaningfully changed to avoid duplicates
    if (!isRestoringState) {
        const newState = buildNavigationState();
        const currentState = history.state;
        // If state hasn't changed (same view, game, selectedId, searchQuery), use replaceState
        if (currentState && !hasStateChanged(newState)) {
            pushHistoryState(newState, true); // Use replaceState to avoid duplicates
        } else {
            pushHistoryState(newState); // Use pushState for actual navigation changes
        }
    }
}

// Show Sections View for a selected game
function showSectionsView(gameName) {
    gamesView.classList.add('hidden');
    sectionsView.classList.remove('hidden');
    searchSection.classList.add('hidden');
    mainContent.classList.add('hidden');
    upButton.classList.remove('hidden');
    
    currentGame = gameName;
    currentSection = null;
    
    if (gameName === 'bs2') {
        headerTitle.textContent = 'Black Souls II Database';
        headerSubtitle.textContent = 'Select a section to explore';
    }
    headerTitle.classList.add('hidden');
    headerSubtitle.classList.add('hidden');
    
    // Reset search and selection
    searchInput.value = '';
    selectedSkillId = null;
    const placeholder = document.querySelector('.detail-placeholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
    detailContent.style.display = 'none';
    
    updateHelpContent('sections');
    
    // Update browser history
    // Use replaceState if state hasn't meaningfully changed to avoid duplicates
    if (!isRestoringState) {
        const newState = buildNavigationState();
        const currentState = history.state;
        // If state hasn't changed (same view, game, selectedId, searchQuery), use replaceState
        if (currentState && !hasStateChanged(newState)) {
            pushHistoryState(newState, true); // Use replaceState to avoid duplicates
        } else {
            pushHistoryState(newState); // Use pushState for actual navigation changes
        }
    }
}

// Update placeholder icon based on section
function updatePlaceholderIcon(sectionName) {
    const placeholder = document.querySelector('.detail-placeholder');
    if (!placeholder) return;
    
    const iconSvg = placeholder.querySelector('svg');
    if (!iconSvg) return;
    
    const icons = {
        skills: '<path d="M32 4L36.5 24.5L56 20L44 32L56 44L36.5 39.5L32 60L27.5 39.5L8 44L20 32L8 20L27.5 24.5L32 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        states: '<rect x="8" y="8" width="48" height="48" rx="8" stroke="currentColor" stroke-width="2"/><path d="M32 20L28 28L20 28L26 34L24 42L32 38L40 42L38 34L44 28L36 28L32 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
        weapons: '<path d="M32 8L28 24L12 20L24 32L12 44L28 40L32 56L36 40L52 44L40 32L52 20L36 24L32 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M24 32L40 32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        armors: '<rect x="16" y="8" width="32" height="48" rx="4" stroke="currentColor" stroke-width="2"/><path d="M24 16L40 16M24 24L40 24M24 32L40 32M24 40L40 40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="48" r="4" stroke="currentColor" stroke-width="2"/>',
        enemies: '<circle cx="32" cy="20" r="8" stroke="currentColor" stroke-width="2"/><path d="M16 48C16 40 20 32 32 32C44 32 48 40 48 48" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M24 40L20 44M40 40L44 44" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        items: '<path d="M32 8L20 16L20 32L32 40L44 32L44 16L32 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M20 32L32 40L44 32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 40L32 56" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
        elements: '<circle cx="32" cy="32" r="20" stroke="currentColor" stroke-width="2"/><path d="M32 12L36 28L52 24L40 32L52 40L36 36L32 52L28 36L12 40L24 32L12 24L28 28L32 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
    };
    
    if (icons[sectionName]) {
        iconSvg.innerHTML = icons[sectionName];
    }
}

// Show Section Details (e.g., Skills, States)
// preserveSearch: if true, don't clear the search input
function showSection(sectionName, preserveSearch = false) {
    // Show up button when viewing a section
    upButton.classList.remove('hidden');
    
    if (sectionName === 'skills') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Skills';
        headerSubtitle.textContent = 'Search and explore all skills from Black Souls II';
        headerTitle.classList.add('hidden');
        headerSubtitle.classList.add('hidden');
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'flex' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
            searchSkills(''); // Reset filtered array to show all skills
        }
        selectedSkillId = null;
        
        // Clear detail panel
        if (detailContent) {
            detailContent.innerHTML = '';
            detailContent.style.display = 'none';
        }
        const placeholder = document.querySelector('.detail-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
            updatePlaceholderIcon('skills');
        }
        // Remove active state from all cards
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Load skills if not already loaded
        if (allSkills.length === 0) {
            loadSkills();
        } else {
            renderResults();
            updateResultsCount();
        }
        
        updateHelpContent('skills');
    } else if (sectionName === 'states') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - States';
        headerSubtitle.textContent = 'Search and explore all status effects from Black Souls II';
        headerTitle.classList.add('hidden');
        headerSubtitle.classList.add('hidden');
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'flex' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
            searchStates(''); // Reset filtered array to show all states
        }
        selectedStateId = null;
        
        // Clear detail panel
        if (detailContent) {
            detailContent.innerHTML = '';
            detailContent.style.display = 'none';
        }
        const placeholder = document.querySelector('.detail-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
            updatePlaceholderIcon('states');
        }
        // Remove active state from all cards
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Load states if not already loaded
        if (allStates.length === 0) {
            loadStates();
        } else {
            renderStatesResults();
            updateResultsCount();
        }
        
        updateHelpContent('states');
    } else if (sectionName === 'weapons') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Weapons';
        headerSubtitle.textContent = 'Search and explore all weapons from Black Souls II';
        headerTitle.classList.add('hidden');
        headerSubtitle.classList.add('hidden');
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'flex' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
            searchWeapons(''); // Reset filtered array to show all weapons
        }
        selectedWeaponId = null;
        
        // Clear detail panel
        if (detailContent) {
            detailContent.innerHTML = '';
            detailContent.style.display = 'none';
        }
        const placeholder = document.querySelector('.detail-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
            updatePlaceholderIcon('weapons');
        }
        // Remove active state from all cards
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Load weapons if not already loaded
        if (allWeapons.length === 0) {
            loadWeapons();
        } else {
            renderWeaponsResults();
            updateResultsCount();
        }
        
        updateHelpContent('weapons');
    } else if (sectionName === 'armors') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Armors';
        headerSubtitle.textContent = 'Search and explore all armor and defensive equipment from Black Souls II';
        headerTitle.classList.add('hidden');
        headerSubtitle.classList.add('hidden');
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'flex' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
            searchArmors(''); // Reset filtered array to show all armors
        }
        selectedArmorId = null;
        
        // Clear detail panel
        if (detailContent) {
            detailContent.innerHTML = '';
            detailContent.style.display = 'none';
        }
        const placeholder = document.querySelector('.detail-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
            updatePlaceholderIcon('armors');
        }
        // Remove active state from all cards
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Load armors if not already loaded
        if (allArmors.length === 0) {
            loadArmors();
        } else {
            renderArmorsResults();
            updateResultsCount();
        }
        
        updateHelpContent('armors');
    } else if (sectionName === 'enemies') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Enemies';
        headerSubtitle.textContent = 'Search and explore all enemies and monsters from Black Souls II';
        headerTitle.classList.add('hidden');
        headerSubtitle.classList.add('hidden');
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'flex' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
            searchEnemies(''); // Reset filtered array to show all enemies
        }
        selectedEnemyId = null;
        
        // Clear detail panel
        if (detailContent) {
            detailContent.innerHTML = '';
            detailContent.style.display = 'none';
        }
        const placeholder = document.querySelector('.detail-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
            updatePlaceholderIcon('enemies');
        }
        // Remove active state from all cards
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Load enemies if not already loaded
        if (allEnemies.length === 0) {
            loadEnemies();
        } else {
            renderEnemiesResults();
            updateResultsCount();
        }
        
        updateHelpContent('enemies');
    } else if (sectionName === 'items') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Items';
        headerSubtitle.textContent = 'Search and explore all consumable items and equipment from Black Souls II';
        headerTitle.classList.add('hidden');
        headerSubtitle.classList.add('hidden');
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'flex' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
            searchItems(''); // Reset filtered array to show all items
        }
        selectedItemId = null;
        
        // Clear detail panel
        if (detailContent) {
            detailContent.innerHTML = '';
            detailContent.style.display = 'none';
        }
        const placeholder = document.querySelector('.detail-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
            updatePlaceholderIcon('items');
        }
        // Remove active state from all cards
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Load items if not already loaded
        if (allItems.length === 0) {
            loadItems();
        } else {
            renderItemsResults();
            updateResultsCount();
        }
        
        updateHelpContent('items');
    } else if (sectionName === 'elements') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Elements';
        headerSubtitle.textContent = 'Search and explore all damage elements and their interactions from Black Souls II';
        headerTitle.classList.add('hidden');
        headerSubtitle.classList.add('hidden');
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'flex' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
            searchElements(''); // Reset filtered array to show all elements
        }
        selectedElementId = null;
        
        // Clear detail panel
        if (detailContent) {
            detailContent.innerHTML = '';
            detailContent.style.display = 'none';
        }
        const placeholder = document.querySelector('.detail-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
            updatePlaceholderIcon('elements');
        }
        // Remove active state from all cards
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Load elements if not already loaded
        if (allElements.length === 0) {
            loadElements();
        } else {
            renderElementsResults();
            updateResultsCount();
        }
        
        updateHelpContent('elements');
    }
    
    // Update browser history
    // Use replaceState if state hasn't meaningfully changed to avoid duplicates
    if (!isRestoringState) {
        const newState = buildNavigationState();
        const currentState = history.state;
        // If state hasn't changed (same view, game, selectedId, searchQuery), use replaceState
        if (currentState && !hasStateChanged(newState)) {
            pushHistoryState(newState, true); // Use replaceState to avoid duplicates
        } else {
            pushHistoryState(newState); // Use pushState for actual navigation changes
        }
    }
}

// Handle up button navigation
// Navigates up one layer at a time: Detail -> Section List -> Sections Menu -> Games View -> (nothing)
function handleUpButton() {
    // Get current state to determine what layer we're on
    const currentState = history.state;
    const urlState = parseURL();
    
    // Check if we're on a detail page (has selectedId)
    // Check URL state first as it's most reliable when navigating via URL
    const urlHasSelection = urlState && urlState.selectedId != null;
    const stateHasSelection = currentState && currentState.selectedId != null;
    const varHasSelection = 
        (currentSection === 'skills' && selectedSkillId != null) ||
        (currentSection === 'states' && selectedStateId != null) ||
        (currentSection === 'weapons' && selectedWeaponId != null) ||
        (currentSection === 'armors' && selectedArmorId != null) ||
        (currentSection === 'enemies' && selectedEnemyId != null) ||
        (currentSection === 'items' && selectedItemId != null) ||
        (currentSection === 'elements' && selectedElementId != null);
    
    const hasSelection = urlHasSelection || stateHasSelection || varHasSelection;
    
    // Special case: On Desktop, when on any object's detail page, go to Sections page instead of that object's section list
    const isDesktop = window.innerWidth > 1024;
    if (isDesktop && hasSelection) {
        // Navigate to Sections page
        // Get game from currentGame, urlState, or currentState, defaulting to 'bs2'
        const game = currentGame || (urlState && urlState.game) || (currentState && currentState.game) || 'bs2';
        showSectionsView(game);
        return;
    }
    
    if (hasSelection) {
        // Layer 1: Detail page -> Section List
        // Determine which section we're in
        const section = currentSection || 
                       (currentState ? currentState.view : null) || 
                       (urlState ? urlState.view : null);
        if (section && ['skills', 'states', 'weapons', 'armors', 'enemies', 'items', 'elements'].includes(section)) {
            // Navigate back to the section view, preserving search
            showSection(section, true);
            return;
        }
    }
    
    // Check if we're on a section list (has currentSection but no selectedId)
    if (currentSection && !hasSelection) {
        // Layer 2: Section List -> Sections Menu
        showSectionsView(currentGame);
        return;
    }
    
    // Check if we're on sections menu
    const sectionsViewEl = document.getElementById('sections-view');
    if (sectionsViewEl && !sectionsViewEl.classList.contains('hidden')) {
        // Layer 3: Sections Menu -> Games View
        showGamesView();
        return;
    }
    
    // Check if we're on games view
    const gamesViewEl = document.getElementById('games-view');
    if (gamesViewEl && !gamesViewEl.classList.contains('hidden')) {
        // Layer 4: Games View -> do nothing (already at top)
        return;
    }
    
    // Fallback: use browser history if we can't determine the layer
    if (history.length > 1) {
        history.back();
    }
}

// Load skills data (synchronous - data is already loaded from data.js)
function loadSkills() {
    try {
        allSkills = skillsData.skills;
        filteredSkills = allSkills;
        
        renderResults();
        updateResultsCount();
    } catch (error) {
        console.error('Error loading skills:', error);
        resultsList.innerHTML = '<div class="empty-state"><p>Error loading skills data</p></div>';
    }
}

// Helper function to extract all visible text from an object's detail section
function getDetailTextContent(obj, type) {
    const parts = [];
    
    // Always include name and ID
    if (type === 'element') {
        parts.push(obj.englishName || obj.japaneseName || '');
        parts.push(obj.japaneseName || '');
        parts.push(`#${obj.id}`);
    } else {
        parts.push(obj.name || '');
        parts.push(`#${obj.id}`);
    }
    
    if (type === 'skill') {
        if (obj.description) parts.push(obj.description);
        if (obj.message1) parts.push(obj.message1);
        if (obj.message2) parts.push(obj.message2);
        if (obj.mpCost > 0) parts.push(`${obj.mpCost} MP`);
        if (obj.scope && obj.scope.name) parts.push(obj.scope.name);
        if (obj.successRate !== undefined) parts.push(`${obj.successRate}%`);
        if (obj.hitType && obj.hitType.name) parts.push(obj.hitType.name);
        if (obj.repeats > 1) parts.push(`${obj.repeats}x`);
        if (obj.speed !== 0) parts.push(`${obj.speed > 0 ? '+' : ''}${obj.speed}`);
        if (obj.occasion && obj.occasion.name) parts.push(obj.occasion.name);
        if (obj.damage) {
            if (obj.damage.type && obj.damage.type.name) parts.push(obj.damage.type.name);
            if (obj.damage.element && obj.damage.element.name) parts.push(obj.damage.element.name);
            if (obj.damage.variance !== undefined) parts.push(`±${obj.damage.variance}%`);
            if (obj.damage.critical !== undefined) parts.push(obj.damage.critical ? 'Yes' : 'No');
            if (obj.damage.readableFormula) parts.push(obj.damage.readableFormula);
        }
        if (obj.effects) {
            obj.effects.forEach(effect => {
                if (effect.description) parts.push(effect.description);
                if (effect.codeName) parts.push(effect.codeName);
            });
        }
        if (obj.note && obj.note.english) parts.push(obj.note.english);
        if (obj.note && obj.note.japanese) parts.push(obj.note.japanese);
    } else if (type === 'state') {
        if (obj.message1) parts.push(obj.message1);
        if (obj.message2) parts.push(obj.message2);
        if (obj.message3) parts.push(obj.message3);
        if (obj.message4) parts.push(obj.message4);
        if (obj.duration) parts.push(obj.duration);
        if (obj.priority !== undefined) parts.push(obj.priority.toString());
        if (obj.autoRemovalTiming && obj.autoRemovalTiming.name) parts.push(obj.autoRemovalTiming.name);
        if (obj.chanceByDamage !== undefined && obj.chanceByDamage !== 100) parts.push(`${obj.chanceByDamage}%`);
        if (obj.restriction && obj.restriction.id > 0 && obj.restriction.name) parts.push(obj.restriction.name);
        if (obj.removalConditions) {
            obj.removalConditions.forEach(cond => parts.push(cond));
        }
        if (obj.traits) {
            obj.traits.forEach(trait => {
                if (trait.description) parts.push(trait.description);
                if (trait.codeName) parts.push(trait.codeName);
            });
        }
        if (obj.note && obj.note.english) parts.push(obj.note.english);
        if (obj.note && obj.note.japanese) parts.push(obj.note.japanese);
    } else if (type === 'weapon') {
        if (obj.description) parts.push(obj.description);
        if (obj.price > 0) parts.push(`${obj.price}G`);
        if (obj.params) {
            obj.params.forEach(param => {
                if (param.name) parts.push(param.name);
                if (param.value !== undefined) parts.push(`${param.value > 0 ? '+' : ''}${param.value}`);
            });
        }
        if (obj.traits) {
            obj.traits.forEach(trait => {
                if (trait.description) parts.push(trait.description);
                if (trait.codeName) parts.push(trait.codeName);
            });
        }
        if (obj.note && obj.note.english) parts.push(obj.note.english);
        if (obj.note && obj.note.japanese) parts.push(obj.note.japanese);
    } else if (type === 'armor') {
        if (obj.description) parts.push(obj.description);
        if (obj.price > 0) parts.push(`${obj.price}G`);
        if (obj.armorType && obj.armorType.name) parts.push(obj.armorType.name);
        if (obj.equipSlot && obj.equipSlot.name) parts.push(obj.equipSlot.name);
        if (obj.params) {
            obj.params.forEach(param => {
                if (param.name) parts.push(param.name);
                if (param.value !== undefined) parts.push(`${param.value > 0 ? '+' : ''}${param.value}`);
            });
        }
        if (obj.traits) {
            obj.traits.forEach(trait => {
                if (trait.description) parts.push(trait.description);
                if (trait.codeName) parts.push(trait.codeName);
            });
        }
        if (obj.note && obj.note.english) parts.push(obj.note.english);
        if (obj.note && obj.note.japanese) parts.push(obj.note.japanese);
    } else if (type === 'enemy') {
        if (obj.baseStats) {
            Object.entries(obj.baseStats).forEach(([name, value]) => {
                parts.push(name);
                parts.push(value.toString());
            });
        }
        if (obj.traits) {
            obj.traits.forEach(trait => {
                if (trait.description) parts.push(trait.description);
                if (trait.codeName) parts.push(trait.codeName);
            });
        }
        if (obj.actions) {
            obj.actions.forEach(action => {
                if (action.skillName) parts.push(action.skillName);
                if (action.rating !== undefined) parts.push(`Rating: ${action.rating}`);
            });
        }
        if (obj.dropItems) {
            obj.dropItems.forEach(drop => {
                if (drop.name) parts.push(drop.name);
                if (drop.kindName) parts.push(drop.kindName);
                if (drop.denominator) parts.push(`1/${drop.denominator}`);
            });
        }
        if (obj.exp > 0) parts.push(`Experience: ${obj.exp}`);
        if (obj.gold > 0) parts.push(`Gold: ${obj.gold}G`);
        if (obj.note && obj.note.english) parts.push(obj.note.english);
        if (obj.note && obj.note.japanese) parts.push(obj.note.japanese);
    } else if (type === 'item') {
        if (obj.description) parts.push(obj.description);
        if (obj.price > 0) parts.push(`${obj.price}G`);
        if (obj.consumable !== undefined) parts.push(obj.consumable ? 'Yes' : 'No');
        if (obj.occasionName) parts.push(obj.occasionName);
        if (obj.scopeName) parts.push(obj.scopeName);
        if (obj.successRate !== undefined && obj.successRate !== 100) parts.push(`${obj.successRate}%`);
        if (obj.effects) {
            obj.effects.forEach(effect => {
                if (effect.description) parts.push(effect.description);
            });
        }
        if (obj.damage) {
            if (obj.damage.type && obj.damage.type.name) parts.push(obj.damage.type.name);
            if (obj.damage.element && obj.damage.element.name) parts.push(obj.damage.element.name);
        }
        if (obj.note && obj.note.english) parts.push(obj.note.english);
        if (obj.note && obj.note.japanese) parts.push(obj.note.japanese);
    } else if (type === 'element') {
        // Elements have different structure
        if (obj.englishName) parts.push(obj.englishName);
        if (obj.japaneseName) parts.push(obj.japaneseName);
        if (obj.skillsUsingElement) {
            obj.skillsUsingElement.forEach(skill => {
                if (skill.name) parts.push(skill.name);
            });
        }
        if (obj.itemsUsingElement) {
            obj.itemsUsingElement.forEach(item => {
                if (item.name) parts.push(item.name);
            });
        }
        if (obj.elementRateModifiers) {
            obj.elementRateModifiers.forEach(mod => {
                if (mod.sourceName) parts.push(mod.sourceName);
                if (mod.description) parts.push(mod.description);
            });
        }
        if (obj.attackElementAdditions) {
            obj.attackElementAdditions.forEach(add => {
                if (add.sourceName) parts.push(add.sourceName);
                if (add.description) parts.push(add.description);
            });
        }
    }
    
    // Join all parts and remove HTML tags and cross-reference markers
    let text = parts.filter(p => p).join(' ');
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '');
    // Remove cross-reference markers but keep the name
    text = text.replace(/\[\[[^\]]+:(\d+):([^\]]+)\]\]/g, '$2');
    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text.toLowerCase();
}

// Fuzzy matching function - typo-tolerant search
function fuzzyMatch(query, text) {
    if (!query || !text) return false;
    
    const lowerQuery = query.toLowerCase().trim();
    const lowerText = text.toLowerCase();
    
    // First try exact substring match (fast path)
    if (lowerText.includes(lowerQuery)) return true;
    
    // For very short queries, use exact match only
    if (lowerQuery.length <= 2) return false;
    
    // Fuzzy matching: check if query characters appear in order in text
    // This handles typos like missing letters, extra letters, or swapped letters
    let queryIndex = 0;
    let textIndex = 0;
    let consecutiveMatches = 0;
    let maxConsecutiveMatches = 0;
    
    while (textIndex < lowerText.length && queryIndex < lowerQuery.length) {
        if (lowerText[textIndex] === lowerQuery[queryIndex]) {
            consecutiveMatches++;
            maxConsecutiveMatches = Math.max(maxConsecutiveMatches, consecutiveMatches);
            queryIndex++;
            textIndex++;
        } else {
            consecutiveMatches = 0;
            textIndex++;
        }
    }
    
    // If we matched all characters in order, it's a match
    if (queryIndex === lowerQuery.length) return true;
    
    // Also check for substring matches with 1-2 character tolerance
    // Split query into words and check if most words match
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 0);
    if (queryWords.length > 1) {
        let matchedWords = 0;
        for (const word of queryWords) {
            if (fuzzyMatch(word, lowerText)) {
                matchedWords++;
            }
        }
        // If most words match, consider it a match
        if (matchedWords >= Math.ceil(queryWords.length * 0.7)) return true;
    }
    
    // Check for Levenshtein-like distance (simplified)
    // If query is a significant portion of text and has high character overlap
    if (lowerQuery.length >= 3 && lowerText.length >= lowerQuery.length) {
        const minLength = Math.min(lowerQuery.length, lowerText.length);
        let matchingChars = 0;
        for (let i = 0; i < minLength; i++) {
            if (lowerQuery[i] === lowerText[i]) matchingChars++;
        }
        // If first few characters match well, it's likely a match
        if (matchingChars >= Math.ceil(minLength * 0.6)) {
            // Check if remaining characters can be found
            let foundChars = matchingChars;
            for (let i = matchingChars; i < lowerQuery.length; i++) {
                if (lowerText.includes(lowerQuery[i])) foundChars++;
            }
            if (foundChars >= Math.ceil(lowerQuery.length * 0.7)) return true;
        }
    }
    
    return false;
}

// Calculate relevance score for a search result
function calculateRelevance(obj, query, type) {
    if (!query || !query.trim()) return 0;
    
    const lowerQuery = query.toLowerCase().trim();
    const detailText = getDetailTextContent(obj, type);
    const lowerText = detailText.toLowerCase();
    const objName = type === 'element' 
        ? (obj.englishName || obj.japaneseName || '').toLowerCase()
        : (obj.name || '').toLowerCase();
    
    let score = 0;
    
    // Exact match in name (highest priority)
    if (objName === lowerQuery) {
        score += 10000;
    } else if (objName.startsWith(lowerQuery)) {
        score += 5000;
    } else if (objName.includes(lowerQuery)) {
        score += 3000;
    }
    
    // Word boundary matches in name (high priority)
    const nameWords = objName.split(/\s+/);
    for (const word of nameWords) {
        if (word === lowerQuery) {
            score += 2000;
        } else if (word.startsWith(lowerQuery)) {
            score += 1000;
        } else if (word.includes(lowerQuery)) {
            score += 500;
        }
    }
    
    // Exact match in full detail text
    if (lowerText === lowerQuery) {
        score += 2000;
    } else if (lowerText.startsWith(lowerQuery)) {
        score += 1000;
    } else if (lowerText.includes(lowerQuery)) {
        score += 500;
    }
    
    // Word boundary matches in detail text
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 0);
    const textWords = lowerText.split(/\s+/);
    let exactWordMatches = 0;
    let wordMatches = new Set();
    
    for (const queryWord of queryWords) {
        let foundExact = false;
        let foundStart = false;
        let foundPartial = false;
        
        for (const textWord of textWords) {
            if (textWord === queryWord && !wordMatches.has(textWord)) {
                exactWordMatches++;
                wordMatches.add(textWord);
                score += 200;
                foundExact = true;
                break;
            } else if (textWord.startsWith(queryWord) && !foundStart) {
                score += 100;
                foundStart = true;
            } else if (textWord.includes(queryWord) && !foundPartial && !foundStart) {
                score += 50;
                foundPartial = true;
            }
        }
    }
    
    // Bonus for matching multiple words
    if (queryWords.length > 1) {
        const matchRatio = exactWordMatches / queryWords.length;
        score += matchRatio * 300;
    }
    
    // Position bonus (earlier matches are better)
    const firstMatchIndex = lowerText.indexOf(lowerQuery);
    if (firstMatchIndex >= 0) {
        // Closer to the start = higher score
        const positionBonus = Math.max(0, 500 - firstMatchIndex);
        score += positionBonus;
    }
    
    // Character overlap bonus (for fuzzy matches)
    if (lowerQuery.length >= 3) {
        let matchingChars = 0;
        const minLength = Math.min(lowerQuery.length, lowerText.length);
        for (let i = 0; i < minLength; i++) {
            if (lowerQuery[i] === lowerText[i]) {
                matchingChars++;
            }
        }
        const overlapRatio = matchingChars / lowerQuery.length;
        if (overlapRatio >= 0.7) {
            score += overlapRatio * 200;
        }
    }
    
    // Count occurrences (more matches = more relevant)
    const occurrences = (lowerText.match(new RegExp(lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (occurrences > 1) {
        score += (occurrences - 1) * 100;
    }
    
    return score;
}

// Search and filter skills
function searchSkills(query) {
    if (!query.trim()) {
        filteredSkills = allSkills;
        return;
    }
    
    // Filter and calculate relevance
    const resultsWithScores = allSkills
        .map(skill => {
            const detailText = getDetailTextContent(skill, 'skill');
            if (fuzzyMatch(query, detailText)) {
                return {
                    skill: skill,
                    relevance: calculateRelevance(skill, query, 'skill')
                };
            }
            return null;
        })
        .filter(result => result !== null)
        .sort((a, b) => b.relevance - a.relevance); // Sort by relevance (highest first)
    
    filteredSkills = resultsWithScores.map(result => result.skill);
}

// Render results list
function renderResults() {
    if (filteredSkills.length === 0) {
        resultsList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M44 44L33.65 33.65" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>No skills found</p>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = filteredSkills.map(skill => {
        const mpCost = skill.mpCost > 0 ? `<span class="cost-badge cost-mp">MP ${skill.mpCost}</span>` : '';
        const iconPos = getIconPosition(skill.iconIndex);
        const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${skill.iconIndex}"` : '';
        
        return `
            <div class="skill-card ${selectedSkillId === skill.id ? 'active' : ''}" data-skill-id="${skill.id}">
                <div class="skill-card-header">
                    <div class="skill-icon" ${iconStyle}></div>
                    <div class="skill-card-title">${skill.name} <span class="detail-id">#${skill.id}</span></div>
                    <div class="skill-card-costs">
                        ${mpCost}
                    </div>
                </div>
                <div class="skill-card-description">${skill.description}</div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('click', () => {
            const skillId = parseInt(card.dataset.skillId);
            selectSkill(skillId);
        });
    });
}

// Select and display skill details
function selectSkill(skillId) {
    selectedSkillId = skillId;
    const skill = allSkills.find(s => s.id === skillId);
    
    if (!skill) return;
    
    // Update active state on cards
    document.querySelectorAll('.skill-card').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.skillId) === skillId);
    });
    
    // Show detail content, hide placeholder
    document.querySelector('.detail-placeholder').style.display = 'none';
    detailContent.style.display = 'block';
    
    // Reset scroll position
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    renderSkillDetail(skill);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'flex';
        document.querySelector('.detail-panel').classList.add('mobile-active');
        
        // Reset scroll position after panel is shown on mobile
        setTimeout(() => {
            if (detailPanel) {
                detailPanel.scrollTop = 0;
            }
            if (detailContent) {
                detailContent.scrollTop = 0;
            }
        }, 0);
    }
    
    // Update browser history
    // Use replaceState if state hasn't meaningfully changed to avoid duplicates
    if (!isRestoringState) {
        const newState = buildNavigationState();
        const currentState = history.state;
        // If state hasn't changed (same view, game, selectedId, searchQuery), use replaceState
        if (currentState && !hasStateChanged(newState)) {
            pushHistoryState(newState, true); // Use replaceState to avoid duplicates
        } else {
            pushHistoryState(newState); // Use pushState for actual navigation changes
        }
    }
}

// Render skill detail view
function renderSkillDetail(skill) {
    const iconPos = getIconPosition(skill.iconIndex, 1.5); // 48px = 32px * 1.5
    const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${skill.iconIndex}"` : '';
    
    // Find references
    const refs = findSkillReferences(skill.id);
    
    let html = `
        <div class="detail-header">
            <div class="detail-title-row">
                <div class="detail-icon" ${iconStyle}></div>
                <div class="detail-title">${escapeHtml(skill.name)} <span class="detail-id">#${skill.id}</span></div>
            </div>
            <div class="detail-description">${convertCrossReferencesAndEscape(skill.description)}</div>
        </div>
        
        ${renderBasicStats(skill)}
        ${renderDamageInfo(skill)}
        ${renderEffects(skill)}
        ${renderMessages(skill)}
        ${renderNotes(skill)}
    `;
    
    // Add references section at the bottom
    const hasAnyReferences = refs.itemsTeaching.length > 0 || 
                              refs.enemiesUsing.length > 0 || 
                              refs.referencedBy.skills.length > 0 ||
                              refs.referencedBy.items.length > 0 ||
                              refs.referencedBy.states.length > 0 ||
                              refs.referencedBy.weapons.length > 0 ||
                              refs.referencedBy.armors.length > 0 ||
                              refs.referencedBy.enemies.length > 0;
    
    if (hasAnyReferences) {
        html += `
            <div class="detail-section">
                <div class="section-title">References</div>
        `;
        
        // Show entities that reference this skill in their notes/descriptions
        // Use context-aware naming for better clarity
        if (refs.referencedBy.skills.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Skills That Cast This Skill (${refs.referencedBy.skills.length})</div>
                    <div class="effect-list">
                        ${refs.referencedBy.skills.map(skill => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(skill.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (refs.referencedBy.items.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Items That Reference This Skill (${refs.referencedBy.items.length})</div>
                    <div class="effect-list">
                        ${refs.referencedBy.items.map(item => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(item.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (refs.referencedBy.states.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">States That Reference This Skill (${refs.referencedBy.states.length})</div>
                    <div class="effect-list">
                        ${refs.referencedBy.states.map(state => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(state.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (refs.referencedBy.weapons.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Weapons That Reference This Skill (${refs.referencedBy.weapons.length})</div>
                    <div class="effect-list">
                        ${refs.referencedBy.weapons.map(weapon => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(weapon.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (refs.referencedBy.armors.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Armors That Reference This Skill (${refs.referencedBy.armors.length})</div>
                    <div class="effect-list">
                        ${refs.referencedBy.armors.map(armor => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(armor.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (refs.referencedBy.enemies.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Enemies That Reference This Skill (${refs.referencedBy.enemies.length})</div>
                    <div class="effect-list">
                        ${refs.referencedBy.enemies.map(enemy => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(enemy.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Show items that teach this skill (effect code 43: Learn Skill)
        if (refs.itemsTeaching.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Items Teaching This Skill (${refs.itemsTeaching.length})</div>
                    <div class="effect-list">
                        ${refs.itemsTeaching.map(item => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(item.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Show enemies that use this skill
        if (refs.enemiesUsing.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Enemies Using This Skill (${refs.enemiesUsing.length})</div>
                    <div class="effect-list">
                        ${refs.enemiesUsing.map(enemy => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(enemy.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
    }
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailPanel) {
            detailPanel.scrollTop = 0;
        }
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
    
    // Add toggle handler for Japanese text
    const toggleBtn = detailContent.querySelector('.note-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const noteText = detailContent.querySelector('.note-text');
            const currentLang = toggleBtn.dataset.lang || 'en';
            
            if (currentLang === 'en') {
                // Switching to Japanese - preserve line breaks but don't convert cross-refs (Japanese text)
                noteText.innerHTML = (skill.note.japanese || "(No original text)").replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show English';
                toggleBtn.dataset.lang = 'jp';
            } else {
                // Switching to English - convert cross-references and preserve line breaks
                const englishText = skill.note.english || "(No translation available)";
                const crossRefText = convertCrossReferencesAndEscape(englishText);
                noteText.innerHTML = crossRefText.replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Original (Japanese)';
                toggleBtn.dataset.lang = 'en';
                // Re-attach cross-reference listeners after updating HTML
                attachCrossReferenceListeners();
            }
        });
    }
    
    // Add toggle handlers for show original data
    const showOriginalToggles = detailContent.querySelectorAll('.show-original-toggle');
    showOriginalToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const toggleType = toggle.dataset.toggle;
            
            if (toggleType === 'formula') {
                const formulaDisplay = detailContent.querySelector('#formula-display');
                const isShowingOriginal = toggle.dataset.showing === 'original';
                
                if (isShowingOriginal) {
                    formulaDisplay.textContent = skill.damage.readableFormula;
                    toggle.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Show Original Formula
                    `;
                    toggle.dataset.showing = 'readable';
                } else {
                    formulaDisplay.textContent = skill.damage.formula;
                    toggle.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Show Readable Formula
                    `;
                    toggle.dataset.showing = 'original';
                }
            } else if (toggleType === 'effect') {
                const effectIndex = parseInt(toggle.dataset.effectIndex);
                // Use sorted effects array if available, otherwise use original
                const effectsArray = skill._sortedEffects || skill.effects;
                const effect = effectsArray[effectIndex];
                const effectItem = toggle.closest('.effect-item');
                
                let originalDataBox = effectItem.querySelector('.original-data-box');
                
                if (originalDataBox) {
                    // Remove the original data box
                    originalDataBox.remove();
                    toggle.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Show Original Data
                    `;
                } else {
                    // CRITICAL: Show ONLY original raw values from JSON file
                    // DO NOT show processed/transformed values (chance, stateName, percent, flat, turns, parameter)
                    // These processed values are for display purposes only, not original data
                    // Original data = exactly what's in the JSON: code, dataId, value1, value2
                    let originalData = `Code: ${effect.code}`;
                    
                    // Add ONLY raw values from original JSON file
                    if (effect.dataId !== undefined) originalData += `\nData ID: ${effect.dataId}`;
                    if (effect.value1 !== undefined) originalData += `\nValue 1: ${effect.value1}`;
                    if (effect.value2 !== undefined) originalData += `\nValue 2: ${effect.value2}`;
                    
                    // DO NOT add processed values here:
                    // - effect.chance (processed from value1)
                    // - effect.stateName (resolved from dataId)
                    // - effect.percent (processed from value1)
                    // - effect.flat (processed from value2)
                    // - effect.turns (processed from value1)
                    // - effect.parameter (resolved from dataId)
                    // These are NOT original data!
                    
                    originalDataBox = document.createElement('div');
                    originalDataBox.className = 'original-data-box';
                    originalDataBox.textContent = originalData;
                    
                    toggle.insertAdjacentElement('beforebegin', originalDataBox);
                    toggle.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Hide Original Data
                    `;
                }
            }
        });
    });
}

// Render basic stats section
function renderBasicStats(skill) {
    const costs = [];
    if (skill.mpCost > 0) costs.push(`${skill.mpCost} MP`);
    const costText = costs.length > 0 ? costs.join(', ') : 'None';
    
    return `
        <div class="detail-section">
            <div class="section-title">Basic Information</div>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Cost</div>
                    <div class="stat-value">${costText}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Target</div>
                    <div class="stat-value">${skill.scope.name}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Success Rate</div>
                    <div class="stat-value">${skill.successRate}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Hit Type</div>
                    <div class="stat-value">${skill.hitType.name}</div>
                </div>
                ${skill.repeats > 1 ? `
                <div class="stat-item">
                    <div class="stat-label">Repeats</div>
                    <div class="stat-value">${skill.repeats}x</div>
                </div>
                ` : ''}
                ${skill.speed !== 0 ? `
                <div class="stat-item">
                    <div class="stat-label">Speed Modifier</div>
                    <div class="stat-value">${skill.speed > 0 ? '+' : ''}${skill.speed}</div>
                </div>
                ` : ''}
                <div class="stat-item">
                    <div class="stat-label">Usable</div>
                    <div class="stat-value">${skill.occasion.name}</div>
                </div>
            </div>
        </div>
    `;
}

// Render damage information
function renderDamageInfo(skill) {
    if (skill.damage.type.name === 'None') return '';
    
    // Removed: Required Weapon (weapon type hidden)
    const requiredWeapons = '';
    
    const hasOriginalFormula = skill.damage.formula && skill.damage.formula !== skill.damage.readableFormula;
    
    return `
        <div class="detail-section">
            <div class="section-title">Damage Information</div>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Damage Type</div>
                    <div class="stat-value">${skill.damage.type.name}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Element</div>
                    <div class="stat-value">${convertCrossReferencesAndEscape(skill.damage.element.name)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Variance</div>
                    <div class="stat-value">±${skill.damage.variance}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Can Critical</div>
                    <div class="stat-value">${skill.damage.critical ? 'Yes' : 'No'}</div>
                </div>
                ${requiredWeapons}
            </div>
            ${skill.damage.readableFormula ? `
                <div class="mt-2">
                    <div class="stat-label mb-2">Damage Formula</div>
                    <div class="formula-box" id="formula-display">${skill.damage.readableFormula}</div>
                    ${hasOriginalFormula ? `
                        <button class="show-original-toggle" data-toggle="formula">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            Show Original Formula
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

// Helper function to sort effects
function sortEffects(effects) {
    if (!effects || !Array.isArray(effects) || effects.length === 0) {
        return effects || [];
    }
    // Create a copy to avoid mutating the original
    const sorted = [...effects];
    return sorted.sort((a, b) => {
        // First sort by code (effect type) - lower codes first
        const codeA = a.code ?? 999;
        const codeB = b.code ?? 999;
        if (codeA !== codeB) {
            return codeA - codeB;
        }
        // If same code, sort by dataId - lower dataIds first
        const dataIdA = a.dataId ?? 999;
        const dataIdB = b.dataId ?? 999;
        if (dataIdA !== dataIdB) {
            return dataIdA - dataIdB;
        }
        // If same code and dataId, sort by value1 - higher values first
        const value1A = a.value1 ?? 0;
        const value1B = b.value1 ?? 0;
        if (value1A !== value1B) {
            return value1B - value1A;
        }
        // Finally sort by value2 - higher values first
        const value2A = a.value2 ?? 0;
        const value2B = b.value2 ?? 0;
        return value2B - value2A;
    });
}

// Helper function to sort traits
function sortTraits(traits) {
    if (!traits || !Array.isArray(traits) || traits.length === 0) {
        return traits || [];
    }
    // Create a copy to avoid mutating the original
    const sorted = [...traits];
    return sorted.sort((a, b) => {
        // First sort by code (trait type) - lower codes first
        const codeA = a.code ?? 999;
        const codeB = b.code ?? 999;
        if (codeA !== codeB) {
            return codeA - codeB;
        }
        // If same code, sort by dataId - lower dataIds first
        const dataIdA = a.dataId ?? 999;
        const dataIdB = b.dataId ?? 999;
        if (dataIdA !== dataIdB) {
            return dataIdA - dataIdB;
        }
        // If same code and dataId, sort by value - higher values first
        const valueA = a.value ?? 0;
        const valueB = b.value ?? 0;
        return valueB - valueA;
    });
}

// Render effects
function renderEffects(skill) {
    if (skill.effects.length === 0) return '';
    
    // Sort effects before rendering and store sorted array
    skill._sortedEffects = sortEffects(skill.effects);
    
    return `
        <div class="detail-section">
            <div class="section-title">Effects</div>
            ${skill._sortedEffects.map((effect, index) => {
                const hasOriginalData = effect.code !== undefined;
                const effectDesc = effect.description ? convertCrossReferencesAndEscape(effect.description) : '';
                const effectType = effect.codeName ? escapeHtml(effect.codeName) : '';
                return `
                    <div class="effect-item">
                        ${effect.description ? `<div class="effect-description">${effectDesc}</div>` : `<div class="effect-type">${effectType}</div>`}
                        ${hasOriginalData ? `
                            <button class="show-original-toggle" data-toggle="effect" data-effect-index="${index}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                Show Original Data
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Render messages
function renderMessages(skill) {
    if (!skill.message1 && !skill.message2) return '';
    
    return `
        <div class="detail-section">
            <div class="section-title">Battle Messages</div>
            ${skill.message1 ? `
                <div class="stat-item mb-2">
                    <div class="stat-label">Message 1</div>
                    <div class="stat-value">${convertCrossReferencesAndEscape(skill.message1)}</div>
                </div>
            ` : ''}
            ${skill.message2 ? `
                <div class="stat-item">
                    <div class="stat-label">Message 2</div>
                    <div class="stat-value">${convertCrossReferencesAndEscape(skill.message2)}</div>
                </div>
            ` : ''}
        </div>
    `;
}

// HTML escape function to prevent HTML interpretation
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Render notes
function renderNotes(skill) {
    // Check if there's any actual content (not just whitespace or empty tags)
    const hasJapanese = skill.note.japanese && skill.note.japanese.trim();
    const hasEnglish = skill.note.english && skill.note.english.trim();
    
    if (!hasJapanese && !hasEnglish) return '';
    
    const displayText = hasEnglish || "(No translation available)";
    const crossRefText = convertCrossReferencesAndEscape(displayText);
    
    return `
        <div class="detail-section">
            <div class="section-title">Notes</div>
            <div class="note-container">
                <div class="note-text">${crossRefText}</div>
                ${hasJapanese ? `
                    <button class="note-toggle" data-lang="en">Show Original (Japanese)</button>
                ` : ''}
            </div>
        </div>
    `;
}

// Helper function to find all entities that reference a given entity in their text fields
// Searches through notes, descriptions, and other text fields across all entity types
function findAllTextReferences(targetType, targetId) {
    const references = {
        skills: [],
        items: [],
        states: [],
        weapons: [],
        armors: [],
        enemies: []
    };
    
    // Use data directly from data.js if arrays aren't loaded yet
    const skills = allSkills.length > 0 ? allSkills : (skillsData?.skills || []);
    const items = allItems.length > 0 ? allItems : (itemsData?.items || []);
    const states = allStates.length > 0 ? allStates : (statesData?.states || []);
    const weapons = allWeapons.length > 0 ? allWeapons : (weaponsData?.weapons || []);
    const armors = allArmors.length > 0 ? allArmors : (armorsData?.armors || []);
    const enemies = allEnemies.length > 0 ? allEnemies : (enemiesData?.enemies || []);
    
    // Build pattern to match references: [[TYPE:ID:NAME]] or "Type #ID"
    const typeNames = {
        'SKILL': 'Skill',
        'ITEM': 'Item',
        'STATE': 'State',
        'WEAPON': 'Weapon',
        'ARMOR': 'Armor',
        'ENEMY': 'Enemy'
    };
    const typeName = typeNames[targetType] || targetType;
    const refPattern = new RegExp(`\\[\\[${targetType}:${targetId}:([^\\]]+)\\]\\]|${typeName}\\s*#\\s*${targetId}\\b`, 'i');
    
    // Helper function to check if text contains a reference
    const hasReference = (text) => {
        if (!text || typeof text !== 'string') return false;
        return refPattern.test(text);
    };
    
    // Search skills (only skip self-reference if target is also a skill)
    skills.forEach(skill => {
        if (!skill) return;
        if (targetType === 'SKILL' && skill.id === targetId) return; // Skip self-reference
        
        const noteText = skill.note?.english || skill.note?.japanese || '';
        const descText = skill.description || '';
        
        if (hasReference(noteText) || hasReference(descText)) {
            references.skills.push({
                id: skill.id,
                name: skill.name,
                reference: `[[SKILL:${skill.id}:${skill.name}]]`
            });
        }
    });
    
    // Search items (only skip self-reference if target is also an item)
    items.forEach(item => {
        if (!item) return;
        if (targetType === 'ITEM' && item.id === targetId) return; // Skip self-reference
        
        const noteText = item.note?.english || item.note?.japanese || '';
        const descText = item.description || '';
        
        if (hasReference(noteText) || hasReference(descText)) {
            references.items.push({
                id: item.id,
                name: item.name,
                reference: `[[ITEM:${item.id}:${item.name}]]`
            });
        }
    });
    
    // Search states (only skip self-reference if target is also a state)
    states.forEach(state => {
        if (!state) return;
        if (targetType === 'STATE' && state.id === targetId) return; // Skip self-reference
        
        const noteText = state.note?.english || state.note?.japanese || '';
        const descText = state.description || '';
        
        if (hasReference(noteText) || hasReference(descText)) {
            references.states.push({
                id: state.id,
                name: state.name,
                reference: `[[STATE:${state.id}:${state.name}]]`
            });
        }
    });
    
    // Search weapons (only skip self-reference if target is also a weapon)
    weapons.forEach(weapon => {
        if (!weapon) return;
        if (targetType === 'WEAPON' && weapon.id === targetId) return; // Skip self-reference
        
        const noteText = weapon.note?.english || weapon.note?.japanese || '';
        const descText = weapon.description || '';
        
        if (hasReference(noteText) || hasReference(descText)) {
            references.weapons.push({
                id: weapon.id,
                name: weapon.name,
                reference: `[[WEAPON:${weapon.id}:${weapon.name}]]`
            });
        }
    });
    
    // Search armors (only skip self-reference if target is also an armor)
    armors.forEach(armor => {
        if (!armor) return;
        if (targetType === 'ARMOR' && armor.id === targetId) return; // Skip self-reference
        
        const noteText = armor.note?.english || armor.note?.japanese || '';
        const descText = armor.description || '';
        
        if (hasReference(noteText) || hasReference(descText)) {
            references.armors.push({
                id: armor.id,
                name: armor.name,
                reference: `[[ARMOR:${armor.id}:${armor.name}]]`
            });
        }
    });
    
    // Search enemies (only skip self-reference if target is also an enemy)
    enemies.forEach(enemy => {
        if (!enemy) return;
        if (targetType === 'ENEMY' && enemy.id === targetId) return; // Skip self-reference
        
        const noteText = enemy.note?.english || enemy.note?.japanese || '';
        const descText = enemy.description || '';
        
        if (hasReference(noteText) || hasReference(descText)) {
            references.enemies.push({
                id: enemy.id,
                name: enemy.name,
                reference: `[[ENEMY:${enemy.id}:${enemy.name}]]`
            });
        }
    });
    
    return references;
}

// Helper functions to find reverse references
// These functions use the data directly from data.js to ensure data is always available
function findSkillReferences(skillId) {
    const references = {
        itemsTeaching: [],
        enemiesUsing: [],
        referencedBy: findAllTextReferences('SKILL', skillId)
    };
    
    // Use data directly from data.js if arrays aren't loaded yet
    const items = allItems.length > 0 ? allItems : (itemsData?.items || []);
    const enemies = allEnemies.length > 0 ? allEnemies : (enemiesData?.enemies || []);
    
    // Find items that teach this skill (effect code 43: Learn Skill)
    items.forEach(item => {
        if (item && item.effects) {
            const teachesSkill = item.effects.some(effect => 
                effect.code === 43 && effect.dataId === skillId
            );
            if (teachesSkill) {
                references.itemsTeaching.push({
                    id: item.id,
                    name: item.name,
                    reference: `[[ITEM:${item.id}:${item.name}]]`
                });
            }
        }
    });
    
    // Find enemies that use this skill
    enemies.forEach(enemy => {
        if (enemy && enemy.actions) {
            const usesSkill = enemy.actions.some(action => action.skillId === skillId);
            if (usesSkill) {
                references.enemiesUsing.push({
                    id: enemy.id,
                    name: enemy.name,
                    reference: `[[ENEMY:${enemy.id}:${enemy.name}]]`
                });
            }
        }
    });
    
    return references;
}

function findStateReferences(stateId) {
    const references = {
        skillsApplying: [],
        skillsRemoving: [],
        itemsApplying: [],
        itemsRemoving: [],
        enemiesWith: []
    };
    
    // Use data directly from data.js if arrays aren't loaded yet
    const skills = allSkills.length > 0 ? allSkills : (skillsData?.skills || []);
    const items = allItems.length > 0 ? allItems : (itemsData?.items || []);
    const enemies = allEnemies.length > 0 ? allEnemies : (enemiesData?.enemies || []);
    
    // Find skills that apply this state (effect code 21: Add State)
    skills.forEach(skill => {
        if (skill && skill.effects) {
            const appliesState = skill.effects.some(effect => 
                effect.code === 21 && effect.dataId === stateId
            );
            if (appliesState) {
                references.skillsApplying.push({
                    id: skill.id,
                    name: skill.name,
                    reference: `[[SKILL:${skill.id}:${skill.name}]]`
                });
            }
            const removesState = skill.effects.some(effect => 
                effect.code === 22 && effect.dataId === stateId
            );
            if (removesState) {
                references.skillsRemoving.push({
                    id: skill.id,
                    name: skill.name,
                    reference: `[[SKILL:${skill.id}:${skill.name}]]`
                });
            }
        }
    });
    
    // Find items that apply/remove this state
    items.forEach(item => {
        if (item && item.effects) {
            const appliesState = item.effects.some(effect => 
                effect.code === 21 && effect.dataId === stateId
            );
            if (appliesState) {
                references.itemsApplying.push({
                    id: item.id,
                    name: item.name,
                    reference: `[[ITEM:${item.id}:${item.name}]]`
                });
            }
            const removesState = item.effects.some(effect => 
                effect.code === 22 && effect.dataId === stateId
            );
            if (removesState) {
                references.itemsRemoving.push({
                    id: item.id,
                    name: item.name,
                    reference: `[[ITEM:${item.id}:${item.name}]]`
                });
            }
        }
    });
    
    // Find enemies that have this state (via traits)
    enemies.forEach(enemy => {
        if (enemy && enemy.traits) {
            const hasState = enemy.traits.some(trait => 
                trait.code === 10 && trait.dataId === stateId
            );
            if (hasState) {
                references.enemiesWith.push({
                    id: enemy.id,
                    name: enemy.name,
                    reference: `[[ENEMY:${enemy.id}:${enemy.name}]]`
                });
            }
        }
    });
    
    return references;
}

function findWeaponReferences(weaponId) {
    const references = {
        enemiesDropping: []
    };
    
    // Use data directly from data.js if arrays aren't loaded yet
    const enemies = allEnemies.length > 0 ? allEnemies : (enemiesData?.enemies || []);
    
    // Find enemies that drop this weapon (drop.kind === 2)
    enemies.forEach(enemy => {
        if (enemy && enemy.dropItems) {
            const dropsWeapon = enemy.dropItems.some(drop => 
                drop.kind === 2 && drop.dataId === weaponId
            );
            if (dropsWeapon) {
                references.enemiesDropping.push({
                    id: enemy.id,
                    name: enemy.name,
                    reference: `[[ENEMY:${enemy.id}:${enemy.name}]]`
                });
            }
        }
    });
    
    return references;
}

function findArmorReferences(armorId) {
    const references = {
        enemiesDropping: []
    };
    
    // Use data directly from data.js if arrays aren't loaded yet
    const enemies = allEnemies.length > 0 ? allEnemies : (enemiesData?.enemies || []);
    
    // Find enemies that drop this armor (drop.kind === 3)
    enemies.forEach(enemy => {
        if (enemy && enemy.dropItems) {
            const dropsArmor = enemy.dropItems.some(drop => 
                drop.kind === 3 && drop.dataId === armorId
            );
            if (dropsArmor) {
                references.enemiesDropping.push({
                    id: enemy.id,
                    name: enemy.name,
                    reference: `[[ENEMY:${enemy.id}:${enemy.name}]]`
                });
            }
        }
    });
    
    return references;
}

function findItemReferences(itemId) {
    const references = {
        enemiesDropping: []
    };
    
    // Use data directly from data.js if arrays aren't loaded yet
    const enemies = allEnemies.length > 0 ? allEnemies : (enemiesData?.enemies || []);
    
    // Find enemies that drop this item (drop.kind === 1 for items)
    enemies.forEach(enemy => {
        if (enemy && enemy.dropItems) {
            const dropsItem = enemy.dropItems.some(drop => 
                drop.kind === 1 && drop.dataId === itemId
            );
            if (dropsItem) {
                references.enemiesDropping.push({
                    id: enemy.id,
                    name: enemy.name,
                    reference: `[[ENEMY:${enemy.id}:${enemy.name}]]`
                });
            }
        }
    });
    
    return references;
}

function findEnemyReferences(enemyId) {
    const references = {
        skillsUsed: [],
        itemsDropped: [],
        statesApplied: []
    };
    
    // Use data directly from data.js if arrays aren't loaded yet
    const enemies = allEnemies.length > 0 ? allEnemies : (enemiesData?.enemies || []);
    const skills = allSkills.length > 0 ? allSkills : (skillsData?.skills || []);
    const items = allItems.length > 0 ? allItems : (itemsData?.items || []);
    const states = allStates.length > 0 ? allStates : (statesData?.states || []);
    
    const enemy = enemies.find(e => e && e.id === enemyId);
    if (!enemy) return references;
    
    // Skills used by this enemy
    if (enemy.actions) {
        enemy.actions.forEach(action => {
            const skill = skills.find(s => s && s.id === action.skillId);
            if (skill) {
                references.skillsUsed.push({
                    id: skill.id,
                    name: skill.name,
                    reference: `[[SKILL:${skill.id}:${skill.name}]]`
                });
            }
        });
    }
    
    // Items dropped by this enemy
    if (enemy.dropItems) {
        enemy.dropItems.forEach(drop => {
            const item = items.find(i => i && i.id === drop.itemId);
            if (item) {
                references.itemsDropped.push({
                    id: item.id,
                    name: item.name,
                    reference: `[[ITEM:${item.id}:${item.name}]]`
                });
            }
        });
    }
    
    // States applied by this enemy (via traits)
    if (enemy.traits) {
        enemy.traits.forEach(trait => {
            if (trait.code === 10 && trait.dataId) {
                const state = states.find(s => s && s.id === trait.dataId);
                if (state) {
                    references.statesApplied.push({
                        id: state.id,
                        name: state.name,
                        reference: `[[STATE:${state.id}:${state.name}]]`
                    });
                }
            }
        });
    }
    
    return references;
}

// Load states data (synchronous - data is already loaded from data.js)
function loadStates() {
    try {
        allStates = statesData.states;
        filteredStates = allStates;
        
        renderStatesResults();
        updateResultsCount();
    } catch (error) {
        console.error('Error loading states:', error);
        resultsList.innerHTML = '<div class="empty-state"><p>Error loading states data</p></div>';
    }
}

// Search and filter states
function searchStates(query) {
    if (!query.trim()) {
        filteredStates = allStates;
        return;
    }
    
    // Filter and calculate relevance
    const resultsWithScores = allStates
        .map(state => {
            const detailText = getDetailTextContent(state, 'state');
            if (fuzzyMatch(query, detailText)) {
                return {
                    state: state,
                    relevance: calculateRelevance(state, query, 'state')
                };
            }
            return null;
        })
        .filter(result => result !== null)
        .sort((a, b) => b.relevance - a.relevance); // Sort by relevance (highest first)
    
    filteredStates = resultsWithScores.map(result => result.state);
}

// Render states results list
function renderStatesResults() {
    if (filteredStates.length === 0) {
        resultsList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M44 44L33.65 33.65" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>No states found</p>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = filteredStates.map(state => {
        const iconPos = getIconPosition(state.iconIndex);
        const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${state.iconIndex}"` : '';
        
        return `
            <div class="skill-card ${selectedStateId === state.id ? 'active' : ''}" data-state-id="${state.id}">
                <div class="skill-card-header">
                    <div class="skill-icon" ${iconStyle}></div>
                    <div class="skill-card-title">${state.name} <span class="detail-id">#${state.id}</span></div>
                </div>
                <div class="skill-card-description">${state.duration} duration</div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.skill-card[data-state-id]').forEach(card => {
        card.addEventListener('click', () => {
            const stateId = parseInt(card.dataset.stateId);
            selectState(stateId);
        });
    });
}

// Select and display state details
function selectState(stateId) {
    selectedStateId = stateId;
    const state = allStates.find(s => s.id === stateId);
    
    if (!state) return;
    
    // Update active state on cards
    document.querySelectorAll('.skill-card[data-state-id]').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.stateId) === stateId);
    });
    
    // Show detail content, hide placeholder
    document.querySelector('.detail-placeholder').style.display = 'none';
    detailContent.style.display = 'block';
    
    // Reset scroll position
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    renderStateDetail(state);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'flex';
        document.querySelector('.detail-panel').classList.add('mobile-active');
        
        // Reset scroll position after panel is shown on mobile
        setTimeout(() => {
            if (detailPanel) {
                detailPanel.scrollTop = 0;
            }
            if (detailContent) {
                detailContent.scrollTop = 0;
            }
        }, 0);
    }
    
    // Update browser history
    // Use replaceState if state hasn't meaningfully changed to avoid duplicates
    if (!isRestoringState) {
        const newState = buildNavigationState();
        const currentState = history.state;
        // If state hasn't changed (same view, game, selectedId, searchQuery), use replaceState
        if (currentState && !hasStateChanged(newState)) {
            pushHistoryState(newState, true); // Use replaceState to avoid duplicates
        } else {
            pushHistoryState(newState); // Use pushState for actual navigation changes
        }
    }
}

// Render state detail view
function renderStateDetail(state) {
    const iconPos = getIconPosition(state.iconIndex, 1.5); // 48px = 32px * 1.5
    const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${state.iconIndex}"` : '';
    
    // Find references
    const refs = findStateReferences(state.id);
    
    let html = `
        <div class="detail-header">
            <div class="detail-title-row">
                <div class="detail-icon" ${iconStyle}></div>
                <div class="detail-title">${escapeHtml(state.name)} <span class="detail-id">#${state.id}</span></div>
            </div>
        </div>
        
        ${renderStateMessages(state)}
        ${renderStateBasicInfo(state)}
        ${renderStateTraits(state)}
        ${renderStateNotes(state)}
    `;
    
    // Add references section at the bottom
    if (refs.skillsApplying.length > 0 || refs.skillsRemoving.length > 0 || 
        refs.itemsApplying.length > 0 || refs.itemsRemoving.length > 0 || 
        refs.enemiesWith.length > 0) {
        html += `
            <div class="detail-section">
                <div class="section-title">References</div>
        `;
        
        if (refs.skillsApplying.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Skills Applying This State (${refs.skillsApplying.length})</div>
                    <div class="effect-list">
                        ${refs.skillsApplying.map(skill => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(skill.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (refs.skillsRemoving.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Skills Removing This State (${refs.skillsRemoving.length})</div>
                    <div class="effect-list">
                        ${refs.skillsRemoving.map(skill => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(skill.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (refs.itemsApplying.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Items Applying This State (${refs.itemsApplying.length})</div>
                    <div class="effect-list">
                        ${refs.itemsApplying.map(item => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(item.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (refs.itemsRemoving.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Items Removing This State (${refs.itemsRemoving.length})</div>
                    <div class="effect-list">
                        ${refs.itemsRemoving.map(item => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(item.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (refs.enemiesWith.length > 0) {
            html += `
                <div class="subsection">
                    <div class="subsection-title">Enemies With This State (${refs.enemiesWith.length})</div>
                    <div class="effect-list">
                        ${refs.enemiesWith.map(enemy => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(enemy.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
    }
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailPanel) {
            detailPanel.scrollTop = 0;
        }
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
    
    // Add toggle handlers for trait original data
    const traitToggles = detailContent.querySelectorAll('.show-original-toggle[data-toggle="trait"]');
    traitToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const traitIndex = parseInt(toggle.dataset.traitIndex);
            // Use sorted traits array if available, otherwise use original
            const traitsArray = state._sortedTraits || state.traits;
            const trait = traitsArray[traitIndex];
            const traitItem = toggle.closest('.effect-item');
            
            let originalDataBox = traitItem.querySelector('.original-data-box');
            
            if (originalDataBox) {
                // Remove the original data box
                originalDataBox.remove();
                toggle.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Show Original Data
                `;
            } else {
                // Show original data
                let originalData = `Code: ${trait.code}`;
                
                // Add raw values
                if (trait.dataId !== undefined) originalData += `\nData ID: ${trait.dataId}`;
                if (trait.value !== undefined) originalData += `\nValue: ${trait.value}`;
                
                originalDataBox = document.createElement('div');
                originalDataBox.className = 'original-data-box';
                originalDataBox.textContent = originalData;
                
                toggle.insertAdjacentElement('beforebegin', originalDataBox);
                toggle.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Hide Original Data
                `;
            }
        });
    });
    
    // Add toggle handler for Japanese text
    const toggleBtn = detailContent.querySelector('.note-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const noteText = detailContent.querySelector('.note-text');
            const currentLang = toggleBtn.dataset.lang || 'en';
            
            if (currentLang === 'en') {
                // Switching to Japanese - preserve line breaks but don't convert cross-refs (Japanese text)
                noteText.innerHTML = (state.note.japanese || "(No original text)").replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Translated (English)';
                toggleBtn.dataset.lang = 'jp';
            } else {
                // Switching to English - convert cross-references and preserve line breaks
                const englishText = state.note.english || "(No translation available)";
                const crossRefText = convertCrossReferencesAndEscape(englishText);
                noteText.innerHTML = crossRefText.replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Original (Japanese)';
                toggleBtn.dataset.lang = 'en';
                // Re-attach cross-reference listeners after updating HTML
                attachCrossReferenceListeners();
            }
        });
    }
}

// Render state messages
function renderStateMessages(state) {
    const messages = [];
    if (state.message1) messages.push({ label: 'When Inflicted', text: state.message1 });
    if (state.message2) messages.push({ label: 'When Inflicted (Actor)', text: state.message2 });
    if (state.message3) messages.push({ label: 'While Active', text: state.message3 });
    if (state.message4) messages.push({ label: 'When Removed', text: state.message4 });
    
    if (messages.length === 0) return '';
    
    return `
        <div class="detail-section">
            <div class="section-title">Battle Messages</div>
            ${messages.map(msg => `
                <div class="stat-item mb-2">
                    <div class="stat-label">${msg.label}</div>
                    <div class="stat-value">${convertCrossReferencesAndEscape(msg.text)}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render state basic information
function renderStateBasicInfo(state) {
    return `
        <div class="detail-section">
            <div class="section-title">Basic Information</div>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Duration</div>
                    <div class="stat-value">${state.duration}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Priority</div>
                    <div class="stat-value">${state.priority}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Auto Removal</div>
                    <div class="stat-value">${state.autoRemovalTiming.name}</div>
                </div>
                ${state.chanceByDamage !== 100 ? `
                <div class="stat-item">
                    <div class="stat-label">Removal Chance by Damage</div>
                    <div class="stat-value">${state.chanceByDamage}%</div>
                </div>
                ` : ''}
                ${state.restriction.id > 0 ? `
                <div class="stat-item">
                    <div class="stat-label">Restriction</div>
                    <div class="stat-value">${state.restriction.name}</div>
                </div>
                ` : ''}
            </div>
            ${state.removalConditions.length > 0 ? `
            <div class="stat-item mt-2">
                <div class="stat-label">Removal Conditions</div>
                <div class="stat-value">${state.removalConditions.join(', ')}</div>
            </div>
            ` : ''}
        </div>
    `;
}

// Render state traits
function renderStateTraits(state) {
    if (state.traits.length === 0) return '';
    
    // Sort traits before rendering and store sorted array
    state._sortedTraits = sortTraits(state.traits);
    
    return `
        <div class="detail-section">
            <div class="section-title">Traits</div>
            ${state._sortedTraits.map((trait, index) => {
                const hasOriginalData = trait.code !== undefined;
                const traitDesc = trait.description ? convertCrossReferencesAndEscape(trait.description) : '';
                const traitType = trait.codeName ? escapeHtml(trait.codeName) : '';
                return `
                    <div class="effect-item">
                        ${trait.description ? `<div class="effect-description">${traitDesc}</div>` : `<div class="effect-type">${traitType}</div>`}
                        ${hasOriginalData ? `
                            <button class="show-original-toggle" data-toggle="trait" data-trait-index="${index}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                Show Original Data
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Render state notes
function renderStateNotes(state) {
    const hasJapanese = state.note.japanese && state.note.japanese.trim();
    const hasEnglish = state.note.english && state.note.english.trim();
    
    if (!hasJapanese && !hasEnglish) return '';
    
    const displayText = hasEnglish || "(No translation available)";
    const escapedDisplayText = escapeHtml(displayText);
    
    return `
        <div class="detail-section">
            <div class="section-title">Notes</div>
            <div class="note-container">
                <div class="note-text">${convertCrossReferences(escapedDisplayText)}</div>
                ${hasJapanese ? `
                    <button class="note-toggle" data-lang="en">Show Original (Japanese)</button>
                ` : ''}
            </div>
        </div>
    `;
}

// Load weapons data (synchronous - data is already loaded from data.js)
function loadWeapons() {
    try {
        allWeapons = weaponsData.weapons;
        filteredWeapons = allWeapons;
        
        renderWeaponsResults();
        updateResultsCount();
    } catch (error) {
        console.error('Error loading weapons:', error);
        resultsList.innerHTML = '<div class="empty-state"><p>Error loading weapons data</p></div>';
    }
}

// Load armors data (synchronous - data is already loaded from data.js)
function loadArmors() {
    try {
        allArmors = armorsData.armors;
        filteredArmors = allArmors;
        
        renderArmorsResults();
        updateResultsCount();
    } catch (error) {
        console.error('Error loading armors:', error);
        resultsList.innerHTML = '<div class="empty-state"><p>Error loading armors data</p></div>';
    }
}

// Load enemies data (synchronous - data is already loaded from data.js)
function loadEnemies() {
    try {
        allEnemies = enemiesData.enemies;
        filteredEnemies = allEnemies;
        
        renderEnemiesResults();
        updateResultsCount();
    } catch (error) {
        console.error('Error loading enemies:', error);
        resultsList.innerHTML = '<div class="empty-state"><p>Error loading enemies data</p></div>';
    }
}

// Load items data (synchronous - data is already loaded from data.js)
function loadItems() {
    try {
        allItems = itemsData.items;
        filteredItems = allItems;
        
        renderItemsResults();
        updateResultsCount();
    } catch (error) {
        console.error('Error loading items:', error);
        resultsList.innerHTML = '<div class="empty-state"><p>Error loading items data</p></div>';
    }
}

// Load elements data (synchronous - data is already loaded from data.js)
function loadElements() {
    try {
        allElements = elementsData.elements || [];
        filteredElements = allElements;
        
        renderElementsResults();
        updateResultsCount();
    } catch (error) {
        console.error('Error loading elements:', error);
        resultsList.innerHTML = '<div class="empty-state"><p>Error loading elements data</p></div>';
    }
}

// Search and filter weapons
function searchWeapons(query) {
    if (!query.trim()) {
        filteredWeapons = allWeapons;
        return;
    }
    
    // Filter and calculate relevance
    const resultsWithScores = allWeapons
        .map(weapon => {
            const detailText = getDetailTextContent(weapon, 'weapon');
            if (fuzzyMatch(query, detailText)) {
                return {
                    weapon: weapon,
                    relevance: calculateRelevance(weapon, query, 'weapon')
                };
            }
            return null;
        })
        .filter(result => result !== null)
        .sort((a, b) => b.relevance - a.relevance); // Sort by relevance (highest first)
    
    filteredWeapons = resultsWithScores.map(result => result.weapon);
}

// Search and filter armors
function searchArmors(query) {
    if (!query.trim()) {
        filteredArmors = allArmors;
        return;
    }
    
    // Filter and calculate relevance
    const resultsWithScores = allArmors
        .map(armor => {
            const detailText = getDetailTextContent(armor, 'armor');
            if (fuzzyMatch(query, detailText)) {
                return {
                    armor: armor,
                    relevance: calculateRelevance(armor, query, 'armor')
                };
            }
            return null;
        })
        .filter(result => result !== null)
        .sort((a, b) => b.relevance - a.relevance); // Sort by relevance (highest first)
    
    filteredArmors = resultsWithScores.map(result => result.armor);
}

// Search and filter enemies
function searchEnemies(query) {
    if (!query.trim()) {
        filteredEnemies = allEnemies;
        return;
    }
    
    // Filter and calculate relevance
    const resultsWithScores = allEnemies
        .map(enemy => {
            const detailText = getDetailTextContent(enemy, 'enemy');
            if (fuzzyMatch(query, detailText)) {
                return {
                    enemy: enemy,
                    relevance: calculateRelevance(enemy, query, 'enemy')
                };
            }
            return null;
        })
        .filter(result => result !== null)
        .sort((a, b) => b.relevance - a.relevance); // Sort by relevance (highest first)
    
    filteredEnemies = resultsWithScores.map(result => result.enemy);
}

// Search and filter items
function searchItems(query) {
    if (!query.trim()) {
        filteredItems = allItems;
        return;
    }
    
    // Filter and calculate relevance
    const resultsWithScores = allItems
        .map(item => {
            const detailText = getDetailTextContent(item, 'item');
            if (fuzzyMatch(query, detailText)) {
                return {
                    item: item,
                    relevance: calculateRelevance(item, query, 'item')
                };
            }
            return null;
        })
        .filter(result => result !== null)
        .sort((a, b) => b.relevance - a.relevance); // Sort by relevance (highest first)
    
    filteredItems = resultsWithScores.map(result => result.item);
}

// Search and filter elements
function searchElements(query) {
    if (!query.trim()) {
        filteredElements = allElements;
        return;
    }
    
    // Filter and calculate relevance
    const resultsWithScores = allElements
        .map(element => {
            const detailText = getDetailTextContent(element, 'element');
            if (fuzzyMatch(query, detailText)) {
                return {
                    element: element,
                    relevance: calculateRelevance(element, query, 'element')
                };
            }
            return null;
        })
        .filter(result => result !== null)
        .sort((a, b) => b.relevance - a.relevance); // Sort by relevance (highest first)
    
    filteredElements = resultsWithScores.map(result => result.element);
}

// Render weapons results list
function renderWeaponsResults() {
    if (filteredWeapons.length === 0) {
        resultsList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M44 44L33.65 33.65" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>No weapons found</p>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = filteredWeapons.map(weapon => {
        const iconPos = getIconPosition(weapon.iconIndex);
        const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${weapon.iconIndex}"` : '';
        
        return `
            <div class="skill-card ${selectedWeaponId === weapon.id ? 'active' : ''}" data-weapon-id="${weapon.id}">
                <div class="skill-card-header">
                    <div class="skill-icon" ${iconStyle}></div>
                    <div class="skill-card-title">${weapon.name} <span class="detail-id">#${weapon.id}</span></div>
                </div>
                <div class="skill-card-description">${weapon.price > 0 ? `${weapon.price}G` : ''}</div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.skill-card[data-weapon-id]').forEach(card => {
        card.addEventListener('click', () => {
            const weaponId = parseInt(card.dataset.weaponId);
            selectWeapon(weaponId);
        });
    });
}

// Render armors results list
function renderArmorsResults() {
    if (filteredArmors.length === 0) {
        resultsList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M44 44L33.65 33.65" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>No armors found</p>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = filteredArmors.map(armor => {
        const iconPos = getIconPosition(armor.iconIndex);
        const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${armor.iconIndex}"` : '';
        
        return `
            <div class="skill-card ${selectedArmorId === armor.id ? 'active' : ''}" data-armor-id="${armor.id}">
                <div class="skill-card-header">
                    <div class="skill-icon" ${iconStyle}></div>
                    <div class="skill-card-title">${armor.name} <span class="detail-id">#${armor.id}</span></div>
                </div>
                <div class="skill-card-description">${armor.price > 0 ? `${armor.price}G` : ''}</div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.skill-card[data-armor-id]').forEach(card => {
        card.addEventListener('click', () => {
            const armorId = parseInt(card.dataset.armorId);
            selectArmor(armorId);
        });
    });
}

// Render enemies results list
function renderEnemiesResults() {
    if (filteredEnemies.length === 0) {
        resultsList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M44 44L33.65 33.65" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>No enemies found</p>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = filteredEnemies.map(enemy => {
        // Use battler sprite if available, otherwise fall back to icon
        let imageHtml = '';
        if (enemy.battlerName && enemy.battlerName.trim() !== '') {
            const battlerPath = `Battlers/${enemy.battlerName}.png`;
            imageHtml = `<img src="${battlerPath}" alt="${enemy.name}" class="enemy-battler enemy-battler-list" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />`;
            // Fallback icon (hidden by default, shown if battler image fails to load)
            const iconPos = getIconPosition(enemy.iconIndex);
            const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos}; display: none;" data-icon="${enemy.iconIndex}"` : 'style="display: none;"';
            imageHtml += `<div class="skill-icon" ${iconStyle}></div>`;
        } else {
            const iconPos = getIconPosition(enemy.iconIndex);
            const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${enemy.iconIndex}"` : '';
            imageHtml = `<div class="skill-icon" ${iconStyle}></div>`;
        }
        
        return `
            <div class="skill-card ${selectedEnemyId === enemy.id ? 'active' : ''}" data-enemy-id="${enemy.id}">
                <div class="skill-card-header">
                    ${imageHtml}
                    <div class="skill-card-title">${enemy.name} <span class="detail-id">#${enemy.id}</span></div>
                </div>
                <div class="skill-card-description">${enemy.exp > 0 ? `${enemy.exp} EXP` : ''} ${enemy.gold > 0 ? ` • ${enemy.gold}G` : ''}</div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.skill-card[data-enemy-id]').forEach(card => {
        card.addEventListener('click', () => {
            const enemyId = parseInt(card.dataset.enemyId);
            selectEnemy(enemyId);
        });
    });
}

// Render items results list
function renderItemsResults() {
    if (filteredItems.length === 0) {
        resultsList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M44 44L33.65 33.65" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>No items found</p>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = filteredItems.map(item => {
        const iconPos = getIconPosition(item.iconIndex);
        const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${item.iconIndex}"` : '';
        
        return `
            <div class="skill-card ${selectedItemId === item.id ? 'active' : ''}" data-item-id="${item.id}">
                <div class="skill-card-header">
                    <div class="skill-icon" ${iconStyle}></div>
                    <div class="skill-card-title">${item.name} <span class="detail-id">#${item.id}</span></div>
                </div>
                <div class="skill-card-description">${item.price > 0 ? `${item.price}G` : ''} ${item.consumable ? '• Consumable' : ''}</div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.skill-card[data-item-id]').forEach(card => {
        card.addEventListener('click', () => {
            const itemId = parseInt(card.dataset.itemId);
            selectItem(itemId);
        });
    });
}

// Render elements results list
function renderElementsResults() {
    if (filteredElements.length === 0) {
        resultsList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 38C30.3888 38 38 30.3888 38 21C38 11.6112 30.3888 4 21 4C11.6112 4 4 11.6112 4 21C4 30.3888 11.6112 38 21 38Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M44 44L33.65 33.65" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>No elements found</p>
            </div>
        `;
        return;
    }
    
    resultsList.innerHTML = filteredElements.map(element => {
        const totalRefs = (element.skillsUsingElement?.length || 0) + 
                         (element.itemsUsingElement?.length || 0) + 
                         (element.elementRateModifiers?.length || 0) + 
                         (element.attackElementAdditions?.length || 0);
        
        const iconPos = getIconPosition(element.iconIndex || 0);
        const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${element.iconIndex || 0}"` : '';
        
        return `
            <div class="skill-card ${selectedElementId === element.id ? 'active' : ''}" data-element-id="${element.id}">
                <div class="skill-card-header">
                    <div class="skill-icon" ${iconStyle}></div>
                    <div class="skill-card-title">${element.englishName || element.japaneseName || `Element #${element.id}`} <span class="detail-id">#${element.id}</span></div>
                </div>
                <div class="skill-card-description">${totalRefs} references${element.isEmpty ? ' • Empty' : ''}</div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.skill-card[data-element-id]').forEach(card => {
        card.addEventListener('click', () => {
            const elementId = parseInt(card.dataset.elementId);
            selectElement(elementId);
        });
    });
}

// Select and display weapon details
function selectWeapon(weaponId) {
    selectedWeaponId = weaponId;
    const weapon = allWeapons.find(w => w.id === weaponId);
    
    if (!weapon) return;
    
    // Update active state on cards
    document.querySelectorAll('.skill-card[data-weapon-id]').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.weaponId) === weaponId);
    });
    
    // Show detail content, hide placeholder
    document.querySelector('.detail-placeholder').style.display = 'none';
    detailContent.style.display = 'block';
    
    // Reset scroll position
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    renderWeaponDetail(weapon);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'flex';
        document.querySelector('.detail-panel').classList.add('mobile-active');
        
        // Reset scroll position after panel is shown on mobile
        setTimeout(() => {
            if (detailPanel) {
                detailPanel.scrollTop = 0;
            }
            if (detailContent) {
                detailContent.scrollTop = 0;
            }
        }, 0);
    }
    
    // Update browser history
    // Use replaceState if state hasn't meaningfully changed to avoid duplicates
    if (!isRestoringState) {
        const newState = buildNavigationState();
        const currentState = history.state;
        // If state hasn't changed (same view, game, selectedId, searchQuery), use replaceState
        if (currentState && !hasStateChanged(newState)) {
            pushHistoryState(newState, true); // Use replaceState to avoid duplicates
        } else {
            pushHistoryState(newState); // Use pushState for actual navigation changes
        }
    }
}

// Render weapon detail view
function renderWeaponDetail(weapon) {
    const iconPos = getIconPosition(weapon.iconIndex, 1.5); // 48px = 32px * 1.5
    const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${weapon.iconIndex}"` : '';
    
    // Find references
    const refs = findWeaponReferences(weapon.id);
    
    let html = `
        <div class="detail-header">
            <div class="detail-title-row">
                <div class="detail-icon" ${iconStyle}></div>
                <div class="detail-title">${escapeHtml(weapon.name)} <span class="detail-id">#${weapon.id}</span></div>
            </div>
        </div>
        
        ${weapon.description ? `
            <div class="detail-section">
                <div class="section-title">Description</div>
                <div class="detail-text">${convertCrossReferencesAndEscape(weapon.description)}</div>
            </div>
        ` : ''}
        
        ${renderWeaponBasicStats(weapon)}
        
        ${weapon.params.length > 0 ? renderWeaponParams(weapon) : ''}
        
        ${weapon.traits.length > 0 ? renderWeaponTraits(weapon) : ''}
        
        ${weapon.note.english || weapon.note.japanese ? renderWeaponNotes(weapon) : ''}
    `;
    
    // Add references section at the bottom
    if (refs.enemiesDropping.length > 0) {
        html += `
            <div class="detail-section">
                <div class="section-title">References</div>
                <div class="subsection">
                    <div class="subsection-title">Enemies Dropping This Weapon (${refs.enemiesDropping.length})</div>
                    <div class="effect-list">
                        ${refs.enemiesDropping.map(enemy => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(enemy.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailPanel) {
            detailPanel.scrollTop = 0;
        }
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
    
    // Add toggle handlers for trait original data
    const traitToggles = detailContent.querySelectorAll('.show-original-toggle[data-toggle="trait"]');
    traitToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const traitIndex = parseInt(toggle.dataset.traitIndex);
            // Use sorted traits array if available, otherwise use original
            const traitsArray = weapon._sortedTraits || weapon.traits;
            const trait = traitsArray[traitIndex];
            const traitItem = toggle.closest('.effect-item');
            
            let originalDataBox = traitItem.querySelector('.original-data-box');
            
            if (originalDataBox) {
                // Remove the original data box
                originalDataBox.remove();
                toggle.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Show Original Data
                `;
            } else {
                // Show original data
                let originalData = `Code: ${trait.code}`;
                
                // Add raw values
                if (trait.dataId !== undefined) originalData += `\nData ID: ${trait.dataId}`;
                if (trait.value !== undefined) originalData += `\nValue: ${trait.value}`;
                
                originalDataBox = document.createElement('div');
                originalDataBox.className = 'original-data-box';
                originalDataBox.textContent = originalData;
                
                toggle.insertAdjacentElement('beforebegin', originalDataBox);
                toggle.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Hide Original Data
                `;
            }
        });
    });
    
    // Add toggle handler for Japanese text
    const toggleBtn = detailContent.querySelector('.note-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const noteText = detailContent.querySelector('.note-text');
            const currentLang = toggleBtn.dataset.lang || 'en';
            
            if (currentLang === 'en') {
                // Switching to Japanese - preserve line breaks but don't convert cross-refs (Japanese text)
                noteText.innerHTML = (weapon.note.japanese || "(No original text)").replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Translated (English)';
                toggleBtn.dataset.lang = 'jp';
            } else {
                // Switching to English - convert cross-references and preserve line breaks
                const englishText = weapon.note.english || "(No translation available)";
                const crossRefText = convertCrossReferencesAndEscape(englishText);
                noteText.innerHTML = crossRefText.replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Original (Japanese)';
                toggleBtn.dataset.lang = 'en';
                // Re-attach cross-reference listeners after updating HTML
                attachCrossReferenceListeners();
            }
        });
    }
}

// Render weapon basic stats
function renderWeaponBasicStats(weapon) {
    return `
        <div class="detail-section">
            <div class="section-title">Basic Information</div>
            <div class="stats-grid">
                ${weapon.price > 0 ? `
                    <div class="stat-item">
                        <div class="stat-label">Price</div>
                        <div class="stat-value">${weapon.price}G</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Render weapon parameter bonuses
function renderWeaponParams(weapon) {
    return `
        <div class="detail-section">
            <div class="section-title">Parameter Bonuses</div>
            <div class="stats-grid">
                ${weapon.params.map(param => `
                    <div class="stat-item">
                        <div class="stat-label">${param.name}</div>
                        <div class="stat-value">${param.value > 0 ? '+' : ''}${param.value}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Render weapon traits
function renderWeaponTraits(weapon) {
    if (weapon.traits.length === 0) return '';
    
    // Sort traits before rendering and store sorted array
    weapon._sortedTraits = sortTraits(weapon.traits);
    
    return `
        <div class="detail-section">
            <div class="section-title">Traits</div>
            ${weapon._sortedTraits.map((trait, index) => {
                const hasOriginalData = trait.code !== undefined;
                return `
                    <div class="effect-item">
                        ${trait.description ? `<div class="effect-description">${convertCrossReferencesAndEscape(trait.description)}</div>` : `<div class="effect-type">${escapeHtml(trait.codeName)}</div>`}
                        ${hasOriginalData ? `
                            <button class="show-original-toggle" data-toggle="trait" data-trait-index="${index}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                Show Original Data
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Render weapon notes
function renderWeaponNotes(weapon) {
    const hasEnglish = weapon.note.english && weapon.note.english.trim() !== '';
    const hasJapanese = weapon.note.japanese && weapon.note.japanese.trim() !== '';
    
    if (!hasEnglish && !hasJapanese) return '';
    
    // Handle line breaks in notes and convert cross-references
    const displayTextRaw = hasEnglish ? weapon.note.english : weapon.note.japanese;
    const displayTextEscaped = escapeHtml(displayTextRaw).replace(/\n/g, '<br>');
    const displayText = convertCrossReferences(displayTextEscaped);
    const toggleText = hasEnglish && hasJapanese ? 'Show Original (Japanese)' : (hasJapanese ? 'Show Translated (English)' : '');
    
    return `
        <div class="detail-section">
            <div class="section-title">Notes</div>
            <div class="note-text">${displayText}</div>
            ${hasEnglish && hasJapanese ? `
                <button class="note-toggle" data-lang="en">${toggleText}</button>
            ` : ''}
        </div>
    `;
}

// Select and display armor details
function selectArmor(armorId) {
    selectedArmorId = armorId;
    const armor = allArmors.find(a => a.id === armorId);
    
    if (!armor) return;
    
    // Update active state on cards
    document.querySelectorAll('.skill-card[data-armor-id]').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.armorId) === armorId);
    });
    
    // Show detail content, hide placeholder
    document.querySelector('.detail-placeholder').style.display = 'none';
    detailContent.style.display = 'block';
    
    // Reset scroll position
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    renderArmorDetail(armor);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'flex';
        document.querySelector('.detail-panel').classList.add('mobile-active');
        
        // Reset scroll position after panel is shown on mobile
        setTimeout(() => {
            if (detailPanel) {
                detailPanel.scrollTop = 0;
            }
            if (detailContent) {
                detailContent.scrollTop = 0;
            }
        }, 0);
    }
    
    // Update browser history
    // Use replaceState if state hasn't meaningfully changed to avoid duplicates
    if (!isRestoringState) {
        const newState = buildNavigationState();
        const currentState = history.state;
        // If state hasn't changed (same view, game, selectedId, searchQuery), use replaceState
        if (currentState && !hasStateChanged(newState)) {
            pushHistoryState(newState, true); // Use replaceState to avoid duplicates
        } else {
            pushHistoryState(newState); // Use pushState for actual navigation changes
        }
    }
}

// Select and display enemy details
function selectEnemy(enemyId) {
    selectedEnemyId = enemyId;
    const enemy = allEnemies.find(e => e.id === enemyId);
    
    if (!enemy) return;
    
    // Update active state on cards
    document.querySelectorAll('.skill-card[data-enemy-id]').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.enemyId) === enemyId);
    });
    
    // Show detail content, hide placeholder
    document.querySelector('.detail-placeholder').style.display = 'none';
    detailContent.style.display = 'block';
    
    // Reset scroll position
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    renderEnemyDetail(enemy);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'flex';
        document.querySelector('.detail-panel').classList.add('mobile-active');
        
        // Reset scroll position after panel is shown on mobile
        setTimeout(() => {
            if (detailPanel) {
                detailPanel.scrollTop = 0;
            }
            if (detailContent) {
                detailContent.scrollTop = 0;
            }
        }, 0);
    }
    
    // Update browser history
    // Use replaceState if state hasn't meaningfully changed to avoid duplicates
    if (!isRestoringState) {
        const newState = buildNavigationState();
        const currentState = history.state;
        // If state hasn't changed (same view, game, selectedId, searchQuery), use replaceState
        if (currentState && !hasStateChanged(newState)) {
            pushHistoryState(newState, true); // Use replaceState to avoid duplicates
        } else {
            pushHistoryState(newState); // Use pushState for actual navigation changes
        }
    }
}

// Select and display item details
function selectItem(itemId) {
    selectedItemId = itemId;
    const item = allItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Update active state on cards
    document.querySelectorAll('.skill-card[data-item-id]').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.itemId) === itemId);
    });
    
    // Show detail content, hide placeholder
    document.querySelector('.detail-placeholder').style.display = 'none';
    detailContent.style.display = 'block';
    
    // Reset scroll position
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    renderItemDetail(item);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'flex';
        document.querySelector('.detail-panel').classList.add('mobile-active');
        
        // Reset scroll position after panel is shown on mobile
        setTimeout(() => {
            if (detailPanel) {
                detailPanel.scrollTop = 0;
            }
            if (detailContent) {
                detailContent.scrollTop = 0;
            }
        }, 0);
    }
    
    // Update browser history
    // Use replaceState if state hasn't meaningfully changed to avoid duplicates
    if (!isRestoringState) {
        const newState = buildNavigationState();
        const currentState = history.state;
        // If state hasn't changed (same view, game, selectedId, searchQuery), use replaceState
        if (currentState && !hasStateChanged(newState)) {
            pushHistoryState(newState, true); // Use replaceState to avoid duplicates
        } else {
            pushHistoryState(newState); // Use pushState for actual navigation changes
        }
    }
}

// Select and display element details
function selectElement(elementId) {
    selectedElementId = elementId;
    const element = allElements.find(e => e.id === elementId);
    
    if (!element) return;
    
    // Update active state on cards
    document.querySelectorAll('.skill-card[data-element-id]').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.elementId) === elementId);
    });
    
    // Show detail content, hide placeholder
    document.querySelector('.detail-placeholder').style.display = 'none';
    detailContent.style.display = 'block';
    
    // Reset scroll position
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    renderElementDetail(element);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'flex';
        document.querySelector('.detail-panel').classList.add('mobile-active');
        
        // Reset scroll position after panel is shown on mobile
        setTimeout(() => {
            if (detailPanel) {
                detailPanel.scrollTop = 0;
            }
            if (detailContent) {
                detailContent.scrollTop = 0;
            }
        }, 0);
    }
    
    // Update browser history
    // Use replaceState if state hasn't meaningfully changed to avoid duplicates
    if (!isRestoringState) {
        const newState = buildNavigationState();
        const currentState = history.state;
        // If state hasn't changed (same view, game, selectedId, searchQuery), use replaceState
        if (currentState && !hasStateChanged(newState)) {
            pushHistoryState(newState, true); // Use replaceState to avoid duplicates
        } else {
            pushHistoryState(newState); // Use pushState for actual navigation changes
        }
    }
}

// Render armor detail view (similar to weapon detail)
function renderArmorDetail(armor) {
    const iconPos = getIconPosition(armor.iconIndex, 1.5);
    const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${armor.iconIndex}"` : '';
    
    // Find references
    const refs = findArmorReferences(armor.id);
    
    let html = `
        <div class="detail-header">
            <div class="detail-title-row">
                <div class="detail-icon" ${iconStyle}></div>
                <div class="detail-title">${escapeHtml(armor.name)} <span class="detail-id">#${armor.id}</span></div>
            </div>
        </div>
        
        ${armor.description ? `
            <div class="detail-section">
                <div class="section-title">Description</div>
                <div class="detail-text">${convertCrossReferencesAndEscape(armor.description)}</div>
            </div>
        ` : ''}
        
        ${renderArmorBasicStats(armor)}
        
        ${armor.params.length > 0 ? renderArmorParams(armor) : ''}
        
        ${armor.traits.length > 0 ? renderArmorTraits(armor) : ''}
        
        ${armor.note.english || armor.note.japanese ? renderArmorNotes(armor) : ''}
    `;
    
    // Add references section at the bottom
    if (refs.enemiesDropping.length > 0) {
        html += `
            <div class="detail-section">
                <div class="section-title">References</div>
                <div class="subsection">
                    <div class="subsection-title">Enemies Dropping This Armor (${refs.enemiesDropping.length})</div>
                    <div class="effect-list">
                        ${refs.enemiesDropping.map(enemy => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(enemy.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailPanel) {
            detailPanel.scrollTop = 0;
        }
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
    
    // Add toggle handlers (similar to weapon)
    const traitToggles = detailContent.querySelectorAll('.show-original-toggle[data-toggle="trait"]');
    traitToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const traitIndex = parseInt(toggle.dataset.traitIndex);
            // Use sorted traits array if available, otherwise use original
            const traitsArray = armor._sortedTraits || armor.traits;
            const trait = traitsArray[traitIndex];
            const traitItem = toggle.closest('.effect-item');
            
            let originalDataBox = traitItem.querySelector('.original-data-box');
            
            if (originalDataBox) {
                originalDataBox.remove();
                toggle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/></svg>Show Original Data`;
            } else {
                let originalData = `Code: ${trait.code}`;
                if (trait.dataId !== undefined) originalData += `\nData ID: ${trait.dataId}`;
                if (trait.value !== undefined) originalData += `\nValue: ${trait.value}`;
                
                originalDataBox = document.createElement('div');
                originalDataBox.className = 'original-data-box';
                originalDataBox.textContent = originalData;
                toggle.insertAdjacentElement('beforebegin', originalDataBox);
                toggle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Hide Original Data`;
            }
        });
    });
    
    const toggleBtn = detailContent.querySelector('.note-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const noteText = detailContent.querySelector('.note-text');
            const currentLang = toggleBtn.dataset.lang || 'en';
            
            if (currentLang === 'en') {
                // Switching to Japanese - preserve line breaks but don't convert cross-refs (Japanese text)
                noteText.innerHTML = (armor.note.japanese || "(No original text)").replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Translated (English)';
                toggleBtn.dataset.lang = 'jp';
            } else {
                // Switching to English - convert cross-references and preserve line breaks
                const englishText = armor.note.english || "(No translation available)";
                const crossRefText = convertCrossReferencesAndEscape(englishText);
                noteText.innerHTML = crossRefText.replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Original (Japanese)';
                toggleBtn.dataset.lang = 'en';
                // Re-attach cross-reference listeners after updating HTML
                attachCrossReferenceListeners();
            }
        });
    }
}

function renderArmorBasicStats(armor) {
    return `
        <div class="detail-section">
            <div class="section-title">Basic Information</div>
            <div class="stats-grid">
                ${armor.price > 0 ? `
                    <div class="stat-item">
                        <div class="stat-label">Price</div>
                        <div class="stat-value">${armor.price}G</div>
                    </div>
                ` : ''}
                ${armor.armorType && armor.armorType.name ? `
                    <div class="stat-item">
                        <div class="stat-label">Armor Type</div>
                        <div class="stat-value">${armor.armorType.name}</div>
                    </div>
                ` : ''}
                ${armor.equipSlot && armor.equipSlot.name ? `
                    <div class="stat-item">
                        <div class="stat-label">Equip Slot</div>
                        <div class="stat-value">${armor.equipSlot.name}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderArmorParams(armor) {
    return `
        <div class="detail-section">
            <div class="section-title">Parameter Bonuses</div>
            <div class="stats-grid">
                ${armor.params.map(param => `
                    <div class="stat-item">
                        <div class="stat-label">${param.name}</div>
                        <div class="stat-value">${param.value > 0 ? '+' : ''}${param.value}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderArmorTraits(armor) {
    if (armor.traits.length === 0) return '';
    
    // Sort traits before rendering and store sorted array
    armor._sortedTraits = sortTraits(armor.traits);
    
    return `
        <div class="detail-section">
            <div class="section-title">Traits</div>
            ${armor._sortedTraits.map((trait, index) => {
                const hasOriginalData = trait.code !== undefined;
                return `
                    <div class="effect-item">
                        <div class="effect-description">${convertCrossReferencesAndEscape(trait.description || 'No description')}</div>
                        ${hasOriginalData ? `
                            <button class="show-original-toggle" data-toggle="trait" data-trait-index="${index}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                Show Original Data
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderArmorNotes(armor) {
    const hasEnglish = armor.note.english && armor.note.english.trim() !== '';
    const hasJapanese = armor.note.japanese && armor.note.japanese.trim() !== '';
    
    if (!hasEnglish && !hasJapanese) return '';
    
    const displayTextRaw = hasEnglish ? armor.note.english : armor.note.japanese;
    const displayTextEscaped = escapeHtml(displayTextRaw).replace(/\n/g, '<br>');
    const displayText = convertCrossReferences(displayTextEscaped);
    const toggleText = hasEnglish && hasJapanese ? 'Show Original (Japanese)' : '';
    
    return `
        <div class="detail-section">
            <div class="section-title">Notes</div>
            <div class="note-text">${displayText}</div>
            ${hasEnglish && hasJapanese ? `<button class="note-toggle" data-lang="en">${toggleText}</button>` : ''}
        </div>
    `;
}

// Render enemy detail view
function renderEnemyDetail(enemy) {
    // Use battler sprite if available, otherwise fall back to icon
    let imageHtml = '';
    if (enemy.battlerName && enemy.battlerName.trim() !== '') {
        const battlerPath = `Battlers/${enemy.battlerName}.png`;
        imageHtml = `<img src="${battlerPath}" alt="${enemy.name}" class="enemy-battler enemy-battler-detail" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />`;
        // Fallback icon (hidden by default, shown if battler image fails to load)
        const iconPos = getIconPosition(enemy.iconIndex, 1.5);
        const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos}; display: none;" data-icon="${enemy.iconIndex}"` : 'style="display: none;"';
        imageHtml += `<div class="detail-icon" ${iconStyle}></div>`;
    } else {
        const iconPos = getIconPosition(enemy.iconIndex, 1.5);
        const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${enemy.iconIndex}"` : '';
        imageHtml = `<div class="detail-icon" ${iconStyle}></div>`;
    }
    
    // Find references (skills used, items dropped, states applied are already shown in the detail view)
    // This section would show reverse references if needed, but for enemies, the main sections already show this info
    // We'll add a references section for completeness, showing what this enemy references
    const refs = findEnemyReferences(enemy.id);
    
    let html = `
        <div class="detail-header">
            <div class="detail-title-row">
                ${imageHtml}
                <div class="detail-title">${escapeHtml(enemy.name)} <span class="detail-id">#${enemy.id}</span></div>
            </div>
        </div>
        
        ${renderEnemyBaseStats(enemy)}
        
        ${enemy.traits.length > 0 ? renderEnemyTraits(enemy) : ''}
        
        ${enemy.actions.length > 0 ? renderEnemyActions(enemy) : ''}
        
        ${enemy.dropItems.length > 0 ? renderEnemyDrops(enemy) : ''}
        
        ${renderEnemyRewards(enemy)}
        
        ${enemy.note.english || enemy.note.japanese ? renderEnemyNotes(enemy) : ''}
    `;
    
    // Add references section at the bottom (for completeness, though most info is already shown above)
    // This could be useful for showing unique references not already displayed
    // For now, we'll skip it since enemies already show their skills, items, and states in detail sections
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailPanel) {
            detailPanel.scrollTop = 0;
        }
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
    
    // Add toggle handlers
    const traitToggles = detailContent.querySelectorAll('.show-original-toggle[data-toggle="trait"]');
    traitToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const traitIndex = parseInt(toggle.dataset.traitIndex);
            // Use sorted traits array if available, otherwise use original
            const traitsArray = enemy._sortedTraits || enemy.traits;
            const trait = traitsArray[traitIndex];
            const traitItem = toggle.closest('.effect-item');
            
            let originalDataBox = traitItem.querySelector('.original-data-box');
            
            if (originalDataBox) {
                originalDataBox.remove();
                toggle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/></svg>Show Original Data`;
            } else {
                let originalData = `Code: ${trait.code}`;
                if (trait.dataId !== undefined) originalData += `\nData ID: ${trait.dataId}`;
                if (trait.value !== undefined) originalData += `\nValue: ${trait.value}`;
                
                originalDataBox = document.createElement('div');
                originalDataBox.className = 'original-data-box';
                originalDataBox.textContent = originalData;
                toggle.insertAdjacentElement('beforebegin', originalDataBox);
                toggle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Hide Original Data`;
            }
        });
    });
    
    const toggleBtn = detailContent.querySelector('.note-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const noteText = detailContent.querySelector('.note-text');
            const currentLang = toggleBtn.dataset.lang || 'en';
            
            if (currentLang === 'en') {
                // Switching to Japanese - preserve line breaks but don't convert cross-refs (Japanese text)
                noteText.innerHTML = (enemy.note.japanese || "(No original text)").replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Translated (English)';
                toggleBtn.dataset.lang = 'jp';
            } else {
                // Switching to English - convert cross-references and preserve line breaks
                const englishText = enemy.note.english || "(No translation available)";
                const crossRefText = convertCrossReferencesAndEscape(englishText);
                noteText.innerHTML = crossRefText.replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Original (Japanese)';
                toggleBtn.dataset.lang = 'en';
                // Re-attach cross-reference listeners after updating HTML
                attachCrossReferenceListeners();
            }
        });
    }
}

function renderEnemyBaseStats(enemy) {
    return `
        <div class="detail-section">
            <div class="section-title">Base Stats</div>
            <div class="stats-grid">
                ${Object.entries(enemy.baseStats).map(([name, value]) => `
                    <div class="stat-item">
                        <div class="stat-label">${name}</div>
                        <div class="stat-value">${value}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderEnemyTraits(enemy) {
    if (enemy.traits.length === 0) return '';
    
    // Sort traits before rendering and store sorted array
    enemy._sortedTraits = sortTraits(enemy.traits);
    
    return `
        <div class="detail-section">
            <div class="section-title">Traits</div>
            ${enemy._sortedTraits.map((trait, index) => {
                const hasOriginalData = trait.code !== undefined;
                return `
                    <div class="effect-item">
                        <div class="effect-description">${convertCrossReferencesAndEscape(trait.description || 'No description')}</div>
                        ${hasOriginalData ? `
                            <button class="show-original-toggle" data-toggle="trait" data-trait-index="${index}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                Show Original Data
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderEnemyActions(enemy) {
    return `
        <div class="detail-section">
            <div class="section-title">Actions (Skills)</div>
            ${enemy.actions.map(action => `
                <div class="effect-item">
                    <div class="effect-description">${convertCrossReferencesAndEscape(action.skillName)} (Rating: ${action.rating})</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderEnemyDrops(enemy) {
    return `
        <div class="detail-section">
            <div class="section-title">Drops</div>
            ${enemy.dropItems.map(drop => `
                <div class="effect-item">
                    <div class="effect-description">${convertCrossReferencesAndEscape(drop.name)} (${drop.kindName}) - 1/${drop.denominator} chance</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderEnemyRewards(enemy) {
    return `
        <div class="detail-section">
            <div class="section-title">Rewards</div>
            <div class="stats-grid">
                ${enemy.exp > 0 ? `
                    <div class="stat-item">
                        <div class="stat-label">Experience</div>
                        <div class="stat-value">${enemy.exp}</div>
                    </div>
                ` : ''}
                ${enemy.gold > 0 ? `
                    <div class="stat-item">
                        <div class="stat-label">Gold</div>
                        <div class="stat-value">${enemy.gold}G</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderEnemyNotes(enemy) {
    const hasEnglish = enemy.note.english && enemy.note.english.trim() !== '';
    const hasJapanese = enemy.note.japanese && enemy.note.japanese.trim() !== '';
    
    if (!hasEnglish && !hasJapanese) return '';
    
    const displayTextRaw = hasEnglish ? enemy.note.english : enemy.note.japanese;
    const displayTextEscaped = escapeHtml(displayTextRaw).replace(/\n/g, '<br>');
    const displayText = convertCrossReferences(displayTextEscaped);
    const toggleText = hasEnglish && hasJapanese ? 'Show Original (Japanese)' : '';
    
    return `
        <div class="detail-section">
            <div class="section-title">Notes</div>
            <div class="note-text">${displayText}</div>
            ${hasEnglish && hasJapanese ? `<button class="note-toggle" data-lang="en">${toggleText}</button>` : ''}
        </div>
    `;
}

// Render item detail view
function renderItemDetail(item) {
    const iconPos = getIconPosition(item.iconIndex, 1.5);
    const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${item.iconIndex}"` : '';
    
    // Find references
    const refs = findItemReferences(item.id);
    
    let html = `
        <div class="detail-header">
            <div class="detail-title-row">
                <div class="detail-icon" ${iconStyle}></div>
                <div class="detail-title">${escapeHtml(item.name)} <span class="detail-id">#${item.id}</span></div>
            </div>
        </div>
        
        ${item.description ? `
            <div class="detail-section">
                <div class="section-title">Description</div>
                <div class="detail-text">${convertCrossReferencesAndEscape(item.description)}</div>
            </div>
        ` : ''}
        
        ${renderItemBasicStats(item)}
        
        ${item.effects.length > 0 ? renderItemEffects(item) : ''}
        
        ${item.damage ? renderItemDamage(item) : ''}
        
        ${item.note.english || item.note.japanese ? renderItemNotes(item) : ''}
    `;
    
    // Add references section at the bottom
    if (refs.enemiesDropping.length > 0) {
        html += `
            <div class="detail-section">
                <div class="section-title">References</div>
                <div class="subsection">
                    <div class="subsection-title">Enemies Dropping This Item (${refs.enemiesDropping.length})</div>
                    <div class="effect-list">
                        ${refs.enemiesDropping.map(enemy => `
                            <div class="effect-item">
                                <div class="effect-name">${convertCrossReferencesAndEscape(enemy.reference)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailPanel) {
            detailPanel.scrollTop = 0;
        }
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
    
    const toggleBtn = detailContent.querySelector('.note-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const noteText = detailContent.querySelector('.note-text');
            const currentLang = toggleBtn.dataset.lang || 'en';
            
            if (currentLang === 'en') {
                // Switching to Japanese - preserve line breaks but don't convert cross-refs (Japanese text)
                noteText.innerHTML = (item.note.japanese || "(No original text)").replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Translated (English)';
                toggleBtn.dataset.lang = 'jp';
            } else {
                // Switching to English - convert cross-references and preserve line breaks
                const englishText = item.note.english || "(No translation available)";
                const crossRefText = convertCrossReferencesAndEscape(englishText);
                noteText.innerHTML = crossRefText.replace(/\n/g, '<br>');
                toggleBtn.textContent = 'Show Original (Japanese)';
                toggleBtn.dataset.lang = 'en';
                // Re-attach cross-reference listeners after updating HTML
                attachCrossReferenceListeners();
            }
        });
    }
}

// Render element detail view
function renderElementDetail(element) {
    const elementName = element.englishName || element.japaneseName || `Element #${element.id}`;
    const japaneseName = element.japaneseName && element.japaneseName !== elementName ? element.japaneseName : '';
    
    const iconPos = getIconPosition(element.iconIndex || 0, 1.5); // 48px = 32px * 1.5
    const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${element.iconIndex || 0}"` : '';
    
    let html = `
        <div class="detail-header">
            <div class="detail-title-row">
                <div class="detail-icon" ${iconStyle}></div>
                <div class="detail-title">${escapeHtml(elementName)} <span class="detail-id">#${element.id}</span></div>
            </div>
        </div>
        
        <div class="detail-section">
            <div class="section-title">Element Information</div>
            <div class="stats-grid">
                ${japaneseName ? `
                    <div class="stat-item">
                        <div class="stat-label">Japanese Name</div>
                        <div class="stat-value">${escapeHtml(japaneseName)}</div>
                    </div>
                ` : ''}
                ${element.isEmpty ? `
                    <div class="stat-item">
                        <div class="stat-label">Status</div>
                        <div class="stat-value">Empty/Unused</div>
                    </div>
                ` : ''}
                <div class="stat-item">
                    <div class="stat-label">Total References</div>
                    <div class="stat-value">${element.totalReferences || 0}</div>
                </div>
            </div>
        </div>
    `;
    
    // Skills using this element
    if (element.skillsUsingElement && element.skillsUsingElement.length > 0) {
        html += `
            <div class="detail-section">
                <div class="section-title">Skills Using This Element (${element.skillsUsingElement.length})</div>
                <div class="effect-list">
                    ${element.skillsUsingElement.map(skill => `
                        <div class="effect-item">
                            <div class="effect-name">${convertCrossReferencesAndEscape(skill.reference)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Items using this element
    if (element.itemsUsingElement && element.itemsUsingElement.length > 0) {
        html += `
            <div class="detail-section">
                <div class="section-title">Items Using This Element (${element.itemsUsingElement.length})</div>
                <div class="effect-list">
                    ${element.itemsUsingElement.map(item => `
                        <div class="effect-item">
                            <div class="effect-name">${convertCrossReferencesAndEscape(item.reference)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Element rate modifiers
    if (element.elementRateModifiers && element.elementRateModifiers.length > 0) {
        // Group by source type
        const bySourceType = {
            weapon: [],
            armor: [],
            state: [],
            enemy: []
        };
        
        element.elementRateModifiers.forEach(mod => {
            if (bySourceType[mod.sourceType]) {
                bySourceType[mod.sourceType].push(mod);
            }
        });
        
        // Sort each group by rate value (ascending - lower rates first)
        Object.keys(bySourceType).forEach(type => {
            bySourceType[type].sort((a, b) => a.rate - b.rate);
        });
        
        html += `
            <div class="detail-section">
                <div class="section-title">Element Rate Modifiers (${element.elementRateModifiers.length})</div>
                ${Object.keys(bySourceType).filter(type => bySourceType[type].length > 0).map(type => {
                    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
                    return `
                        <div class="subsection">
                            <div class="subsection-title">${typeName}s (${bySourceType[type].length})</div>
                            <div class="effect-list">
                                ${bySourceType[type].map(mod => `
                                    <div class="effect-item">
                                        <div class="effect-name">${convertCrossReferencesAndEscape(mod.reference)}</div>
                                        <div class="effect-description">${escapeHtml(mod.description)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Attack element additions
    if (element.attackElementAdditions && element.attackElementAdditions.length > 0) {
        // Group by source type
        const bySourceType = {
            weapon: [],
            armor: [],
            state: [],
            enemy: []
        };
        
        element.attackElementAdditions.forEach(add => {
            if (bySourceType[add.sourceType]) {
                bySourceType[add.sourceType].push(add);
            }
        });
        
        html += `
            <div class="detail-section">
                <div class="section-title">Attack Element Additions (${element.attackElementAdditions.length})</div>
                <div class="detail-text">These sources add this element to attacks:</div>
                ${Object.keys(bySourceType).filter(type => bySourceType[type].length > 0).map(type => {
                    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
                    return `
                        <div class="subsection">
                            <div class="subsection-title">${typeName}s (${bySourceType[type].length})</div>
                            <div class="effect-list">
                                ${bySourceType[type].map(add => `
                                    <div class="effect-item">
                                        <div class="effect-name">${convertCrossReferencesAndEscape(add.reference)}</div>
                                        <div class="effect-description">${escapeHtml(add.description)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailPanel) {
        detailPanel.scrollTop = 0;
    }
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailPanel) {
            detailPanel.scrollTop = 0;
        }
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
}

function renderItemBasicStats(item) {
    return `
        <div class="detail-section">
            <div class="section-title">Basic Information</div>
            <div class="stats-grid">
                ${item.price > 0 ? `
                    <div class="stat-item">
                        <div class="stat-label">Price</div>
                        <div class="stat-value">${item.price}G</div>
                    </div>
                ` : ''}
                <div class="stat-item">
                    <div class="stat-label">Consumable</div>
                    <div class="stat-value">${item.consumable ? 'Yes' : 'No'}</div>
                </div>
                ${item.occasionName ? `
                    <div class="stat-item">
                        <div class="stat-label">Usage</div>
                        <div class="stat-value">${item.occasionName}</div>
                    </div>
                ` : ''}
                ${item.scopeName ? `
                    <div class="stat-item">
                        <div class="stat-label">Scope</div>
                        <div class="stat-value">${item.scopeName}</div>
                    </div>
                ` : ''}
                ${item.successRate !== 100 ? `
                    <div class="stat-item">
                        <div class="stat-label">Success Rate</div>
                        <div class="stat-value">${item.successRate}%</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderItemEffects(item) {
    if (item.effects.length === 0) return '';
    
    // Sort effects before rendering and store sorted array
    item._sortedEffects = sortEffects(item.effects);
    
    return `
        <div class="detail-section">
            <div class="section-title">Effects</div>
            ${item._sortedEffects.map(effect => `
                <div class="effect-item">
                    <div class="effect-description">${convertCrossReferencesAndEscape(effect.description || 'No description')}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderItemDamage(item) {
    return `
        <div class="detail-section">
            <div class="section-title">Damage Information</div>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Damage Type</div>
                    <div class="stat-value">${item.damage.type}</div>
                </div>
                ${item.damage.element ? `
                    <div class="stat-item">
                        <div class="stat-label">Element</div>
                        <div class="stat-value">${convertCrossReferencesAndEscape(item.damage.element)}</div>
                    </div>
                ` : ''}
                ${item.damage.formula ? `
                    <div class="stat-item">
                        <div class="stat-label">Formula</div>
                        <div class="stat-value">${item.damage.formula}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderItemNotes(item) {
    const hasEnglish = item.note.english && item.note.english.trim() !== '';
    const hasJapanese = item.note.japanese && item.note.japanese.trim() !== '';
    
    if (!hasEnglish && !hasJapanese) return '';
    
    const displayTextRaw = hasEnglish ? item.note.english : item.note.japanese;
    const displayTextEscaped = escapeHtml(displayTextRaw).replace(/\n/g, '<br>');
    const displayText = convertCrossReferences(displayTextEscaped);
    const toggleText = hasEnglish && hasJapanese ? 'Show Original (Japanese)' : '';
    
    return `
        <div class="detail-section">
            <div class="section-title">Notes</div>
            <div class="note-text">${displayText}</div>
            ${hasEnglish && hasJapanese ? `<button class="note-toggle" data-lang="en">${toggleText}</button>` : ''}
        </div>
    `;
}

// Update results count
function updateResultsCount() {
    if (currentSection === 'skills') {
        const count = filteredSkills.length;
        resultsCount.textContent = `${count} skill${count !== 1 ? 's' : ''} found`;
    } else if (currentSection === 'states') {
        const count = filteredStates.length;
        resultsCount.textContent = `${count} state${count !== 1 ? 's' : ''} found`;
    } else if (currentSection === 'weapons') {
        const count = filteredWeapons.length;
        resultsCount.textContent = `${count} weapon${count !== 1 ? 's' : ''} found`;
    } else if (currentSection === 'armors') {
        const count = filteredArmors.length;
        resultsCount.textContent = `${count} armor${count !== 1 ? 's' : ''} found`;
    } else if (currentSection === 'enemies') {
        const count = filteredEnemies.length;
        resultsCount.textContent = `${count} ${count !== 1 ? 'enemies' : 'enemy'} found`;
    } else if (currentSection === 'items') {
        const count = filteredItems.length;
        resultsCount.textContent = `${count} item${count !== 1 ? 's' : ''} found`;
    } else if (currentSection === 'elements') {
        const count = filteredElements.length;
        resultsCount.textContent = `${count} element${count !== 1 ? 's' : ''} found`;
    }
}

// Event listeners
// Debounce timer for search input to prevent too many history entries
let searchDebounceTimer = null;
const SEARCH_DEBOUNCE_MS = 500; // Wait 500ms after user stops typing before updating history

searchInput.addEventListener('input', (e) => {
    const searchValue = e.target.value;
    
    // Reset left panel scroll to top when search changes
    const resultsList = document.getElementById('results-list');
    if (resultsList) {
        resultsList.scrollTop = 0;
    }
    
    // Perform search immediately for responsive UI
    if (currentSection === 'skills') {
        searchSkills(searchValue);
        renderResults();
    } else if (currentSection === 'states') {
        searchStates(searchValue);
        renderStatesResults();
    } else if (currentSection === 'weapons') {
        searchWeapons(searchValue);
        renderWeaponsResults();
    } else if (currentSection === 'armors') {
        searchArmors(searchValue);
        renderArmorsResults();
    } else if (currentSection === 'enemies') {
        searchEnemies(searchValue);
        renderEnemiesResults();
    } else if (currentSection === 'items') {
        searchItems(searchValue);
        renderItemsResults();
    } else if (currentSection === 'elements') {
        searchElements(searchValue);
        renderElementsResults();
    }
    updateResultsCount();
    
    // Debounce history updates to prevent duplicates
    // Clear previous timer
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    
    // Set new timer to update history after user stops typing
    searchDebounceTimer = setTimeout(() => {
        // Use replaceState for search changes to avoid cluttering history
        // Compare with previous state to see if search actually changed
        const previousState = history.state;
        const currentState = buildNavigationState();
        if (!previousState || previousState.searchQuery !== currentState.searchQuery) {
            pushHistoryState(currentState, true); // Use replaceState to avoid duplicates
        }
    }, SEARCH_DEBOUNCE_MS);
});

// Section card click handlers
// Game cards click handler
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        const game = card.dataset.game;
        showSectionsView(game);
    });
});

// Section cards click handler
document.querySelectorAll('.section-card').forEach(card => {
    card.addEventListener('click', () => {
        const section = card.dataset.section;
        showSection(section);
    });
});


// Help modal functionality
const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const closeHelp = document.getElementById('close-help');

helpButton.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
});

closeHelp.addEventListener('click', () => {
    helpModal.classList.add('hidden');
});

helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.classList.add('hidden');
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
        helpModal.classList.add('hidden');
    }
});

// No server to shut down - removed this functionality

// Initialize help content for the initial games view
updateHelpContent('games');

// Browser History API: Handle popstate event (back/forward buttons)
window.addEventListener('popstate', (e) => {
    // This event fires for both back and forward navigation
    if (e.state) {
        // Restore state from history (works for both back and forward)
        restoreStateFromHistory(e.state);
    } else {
        // No state in history, parse URL and restore
        // This happens when going back to an entry that was created before we started using state objects
        // or when the state object was lost
        const state = parseURL();
        if (state) {
            // Force restore even if we're already on this state, to ensure UI is correct
            restoreStateFromHistory(state, true);
            // After restoration completes (async), replace the current history entry with a proper state object
            // This ensures future back/forward navigation works correctly
            setTimeout(() => {
                if (!isRestoringState) {
                    const currentState = buildNavigationState();
                    // Replace the null-state entry with a proper state object
                    if (currentState.view === state.view && 
                        currentState.selectedId === state.selectedId &&
                        currentState.game === state.game) {
                        pushHistoryState(currentState, true); // Use replaceState
                    }
                }
            }, 500); // Wait for async restoration to complete
        }
    }
});

// Initialize: Check URL on page load
window.addEventListener('DOMContentLoaded', () => {
    // If there's already a state in history, use it
    if (history.state) {
        restoreStateFromHistory(history.state);
    } else {
        // Otherwise, parse URL and set initial state
        const state = parseURL();
        if (state.view !== 'games' || state.selectedId) {
            // Not on the games view, restore from URL
            restoreStateFromHistory(state);
        } else {
            // On games view, ensure it's properly initialized
            showGamesView();
            pushHistoryState(buildNavigationState(), true);
        }
    }
});

