# Allah Intelligence Cloudflare Worker

This Cloudflare Worker acts as a secure proxy between the client application and the OpenAI and AssemblyAI APIs. It protects your API keys by storing them as environment variables in Cloudflare Workers rather than exposing them in client-side code.

## Setup Instructions

### 1. Create a Cloudflare Account
If you don't already have one, sign up for a free Cloudflare account at [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).

### 2. Create a New Worker
1. Go to the Cloudflare Dashboard
2. Navigate to "Workers & Pages"
3. Click "Create Application"
4. Select "Create Worker"
5. Give your worker a name (e.g., "allah-intelligence-api-proxy")
6. Click "Deploy"

### 3. Replace the Worker Code
1. After deployment, click "Edit code"
2. Replace the default code with the contents of `worker.js` in this directory
3. Click "Save and Deploy"

### 4. Configure Environment Variables
1. Go to your worker's settings
2. Click on "Variables" in the left sidebar
3. Under "Environment Variables", click "Add variable"
4. Add the following variables:
   - Name: `OPENAI_API_KEY`, Value: Your OpenAI API key
   - Name: `ASSEMBLYAI_API_KEY`, Value: Your AssemblyAI API key
5. Click "Save and Deploy"

### 5. Configure CORS (Optional)
If your application is hosted on a domain not included in the `ALLOWED_ORIGINS` array in the worker code, you'll need to add it:
1. Edit the worker code
2. Add your domain to the `ALLOWED_ORIGINS` array
3. Save and deploy the changes

## API Endpoints

The worker exposes the following endpoints:

- `/api/openai/transcribe` - Transcribe audio using OpenAI's Whisper API
- `/api/openai/tts` - Generate speech using OpenAI's TTS API
- `/api/openai/compare` - Compare text using OpenAI's GPT API
- `/api/assemblyai/transcribe` - Transcribe Arabic audio using AssemblyAI's nano model

## Usage

Update your client-side code to use the worker URL instead of directly calling the OpenAI or AssemblyAI APIs. For example:

```javascript
// Instead of calling OpenAI directly:
// fetch('https://api.openai.com/v1/audio/transcriptions', {...})

// Call your worker:
fetch('https://your-worker-name.your-account.workers.dev/api/openai/transcribe', {...})
```
