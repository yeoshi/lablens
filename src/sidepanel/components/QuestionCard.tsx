import type { DoctorQuestion } from '../utils/types';

interface QuestionCardProps {
  question: DoctorQuestion;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <p className="mb-2 text-sm font-medium leading-relaxed text-text-primary">
        {index + 1}. &ldquo;{question.question}&rdquo;
      </p>
      <p className="text-xs leading-relaxed text-text-secondary">
        <span className="font-medium">Why ask:</span> {question.context}
      </p>
    </div>
  );
}
