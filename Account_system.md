How It Works
User Registration:
Users can create an account with a username and password
They can optionally add their OpenAI API key during registration
Passwords are hashed before storage (using a simple hash for demonstration)
User Login:
Users can log in with their credentials
Upon login, their saved API key (if any) is loaded automatically
API Key Management:
When logged in, API keys are saved to the user's account
Even without an account, users can still use API keys for the current session
Security Notes:
All data is stored in the browser's localStorage
This is a client-side solution, so it's suitable for demonstration or personal use
For a production app, you would want server-side authentication