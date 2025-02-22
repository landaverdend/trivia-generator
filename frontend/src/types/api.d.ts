
export type PostBody = {

  numQuestions: number;
  triviaRounds: number;
  categories: Set<string>;
  shouldIncludeSources?: boolean;
}