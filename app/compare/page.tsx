import Sidebar from "@/app/components/Sidebar";
import CompareView from "@/app/components/compare/CompareView";

export default function ComparePage() {
  return (
    <div className="home-shell">
      <Sidebar />
      <main className="compare-main">
        <CompareView />
      </main>
    </div>
  );
}
