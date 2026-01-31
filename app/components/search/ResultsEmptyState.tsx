interface ResultsEmptyStateProps {
  message: string;
}

export default function ResultsEmptyState({ message }: ResultsEmptyStateProps) {
  return <div className="search-page__empty">{message}</div>;
}
