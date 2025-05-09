/**
 * Allah Intelligence - Quran Teaching Tool
 * Curriculum Module for Structured Learning Path
 */

// Global variables for curriculum
let isLearningMode = false;
let currentPathId = 1;
let currentLevelId = 1;
let currentVerseIndex = 0;

/**
 * Initialize the curriculum module
 */
function initCurriculum() {
    // DOM Elements
    const curriculumModeBtn = document.getElementById('curriculumModeBtn');
    const curriculumPanel = document.getElementById('curriculumPanel');
    const closeCurriculumBtn = document.getElementById('closeCurriculumBtn');
    const startLearningBtn = document.getElementById('startLearningBtn');
    const backToPathsBtn = document.getElementById('backToPathsBtn');
    const backToLevelsBtn = document.getElementById('backToLevelsBtn');
    
    // Event Listeners
    curriculumModeBtn.addEventListener('click', toggleCurriculumPanel);
    closeCurriculumBtn.addEventListener('click', toggleCurriculumPanel);
    startLearningBtn.addEventListener('click', startLearningMode);
    backToPathsBtn.addEventListener('click', showPathsView);
    backToLevelsBtn.addEventListener('click', showLevelsView);
    
    // Initialize the curriculum panel
    populateLearningPaths();
}

/**
 * Toggle the curriculum panel visibility
 */
function toggleCurriculumPanel() {
    const curriculumPanel = document.getElementById('curriculumPanel');
    const quizContainer = document.getElementById('quizContainer');
    
    // Hide quiz container if it's visible
    if (!quizContainer.classList.contains('hidden')) {
        quizContainer.classList.add('hidden');
    }
    
    // Toggle curriculum panel
    curriculumPanel.classList.toggle('hidden');
    
    // If opening the panel, make sure we're showing the paths view
    if (!curriculumPanel.classList.contains('hidden')) {
        showPathsView();
    }
}

/**
 * Show the learning paths view
 */
function showPathsView() {
    const pathsView = document.querySelector('.curriculum-paths');
    const levelsView = document.querySelector('.curriculum-levels');
    const versesView = document.querySelector('.curriculum-verses');
    
    pathsView.classList.remove('hidden');
    levelsView.classList.add('hidden');
    versesView.classList.add('hidden');
    
    // Refresh the paths data
    populateLearningPaths();
}

/**
 * Show the levels view for a specific path
 * @param {number} pathId - The ID of the path to show levels for
 */
function showLevelsView(pathId) {
    if (pathId) {
        currentPathId = pathId;
    }
    
    const pathsView = document.querySelector('.curriculum-paths');
    const levelsView = document.querySelector('.curriculum-levels');
    const versesView = document.querySelector('.curriculum-verses');
    
    pathsView.classList.add('hidden');
    levelsView.classList.remove('hidden');
    versesView.classList.add('hidden');
    
    // Update the path title
    const path = quranDatabase.curriculum.getPath(currentPathId);
    document.getElementById('currentPathTitle').textContent = path.name;
    
    // Populate the levels
    populateLevels(currentPathId);
}

/**
 * Show the verses view for a specific level
 * @param {number} levelId - The ID of the level to show verses for
 */
function showVersesView(levelId) {
    if (levelId) {
        currentLevelId = levelId;
    }
    
    const pathsView = document.querySelector('.curriculum-paths');
    const levelsView = document.querySelector('.curriculum-levels');
    const versesView = document.querySelector('.curriculum-verses');
    
    pathsView.classList.add('hidden');
    levelsView.classList.add('hidden');
    versesView.classList.remove('hidden');
    
    // Update the level title
    const path = quranDatabase.curriculum.getPath(currentPathId);
    const level = quranDatabase.curriculum.getLevel(path, currentLevelId);
    document.getElementById('currentLevelTitle').textContent = level.name;
    
    // Populate the verses
    populateVerses(currentPathId, currentLevelId);
}

/**
 * Populate the learning paths in the curriculum panel
 */
function populateLearningPaths() {
    const pathsContainer = document.querySelector('.curriculum-paths');
    pathsContainer.innerHTML = ''; // Clear existing content
    
    // Get paths from the database
    const paths = quranDatabase.curriculum.paths;
    
    // Create a card for each path
    paths.forEach(path => {
        // Update the path progress
        quranDatabase.curriculum.updatePathProgress(path.id);
        
        const pathCard = document.createElement('div');
        pathCard.className = `path-card ${path.completed ? 'completed' : ''}`;
        pathCard.innerHTML = `
            <h3>${path.name}</h3>
            <p>${path.description}</p>
            <div class="path-progress">
                <div class="path-progress-bar" style="width: ${path.progress}%"></div>
            </div>
            <div class="path-progress-text">${Math.round(path.progress)}% Complete</div>
        `;
        
        // Add click event to show levels for this path
        pathCard.addEventListener('click', () => showLevelsView(path.id));
        
        pathsContainer.appendChild(pathCard);
    });
}

/**
 * Populate the levels for a specific learning path
 * @param {number} pathId - The ID of the path to show levels for
 */
function populateLevels(pathId) {
    const levelsContainer = document.getElementById('levelsList');
    levelsContainer.innerHTML = ''; // Clear existing content
    
    // Get the path and its levels
    const path = quranDatabase.curriculum.getPath(pathId);
    
    if (!path || !path.levels) {
        return;
    }
    
    // Create a card for each level
    path.levels.forEach(level => {
        const levelCard = document.createElement('div');
        levelCard.className = `level-card ${level.unlocked ? '' : 'locked'} ${level.completed ? 'completed' : ''}`;
        levelCard.innerHTML = `
            <h4>${level.name}</h4>
            <p>${level.description}</p>
        `;
        
        // Add click event to show verses for this level (only if unlocked)
        if (level.unlocked) {
            levelCard.addEventListener('click', () => showVersesView(level.id));
        }
        
        levelsContainer.appendChild(levelCard);
    });
}

/**
 * Populate the verses for a specific level
 * @param {number} pathId - The ID of the path
 * @param {number} levelId - The ID of the level to show verses for
 */
function populateVerses(pathId, levelId) {
    const versesContainer = document.getElementById('versesList');
    versesContainer.innerHTML = ''; // Clear existing content
    
    // Get the path and level
    const path = quranDatabase.curriculum.getPath(pathId);
    const level = quranDatabase.curriculum.getLevel(path, levelId);
    
    if (!level || !level.verses) {
        return;
    }
    
    // Create a card for each verse
    level.verses.forEach((verseRef, index) => {
        // Get the full verse data
        const verse = quranDatabase.getVerseByReference(verseRef.surahNumber, verseRef.ayah);
        
        const verseCard = document.createElement('div');
        verseCard.className = 'verse-card';
        verseCard.innerHTML = `
            <div class="verse-number">${index + 1}</div>
            <div class="verse-info">
                <div class="verse-reference">${verse.surah} (${verse.surahNumber}:${verse.ayah})</div>
                <div class="verse-preview">${verse.translation}</div>
            </div>
        `;
        
        // Add click event to start learning from this verse
        verseCard.addEventListener('click', () => {
            // Set the current verse index
            currentVerseIndex = index;
            // Start learning mode
            startLearningMode();
        });
        
        versesContainer.appendChild(verseCard);
    });
}

/**
 * Start the learning mode with the current path, level, and verse
 */
function startLearningMode() {
    // Hide the curriculum panel
    document.getElementById('curriculumPanel').classList.add('hidden');
    
    // Set the learning mode flag
    isLearningMode = true;
    
    // Update the curriculum state
    quranDatabase.curriculum.currentPathId = currentPathId;
    quranDatabase.curriculum.currentLevelId = currentLevelId;
    quranDatabase.curriculum.currentVerseIndex = currentVerseIndex;
    
    // Get the current verse and display it
    loadCurriculumVerse();
    
    // Add learning mode indicator to the main content
    const mainContent = document.querySelector('.main-content');
    
    // Remove existing indicator if any
    const existingIndicator = document.querySelector('.learning-mode-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Add new indicator
    const path = quranDatabase.curriculum.getPath(currentPathId);
    const level = quranDatabase.curriculum.getLevel(path, currentLevelId);
    
    const indicator = document.createElement('div');
    indicator.className = 'learning-mode-indicator';
    indicator.innerHTML = `<i class="fas fa-graduation-cap"></i> Learning: ${path.name} - ${level.name}`;
    mainContent.appendChild(indicator);
    
    // Add navigation controls if they don't exist
    if (!document.querySelector('.learning-navigation')) {
        const navigation = document.createElement('div');
        navigation.className = 'learning-navigation';
        navigation.innerHTML = `
            <div class="learning-progress">
                <div class="learning-progress-bar">
                    <div class="learning-progress-fill" style="width: 0%"></div>
                </div>
                <span class="learning-progress-text">0%</span>
            </div>
            <button id="nextLessonBtn" class="control-btn primary-btn">
                <i class="fas fa-arrow-right"></i> Next Lesson
            </button>
        `;
        
        // Add event listener for next lesson button
        navigation.querySelector('#nextLessonBtn').addEventListener('click', nextCurriculumVerse);
        
        // Add to the quran display
        document.querySelector('.quran-display').appendChild(navigation);
    }
    
    // Update the progress bar
    updateLearningProgress();
}

/**
 * Load the current verse from the curriculum
 */
function loadCurriculumVerse() {
    // Get the current verse from the curriculum
    const verse = quranDatabase.curriculum.getCurrentVerse();
    
    if (!verse) {
        return;
    }
    
    // Update the global currentQuranText variable
    currentQuranText = verse;
    
    // Display the verse
    document.getElementById('quranText').textContent = verse.arabic;
    document.getElementById('transliteration').textContent = verse.transliteration;
    document.getElementById('translation').textContent = verse.translation;
    
    // Add verse info
    const verseInfo = document.createElement('div');
    verseInfo.className = 'verse-info';
    verseInfo.textContent = `${verse.surah} (${verse.surahNumber}:${verse.ayah})`;
    
    // Remove previous verse info if exists
    const existingVerseInfo = document.querySelector('.verse-info');
    if (existingVerseInfo) {
        existingVerseInfo.remove();
    }
    
    // Append verse info after translation
    const translation = document.getElementById('translation');
    translation.parentNode.insertBefore(verseInfo, translation.nextSibling);
    
    // Update the progress bar
    updateLearningProgress();
}

/**
 * Move to the next verse in the curriculum
 */
function nextCurriculumVerse() {
    // Get the next verse from the curriculum
    const verse = quranDatabase.curriculum.nextVerse();
    
    if (!verse) {
        return;
    }
    
    // Update the current indices
    currentPathId = quranDatabase.curriculum.currentPathId;
    currentLevelId = quranDatabase.curriculum.currentLevelId;
    currentVerseIndex = quranDatabase.curriculum.currentVerseIndex;
    
    // Load the verse
    loadCurriculumVerse();
    
    // Update the learning mode indicator
    const path = quranDatabase.curriculum.getPath(currentPathId);
    const level = quranDatabase.curriculum.getLevel(path, currentLevelId);
    
    const indicator = document.querySelector('.learning-mode-indicator');
    if (indicator) {
        indicator.innerHTML = `<i class="fas fa-graduation-cap"></i> Learning: ${path.name} - ${level.name}`;
    }
}

/**
 * Update the learning progress bar
 */
function updateLearningProgress() {
    const path = quranDatabase.curriculum.getPath(currentPathId);
    const level = quranDatabase.curriculum.getLevel(path, currentLevelId);
    
    if (!level || !level.verses) {
        return;
    }
    
    // Calculate progress within the current level
    const progress = ((currentVerseIndex + 1) / level.verses.length) * 100;
    
    // Update the progress bar
    const progressFill = document.querySelector('.learning-progress-fill');
    const progressText = document.querySelector('.learning-progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}% of Level ${currentLevelId}`;
    }
}

/**
 * Exit learning mode
 */
function exitLearningMode() {
    // Reset learning mode flag
    isLearningMode = false;
    
    // Remove learning mode indicator
    const indicator = document.querySelector('.learning-mode-indicator');
    if (indicator) {
        indicator.remove();
    }
    
    // Remove navigation controls
    const navigation = document.querySelector('.learning-navigation');
    if (navigation) {
        navigation.remove();
    }
}

// Initialize the curriculum module when the DOM is loaded
document.addEventListener('DOMContentLoaded', initCurriculum);
