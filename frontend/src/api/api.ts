import { PostBody, TriviaResponse } from '../types/api';

const API_URL = window.location.hostname === 'localhost' ? `http://localhost:3001` : ``; // Use relative path instead

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

export const regenerateQuestion = async (topic: string, difficulty: string) => {
  const response = await fetch(`${API_URL}/api/regenerateQuestion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, difficulty }),
  });

  if (!response.ok) {
    throw new Error('Failed to regenerate question');
  }

  return response.json();
};
