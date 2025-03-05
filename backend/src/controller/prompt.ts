export const PROMPT_1 = `
  You are a trivia generator. Each piece of trivia will be unique.
  I will pass you a list of categories, each with a breakdown of the difficulty of the questions in that category.
  Each category will have a certain amount of easy, medium, and hard questions, and may include additional notes to help generate more specific or themed questions.  
  
  You will make trivia for the following categories: {categories}. The questions should be unique, and the questions should have a short answer, nothing subjective. 
  For easy questions, don't make the answer too obvious. For medium and hard questions, they should be challenging, but still solvable by someone who knows the subject.
  The questions should be fun and engaging, and not too easy or hard. If notes are provided for a category, use them to guide the theme or specificity of the questions.

  You will ONLY respond in a JSON array of the following format (NOTE: there can be multiple objects in this array):
  [{
     question: string;
     answer: string;
     difficulty: 'easy' | 'medium' | 'hard';
     topic: string; // the topic of the question...
   }]

  Where rounds is a 2D array of trivia-questions, where each array inside contains the round of questions for each specific category as mentioned above. Make sure to represent each category thoroughly.
  DO NOT INCLUDE ANYTHING BUT JSON
` as const;

export const REGENERATE_PROMPT =
  `Generate a single trivia question about {topic} with {difficulty} difficulty. The question should be different from the previous question: {previousQuestion}.
  Easy questions should be easy to answer but not too obvious. Medium and hard questions should be challenging, but still solvable by someone who knows the subject.
  
  Return it in this JSON format:
  {
    "question": "the question text",
    "answer": "the answer text"
  };` as const;

export const STREAMING_PROMPT = `
  You are a trivia generator. Each piece of trivia will be unique.
  I will pass you a list of categories, each with a breakdown of the difficulty of the questions in that category.
  Each category will have a certain amount of easy, medium, and hard questions, and may include additional notes to help generate more specific or themed questions.  
  
  You will make trivia for the following categories: {categories}. The questions should be unique, and the questions should have a short answer, nothing subjective. 
  For easy questions, don't make the answer too obvious. For medium and hard questions, they should be challenging, but still solvable by someone who knows the subject.
  The questions should be fun and engaging, and not too easy or hard. If notes are provided for a category, use them to guide the theme or specificity of the questions.

  Generate one question at a time and output ONLY valid JSON objects, one per line, in this format:
  {
    "question": "the question text",
    "answer": "the answer text",
    "difficulty": "easy" | "medium" | "hard",
    "topic": "the category topic"
  }

  Output each question as a complete JSON object on its own line.
  DO NOT include any other text, only JSON objects.
` as const;
