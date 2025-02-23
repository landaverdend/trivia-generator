import React from 'react';
import { TriviaResponse } from '../../types/api';

type OTProps = { result: TriviaResponse };

export default function OutputTable({ result }: OTProps) {
  return (
    <div className="trivia-output-table">
      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>Answer</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {result.rounds.map((round, roundIndex) => (
            <React.Fragment key={roundIndex}>
              {round.map((question) => (
                <tr key={question.question} className={question.difficulty}>
                  <td>{question.question}</td>
                  <td>{question.answer}</td>
                  <td>{question.difficulty}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
