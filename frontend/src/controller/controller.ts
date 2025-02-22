import express from 'express';
import { Request, Response } from 'express';
import { TriviaResponse, PostBody, ErrorResponse } from '../types/api';
const port = 3000;
const app = express();

app.use(express.json());

app.post('/api/generateTrivia', (req: Request<{}, {}, PostBody>, res: Response<TriviaResponse | ErrorResponse>) => {
  if (!req.body.categories || req.body.categories.size == 0) {
    res.status(400).json({ error: 'Missing field: category' });
  }

  if (!req.body.triviaRounds || !req.body.numQuestions) {
    res.status(400).json({ error: 'Missing field: triviaRounds or numQuestions' });
  }

});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
