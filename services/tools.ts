import { AppConfig } from '../types';

export const TOOLS_DEFINITION = `
Tools available:
1. github_tool:
   - action: "search"
   - params: { "query": string, "language": string (optional) }
   - Description: Search for GitHub repositories. Returns name, stars, url, description.

2. weather_tool:
   - action: "get_current"
   - params: { "city": string }
   - Description: Get current weather for a city. Returns temp, condition, humidity.
`;

export const githubTool = async (params: { query: string; language?: string }, config: AppConfig) => {
  const { query, language } = params;
  let q = query;
  if (language) {
    q += ` language:${language}`;
  }
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (config.githubToken) {
    headers['Authorization'] = `token ${config.githubToken}`;
  }

  try {
    const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=5`, {
      headers
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items.map((repo: any) => ({
      name: repo.full_name,
      description: repo.description,
      stars: repo.stargazers_count,
      url: repo.html_url,
      language: repo.language
    }));
  } catch (error: any) {
    throw new Error(`GitHub Tool Failed: ${error.message}`);
  }
};

export const weatherTool = async (params: { city: string }, config: AppConfig) => {
  const { city } = params;
  if (!config.openWeatherApiKey) {
    throw new Error("OpenWeather API Key is missing in settings.");
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${config.openWeatherApiKey}&units=metric`);
    
    if (!response.ok) {
      if (response.status === 401) throw new Error("Invalid OpenWeather API Key.");
      if (response.status === 404) throw new Error(`City '${city}' not found.`);
      throw new Error(`Weather API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      city: data.name,
      temperature: data.main.temp,
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed
    };
  } catch (error: any) {
    throw new Error(`Weather Tool Failed: ${error.message}`);
  }
};