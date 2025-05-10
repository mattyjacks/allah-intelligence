/**
 * Allah Intelligence - Quran Teaching Tool
 * Tajweed Rules Integration Module
 * 
 * This module handles the visualization and analysis of Tajweed rules in Quranic text
 * and provides feedback on pronunciation based on these rules.
 */

// Define Tajweed rules with their colors and descriptions
const tajweedRules = {
    // Noon and Tanween rules
    idgham: { color: '#4CAF50', description: 'Idgham (Merging)', example: 'مِن نَّعِيمٍ' },
    ikhfa: { color: '#2196F3', description: 'Ikhfa (Hiding)', example: 'مِن قَبْلِ' },
    iqlab: { color: '#9C27B0', description: 'Iqlab (Converting)', example: 'مِمْ بَعْدِ' },
    izhar: { color: '#FF9800', description: 'Izhar (Clear Pronunciation)', example: 'مِنْ هَادٍ' },
    
    // Meem Sakinah rules
    idghamShafawi: { color: '#E91E63', description: 'Idgham Shafawi (Labial Merging)', example: 'لَهُم مَّا' },
    ikhfaShafawi: { color: '#00BCD4', description: 'Ikhfa Shafawi (Labial Hiding)', example: 'هُمْ بِمُؤْمِنِينَ' },
    izharShafawi: { color: '#FF5722', description: 'Izhar Shafawi (Labial Clear Pronunciation)', example: 'لَهُمْ فِيهَا' },
    
    // Other common rules
    qalqalah: { color: '#8BC34A', description: 'Qalqalah (Echoing)', example: 'قُلْ' },
    ghunnah: { color: '#673AB7', description: 'Ghunnah (Nasalization)', example: 'إِنَّ' },
    madd: { color: '#F44336', description: 'Madd (Prolongation)', example: 'لَا' }
};

/**
 * Apply Tajweed highlighting to Arabic text
 * @param {string} arabicText - The Arabic text to highlight
 * @param {boolean} showLegend - Whether to show the Tajweed rules legend
 * @returns {string} HTML with highlighted Tajweed rules
 */
function applyTajweedHighlighting(arabicText, showLegend = true) {
    if (!arabicText) return '';
    
    let highlightedText = arabicText;
    
    // Apply highlighting for each rule
    // This is a simplified approach - in a real implementation, 
    // you would need more sophisticated pattern matching
    
    // Example highlighting for Noon Sakinah and Tanween rules
    highlightedText = highlightTajweedPattern(highlightedText, /نْ [ينمول]/g, 'idgham');
    highlightedText = highlightTajweedPattern(highlightedText, /نْ [صذثكجشسقظطزفت]/g, 'ikhfa');
    highlightedText = highlightTajweedPattern(highlightedText, /نْ ب/g, 'iqlab');
    highlightedText = highlightTajweedPattern(highlightedText, /نْ [ءهعحغخ]/g, 'izhar');
    
    // Example highlighting for Meem Sakinah rules
    highlightedText = highlightTajweedPattern(highlightedText, /مْ م/g, 'idghamShafawi');
    highlightedText = highlightTajweedPattern(highlightedText, /مْ ب/g, 'ikhfaShafawi');
    highlightedText = highlightTajweedPattern(highlightedText, /مْ [^مب]/g, 'izharShafawi');
    
    // Example highlighting for other rules
    highlightedText = highlightTajweedPattern(highlightedText, /[قطبجد]ْ/g, 'qalqalah');
    highlightedText = highlightTajweedPattern(highlightedText, /نّ|مّ/g, 'ghunnah');
    highlightedText = highlightTajweedPattern(highlightedText, /ا|ى|و|ي/g, 'madd');
    
    // Add legend if requested
    if (showLegend) {
        highlightedText += createTajweedLegend();
    }
    
    return highlightedText;
}

/**
 * Highlight specific Tajweed patterns in text
 * @param {string} text - The text to process
 * @param {RegExp} pattern - The pattern to match
 * @param {string} ruleKey - The key of the Tajweed rule to apply
 * @returns {string} Text with highlighted patterns
 */
function highlightTajweedPattern(text, pattern, ruleKey) {
    const rule = tajweedRules[ruleKey];
    if (!rule) return text;
    
    return text.replace(pattern, (match) => {
        return `<span class="tajweed-highlight" style="background-color: ${rule.color}; border-radius: 3px; padding: 0 2px;" 
                data-rule="${ruleKey}" title="${rule.description}">${match}</span>`;
    });
}

/**
 * Create a legend for Tajweed rules
 * @returns {string} HTML for the Tajweed rules legend
 */
function createTajweedLegend() {
    let legendHTML = '<div class="tajweed-legend"><h4>Tajweed Rules</h4><ul>';
    
    for (const [key, rule] of Object.entries(tajweedRules)) {
        legendHTML += `
            <li>
                <span class="legend-color" style="display: inline-block; width: 15px; height: 15px; background-color: ${rule.color}; border-radius: 50%; margin-right: 5px;"></span>
                <span class="legend-name">${rule.description}</span>
                <span class="legend-example" style="margin-left: 5px; font-style: italic;">(${rule.example})</span>
            </li>
        `;
    }
    
    legendHTML += '</ul></div>';
    return legendHTML;
}

/**
 * Analyze pronunciation based on Tajweed rules
 * @param {string} correctText - The correct Arabic text
 * @param {string} userRecitation - The user's recited text
 * @returns {Promise<Object>} Analysis results with score and feedback
 */
async function analyzeTajweedPronunciation(correctText, userRecitation) {
    // No need to check for API key since we're using the Cloudflare worker
    // which handles the API key securely
    
    try {
        // Use the hardcoded worker URL
        const workerUrl = 'https://allah-intelligence-api-proxy.matthewwarrenjackson.workers.dev';
        
        // Prepare request to Cloudflare Worker for Tajweed analysis
        const response = await fetch(`${workerUrl}/api/openai/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert in Arabic Tajweed rules and Quranic recitation. 
                        Analyze the user's recitation compared to the correct text, focusing on:
                        1. Noon and Tanween rules (Idgham, Ikhfa, Iqlab, Izhar)
                        2. Meem Sakinah rules (Idgham Shafawi, Ikhfa Shafawi, Izhar Shafawi)
                        3. Qalqalah (echoing of قطبجد when they have sukoon)
                        4. Ghunnah (nasalization of نّ and مّ)
                        5. Madd (prolongation of vowels)
                        
                        Provide a detailed analysis with:
                        - Overall score (0-1)
                        - Specific Tajweed rules that were applied correctly
                        - Specific Tajweed rules that need improvement
                        - Personalized advice for improvement
                        
                        Format your response as JSON with the following structure:
                        {
                            "score": 0.75,
                            "correctRules": ["idgham", "ghunnah"],
                            "improvementNeeded": ["qalqalah", "madd"],
                            "feedback": "Your detailed feedback here",
                            "specificAdvice": "Specific advice for improvement"
                        }`
                    },
                    {
                        role: "user",
                        content: `Analyze the following Quranic recitation for Tajweed accuracy:
                        
                        Correct text: ${correctText}
                        User's recitation: ${userRecitation}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
                // Removed response_format to avoid the error
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Error analyzing Tajweed');
        }
        
        // Parse the analysis result
        const result = await response.json();
        let analysis;
        
        try {
            // The response from the Cloudflare worker will be different
            // It will have the OpenAI response structure
            const content = result.choices[0].message.content;
            
            // Try to parse the content as JSON
            try {
                // If it's already a valid JSON string
                analysis = JSON.parse(content);
            } catch (parseError) {
                // If it's not valid JSON, try to extract JSON from the text
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysis = JSON.parse(jsonMatch[0]);
                } else {
                    // Fallback to a simple object if no JSON can be extracted
                    analysis = {
                        score: 0.6,
                        feedback: content,
                        correctRules: [],
                        improvementNeeded: [],
                        specificAdvice: 'Please try again for more specific feedback.'
                    };
                }
            }
        } catch (error) {
            console.error('Error parsing Tajweed analysis:', error);
            // Provide a fallback analysis
            analysis = {
                score: 0.5,
                feedback: 'Unable to analyze Tajweed rules in detail.',
                correctRules: [],
                improvementNeeded: [],
                specificAdvice: 'Please try again with a clearer recitation.'
            };
        }
        
        return analysis;
        
    } catch (error) {
        console.error('Tajweed Analysis Error:', error);
        return {
            score: 0.5,
            feedback: 'Error analyzing Tajweed: ' + error.message,
            correctRules: [],
            improvementNeeded: [],
            specificAdvice: 'Try again later.'
        };
    }
}

/**
 * Display Tajweed analysis feedback in the UI
 * @param {Object} analysis - The Tajweed analysis results
 * @param {HTMLElement} container - The container to display feedback in
 */
function displayTajweedFeedback(analysis, container) {
    if (!analysis || !container) return;
    
    // Create feedback HTML
    let feedbackHTML = `
        <div class="tajweed-feedback">
            <h4>Tajweed Analysis</h4>
            <div class="tajweed-score">
                Score: <span class="score-value">${Math.round(analysis.score * 100)}%</span>
            </div>
    `;
    
    // Add correct rules section if available
    if (analysis.correctRules && analysis.correctRules.length > 0) {
        feedbackHTML += `
            <div class="tajweed-correct">
                <h5>Well Done:</h5>
                <ul>
        `;
        
        analysis.correctRules.forEach(rule => {
            const ruleInfo = tajweedRules[rule];
            if (ruleInfo) {
                feedbackHTML += `
                    <li>
                        <span class="rule-color" style="display: inline-block; width: 12px; height: 12px; background-color: ${ruleInfo.color}; border-radius: 50%; margin-right: 5px;"></span>
                        ${ruleInfo.description}
                    </li>
                `;
            }
        });
        
        feedbackHTML += `
                </ul>
            </div>
        `;
    }
    
    // Add improvement needed section if available
    if (analysis.improvementNeeded && analysis.improvementNeeded.length > 0) {
        feedbackHTML += `
            <div class="tajweed-improve">
                <h5>Areas to Improve:</h5>
                <ul>
        `;
        
        analysis.improvementNeeded.forEach(rule => {
            const ruleInfo = tajweedRules[rule];
            if (ruleInfo) {
                feedbackHTML += `
                    <li>
                        <span class="rule-color" style="display: inline-block; width: 12px; height: 12px; background-color: ${ruleInfo.color}; border-radius: 50%; margin-right: 5px;"></span>
                        ${ruleInfo.description} (Example: ${ruleInfo.example})
                    </li>
                `;
            }
        });
        
        feedbackHTML += `
                </ul>
            </div>
        `;
    }
    
    // Add specific advice
    if (analysis.specificAdvice) {
        feedbackHTML += `
            <div class="tajweed-advice">
                <h5>Advice for Improvement:</h5>
                <p>${analysis.specificAdvice}</p>
            </div>
        `;
    }
    
    feedbackHTML += '</div>';
    
    // Set the HTML content
    container.innerHTML = feedbackHTML;
}

// Export functions for use in other modules
window.tajweedModule = {
    applyTajweedHighlighting,
    analyzeTajweedPronunciation,
    displayTajweedFeedback,
    tajweedRules
};
