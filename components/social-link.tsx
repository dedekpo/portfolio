import Link from "next/link";

type SocialLinkProps = {
  href: string;
  icon: React.ReactNode;
};

export const SocialLink = ({ href, icon }: SocialLinkProps) => (
  <Link href={href} target="_blank">
    {icon}
  </Link>
);
