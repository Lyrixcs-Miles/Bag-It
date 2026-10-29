export interface BagVariant {
  id: string;
  name: string;
  color: string;
  theme: { bg: string; panel: string };
  image: string;
  extraImages?: string[];
}

export interface BagProduct {
  slug: string;
  name: string;
  headline: string;
  bg: string;
  panel: string;
  description: string;
  details: string[];
  variants: BagVariant[];
}

const image = (name: string) => `/images/bags/transparent/${name}.png`;

export const PRODUCTS: BagProduct[] = [
  {
    slug: 'bow-tote', name: 'Bow Tote', headline: 'A little bow. A lot of personality.',
    bg: '#B8567C', panel: '#D980A2',
    description: 'Your everyday carry, with a playful finishing touch. Long shoulder handles and statement side bows make this tote an easy addition to your daily rotation.',
    details: ['Statement bow details at the sides', 'Long handles for shoulder carrying', 'A softly structured everyday silhouette'],
    variants: [
      { id: 'black', name: 'Black', color: '#282426', theme: { bg: '#41464F', panel: '#B8BDC8' }, image: image('bow-tote-black') },
      { id: 'brown', name: 'Brown', color: '#804330', theme: { bg: '#84523E', panel: '#D6A68B' }, image: image('bow-tote-brown') },
    ],
  },
  {
    slug: 'foldaway-tote', name: 'Foldaway Tote', headline: 'Big on the day. Small on the go.',
    bg: '#456C65', panel: '#70938A',
    description: 'An extra bag, always within reach. This roomy shoulder tote folds into a compact matching pouch with a clip, ready to come along for errands, shopping and spontaneous plans.',
    details: ['Folds into a compact matching pouch', 'Clip detail for keeping it close', 'A relaxed shoulder bag silhouette'],
    variants: [
      { id: 'black', name: 'Black', color: '#171F25', theme: { bg: '#37474D', panel: '#B1C0C5' }, image: image('foldaway-tote-black') },
      { id: 'navy', name: 'Navy', color: '#142C50', theme: { bg: '#304D75', panel: '#A0B8D8' }, image: image('foldaway-tote-navy') },
      { id: 'olive', name: 'Olive', color: '#535A3E', theme: { bg: '#566345', panel: '#BDC59F' }, image: image('foldaway-tote-olive') },
      { id: 'khaki', name: 'Khaki', color: '#C4B787', theme: { bg: '#6F6347', panel: '#D8CCA7' }, image: image('foldaway-tote-khaki') },
      { id: 'brown', name: 'Brown', color: '#493426', theme: { bg: '#684B3D', panel: '#C7A18A' }, image: image('foldaway-tote-brown') },
    ],
  },
  {
    slug: 'travel-weekender', name: 'Travel Weekender', headline: 'Your next getaway starts here.',
    bg: '#665479', panel: '#9382A6',
    description: 'For a change of scene and everything you want to bring. A statement travel bag with carry handles, a shoulder strap and zip details, in a colour for every kind of getaway.',
    details: ['Twin carry handles and a shoulder strap', 'Zip details with gold-tone hardware', 'An elongated travel bag silhouette'],
    variants: [
      { id: 'black', name: 'Black', color: '#202123', theme: { bg: '#44434D', panel: '#B8B7C1' }, image: image('weekender-black'), extraImages: [image('weekender-black-detail')] },
      { id: 'black-tan', name: 'Black & Tan', color: 'linear-gradient(135deg, #202123 50%, #A24929 50%)', theme: { bg: '#665044', panel: '#D6AE8A' }, image: image('weekender-black-tan') },
      { id: 'blush-tan', name: 'Blush & Tan', color: 'linear-gradient(135deg, #E3CBC7 50%, #A24929 50%)', theme: { bg: '#81525A', panel: '#E6BCC4' }, image: image('weekender-blush-tan') },
      { id: 'rose', name: 'Rose', color: '#B42251', theme: { bg: '#A33661', panel: '#EAA0BC' }, image: image('weekender-rose') },
      { id: 'peach', name: 'Peach', color: '#EAA99A', theme: { bg: '#8B4F44', panel: '#F0BDB0' }, image: image('weekender-peach') },
      { id: 'cream-tan', name: 'Cream & Tan', color: 'linear-gradient(135deg, #E5D9C7 50%, #A24929 50%)', theme: { bg: '#706044', panel: '#E8D6B6' }, image: image('weekender-cream-tan') },
    ],
  },
];

export const productUrl = (product: BagProduct, variant?: BagVariant) =>
  `#/products/${product.slug}${variant ? `?color=${variant.id}` : ''}`;

export const bagKey = (product: BagProduct, variant: BagVariant) => `${product.slug}:${variant.id}`;

export function readRoute(hash = window.location.hash) {
  const [path, query = ''] = hash.slice(1).split('?');
  const product = PRODUCTS.find(item => path === `/products/${item.slug}`);
  const color = new URLSearchParams(query).get('color');
  const variant = product?.variants.find(item => item.id === color) ?? product?.variants[0];
  return { product, variant };
}
