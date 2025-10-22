import { ProjectCard } from './project-card';

type Project = {
  name: string;
  descriptionKey: string;
  image: string;
  link: string;
};

type ProjectRowProps = {
  projects: Project[];
  dictionary: Record<string, { description: string }>;
};

export const ProjectRow = ({ projects, dictionary }: ProjectRowProps) => (
  <div className="flex flex-col md:flex-row w-full gap-2">
    {projects.map(({ name, descriptionKey, image, link }) => (
      <ProjectCard
        key={link}
        name={name}
        description={
          dictionary[descriptionKey as keyof typeof dictionary].description
        }
        image={image}
        link={link}
      />
    ))}
  </div>
);
