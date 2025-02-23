import { useState } from 'react';
import './form-container.css';
import { generateTrivia } from '../../api/api';
import { Difficulty, TriviaQuestion, TriviaResponse } from '../../types/api';

type LSProps = {
  color?: string;
};
function LoadSpinner({ color }: LSProps) {
  const colorToUse = color ? color : '#1a73e8';

  return <span className="load-spinner" style={{ borderTopColor: colorToUse, borderRightColor: colorToUse }}></span>;
}

type Category = {
  topic: string;
  difficulties: Record<Difficulty, number>;
};

function TriviaQuestionCard({ question }: { question: TriviaQuestion }) {
  return (
    <div className={`trivia-question-container ${question.difficulty}`}>
      <div>{question.question}</div>
      <div>{question.answer}</div>
    </div>
  );
}

function DifficultyInput({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <span>
      <input type="number" min="0" max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} /> <b>{label}</b>{' '}
      questions
    </span>
  );
}

function CategoryCard({
  index,
  questionsPerRound,
  onRemove,
  onAdd,
  category,
  onChange,
  isLast,
}: {
  index: number;
  questionsPerRound: number;
  onRemove: () => void;
  onAdd: () => void;
  category: Category;
  onChange: (category: Category) => void;
  isLast: boolean;
}) {
  const updateDifficulty = (difficulty: Difficulty, count: number) => {
    onChange({
      ...category,
      difficulties: { ...category.difficulties, [difficulty]: count },
    });
  };

  return (
    <div className="card-container">
      <input
        value={category.topic}
        placeholder={`Category ${index + 1}`}
        type="text"
        onChange={(e) => onChange({ ...category, topic: e.target.value })}
      />
      <div className="difficulty-selector-container">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => (
          <DifficultyInput
            key={difficulty}
            label={difficulty}
            value={category.difficulties[difficulty]}
            max={questionsPerRound}
            onChange={(value) => updateDifficulty(difficulty, value)}
          />
        ))}
      </div>
      <span className="action" onClick={isLast ? onAdd : onRemove}>
        {isLast ? '+' : '-'}
      </span>
    </div>
  );
}

export default function FormContainer() {
  const [rounds, setRounds] = useState(1);
  const [questionsPerRound, setQuestionsPerRound] = useState(10);
  const [categories, setCategories] = useState<Category[]>([
    {
      topic: '',
      difficulties: { easy: 0, medium: 0, hard: 0 },
    },
  ]);
  const [result, setResult] = useState<TriviaResponse>({ rounds: [] });
  const [isLoading, setIsLoading] = useState(false);

  const handleCategoryChange = (index: number, category: Category) => {
    setCategories((prev) => {
      const newCategories = [...prev];
      newCategories[index] = category;
      return newCategories;
    });
  };

  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        topic: '',
        difficulties: { easy: 0, medium: 0, hard: 0 },
      },
    ]);
  };

  const removeCategory = (index: number) => {
    setCategories((prev) => {
      const newCategories = prev.filter((_, i) => i !== index);
      return newCategories.length === 0 ? [{ topic: '', difficulties: { easy: 0, medium: 0, hard: 0 } }] : newCategories;
    });
  };

  const handleGenerateTrivia = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 10000);
    // try {
    //   const response = await generateTrivia({
    //     numQuestions: questionsPerRound,
    //     triviaRounds: rounds,
    //     categories,
    //   });
    //   setResult(response);
    // } catch (error) {
    //   alert('There was an error generating trivia.');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="page-container">
      <h1>Trivia Generator</h1>

      <div className="initial-form-container">
        <span>
          Each round of trivia will have:{' '}
          <input type="number" min="1" value={questionsPerRound} onChange={(e) => setQuestionsPerRound(Number(e.target.value))} />{' '}
          questions
        </span>
        <span>
          I need <input type="number" min="1" value={rounds} onChange={(e) => setRounds(Number(e.target.value))} /> rounds of
          trivia questions for the following categories:
        </span>
      </div>

      <div className="form-container">
        {categories.map((category, i) => (
          <CategoryCard
            key={i}
            index={i}
            questionsPerRound={questionsPerRound}
            category={category}
            onChange={(category) => handleCategoryChange(i, category)}
            onRemove={() => removeCategory(i)}
            onAdd={addCategory}
            isLast={i === categories.length - 1}
          />
        ))}
      </div>

      <button onClick={handleGenerateTrivia} disabled={isLoading} className="generate-button">
        Generate Trivia!
      </button>

      {isLoading && <LoadSpinner />}

      <div className="trivia-output-container">
        {result.rounds.map((round, i) => (
          <div key={i} className="trivia-round-container">
            {round.map((question) => (
              <TriviaQuestionCard key={question.question} question={question} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
