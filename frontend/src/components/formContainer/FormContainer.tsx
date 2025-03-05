import { useState } from 'react';
import './form-container.css';
import { streamGenerateTrivia } from '../../api/api';
import { OutputContainer } from '../outputTable/OutputTable';
import { Category, Difficulty, TriviaQuestion } from '../../types/api';

type LSProps = {
  color?: string;
};
function LoadSpinner({ color }: LSProps) {
  const colorToUse = color ? color : '#1a73e8';

  return <span className="load-spinner" style={{ borderTopColor: colorToUse, borderRightColor: colorToUse }}></span>;
}

function DifficultyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <span className="difficulty-selector">
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="difficulty-select">
        {Array.from({ length: 16 }, (_, i) => i).map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      {label} questions
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
        {(['🟢 easy', '🟡 medium', '🔴 hard'] as Difficulty[]).map((difficulty) => (
          <DifficultyInput
            key={difficulty}
            label={difficulty}
            value={category.difficulties[difficulty]}
            max={20}
            onChange={(value) => updateDifficulty(difficulty, value)}
          />
        ))}
      </div>
      <div className="additional-info-container">
        <textarea
          placeholder="Additional notes for prompt..."
          value={category.additionalInfo}
          onChange={(e) => {
            onChange({ ...category, additionalInfo: e.target.value });
          }}></textarea>
      </div>
      {isLast && (
        <span className="plus" onClick={onAdd}>
          +
        </span>
      )}
      {!isLast && (
        <span className="minus" onClick={onRemove}>
          -
        </span>
      )}
    </div>
  );
}

export default function FormContainer() {
  const [categories, setCategories] = useState<Category[]>([
    {
      topic: '',
      difficulties: { easy: 0, medium: 0, hard: 0 },
    },
  ]);
  const [result, setResult] = useState<Map<string, TriviaQuestion[]>>(new Map());
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

    // Clear previous results before starting
    setResult(new Map());

    try {
      // Build a map of questions[] by topic.
      for await (const question of streamGenerateTrivia({ categories })) {
        setResult((prevMap) => {
          const newMap = new Map(prevMap);
          const key = question.topic as string;
          const existingQuestions = newMap.get(key) || [];

          newMap.set(key, [...existingQuestions, question]);
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error generating trivia:', error);
      alert('There was an error generating trivia.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateResult = (topic: string, oldQuestion: string, newQuestion: TriviaQuestion) => {
    setResult((prevMap) => {
      const newMap = new Map(prevMap);
      const key = topic;
      const existingQuestions = newMap.get(key) || [];

      for (let i = 0; i < existingQuestions.length; i++) {
        if (existingQuestions[i].question === oldQuestion) {
          existingQuestions[i] = newQuestion;
          break;
        }
      }

      newMap.set(key, existingQuestions);
      return newMap;
    });
  };

  return (
    <div className="page-container">
      <h1>🧠 AI Trivia Generator 🧠</h1>
      <p>Generate trivia for your next event! No more than 15 questions per round.</p>

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
      {result.size > 0 && <OutputContainer result={result} updateResult={updateResult} />}
    </div>
  );
}
