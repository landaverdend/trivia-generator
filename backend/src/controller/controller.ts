import express from 'express';
import { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import { PROMPT_1, REGENERATE_PROMPT, STREAMING_PROMPT } from './prompt';
import { TriviaResponse, PostBody, ErrorResponse, Category } from './api';

dotenv.config();
const PORT = process.env.PORT || 3001;

const client = new OpenAI({
  apiKey: process.env[process.env.OPENAI_API_KEY as string], // This is the default and can be omitted
});

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://trivia.landaverde.in', // Remove trailing slash
  'http://trivia.landaverde.in', // Add HTTP version
];

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Add these constants at the top
const MAX_QUESTIONS_PER_ROUND = 15;
const MAX_RETRIES = 3;
const MAX_TOKENS = 1000; // Conservative token limit for single questions
const MAX_TOKENS_BULK = 4000; // For generating multiple questions

function serializeCategory(category: Category): string {
  const { easy, medium, hard } = category.difficulties;
  const notesText = category.additionalInfo ? ` with these specific notes: ${category.additionalInfo}` : '';
  return `{The topic of ${category.topic} should have ${easy} easy, ${medium} medium, and ${hard} hard questions, with the following additional info as inputted by the user: ${notesText}}`;
}

app.post('/api/generateTrivia', async (req: Request<{}, {}, PostBody>, res: Response<TriviaResponse | ErrorResponse>) => {
  const { categories } = req.body;

  if (!categories || categories.length === 0) {
    return res.status(400).json({ error: 'Missing field: category' });
  }

  for (const category of categories) {
    // Add question limit check
    const totalQuestions = category.difficulties.easy + category.difficulties.medium + category.difficulties.hard;

    if (totalQuestions > MAX_QUESTIONS_PER_ROUND) {
      return res.status(400).json({
        error: `Too many questions requested. Maximum is ${MAX_QUESTIONS_PER_ROUND} per round.`,
      });
    }
  }

  const categoriesPrompt =
    '[' + categories.map((category, i) => serializeCategory(category) + (i === categories.length ? ', ' : '')).join('') + ']';

  const thePrompt = PROMPT_1.replace('{categories}', categoriesPrompt);

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: [{ role: 'user', content: thePrompt }],
        model: 'gpt-4',
        max_tokens: MAX_TOKENS_BULK,
        temperature: 0.7,
      };

      const response = await client.chat.completions.create(params);
      const message = response.choices[0].message.content as string;
      const ret = JSON.parse(message.replace(/^```json\n/, '').replace(/\n```$/, '') as string);

      return res.status(200).json(ret as TriviaResponse);
    } catch (error) {
      attempts++;
      if (attempts === MAX_RETRIES) {
        console.error('Max retries reached:', error);
        return res.status(500).json({ error: 'Failed to generate questions after multiple attempts' });
      }
      // Wait 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
});

app.post('/api/regenerateQuestion', async (req: Request, res: Response) => {
  const { topic, difficulty, previousQuestion } = req.body;

  if (!topic || !difficulty) {
    return res.status(400).json({ error: 'Missing topic or difficulty' });
  }

  const prompt = REGENERATE_PROMPT.replace('{topic}', topic)
    .replace('{difficulty}', difficulty)
    .replace('{previousQuestion}', previousQuestion);

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    try {
      const params: OpenAI.Chat.ChatCompletionCreateParams = {
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4',
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
      };

      const response = await client.chat.completions.create(params);
      const message = response.choices[0].message.content as string;
      const questionData = JSON.parse(message.replace(/^```json\n/, '').replace(/\n```$/, ''));

      return res.status(200).json({
        ...questionData,
        difficulty,
        topic,
      });
    } catch (error) {
      attempts++;
      if (attempts === MAX_RETRIES) {
        console.error('Max retries reached:', error);
        return res.status(500).json({ error: 'Failed to regenerate question after multiple attempts' });
      }
      // Wait 1 second before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
});

app.post('/api/streamTrivia', async (req: Request<{}, {}, PostBody>, res: Response) => {
  const { categories } = req.body;

  if (!categories || categories.length === 0) {
    return res.status(400).json({ error: 'Missing field: category' });
  }

  // Validate question counts
  for (const category of categories) {
    const totalQuestions = category.difficulties.easy + category.difficulties.medium + category.difficulties.hard;
    if (totalQuestions > MAX_QUESTIONS_PER_ROUND) {
      return res.status(400).json({
        error: `Too many questions requested. Maximum is ${MAX_QUESTIONS_PER_ROUND} per round.`,
      });
    }
  }

  // Set up streaming headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const categoriesPrompt =
    '[' + categories.map((category, i) => serializeCategory(category) + (i === categories.length - 1 ? '' : ', ')).join('') + ']';

  const thePrompt = STREAMING_PROMPT.replace('{categories}', categoriesPrompt);

  try {
    const stream = await client.chat.completions.create({
      messages: [{ role: 'user', content: thePrompt }],
      model: 'gpt-4',
      max_tokens: MAX_TOKENS_BULK,
      temperature: 1.1,
      stream: true,
    });

    let buffer = '';

    // Process the stream
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      buffer += content;

      // Try to extract complete JSON objects from the buffer
      while (true) {
        const jsonEndIndex = buffer.indexOf('}\n');
        if (jsonEndIndex === -1) break;

        const jsonStr = buffer.slice(0, jsonEndIndex + 1);
        buffer = buffer.slice(jsonEndIndex + 2); // Remove processed JSON and newline

        try {
          const question = JSON.parse(jsonStr);
          // Send the parsed question to the client
          res.write(`data: ${JSON.stringify(question)}\n\n`);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          continue;
        }
      }
    }

    // Send any remaining complete JSON in the buffer
    if (buffer.trim()) {
      try {
        const question = JSON.parse(buffer);
        res.write(`data: ${JSON.stringify(question)}\n\n`);
      } catch (e) {
        console.error('Failed to parse final JSON:', e);
      }
    }

    // Send completion message
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate questions' })}\n\n`);
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
