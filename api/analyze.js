// TiffinAI — Recipe Analysis API
// Vercel Serverless Function
// Deploy: vercel --prod

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, image, ingredients, language = 'English' } = req.body || {};

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    let messages = [];

    const systemPrompt = `You are TiffinAI, an expert Indian chef and nutritionist who knows every regional Indian cuisine deeply — from Tamil Nadu's Chettinad dishes to Bengali fish curries, Punjabi dals, Hyderabadi biryanis, Maharashtrian street food, and Kerala seafood.

Your job: Given a list of ingredients (detected from a photo or typed by the user), suggest 3 practical, delicious Indian recipes they can make RIGHT NOW with what they have.

Respond ONLY with valid JSON in this exact structure:
{
  "detected_ingredients": "comma-separated list of what you found",
  "recipes": [
    {
      "name": "Recipe Name",
      "time": "20 mins",
      "tags": ["veg", "easy"],
      "ingredients": ["1 cup rice", "2 tomatoes", "..."],
      "steps": ["Heat oil in pan...", "Add onions...", "..."],
      "tip": "Optional chef's tip for best results"
    }
  ]
}

Tags allowed: "veg", "nonveg", "spicy", "easy", "quick"
Always give exactly 3 recipes.
Respond in ${language} language — all recipe names, steps and tips should be in ${language}.
Keep steps practical, clear and beginner-friendly.
Prefer recipes that use MOST of the detected ingredients.
Include at least one quick recipe (under 20 mins).`;

    if (type === 'image' && image) {
      messages = [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: image
            }
          },
          {
            type: 'text',
            text: 'Please identify all the food ingredients, vegetables, spices, and grocery items visible in this photo of my kitchen/fridge/pantry. Then suggest 3 Indian recipes I can make with these ingredients.'
          }
        ]
      }];
    } else if (type === 'text' && ingredients) {
      messages = [{
        role: 'user',
        content: `I have these ingredients: ${ingredients}\n\nSuggest 3 Indian recipes I can make right now.`
      }];
    } else {
      return res.status(400).json({ error: 'Provide either image or ingredients text' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Claude API error');
    }

    const rawText = data.content[0]?.text || '';

    // Parse JSON safely
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse recipe response');

    const parsed = JSON.parse(jsonMatch[0]);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('TiffinAI Error:', err);
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
