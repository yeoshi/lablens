import { formatRichText } from '../utils/format-summary';

interface QuestionCardProps {
  question: { question: string; context: string };
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <div className="card">
      <p className="mb-2 text-sm font-medium leading-relaxed text-text-primary">
        {index + 1}. &ldquo;{formatRichText(question.question)}&rdquo;
      </p>
      <p className="text-xs leading-relaxed text-text-secondary">
        <span className="font-semibold text-text-primary">Why ask:</span>{' '}
        {formatRichText(question.context)}
      </p>
    </div>
  );
}
