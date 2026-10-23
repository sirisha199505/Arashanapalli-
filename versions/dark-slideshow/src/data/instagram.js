/**
 * SINGLE SOURCE OF TRUTH for Instagram content shown on the site.
 * Images are saved locally in /public/instagram (Instagram's own image links expire).
 * Source: https://www.instagram.com/arashanapallitraders/
 *
 * To add a post: save its image to /public/instagram/posts/<id>.jpg and add an entry to POSTS.
 * To add it to a story: put its id in a highlight's `postIds`.
 */

export const INSTAGRAM_HANDLE = 'arashanapallitraders';
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

/** Newest first. type: 'photo' | 'reel' | 'carousel' */
export const POSTS = [
  { id: 'DewRAe8BaqG', type: 'photo', date: '2026-10-21', title: 'The final touch changes everything', caption: 'Premium door handles that finish your doors beautifully.' },
  { id: 'Deqmg8-hREq', type: 'reel', date: '2026-10-18', title: 'Smart security starts here', caption: 'Godrej safety lockers for homes and offices.' },
  { id: 'DejrsVShM9f', type: 'photo', date: '2026-10-16', title: 'Small hardware. Big impact.', caption: 'The right handle makes all the difference.' },
  { id: 'DehJ6YQhadg', type: 'reel', date: '2026-10-15', title: 'Modern hardware for modern homes', caption: 'Explore our full range of handles at the store.' },
  { id: 'DeWqMdvBZt9', type: 'reel', date: '2026-10-11', title: 'At our store', caption: 'Helping customers choose the right hardware.' },
  { id: 'DdVqVaYgZBE', type: 'carousel', date: '2026-09-15', title: 'Mortise handles', caption: 'A premium handle with a concealed lock mechanism — security with a clean, refined look.' },
  { id: 'DdIwITnBpmt', type: 'reel', date: '2026-09-10', title: 'The art of doors and handles', caption: 'Doors and handles that set the tone of your home.' },
  { id: 'DdDgHyOBnGG', type: 'photo', date: '2026-09-08', title: 'Door hinges', caption: 'Strong doors start with strong hinges. Find yours with us!' },
  { id: 'Dc_KaJph_xP', type: 'reel', date: '2026-09-07', title: 'The application', caption: 'Decorative panels brought to life in real interiors.' },
  { id: 'Dc5a_wSBpk1', type: 'photo', date: '2026-09-05', title: 'Before a wall wears decor, it wears possibilities', caption: 'Wall panels, laminates and veneers — turning every possibility into a solution.' },
  { id: 'Dcu8w1bhe6o', type: 'photo', date: '2026-08-31', title: 'All your interior hardware under one roof', caption: 'Visit us at Kalasiguda, Secunderabad.' },
  { id: 'DcnO71Ghu0f', type: 'photo', date: '2026-08-28', title: '50 years. One legacy. Every detail.', caption: 'Proudly serving generations with premium interior hardware since 1970.' },
];

/** Posts shown in the hero slideshow, in order (best-looking product photography). */
export const HERO_SLIDE_IDS = ['DewRAe8BaqG', 'DdVqVaYgZBE', 'DejrsVShM9f', 'DdDgHyOBnGG', 'Dc5a_wSBpk1', 'DcnO71Ghu0f'];

/**
 * Story highlights (names and covers match the Instagram profile).
 * `cover` is a file in /public/instagram/covers, or a post id to use that post's image.
 * Highlights with no postIds are hidden until their story images are added.
 */
export const HIGHLIGHTS = [
  { id: 'apt', title: 'APT', cover: 'apt', postIds: ['DcnO71Ghu0f', 'Dcu8w1bhe6o'] },
  { id: 'showroom', title: 'Showroom', cover: 'showroom', postIds: ['DehJ6YQhadg'] },
  { id: 'handles', title: 'Handles', cover: 'DdVqVaYgZBE', postIds: ['DewRAe8BaqG', 'DejrsVShM9f', 'DdVqVaYgZBE', 'DdIwITnBpmt'] },
  { id: 'hinges', title: 'Hinges', cover: 'hinges', postIds: ['DdDgHyOBnGG'] },
  { id: 'wall-panels', title: 'Wall Panels', cover: 'wall-panels', postIds: ['Dc5a_wSBpk1', 'Dc_KaJph_xP'] },
  { id: 'safety-lockers', title: 'Safety Lockers', cover: 'safety-lockers', postIds: ['Deqmg8-hREq'] },
  { id: 'client-work', title: 'Client Work', cover: 'client-work', postIds: ['DeWqMdvBZt9'] },
  { id: 'veneer', title: 'Veneer', cover: 'veneer', postIds: [] },
  { id: 'greetings', title: 'Greetings', cover: 'greetings', postIds: [] },
  { id: 'festive', title: 'Festive', cover: 'festive', postIds: [] },
];
