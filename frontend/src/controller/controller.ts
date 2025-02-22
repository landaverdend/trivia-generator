import express from 'express';
import { Request, Response } from 'express';
import { PostBody } from '../types/api';
const port = 3000;
const app = express();
app.use(express.json());

app.post('/api/generateTrivia', (req: Request<{}, {}, PostBody>, res: Response) => {
  const str = JSON.stringify(req.body);

  console.log(str);
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
