export const RestPanel = ({ onRest }: { onRest: (choice: 'heal' | 'buff') => void }) => (
  <section className="dungeon-panel">
    <h2>Комната отдыха</h2>
    <p>Передышка между боями.</p>
    <div className="row">
      <button type="button" onClick={() => onRest('heal')}>Лечение (+16 HP)</button>
      <button type="button" onClick={() => onRest('buff')}>Укрепиться (+1 armor)</button>
    </div>
  </section>
);
