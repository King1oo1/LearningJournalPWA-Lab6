// js/script.js - Main Application Logic for Lab 6: Flask Backend Integration

// ===== HEADER STRUCTURE MANAGEMENT =====
function ensureHeaderStructure() {
    console.log('Ensuring header structure for all entries...');
    
    document.querySelectorAll('.journal-entry').forEach((entry, index) => {
        const header = entry.querySelector('.collapsible-header');
        if (!header) return;
        
        // Check if header already has proper structure
        const existingTitle = header.querySelector('h2');
        const existingSpacer = header.querySelector('.header-spacer');
        const existingActions = header.querySelector('.entry-actions');
        
        // Get title text
        let titleText = existingTitle ? existingTitle.textContent : header.textContent.trim();
        
        // Clear header and rebuild with proper structure
        header.innerHTML = '';
        
        // Create title element
        const title = document.createElement('h2');
        title.textContent = titleText;
        header.appendChild(title);
        
        // Create spacer element
        const spacer = document.createElement('div');
        spacer.className = 'header-spacer';
        header.appendChild(spacer);
        
        // Create actions container
        const entryActions = document.createElement('div');
        entryActions.className = 'entry-actions';
        
        // Create toggle icon
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'toggle-icon';
        toggleIcon.textContent = '▼';
        toggleIcon.setAttribute('aria-label', 'Toggle section');
        entryActions.appendChild(toggleIcon);
        
        // Add edit button only for local entries
        const isLocalEntry = entry.getAttribute('data-is-new') === 'true';
        if (isLocalEntry) {
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '✏️ Edit';
            editBtn.setAttribute('type', 'button');
            entryActions.appendChild(editBtn);
        }
        
        // Add copy button for ALL entries
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.setAttribute('type', 'button');
        entryActions.appendChild(copyBtn);
        
        // Add delete button for Flask entries
        const isFlaskEntry = entry.getAttribute('data-source') === 'flask';
        if (isFlaskEntry) {
            const flaskIndex = entry.getAttribute('data-flask-index');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-flask-btn';
            deleteBtn.innerHTML = '🗑️ Delete';
            deleteBtn.setAttribute('type', 'button');
            deleteBtn.setAttribute('data-index', flaskIndex);
            entryActions.appendChild(deleteBtn);
        }
        
        header.appendChild(entryActions);
        
        console.log(`Header structure ensured for: ${titleText}`);
    });
}

// ===== EDIT JOURNAL ENTRIES FUNCTIONALITY =====
function initEditFunctionality() {
    console.log('Initializing edit functionality...');
    
    // Use event delegation for edit buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const editBtn = e.target.classList.contains('edit-btn') ? e.target : e.target.closest('.edit-btn');
            const entry = editBtn.closest('.journal-entry');
            
            if (entry && entry.getAttribute('data-is-new') === 'true') {
                e.stopPropagation();
                toggleEditMode(entry);
            }
        }
    });
}

function toggleEditMode(entry) {
    const isEditing = entry.classList.contains('edit-mode');
    
    if (isEditing) {
        // Save changes
        const titleInput = entry.querySelector('.edit-title');
        const contentTextarea = entry.querySelector('.edit-content');
        const title = titleInput.value.trim();
        const content = contentTextarea.value.trim();
        
        if (!title) {
            alert('Title cannot be empty!');
            titleInput.focus();
            return;
        }
        
        if (!content) {
            alert('Content cannot be empty!');
            contentTextarea.focus();
            return;
        }
        
        // Update display
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        entry.querySelector('.collapsible-header').replaceChild(titleElement, titleInput);
        
        const contentElement = document.createElement('div');
        contentElement.className = 'entry-content';
        contentElement.innerHTML = content.replace(/\n/g, '<br>');
        entry.querySelector('.collapsible-content').replaceChild(contentElement, contentTextarea);
        
        entry.classList.remove('edit-mode');
        entry.querySelector('.edit-btn').innerHTML = '✏️ Edit';
        
        // Save to localStorage
        saveJournalEntries();
        
        // Show success message
        showSuccessMessage('Journal entry updated successfully!');
    } else {
        // Enter edit mode
        const title = entry.querySelector('h2').textContent;
        const content = entry.querySelector('.entry-content').textContent;
        
        // Create edit inputs
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.className = 'edit-title';
        titleInput.value = title;
        titleInput.style.cssText = `
            width: 100%;
            padding: 0.5rem;
            border: 2px solid #3498db;
            border-radius: 4px;
            font-size: 1.3rem;
            font-weight: 600;
            background: var(--card-bg);
            color: var(--text-color);
            margin-bottom: 1rem;
        `;
        
        const contentTextarea = document.createElement('textarea');
        contentTextarea.className = 'edit-content';
        contentTextarea.value = content;
        contentTextarea.style.cssText = `
            width: 100%;
            height: 200px;
            padding: 1rem;
            border: 2px solid #27ae60;
            border-radius: 4px;
            font-family: inherit;
            font-size: 1rem;
            line-height: 1.6;
            background: var(--card-bg);
            color: var(--text-color);
            resize: vertical;
        `;
        
        // Replace content with inputs
        const header = entry.querySelector('.collapsible-header');
        header.replaceChild(titleInput, entry.querySelector('h2'));
        
        const contentContainer = entry.querySelector('.collapsible-content');
        contentContainer.replaceChild(contentTextarea, entry.querySelector('.entry-content'));
        
        entry.classList.add('edit-mode');
        entry.querySelector('.edit-btn').innerHTML = '💾 Save';
        
        // Focus on title input
        titleInput.focus();
    }
}

// ===== ENHANCED DELETE FUNCTIONALITY - FIXED =====
function initDeleteFunctionality() {
    console.log('Initializing delete functionality...');
    
    // Use event delegation for delete buttons
    document.addEventListener('click', function(e) {
        // Check if click is on delete button or its children
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const entry = deleteBtn.closest('.journal-entry');
            
            if (entry && entry.getAttribute('data-is-new') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                
                const entryId = deleteBtn.getAttribute('data-entry-id') || entry.getAttribute('data-entry-id');
                console.log('Delete button clicked for entry:', entryId);
                showDeleteConfirmation(entryId);
            }
        }
    });
}

function showDeleteConfirmation(entryId) {
    console.log('Showing delete confirmation for:', entryId);
    
    // Create confirmation dialog
    const confirmationHTML = `
        <div class="delete-confirmation">
            <div class="confirmation-dialog">
                <h3>🗑️ Delete Journal Entry</h3>
                <p>Are you sure you want to delete this journal entry? This action cannot be undone and the entry will be permanently removed from local storage.</p>
                <div class="confirmation-actions">
                    <button class="cancel-delete-btn" onclick="closeDeleteConfirmation()">
                        ↩️ Keep Entry
                    </button>
                    <button class="confirm-delete-btn" onclick="confirmDeleteEntry('${entryId}')">
                        🗑️ Delete Permanently
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    
    // Add escape key listener
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeDeleteConfirmation();
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Store the handler for cleanup
    document.currentDeleteEscapeHandler = escapeHandler;
}

function closeDeleteConfirmation() {
    const confirmation = document.querySelector('.delete-confirmation');
    if (confirmation) {
        confirmation.remove();
    }
    
    // Clean up escape key listener
    if (document.currentDeleteEscapeHandler) {
        document.removeEventListener('keydown', document.currentDeleteEscapeHandler);
        document.currentDeleteEscapeHandler = null;
    }
}

function confirmDeleteEntry(entryId) {
    console.log('Confirming deletion for:', entryId);
    
    const entry = document.querySelector(`[data-entry-id="${entryId}"]`);
    const deleteBtn = entry ? entry.querySelector('.delete-btn') : null;
    
    if (entry) {
        // Show processing state
        if (deleteBtn) {
            deleteBtn.classList.add('processing');
            deleteBtn.innerHTML = '⏳ Deleting...';
        }
        
        setTimeout(() => {
            // Add fade out animation
            entry.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            entry.style.opacity = '0';
            entry.style.transform = 'translateX(-100px)';
            entry.style.maxHeight = '0';
            entry.style.overflow = 'hidden';
            entry.style.marginBottom = '0';
            
            setTimeout(() => {
                entry.remove();
                saveJournalEntries();
                updateReflectionCounter();
                
                // Show success message
                showSuccessMessage('Journal entry deleted successfully!');
                
                // Close confirmation dialog
                closeDeleteConfirmation();
            }, 500);
        }, 1000);
    } else {
        console.error('Entry not found for deletion:', entryId);
        showErrorMessage('Error: Entry not found for deletion');
        closeDeleteConfirmation();
    }
}

// ===== ENHANCED FORM VALIDATION =====
function initFormValidation() {
    const journalForm = document.getElementById('journal-form');
    
    if (journalForm) {
        // Add input event for character count
        const entryInput = document.getElementById('journal-entry');
        if (entryInput) {
            entryInput.addEventListener('input', function() {
                updateWordCount(this.value);
            });
        }
        
        journalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const titleInput = document.getElementById('journal-title');
            const entryInput = document.getElementById('journal-entry');
            const title = titleInput.value.trim();
            const content = entryInput.value.trim();
            
            // Validation
            if (!title) {
                alert('Please enter a title for your journal entry.');
                titleInput.focus();
                return false;
            }
            
            if (content.length < 50) {
                alert(`Please write at least 50 characters. You currently have ${content.length} characters.`);
                entryInput.focus();
                return false;
            }
            
            // Create and save new entry
            const now = new Date();
            const dateString = now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const newEntryHTML = createLocalJournalEntry(title, content, dateString);
            const journalFormSection = document.querySelector('.journal-form-section');
            if (journalFormSection) {
                journalFormSection.insertAdjacentHTML('afterend', newEntryHTML);
            }
            
            // Re-initialize features for new entry
            ensureHeaderStructure();
            initCollapsibleSections();
            initEditFunctionality();
            initDeleteFunctionality();
            initClipboardAPI();
            saveJournalEntries();
            updateReflectionCounter();
            
            showSuccessMessage('Journal entry added successfully!');
            journalForm.reset();
            updateWordCount('');
            
            return true;
        });
    }
}

function updateWordCount(text) {
    let wordCountEl = document.getElementById('word-count');
    if (!wordCountEl) {
        wordCountEl = document.createElement('div');
        wordCountEl.id = 'word-count';
        wordCountEl.className = 'word-count';
        const entryInput = document.getElementById('journal-entry');
        if (entryInput) {
            entryInput.parentNode.appendChild(wordCountEl);
        }
    }
    
    const charCount = text.length;
    wordCountEl.textContent = `Character count: ${charCount}/50`;
    wordCountEl.className = `word-count ${charCount >= 50 ? 'valid' : 'invalid'}`;
}

// Enhanced journal entry creation with edit functionality
function createLocalJournalEntry(title, content, date, entryId = null) {
    const id = entryId || 'local-' + Date.now();
    
    return `
        <article class="journal-entry collapsible" data-entry-id="${id}" data-is-new="true">
            <div class="collapsible-header">
                <h2>${title}</h2>
                <div class="header-spacer"></div>
                <div class="entry-actions">
                    <span class="toggle-icon">▼</span>
                    <button class="edit-btn" type="button">✏️ Edit</button>
                    <button class="copy-btn" type="button">📋 Copy</button>
                </div>
            </div>
            <div class="collapsible-content">
                <div class="entry-meta">${date} • Local Storage</div>
                <div class="entry-content">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                <div style="margin-top: 1.5rem; text-align: center;">
                    <button class="delete-btn" type="button" data-entry-id="${id}">
                        🗑️ Delete Entry
                    </button>
                </div>
            </div>
        </article>
    `;
}

// ===== COLLAPSIBLE SECTIONS - FIXED =====
function initCollapsibleSections() {
    console.log('Initializing collapsible sections...');
    
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    
    collapsibleHeaders.forEach((header, index) => {
        // Remove any existing event listeners by cloning and replacing
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        // Get the fresh header and its content
        const freshHeader = document.querySelectorAll('.collapsible-header')[index];
        const content = freshHeader.nextElementSibling;
        
        if (content && content.classList.contains('collapsible-content')) {
            // Set initial state - all collapsed
            content.style.display = 'none';
            freshHeader.classList.remove('active');
            
            // Add click event to header
            freshHeader.addEventListener('click', function(e) {
                // Don't trigger if click was on buttons
                if (e.target.closest('.copy-btn') || 
                    e.target.closest('.edit-btn') || 
                    e.target.closest('.delete-btn') ||
                    e.target.closest('.delete-flask-btn')) {
                    return;
                }
                
                console.log('Collapsible header clicked');
                
                // Toggle the content visibility
                const isVisible = content.style.display === 'block';
                
                if (isVisible) {
                    content.style.display = 'none';
                    this.classList.remove('active');
                } else {
                    content.style.display = 'block';
                    this.classList.add('active');
                }
            });
        }
    });
    
    console.log(`Initialized ${collapsibleHeaders.length} collapsible sections`);
}

// ===== REUSABLE NAVIGATION =====
function loadNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const navHTML = `
    <nav class="navbar">
        <div class="nav-container">
            <a href="/" class="nav-logo">Chandandeep Singh</a>
            
            <input type="checkbox" id="nav-toggle" class="nav-toggle">
            <label for="nav-toggle" class="nav-toggle-label">
                <span></span>
                <span></span>
                <span></span>
            </label>
            
            <ul class="nav-menu">
                <li><a href="/" class="${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">Home</a></li>
                <li><a href="/journal" class="${currentPage === 'journal.html' ? 'active' : ''}">Journal</a></li>
                <li><a href="/about" class="${currentPage === 'about.html' ? 'active' : ''}">About</a></li>
                <li><a href="/projects" class="${currentPage === 'projects.html' ? 'active' : ''}">Projects</a></li>
            </ul>
        </div>
    </nav>`;
    
    // Insert navigation at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// ===== LIVE DATE DISPLAY =====
function displayLiveDate() {
    const dateElement = document.getElementById('live-date');
    if (dateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// ===== SUCCESS MESSAGE FUNCTION =====
function showSuccessMessage(message) {
    // Create success notification
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(39, 174, 96, 0.4);
        z-index: 1001;
        animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 300px;
    `;
    
    successMsg.innerHTML = `✅ ${message}`;
    document.body.appendChild(successMsg);
    
    // Auto remove after animation
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 3000);
}

// ===== FLASK FEATURES INITIALIZATION =====
async function initFlaskFeatures() {
    console.log('Initializing Flask features...');
    
    try {
        // Initialize Flask form
        if (typeof initFlaskForm === 'function') {
            initFlaskForm();
        }
        
        // Fetch and display Flask reflections
        const flaskReflections = await fetchFlaskReflections();
        displayFlaskReflections(flaskReflections);
        
        // Update counter
        updateReflectionCounter();
        
    } catch (error) {
        console.error('Error initializing Flask features:', error);
    }
}

// ===== ENHANCED INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing enhanced features for Lab 6');
    
    // Load reusable navigation first
    loadNavigation();
    
    // Initialize basic features
    displayLiveDate();
    initThemeSwitcher();
    initFormValidation();
    initEnhancedValidation();
    initYouTubeAPI();
    
    // Load saved entries and initialize components with proper timing
    setTimeout(() => {
        console.log('Loading saved entries and initializing components...');
        
        // Load saved local entries first
        const localEntries = loadJournalEntries();
        if (localEntries && localEntries.length > 0) {
            displayLocalEntries(localEntries);
        }
        
        // Then load Flask entries
        initFlaskFeatures();
        
        // Then ensure proper structure (THIS FIXES COPY BUTTONS)
        ensureHeaderStructure();
        
        // Initialize interactive components
        initCollapsibleSections();
        initClipboardAPI();
        initEditFunctionality();
        initDeleteFunctionality();
        
        console.log('All enhanced features initialized successfully!');
        
        // Show Flask backend status
        console.log('🚀 Flask Backend Ready - Lab 6 Features Active');
        
    }, 100);
});

// Add keyframes for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    .youtube-controls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.8rem;
        max-width: 500px;
        margin: 0 auto;
    }
    
    .yt-control-btn {
        background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
        color: white;
        border: none;
        padding: 0.8rem 0.5rem;
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        font-size: 0.9rem;
        box-shadow: 0 3px 10px rgba(255, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: center;
        min-width: 100px;
    }
    
    .yt-control-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 15px rgba(255, 0, 0, 0.4);
    }
    
    .pause-btn {
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
        box-shadow: 0 3px 10px rgba(52, 152, 219, 0.3) !important;
    }
    
    .stop-btn {
        background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
        box-shadow: 0 3px 10px rgba(231, 76, 60, 0.3) !important;
    }
    
    .mute-btn, .unmute-btn {
        background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%) !important;
        box-shadow: 0 3px 10px rgba(149, 165, 166, 0.3) !important;
    }
    
    .word-count {
        font-size: 0.8rem;
        font-style: italic;
        margin-top: 0.25rem;
    }
    
    .word-count.valid {
        color: #27ae60;
    }
    
    .word-count.invalid {
        color: #e74c3c;
    }
    
    /* Flask entry styling */
    .journal-entry[data-source="flask"] {
        border-left: 4px solid #9b59b6;
    }
    
    .journal-entry[data-source="flask"] .collapsible-header {
        background: linear-gradient(135deg, #f8f9fa 0%, #f4ecf7 100%);
    }
    
    .dark-theme .journal-entry[data-source="flask"] {
        border-left-color: #8e44ad;
    }
    
    .dark-theme .journal-entry[data-source="flask"] .collapsible-header {
        background: linear-gradient(135deg, #2d2d2d 0%, #2c1e2e 100%);
    }
    
    .delete-flask-btn {
        background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(155, 89, 182, 0.3);
        display: flex;
        align-items: center;
        gap: 0.4rem;
        flex-shrink: 0;
        white-space: nowrap;
    }
    
    .delete-flask-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(155, 89, 182, 0.4);
        background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
    }
`;
document.head.appendChild(style);

// Make functions globally available
window.confirmDeleteEntry = confirmDeleteEntry;
window.closeDeleteConfirmation = closeDeleteConfirmation;
window.showSuccessMessage = showSuccessMessage;
window.showErrorMessage = showErrorMessage;