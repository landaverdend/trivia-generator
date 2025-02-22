import { PostBody } from '../types/api';

export async function generateTrivia(data: PostBody) {
  const response = await fetch('http://localhost:3000/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  console.log(result);
}
