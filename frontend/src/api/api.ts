import { PostBody, TriviaError, TriviaResponse, TriviaQuestion } from '../types/api';

const API_URL = window.location.hostname === 'localhost' ? `http://localhost:3001` : ``; // Use relative path instead

export async function generateTrivia(data: PostBody): Promise<TriviaResponse | TriviaError> {
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

export async function* streamGenerateTrivia(data: PostBody) {
  const response = await fetch(`${API_URL}/api/streamTrivia`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.body) {
    throw new Error('No response body available');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep the last incomplete chunk in the buffer

      for (const line of lines) {
        if (line.trim()) {
          const dataStr = line.replace('data: ', '');

          // Check for stream completion
          if (dataStr === '[DONE]') {
            return;
          }

          try {
            const question: TriviaQuestion = JSON.parse(dataStr);
            yield question;
          } catch (e) {
            console.error('Failed to parse question:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export const regenerateQuestion = async (topic: string, difficulty: string, previousQuestion: string) => {
  const response = await fetch(`${API_URL}/api/regenerateQuestion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic: topic, difficulty: difficulty, previousQuestion: previousQuestion }),
  });

  if (!response.ok) {
    throw new Error('Failed to regenerate question');
  }

  return response.json();
};
