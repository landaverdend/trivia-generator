import express from 'express';
import { Request, Response } from 'express';
import { TriviaResponse, PostBody, ErrorResponse, Category } from '../types/api';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { PROMPT_1 } from './prompt';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const client = new OpenAI({
  apiKey: process.env[process.env.OPENAI_API_KEY as string], // This is the default and can be omitted
});

const port = 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.options('*', cors()); // Enable pre-flight for all requests

function serializeCategory(category: Category): string {
  const { easy, medium, hard } = category.difficulties;
  return `{The topic of ${category.topic} should have ${easy} easy, ${medium} medium, and ${hard} hard questions}`;
}

app.post('/api/generateTrivia', async (req: Request<{}, {}, PostBody>, res: Response<TriviaResponse | ErrorResponse>) => {
  const { categories, numQuestions, triviaRounds } = req.body;

  if (!categories || categories.length === 0) {
    res.status(400).json({ error: 'Missing field: category' });
  }

  if (!triviaRounds || !numQuestions) {
    res.status(400).json({ error: 'Missing field: triviaRounds or numQuestions' });
  }

  const categoriesPrompt =
    '[' +
    categories.map((category, i) => {
      return serializeCategory(category) + (i === categories.length ? ', ' : '');
    }) +
    ']';
  console.log(categories);

  const thePrompt = PROMPT_1.replace('{triviaRounds}', triviaRounds.toString())
    .replace('{numQuestions}', numQuestions.toString())
    .replace('{categories}', categoriesPrompt);
  console.log(thePrompt);

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages: [
      {
        role: 'user',
        content: thePrompt,
      },
    ],
    model: 'gpt-4o',
  };

  const response = await client.chat.completions.create(params);
  const message = response.choices[0].message.content as string;
  const ret = JSON.parse(message.replace(/^```json\n/, '').replace(/\n```$/, '') as string);

  res.status(200).json(ret as TriviaResponse);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
