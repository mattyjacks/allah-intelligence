# Allah Intelligence

A modern Quran Teaching Tool that uses AI to help users learn and improve their Quranic recitation.

## Overview

Allah Intelligence is an interactive web application designed to teach Quranic recitation using AI technology. The application leverages the OpenAI API to analyze and score users' pronunciation of Quranic verses.

## Features

- **Dual Language Modes**: Practice in both Arabic and English
- **Multiple Difficulty Levels**: Beginner, Intermediate, and Advanced verses
- **Real-time Feedback**: Get instant scoring on your pronunciation accuracy
- **Audio Playback**: Listen to the correct pronunciation of verses
- **Speech Recognition**: Record your recitation and get AI-powered feedback
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. The application displays a Quranic verse in Arabic (or English in testing mode)
2. User can listen to the correct pronunciation by clicking the Play button
3. User records their recitation by clicking the Record button
4. The application uses OpenAI's API to analyze the pronunciation accuracy
5. A score is provided based on how closely the user's recitation matches the original text
6. User can continue practicing with new verses by clicking the Next button

## Technical Implementation

- **Frontend**: HTML, CSS, and JavaScript
- **AI Integration**: OpenAI API (Whisper for speech-to-text and GPT for comparison)
- **Audio Processing**: Web Audio API and MediaRecorder API
- **Speech Synthesis**: Web Speech API

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. Enter your OpenAI API key in the settings panel
4. Select your preferred mode and difficulty level
5. Start practicing!

## Requirements

- Modern web browser (Chrome, Firefox, Edge recommended)
- Microphone access
- OpenAI API key

## Privacy Note

Your audio recordings are processed using the OpenAI API and are subject to OpenAI's privacy policy. The application does not store your recordings or transcriptions beyond the current session.

## License

This project is open source and available for educational purposes.
