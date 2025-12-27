# MedExplain Setup Guide

## Prerequisites

- Node.js 18+ and npm
- A Supabase account
- An n8n instance (cloud or self-hosted)

## Quick Start

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```

3. Configure your environment variables in `.env`:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_N8N_WEBHOOK_URL`: Your n8n webhook endpoint
   - `OPENAI_API_KEY`: OpenAI API key (for edge functions)

4. Run database migrations (if not already applied):
   ```bash
   # Migrations are in supabase/migrations/
   # Apply them through your Supabase dashboard or CLI
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Supabase Configuration

Get these from your [Supabase project settings](https://app.supabase.com):
- Go to Project Settings > API
- Copy the Project URL and anon/public key

### N8N Webhook

Set up an n8n workflow that:
- Accepts POST requests with medical query data
- Processes the query through your medical information pipeline
- Returns structured JSON responses

### OpenAI API Key

Only needed if you're using OpenAI in your edge functions.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Core libraries (auth, supabase)
├── pages/          # Page components
├── utils/          # Utility functions
└── main.tsx        # Application entry point

supabase/
├── functions/      # Supabase Edge Functions
└── migrations/     # Database migrations
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Troubleshooting

### Environment Variables Not Loading

Make sure your `.env` file is in the root directory and all variables start with `VITE_` for client-side access.

### Database Connection Issues

Verify your Supabase credentials are correct and your project is active.

### Build Errors

Run `npm run typecheck` to check for TypeScript errors before building.
