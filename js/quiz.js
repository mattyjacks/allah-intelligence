/**
 * Allah Intelligence - Quran Teaching Tool
 * Quiz Module
 */

// Quiz types and current state
const QUIZ_TYPES = {
    WRITING: 'writing',
    SPEAKING: 'speaking',
    MEANING: 'meaning'
};

let currentQuiz = null;
let quizScore = 0;
let quizActive = false;

/**
 * Initialize the quiz module
 */
function initQuiz() {
    // Add event listeners for quiz buttons
    document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
    document.getElementById('submitAnswerBtn').addEventListener('click', submitQuizAnswer);
    document.getElementById('nextQuestionBtn').addEventListener('click', loadNextQuestion);
    
    // Add event listeners for quiz type selection
    document.querySelectorAll('input[name="quizType"]').forEach(radio => {
        radio.addEventListener('change', updateQuizTypeUI);
    });
}

/**
 * Start a new quiz based on selected type and difficulty
 */
function startQuiz() {
    // Get selected quiz type
    const selectedType = document.querySelector('input[name="quizType"]:checked').value;
    
    // Reset quiz state
    quizScore = 0;
    quizActive = true;
    
    // Update UI
    document.getElementById('quizScore').textContent = quizScore;
    document.getElementById('quizArea').classList.remove('hidden');
    document.getElementById('quizSetup').classList.add('hidden');
    
    // Create quiz based on type and difficulty
    createQuiz(selectedType, currentDifficulty);
    
    // Load first question
    loadNextQuestion();
}

/**
 * Create a quiz with questions based on type and difficulty
 * @param {string} type - Quiz type (writing, speaking, meaning)
 * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
 */
function createQuiz(type, difficulty) {
    // Get verses for the selected difficulty
    const verses = quranData[difficulty] || quranData.beginner;
    
    // Create quiz object
    currentQuiz = {
        type: type,
        questions: [],
        currentQuestionIndex: -1,
        totalQuestions: 5 // Set number of questions per quiz
    };
    
    // Create questions based on quiz type
    switch(type) {
        case QUIZ_TYPES.WRITING:
            createWritingQuestions(verses);
            break;
        case QUIZ_TYPES.SPEAKING:
            createSpeakingQuestions(verses);
            break;
        case QUIZ_TYPES.MEANING:
            createMeaningQuestions(verses);
            break;
    }
}

/**
 * Create writing quiz questions (fill in the blanks)
 * @param {Array} verses - Array of Quran verses
 */
function createWritingQuestions(verses) {
    // Shuffle verses and take a subset
    const shuffledVerses = shuffleArray([...verses]);
    const selectedVerses = shuffledVerses.slice(0, currentQuiz.totalQuestions);
    
    // Create questions
    selectedVerses.forEach(verse => {
        // Split Arabic text into words
        const words = verse.arabic.split(' ');
        
        // Select 1-2 words to blank out (depending on verse length)
        const numBlanks = words.length > 4 ? 2 : 1;
        const blankIndices = getRandomIndices(words.length, numBlanks);
        
        // Create question text with blanks
        const questionText = words.map((word, index) => 
            blankIndices.includes(index) ? '______' : word
        ).join(' ');
        
        // Create answer key (the words that were blanked out)
        const answers = blankIndices.map(index => words[index]);
        
        // Add question to quiz
        currentQuiz.questions.push({
            questionText: questionText,
            fullText: verse.arabic,
            answers: answers,
            translation: verse.translation,
            transliteration: verse.transliteration,
            blankIndices: blankIndices,
            type: QUIZ_TYPES.WRITING
        });
    });
}

/**
 * Create speaking quiz questions (pronunciation)
 * @param {Array} verses - Array of Quran verses
 */
function createSpeakingQuestions(verses) {
    // Shuffle verses and take a subset
    const shuffledVerses = shuffleArray([...verses]);
    const selectedVerses = shuffledVerses.slice(0, currentQuiz.totalQuestions);
    
    // Create questions
    selectedVerses.forEach(verse => {
        currentQuiz.questions.push({
            questionText: verse.arabic,
            fullText: verse.arabic,
            transliteration: verse.transliteration,
            translation: verse.translation,
            type: QUIZ_TYPES.SPEAKING
        });
    });
}

/**
 * Create meaning quiz questions (multiple choice)
 * @param {Array} verses - Array of Quran verses
 */
function createMeaningQuestions(verses) {
    // Shuffle verses and take a subset
    const shuffledVerses = shuffleArray([...verses]);
    const selectedVerses = shuffledVerses.slice(0, currentQuiz.totalQuestions);
    
    // Create questions
    selectedVerses.forEach(verse => {
        // Get the correct translation
        const correctTranslation = verse.translation;
        
        // Get 3 other random translations as distractors
        const otherVerses = verses.filter(v => v.translation !== correctTranslation);
        const shuffledOthers = shuffleArray([...otherVerses]);
        const distractors = shuffledOthers.slice(0, 3).map(v => v.translation);
        
        // Create all options and shuffle them
        const options = shuffleArray([correctTranslation, ...distractors]);
        
        // Add question to quiz
        currentQuiz.questions.push({
            questionText: verse.arabic,
            fullText: verse.arabic,
            transliteration: verse.transliteration,
            correctAnswer: correctTranslation,
            options: options,
            type: QUIZ_TYPES.MEANING
        });
    });
}

/**
 * Load the next question in the quiz
 */
function loadNextQuestion() {
    // Move to next question
    currentQuiz.currentQuestionIndex++;
    
    // Check if quiz is complete
    if (currentQuiz.currentQuestionIndex >= currentQuiz.questions.length) {
        endQuiz();
        return;
    }
    
    // Get current question
    const question = currentQuiz.questions[currentQuiz.currentQuestionIndex];
    
    // Update progress indicator
    document.getElementById('quizProgress').textContent = 
        `Question ${currentQuiz.currentQuestionIndex + 1} of ${currentQuiz.questions.length}`;
    
    // Reset UI elements
    document.getElementById('quizFeedback').textContent = '';
    document.getElementById('quizFeedback').className = 'quiz-feedback';
    document.getElementById('submitAnswerBtn').disabled = false;
    
    // Clear previous answer inputs
    const answerContainer = document.getElementById('quizAnswerContainer');
    answerContainer.innerHTML = '';
    
    // Display question based on type
    document.getElementById('quizQuestion').textContent = question.questionText;
    document.getElementById('quizTransliteration').textContent = question.transliteration || '';
    document.getElementById('quizTranslation').textContent = question.translation || '';
    
    // Setup answer interface based on quiz type
    setupAnswerInterface(question);
    
    // Show submit button and hide next button
    document.getElementById('submitAnswerBtn').classList.remove('hidden');
    document.getElementById('nextQuestionBtn').classList.add('hidden');
}

/**
 * Setup the answer interface based on question type
 * @param {Object} question - The current question
 */
function setupAnswerInterface(question) {
    const answerContainer = document.getElementById('quizAnswerContainer');
    
    switch(question.type) {
        case QUIZ_TYPES.WRITING:
            // Create input fields for each blank
            question.answers.forEach((answer, index) => {
                const inputGroup = document.createElement('div');
                inputGroup.className = 'quiz-input-group';
                
                const label = document.createElement('label');
                label.textContent = `Blank ${index + 1}:`;
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'quiz-answer-input';
                input.dir = 'rtl';
                input.setAttribute('data-index', index);
                
                inputGroup.appendChild(label);
                inputGroup.appendChild(input);
                answerContainer.appendChild(inputGroup);
            });
            break;
            
        case QUIZ_TYPES.SPEAKING:
            // Create recording interface
            const recordBtn = document.createElement('button');
            recordBtn.id = 'quizRecordBtn';
            recordBtn.className = 'quiz-record-btn';
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Answer';
            
            const playbackBtn = document.createElement('button');
            playbackBtn.id = 'quizPlaybackBtn';
            playbackBtn.className = 'quiz-playback-btn';
            playbackBtn.disabled = true;
            playbackBtn.innerHTML = '<i class="fas fa-play-circle"></i> Play Recording';
            
            const statusText = document.createElement('div');
            statusText.id = 'quizRecordingStatus';
            statusText.className = 'quiz-status-text';
            statusText.textContent = 'Click Record to start';
            
            answerContainer.appendChild(recordBtn);
            answerContainer.appendChild(playbackBtn);
            answerContainer.appendChild(statusText);
            
            // Add event listeners
            recordBtn.addEventListener('click', toggleQuizRecording);
            playbackBtn.addEventListener('click', playQuizRecording);
            break;
            
        case QUIZ_TYPES.MEANING:
            // Create multiple choice options
            question.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'quiz-option';
                
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'meaningOption';
                radio.id = `option${index}`;
                radio.value = option;
                
                const label = document.createElement('label');
                label.htmlFor = `option${index}`;
                label.textContent = option;
                
                optionDiv.appendChild(radio);
                optionDiv.appendChild(label);
                answerContainer.appendChild(optionDiv);
            });
            break;
    }
}

/**
 * Toggle recording for speaking quiz
 */
function toggleQuizRecording() {
    const recordBtn = document.getElementById('quizRecordBtn');
    const statusText = document.getElementById('quizRecordingStatus');
    
    if (recordBtn.classList.contains('recording')) {
        // Stop recording
        stopRecording();
        recordBtn.classList.remove('recording');
        recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record Answer';
        statusText.textContent = 'Recording complete';
        
        // Enable playback button
        document.getElementById('quizPlaybackBtn').disabled = false;
    } else {
        // Start recording
        startRecording();
        recordBtn.classList.add('recording');
        recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
        statusText.textContent = 'Recording...';
    }
}

/**
 * Play quiz recording
 */
function playQuizRecording() {
    playRecordedAudio();
}

/**
 * Submit the current quiz answer
 */
function submitQuizAnswer() {
    if (!currentQuiz || !quizActive) return;
    
    const question = currentQuiz.questions[currentQuiz.currentQuestionIndex];
    let isCorrect = false;
    let score = 0;
    
    switch(question.type) {
        case QUIZ_TYPES.WRITING:
            // Get user inputs
            const inputs = document.querySelectorAll('.quiz-answer-input');
            const userAnswers = Array.from(inputs).map(input => input.value.trim());
            
            // Check each answer
            const correctCount = userAnswers.filter((answer, index) => {
                // Simple string comparison for now
                return answer === question.answers[index];
            }).length;
            
            // Calculate score (partial credit for some correct answers)
            score = correctCount / question.answers.length;
            isCorrect = score === 1; // Only fully correct if all answers match
            
            // Show correct answers
            const feedbackText = isCorrect ? 
                'Correct!' : 
                `Correct answers: ${question.answers.join(', ')}`;
            
            showQuizFeedback(feedbackText, isCorrect ? 'success' : 'error');
            break;
            
        case QUIZ_TYPES.SPEAKING:
            // For speaking, we use the recorded audio and process with OpenAI
            if (recordedAudioUrl) {
                // Disable submit button while processing
                document.getElementById('submitAnswerBtn').disabled = true;
                
                // Show processing message
                showQuizFeedback('Processing your recitation...', '');
                
                // Get the audio blob from the URL
                fetch(recordedAudioUrl)
                    .then(response => response.blob())
                    .then(blob => {
                        // Process with OpenAI
                        processQuizAudioWithOpenAI(blob, question);
                    })
                    .catch(error => {
                        console.error('Error processing quiz audio:', error);
                        showQuizFeedback('Error processing audio: ' + error.message, 'error');
                    });
                
                // Return early since we'll handle the rest asynchronously
                return;
            } else {
                showQuizFeedback('Please record your answer first', 'error');
                return;
            }
            
        case QUIZ_TYPES.MEANING:
            // Get selected option
            const selectedOption = document.querySelector('input[name="meaningOption"]:checked');
            
            if (!selectedOption) {
                showQuizFeedback('Please select an answer', 'error');
                return;
            }
            
            // Check if correct
            isCorrect = selectedOption.value === question.correctAnswer;
            score = isCorrect ? 1 : 0;
            
            // Show feedback
            const meaningFeedback = isCorrect ? 
                'Correct!' : 
                `Incorrect. The correct translation is: "${question.correctAnswer}"`;
            
            showQuizFeedback(meaningFeedback, isCorrect ? 'success' : 'error');
            break;
    }
    
    // Update quiz score (except for speaking which is handled asynchronously)
    if (question.type !== QUIZ_TYPES.SPEAKING) {
        updateQuizScore(score);
        
        // Show next button and hide submit button
        document.getElementById('submitAnswerBtn').classList.add('hidden');
        document.getElementById('nextQuestionBtn').classList.remove('hidden');
    }
}

/**
 * Process quiz audio with OpenAI for speaking questions
 * @param {Blob} audioBlob - The recorded audio blob
 * @param {Object} question - The current question
 */
async function processQuizAudioWithOpenAI(audioBlob, question) {
    // Check if API key is available
    if (!apiKey) {
        showQuizFeedback('Please enter your OpenAI API key in the settings', 'error');
        document.getElementById('submitAnswerBtn').disabled = false;
        return;
    }
    
    try {
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
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Error processing audio');
        }
        
        // Get transcription
        const transcription = await response.text();
        
        // Compare with correct text
        await compareQuizRecitation(transcription, question);
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        showQuizFeedback('Error: ' + error.message, 'error');
        document.getElementById('submitAnswerBtn').disabled = false;
    }
}

/**
 * Compare quiz recitation with correct text
 * @param {string} transcription - The transcribed text from user's recitation
 * @param {Object} question - The current question
 */
async function compareQuizRecitation(transcription, question) {
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
                        content: `Compare the following recitation with the correct Quranic text.\n\nCorrect text: ${question.fullText}\n\nUser's recitation: ${transcription}\n\nProvide a score from 0 to 1 representing the accuracy of pronunciation.`
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
        let score;
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
            }
        }
        
        // Ensure score is between 0 and 1
        score = Math.max(0, Math.min(1, score));
        
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
        
        showQuizFeedback(feedbackMessage, score >= 0.6 ? 'success' : 'warning');
        
        // Update quiz score
        updateQuizScore(score);
        
        // Show next button and hide submit button
        document.getElementById('submitAnswerBtn').classList.add('hidden');
        document.getElementById('nextQuestionBtn').classList.remove('hidden');
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        showQuizFeedback('Error: ' + error.message, 'error');
        document.getElementById('submitAnswerBtn').disabled = false;
    }
}

/**
 * Show feedback for quiz answers
 * @param {string} message - The feedback message
 * @param {string} type - The type of feedback (success, error, warning, '')
 */
function showQuizFeedback(message, type) {
    const feedback = document.getElementById('quizFeedback');
    feedback.textContent = message;
    
    // Reset classes
    feedback.className = 'quiz-feedback';
    
    // Add type class if provided
    if (type) {
        feedback.classList.add(type);
    }
}

/**
 * Update the quiz score
 * @param {number} score - The score to add (0-1)
 */
function updateQuizScore(score) {
    // Add score to total
    quizScore += score;
    
    // Update display
    document.getElementById('quizScore').textContent = Math.round(quizScore);
}

/**
 * End the current quiz and show results
 */
function endQuiz() {
    quizActive = false;
    
    // Calculate final score as percentage
    const maxScore = currentQuiz.questions.length;
    const percentage = Math.round((quizScore / maxScore) * 100);
    
    // Show results
    const quizQuestion = document.getElementById('quizQuestion');
    quizQuestion.textContent = 'Quiz Complete!';
    
    const answerContainer = document.getElementById('quizAnswerContainer');
    answerContainer.innerHTML = `
        <div class="quiz-results">
            <h3>Your Final Score: ${percentage}%</h3>
            <p>${getFeedbackForScore(percentage)}</p>
            <button id="restartQuizBtn" class="quiz-restart-btn">
                <i class="fas fa-redo"></i> Take Another Quiz
            </button>
        </div>
    `;
    
    // Hide progress and other elements
    document.getElementById('quizProgress').textContent = '';
    document.getElementById('quizTransliteration').textContent = '';
    document.getElementById('quizTranslation').textContent = '';
    document.getElementById('quizFeedback').textContent = '';
    document.getElementById('submitAnswerBtn').classList.add('hidden');
    document.getElementById('nextQuestionBtn').classList.add('hidden');
    
    // Add event listener to restart button
    document.getElementById('restartQuizBtn').addEventListener('click', () => {
        document.getElementById('quizArea').classList.add('hidden');
        document.getElementById('quizSetup').classList.remove('hidden');
    });
}

/**
 * Get feedback message based on score percentage
 * @param {number} percentage - Score percentage
 * @returns {string} Feedback message
 */
function getFeedbackForScore(percentage) {
    if (percentage >= 90) {
        return 'Excellent! Your understanding of the Quran is impressive!';
    } else if (percentage >= 75) {
        return 'Great job! You have a good grasp of the material.';
    } else if (percentage >= 60) {
        return 'Good effort! Keep practicing to improve your knowledge.';
    } else if (percentage >= 40) {
        return 'You\'re making progress. Continue studying and practicing.';
    } else {
        return 'Keep learning and practicing. The journey of Quranic study takes time.';
    }
}

/**
 * Update the UI based on selected quiz type
 */
function updateQuizTypeUI() {
    const selectedType = document.querySelector('input[name="quizType"]:checked').value;
    const description = document.getElementById('quizTypeDescription');
    
    switch(selectedType) {
        case QUIZ_TYPES.WRITING:
            description.textContent = 'Fill in the missing words in Quranic verses to test your writing skills.';
            break;
        case QUIZ_TYPES.SPEAKING:
            description.textContent = 'Record yourself reciting verses to test your pronunciation.';
            break;
        case QUIZ_TYPES.MEANING:
            description.textContent = 'Select the correct translation to test your understanding of verses.';
            break;
    }
}

/**
 * Utility function to shuffle an array
 * @param {Array} array - The array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Get random indices from a range
 * @param {number} max - Maximum index (exclusive)
 * @param {number} count - Number of indices to get
 * @returns {Array} Array of random indices
 */
function getRandomIndices(max, count) {
    const indices = [];
    while (indices.length < count && indices.length < max) {
        const index = Math.floor(Math.random() * max);
        if (!indices.includes(index)) {
            indices.push(index);
        }
    }
    return indices;
}

// Initialize the quiz module when the DOM is loaded
document.addEventListener('DOMContentLoaded', initQuiz);
