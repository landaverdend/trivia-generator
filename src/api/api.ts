import { PostBody, TriviaResponse } from '../types/api';

const API_URL = `http://${window.location.hostname}:3000`;

export async function generateTrivia(data: PostBody): Promise<TriviaResponse> {
  const response = await fetch(`${API_URL}/api/generateTrivia`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return result;
}
