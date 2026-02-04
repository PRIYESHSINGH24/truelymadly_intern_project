# AI Ops Assistant

A multi-agent AI assistant built with React and TypeScript. Features a Planner, Executor, and Verifier architecture powered by the Gemini API.

## Features

- **Multi-Agent Architecture**: Planner analyzes tasks, Executor runs them, Verifier synthesizes results
- **GitHub Integration**: Search and explore GitHub repositories
- **Weather Integration**: Get current weather data for any city
- **Modern UI**: Dark theme with glassmorphism design
- **Real-time Terminal**: Live execution logs with color-coded output

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Google Gemini API
- GitHub API
- OpenWeather API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Gemini API Key

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and add your API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Usage

1. Click the settings icon to configure your API keys
2. Enter a task in natural language (e.g., "Search for React repos on GitHub" or "What's the weather in London?")
3. Click RUN to execute the multi-agent workflow

## Available Tools

- **GitHub Tool**: Search repositories by query and optional language filter
- **Weather Tool**: Get current weather conditions for any city

## Build for Production

```bash
npm run build
npm run preview
```
