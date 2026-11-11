import { PERSON, SITE_URL, SOCIAL_LINKS } from './content';

// The name is drawn in a soft, "wonky" display cut of Fraunces that Google serves as its own
// pinned file, so it comes in a second stylesheet.
export const FONT_SHEETS = [
  'https://fonts.googleapis.com/css2?family=Figtree:wght@400..700&family=Fraunces:ital,opsz,wght,SOFT,WONK@0,20,500,100,0;1,20,500,100,0&display=swap',
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@72,600,100,1&display=swap',
];

// Runs while the page is still being parsed, before anything is painted:
//  - the `js` class lets the stylesheet hide things for their entrance (only when a script will
//    reveal them; without JavaScript every word shows straight away),
//  - the font stylesheets are appended to the end of <head>, which React tolerates during
//    hydration (stylesheet tags rendered by React itself do not hydrate in this Next.js version).
const BOOT = `(function(d){d.documentElement.classList.add('js');${JSON.stringify(
  FONT_SHEETS,
)}.forEach(function(h){var l=d.createElement('link');l.rel='stylesheet';l.href=h;l.setAttribute('data-fonts','');d.head.appendChild(l)})})(document)`;

/** First thing in <body>: see BOOT above. */
export const BootScript = () => (
  <script dangerouslySetInnerHTML={{ __html: BOOT }} />
);

type StructuredDataProps = {
  lang: string;
  role: string;
};

/** Tells search engines who the page is about and which profiles are theirs. */
export const StructuredData = ({ lang, role }: StructuredDataProps) => {
  const url = `${SITE_URL}/${lang}`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url,
        name: PERSON.alternateName,
        alternateName: PERSON.name,
        inLanguage: lang,
        publisher: { '@id': `${SITE_URL}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: PERSON.name,
        alternateName: PERSON.alternateName,
        url,
        image: `${SITE_URL}/me-face-only.webp`,
        jobTitle: role,
        sameAs: SOCIAL_LINKS.map((link) => link.href),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};
