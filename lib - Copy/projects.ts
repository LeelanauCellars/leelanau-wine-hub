export type CentralProjectFile = {
  name: string;
  kind: 'pdf' | 'image';
  src: string;
  note?: string;
  preview?: string;
};

export type CentralProject = {
  slug: string;
  name: string;
  type: string;
  status: 'In progress' | 'Review' | 'Approved';
  updated: string;
  description: string;
  cover: string;
  files: CentralProjectFile[];
};

export const CENTRAL_PROJECTS: CentralProject[] = [
  {
    slug: 'pizza-wine',
    name: 'Pizza Wine',
    type: 'Packaging / Label',
    status: 'In progress',
    updated: 'September 2026',
    description: 'Current packaging and label exploration for Pizza Wine.',
    cover: '/projects/pizza-wine/cover.png',
    files: [
      {
        name: 'Pizza Wine Packaging — v4',
        kind: 'pdf',
        src: '/projects/pizza-wine/pizza-wine-packaging-v4.pdf',
        preview: '/projects/pizza-wine/cover.png',
        note: 'Phire Group packaging presentation · September 2026 · v4',
      },
    ],
  },
  {
    slug: 'the-kicker',
    name: 'The Kicker',
    type: 'Packaging / Label',
    status: 'In progress',
    updated: 'September 2026',
    description: 'Current packaging directions for The Kicker Chocolate Cherry and Chocolate Raspberry wines.',
    cover: '/projects/the-kicker/cover.png',
    files: [
      {
        name: 'The Kicker Packaging — v2',
        kind: 'pdf',
        src: '/projects/the-kicker/the-kicker-packaging-v2.pdf',
        preview: '/projects/the-kicker/cover.png',
        note: 'Phire Group packaging presentation · September 2026 · v2',
      },
    ],
  },
  {
    slug: 'sleeping-bear',
    name: 'Sleeping Bear',
    type: 'Label Refresh',
    status: 'In progress',
    updated: 'September 2026',
    description: 'Working front and back label files for Pinot Grigio, Sleeping Bear Red and Riesling.',
    cover: '/projects/sleeping-bear/cover.jpg',
    files: [
      { name: 'Pinot Grigio — Front', kind: 'image', src: '/projects/sleeping-bear/pinot-grigio-front.jpg' },
      { name: 'Pinot Grigio — Back', kind: 'image', src: '/projects/sleeping-bear/pinot-grigio-back.jpg' },
      { name: 'Sleeping Bear Red — Front', kind: 'image', src: '/projects/sleeping-bear/red-front.jpg' },
      { name: 'Sleeping Bear Red — Back', kind: 'image', src: '/projects/sleeping-bear/red-back.jpg' },
      { name: 'Riesling — Front', kind: 'image', src: '/projects/sleeping-bear/riesling-front.jpg' },
      { name: 'Riesling — Back', kind: 'image', src: '/projects/sleeping-bear/riesling-back.jpg' },
      { name: 'Tagline Font Reference — Newspaper', kind: 'image', src: '/projects/sleeping-bear/newspaper-font.png', note: 'Tagline font comparison reference.' },
      { name: 'Tagline Font Reference — Phire Black', kind: 'image', src: '/projects/sleeping-bear/phire-font-black.png', note: 'Tagline font comparison reference.' },
    ],
  },
];

export function projectBySlug(slug = '') {
  return CENTRAL_PROJECTS.find((project) => project.slug === slug);
}
