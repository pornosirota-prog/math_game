import { Link } from 'react-router-dom';

export const DashboardPage = () => (
  <div className="layout trainer-dashboard">
    <section className="trainer-grid3">
      <article className="card trainer-panel">
        <div className="vertical-problem">3<br />+ 3<br /><span>6</span></div>
        <p>This question should be memorized.</p>
        <p>Review addition table for 3:</p>
        <div className="small-table">3 + 1 = 4<br />3 + 2 = 5<br />3 + 3 = 6<br />3 + 4 = 7<br />3 + 5 = 8</div>
      </article>
      <article className="card trainer-panel trainer-panel-center">
        <div className="big-number">2<span>%</span></div>
        <h3>PROGRESS TODAY</h3>
      </article>
      <article className="card trainer-panel trainer-panel-center">
        <div className="big-number">1</div>
        <h3>SKILL LEVEL</h3>
        <p>ADDITION&nbsp; 1</p>
      </article>
    </section>

    <section className="trainer-grid2">
      <article className="card trainer-panel trainer-panel-center">
        <div className="big-number">16 <span>in Moscow</span></div>
      </article>
      <article className="card trainer-panel trainer-panel-center">
        <div className="time-filter">All <span>Month</span> <span>Week</span></div>
        <div className="big-number">6</div>
      </article>
    </section>

    <section className="trainer-bottom-cta">
      <Link className="trainer-play-btn" to="/game?mode=classic">3 QUESTIONS</Link>
    </section>
  </div>
);
