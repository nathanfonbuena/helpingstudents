interface RecommendationItem {
  id: string;
  label: string;
}

interface RecommendationsCardProps {
  title: string;
  subtitle: string;
  items: RecommendationItem[];
}

export default function RecommendationsCard({
  title,
  subtitle,
  items
}: RecommendationsCardProps) {
  return (
    <section className="account-card">
      <div className="section-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {items.length === 0 ? (
        <div className="empty-panel">Recommendations will appear here.</div>
      ) : (
        <ul className="recommendation-list">
          {items.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
