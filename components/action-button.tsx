import Link from 'next/link';

type ActionButtonProps = {
  href: string;
  label: string;
};

export const ActionButton = ({ href, label }: ActionButtonProps) => (
  <Link href={href} target="_blank">
    <button className="w-64 border rounded-md px-2 py-1 text-sm mt-3 bg-black hover:bg-gray-700 text-white font-bold flex gap-2 items-center justify-center">
      <span>{label}</span>
    </button>
  </Link>
);
