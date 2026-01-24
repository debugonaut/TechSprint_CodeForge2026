const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const cheerio = require('cheerio');

// Initialize Gemini with v1 API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

const scrapeContent = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      }
    });
    const $ = cheerio.load(data);
    
    // Remove scripts, styles, etc.
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('footer').remove();
    
    // Get main text
    let text = $('body').text().replace(/\s+/g, ' ').trim();
    return text.substring(0, 50000); // Limit context window
  } catch (error) {
    console.error("Scraping failed:", error.message);
    return null; // Fallback to using just the metadata provided
  }
};

const summarizeContent = async ({ url, title, description, content_text, platform }) => {
  try {
    // 1. Scrape if URL is provided and we don't have rich text
    let contextText = content_text;
    if (url && (!content_text || content_text.length < 50)) {
        console.log(`Scraping ${url}...`);
        const scraped = await scrapeContent(url);
        if (scraped) contextText = scraped;
    }

    // 2. Prepare Prompt
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      You are RecallBin AI. Your goal is to summarize web content for future recall.
      
      Input Data:
      URL: ${url}
      Title: ${title}
      Context: ${contextText ? contextText.substring(0, 10000) : "No text available, infer from title"}
      
      Output ONLY valid JSON (no markdown formatting) with this structure:
      {
        "title": "Short, descriptive title (3-6 words capturing the main topic)",
        "content_type": "article|video|documentation|tool|other",
        "summary": "2 sentences explaining what this is and why I might want to save it.",
        "key_ideas": ["3 bullet points", "capturing main value"],
        "tags": ["5", "lowercase", "keywords"],
        "entities": ["Names", "Companies", "Tools"],
        "tone": "informative|technical|entertainment",
        "confidence_level": "high|medium|low",
        "suggested_search_queries": ["how to...", "what is..."]
      }
    `;

    // 3. Call AI
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);

  } catch (error) {
    console.error("AI Generation failed:", error);
    // Fallback Mock if API fails (e.g. no key)
    return {
      content_type: "unknown",
      summary: "Could not generate AI summary (Check API Key).",
      key_ideas: ["Ensure GEMINI_API_KEY is set in backend/.env"],
      tags: ["error", "setup-required"],
      entities: [],
      tone: "neutral",
      confidence_level: "low",
      suggested_search_queries: []
    };
  }
};

module.exports = { summarizeContent };
