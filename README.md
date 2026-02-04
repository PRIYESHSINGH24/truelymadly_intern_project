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

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

4. On first load, the Settings modal will appear - enter your API keys:
   - **Gemini API Key** (required): Get it from [Google AI Studio](https://aistudio.google.com/)
   - **OpenWeather API Key** (optional): For weather queries
   - **GitHub Token** (optional): For GitHub search queries

## Usage

1. Configure your API keys in the Settings modal (opens automatically on first visit)
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
