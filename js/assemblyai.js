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
            <div class="recognition-loading">Analyzing your recitation...</div>
        `;
        
        // Use the hardcoded worker URL for OpenAI translation and comparison
        const workerUrl = 'https://allah-intelligence-api-proxy.matthewwarrenjackson.workers.dev';
        
        // Get the original text for comparison
        const originalArabic = currentQuranText ? currentQuranText.arabic : '';
        const originalTranslation = currentQuranText ? currentQuranText.translation : '';
        
        const response = await fetch(`${workerUrl}/api/openai/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: "You are an expert in Arabic language and Quranic analysis. Provide a detailed analysis of the user's recitation compared to the original text. Include: 1) Transliteration of the user's recitation, 2) English translation of the user's recitation, 3) Comparison with the original text's meaning, 4) A similarity score from 0 to 100 representing how close the meaning is to the original."
                    },
                    {
                        role: "user",
                        content: `Analyze this Arabic recitation:\n\nUser's recitation: "${arabicText}"\n\nOriginal text: "${originalArabic}"\n\nOriginal translation: "${originalTranslation}"\n\nProvide the transliteration, translation, meaning comparison, and similarity score.`
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
        
        // Update the recognition text with all components
        document.getElementById('recognitionText').innerHTML = `
            <div class="recognition-arabic">${arabicText}</div>
            <div class="recognition-transliteration"><strong>Transliteration:</strong> ${transliteration}</div>
            <div class="recognition-translation"><strong>Translation:</strong> ${translation}</div>
            <div class="recognition-comparison"><strong>Meaning Comparison:</strong> ${comparison}</div>
            <div class="recognition-meaning-score ${scoreColorClass}"><strong>Meaning Similarity:</strong> <span>${score}%</span></div>
        `;
        
    } catch (error) {
        console.error('Error enhancing recognition results:', error);
        // Still show the Arabic text even if enhancement fails
        document.getElementById('recognitionText').innerHTML = `
            <div class="recognition-arabic">${arabicText}</div>
            <div class="recognition-error">Could not generate complete analysis. Please try again.</div>
        `;
    }
}
