import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not defined');
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const { message, context, history } = await request.json();

    // Convert chat history to the expected format:
    // Map any "assistant" role to "model" (valid roles: "user", "model", "function", "system")
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    const systemPrompt = `
      You are a helpful Food Donation Assistant chatbot for a food donation platform.
      
      Current context:
      - User has made ${context.userDonationCount} donations.
      - The community has made ${context.totalCommunityDonations} donations total.
      - There are ${context.pendingRequests} pending food requests awaiting fulfillment.
      - User ${context.userHasDonated ? 'has donated before' : 'has not donated yet'}.
      ${context.recentDonationDate ? `- User's most recent donation was on ${context.recentDonationDate}.` : ''}
      - Top donation categories: ${context.topCategories.join(', ')}.
      - User is ${context.isLoggedIn ? 'logged in' : 'not logged in'}.
      
      Your role:
      1. Help users understand their donation impact and community contribution
      2. Provide information about needed food items and areas that need support
      3. Guide users on how to make monetary or food donations
      4. Answer questions about the platform's features
      5. Be encouraging and positive about donation efforts
      
      Be concise, helpful, and friendly. If you don't know something specific, suggest where they might find that information on the dashboard.
    `;

    // Use a model identifier that is supported by your API version.
    // Here we try "text-bison@001", which is commonly available.
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "I understand my role as a Food Donation Assistant. How can I help with food donations today?" }],
        },
        ...formattedHistory.slice(1) // Optionally skip the initial greeting if needed
      ],
    });

    console.log('Sending message to Generative AI:', message);

    const result = await chat.sendMessage(message);
    if (!result.response) {
      console.error('No response received from Generative AI:', result);
      throw new Error('No response received from Generative AI');
    }
    const response = await result.response;
    const text = response.text();

    return Response.json({ response: text });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return Response.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
}
