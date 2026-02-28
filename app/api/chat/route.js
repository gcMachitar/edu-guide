export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a friendly and helpful study buddy who helps students learn and understand complex topics. Provide clear, concise, and encouraging responses.' },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return Response.json(
        { error: data.error.message || 'API Error' },
        { status: 500 }
      );
    }

    const aiResponse = data?.choices?.[0]?.message?.content || 'No response received';

    return Response.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat API Error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
