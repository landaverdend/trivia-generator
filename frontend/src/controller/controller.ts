// src/index.ts
import express from 'express';
import { Router, Request, Response } from 'express';

const app = express();
const port = 3000;

const router = Router();
app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Define a route that sends "Hello, World!" when accessed
router.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});
