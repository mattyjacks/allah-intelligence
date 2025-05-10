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
    try {
        showFeedback('Processing your recitation as Arabic with OpenAI...', '');
        
        // Create FormData object for file upload
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');
        
        // Use the hardcoded worker URL
        const workerUrl = 'https://allah-intelligence-api-proxy.matthewwarrenjackson.workers.dev';
        
        // Send the audio to the Cloudflare Worker
        const response = await fetch(`${workerUrl}/api/openai/transcribe`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error processing audio');
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
        // Show processing feedback
        showFeedback('Analyzing your recitation...', '');
        
        let score = 0.5; // Default score
        let tajweedAnalysis = null;
        
        // Use the hardcoded worker URL
        const workerUrl = 'https://allah-intelligence-api-proxy.matthewwarrenjackson.workers.dev';
        
        // First, get basic pronunciation score
        const response = await fetch(`${workerUrl}/api/openai/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
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
        
        if (response.ok) {
            // Get comparison result
            const result = await response.json();
            const scoreText = result.choices[0].message.content.trim();
            
            // Extract score from the response text
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
        }
        
        // Next, get Tajweed analysis if module is available
        if (window.tajweedModule) {
            try {
                // Only attempt Tajweed analysis if we have valid text
                if (currentQuranText && currentQuranText.arabic && transcription && transcription.trim() !== '') {
                    tajweedAnalysis = await window.tajweedModule.analyzeTajweedPronunciation(
                        currentQuranText.arabic, 
                        transcription
                    );
                    
                    // Combine scores (70% basic pronunciation, 30% tajweed accuracy)
                    if (tajweedAnalysis && typeof tajweedAnalysis.score === 'number') {
                        score = (score * 0.7) + (tajweedAnalysis.score * 0.3);
                    }
                }
            } catch (tajweedError) {
                console.error('Tajweed analysis error:', tajweedError);
                // Continue with basic score if tajweed analysis fails
            }
        }
        
        // Update the UI with score and feedback
        updateScoreDisplay(score);
        
        // Show feedback based on score
        let feedbackMessage;
        if (score >= 0.8) {
            feedbackMessage = 'Excellent pronunciation!';
        } else if (score >= 0.6) {
            feedbackMessage = 'Good pronunciation, keep practicing!';
        } else if (score >= 0.4) {
            feedbackMessage = 'Fair pronunciation, try to improve.';
        } else {
            feedbackMessage = 'Needs improvement. Listen to the correct pronunciation and try again.';
        }
        
        showFeedback(feedbackMessage, score >= 0.6 ? 'success' : 'warning');
        
        // Display Tajweed feedback if available
        if (tajweedAnalysis) {
            // Create or get feedback container
            let tajweedFeedbackContainer = document.getElementById('tajweedFeedback');
            if (!tajweedFeedbackContainer) {
                tajweedFeedbackContainer = document.createElement('div');
                tajweedFeedbackContainer.id = 'tajweedFeedback';
                document.getElementById('recognitionText').parentNode.appendChild(tajweedFeedbackContainer);
            }
            
            // Display the feedback
            window.tajweedModule.displayTajweedFeedback(tajweedAnalysis, tajweedFeedbackContainer);
        }
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        showFeedback('Error: ' + error.message, 'error');
    }
}

/**
 * Update the score display in the UI
 * @param {number} score - The pronunciation score (0-1)
 */
function updateScoreDisplay(score) {
    // Create or get score display element
    let scoreDisplay = document.getElementById('pronunciationScore');
    if (!scoreDisplay) {
        scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'pronunciationScore';
        scoreDisplay.className = 'pronunciation-score';
        document.getElementById('recognitionText').parentNode.insertBefore(
            scoreDisplay, 
            document.getElementById('recognitionText')
        );
    }
    
    // Update the score display
    const percentage = Math.round(score * 100);
    scoreDisplay.innerHTML = `<span class="score-label">Pronunciation Score:</span> <span class="score-value">${percentage}%</span>`;
    
    // Add color based on score
    scoreDisplay.className = 'pronunciation-score';
    if (score >= 0.8) {
        scoreDisplay.classList.add('excellent');
    } else if (score >= 0.6) {
        scoreDisplay.classList.add('good');
    } else if (score >= 0.4) {
        scoreDisplay.classList.add('fair');
    } else {
        scoreDisplay.classList.add('poor');
    }
}

/**
 * Display the recognition results in the UI
 * @param {string} text - The recognized text to display
 */
async function displayRecognitionResults(text) {
    const recognitionText = document.getElementById('recognitionText');
    if (!recognitionText) return;
    
    if (!text || text.trim() === '') {
        recognitionText.innerHTML = '<p class="no-results">No speech detected. Please try again.</p>';
        return;
    }
    
    // Show the Arabic text first with loading indicator
    recognitionText.innerHTML = `
        <div class="section-label">Raw Transcription</div>
        <div class="recognition-arabic">${text}</div>
        <div class="recognition-loading">Analyzing your recitation...</div>
    `;
    
    // Add appropriate direction class
    recognitionText.classList.add('arabic');
    
    try {
        // Get the original text for comparison
        const originalArabic = currentQuranText ? currentQuranText.arabic : '';
        const originalTranslation = currentQuranText ? currentQuranText.translation : '';
        
        // Use the hardcoded worker URL for analysis
        const workerUrl = 'https://allah-intelligence-api-proxy.matthewwarrenjackson.workers.dev';
        
        const response = await fetch(`${workerUrl}/api/openai/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: "You are an expert in Arabic language and Quranic analysis. Provide a detailed analysis of the user's recitation compared to the original text. Include: 1) Transliteration of the user's recitation, 2) English translation of the user's recitation, 3) Comparison with the original text's meaning, 4) A similarity score from 0 to 100 representing how close the meaning is to the original. If the user's recitation is not proper Arabic or seems like a misinterpretation (e.g. English words transcribed as Arabic), you must provide the phonetic Arabic equivalent of what they actually said. For example, if they said 'hello hello hello' and it was transcribed as Arabic text, explain what Arabic words those transcriptions actually represent phonetically."
                    },
                    {
                        role: "user",
                        content: `Analyze this Arabic recitation:\n\nUser's recitation: "${text}"\n\nOriginal text: "${originalArabic}"\n\nOriginal translation: "${originalTranslation}"\n\nProvide the transliteration, translation, meaning comparison, and similarity score.`
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get analysis of recitation');
        }
        
        const result = await response.json();
        const content = result.choices[0].message.content;
        
        // Extract components from the response
        const transliterationMatch = content.match(/Transliteration:?\s*([^\n]+)/i);
        const translationMatch = content.match(/Translation:?\s*([^\n]+)/i);
        const comparisonMatch = content.match(/Comparison:?\s*([^\n]+(?:\n[^\n]+)*)/i);
        const scoreMatch = content.match(/(?:Similarity|Meaning) Score:?\s*(\d+)/i);
        
        const transliteration = transliterationMatch ? transliterationMatch[1].trim() : 'Transliteration not available';
        const translation = translationMatch ? translationMatch[1].trim() : 'Translation not available';
        const comparison = comparisonMatch ? comparisonMatch[1].trim() : 'Comparison not available';
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        
        // Create a color class based on the score
        let scoreColorClass = '';
        if (score >= 80) scoreColorClass = 'excellent-score';
        else if (score >= 60) scoreColorClass = 'good-score';
        else if (score >= 40) scoreColorClass = 'fair-score';
        else scoreColorClass = 'poor-score';
        
        // Update the recognition text with all components in a more compact format
        recognitionText.innerHTML = `
            <div class="section-label">Raw Transcription</div>
            <div class="recognition-arabic">${text}</div>
            <div class="divider"></div>
            
            <div class="section-label">Analysis</div>
            <div class="recognition-transliteration">${transliteration}</div>
            <div class="recognition-translation">${translation}</div>
            <div class="divider"></div>
            
            <div class="meaning-comparison">${comparison}</div>
            <div class="similarity-score ${scoreColorClass}">${score}%</div>
        `;
        
        // Highlight misinterpretation if score is very low
        if (score < 30) {
            const misinterpretationNote = document.createElement('div');
            misinterpretationNote.className = 'recognition-error';
            misinterpretationNote.innerHTML = 'Note: Your speech appears to have been interpreted as Arabic words that sound similar to what you said in English. The system is designed to help you learn Arabic pronunciation, so try reciting the actual Arabic text shown above.';
            recognitionText.appendChild(misinterpretationNote);
        }
    } catch (error) {
        console.error('Error enhancing recognition results:', error);
        // Still show the Arabic text even if enhancement fails
        recognitionText.innerHTML = `
            <div class="section-label">Raw Transcription</div>
            <div class="recognition-arabic">${text}</div>
            <div class="recognition-error">Could not generate complete analysis. Please try again.</div>
        `;
    }
}

/**
 * Generate speech using OpenAI's Text-to-Speech API
 * @param {string} text - The text to convert to speech
 * @param {string} voice - The voice to use (alloy, echo, fable, onyx, nova, shimmer)
 * @returns {Promise<string>} URL to the generated audio
 */
async function generateSpeech(text, voice = 'nova') {
    try {
        // Show processing feedback
        showFeedback('Generating audio...', '');
        
        // Use the hardcoded worker URL
        const workerUrl = 'https://allah-intelligence-api-proxy.matthewwarrenjackson.workers.dev';
        
        // Prepare request to Cloudflare Worker
        const response = await fetch(`${workerUrl}/api/openai/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                voice: voice
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error generating speech');
        }
        
        // Get audio data as blob
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
