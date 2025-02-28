import express from 'express';
import { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { PROMPT_1 } from './prompt';
import cors from 'cors';
import { TriviaResponse, PostBody, ErrorResponse, Category } from '../../../common/types/api';

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

function serializeCategory(category: Category): string {
  const { easy, medium, hard } = category.difficulties;
  return `{The topic of ${category.topic} should have ${easy} easy, ${medium} medium, and ${hard} hard questions}`;
}

app.post('/api/generateTrivia', async (req: Request<{}, {}, PostBody>, res: Response<TriviaResponse | ErrorResponse>) => {
  const { categories } = req.body;

  if (!categories || categories.length === 0) {
    res.status(400).json({ error: 'Missing field: category' });
  }

  const categoriesPrompt =
    '[' +
    categories.map((category, i) => {
      return serializeCategory(category) + (i === categories.length ? ', ' : '');
    }) +
    ']';

  const thePrompt = PROMPT_1.replace('{categories}', categoriesPrompt);

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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
