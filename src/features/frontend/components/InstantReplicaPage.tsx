type InstantReplicaPageProps = {
  section: 'home' | 'about' | 'works';
};

const instantSectionHash = {
  home: 'home',
  about: 'about-me',
  works: 'works',
} as const;

export function InstantReplicaPage({ section }: InstantReplicaPageProps) {
  const hash = instantSectionHash[section];

  return (
    <iframe
      src={`/instant/index.html#${hash}`}
      title={`Instant portfolio ${section}`}
      className="h-[100svh] w-full border-0"
    />
  );
}
