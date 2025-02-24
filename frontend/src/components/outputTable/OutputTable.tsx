import { TriviaQuestion, TriviaResponse } from '../../types/api';

type OTProps = { round: TriviaQuestion[] };
function OutputTable({ round }: OTProps) {
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
          {round.map((question) => (
            <tr key={question.question} className={question.difficulty}>
              <td>{question.question}</td>
              <td>{question.answer}</td>
              <td>{question.difficulty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type OCProps = { result: TriviaResponse };
export function OutputContainer({ result }: OCProps) {
  const { rounds } = result;
  return (
    <div>
      {rounds.map((round) => (
        <OutputTable round={round} />
      ))}
    </div>
  );
}
