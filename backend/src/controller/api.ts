export type PostBody = {
  categories: Array<Category>;
};

export type ErrorResponse = {
  error: string;
};

export type Difficulty = 'easy' | 'medium' | 'hard';

export type TriviaQuestion = {
  question: string;
  answer: string;
  difficulty: Difficulty;
  topic?: string;
};

export type TriviaResponse = {
  rounds: Array<Array<TriviaQuestion>>;
};

export type Category = {
  topic: string;
  difficulties: {
    easy: number;
    medium: number;
    hard: number;
  };
};

export type RegenerateQuestionBody = {
  topic: string;
  difficulty: Difficulty;
  previousQuestion: string;
};
