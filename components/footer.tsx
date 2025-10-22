type FooterProps = {
  dictionary: {
    allrights: string;
  };
};

export const Footer = ({ dictionary }: FooterProps) => (
  <footer>
    <div className="flex flex-col md:flex-row items-center justify-center gap-1 text-xs text-gray-700 text-center w-full p-2">
      <span>
        ANDRE ELIAS ANDRADE SILVA CONSULTORIA EM TECNOLOGIA DA INFORMACAO LTDA -{' '}
        {dictionary.allrights} {new Date().getFullYear()}
      </span>
    </div>
  </footer>
);
