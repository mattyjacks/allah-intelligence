/**
 * Allah Intelligence - Quran Teaching Tool
 * Main Application JavaScript
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
    // Mode buttons
    const arabicModeBtn = document.getElementById('arabicModeBtn');
    const englishModeBtn = document.getElementById('englishModeBtn');
    
    // Control buttons
    const playBtn = document.getElementById('playBtn');
    const nextBtn = document.getElementById('nextBtn');
    const recordBtn = document.getElementById('recordBtn');
    const playRecordingBtn = document.getElementById('playRecordingBtn');
    const quizModeBtn = document.getElementById('quizModeBtn');
    const toggleTranslationBtn = document.getElementById("toggleTranslationBtn");
    
    // Display elements
    const quranText = document.getElementById('quranText');
    const transliteration = document.getElementById('transliteration');
    const translation = document.getElementById('translation');
    const feedback = document.getElementById('feedback');
    const recordingStatus = document.getElementById('recordingStatus');
    
    // Quiz elements
    const quizContainer = document.getElementById('quizContainer');
    const closeQuizBtn = document.getElementById('closeQuizBtn');
    const quizDifficultyLevel = document.getElementById('quizDifficultyLevel');
    
    // Settings elements
    const difficultyLevel = document.getElementById('difficultyLevel');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    
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
    
    saveApiKeyBtn.addEventListener('click', () => {
        apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('openai_api_key', apiKey);
            showFeedback('API key saved successfully!', 'success');
        } else {
            showFeedback('Please enter a valid API key', 'error');
        }
    });
});

/**
 * Initialize the application
 */
function initApp() {
    // Load saved API key if available
    apiKey = localStorage.getItem('openai_api_key') || '';
    if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
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
    
    // Reload text with new mode
    loadNextQuranText();
}

/**
 * Load the next Quran text based on current mode and difficulty
 */
function loadNextQuranText() {
    
    currentQuranText = getRandomQuranText(currentDifficulty);
    
    if (currentMode === 'arabic') {
        document.getElementById('quranText').textContent = currentQuranText.arabic;
        document.getElementById('transliteration').textContent = currentQuranText.transliteration;
        document.getElementById('translation').textContent = currentQuranText.translation;
    } else {
        document.getElementById('quranText').textContent = currentQuranText.translation;
        document.getElementById('transliteration').textContent = '';
        document.getElementById('translation').textContent = '';
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
        // Check if API key is available
        if (!apiKey) {
            // Fallback to Web Speech API if no API key
            useWebSpeechAPI(textToSpeak);
            return;
        }
        
        // Use OpenAI's TTS API
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
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = 'feedback';
    
    if (type) {
        feedback.classList.add(type);
    }
}

/**
 * Toggle the quiz mode on and off
 */
function toggleQuizMode() {
    const quizContainer = document.getElementById('quizContainer');
    const mainContent = document.querySelector('.main-content');
    
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

