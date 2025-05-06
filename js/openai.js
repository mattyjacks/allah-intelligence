/**
 * Allah Intelligence - Quran Teaching Tool
 * OpenAI API Integration Module
 * 
 * This module handles all OpenAI API interactions including:
 * - Speech-to-text (Whisper API)
 * - Text-to-speech (TTS API)
 * - Text comparison (GPT API)
 */

/**
 * Process recorded audio with OpenAI API
 * @param {Blob} audioBlob - The recorded audio blob
 */
async function processAudioWithOpenAI(audioBlob) {
    // Check if API key is available
    if (!apiKey) {
        showFeedback('Please enter your OpenAI API key in the settings', 'error');
        return;
    }
    
    try {
        showFeedback('Processing your recitation...', '');
        
        // Create FormData object for file upload
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'text');
        
        // Prepare request to OpenAI API
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`
                // Note: Do not set Content-Type header when using FormData
                // The browser will set it automatically with the correct boundary
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Error processing audio');
        }
        
        // Get transcription
        const transcription = await response.text();
        
        // Display the recognition results
        displayRecognitionResults(transcription);
        
        // Compare with current Quran text
        await compareWithQuranText(transcription);
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        showFeedback('Error: ' + error.message, 'error');
    }
}

/**
 * Compare transcribed text with current Quran text using OpenAI
 * @param {string} transcription - The transcribed text from user's recitation
 */
async function compareWithQuranText(transcription) {
    try {
        // Prepare request to OpenAI API for comparison
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert in Arabic pronunciation and Quranic recitation. Your task is to compare a user's recitation with the correct Quranic text and provide a score from 0 to 1 representing how accurate the pronunciation is. Return only the score as a decimal number."
                    },
                    {
                        role: "user",
                        content: `Compare the following recitation with the correct Quranic text.\n\nCorrect text: ${currentQuranText.arabic}\n\nUser's recitation: ${transcription}\n\nProvide a score from 0 to 1 representing the accuracy of pronunciation.`
                    }
                ],
                temperature: 0.3,
                max_tokens: 10
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Error comparing texts');
        }
        
        // Get comparison result
        const result = await response.json();
        const scoreText = result.choices[0].message.content.trim();
        
        // Extract score from the response text
        // The model might return just a number, or it might include text
        let score;
        
        // Try to extract a number from the response
        const numberMatch = scoreText.match(/([0-9]*[.])?[0-9]+/);
        if (numberMatch) {
            score = parseFloat(numberMatch[0]);
        } else {
            // If no number found, make a best guess based on the text
            if (scoreText.toLowerCase().includes('excellent') || 
                scoreText.toLowerCase().includes('perfect')) {
                score = 0.95;
            } else if (scoreText.toLowerCase().includes('good')) {
                score = 0.8;
            } else if (scoreText.toLowerCase().includes('fair') || 
                      scoreText.toLowerCase().includes('average')) {
                score = 0.6;
            } else if (scoreText.toLowerCase().includes('poor')) {
                score = 0.4;
            } else {
                // Default fallback score
                score = 0.5;
                console.log('Using fallback score. API returned:', scoreText);
            }
        }
        
        // Ensure score is between 0 and 1
        score = Math.max(0, Math.min(1, score));
        
        // Update the score display
        updateScore(score);
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        showFeedback('Error: ' + error.message, 'error');
    }
}

/**
 * Display the recognition results in the UI
 * @param {string} text - The recognized text to display
 */
function displayRecognitionResults(text) {
    const recognitionText = document.getElementById('recognitionText');
    if (recognitionText) {
        recognitionText.textContent = text;
        
        // Add appropriate direction class based on current mode
        recognitionText.classList.toggle('arabic', currentMode === 'arabic');
    }
}

/**
 * Generate speech using OpenAI's Text-to-Speech API
 * @param {string} text - The text to convert to speech
 * @param {string} voice - The voice to use (alloy, echo, fable, onyx, nova, shimmer)
 * @returns {Promise<string>} URL to the generated audio
 */
async function generateSpeech(text, voice = 'nova') {
    // Check if API key is available
    if (!apiKey) {
        showFeedback('Please enter your OpenAI API key in the settings', 'error');
        return null;
    }
    
    try {
        showFeedback('Generating speech...', '');
        
        // Prepare request to OpenAI API
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: voice,
                input: text,
                speed: 0.9 // Slightly slower for better pronunciation of Quranic text
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Error generating speech');
        }
        
        // Get audio blob
        const audioBlob = await response.blob();
        
        // Create URL for the audio blob
        const audioUrl = URL.createObjectURL(audioBlob);
        
        return audioUrl;
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        showFeedback('Error: ' + error.message, 'error');
        return null;
    }
}
