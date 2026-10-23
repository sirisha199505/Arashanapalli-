import { useState } from 'react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../../data/instagram';
import { Button, Icon, Tabs } from '../ui';
import GalleryTile from './GalleryTile';

const FILTERS = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'posts', label: 'Posts', match: (p) => p.type !== 'reel' },
  { id: 'reels', label: 'Reels', match: (p) => p.type === 'reel' },
];

/** Instagram-profile style grid shown under the stories; clicking a tile opens it in the story viewer. */
export default function InstagramGallery({ group, onOpen }) {
  const [filterId, setFilterId] = useState('all');
  const filter = FILTERS.find((f) => f.id === filterId);
  const visible = { ...group, id: `posts-${filterId}`, title: filterId === 'all' ? group.title : filter.label, slides: group.slides.filter(filter.match) };
  const tabs = FILTERS.map((f) => ({ id: f.id, label: `${f.label} (${group.slides.filter(f.match).length})` }));

  return (
    <section aria-label="Instagram posts" className="mx-auto max-w-7xl px-4 pt-6">
      <div className="flex items-end justify-between gap-4">
        <Tabs tabs={tabs} activeId={filterId} onChange={setFilterId} />
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mb-3 hidden items-center gap-1.5 text-sm font-semibold text-muted hover:text-primary sm:flex">
          <Icon name="instagram" className="h-4 w-4" /> @{INSTAGRAM_HANDLE}
        </a>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
        {visible.slides.map((post, i) => (
          <li key={post.id}>
            <GalleryTile post={post} onClick={() => onOpen(visible, i)} />
          </li>
        ))}
      </ul>

      <div className="mt-5 flex justify-center">
        <Button as="a" href={INSTAGRAM_URL} target="_blank" rel="noreferrer" variant="secondary">
          <Icon name="instagram" className="h-4 w-4" /> Follow us on Instagram
        </Button>
      </div>
    </section>
  );
}
