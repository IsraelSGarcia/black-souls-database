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
        return `#/${state.game || 'black-souls-ii'}/sections`;
    } else if (state.view && state.selectedId) {
        const section = state.view;
        return `#/${state.game || 'black-souls-ii'}/${section}/${state.selectedId}`;
    } else if (state.view) {
        const section = state.view;
        return `#/${state.game || 'black-souls-ii'}/${section}`;
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
    if (isRestoringState) return;
    
    // If not replacing and not forcing, check if state actually changed to avoid duplicates
    if (!replace && !force && !hasStateChanged(state)) {
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
    
    if (state.view === 'games') {
        return 'Black Souls Database';
    } else if (state.view === 'sections') {
        return `${state.game || 'Black Souls II'} - Sections`;
    } else if (state.view && state.selectedId) {
        // Properly handle plural section names
        let sectionName = state.view;
        if (sectionName.endsWith('s')) {
            sectionName = sectionName.slice(0, -1); // Remove 's' from plural
        }
        sectionName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        return `${state.game || 'Black Souls II'} - ${sectionName} ${state.selectedId}`;
    } else if (state.view) {
        const sectionName = state.view.charAt(0).toUpperCase() + state.view.slice(1);
        return `${state.game || 'Black Souls II'} - ${sectionName}`;
    }
    return 'Black Souls Database';
}

// Restore state from history
function restoreStateFromHistory(state) {
    if (!state) return;
    
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
        
        // Restore view
        if (savedView === 'games') {
            showGamesView();
        } else if (savedView === 'sections') {
            showSectionsView(savedGame || 'Black Souls II');
        } else if (savedView) {
            // Restore section
            showSection(savedView, true); // preserveSearch = true
            
            // Restore search query and trigger search
            if (savedSearchQuery && searchInput) {
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
                    }
                    updateResultsCount(); // Update results count after search
                }, 100);
            } else {
                // No search query, but still update results count
                setTimeout(() => {
                    updateResultsCount();
                }, 100);
            }
            
            // Restore selection and scroll positions after a delay to ensure section is loaded
            if (savedSelectedId) {
                // Use a longer delay to ensure section is fully loaded
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
                            }
                        };
                        setTimeout(restoreScrolls, 100);
                    };
                    restoreSelection();
                }, 300); // Increased delay to ensure section is fully loaded
            } else {
                // Even if no selection, restore scroll positions
                setTimeout(() => {
                    if (resultsList) {
                        resultsList.scrollTop = savedResultsListScrollTop;
                    }
                    // Restore detail panel scroll with a longer delay to ensure content is rendered
                    setTimeout(() => {
                        if (detailPanel) {
                            detailPanel.scrollTop = savedDetailPanelScrollTop;
                        }
                    }, 100);
                }, 200);
            }
        }
    } finally {
        isRestoringState = false;
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
            return { view: 'sections', game: 'black-souls-ii' };
        } else if (parts.length === 1) {
            return { view: parts[0], game: 'black-souls-ii' };
        } else if (parts.length === 2) {
            const section = parts[0];
            const id = parseInt(parts[1]);
            if (!isNaN(id)) {
                return { view: section, selectedId: id, game: 'black-souls-ii' };
            }
        }
    }
    
    // Handle path-based URLs
    const parts = path.split('/').filter(p => p);
    
    if (parts.length === 0) {
        return { view: 'games' };
    } else if (parts.length === 1 && parts[0] === 'sections') {
        return { view: 'sections', game: 'black-souls-ii' };
    } else if (parts.length === 1) {
        const section = parts[0];
        if (['skills', 'states', 'weapons', 'armors', 'items', 'enemies'].includes(section)) {
            return { view: section, game: 'black-souls-ii' };
        }
    } else if (parts.length === 2) {
        const section = parts[0];
        const id = parseInt(parts[1]);
        if (!isNaN(id) && ['skills', 'states', 'weapons', 'armors', 'items', 'enemies'].includes(section)) {
            return { view: section, selectedId: id, game: 'black-souls-ii' };
        }
    } else if (parts.length === 3 && parts[0] === 'sections') {
        return { view: 'sections', game: parts[1] };
    } else if (parts.length === 3) {
        const game = parts[0];
        const section = parts[1];
        const id = parseInt(parts[2]);
        if (!isNaN(id) && ['skills', 'states', 'weapons', 'armors', 'items', 'enemies'].includes(section)) {
            return { view: section, selectedId: id, game: game };
        }
    } else if (parts.length === 2 && parts[1] === 'sections') {
        return { view: 'sections', game: parts[0] };
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
    const markerRegex = /\[\[(SKILL|STATE|WEAPON|ARMOR|ITEM|ENEMY):(\d+):([^\]]+)\]\]/g;
    
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
    
    // Always save current state to browser history before navigating via cross-reference
    // This ensures the navigation path is preserved for back/forward navigation
    // We need to push even if state hasn't changed, because we're about to navigate away
    // IMPORTANT: Build state BEFORE calling showSection, which changes currentSection
    if (!isRestoringState && targetSection && currentSection !== targetSection) {
        const currentState = buildNavigationState();
        // Always push before navigating - force push to preserve navigation path
        // This ensures we can go back to the exact state we were in
        pushHistoryState(currentState, false, true);
    }
    
    // Navigate to the appropriate section and select the item
    if (targetSection && currentSection !== targetSection) {
        // Navigating to a different section - showSection will clear search (expected)
        // Temporarily set isRestoringState to prevent showSection from pushing state
        // We already pushed the previous state above, and selectState will push the new state
        const wasRestoring = isRestoringState;
        isRestoringState = true; // Prevent showSection from pushing state
        showSection(targetSection);
        isRestoringState = wasRestoring; // Restore original value
        // Wait for section to load, then select and scroll
        setTimeout(() => {
            if (targetSection === 'skills') {
                selectSkill(parseInt(id));
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'states') {
                selectState(parseInt(id));
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'weapons') {
                selectWeapon(parseInt(id));
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'armors') {
                selectArmor(parseInt(id));
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'items') {
                selectItem(parseInt(id));
                scrollToSelectedItem(targetSection, parseInt(id));
            } else if (targetSection === 'enemies') {
                selectEnemy(parseInt(id));
                scrollToSelectedItem(targetSection, parseInt(id));
            }
        }, 200);
    } else {
        // Navigating within the same section - preserve search query
        if (targetSection === 'skills') {
            selectSkill(parseInt(id));
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'states') {
            selectState(parseInt(id));
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'weapons') {
            selectWeapon(parseInt(id));
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'armors') {
            selectArmor(parseInt(id));
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'items') {
            selectItem(parseInt(id));
            scrollToSelectedItem(targetSection, parseInt(id));
        } else if (targetSection === 'enemies') {
            selectEnemy(parseInt(id));
            scrollToSelectedItem(targetSection, parseInt(id));
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
    handleBackNavigation();
}


// DOM Elements
const gamesView = document.getElementById('games-view');
const sectionsView = document.getElementById('sections-view');
const searchSection = document.getElementById('search-section');
const mainContent = document.getElementById('main-content');
const backButton = document.getElementById('back-button');
const headerTitle = document.getElementById('header-title');
const headerSubtitle = document.getElementById('header-subtitle');

// Make header title clickable for navigation
headerTitle.classList.add('clickable-title');
headerTitle.addEventListener('click', () => {
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
});
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
                        </ul>
                    </section>
            
            <section class="help-section">
                <h3>Navigation</h3>
                <p>Click on a section card to view its contents. Use the back button (←) in the header to return to the game selection.</p>
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
    backButton.classList.add('hidden');
    
    headerTitle.textContent = 'Black Souls Database';
    headerSubtitle.textContent = 'Select a game to explore';
    
    currentGame = null;
    currentSection = null;
    
    updateHelpContent('games');
    
    // Update browser history
    if (!isRestoringState) {
        pushHistoryState(buildNavigationState());
    }
}

// Show Sections View for a selected game
function showSectionsView(gameName) {
    gamesView.classList.add('hidden');
    sectionsView.classList.remove('hidden');
    searchSection.classList.add('hidden');
    mainContent.classList.add('hidden');
    backButton.classList.remove('hidden');
    
    currentGame = gameName;
    currentSection = null;
    
    if (gameName === 'bs2') {
        headerTitle.textContent = 'Black Souls II Database';
        headerSubtitle.textContent = 'Select a section to explore';
    }
    
    // Reset search and selection
    searchInput.value = '';
    selectedSkillId = null;
    const placeholder = document.querySelector('.detail-placeholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
    detailContent.style.display = 'none';
    
    updateHelpContent('sections');
}

// Show Section Details (e.g., Skills, States)
// preserveSearch: if true, don't clear the search input
function showSection(sectionName, preserveSearch = false) {
    if (sectionName === 'skills') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        backButton.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Skills';
        headerSubtitle.textContent = 'Search and explore all skills from Black Souls II';
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'block' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
        }
        selectedSkillId = null;
        
        // Load skills if not already loaded
        if (allSkills.length === 0) {
            loadSkills();
        } else {
            renderResults();
        }
        
        updateHelpContent('skills');
    } else if (sectionName === 'states') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        backButton.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - States';
        headerSubtitle.textContent = 'Search and explore all status effects from Black Souls II';
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'block' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
        }
        selectedStateId = null;
        
        // Load states if not already loaded
        if (allStates.length === 0) {
            loadStates();
        } else {
            renderStatesResults();
        }
        
        updateHelpContent('states');
    } else if (sectionName === 'weapons') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        backButton.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Weapons';
        headerSubtitle.textContent = 'Search and explore all weapons from Black Souls II';
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'block' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
        }
        selectedWeaponId = null;
        
        // Load weapons if not already loaded
        if (allWeapons.length === 0) {
            loadWeapons();
        } else {
            renderWeaponsResults();
        }
        
        updateHelpContent('weapons');
    } else if (sectionName === 'armors') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        backButton.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Armors';
        headerSubtitle.textContent = 'Search and explore all armor and defensive equipment from Black Souls II';
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'block' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
        }
        selectedArmorId = null;
        
        // Load armors if not already loaded
        if (allArmors.length === 0) {
            loadArmors();
        } else {
            renderArmorsResults();
        }
        
        updateHelpContent('armors');
    } else if (sectionName === 'enemies') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        backButton.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Enemies';
        headerSubtitle.textContent = 'Search and explore all enemies and monsters from Black Souls II';
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'block' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
        }
        selectedEnemyId = null;
        
        // Load enemies if not already loaded
        if (allEnemies.length === 0) {
            loadEnemies();
        } else {
            renderEnemiesResults();
        }
        
        updateHelpContent('enemies');
    } else if (sectionName === 'items') {
        gamesView.classList.add('hidden');
        sectionsView.classList.add('hidden');
        searchSection.classList.remove('hidden');
        mainContent.classList.remove('hidden');
        backButton.classList.remove('hidden');
        
        currentSection = sectionName;
        
        headerTitle.textContent = 'Black Souls II Database - Items';
        headerSubtitle.textContent = 'Search and explore all consumable items and equipment from Black Souls II';
        
        // Ensure panels are visible
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = window.innerWidth > 1024 ? 'block' : 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Reset scroll positions
        if (resultsList) resultsList.scrollTop = 0;
        if (detailContent) detailContent.scrollTop = 0;
        
        // Clear search and selection (unless preserving search)
        if (!preserveSearch) {
            searchInput.value = '';
        }
        selectedItemId = null;
        
        // Load items if not already loaded
        if (allItems.length === 0) {
            loadItems();
        } else {
            renderItemsResults();
        }
        
        updateHelpContent('items');
    }
    
    // Update browser history
    if (!isRestoringState) {
        pushHistoryState(buildNavigationState());
    }
}

// Handle back button navigation
function handleBackNavigation() {
    // Always try browser history first - it's the source of truth
    // Check if we can go back by seeing if we're not at the initial state
    const currentState = history.state;
    
    // We can go back if:
    // 1. We have a state and it's not the initial games view (no selectedId, no searchQuery)
    // 2. OR history.length suggests we can go back
    const canGoBack = currentState && (
        (currentState.view !== 'games' || currentState.selectedId || currentState.searchQuery) ||
        history.length > 1
    );
    
    if (canGoBack) {
        // Use browser history - the popstate event will handle restoration
        history.back();
        return;
    }
    
    // If we can't go back in browser history, check if we're on a detail view
    // and can go back to the list view (mobile behavior)
    
    // If on mobile and viewing a detail, go back to list
    if (window.innerWidth <= 1024 && currentSection === 'skills' && selectedSkillId !== null) {
        // Back to list
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Clear selection
        selectedSkillId = null;
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Hide detail content, show placeholder
        document.querySelector('.detail-placeholder').style.display = 'flex';
        detailContent.style.display = 'none';
        
        return;
    }
    
    if (window.innerWidth <= 1024 && currentSection === 'states' && selectedStateId !== null) {
        // Back to list
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Clear selection
        selectedStateId = null;
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Hide detail content, show placeholder
        document.querySelector('.detail-placeholder').style.display = 'flex';
        detailContent.style.display = 'none';
        
        return;
    }
    
    if (window.innerWidth <= 1024 && currentSection === 'weapons' && selectedWeaponId !== null) {
        // Back to list
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Clear selection
        selectedWeaponId = null;
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Hide detail content, show placeholder
        document.querySelector('.detail-placeholder').style.display = 'flex';
        detailContent.style.display = 'none';
        
        return;
    }
    
    if (window.innerWidth <= 1024 && currentSection === 'armors' && selectedArmorId !== null) {
        // Back to list
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Clear selection
        selectedArmorId = null;
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Hide detail content, show placeholder
        document.querySelector('.detail-placeholder').style.display = 'flex';
        detailContent.style.display = 'none';
        
        return;
    }
    
    if (window.innerWidth <= 1024 && currentSection === 'enemies' && selectedEnemyId !== null) {
        // Back to list
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Clear selection
        selectedEnemyId = null;
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Hide detail content, show placeholder
        document.querySelector('.detail-placeholder').style.display = 'flex';
        detailContent.style.display = 'none';
        
        return;
    }
    
    if (window.innerWidth <= 1024 && currentSection === 'items' && selectedItemId !== null) {
        // Back to list
        document.querySelector('.results-panel').style.display = 'block';
        document.querySelector('.detail-panel').style.display = 'none';
        document.querySelector('.detail-panel').classList.remove('mobile-active');
        
        // Clear selection
        selectedItemId = null;
        document.querySelectorAll('.skill-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Hide detail content, show placeholder
        document.querySelector('.detail-placeholder').style.display = 'flex';
        detailContent.style.display = 'none';
        
        return;
    }
    
    if (currentSection) {
        // From section details -> back to sections
        showSectionsView(currentGame);
    } else if (currentGame) {
        // From sections -> back to games
        showGamesView();
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

// Search and filter skills
function searchSkills(query) {
    if (!query.trim()) {
        filteredSkills = allSkills;
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    filteredSkills = allSkills.filter(skill => {
        // Search in name
        if (skill.name.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in description
        if (skill.description.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in messages
        if (skill.message1.toLowerCase().includes(lowerQuery)) return true;
        if (skill.message2.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in note
        if (skill.note.english.toLowerCase().includes(lowerQuery)) return true;
        if (skill.note.japanese.toLowerCase().includes(lowerQuery)) return true;
        
        return false;
    });
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

// Update results count
function updateResultsCount() {
    const count = filteredSkills.length;
    resultsCount.textContent = `${count} skill${count !== 1 ? 's' : ''} found`;
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
    
    renderSkillDetail(skill);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'block';
        document.querySelector('.detail-panel').classList.add('mobile-active');
        
        // Update back button text
        backButton.querySelector('img').nextSibling.textContent = ' Back';
    }
    
    // Update browser history
    if (!isRestoringState) {
        pushHistoryState(buildNavigationState());
    }
}

// Render skill detail view
function renderSkillDetail(skill) {
    const iconPos = getIconPosition(skill.iconIndex, 1.5); // 48px = 32px * 1.5
    const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${skill.iconIndex}"` : '';
    
    const html = `
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
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
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
                const effect = skill.effects[effectIndex];
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
                    // Show original data
                    let originalData = `Code: ${effect.code}`;
                    
                    // Add any raw values that are present
                    if (effect.dataId !== undefined) originalData += `\nData ID: ${effect.dataId}`;
                    if (effect.value1 !== undefined) originalData += `\nValue 1: ${effect.value1}`;
                    if (effect.value2 !== undefined) originalData += `\nValue 2: ${effect.value2}`;
                    
                    // Add transformed values
                    if (effect.percent !== undefined) originalData += `\nPercent: ${effect.percent}%`;
                    if (effect.flat !== undefined) originalData += `\nFlat: ${effect.flat}`;
                    if (effect.chance !== undefined) originalData += `\nChance: ${effect.chance}%`;
                    if (effect.turns !== undefined) originalData += `\nTurns: ${effect.turns}`;
                    if (effect.stateName !== undefined) originalData += `\nState: ${effect.stateName}`;
                    if (effect.parameter !== undefined) originalData += `\nParameter: ${effect.parameter}`;
                    
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
                    <div class="stat-value">${skill.damage.element.name}</div>
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

// Render effects
function renderEffects(skill) {
    if (skill.effects.length === 0) return '';
    
    return `
        <div class="detail-section">
            <div class="section-title">Effects</div>
            ${skill.effects.map((effect, index) => {
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
    
    const lowerQuery = query.toLowerCase();
    
    filteredStates = allStates.filter(state => {
        // Search in name
        if (state.name.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in messages
        if (state.message1 && state.message1.toLowerCase().includes(lowerQuery)) return true;
        if (state.message2 && state.message2.toLowerCase().includes(lowerQuery)) return true;
        if (state.message3 && state.message3.toLowerCase().includes(lowerQuery)) return true;
        if (state.message4 && state.message4.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in traits descriptions
        if (state.traits.some(trait => trait.description && trait.description.toLowerCase().includes(lowerQuery))) return true;
        
        // Search in removal conditions
        if (state.removalConditions.some(cond => cond.toLowerCase().includes(lowerQuery))) return true;
        
        // Search in note
        if (state.note.english && state.note.english.toLowerCase().includes(lowerQuery)) return true;
        if (state.note.japanese && state.note.japanese.toLowerCase().includes(lowerQuery)) return true;
        
        return false;
    });
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
    
    renderStateDetail(state);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'block';
        document.querySelector('.detail-panel').classList.add('mobile-active');
    }
    
    // Update browser history
    if (!isRestoringState) {
        pushHistoryState(buildNavigationState());
    }
}

// Render state detail view
function renderStateDetail(state) {
    const iconPos = getIconPosition(state.iconIndex, 1.5); // 48px = 32px * 1.5
    const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${state.iconIndex}"` : '';
    
    const html = `
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
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
    
    // Add toggle handlers for trait original data
    const traitToggles = detailContent.querySelectorAll('.show-original-toggle[data-toggle="trait"]');
    traitToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const traitIndex = parseInt(toggle.dataset.traitIndex);
            const trait = state.traits[traitIndex];
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
    
    return `
        <div class="detail-section">
            <div class="section-title">Traits</div>
            ${state.traits.map((trait, index) => {
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

// Search and filter weapons
function searchWeapons(query) {
    if (!query.trim()) {
        filteredWeapons = allWeapons;
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    filteredWeapons = allWeapons.filter(weapon => {
        // Search in name
        if (weapon.name.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in description
        if (weapon.description && weapon.description.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in traits descriptions
        if (weapon.traits.some(trait => trait.description && trait.description.toLowerCase().includes(lowerQuery))) return true;
        
        // Search in note
        if (weapon.note.english && weapon.note.english.toLowerCase().includes(lowerQuery)) return true;
        if (weapon.note.japanese && weapon.note.japanese.toLowerCase().includes(lowerQuery)) return true;
        
        return false;
    });
}

// Search and filter armors
function searchArmors(query) {
    if (!query.trim()) {
        filteredArmors = allArmors;
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    filteredArmors = allArmors.filter(armor => {
        // Search in name
        if (armor.name.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in description
        if (armor.description && armor.description.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in traits descriptions
        if (armor.traits.some(trait => trait.description && trait.description.toLowerCase().includes(lowerQuery))) return true;
        
        // Search in note
        if (armor.note.english && armor.note.english.toLowerCase().includes(lowerQuery)) return true;
        if (armor.note.japanese && armor.note.japanese.toLowerCase().includes(lowerQuery)) return true;
        
        return false;
    });
}

// Search and filter enemies
function searchEnemies(query) {
    if (!query.trim()) {
        filteredEnemies = allEnemies;
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    filteredEnemies = allEnemies.filter(enemy => {
        // Search in name
        if (enemy.name.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in traits descriptions
        if (enemy.traits.some(trait => trait.description && trait.description.toLowerCase().includes(lowerQuery))) return true;
        
        // Search in skill names from actions
        if (enemy.actions.some(action => action.skillName && action.skillName.toLowerCase().includes(lowerQuery))) return true;
        
        // Search in note
        if (enemy.note.english && enemy.note.english.toLowerCase().includes(lowerQuery)) return true;
        if (enemy.note.japanese && enemy.note.japanese.toLowerCase().includes(lowerQuery)) return true;
        
        return false;
    });
}

// Search and filter items
function searchItems(query) {
    if (!query.trim()) {
        filteredItems = allItems;
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    filteredItems = allItems.filter(item => {
        // Search in name
        if (item.name.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in description
        if (item.description && item.description.toLowerCase().includes(lowerQuery)) return true;
        
        // Search in effects descriptions
        if (item.effects.some(effect => effect.description && effect.description.toLowerCase().includes(lowerQuery))) return true;
        
        // Search in note
        if (item.note.english && item.note.english.toLowerCase().includes(lowerQuery)) return true;
        if (item.note.japanese && item.note.japanese.toLowerCase().includes(lowerQuery)) return true;
        
        return false;
    });
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
    
    renderWeaponDetail(weapon);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'block';
        document.querySelector('.detail-panel').classList.add('mobile-active');
    }
    
    // Update browser history
    if (!isRestoringState) {
        pushHistoryState(buildNavigationState());
    }
}

// Render weapon detail view
function renderWeaponDetail(weapon) {
    const iconPos = getIconPosition(weapon.iconIndex, 1.5); // 48px = 32px * 1.5
    const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${weapon.iconIndex}"` : '';
    
    const html = `
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
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
    
    // Add toggle handlers for trait original data
    const traitToggles = detailContent.querySelectorAll('.show-original-toggle[data-toggle="trait"]');
    traitToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const traitIndex = parseInt(toggle.dataset.traitIndex);
            const trait = weapon.traits[traitIndex];
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
    
    return `
        <div class="detail-section">
            <div class="section-title">Traits</div>
            ${weapon.traits.map((trait, index) => {
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
    
    renderArmorDetail(armor);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'block';
        document.querySelector('.detail-panel').classList.add('mobile-active');
    }
    
    // Update browser history
    if (!isRestoringState) {
        pushHistoryState(buildNavigationState());
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
    
    renderEnemyDetail(enemy);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'block';
        document.querySelector('.detail-panel').classList.add('mobile-active');
    }
    
    // Update browser history
    if (!isRestoringState) {
        pushHistoryState(buildNavigationState());
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
    
    renderItemDetail(item);
    
    // On mobile, hide list and show only detail
    if (window.innerWidth <= 1024) {
        document.querySelector('.results-panel').style.display = 'none';
        document.querySelector('.detail-panel').style.display = 'block';
        document.querySelector('.detail-panel').classList.add('mobile-active');
    }
    
    // Update browser history
    if (!isRestoringState) {
        pushHistoryState(buildNavigationState());
    }
}

// Render armor detail view (similar to weapon detail)
function renderArmorDetail(armor) {
    const iconPos = getIconPosition(armor.iconIndex, 1.5);
    const iconStyle = iconPos !== 'none' ? `style="background-position: ${iconPos};" data-icon="${armor.iconIndex}"` : '';
    
    const html = `
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
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
    
    // Add toggle handlers (similar to weapon)
    const traitToggles = detailContent.querySelectorAll('.show-original-toggle[data-toggle="trait"]');
    traitToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const traitIndex = parseInt(toggle.dataset.traitIndex);
            const trait = armor.traits[traitIndex];
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
    
    return `
        <div class="detail-section">
            <div class="section-title">Traits</div>
            ${armor.traits.map((trait, index) => {
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
    
    const html = `
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
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
        if (detailContent) {
            detailContent.scrollTop = 0;
        }
    }, 0);
    
    // Add toggle handlers
    const traitToggles = detailContent.querySelectorAll('.show-original-toggle[data-toggle="trait"]');
    traitToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const traitIndex = parseInt(toggle.dataset.traitIndex);
            const trait = enemy.traits[traitIndex];
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
    
    return `
        <div class="detail-section">
            <div class="section-title">Traits</div>
            ${enemy.traits.map((trait, index) => {
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
    
    const html = `
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
    
    detailContent.innerHTML = html;
    
    // Scroll to top immediately
    if (detailContent) {
        detailContent.scrollTop = 0;
    }
    
    // Add event listeners for cross-reference links
    attachCrossReferenceListeners();
    
    // Ensure scroll after a brief delay (in case content shifts)
    setTimeout(() => {
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
    return `
        <div class="detail-section">
            <div class="section-title">Effects</div>
            ${item.effects.map(effect => `
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
                        <div class="stat-value">${item.damage.element}</div>
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

// Back button handler
backButton.addEventListener('click', () => {
    handleBackNavigation();
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
        // No state in history, parse URL
        const state = parseURL();
        restoreStateFromHistory(state);
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
            // On games view, set initial state
            pushHistoryState(buildNavigationState(), true);
        }
    }
});

