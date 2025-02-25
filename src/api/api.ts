import { PostBody, TriviaResponse } from '../types/api';

export async function generateTrivia(data: PostBody): Promise<TriviaResponse> {
  const response = await fetch('http://localhost:3000/api/generateTrivia', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return result;
}
