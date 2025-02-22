export type PostBody = {
  numQuestions: number;
  triviaRounds: number;
  categories: Set<string>;
  shouldIncludeSources?: boolean;
};

export type ErrorResponse = {
  error: string;
};

export type TriviaResponse = {
  question: string;
  answer: string;
  source?: string;
};
