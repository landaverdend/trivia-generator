import express from 'express';
import { Request, Response } from 'express';
import { TriviaResponse, PostBody, ErrorResponse } from '../types/api';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const client = new OpenAI({
  apiKey: process.env[process.env.OPENAI_API_KEY as string], // This is the default and can be omitted
});

const port = 3000;
const app = express();

app.use(express.json());

app.post('/api/generateTrivia', async (req: Request<{}, {}, PostBody>, res: Response<TriviaResponse | ErrorResponse>) => {
  if (!req.body.categories || req.body.categories.size == 0) {
    res.status(400).json({ error: 'Missing field: category' });
  }

  if (!req.body.triviaRounds || !req.body.numQuestions) {
    res.status(400).json({ error: 'Missing field: triviaRounds or numQuestions' });
  }

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages: [
      {
        role: 'user',
        content: 'Please give me a random trivia questio about south america, alongside a source url for the factoid.',
      },
    ],
    model: 'gpt-4o',
  };

  await client.chat.completions.create(params);

  res.status(200).json({ question: 'fasdf', answer: 'asdf', source: 'am one' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
