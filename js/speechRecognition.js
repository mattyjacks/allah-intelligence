/**
 * Allah Intelligence - Quran Teaching Tool
 * Speech Recognition Module
 */

// Global variables for speech recognition
let recognition;
let isRecording = false;
let recordedAudioUrl = null;
let mediaRecorder = null;
let audioChunks = [];
let audioPlayer = null;

/**
 * Initialize the speech recognition
 */
function initSpeechRecognition() {
    // Check if browser supports SpeechRecognition
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!window.SpeechRecognition) {
        showFeedback('Speech recognition is not supported in your browser. Please try Chrome or Edge.', 'error');
        return false;
    }
    
    // Create recognition instance
    recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Set language based on current mode
    recognition.lang = currentMode === 'arabic' ? 'ar-SA' : 'en-US';
    
    // Set up event handlers
    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;
    recognition.onend = handleRecognitionEnd;
    
    return true;
}

/**
 * Start recording audio
 */
function startRecording() {
    // Reset recording state
    isRecording = true;
    audioChunks = [];
    
    // Initialize speech recognition if needed
    if (!recognition && !initSpeechRecognition()) {
        return; // Exit if speech recognition can't be initialized
    }
    
    // Request microphone access for audio recording
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            // Configure media recorder with proper MIME type and bitrate
            const options = { 
                mimeType: 'audio/webm',
                audioBitsPerSecond: 128000
            };
            
            try {
                mediaRecorder = new MediaRecorder(stream, options);
            } catch (e) {
                // Fallback if the specified options aren't supported
                console.warn('MediaRecorder with options not supported, using default', e);
                mediaRecorder = new MediaRecorder(stream);
            }
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                // Create blob from recorded chunks with proper MIME type
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunks, { type: mimeType });
                
                // Create URL for the audio blob
                recordedAudioUrl = URL.createObjectURL(audioBlob);
                
                // Enable the play recording button
                const playRecordingBtn = document.getElementById('playRecordingBtn');
                if (playRecordingBtn) {
                    playRecordingBtn.disabled = false;
                }
                
                // Process the recorded audio
                if (currentMode === 'arabic') {
                    processAudioWithOpenAI(audioBlob);
                } else {
                    // For English mode, use the built-in speech recognition
                    recognition.start();
                }
            };
            
            // Request data at regular intervals to ensure we get chunks
            mediaRecorder.start(100);
        })
        .catch(error => {
            showFeedback('Error accessing microphone: ' + error.message, 'error');
            isRecording = false;
        });
}

/**
 * Stop recording audio
 */
function stopRecording() {
    isRecording = false;
    
    // Stop media recorder if active
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        
        // Stop all audio tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    // Stop recognition if active
    if (recognition && document.getElementById('englishModeBtn').classList.contains('active')) {
        recognition.abort();
    }
}

/**
 * Handle speech recognition result
 */
function handleRecognitionResult(event) {
    const result = event.results[0][0].transcript;
    
    // Compare with current text (for English mode)
    if (currentMode === 'english' && currentQuranText) {
        const similarity = calculateSimilarity(result, currentQuranText.translation);
        updateScore(similarity);
    }
}

/**
 * Handle speech recognition error
 */
function handleRecognitionError(event) {
    console.error('Speech recognition error:', event.error);
    showFeedback('Error in speech recognition: ' + event.error, 'error');
}

/**
 * Handle speech recognition end
 */
function handleRecognitionEnd() {
    // Recognition has ended
    isRecording = false;
}

/**
 * Play back the user's recorded audio
 */
function playRecordedAudio() {
    if (!recordedAudioUrl) {
        showFeedback('No recording available to play', 'error');
        return;
    }
    
    // Stop any currently playing audio
    if (audioPlayer && !audioPlayer.paused) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
    
    // Create new audio player if needed
    if (!audioPlayer) {
        audioPlayer = new Audio();
    }
    
    // Set up the audio player
    audioPlayer.src = recordedAudioUrl;
    audioPlayer.onplay = () => {
        document.getElementById('playRecordingBtn').innerHTML = '<i class="fas fa-pause-circle"></i> Pause';
    };
    audioPlayer.onpause = () => {
        document.getElementById('playRecordingBtn').innerHTML = '<i class="fas fa-play-circle"></i> Play My Recording';
    };
    audioPlayer.onended = () => {
        document.getElementById('playRecordingBtn').innerHTML = '<i class="fas fa-play-circle"></i> Play My Recording';
    };
    
    // Play the audio
    audioPlayer.play();
}

/**
 * Calculate text similarity (simple implementation)
 * @param {string} text1 - First text to compare
 * @param {string} text2 - Second text to compare
 * @returns {number} Similarity score between 0 and 1
 */
function calculateSimilarity(text1, text2) {
    // Convert to lowercase and remove punctuation
    const normalize = (text) => text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    const normalizedText1 = normalize(text1);
    const normalizedText2 = normalize(text2);
    
    // Split into words
    const words1 = normalizedText1.split(/\s+/);
    const words2 = normalizedText2.split(/\s+/);
    
    // Count matching words
    let matchCount = 0;
    for (const word of words1) {
        if (words2.includes(word)) {
            matchCount++;
        }
    }
    
    // Calculate similarity score
    const totalWords = Math.max(words1.length, words2.length);
    return totalWords > 0 ? matchCount / totalWords : 0;
}
