import { useState } from 'react';
import { TriviaQuestion } from '../../types/api';
import './output-table.css';
// import { buildPDF } from './pdfExporter';
import { regenerateQuestion } from '../../api/api';

type ReloadingState = {
  isReloading: boolean;
  index: number;
};

type OTProps = {
  round: TriviaQuestion[];
  roundIndex: number;
  selectedQuestions: Set<string>;
  onQuestionSelect: (question: string, isSelected: boolean) => void;
  onUpdateQuestion: (topic: string, oldQuestion: string, newQuestion: TriviaQuestion) => void;
};

function OutputTable({ round, selectedQuestions, onQuestionSelect, onUpdateQuestion }: OTProps) {
  const [isReloading, setIsReloading] = useState<ReloadingState>({ isReloading: false, index: 0 });

  const handleRegenQuestion = async ({ topic, difficulty, question }: TriviaQuestion, index: number) => {
    if (isReloading.isReloading) return;
    topic = topic as string;

    setIsReloading({ isReloading: true, index });
    let success = false;
    for (let attempt = 0; attempt < 3 && !success; attempt++) {
      try {
        const newQuestion = await regenerateQuestion(topic, difficulty, question);
        onUpdateQuestion(topic, question, {
          ...newQuestion,
          topic,
          difficulty,
        });
        success = true;
      } catch (err) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert('Failed to reload question after multiple attempts');
      } finally {
        setIsReloading({ isReloading: false, index: 0 });
      }
    }
  };

  return (
    <table className="trivia-output-table">
      <thead className="header-row">
        <tr>
          <th>Question</th>
          <th>Answer</th>
          <th>Difficulty</th>
          <th>Export</th>
          <th>Regenerate?</th>
        </tr>
      </thead>
      <tbody>
        {round.map((question, i) => (
          <tr key={question.question} className={`table-row ${question.difficulty}`}>
            <td>{question.question}</td>
            <td>{question.answer}</td>
            <td>{question.difficulty}</td>
            <td className="checkbox-cell">
              <input
                type="checkbox"
                checked={selectedQuestions.has(question.question)}
                onChange={(e) => onQuestionSelect(question.question, e.target.checked)}
              />
            </td>
            <td>
              <span
                title="Regenerate question...."
                onClick={() => {
                  handleRegenQuestion(question, i);
                }}
                className="regenerate-button">
                {isReloading.isReloading && isReloading.index === i ? '...' : '🔄'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type OCProps = {
  result: Map<string, TriviaQuestion[]>;
  // The function that updates the result map in the parent component.
  updateResult: (topic: string, oldQuestionTopic: string, newQuestion: TriviaQuestion) => void;
};
export function OutputContainer({ result, updateResult }: OCProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(
      Array.from(result.values())
        .flat()
        .flatMap((el) => el.question)
    )
  );

  const handleQuestionSelect = (question: string, isSelected: boolean) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(question);
      } else {
        newSet.delete(question);
      }
      return newSet;
    });
  };

  const handleExportToPDF = () => {
    // buildPDF(rounds, selectedQuestions);
  };

  let tableArray = [];
  let i = 0;
  for (const key of result.keys()) {
    tableArray.push(
      <OutputTable
        key={key}
        round={result.get(key) as TriviaQuestion[]}
        roundIndex={i}
        selectedQuestions={selectedQuestions}
        onQuestionSelect={handleQuestionSelect}
        onUpdateQuestion={updateResult}
      />
    );
  }

  return (
    <div className="output-container">
      <button onClick={handleExportToPDF} className="export-button">
        ↓ Export to PDF ↓
      </button>
      {tableArray}
    </div>
  );
}
