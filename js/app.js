/**
 * Allah Intelligence - Quran Teaching Tool
 * Main Application JavaScript
 * Updated with dark mode and comprehensive Quran database integration
 */

// Global variables
let currentMode = 'arabic'; // 'arabic' or 'english'
let currentDifficulty = 'beginner';
let currentQuranText = null;
let currentScore = 0;
let apiKey = '';
let recordedAudio = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Settings panel toggle functionality
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettings = document.getElementById('closeSettings');
    
    if (settingsToggle && settingsPanel && closeSettings) {
        // Create and show settings hint if not previously dismissed
        let settingsHint = null;
        if (localStorage.getItem('settingsHintDismissed') !== 'true') {
            settingsHint = document.createElement('div');
            settingsHint.className = 'settings-hint';
            settingsHint.innerHTML = `
                <div class="settings-hint-arrow"></div>
                <button class="settings-hint-close">&times;</button>
                <div class="settings-hint-text">Click here to access settings</div>
            `;
            document.body.appendChild(settingsHint);
            
            // Add event listener to close button
            const closeHintBtn = settingsHint.querySelector('.settings-hint-close');
            closeHintBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                settingsHint.style.display = 'none';
                localStorage.setItem('settingsHintDismissed', 'true');
            });
        }
        
        settingsToggle.addEventListener('click', function() {
            settingsPanel.classList.add('active');
            // Hide settings hint when settings panel is opened
            if (settingsHint) {
                settingsHint.style.display = 'none';
                localStorage.setItem('settingsHintDismissed', 'true');
            }
        });
        
        closeSettings.addEventListener('click', function() {
            settingsPanel.classList.remove('active');
        });
        
        // Moved to before the click handler
    }
    
    // Transcription area toggle functionality
    const transcriptionHeader = document.getElementById('transcriptionHeader');
    const recognitionText = document.getElementById('recognitionText');
    const transcriptionToggle = document.getElementById('transcriptionToggle');
    
    if (transcriptionHeader && recognitionText && transcriptionToggle) {
        transcriptionHeader.addEventListener('click', function() {
            recognitionText.classList.toggle('expanded');
            transcriptionToggle.classList.toggle('fa-chevron-down');
            transcriptionToggle.classList.toggle('fa-chevron-up');
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('checkbox');
    
    // Check for saved theme preference or prefer-color-scheme
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    // Apply saved theme or system preference
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }
    
    // Theme toggle event listener
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    });
    // Mode buttons
    const arabicModeBtn = document.getElementById('arabicModeBtn');
    const englishModeBtn = document.getElementById('englishModeBtn');
    const quizModeBtn = document.getElementById('quizModeBtn');
    
    // Control buttons
    const playBtn = document.getElementById('playBtn');
    const nextBtn = document.getElementById('nextBtn');
    const recordBtn = document.getElementById('recordBtn');
    const playRecordingBtn = document.getElementById('playRecordingBtn');
    const toggleTranslationBtn = document.getElementById("toggleTranslationBtn");
    
    // Display elements
    const quranText = document.getElementById('quranText');
    const transliteration = document.getElementById('transliteration');
    const translation = document.getElementById('translation');
    const apiKeyFeedback = document.getElementById('apiKeyFeedback');
    const recordingStatus = document.getElementById('recordingStatus');
    
    // Quiz elements
    const quizContainer = document.getElementById('quizContainer');
    const closeQuizBtn = document.getElementById('closeQuizBtn');
    const quizDifficultyLevel = document.getElementById('quizDifficultyLevel');
    
    // Settings elements
    const difficultyLevel = document.getElementById('difficultyLevel');
    
    // Initialize the application
    initApp();
    
    // Event Listeners
    arabicModeBtn.addEventListener('click', () => setMode('arabic'));
    englishModeBtn.addEventListener('click', () => setMode('english'));
    
    playBtn.addEventListener('click', playCurrentText);
    nextBtn.addEventListener('click', loadNextQuranText);
    recordBtn.addEventListener('click', toggleRecording);
    playRecordingBtn.addEventListener('click', playRecordedAudio);
    
    // Quiz mode toggle
    quizModeBtn.addEventListener('click', toggleQuizMode);
    closeQuizBtn.addEventListener('click', toggleQuizMode);
    
    // Sync difficulty levels between main app and quiz
    difficultyLevel.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        quizDifficultyLevel.value = currentDifficulty;
        loadNextQuranText();
    });
    
    quizDifficultyLevel.addEventListener('change', (e) => {
        currentDifficulty = e.target.value;
        difficultyLevel.value = currentDifficulty;
    });
    
    // API key handling removed - now handled through Cloudflare worker
    

});

/**
 * Initialize the application
 */
function initApp() {
    // Initialize transcription service
    if (typeof initTranscriptionService === 'function') {
        initTranscriptionService();
    }
    
    // Load initial Quran text
    loadNextQuranText();
}

/**
 * Set the current mode (Arabic or English)
 */
function setMode(mode) {
    currentMode = mode;
    updateToggleControlsVisibility();
    
    // Update UI
    document.getElementById('arabicModeBtn').classList.toggle('active', mode === 'arabic');
    document.getElementById('englishModeBtn').classList.toggle('active', mode === 'english');
    
    // Hide Quiz mode if it's visible
    const quizContainer = document.getElementById('quizContainer');
    if (!quizContainer.classList.contains('hidden')) {
        quizContainer.classList.add('hidden');
        
        // Show main content since we're exiting quiz mode
        document.querySelector('.main-content').style.display = 'flex';
    }
    
    // Hide Curriculum panel if it's visible
    const curriculumPanel = document.getElementById('curriculumPanel');
    if (!curriculumPanel.classList.contains('hidden')) {
        curriculumPanel.classList.add('hidden');
    }
    
    // Reload text with new mode
    loadNextQuranText();
}

/**
 * Load the next Quran text based on current mode and difficulty
 * Uses the comprehensive Quran database
 */
function loadNextQuranText() {
    // Get verse from the comprehensive database if available, fallback to original data
    if (typeof quranDatabase !== 'undefined') {
        currentQuranText = quranDatabase.getRandomVerseByDifficulty(currentDifficulty);
    } else {
        currentQuranText = getRandomQuranText(currentDifficulty);
    }
    
    if (currentMode === 'arabic') {
        // Get tajweed settings
        const showTajweed = localStorage.getItem('showTajweed') !== 'false';
        
        // Apply Tajweed highlighting if enabled
        if (showTajweed && window.tajweedModule) {
            document.getElementById('quranText').innerHTML = window.tajweedModule.applyTajweedHighlighting(currentQuranText.arabic, false);
        } else {
            document.getElementById('quranText').textContent = currentQuranText.arabic;
        }
        
        document.getElementById('transliteration').textContent = currentQuranText.transliteration;
        document.getElementById('translation').textContent = currentQuranText.translation;
        
        // Add surah and ayah information if available
        const verseInfo = document.createElement('div');
        verseInfo.className = 'verse-info';
        verseInfo.textContent = `${currentQuranText.surah} (${currentQuranText.surahNumber || ''}:${currentQuranText.ayah})`;
        
        // Remove previous verse info if exists
        const existingVerseInfo = document.querySelector('.verse-info');
        if (existingVerseInfo) {
            existingVerseInfo.remove();
        }
        
        // Append verse info after translation
        const translation = document.getElementById('translation');
        translation.parentNode.insertBefore(verseInfo, translation.nextSibling);
        
        // Add Tajweed toggle if it doesn't exist
        if (!document.getElementById('tajweedToggle')) {
            const toggleControls = document.getElementById('toggleControls');
            const tajweedToggle = document.createElement('div');
            tajweedToggle.className = 'toggle-box bottom-right-tajweed';
            tajweedToggle.innerHTML = `
                <input type="checkbox" id="tajweedToggle" ${showTajweed ? 'checked' : ''}>
                <label for="tajweedToggle">Show Tajweed rules</label>
            `;
            toggleControls.appendChild(tajweedToggle);
            
            // Add event listener for Tajweed toggle
            document.getElementById('tajweedToggle').addEventListener('change', toggleTajweed);
        }
    } else {
        document.getElementById('quranText').textContent = currentQuranText.translation;
        document.getElementById('transliteration').textContent = '';
        document.getElementById('translation').textContent = '';
        
        // Remove verse info in English mode
        const existingVerseInfo = document.querySelector('.verse-info');
        if (existingVerseInfo) {
            existingVerseInfo.remove();
        }
    }
}

/**
 * Play the current Quran text using text-to-speech
 */
async function playCurrentText() {
    if (!currentQuranText) return;
    
    // Show loading state
    const playBtn = document.getElementById('playBtn');
    const originalBtnText = playBtn.innerHTML;
    playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    playBtn.disabled = true;
    
    let textToSpeak = currentMode === 'arabic' ? 
        currentQuranText.arabic : 
        currentQuranText.translation;
    
    // Select appropriate voice based on mode
    const voice = currentMode === 'arabic' ? 'nova' : 'onyx';
    
    try {
        // Use OpenAI's TTS API through Cloudflare Worker
        const audioUrl = await generateSpeech(textToSpeak, voice);
        
        if (audioUrl) {
            // Create audio element and play
            const audio = new Audio(audioUrl);
            audio.play();
        } else {
            // Fallback to Web Speech API
            useWebSpeechAPI(textToSpeak);
        }
    } catch (error) {
        console.error('Error playing audio:', error);
        showFeedback('Error playing audio: ' + error.message, 'error');
        
        // Fallback to Web Speech API
        useWebSpeechAPI(textToSpeak);
    } finally {
        // Restore button state
        playBtn.innerHTML = originalBtnText;
        playBtn.disabled = false;
    }
}

/**
 * Fallback to use Web Speech API for text-to-speech
 * @param {string} text - The text to speak
 */
function useWebSpeechAPI(text) {
    // Use the Web Speech API for text-to-speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language based on mode
    utterance.lang = currentMode === 'arabic' ? 'ar-SA' : 'en-US';
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
}

function toggleTranslation(){
const isHidden = translation.style.display === "none" && currentMode === "arabic"; 
        if(isHidden){
            translation.style.display = "block";
        }else{
            translation.style.display = "none";
        }
        toggleTranslationBtn.textContent = isHidden ? "Hide Translation" : "Show Translation";    
    }

function toggleTransliteration(){
    const isHidden = transliteration.style.display === "none" && currentMode === "arabic"; 
        if(isHidden){
            transliteration.style.display = "block";
        }else{
            transliteration.style.display = "none";
        }
        toggleTransliterationBtn.textContent = isHidden ? "Hide transliteration" : "Show transliteration";    
}

/**
 * Toggle Tajweed rules highlighting
 */
function toggleTajweed() {
    const tajweedToggle = document.getElementById('tajweedToggle');
    const showTajweed = tajweedToggle.checked;
    
    // Save preference to localStorage
    localStorage.setItem('showTajweed', showTajweed);
    
    // Update the display
    if (currentMode === 'arabic' && currentQuranText) {
        if (showTajweed && window.tajweedModule) {
            document.getElementById('quranText').innerHTML = window.tajweedModule.applyTajweedHighlighting(currentQuranText.arabic, false);
        } else {
            document.getElementById('quranText').textContent = currentQuranText.arabic;
        }
    }
}

function updateToggleControlsVisibility() {
    const controls = document.getElementById("toggleControls");
    controls.style.display = currentMode === "arabic" ? "block" : "none";
}
    
/**
 * Toggle recording state
 */
function toggleRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const recordingStatus = document.getElementById('recordingStatus');
    
    if (recordBtn.classList.contains('recording')) {
        // Stop recording
        stopRecording();
        recordBtn.classList.remove('recording');
        recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record';
        recordingStatus.textContent = 'Click to start recording';
    } else {
        // Start recording
        startRecording();
        recordBtn.classList.add('recording');
        recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        recordingStatus.textContent = 'Recording... Speak now';
    }
}

/**
 * Display feedback to the user
 */
function showFeedback(message, type) {
    // Create a temporary feedback element if needed
    let feedback = document.getElementById('feedbackMessage');
    
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'feedbackMessage';
        feedback.className = 'feedback-toast';
        document.body.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.className = 'feedback-toast';
    
    if (type) {
        feedback.classList.add(type);
    }
    
    // Show the feedback
    feedback.classList.add('visible');
    
    // Hide after 3 seconds
    setTimeout(() => {
        feedback.classList.remove('visible');
    }, 3000);
}

/**
 * Toggle the quiz mode on and off
 * @param {Event} event - The event that triggered this function
 */
function toggleQuizMode(event) {
    const quizContainer = document.getElementById('quizContainer');
    const mainContent = document.querySelector('.main-content');
    
    // Check if we're already in quiz mode and the quiz mode button was clicked
    if (event && event.currentTarget.id === 'quizModeBtn' && !quizContainer.classList.contains('hidden')) {
        // Already in quiz mode and quiz button clicked, do nothing
        return;
    }
    
    // Toggle visibility
    quizContainer.classList.toggle('hidden');
    
    // If quiz is now visible, hide main content and vice versa
    if (!quizContainer.classList.contains('hidden')) {
        // Show quiz and hide main content
        mainContent.style.display = 'none';
        
        // Sync difficulty level with main app
        document.getElementById('quizDifficultyLevel').value = currentDifficulty;
        
        // Reset quiz UI if needed
        if (document.getElementById('quizArea').classList.contains('hidden') === false) {
            document.getElementById('quizArea').classList.add('hidden');
            document.getElementById('quizSetup').classList.remove('hidden');
        }
    } else {
        // Show main content
        mainContent.style.display = 'flex';
    }
}

