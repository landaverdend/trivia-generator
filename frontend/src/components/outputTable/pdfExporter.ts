import jsPDF from 'jspdf';
import { TriviaQuestion } from '../../types/api';

export function buildPDF(result: Map<string, TriviaQuestion[]>, selectedQuestions: Set<string>) {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  const lineHeight = 10;

  // Title
  pdf.setFontSize(20);
  pdf.text('Trivia Questions', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += lineHeight * 2;

  let roundIndex = 0;
  // Process each round
  for (const [key, round] of result.entries()) {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.height - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    // Round header
    pdf.setFontSize(16);
    pdf.text(`Round ${roundIndex + 1}`, margin, yPosition);
    yPosition += lineHeight * 1.5;

    // Questions for this round
    pdf.setFontSize(12);
    round.forEach((q, qIndex) => {
      // Skip if question isn't selected
      if (!selectedQuestions.has(q.question)) return;

      // Check if we need a new page
      if (yPosition > pdf.internal.pageSize.height - (margin + lineHeight * 3)) {
        pdf.addPage();
        yPosition = margin;
      }

      // Question
      pdf.setFont('Arial', 'bold');
      const questionText = `Q${qIndex + 1}: ${q.question}`;
      const splitQuestion = pdf.splitTextToSize(questionText, pageWidth - margin * 2);
      pdf.text(splitQuestion, margin, yPosition);
      yPosition += lineHeight * splitQuestion.length;

      // Answer
      pdf.setFont('Arial', 'normal');
      const answerText = `A: ${q.answer}`;
      const splitAnswer = pdf.splitTextToSize(answerText, pageWidth - margin * 2);
      pdf.text(splitAnswer, margin, yPosition);
      yPosition += lineHeight * (splitAnswer.length + 1);

      // Difficulty
      pdf.setFont('Arial', 'italic');
      pdf.text(`Difficulty: ${q.difficulty}`, margin, yPosition);
      yPosition += lineHeight * 1.5;
    });

    // Add space between rounds
    yPosition += lineHeight;
  }

  // rounds.forEach((round, roundIndex) => {
  //   // Check if we need a new page
  //   if (yPosition > pdf.internal.pageSize.height - margin) {
  //     pdf.addPage();
  //     yPosition = margin;
  //   }

  //   // Round header
  //   pdf.setFontSize(16);
  //   pdf.text(`Round ${roundIndex + 1}`, margin, yPosition);
  //   yPosition += lineHeight * 1.5;

  //   // Questions for this round
  //   pdf.setFontSize(12);
  //   round.forEach((q, qIndex) => {
  //     // Skip if question isn't selected
  //     if (!selectedQuestions.has(q.question)) return;

  //     // Check if we need a new page
  //     if (yPosition > pdf.internal.pageSize.height - (margin + lineHeight * 3)) {
  //       pdf.addPage();
  //       yPosition = margin;
  //     }

  //     // Question
  //     pdf.setFont('Arial', 'bold');
  //     const questionText = `Q${qIndex + 1}: ${q.question}`;
  //     const splitQuestion = pdf.splitTextToSize(questionText, pageWidth - margin * 2);
  //     pdf.text(splitQuestion, margin, yPosition);
  //     yPosition += lineHeight * splitQuestion.length;

  //     // Answer
  //     pdf.setFont('Arial', 'normal');
  //     const answerText = `A: ${q.answer}`;
  //     const splitAnswer = pdf.splitTextToSize(answerText, pageWidth - margin * 2);
  //     pdf.text(splitAnswer, margin, yPosition);
  //     yPosition += lineHeight * (splitAnswer.length + 1);

  //     // Difficulty
  //     pdf.setFont('Arial', 'italic');
  //     pdf.text(`Difficulty: ${q.difficulty}`, margin, yPosition);
  //     yPosition += lineHeight * 1.5;
  //   });

  //   // Add space between rounds
  //   yPosition += lineHeight;
  // });

  // Save the PDF
  pdf.save('trivia-questions.pdf');
}
