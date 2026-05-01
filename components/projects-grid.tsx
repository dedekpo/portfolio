import { ProjectRow } from './project-row';
import { splitIntoRows } from '@/lib/utils';

type Project = {
  name: string;
  descriptionKey: string;
  image: string;
  link: string;
};

type ProjectsGridProps = {
  dictionary: {
    leadyuu: { description: string };
    jesusinchat: { description: string };
    loveyuu: { description: string };
    template: { description: string };
    hollowlands: { description: string };
    rinhadev: { description: string };
    courtkings: { description: string };
    pongjam: { description: string };
  };
};

const PROJECTS: Project[] = [
  {
    name: 'LeadYuu',
    descriptionKey: 'leadyuu',
    image: '/leadyuu.png',
    link: 'https://www.leadyuu.com',
  },
  {
    name: 'Jesus In Chat',
    descriptionKey: 'jesusinchat',
    image: '/jesusinchat.png',
    link: 'https://www.jesusinchat.com',
  },
  {
    name: 'LoveYuu',
    descriptionKey: 'loveyuu',
    image: '/loveyuu.webp',
    link: 'https://www.loveyuu.com',
  },
  {
    name: 'Template SaaS',
    descriptionKey: 'template',
    image: '/template.png',
    link: 'https://template.andreelias.dev',
  },
  {
    name: 'Hollowlands',
    descriptionKey: 'hollowlands',
    image: '/hollowlands-thumb.webp',
    link: 'https://hollowlands.andreelias.dev',
  },
  {
    name: 'Rinha Dev',
    descriptionKey: 'rinhadev',
    image: '/rinha-dev.webp',
    link: 'https://rinhadev.andreelias.dev',
  },
  {
    name: 'Court Kings',
    descriptionKey: 'courtkings',
    image: '/court-kings.webp',
    link: 'https://www.courtkings3d.com',
  },
  {
    name: 'Pong Jam',
    descriptionKey: 'pongjam',
    image: '/pong-jam-2.webp',
    link: 'https://pong-jam.vercel.app',
  },
];

export const ProjectsGrid = ({ dictionary }: ProjectsGridProps) => {
  const projectRows = splitIntoRows(PROJECTS, 2);

  return (
    <div className="w-full md:w-2/3 flex flex-col items-center pt-[100px]">
      <div className="flex flex-col gap-2 w-[90%] mx-auto md:w-full mb-[100px] md:mb-0 md:pr-4">
        {projectRows.map((row, index) => (
          <ProjectRow key={index} projects={row} dictionary={dictionary} />
        ))}
      </div>
    </div>
  );
};
