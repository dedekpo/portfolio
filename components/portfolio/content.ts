// Everything on the page that is not a sentence: who it is about, where the links go and which
// picture belongs to which project. The sentences live in dictionaries/en.json.

export const SITE_URL = 'https://www.andreelias.dev';

export const PERSON = {
  name: 'André Elias',
  // the name the site has carried so far, kept for search engines (title and structured data)
  alternateName: 'André Dev',
};

export const SOCIAL_LINKS = [
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@andreeliasdev' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/andreeliasdev' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/andré-elias/' },
  { id: 'x', label: 'X', href: 'https://x.com/andreeliasdev' },
] as const;

export const DISCORD_URL = 'https://discord.gg/hnwxN6E6b8';

export type ProjectKey =
  | 'hollowlands'
  | 'rinhadev'
  | 'courtkings'
  | 'pongjam'
  | 'leadyuu'
  | 'jesusinchat'
  | 'loveyuu'
  | 'template';

export type Project = {
  name: string;
  /** Where its tag line and description are in the dictionary. */
  key: ProjectKey;
  image: string;
  link: string;
};

export type GroupKey = 'games' | 'products';

export const PROJECT_GROUPS: { key: GroupKey; projects: Project[] }[] = [
  {
    key: 'games',
    projects: [
      {
        name: 'Hollowlands',
        key: 'hollowlands',
        image: '/hollowlands-thumb.webp',
        link: 'https://hollowlands.andreelias.dev',
      },
      {
        name: 'Rinha Dev',
        key: 'rinhadev',
        image: '/rinha-dev.webp',
        link: 'https://rinhadev.andreelias.dev',
      },
      {
        name: 'Court Kings',
        key: 'courtkings',
        image: '/court-kings.webp',
        link: 'https://www.courtkings3d.com',
      },
      {
        name: 'Pong Jam',
        key: 'pongjam',
        image: '/pong-jam-2.webp',
        link: 'https://pong-jam.vercel.app',
      },
    ],
  },
  {
    key: 'products',
    projects: [
      {
        name: 'LeadYuu',
        key: 'leadyuu',
        image: '/leadyuu.png',
        link: 'https://www.leadyuu.com',
      },
      {
        name: 'Jesus In Chat',
        key: 'jesusinchat',
        image: '/jesusinchat.png',
        link: 'https://www.jesusinchat.com',
      },
      {
        name: 'LoveYuu',
        key: 'loveyuu',
        image: '/loveyuu.webp',
        link: 'https://www.loveyuu.com',
      },
      {
        name: 'Template SaaS',
        key: 'template',
        image: '/template.png',
        link: 'https://template.andreelias.dev',
      },
    ],
  },
];

// The hand-drawn boil frames of the name. While `frames` is empty the name is drawn from the
// font and the boil is simulated (meadow/lettering.js). To use real drawings: trace the guide
// (press T in the stylized-meadow project), export each pass at the guide's canvas size with a
// transparent background into public/name/ and list the files here.
export const NAME_ART: { frames: string[]; tint: boolean; fps: number } = {
  frames: [], // e.g. ['/name/boil-1.png', '/name/boil-2.png', '/name/boil-3.png']
  tint: true, // true: only the shape of the drawings is used and the page colours them
  fps: 8, // how often the drawing changes; 8 is the classic "on threes" boil
};
