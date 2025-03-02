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
  roundIndex: number;
  selectedQuestions: Set<string>;
  onQuestionSelect: (question: string, isSelected: boolean) => void;
  onUpdateQuestion: (roundIndex: number, questionIndex: number, newQuestion: TriviaQuestion) => void;
};

function OutputTable({ round, roundIndex, selectedQuestions, onQuestionSelect, onUpdateQuestion }: OTProps) {
  const [isReloading, setIsReloading] = useState<ReloadingState>({ isReloading: false, index: 0 });

  const handleRegenQuestion = async ({ topic, difficulty }: TriviaQuestion, index: number) => {
    if (isReloading.isReloading) return;

    setIsReloading({ isReloading: true, index });

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const newQuestion = await regenerateQuestion(topic as string, difficulty);
        onUpdateQuestion(roundIndex, index, {
          ...newQuestion,
          topic,
          difficulty,
        });
      } catch (err) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } finally {
        setIsReloading({ isReloading: false, index: 0 });
      }
    }

    alert('Failed to reload question after multiple attempts');
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
  const [rounds, setRounds] = useState(result.rounds);
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

  const updateQuestion = (roundIndex: number, questionIndex: number, newQuestion: TriviaQuestion) => {
    setRounds((prevRounds) => {
      const newRounds = [...prevRounds];
      newRounds[roundIndex] = [...newRounds[roundIndex]];
      newRounds[roundIndex][questionIndex] = newQuestion;
      return newRounds;
    });
  };

  return (
    <div className="output-container">
      <button onClick={handleExportToPDF} className="export-button">
        Export to PDF
      </button>

      {rounds.map((round, index) => (
        <OutputTable
          key={index}
          round={round}
          roundIndex={index}
          selectedQuestions={selectedQuestions}
          onQuestionSelect={handleQuestionSelect}
          onUpdateQuestion={updateQuestion}
        />
      ))}
    </div>
  );
}
