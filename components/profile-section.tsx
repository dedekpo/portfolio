import {
  InstagramIcon,
  LinkedinIcon,
  ThreadsIcon,
  YoutubeIcon,
} from '@/components/icons';
import { SocialLink } from '@/components/social-link';
import { ActionButton } from '@/components/action-button';

type Dictionary = {
  tagline: string;
  course: string;
  mysaas: string;
  schedule: string;
  scheduleLink: string;
};

type ProfileSectionProps = {
  dictionary: Dictionary;
};

const SOCIAL_LINKS = [
  { href: 'https://www.youtube.com/@andreeliasdev', icon: <YoutubeIcon /> },
  { href: 'https://www.instagram.com/andreeliasdev', icon: <InstagramIcon /> },
  { href: 'https://www.linkedin.com/in/andré-elias/', icon: <LinkedinIcon /> },
  { href: 'https://www.threads.net/@andreeliasdev', icon: <ThreadsIcon /> },
];

export const ProfileSection = ({ dictionary }: ProfileSectionProps) => {
  const actionButtons = [
    { href: 'https://curso.andreelias.dev', label: dictionary.course },
    { href: 'https://template.andreelias.dev', label: dictionary.mysaas },
    { href: dictionary.scheduleLink, label: dictionary.schedule },
  ];

  return (
    <div className="w-full md:w-1/3 pt-[100px]">
      <div className="flex flex-col items-center gap-2">
        <img src="/me-face-only.webp" alt="Me" className="w-[50%]" />

        <h1 className="text-3xl font-bold">André Dev</h1>
        <span>{dictionary.tagline}</span>

        <div className="flex items-end gap-4">
          {SOCIAL_LINKS.map(({ href, icon }) => (
            <SocialLink key={href} href={href} icon={icon} />
          ))}
        </div>

        {actionButtons.map(({ href, label }) => (
          <ActionButton key={href} href={href} label={label} />
        ))}
      </div>
    </div>
  );
};
