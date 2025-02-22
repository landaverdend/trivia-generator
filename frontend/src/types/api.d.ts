export type PostBody = {
  numQuestions: number;
  triviaRounds: number;
  categories: Array<string>;
  shouldIncludeSources?: boolean;
};

export type ErrorResponse = {
  error: string;
};

export type TriviaQuestion = {
  question: string;
  answer: string;
  source?: string;
};

export type TriviaResponse = {
  rounds: Array<Array<TriviaQuestion>>;
};
