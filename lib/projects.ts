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
    updated: 'October 2026',
    description: 'Latest Pizza Wine bottle render for internal review and download.',
    cover: '/projects/pizza-wine/pizza-wine-bottle-render.webp',
    files: [
      {
        name: 'Pizza Wine Bottle Render',
        kind: 'image',
        src: '/projects/pizza-wine/pizza-wine-bottle-render.webp',
        note: 'Updated internal bottle mockup · compressed download asset',
      },
    ],
  },
  {
    slug: 'the-kicker',
    name: 'The Kicker',
    type: 'Packaging / Label',
    status: 'In progress',
    updated: 'October 2026',
    description: 'Latest bottle renders for The Kicker Chocolate Cherry and Chocolate Raspberry.',
    cover: '/projects/the-kicker/kicker-chocolate-cherry-render.webp',
    files: [
      {
        name: 'The Kicker — Chocolate Cherry Bottle Render',
        kind: 'image',
        src: '/projects/the-kicker/kicker-chocolate-cherry-render.webp',
        note: 'Updated internal bottle mockup · compressed download asset',
      },
      {
        name: 'The Kicker — Chocolate Raspberry Bottle Render',
        kind: 'image',
        src: '/projects/the-kicker/kicker-chocolate-raspberry-render.webp',
        note: 'Updated internal bottle mockup · compressed download asset',
      },
    ],
  },
  {
    slug: 'sleeping-bear',
    name: 'Sleeping Bear',
    type: 'Label Refresh',
    status: 'In progress',
    updated: 'October 2026',
    description: 'Sleeping Bear label fronts/backs, downloadable PDFs, and bottle mockups for Pinot Grigio, Riesling, and Sleeping Bear Red.',
    cover: '/projects/sleeping-bear/sleeping-bear-pinot-grigio-bottle-render.webp',
    files: [
      { name: 'Sleeping Bear Pinot Grigio — Bottle Render', kind: 'image', src: '/projects/sleeping-bear/sleeping-bear-pinot-grigio-bottle-render.webp', note: 'Single-bottle mockup for download.' },
      { name: 'Sleeping Bear Riesling — Bottle Render', kind: 'image', src: '/projects/sleeping-bear/sleeping-bear-riesling-bottle-render.webp', note: 'Single-bottle mockup for download.' },
      { name: 'Sleeping Bear Red — Bottle Render', kind: 'image', src: '/projects/sleeping-bear/sleeping-bear-red-bottle-render.webp', note: 'Single-bottle mockup for download.' },
      { name: 'Sleeping Bear Pinot Grigio — Label PDF', kind: 'pdf', src: '/projects/sleeping-bear/sleeping-bear-pinot-grigio-labels.pdf', note: 'Compressed PDF download.' },
      { name: 'Sleeping Bear Riesling — Label PDF', kind: 'pdf', src: '/projects/sleeping-bear/sleeping-bear-riesling-labels.pdf', note: 'Compressed PDF download.' },
      { name: 'Sleeping Bear Red — Label PDF', kind: 'pdf', src: '/projects/sleeping-bear/sleeping-bear-red-labels.pdf', note: 'Compressed PDF download.' },
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
