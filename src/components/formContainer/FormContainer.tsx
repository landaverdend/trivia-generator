import { useState } from 'react';
import './form-container.css';
import { Difficulty, TriviaResponse } from '../../types/api';
import { generateTrivia } from '../../api/api';
import { OutputContainer } from '../outputTable/OutputTable';

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
  onRemove,
  onAdd,
  category,
  onChange,
  isLast,
}: {
  index: number;
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
            max={20}
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

const dummyData: TriviaResponse = {
  rounds: [
    // Round 1
    [
      {
        question: 'What is the capital of France?',
        answer: 'Paris',
        difficulty: 'easy',
      },
      {
        question: "Which element has the chemical symbol 'Au'?",
        answer: 'Gold',
        difficulty: 'medium',
      },
      {
        question: "In quantum physics, what is Heisenberg's Uncertainty Principle?",
        answer: 'The precise position and momentum of a particle cannot be simultaneously known',
        difficulty: 'hard',
      },
    ],
    // Round 2
    [
      {
        question: 'What planet is known as the Red Planet?',
        answer: 'Mars',
        difficulty: 'easy',
      },
      {
        question: "Who painted 'The Starry Night'?",
        answer: 'Vincent van Gogh',
        difficulty: 'medium',
      },
      {
        question: 'What is the Fibonacci sequence?',
        answer: 'A sequence where each number is the sum of the two preceding ones',
        difficulty: 'hard',
      },
    ],
  ],
};

export default function FormContainer() {
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

    try {
      const response = await generateTrivia({
        categories,
      });
      setResult(response);
    } catch (error) {
      alert('There was an error generating trivia.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Trivia Generator</h1>

      <div className="form-container">
        {categories.map((category, i) => (
          <CategoryCard
            key={i}
            index={i}
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
      {/* {result.rounds.length > 0 && <OutputContainer result={result} />} */}
      <OutputContainer result={dummyData} />
    </div>
  );
}
