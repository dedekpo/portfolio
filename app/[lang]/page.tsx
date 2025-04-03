import Scene3D from "@/components/3d-scene";
import {
  InstagramIcon,
  LinkedinIcon,
  ThreadsIcon,
  YoutubeIcon,
} from "@/components/icons";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import Link from "next/link";

export default async function HomePage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  return (
    <>
      <main>
        <div className="overflow-auto md:overflow-hidden h-screen bg-white bg-opacity-50">
          <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 pt-[100px]">
              <div className="flex flex-col items-center gap-2">
                <img src="/me-face-only.webp" alt="Me" className="w-[50%]" />
                <h1 className="text-3xl font-bold">André Dev</h1>
                <span>{dictionary["tagline"]}</span>
                <div className="flex items-end gap-4">
                  <Link
                    href="https://www.youtube.com/@andreeliasdev"
                    target="_blank"
                  >
                    <YoutubeIcon />
                  </Link>
                  <Link
                    href="https://www.instagram.com/andreeliasdev"
                    target="_blank"
                  >
                    <InstagramIcon />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/in/andré-elias/"
                    target="_blank"
                  >
                    <LinkedinIcon />
                  </Link>
                  <Link
                    href="https://www.threads.net/@andreeliasdev"
                    target="_blank"
                  >
                    <ThreadsIcon />
                  </Link>
                </div>
                <Link href="https://curso.andreelias.dev" target="_blank">
                  <button className="w-64 border rounded-md px-2 py-1 text-sm mt-3 bg-black hover:bg-gray-700 text-white font-bold flex gap-2 items-center justify-center">
                    <span>{dictionary["course"]}</span>
                  </button>
                </Link>
                <Link href="https://template.andreelias.dev" target="_blank">
                  <button className="w-64 border rounded-md px-2 py-1 text-sm mt-3 bg-black hover:bg-gray-700 text-white font-bold flex gap-2 items-center justify-center">
                    <span>{dictionary["mysaas"]}</span>
                  </button>
                </Link>
                <Link href={dictionary["scheduleLink"]} target="_blank">
                  <button className="w-64 border rounded-md px-2 py-1 text-sm mt-3 bg-black hover:bg-gray-700 text-white font-bold flex gap-2 items-center justify-center">
                    <span>{dictionary["schedule"]}</span>
                  </button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-2/3 flex flex-col items-center pt-[100px]">
              <div className="flex flex-col gap-2 w-[90%] mx-auto md:w-full mb-[100px] md:mb-0">
                <div className="flex flex-col md:flex-row w-full gap-2">
                  <ProjectCard
                    name="LeadYuu"
                    description={dictionary["leadyuu"].description}
                    image="/leadyuu.png"
                    link="https://www.leadyuu.com"
                  />
                  <ProjectCard
                    name="Jesus In Chat"
                    description={dictionary["jesusinchat"].description}
                    image="/jesusinchat.png"
                    link="https://www.jesusinchat.com"
                  />
                </div>
                <div className="flex flex-col md:flex-row w-full gap-2">
                  <ProjectCard
                    name="LoveYuu"
                    description={dictionary["loveyuu"].description}
                    image="/loveyuu.webp"
                    link="https://www.loveyuu.com"
                  />
                  <ProjectCard
                    name="Template SaaS"
                    description={dictionary["template"].description}
                    image="/template.png"
                    link="https://template.andreelias.dev"
                  />
                </div>
                <div className="flex flex-col md:flex-row w-full gap-2">
                  <ProjectCard
                    name="MyVendas"
                    description={dictionary["myvendas"].description}
                    image="/my-vendas.webp"
                    link="https://www.myvendas.com"
                  />
                  <ProjectCard
                    name="Koynonya"
                    description={dictionary["koynonya"].description}
                    image="/koynonya-logo-compressed.webp"
                    link="https://www.koynonya.com"
                  />
                </div>
                <div className="flex flex-col md:flex-row w-full gap-2">
                  <ProjectCard
                    name="Court Kings"
                    description={dictionary["courtkings"].description}
                    image="/court-kings.webp"
                    link="https://www.courtkings3d.com"
                  />
                  <ProjectCard
                    name="Pong Jam"
                    description={dictionary["pongjam"].description}
                    image="/pong-jam-2.webp"
                    link="https://pong-jam.vercel.app"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Scene3D />
      </main>
      <footer>
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 text-xs text-gray-700 text-center w-full">
          <span>
            ANDRE ELIAS ANDRADE SILVA CONSULTORIA EM TECNOLOGIA DA INFORMACAO
            LTDA - {dictionary["allrights"]} {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
}

function ProjectCard({
  name,
  description,
  image,
  link,
}: {
  name: string;
  description: string;
  image: string;
  link: string;
}) {
  return (
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
}
