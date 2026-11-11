/* eslint-disable react/jsx-no-target-blank --
   Links keep rel="noopener" without "noreferrer" on purpose: the projects' own analytics should
   still see this site as where the visit came from, as they did before. */
import { ArrowIcon, DiscordIcon, SOCIAL_ICONS } from './icons';
import {
  DISCORD_URL,
  GroupKey,
  PERSON,
  PROJECT_GROUPS,
  ProjectKey,
  SOCIAL_LINKS,
} from './content';

type ProjectCopy = { tag: string; description: string };

type OverlayProps = {
  dictionary: {
    role: { first: string; second: string };
    socials: string;
    discord: string;
    projects: string;
    freecamera: { label: string; back: string };
    groups: Record<GroupKey, string>;
    kinds: Record<GroupKey, string>;
  } & Record<ProjectKey, ProjectCopy>;
};

/**
 * The page's content: name, role, contact links and projects. It is rendered on the server, so
 * all of it is in the HTML a crawler or a browser without JavaScript receives. The hand-drawn
 * name, the project card and the entrance are added in the browser by overlay-controller.ts,
 * which works on this markup (the class names are its contract).
 */
export const PortfolioOverlay = ({ dictionary }: OverlayProps) => (
  <div id="ui">
    <div className="stage">
      <div className="scrim" />

      <header className="ident">
        <h1 className="name">
          <span className="name-text">{PERSON.name}</span>
          <span className="art" aria-hidden="true">
            <span className="art-in" />
          </span>
        </h1>
        <p className="role">
          <span>{dictionary.role.first}</span>{' '}
          <span>
            <i>&amp;</i> {dictionary.role.second}
          </span>
        </p>
        <div className="contact">
          <nav className="social" aria-label={dictionary.socials}>
            {SOCIAL_LINKS.map(({ id, label, href }) => {
              const Icon = SOCIAL_ICONS[id];
              return (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener"
                  aria-label={label}
                  title={label}
                >
                  <Icon />
                </a>
              );
            })}
          </nav>
          <a
            className="discord"
            href={DISCORD_URL}
            target="_blank"
            rel="noopener"
          >
            <DiscordIcon />
            <span>{dictionary.discord}</span>
          </a>
        </div>
      </header>

      <nav className="work" aria-label={dictionary.projects}>
        {PROJECT_GROUPS.map((group) => (
          <section className="group" key={group.key}>
            <h2>{dictionary.groups[group.key]}</h2>
            <ul>
              {group.projects.map((project) => (
                <li key={project.link}>
                  <a
                    className="proj"
                    href={project.link}
                    target="_blank"
                    rel="noopener"
                    data-thumb={project.image}
                    data-kind={dictionary.kinds[group.key]}
                  >
                    <h3 className="pname">{project.name}</h3>
                    <span className="ptag">{dictionary[project.key].tag}</span>
                    {/* read by crawlers and screen readers; sighted visitors get it in the card */}
                    <span className="pdesc">
                      {dictionary[project.key].description}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </div>

    {/* filled in by the controller for the project under the pointer or the finger */}
    <aside className="card" aria-hidden="true">
      <span className="thumb">
        <b />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" decoding="async" hidden />
      </span>
      <div className="c-head">
        <strong />
        <span className="c-meta">
          <span />
          <ArrowIcon />
        </span>
      </div>
      <p />
      <a className="c-open" target="_blank" rel="noopener" tabIndex={-1}>
        <span />
        <ArrowIcon />
      </a>
    </aside>

    <p className="mode-note">
      {dictionary.freecamera.label}
      <kbd>F</kbd>
      {dictionary.freecamera.back}
    </p>
  </div>
);
