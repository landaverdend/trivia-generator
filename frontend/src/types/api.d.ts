export type PostBody = {
  numQuestions: number;
  triviaRounds: number;
  categories: Array<Category>;
  shouldIncludeSources?: boolean;
};

export type ErrorResponse = {
  error: string;
};

export type TriviaQuestion = {
  question: string;
  answer: string;
  difficulty: string;
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

export type Difficulty = 'easy' | 'medium' | 'hard';
