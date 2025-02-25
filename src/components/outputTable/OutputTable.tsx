import { useState } from 'react';
import { TriviaQuestion, TriviaResponse } from '../../types/api';
import './output-table.css';
import { buildPDF } from './pdfExporter';

type OTProps = {
  round: TriviaQuestion[];
  selectedQuestions: Set<string>;
  onQuestionSelect: (question: string, isSelected: boolean) => void;
};
function OutputTable({ round, selectedQuestions, onQuestionSelect }: OTProps) {
  return (
    <table className="trivia-output-table">
      <thead className="header-row">
        <tr>
          <th>Question</th>
          <th>Answer</th>
          <th>Difficulty</th>
          <th>Export</th>
        </tr>
      </thead>
      <tbody>
        {round.map((question) => (
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
      <button onClick={handleExportToPDF} className="export-button">Export</button>

      {rounds.map((round, index) => (
        <OutputTable key={index} round={round} selectedQuestions={selectedQuestions} onQuestionSelect={handleQuestionSelect} />
      ))}
    </div>
  );
}
