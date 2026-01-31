import ShareUploadModalTrigger from "@/app/components/ShareUploadModalTrigger";

interface ImpactCardProps {
  studentsHelped: number;
  totalViews: number;
  saves: number;
  topUploadLabel: string | null;
  topUploadUrl: string;
}

export default function ImpactCard({
  studentsHelped,
  totalViews,
  saves,
  topUploadLabel,
  topUploadUrl
}: ImpactCardProps) {
  return (
    <div className="account-card">
      <div className="section-header">
        <h2>Impact</h2>
        <p>Your contributions are helping real students.</p>
      </div>
      <div className="impact-grid">
        <div>
          <span>Students helped</span>
          <strong>{studentsHelped}</strong>
        </div>
        <div>
          <span>Total views</span>
          <strong>{totalViews}</strong>
        </div>
        <div>
          <span>Saves</span>
          <strong>{saves}</strong>
        </div>
      </div>
      <div className="impact-highlight">
        {topUploadLabel ? `Top upload this week: ${topUploadLabel}` : "Top upload this week: —"}
      </div>
      <ShareUploadModalTrigger
        label="Share your top upload"
        shareUrl={topUploadUrl}
        disabled={!topUploadLabel}
      />
    </div>
  );
}
