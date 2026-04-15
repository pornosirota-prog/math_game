import { Link } from 'react-router-dom';
import { loadLeaderboard, loadProgress } from '../mathgame/storage/localStorageRepo';

export const DashboardPage = () => {
  const progress = loadProgress();
  const leaderboard = loadLeaderboard();

  const totalGames = progress.totalRuns;
  const bestScore = progress.bestScore;
  const totalXp = progress.xp;
  const averageScore = leaderboard.length > 0
    ? Math.round(leaderboard.reduce((sum, run) => sum + run.score, 0) / leaderboard.length)
    : 0;
  const bestAccuracy = leaderboard.length > 0
    ? Math.max(...leaderboard.map((run) => Math.round(run.accuracy)))
    : 0;

  return (
    <div className="layout trainer-dashboard">
      <section className="trainer-grid3">
        <article className="card trainer-panel">
          <div className="vertical-problem">3<br />+ 3<br /><span>6</span></div>
          <p>This question should be memorized.</p>
          <p>Review addition table for 3:</p>
          <div className="small-table">3 + 1 = 4<br />3 + 2 = 5<br />3 + 3 = 6<br />3 + 4 = 7<br />3 + 5 = 8</div>
        </article>
        <article className="card trainer-panel trainer-panel-center">
          <div className="big-number">{totalGames}</div>
          <h3>GAMES PLAYED</h3>
        </article>
        <article className="card trainer-panel trainer-panel-center">
          <div className="big-number">{progress.level}</div>
          <h3>SKILL LEVEL</h3>
          <p>XP&nbsp; {totalXp}</p>
        </article>
      </section>

      <section className="trainer-grid2">
        <article className="card trainer-panel trainer-panel-center">
          <div className="big-number">{bestScore}</div>
          <h3>BEST SCORE</h3>
        </article>
        <article className="card trainer-panel trainer-panel-center">
          <div className="time-filter">Avg score: <span>{averageScore}</span></div>
          <div className="big-number">{bestAccuracy}<span>%</span></div>
          <h3>BEST ACCURACY</h3>
        </article>
      </section>

      <section className="trainer-bottom-cta">
        <Link className="trainer-play-btn" to="/game?mode=classic">PLAY 3 QUESTIONS</Link>
      </section>
    </div>
  );
};
