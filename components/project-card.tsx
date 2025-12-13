import Link from 'next/link';

type ProjectCardProps = {
  name: string;
  description: string;
  image: string;
  link: string;
};

export const ProjectCard = ({
  name,
  description,
  image,
  link,
}: ProjectCardProps) => (
  <Link href={link} target="_blank" className="w-full h-[150px]">
    <div className="w-full h-full rounded-lg shadow-lg flex items-center p-3 gap-2 md:p-10 bg-white border hover:border-black">
      <div className="w-1/3">
        <div className="w-[75px] h-[75px] rounded-[10px] overflow-hidden">
          <img src={image} alt={name} />
        </div>
      </div>

      <div className="w-full flex flex-col">
        <h3 className="font-bold text-xl">{name}</h3>
        <span className="text-xs text-gray-700">{description}</span>
      </div>
    </div>
  </Link>
);
