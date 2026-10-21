/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CHECKOUT_LINKS } from './checkout';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Flower2, Ribbon, MoveUpRight, ZoomIn, X, Minus, Plus, ShoppingBag } from 'lucide-react';

interface TumblerImage { src: string; name: string; bg: string; panel: string; }
const IMAGES: TumblerImage[] = [
{ src: '/images/tumbler-pink.png', name: 'Blush Pink', bg: '#D96B99', panel: '#E88AB0' },
{ src: '/images/tumbler-black.png', name: 'Midnight Black', bg: '#41464F', panel: '#5B626D' },
{ src: '/images/tumbler-lavender.png', name: 'Lavender', bg: '#9780C6', panel: '#B19AD8' },
{ src: '/images/tumbler-mint.png', name: 'Mint', bg: '#4E9C90', panel: '#78B9AA' },
];

const productSlug = (item: TumblerImage) => item.name.toLowerCase().replaceAll(' ', '-');
const productFromHash = () => IMAGES.findIndex(item => window.location.hash === `#/products/${productSlug(item)}`);

type Role = 'center' | 'left' | 'right' | 'back';

const GRAIN_SVG_DATA_URI =
  "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E";

type Bag = Record<string, number>;
const BAG_KEY = 'bowcarry-shopping-bag';
const readBag = (): Bag => {
  try {
    const saved = JSON.parse(localStorage.getItem(BAG_KEY) || '{}');
    return Object.fromEntries(IMAGES.map(item => {
      const slug = productSlug(item);
      const quantity = saved?.[slug];
      return [slug, typeof quantity === 'number' && Number.isFinite(quantity) ? Math.max(0, Math.min(10, Math.floor(quantity))) : 0];
    }));
  } catch { return {}; }
};
const addToBag = (product: TumblerImage, quantity: number) => window.dispatchEvent(new CustomEvent('bowcarry:add-to-bag', { detail: { slug: productSlug(product), quantity } }));
function BagControl() {
  const [bag, setBag] = useState<Bag>(readBag);
  const [storageNotice, setStorageNotice] = useState('');
  const bagRef = useRef<HTMLDialogElement>(null);
  const total = (Object.values(bag) as number[]).reduce((sum, quantity) => sum + quantity, 0);
  useEffect(() => {
    const add = (event: Event) => {
      const { slug, quantity } = (event as CustomEvent<{ slug: string; quantity: number }>).detail;
      if (!IMAGES.some(item => productSlug(item) === slug)) return;
      setBag(previous => ({ ...previous, [slug]: Math.min(10, (previous[slug] || 0) + quantity) }));
      bagRef.current?.showModal();
    };
    const sync = (event: StorageEvent) => { if (event.key === BAG_KEY || event.key === null) setBag(readBag()); };
    window.addEventListener('bowcarry:add-to-bag', add);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('bowcarry:add-to-bag', add); window.removeEventListener('storage', sync); };
  }, []);
  useEffect(() => {
    try { localStorage.setItem(BAG_KEY, JSON.stringify(bag)); }
    catch { setStorageNotice('Your browser cannot save this bag. Keep this page open to retain your selections.'); }
  }, [bag]);
  const changeQuantity = (slug: string, difference: number) => setBag(previous => ({ ...previous, [slug]: Math.max(0, Math.min(10, (previous[slug] || 0) + difference)) }));
  return <>
    <button type="button" className="bag-trigger" onClick={() => bagRef.current?.showModal()} aria-label={`Open shopping bag, ${total} items`}><ShoppingBag size={18} /><span>Bag</span><span className="bag-count" aria-live="polite">{total}</span></button>
    <dialog ref={bagRef} className="purchase-dialog bag-dialog" aria-label="Shopping bag" onClick={event => { if (event.target === event.currentTarget) bagRef.current?.close(); }}>
      <header><h2>Your bag <span>({total})</span></h2><button type="button" className="purchase-close" aria-label="Close shopping bag" onClick={() => bagRef.current?.close()}><X size={22} /></button></header>
      {total === 0 ? <div className="bag-empty"><ShoppingBag size={36} /><h3>A little room for your favorites.</h3><p>Choose a color and add your tumbler to the bag.</p></div> : <>
        <div className="bag-lines">{IMAGES.filter(item => bag[productSlug(item)] > 0).map(item => {
          const slug = productSlug(item);
          return <article className="bag-line" key={slug}><img src={item.src} alt={item.name + ' tumbler'} style={{ background: item.panel }} /><div><h3>{item.name}</h3><p>Full accessory set</p><div className="purchase-quantity"><div><button type="button" aria-label={`Remove one ${item.name}`} onClick={() => changeQuantity(slug, -1)}><Minus size={16} /></button><output>{bag[slug]}</output><button type="button" aria-label={`Add one ${item.name}`} disabled={bag[slug] >= 10} onClick={() => changeQuantity(slug, 1)}><Plus size={16} /></button></div><button type="button" className="bag-remove" onClick={() => setBag(previous => ({ ...previous, [slug]: 0 }))}>Remove</button></div></div></article>;
        })}</div>
        <div className="bag-summary"><span>Total items</span><strong>{total}</strong></div>
        <p className="purchase-status">Your selections are saved in this browser. Online checkout is not connected yet; prices and payment will be available when the store opens.</p>
        <button className="purchase-checkout" disabled>Checkout not available yet</button>
      </>}
      {storageNotice && <p className="purchase-status" role="status">{storageNotice}</p>}
      <button type="button" className="purchase-continue" onClick={() => bagRef.current?.close()}>Continue exploring</button>
    </dialog>
  </>;
}

function BuyButton({ product, compact = false }: { product: TumblerImage; compact?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [quantity, setQuantity] = useState(1);
  const checkoutUrl = CHECKOUT_LINKS[productSlug(product)];
  const ready = Boolean(checkoutUrl && /^https:\/\//.test(checkoutUrl));
  return <>
    {!compact && <button type="button" className="add-to-bag" onClick={() => addToBag(product, 1)}><ShoppingBag size={18} /> Add to bag</button>}
    <button type="button" className={`buy-button ${compact ? 'buy-button-compact' : ''}`} onClick={() => { setQuantity(1); dialogRef.current?.showModal(); }} aria-label={`Buy ${product.name} tumbler`}><ShoppingBag size={18} /><span>Buy now</span><ArrowRight size={18} /></button>
    <dialog ref={dialogRef} className="purchase-dialog" aria-label={`Buy ${product.name} tumbler`} onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <header><h2>Your selected tumbler</h2><button type="button" className="purchase-close" aria-label="Close purchase summary" onClick={() => dialogRef.current?.close()}><X size={22} /></button></header>
      <div className="purchase-product"><div style={{ background: product.panel }}><img src={product.src} alt={product.name + ' tumbler'} /></div><div><p className="purchase-label">THE COMPLETE ACCESSORY LOOK</p><h3>{product.name} Tumbler</h3><p>Includes matching bows, handles, strap and charms.</p></div></div>
      {ready ? <><p className="purchase-status">Confirm quantity, price and delivery at the store's secure checkout.</p><a className="purchase-checkout" href={checkoutUrl}>Continue to checkout <ArrowRight size={18} /></a></> : <><div className="purchase-quantity"><span>Quantity</span><div><button type="button" aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus size={16} /></button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={quantity === 10} onClick={() => setQuantity(value => Math.min(10, value + 1))}><Plus size={16} /></button></div></div><p className="purchase-status" role="status">Online checkout is not available yet. No payment has been taken.</p><button className="purchase-checkout" disabled>Checkout coming soon</button></>}
      <button type="button" className="add-to-bag purchase-add" onClick={() => { dialogRef.current?.close(); addToBag(product, ready ? 1 : quantity); }}>Add {ready ? 1 : quantity} to bag <ShoppingBag size={18} /></button>
      <button type="button" className="purchase-continue" onClick={() => dialogRef.current?.close()}>Continue exploring</button>
    </dialog>
  </>;
}

function ProductExtras({ product }: { product: TumblerImage }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(1);
  const [accessories, setAccessories] = useState({ bow: true, strap: true, charms: true, handle: true });
  const toggle = (name: keyof typeof accessories) => setAccessories(previous => ({ ...previous, [name]: !previous[name] }));
  const accent = product.bg;
  return <>
    <button className="zoom-launch" onClick={() => { setZoom(1); dialogRef.current?.showModal(); }}><ZoomIn size={18} /> Zoom into the details</button>
    <dialog ref={dialogRef} className="product-zoom" onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
      <div className="zoom-header"><h2>{product.name} Tumbler</h2><button aria-label="Close image zoom" onClick={() => dialogRef.current?.close()}><X /></button></div>
      <div className="zoom-canvas"><img src={product.src} alt={`Enlarged ${product.name} tumbler`} style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%`, maxWidth: 'none' }} /></div>
      <div className="zoom-controls"><button aria-label="Zoom out" disabled={zoom === 1} onClick={() => setZoom(value => Math.max(1, value - .5))}><Minus size={18} /></button><span aria-live="polite">{Math.round(zoom * 100)}%</span><button aria-label="Zoom in" disabled={zoom === 3} onClick={() => setZoom(value => Math.min(3, value + .5))}><Plus size={18} /></button><p>Zoom in, then scroll to explore.</p></div>
    </dialog>
    <section className="accessory-customizer" aria-label="Accessory customizer">
      <div><p className="product-eyebrow">MAKE IT YOURS</p><h2>Build your look.</h2><p className="customizer-description">Try different combinations in the illustrated preview.</p></div>
      <div className="customizer-layout">
        <svg className="customizer-preview" viewBox="0 0 300 360" role="img" aria-label={`Illustrated ${product.name} tumbler with ${Object.entries(accessories).filter(([, selected]) => selected).map(([name]) => name).join(', ') || 'no accessories'}`}>
          <defs><linearGradient id="cup-shade"><stop stopColor={product.panel} /><stop offset=".55" stopColor="#ffffff" stopOpacity=".8" /><stop offset="1" stopColor={product.panel} /></linearGradient></defs>
          <ellipse cx="150" cy="333" rx="84" ry="10" fill="#000" opacity=".08" />
          {accessories.strap && <path className="accessory-piece" d="M94 124C30 145 31 315 74 324H232C270 308 264 165 205 125" fill="none" stroke={accent} strokeWidth="14" />}
          {accessories.handle && <path className="accessory-piece" d="M95 126Q150 -40 205 126" stroke={accent} strokeWidth="11" strokeDasharray="2 4" strokeLinecap="round" fill="none" />}
          <path d="M100 154H78Q61 154 61 174V225Q61 245 80 245H103" fill="none" stroke={product.panel} strokeWidth="14" />
          <path d="M97 129H204L197 249L181 319Q150 333 118 319L103 249Z" fill="url(#cup-shade)" stroke={product.panel} strokeWidth="2" />
          <rect x="94" y="117" width="113" height="22" rx="8" fill={product.panel} />
          <rect x="146" y="58" width="8" height="60" rx="3" fill="#ffffffaa" stroke="#ffffff" />
          <path d="M116 291Q150 300 185 291L181 320Q150 333 118 320Z" fill={accent} />
          {accessories.bow && <g className="accessory-piece" fill={accent}><path d="M150 78Q105 45 116 90Q123 101 150 83Q176 104 184 90Q195 45 150 78Z" /><path d="M145 84L134 108L147 101L150 88L158 107L170 111L157 83Z" /><path d="M150 309Q125 288 129 311Q137 321 150 313Q168 325 173 310Q176 289 150 309Z" /></g>}
          {accessories.charms && <g className="accessory-piece"><path d="M150 143V198" stroke="#C39A51" strokeWidth="3" strokeDasharray="4 2" /><circle cx="150" cy="214" r="26" fill={accent} /><g fill={product.panel} stroke="#C39A51" strokeWidth="1.5"><path d="M149 185C131 166 129 193 145 193C124 204 145 218 150 200C157 221 179 204 158 194C178 185 158 170 149 185Z" /></g></g>}
        </svg>
        <div className="customizer-options">{([['bow', 'Signature bows'], ['handle', 'Braided handle'], ['strap', 'Shoulder strap'], ['charms', 'Pompom & flower charms']] as const).map(([name, label]) => <label key={name}><input type="checkbox" checked={accessories[name]} onChange={() => toggle(name)} /><span>{label}</span></label>)}<button className="customizer-reset" onClick={() => setAccessories({ bow: true, strap: true, charms: true, handle: true })}>Reset full look</button><p aria-live="polite">{Object.values(accessories).filter(Boolean).length} of 4 accessory groups selected</p></div>
      </div>
    </section>
  </>;
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState<number>(() => Math.max(0, productFromHash()));
  const [productIndex, setProductIndex] = useState(productFromHash);
  const productHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const syncRoute = () => {
      const index = productFromHash();
      setProductIndex(index);
      if (index >= 0) setActiveIndex(index);
    };
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);
  useEffect(() => {
    document.title = productIndex >= 0 ? `Blush&Bloom | ${IMAGES[productIndex].name} Tumbler` : 'Blush&Bloom | Accessorized Tumblers';
    if (productIndex >= 0) productHeadingRef.current?.focus({ preventScroll: true });
  }, [productIndex]);
  useEffect(() => {
    if (productIndex < 0 || !('IntersectionObserver' in window)) return;
    const root = document.querySelector('.product-page');
    if (!root) return;
    const elements = root.querySelectorAll('.section-heading, .detail-card, .style-visual, .style-copy, .product-faq > div, .related-card');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root, threshold: 0.12 });
    const revealAll = () => {
      if (motionQuery.matches) elements.forEach(element => element.classList.add('is-visible'));
    };
    elements.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      (element as HTMLElement).style.setProperty('--reveal-delay', `${element.matches('.detail-card, .related-card') ? index % 3 * 90 : 0}ms`);
      if (motionQuery.matches) element.classList.add('is-visible');
      else observer.observe(element);
    });
    motionQuery.addEventListener('change', revealAll);
    return () => {
      observer.disconnect();
      motionQuery.removeEventListener('change', revealAll);
      elements.forEach(element => element.classList.remove('scroll-reveal', 'is-visible'));
    };
  }, [productIndex]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigate = useCallback(
    (direction: 'next' | 'prev') => {
      if (isAnimating) return;
      setIsAnimating(true);

      if (direction === 'next') {
        setActiveIndex((prev) => (prev + 1) % 4);
      } else {
        setActiveIndex((prev) => (prev + 3) % 4);
      }

      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current);
      }

      animTimerRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 650);
    },
    [isAnimating]
  );

  useEffect(() => {
    return () => {
      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (productFromHash() >= 0) return;
      if (e.key === 'ArrowLeft') {
        navigate('prev');
      } else if (e.key === 'ArrowRight') {
        navigate('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        navigate('prev');
      } else {
        navigate('next');
      }
    }
    touchStartXRef.current = null;
  };

  const getRole = (index: number): Role => {
    if (index === activeIndex) return 'center';
    if (index === (activeIndex + 3) % 4) return 'left';
    if (index === (activeIndex + 1) % 4) return 'right';
    return 'back';
  };

  const getRoleStyle = (role: Role): React.CSSProperties => {
    const transitionCurve = '650ms cubic-bezier(0.4, 0, 0.2, 1)';
    const baseTransition = [
      `transform ${transitionCurve}`,
      `filter ${transitionCurve}`,
      `opacity ${transitionCurve}`,
      `left ${transitionCurve}`,
      `bottom ${transitionCurve}`,
      `height ${transitionCurve}`,
    ].join(', ');

    switch (role) {
      case 'center':
        return {
          position: 'absolute',
          aspectRatio: '0.6 / 1',
          transform: `translateX(-50%) scale(1)`,
          filter: 'blur(0px)',
          opacity: 1,
          zIndex: 20,
          left: '50%',
          height: isMobile ? '64%' : '80%',
          bottom: isMobile ? '23%' : '11%',
          transition: baseTransition,
          willChange: 'transform, filter, opacity',
        };
      case 'left':
        return {
          position: 'absolute',
          aspectRatio: '0.6 / 1',
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: isMobile ? '20%' : '30%',
          height: isMobile ? '16%' : '28%',
          bottom: isMobile ? '32%' : '12%',
          transition: baseTransition,
          willChange: 'transform, filter, opacity',
        };
      case 'right':
        return {
          position: 'absolute',
          aspectRatio: '0.6 / 1',
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: isMobile ? '80%' : '70%',
          height: isMobile ? '16%' : '28%',
          bottom: isMobile ? '32%' : '12%',
          transition: baseTransition,
          willChange: 'transform, filter, opacity',
        };
      case 'back':
        return {
          position: 'absolute',
          aspectRatio: '0.6 / 1',
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(4px)',
          opacity: 1,
          zIndex: 5,
          left: '50%',
          height: isMobile ? '13%' : '22%',
          bottom: isMobile ? '32%' : '12%',
          transition: baseTransition,
          willChange: 'transform, filter, opacity',
        };
    }
  };

  if (productIndex >= 0) {
    const product = IMAGES[productIndex];
    return (
      <main key={product.name} className="product-page" style={{ '--product-bg': product.bg, '--product-panel': product.panel } as React.CSSProperties}>
        <header className="product-header">
          <a href="#/" className="product-back"><ArrowLeft size={20} /> Back to collection</a>
          <span className="product-brand">Blush&Bloom</span>
          <BagControl />
        </header>
        <nav className="product-section-nav" aria-label="Product sections">
          <a href="#build-your-look" onClick={e => { e.preventDefault(); document.getElementById('build-your-look')?.scrollIntoView({ behavior: 'smooth' }); }}>Build your look</a>
          <a href="#the-details" onClick={e => { e.preventDefault(); document.getElementById('the-details')?.scrollIntoView({ behavior: 'smooth' }); }}>The details</a>
          <a href="#style-guide" onClick={e => { e.preventDefault(); document.getElementById('style-guide')?.scrollIntoView({ behavior: 'smooth' }); }}>Style guide</a>
          <a href="#more-colors" onClick={e => { e.preventDefault(); document.getElementById('more-colors')?.scrollIntoView({ behavior: 'smooth' }); }}>More colors <MoveUpRight size={14} /></a>
        </nav>
        <div className="product-layout">
          <div className="product-photo">
            <span className="product-photo-label"><Sparkles size={13} /> ALL DRESSED UP. READY TO GO.</span>
            <img src={product.src} alt={`${product.name} tumbler with the complete matching accessory set`} /><div className="product-photo-caption"><span>THE SIGNATURE COLLECTION</span><span>0{productIndex + 1} / 04</span></div>
          </div>
          <section className="product-details">
            <p className="product-eyebrow">YOUR DAILY SIP, WITH PERSONALITY</p>
            <h1 ref={productHeadingRef} tabIndex={-1}>{product.name}<br /><span>Tumbler</span></h1>
            <p className="product-intro">A little bow. A little charm. A whole lot of you. Meet your everyday companion, styled in {product.name.toLowerCase()} with a full set of coordinated accessories.</p>
            <fieldset className="product-colors">
              <legend>Color <strong>{product.name}</strong></legend>
              <div className="product-swatches">{IMAGES.map((item, index) => (
                <a key={item.name} href={`#/products/${productSlug(item)}`} aria-label={`View ${item.name} tumbler`} aria-current={index === productIndex ? 'page' : undefined} title={item.name}><span className="product-swatch-dot" style={{ backgroundColor: ['#F8B6D0', '#17181B', '#C7B5ED', '#AFE0CD'][index] }} /><span>{item.name}</span></a>
              ))}</div>
            </fieldset>
            <div className="product-purchase"><BuyButton product={product} /><p className="product-purchase-note"><Ribbon size={14} /> Full matching accessory set included</p></div>
            <div className="product-included">
              <h2>The complete look</h2>
              <ul>
                <li>Handled tumbler with lid and clear straw</li>
                <li>Matching straw bow and protective bow boot</li>
                <li>Braided carry handle and adjustable shoulder strap</li>
                <li>Fluffy pompom and flower charm chain</li>
              </ul>
            </div>
            <div className="product-tags"><span><Ribbon size={14} /> Matching accessories</span><span><Flower2 size={14} /> Signature flower charms</span></div>
            <p className="product-note">One signature design. Four ways to make it yours.</p>
            <a href="#/" className="product-collection-link">Explore the collection <ArrowRight size={20} /></a>
          </section>
        </div>
        <div className="product-ticker" aria-hidden="true"><span>SIP. STYLE. REPEAT.</span><Sparkles /><span>A LITTLE EVERYDAY JOY.</span><Sparkles /><span>SIP. STYLE. REPEAT.</span></div>
        <section className="product-tools" id="build-your-look"><ProductExtras product={product} /></section>
        <section id="the-details" className="product-story">
          <div className="section-heading"><p className="product-eyebrow">IT'S ALL IN THE DETAILS</p><h2>Extra? <span>Absolutely.</span></h2><p>Little finishing touches that turn an everyday essential into your favorite accessory.</p></div>
          <div className="detail-grid">
            {[
              { title: 'Put a bow on it.', text: 'A statement straw bow and a matching bow boot bring the whole look together.', position: '50% 12%', icon: <Ribbon size={22} />, number: '01' },
              { title: 'Charm your day.', text: 'A fluffy pompom and delicate flower charms add texture, movement and personality.', position: '50% 52%', icon: <Flower2 size={22} />, number: '02' },
              { title: 'Take it with you.', text: 'Switch between the braided carry handle and the adjustable shoulder strap to suit your plans.', position: '15% 38%', icon: <Sparkles size={22} />, number: '03' },
            ].map(detail => <article className="detail-card" key={detail.number}>
              <div className="detail-image" style={{ backgroundColor: product.panel }}><img src={product.src} alt={detail.title} style={{ objectPosition: detail.position }} /><span>{detail.number}</span></div>
              <div className="detail-card-copy">{detail.icon}<h3>{detail.title}</h3><p>{detail.text}</p></div>
            </article>)}
          </div>
        </section>
        <section id="style-guide" className="product-style">
          <div className="style-visual" style={{ backgroundColor: product.panel }}><span>YOUR NEW<br />PLUS ONE.</span><img src={product.src} alt={`The complete ${product.name} look`} /></div>
          <div className="style-copy"><p className="product-eyebrow">FROM FIRST SIP TO LAST STOP</p><h2>Same tumbler.<br /><span>Your kind of day.</span></h2>
            <div className="style-step"><span>01</span><div><h3>The morning ritual</h3><p>A matching bow and flower charm make even your desk feel a little more you.</p></div></div>
            <div className="style-step"><span>02</span><div><h3>The out-the-door look</h3><p>Reach for the braided handle for a coordinated carry on your next coffee run.</p></div></div>
            <div className="style-step"><span>03</span><div><h3>The hands-free moment</h3><p>Clip on the adjustable shoulder strap when your day calls for a little more freedom.</p></div></div>
          </div>
        </section>
        <section className="product-faq"><div><p className="product-eyebrow">A FEW LITTLE DETAILS</p><h2>Good to know.</h2></div><div className="faq-list">
          <details><summary>What comes with the look?</summary><p>The tumbler, lid and clear straw, plus a straw bow, bow boot, braided handle, adjustable shoulder strap, fluffy pompom and flower charm chain.</p></details>
          <details><summary>Can I change how I carry it?</summary><p>Yes. The braided handle and shoulder strap attach with clips, so you can choose the carry style that suits your day.</p></details>
          <details><summary>Does every color have the same accessories?</summary><p>Yes. Blush Pink, Midnight Black, Lavender and Mint each feature the same accessory design in a coordinated palette.</p></details>
        </div></section>
        <section id="more-colors" className="product-related"><div className="section-heading"><p className="product-eyebrow">MEET THE REST OF THE COLLECTION</p><h2>Find your <span>color crush.</span></h2></div><div className="related-grid">
          {IMAGES.filter(item => item.name !== product.name).map(item => <a className="related-card" key={item.name} href={`#/products/${productSlug(item)}`} onClick={() => document.querySelector('.product-page')?.scrollTo({ top: 0 })}><div style={{ background: item.panel }}><img src={item.src} alt={`${item.name} accessorized tumbler`} /><span><MoveUpRight size={22} /></span></div><h3>{item.name}</h3><p>The complete accessory look</p></a>)}
        </div></section>
        <footer className="product-footer"><a href="#/" className="product-brand">Blush&Bloom</a><span>Everyday essentials. A little more personality.</span><a href="#/">Back to collection <ArrowRight size={16} /></a></footer>
      </main>
    );
  }

  return (
    <div
      id="hero-root"
      className="relative w-full overflow-hidden select-none"
      style={{
        backgroundColor: IMAGES[activeIndex].bg,
        transition: 'background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        id="hero-viewport"
        className="relative w-full overflow-hidden"
        style={{ height: '100dvh', overflow: 'hidden' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >

        <div
          id="grain-overlay"
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            opacity: 0.4,
            backgroundImage: `url("${GRAIN_SVG_DATA_URI}")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />

        <div
          id="giant-ghost-text"
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none uppercase"
          style={{
            zIndex: 2,
            top: '18%',
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(68px, 19vw, 280px)',
            fontWeight: 900,
            color: '#ffffff',
            opacity: 1,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          SIP IN STYLE
        </div>

        <header
          id="brand-header"
          className="absolute top-6 left-4 sm:left-8"
          style={{ zIndex: 60 }}
        >
          <span
            id="brand-label"
            className="text-xs font-semibold uppercase text-white"
            style={{
              opacity: 0.9,
              letterSpacing: '0.18em',
            }}
          >
            Blush&Bloom
          </span>
        </header>

        <div id="colors" className="absolute top-6 right-4 sm:right-8 flex items-center gap-3" style={{ zIndex: 60 }} aria-label="Tumbler colors">
{IMAGES.map((item, index) => <button key={item.name} type="button" aria-label={`Show ${item.name}`} aria-pressed={activeIndex === index} onClick={() => { if (!isAnimating) setActiveIndex(index); }} className="w-6 h-6 rounded-full border-2 border-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" style={{ backgroundColor: ['#F8B6D0', '#17181B', '#C7B5ED', '#AFE0CD'][index], outline: activeIndex === index ? '2px solid white' : undefined, outlineOffset: 4 }} />)}
</div>

        <div
          id="tumbler-carousel"
          className="absolute inset-0"
          style={{ zIndex: 3 }}
        >
          {IMAGES.map((item, index) => {
            const role = getRole(index);
            const style = getRoleStyle(role);

            return (
              <div
                key={index}
                id={`tumbler-item-${index}`} data-role={role}
                style={style}
                onClick={() => {
                  if (role === 'left') navigate('prev');
                  if (role === 'right') navigate('next');
                }}
                className={`transition-transform duration-300 ${
                  role === 'left' || role === 'right'
                    ? 'cursor-pointer hover:brightness-105'
                    : ''
                }`}
                title={
                  role === 'left'
                    ? 'View previous tumbler'
                    : role === 'right'
                    ? 'View next tumbler'
                    : `Tumbler ${index + 1}`
                }
              >
                <img
                  src={item.src}
                  alt={`${item.name} tumbler with matching bow, braided handle, shoulder strap and flower pompom charms`}
                  draggable={false}
                  referrerPolicy="no-referrer"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                  }}
                />
              </div>
            );
          })}
        </div>

        <div
          id="bottom-left-panel"
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: '320px' }}
        >
          <p
            id="tumblers-headline" aria-live="polite"
            className="mb-2 sm:mb-3 font-bold uppercase text-white tracking-widest text-base sm:text-[22px]"
            style={{
              opacity: 0.95,
              letterSpacing: '0.02em',
            }}
          >
            {IMAGES[activeIndex].name} Tumbler
          </p>

          <p
            id="tumblers-description"
            className="hidden sm:block mb-4 sm:mb-5 text-white text-xs sm:text-sm"
            style={{
              opacity: 0.85,
              lineHeight: 1.6,
            }}
          >
            Your everyday tumbler, all dressed up. Matching bows, braided handles, shoulder straps and flower charms. Four colors. One signature style.
          </p>

          <div id="navigation-controls" className="flex items-center gap-3 sm:gap-4">
            <button
              id="prev-button"
              type="button"
              onClick={() => navigate('prev')}
              aria-label="Previous tumbler"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white bg-transparent flex items-center justify-center text-white transition-all duration-150 ease-out hover:scale-108 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
              style={{
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft size={26} strokeWidth={2.25} className="text-white" />
            </button>

            <button
              id="next-button"
              type="button"
              onClick={() => navigate('next')}
              aria-label="Next tumbler"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white bg-transparent flex items-center justify-center text-white transition-all duration-150 ease-out hover:scale-108 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 cursor-pointer"
              style={{
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowRight size={26} strokeWidth={2.25} className="text-white" />
            </button>
          </div>
        </div>

        <div id="hero-buy"><BuyButton product={IMAGES[activeIndex]} compact /></div>

        <a
          id="discover-it-link"
          href={`#/products/${productSlug(IMAGES[activeIndex])}`}
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 flex items-center text-white no-underline select-none group cursor-pointer"
          style={{
            zIndex: 60,
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(20px, 4vw, 56px)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          <span
            id="discover-text"
            className="transition-opacity duration-200"
            style={{ opacity: 0.95 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.95';
            }}
          >
            DISCOVER IT
          </span>
          <ArrowRight
            className="ml-2 sm:ml-3 w-5 h-5 sm:w-8 sm:h-8 transition-all duration-200 group-hover:translate-x-1"
            strokeWidth={2.25}
            style={{ opacity: 0.95 }}
          />
        </a>
      </div>
    </div>
  );
}

