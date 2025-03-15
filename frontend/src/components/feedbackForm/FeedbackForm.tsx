import { useForm, ValidationError } from '@formspree/react';
import './feedback-form.css';

export default function FeedbackForm() {
  const [state, handleSubmit] = useForm('xanenqor');
  if (state.succeeded) {
    return <p>Thanks for the feedback!</p>;
  }
  return (
    <form onSubmit={handleSubmit} className="feedback-form-container">
      <h1>Feedback/Suggestions</h1>
      <p>Leave your feedback/suggestions here and I'll get around to it...maybe</p>

      <label htmlFor="email">Email Address</label>
      <input id="email" type="email" name="email" />

      <ValidationError prefix="Email" field="email" errors={state.errors} />

      <textarea id="message" name="message" />

      <ValidationError prefix="Message" field="message" errors={state.errors} />

      <button type="submit" disabled={state.submitting}>
        Submit
      </button>
      
    </form>
  );
}
