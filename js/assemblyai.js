/**
 * Allah Intelligence - Quran Teaching Tool
 * AssemblyAI API Integration Module
 * 
 * This module handles AssemblyAI API interactions for Arabic transcription
 * using the nano model, which is optimized for Arabic language.
 */

/**
 * Process recorded audio with AssemblyAI API
 * @param {Blob} audioBlob - The recorded audio blob
 */
async function processAudioWithAssemblyAI(audioBlob) {
    try {
        showFeedback('Processing your recitation as Arabic...', '');
        
        // Create FormData object for file upload
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');
        
        // Use the hardcoded worker URL
        const workerUrl = 'https://allah-intelligence-api-proxy.matthewwarrenjackson.workers.dev';
        
        // Send the audio to the Cloudflare Worker
        const response = await fetch(`${workerUrl}/api/assemblyai/transcribe`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error processing audio');
        }
        
        // Get transcription result
        const result = await response.json();
        const transcription = result.text;
        
        // Display the recognition results
        await displayEnhancedRecognitionResults(transcription);
        
        // Compare with current Quran text
        await compareWithQuranText(transcription);
        
    } catch (error) {
        console.error('AssemblyAI API Error:', error);
        showFeedback('Error: ' + error.message, 'error');
    }
}

/**
 * Display enhanced recognition results with transliteration and translation
 * @param {string} arabicText - The transcribed Arabic text
 */
async function displayEnhancedRecognitionResults(arabicText) {
    if (!arabicText || arabicText.trim() === '') {
        document.getElementById('recognitionText').innerHTML = '<p class="no-results">No speech detected. Please try again.</p>';
        return;
    }
    
    try {
        // Show the Arabic text first
        document.getElementById('recognitionText').innerHTML = `
            <div class="recognition-arabic">${arabicText}</div>
            <div class="recognition-loading">Generating transliteration and translation...</div>
        `;
        
        // Use the hardcoded worker URL for OpenAI translation
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
                        content: "You are a helpful assistant that provides transliteration and translation for Arabic text. Provide the transliteration on one line, then the English translation on a new line."
                    },
                    {
                        role: "user",
                        content: `Please provide the transliteration and English translation for this Arabic text: "${arabicText}"`
                    }
                ],
                temperature: 0.3,
                max_tokens: 150
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get transliteration and translation');
        }
        
        const result = await response.json();
        const content = result.choices[0].message.content;
        
        // Split the content into transliteration and translation
        const parts = content.split('\n').filter(part => part.trim() !== '');
        let transliteration = parts[0];
        let translation = parts.length > 1 ? parts[1] : '';
        
        // Clean up the transliteration and translation (remove labels if present)
        transliteration = transliteration.replace(/^(transliteration|romanization):\s*/i, '');
        translation = translation.replace(/^(translation|english):\s*/i, '');
        
        // Update the recognition text with all components
        document.getElementById('recognitionText').innerHTML = `
            <div class="recognition-arabic">${arabicText}</div>
            <div class="recognition-transliteration">${transliteration}</div>
            <div class="recognition-translation">${translation}</div>
        `;
        
    } catch (error) {
        console.error('Error enhancing recognition results:', error);
        // Still show the Arabic text even if enhancement fails
        document.getElementById('recognitionText').innerHTML = `
            <div class="recognition-arabic">${arabicText}</div>
            <div class="recognition-error">Could not generate transliteration and translation.</div>
        `;
    }
}
