/**
 * Allah Intelligence - Cloudflare Worker
 * 
 * This worker securely handles API requests to OpenAI and AssemblyAI
 * without exposing API keys to the client.
 * 
 * Environment Variables Required:
 * - OPENAI_API_KEY: Your OpenAI API key
 * - ASSEMBLYAI_API_KEY: Your AssemblyAI API key
 */

// Define allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'https://allah-intelligence.netlify.app',
  'https://allah-intelligence.pages.dev'
];

// Handle incoming requests
export default {
  async fetch(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    // Get the request URL
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route requests based on the path
      if (path === '/api/openai/transcribe') {
        return await handleOpenAITranscription(request, env);
      } else if (path === '/api/openai/tts') {
        return await handleOpenAITTS(request, env);
      } else if (path === '/api/openai/compare') {
        return await handleOpenAIComparison(request, env);
      } else if (path === '/api/assemblyai/transcribe') {
        return await handleAssemblyAITranscription(request, env);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(request)
        }
      });
    }
  }
};

/**
 * Handle CORS preflight requests
 */
function handleCORS(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request)
  });
}

/**
 * Generate CORS headers for the response
 */
function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

/**
 * Handle OpenAI Whisper API transcription requests
 */
async function handleOpenAITranscription(request, env) {
  // Check if we have the API key
  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  // Clone the request to forward to OpenAI
  const formData = await request.formData();
  const audioFile = formData.get('file');
  
  if (!audioFile) {
    return new Response(JSON.stringify({ error: 'No audio file provided' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  // Create a new FormData object to send to OpenAI
  const openAIFormData = new FormData();
  openAIFormData.append('file', audioFile);
  openAIFormData.append('model', 'whisper-1');
  openAIFormData.append('response_format', 'text'); // Using text format for simplicity
  openAIFormData.append('language', 'ar'); // Force Arabic language interpretation
  openAIFormData.append('prompt', 'هذا نص باللغة العربية. أرجو تفريغه بدقة بالحروف العربية.'); // Prompt to encourage Arabic script output

  // Forward the request to OpenAI
  const openAIResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`
    },
    body: openAIFormData
  });

  // Check if the request was successful
  if (!openAIResponse.ok) {
    const errorData = await openAIResponse.json();
    return new Response(JSON.stringify({ error: errorData.error?.message || 'Error processing audio' }), {
      status: openAIResponse.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  // Get the transcription text
  const transcription = await openAIResponse.text();

  // Return the transcription
  return new Response(transcription, {
    headers: {
      'Content-Type': 'text/plain',
      ...corsHeaders(request)
    }
  });
}

/**
 * Handle OpenAI TTS API requests
 */
async function handleOpenAITTS(request, env) {
  // Check if we have the API key
  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  // Get the request body
  const requestData = await request.json();
  
  // Forward the request to OpenAI
  const openAIResponse = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: requestData.voice || 'nova',
      input: requestData.text
    })
  });

  // Check if the request was successful
  if (!openAIResponse.ok) {
    const errorData = await openAIResponse.json();
    return new Response(JSON.stringify({ error: errorData.error?.message || 'Error generating speech' }), {
      status: openAIResponse.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  // Return the audio data
  return new Response(await openAIResponse.arrayBuffer(), {
    headers: {
      'Content-Type': 'audio/mpeg',
      ...corsHeaders(request)
    }
  });
}

/**
 * Handle OpenAI GPT API comparison requests
 */
async function handleOpenAIComparison(request, env) {
  // Check if we have the API key
  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  // Get the request body
  const requestData = await request.json();
  
  // Forward the request to OpenAI
  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: requestData.messages,
      temperature: requestData.temperature || 0.3,
      max_tokens: requestData.max_tokens || 150
    })
  });

  // Check if the request was successful
  if (!openAIResponse.ok) {
    const errorData = await openAIResponse.json();
    return new Response(JSON.stringify({ error: errorData.error?.message || 'Error processing comparison' }), {
      status: openAIResponse.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  // Return the comparison result
  const result = await openAIResponse.json();
  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request)
    }
  });
}

/**
 * Handle AssemblyAI transcription requests
 * Using the nano model for Arabic transcription
 */
async function handleAssemblyAITranscription(request, env) {
  // Check if we have the API key
  if (!env.ASSEMBLYAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'AssemblyAI API key not configured' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  // Get the audio file from the request
  const formData = await request.formData();
  const audioFile = formData.get('file');
  
  if (!audioFile) {
    return new Response(JSON.stringify({ error: 'No audio file provided' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  // Step 1: Upload the audio file to AssemblyAI
  const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'Authorization': env.ASSEMBLYAI_API_KEY,
      'Content-Type': 'application/octet-stream'
    },
    body: await audioFile.arrayBuffer()
  });

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json();
    return new Response(JSON.stringify({ error: errorData.error || 'Error uploading audio' }), {
      status: uploadResponse.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  const uploadResult = await uploadResponse.json();
  const audioUrl = uploadResult.upload_url;

  // Step 2: Transcribe the uploaded audio using the nano model for Arabic
  // Always force Arabic language interpretation regardless of actual content
  const transcribeResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'Authorization': env.ASSEMBLYAI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      language_code: 'ar',  // Force Arabic language code
      speech_model: 'nano',  // Must use 'nano' model for Arabic as per AssemblyAI docs
      language_detection: false  // Disable automatic language detection
    })
  });

  if (!transcribeResponse.ok) {
    const errorData = await transcribeResponse.json();
    return new Response(JSON.stringify({ error: errorData.error || 'Error starting transcription' }), {
      status: transcribeResponse.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  const transcribeResult = await transcribeResponse.json();
  const transcriptId = transcribeResult.id;

  // Step 3: Poll for the transcription result
  let transcriptResult;
  let attempts = 0;
  const maxAttempts = 60; // Maximum polling attempts (60 * 1s = 60 seconds max)
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Wait 1 second between polling attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      method: 'GET',
      headers: {
        'Authorization': env.ASSEMBLYAI_API_KEY
      }
    });
    
    if (!pollingResponse.ok) {
      const errorData = await pollingResponse.json();
      return new Response(JSON.stringify({ error: errorData.error || 'Error polling for transcription' }), {
        status: pollingResponse.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(request)
        }
      });
    }
    
    transcriptResult = await pollingResponse.json();
    
    // Check if the transcription is complete
    if (transcriptResult.status === 'completed') {
      break;
    } else if (transcriptResult.status === 'error') {
      return new Response(JSON.stringify({ error: transcriptResult.error || 'Transcription error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(request)
        }
      });
    }
  }
  
  if (attempts >= maxAttempts) {
    return new Response(JSON.stringify({ error: 'Transcription timed out' }), {
      status: 504,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request)
      }
    });
  }

  // Return the transcription result
  return new Response(JSON.stringify({
    text: transcriptResult.text,
    confidence: transcriptResult.confidence
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request)
    }
  });
}
