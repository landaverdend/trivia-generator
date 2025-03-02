import { useState } from 'react';
import { TriviaQuestion, TriviaResponse } from '../../types/api';
import './output-table.css';
import { buildPDF } from './pdfExporter';
import { regenerateQuestion } from '../../api/api';

type ReloadingState = {
  isReloading: boolean;
  index: number;
};

type OTProps = {
  round: TriviaQuestion[];
  selectedQuestions: Set<string>;
  onQuestionSelect: (question: string, isSelected: boolean) => void;
};

function OutputTable({ round, selectedQuestions, onQuestionSelect }: OTProps) {
  const [isReloadingQuestion, setIsReloadingQuestion] = useState(false);
  const [isReloading, setIsReloading] = useState<ReloadingState>({ isReloading: false, index: 0 });

  const handleRegenQuestion = async ({ topic, difficulty, question }: TriviaQuestion, index: number) => {
    if (isReloadingQuestion) return;

    setIsReloadingQuestion(true);
    setIsReloading({ isReloading: true, index: index });
    try {
      console.log(round);
      const newQuestion = await regenerateQuestion(topic as string, difficulty);
      console.log(newQuestion);
    } catch (error) {
      alert('Failed to reload question');
    } finally {
      setIsReloadingQuestion(false);
      setIsReloading({ isReloading: false, index: 0 });
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

type OCProps = { result: TriviaResponse };
export function OutputContainer({ result }: OCProps) {
  const { rounds } = result;

  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(rounds.flatMap((round) => round.map((q) => q.question)))
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
    buildPDF(rounds, selectedQuestions);
  };

  return (
    <div className="output-container">
      <button onClick={handleExportToPDF} className="export-button">
        Export to PDF
      </button>

      {rounds.map((round, index) => (
        <OutputTable key={index} round={round} selectedQuestions={selectedQuestions} onQuestionSelect={handleQuestionSelect} />
      ))}
    </div>
  );
}
