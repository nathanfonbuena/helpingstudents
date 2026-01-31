import Sidebar from "./components/Sidebar";
import SearchBox from "./components/SearchBox";

export default function HomePage() {
  return (
    <div className="home-shell">
      <Sidebar />
      <main className="home">
        <div className="home__hero">
          <p className="home__eyebrow">ClassRack</p>
          <h1 className="home__title">
            See what a class is like - BEFORE YOU ENROLL!
          </h1>
          <p className="home__subtitle">Real course intel. Real student materials.</p>
        </div>
        <SearchBox />
      </main>
    </div>
  );
}
