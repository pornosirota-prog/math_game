import { usePageMeta } from '../../hooks/usePageMeta';

export const InfoPage = ({ title, body }: { title: string; body: string }) => {
  usePageMeta(`${title} — Math Game`, body);

  return (
    <div className="layout card info-page">
      <h1>{title}</h1>
      <p>{body}</p>
      <p>Раздел в разработке: сюда можно расширить контент (FAQ, гайды, статьи) без изменения ядра игры.</p>
    </div>
  );
};
