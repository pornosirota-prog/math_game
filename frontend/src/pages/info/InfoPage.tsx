import { usePageMeta } from '../../hooks/usePageMeta';
import type { PublicPageContent } from './publicContent';

type InfoPageProps = {
  content: PublicPageContent;
};

export const InfoPage = ({ content }: InfoPageProps) => {
  usePageMeta(`${content.title} — Math Game`, content.description);

  return (
    <div className="layout public-page-layout">
      <article className="card public-page-card">
        <h1>{content.title}</h1>
        <p className="public-page-lead">{content.lead}</p>

        <div className="public-ad-slot" role="complementary" aria-label="Зона для рекламного блока">
          <p>Ad slot (reserved): Top content banner</p>
        </div>

        {content.sections.map((section) => (
          <section key={section.title} className="public-section">
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.list && (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {content.faq && content.faq.length > 0 && (
          <section className="public-section">
            <h2>Ответы на частые вопросы</h2>
            <div className="faq-list">
              {content.faq.map((item) => (
                <details key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="public-ad-slot" role="complementary" aria-label="Зона для рекламного блока">
          <p>Ad slot (reserved): In-article block</p>
        </div>
      </article>
    </div>
  );
};
