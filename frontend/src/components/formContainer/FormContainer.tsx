import { useEffect, useState } from 'react';
import './form-container.css';

export default function FormContainer() {
  const [rounds, setRounds] = useState(1);
  const [questionsPerRound, setQuestionsPerRound] = useState(10);
  const [topics, setTopics] = useState(['']);

  const MinusButton = ({ topic }: { topic: string }) => {
    return (
      <span
        className="action"
        onClick={() => {
          setTopics((prev) => {
            const res = prev.filter((el) => el !== topic);
            if (res.length === 0) res.push('');

            return res;
          });
        }}>
        -
      </span>
    );
  };

  const PlusButton = () => {
    return (
      <span
        className="action"
        onClick={() => {
          setTopics((prev) => {
            return [...prev, ''];
          });
        }}>
        +
      </span>
    );
  };

  return (
    <div className="page-container">
      <h2>Trivia Generator</h2>
      <div>
        Each round of trivia will have:{' '}
        <input
          type="number"
          min="1"
          value={questionsPerRound}
          onChange={(e) => {
            setQuestionsPerRound(Number.parseInt(e.target.value));
          }}
        />
        questions
      </div>
      <div>
        I need <input type="number" min="1" value={rounds} onChange={(e) => setRounds(Number.parseInt(e.target.value))} /> rounds
        of trivia questions for the following categories:
      </div>

      <div className="form-container">
        {topics.map((topic, i) => (
          <div className="card-container" key={i}>
            <input
              value={topic}
              placeholder={`Category ${i + 1}`}
              type="text"
              onChange={(e) => {
                const ref = [...topics];
                ref[i] = e.target.value;
                setTopics(ref);
              }}
            />
            {i === topics.length - 1 ? <PlusButton /> : <MinusButton topic={topic} />}
          </div>
        ))}
      </div>

      <span>
        <input type="checkbox" /> Include sources on trivia
      </span>
      <button>Generate Trivia!</button>

      {/* Genearate the output here*/}
      <div></div>
    </div>
  );
}
