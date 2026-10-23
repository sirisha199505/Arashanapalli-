// Pure functions that turn the Instagram data into story groups.
import { HERO_VIDEO_ID, HIGHLIGHTS, INSTAGRAM_URL, POSTS } from '../data/instagram';

const POST_MAP = Object.fromEntries(POSTS.map((p) => [p.id, p]));

export const postImage = (id) => `/instagram/posts/${id}.jpg`;
export const postVideo = (post) => (post.type === 'reel' ? `/instagram/reels/${post.id}.mp4` : null);
export const postUrl = (post) => `${INSTAGRAM_URL.replace(/[^/]+\/$/, '')}${post.type === 'reel' ? 'reel' : 'p'}/${post.id}/`;

const coverImage = (cover) => (POST_MAP[cover] ? postImage(cover) : `/instagram/covers/${cover}.jpg`);

const toSlide = (post) => ({ ...post, image: postImage(post.id), video: postVideo(post), url: postUrl(post) });

/** Highlights that have at least one post: [{ id, title, cover, slides }] */
export const getStoryGroups = () =>
  HIGHLIGHTS.map((h) => ({ id: h.id, title: h.title, cover: coverImage(h.cover), slides: h.postIds.map((id) => toSlide(POST_MAP[id])) })).filter(
    (g) => g.slides.length,
  );

/** Every post as one group (used by the Instagram gallery). */
export const getPostsGroup = () => ({ id: 'posts', title: 'Posts', cover: '/logo.jpg', slides: POSTS.map(toSlide) });

/** The hero reel as a one-slide group, so it can open in the story viewer with sound. */
export const getHeroGroup = () => ({ id: 'hero', title: 'Featured', cover: '/logo.jpg', slides: [toSlide(POST_MAP[HERO_VIDEO_ID])] });

export const timeAgo = (isoDate, now = new Date()) => {
  const days = Math.max(0, Math.floor((now - new Date(isoDate)) / 86_400_000));
  if (days < 1) return 'today';
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
};

/** Pure navigation: returns the next position, or null when the stories are finished. */
export const stepStory = (groups, { groupIndex, slideIndex }, dir) => {
  const slides = groups[groupIndex].slides.length;
  if (dir > 0) {
    if (slideIndex < slides - 1) return { groupIndex, slideIndex: slideIndex + 1 };
    return groupIndex < groups.length - 1 ? { groupIndex: groupIndex + 1, slideIndex: 0 } : null;
  }
  if (slideIndex > 0) return { groupIndex, slideIndex: slideIndex - 1 };
  return groupIndex > 0 ? { groupIndex: groupIndex - 1, slideIndex: groups[groupIndex - 1].slides.length - 1 } : { groupIndex, slideIndex };
};
