/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, MoveUpRight, ZoomIn, X, Minus, Plus, ShoppingBag, Check, Truck } from 'lucide-react';
import { CHECKOUT_LINKS } from './checkout';
import { PRODUCTS, bagKey, productUrl, readRoute, type BagProduct, type BagVariant } from './products';

type Bag = Record<string, number>;
const BAG_KEY = 'bowcarry-shopping-bag-v2';
const BAG_ITEMS = PRODUCTS.flatMap(product => product.variants.map(variant => ({ product, variant, key: bagKey(product, variant) })));
const readBag = (): Bag => {
  try {
    const saved = JSON.parse(localStorage.getItem(BAG_KEY) || '{}');
    return Object.fromEntries(BAG_ITEMS.map(({ key }) => {
      const quantity = saved?.[key];
      return [key, typeof quantity === 'number' && Number.isFinite(quantity) ? Math.max(0, Math.min(10, Math.floor(quantity))) : 0];
    }));
  } catch { return {}; }
};
const addToBag = (product: BagProduct, variant: BagVariant, quantity: number) =>
  window.dispatchEvent(new CustomEvent('bowcarry:add-to-bag', { detail: { key: bagKey(product, variant), quantity } }));

function ShippingBanner() {
  return <div className="shipping-banner"><Truck size={14} aria-hidden="true" /><span>Free international shipping</span></div>;
}

function BagControl() {
  const [bag, setBag] = useState<Bag>(readBag);
  const [storageNotice, setStorageNotice] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const total = Object.values(bag).reduce((sum, quantity) => sum + quantity, 0);
  useEffect(() => {
    const add = (event: Event) => {
      const { key, quantity } = (event as CustomEvent<{ key: string; quantity: number }>).detail;
      if (!BAG_ITEMS.some(item => item.key === key)) return;
      setBag(previous => ({ ...previous, [key]: Math.min(10, (previous[key] || 0) + quantity) }));
      dialog.current?.showModal();
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
  const changeQuantity = (key: string, difference: number) => setBag(previous => ({ ...previous, [key]: Math.max(0, Math.min(10, (previous[key] || 0) + difference)) }));
  return <>
    <button type="button" className="bag-trigger" onClick={() => dialog.current?.showModal()} aria-label={`Open shopping bag, ${total} items`}><ShoppingBag size={18} /><span>Bag</span><span className="bag-count" aria-live="polite">{total}</span></button>
    <dialog ref={dialog} className="purchase-dialog bag-dialog" aria-label="Shopping bag" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <header><h2>Your bag <span>({total})</span></h2><button type="button" className="purchase-close" aria-label="Close shopping bag" onClick={() => dialog.current?.close()}><X size={22} /></button></header>
      {total === 0 ? <div className="bag-empty"><ShoppingBag size={36} /><h3>A little room for your favourites.</h3><p>Choose a bag and a colour to make it yours.</p></div> : <>
        <div className="bag-lines">{BAG_ITEMS.filter(item => bag[item.key] > 0).map(({ product, variant, key }) =>
          <article className="bag-line" key={key}><img src={variant.image} alt={`${product.name} in ${variant.name}`} /><div><h3>{product.name}</h3><p>{variant.name}</p><div className="purchase-quantity"><div><button type="button" aria-label={`Remove one ${product.name}, ${variant.name}`} onClick={() => changeQuantity(key, -1)}><Minus size={16} /></button><output>{bag[key]}</output><button type="button" aria-label={`Add one ${product.name}, ${variant.name}`} disabled={bag[key] >= 10} onClick={() => changeQuantity(key, 1)}><Plus size={16} /></button></div><button type="button" className="bag-remove" onClick={() => setBag(previous => ({ ...previous, [key]: 0 }))}>Remove</button></div></div></article>
        )}</div>
        <div className="bag-summary"><span>Total items</span><strong>{total}</strong></div>
        <p className="purchase-status">Your selections are saved in this browser. Online checkout is not connected yet; prices and payment will be available when the store opens.</p>
        <button className="purchase-checkout" disabled>Checkout not available yet</button>
      </>}
      {storageNotice && <p className="purchase-status" role="status">{storageNotice}</p>}
      <button type="button" className="purchase-continue" onClick={() => dialog.current?.close()}>Continue exploring</button>
    </dialog>
  </>;
}

function BuyButton({ product, variant, compact = false }: { product: BagProduct; variant: BagVariant; compact?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [quantity, setQuantity] = useState(1);
  const checkoutUrl = CHECKOUT_LINKS[bagKey(product, variant)];
  const ready = Boolean(checkoutUrl && /^https:\/\//.test(checkoutUrl));
  return <>
    {!compact && <button type="button" className="add-to-bag" onClick={() => addToBag(product, variant, 1)}><ShoppingBag size={18} /> Add to bag</button>}
    <button type="button" className={`buy-button ${compact ? 'buy-button-compact' : ''}`} onClick={() => { setQuantity(1); dialog.current?.showModal(); }} aria-label={`Buy ${product.name} in ${variant.name}`}><ShoppingBag size={18} /><span>Buy now</span><ArrowRight size={18} /></button>
    <dialog ref={dialog} className="purchase-dialog" aria-label={`Buy ${product.name} in ${variant.name}`} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <header><h2>Your selected bag</h2><button type="button" className="purchase-close" aria-label="Close purchase summary" onClick={() => dialog.current?.close()}><X size={22} /></button></header>
      <div className="purchase-product"><div><img src={variant.image} alt={`${product.name} in ${variant.name}`} /></div><div><p className="purchase-label">THE CARRY COLLECTION</p><h3>{product.name}</h3><p>Colour: {variant.name}</p></div></div>
      {ready ? <><p className="purchase-status">Confirm quantity, price and delivery at the store's secure checkout.</p><a className="purchase-checkout" href={checkoutUrl}>Continue to checkout <ArrowRight size={18} /></a></> : <><div className="purchase-quantity"><span>Quantity</span><div><button type="button" aria-label="Decrease quantity" disabled={quantity === 1} onClick={() => setQuantity(value => Math.max(1, value - 1))}><Minus size={16} /></button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" disabled={quantity === 10} onClick={() => setQuantity(value => Math.min(10, value + 1))}><Plus size={16} /></button></div></div><p className="purchase-status" role="status">Online checkout is not available yet. No payment has been taken.</p><button className="purchase-checkout" disabled>Checkout coming soon</button></>}
      <button type="button" className="add-to-bag purchase-add" onClick={() => { dialog.current?.close(); addToBag(product, variant, ready ? 1 : quantity); }}>Add {ready ? 1 : quantity} to bag <ShoppingBag size={18} /></button>
      <button type="button" className="purchase-continue" onClick={() => dialog.current?.close()}>Continue exploring</button>
    </dialog>
  </>;
}

function ProductGallery({ product, variant, productIndex }: { product: BagProduct; variant: BagVariant; productIndex: number }) {
  const [extraImage, setExtraImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const src = extraImage || variant.image;
  return <div className="product-gallery">
    <div className="product-photo">
      <span className="product-photo-label"><Sparkles size={13} /> YOUR EVERYDAY PLUS ONE.</span>
      <img src={src} alt={`${product.name} in ${variant.name}${extraImage ? ', alternate view' : ''}`} />
      <button type="button" className="photo-zoom" aria-label={`Zoom ${product.name} in ${variant.name}`} onClick={() => { setZoom(1); dialog.current?.showModal(); }}><ZoomIn size={20} /></button>
      <div className="product-photo-caption"><span>{variant.name.toUpperCase()}</span><span>0{productIndex + 1} / 0{PRODUCTS.length}</span></div>
    </div>
    <div className="variant-thumbnails" aria-label={`${product.name} colour photos`}>
      {product.variants.map(item => <button type="button" key={item.id} aria-label={`Show ${item.name} photo`} aria-pressed={item.id === variant.id && !extraImage} onClick={() => { setExtraImage(null); window.location.hash = productUrl(product, item); }}><img src={item.image} alt={item.name} /><span>{item.name}</span></button>)}
      {variant.extraImages?.map((image, index) => <button type="button" key={image} aria-label={`Show ${variant.name} alternate view ${index + 1}`} aria-pressed={extraImage === image} onClick={() => setExtraImage(image)}><img src={image} alt={`${variant.name}, alternate view`} /><span>Another angle</span></button>)}
    </div>
    <dialog ref={dialog} className="product-zoom" aria-label={`${product.name} image zoom`} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="zoom-header"><h2>{product.name} / {variant.name}</h2><button type="button" aria-label="Close image zoom" onClick={() => dialog.current?.close()}><X /></button></div>
      <div className="zoom-canvas"><img src={src} alt={`Enlarged ${product.name} in ${variant.name}`} style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%`, maxWidth: 'none' }} /></div>
      <div className="zoom-controls"><button type="button" aria-label="Zoom out" disabled={zoom === 1} onClick={() => setZoom(value => Math.max(1, value - .5))}><Minus size={18} /></button><span aria-live="polite">{Math.round(zoom * 100)}%</span><button type="button" aria-label="Zoom in" disabled={zoom === 3} onClick={() => setZoom(value => Math.min(3, value + .5))}><Plus size={18} /></button><p>Zoom in, then scroll to explore.</p></div>
    </dialog>
  </div>;
}

function ProductPage({ product, variant }: { product: BagProduct; variant: BagVariant }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  const index = PRODUCTS.findIndex(item => item.slug === product.slug);
  return <main className="product-page" style={{ '--product-bg': variant.theme.bg, '--product-panel': variant.theme.panel } as React.CSSProperties}>
    <ShippingBanner />
    <header className="product-header"><a href="#/" className="product-back"><ArrowLeft size={20} /> Back to collection</a><span className="product-brand">Blush&Bloom</span><BagControl /></header>
    <nav className="product-section-nav" aria-label="Product sections">
      {[['the-details', 'The details'], ['all-colours', 'Choose your colour'], ['more-bags', 'More bags']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={event => { event.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}>{label}</a>)}
    </nav>
    <div className="product-layout">
      <ProductGallery key={variant.id} product={product} variant={variant} productIndex={index} />
      <section className="product-details" id="the-details">
        <p className="product-eyebrow">THE CARRY COLLECTION / 0{index + 1}</p>
        <h1 ref={heading} tabIndex={-1}>{product.name}</h1>
        <p className="product-tagline">{product.headline}</p><p className="product-intro">{product.description}</p>
        <fieldset className="product-colors" id="all-colours"><legend>Colour <strong aria-live="polite">{variant.name}</strong></legend>
          <div className="product-swatches">{product.variants.map(item => <button type="button" key={item.id} aria-label={`Choose ${item.name}`} aria-pressed={item.id === variant.id} onClick={() => { window.location.hash = productUrl(product, item); }}><span className="product-swatch-dot" style={{ background: item.color }} /><span>{item.name}</span></button>)}</div>
        </fieldset>
        <div className="product-purchase"><BuyButton key={variant.id} product={product} variant={variant} /><p className="product-purchase-note"><Check size={14} /> Your selected colour: {variant.name}</p></div>
        <div className="product-included"><h2>It's all in the details</h2><ul>{product.details.map(detail => <li key={detail}>{detail}</li>)}</ul></div>
        <p className="product-note">One signature style. {product.variants.length} colours to make it yours.</p>
        <a href="#/" className="product-collection-link">Explore the collection <ArrowRight size={20} /></a>
      </section>
    </div>
    <div className="product-ticker" aria-hidden="true"><span>CARRY. STYLE. REPEAT.</span><Sparkles /><span>YOUR EVERYDAY PLUS ONE.</span><Sparkles /><span>CARRY. STYLE. REPEAT.</span></div>
    <section className="product-faq"><div><p className="product-eyebrow">A FEW LITTLE DETAILS</p><h2>Good to know.</h2></div><div className="faq-list">
      <details><summary>Which colours can I choose?</summary><p>The {product.name} comes in {product.variants.map(item => item.name).join(', ')}. Choose a colour above to see its matching product photo.</p></details>
      <details><summary>Will my chosen colour be saved?</summary><p>Yes. Your bag keeps each style and colour as a separate item, so you can mix and match. Your selections are saved in this browser.</p></details>
      <details><summary>Can I see the bag up close?</summary><p>Use the magnifying glass on the product photo to zoom in. The thumbnails show every available colour{variant.extraImages?.length ? ', plus another angle of this colour' : ''}.</p></details>
    </div></section>
    <section id="more-bags" className="product-related"><div className="section-heading"><p className="product-eyebrow">MEET THE REST OF THE COLLECTION</p><h2>Find your <span>next plus one.</span></h2></div><div className="related-grid">
      {PRODUCTS.filter(item => item.slug !== product.slug).map(item => <a className="related-card" key={item.slug} href={productUrl(item)}><div><img src={item.variants[0].image} alt={`${item.name} in ${item.variants[0].name}`} loading="lazy" /><span><MoveUpRight size={22} /></span></div><h3>{item.name}</h3><p>{item.variants.length} colours / {item.headline}</p></a>)}
    </div></section>
    <footer className="product-footer"><a href="#/" className="product-brand">Blush&Bloom</a><span>Everyday essentials. A little more personality.</span><a href="#/">Back to collection <ArrowRight size={16} /></a></footer>
  </main>;
}

type Role = 'center' | 'left' | 'right';
const GRAIN = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.08'/%3E%3C/svg%3E";

export default function App() {
  const [routeHash, setRouteHash] = useState(() => window.location.hash);
  const route = readRoute(routeHash);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, PRODUCTS.findIndex(item => item.slug === readRoute().product?.slug)));
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial = readRoute();
    return initial.product && initial.variant ? { [initial.product.slug]: initial.variant.id } : {};
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<number | null>(null);
  useEffect(() => {
    const sync = () => {
      const next = readRoute();
      setRouteHash(window.location.hash);
      if (next.product && next.variant) {
        setActiveIndex(PRODUCTS.findIndex(item => item.slug === next.product.slug));
        setSelectedVariants(previous => ({ ...previous, [next.product.slug]: next.variant.id }));
      }
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  useEffect(() => {
    document.title = route.product ? `Blush&Bloom | ${route.product.name} - ${route.variant!.name}` : 'Blush&Bloom | The Carry Collection';
  }, [route.product?.slug, route.variant?.id]);
  useEffect(() => {
    PRODUCTS.forEach(product => { const image = new Image(); image.src = product.variants[0].image; });
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);
  const navigate = useCallback((direction: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(previous => (previous + direction + PRODUCTS.length) % PRODUCTS.length);
    timer.current = setTimeout(() => setIsAnimating(false), 650);
  }, [isAnimating]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (readRoute().product || document.querySelector('dialog[open]') || (event.target instanceof Element && event.target.closest('button, a, input, select, textarea'))) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); navigate(event.key === 'ArrowLeft' ? -1 : 1); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [navigate]);
  const product = PRODUCTS[activeIndex];
  const selectedVariant = (item: BagProduct) => item.variants.find(variant => variant.id === selectedVariants[item.slug]) ?? item.variants[0];
  const variant = selectedVariant(product);
  const role = (index: number): Role => index === activeIndex ? 'center' : index === (activeIndex + PRODUCTS.length - 1) % PRODUCTS.length ? 'left' : 'right';
  if (route.product && route.variant) return <ProductPage key={route.product.slug} product={route.product} variant={route.variant} />;
  return <main id="hero-root" style={{ '--product-bg': variant.theme.bg, '--product-panel': variant.theme.panel, backgroundColor: variant.theme.bg, transition: 'background-color 650ms ease', fontFamily: "'Inter', sans-serif" } as React.CSSProperties}>
    <div id="hero-viewport" onTouchStart={event => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={event => { if (touchStart.current !== null) { const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 40 && !(event.target instanceof Element && event.target.closest('dialog, .hero-colors, .collection-select'))) navigate(delta > 0 ? -1 : 1); } touchStart.current = null; }}>
      <ShippingBanner />
      <div id="grain-overlay" style={{ backgroundImage: `url("${GRAIN}")` }} />
      <header id="brand-header"><span id="brand-label">Blush&Bloom</span><BagControl /></header>
      <div id="giant-ghost-text" aria-hidden="true">CARRY IN STYLE</div>
      <nav className="collection-select" aria-label="Bag styles">{PRODUCTS.map((item, index) => <button type="button" key={item.slug} aria-label={`Show ${item.name}`} aria-pressed={index === activeIndex} onClick={() => { if (!isAnimating) setActiveIndex(index); }}><span>0{index + 1}</span>{item.name}</button>)}</nav>
      <fieldset className="hero-colors"><legend>Colour <strong aria-live="polite">{variant.name}</strong></legend><div>{product.variants.map(item => <button type="button" key={item.id} aria-label={`Choose ${item.name}`} aria-pressed={item.id === variant.id} title={item.name} onClick={() => setSelectedVariants(previous => ({ ...previous, [product.slug]: item.id }))}><span style={{ background: item.color }} /></button>)}</div></fieldset>
      <div id="bag-carousel" aria-label="The carry collection">{PRODUCTS.map((item, index) => {
        const position = role(index);
        const itemVariant = selectedVariant(item);
        return <button type="button" key={item.slug} className="hero-product" data-role={position} aria-label={position === 'center' ? `Explore ${item.name} in ${itemVariant.name}` : `Show ${item.name}`} onClick={() => { if (position === 'center') window.location.hash = productUrl(item, itemVariant); else navigate(position === 'left' ? -1 : 1); }}><img src={itemVariant.image} alt={`${item.name} in ${itemVariant.name}`} draggable={false} /><span>{item.name}<MoveUpRight size={16} /></span></button>;
      })}</div>
      <div id="bottom-left-panel"><p id="bags-headline" aria-live="polite">{product.name}</p><p id="bags-description">{product.headline}<br />{product.variants.length} colours. Your kind of carry.</p><div id="navigation-controls"><button id="prev-button" type="button" aria-label="Previous bag" onClick={() => navigate(-1)}><ArrowLeft size={26} /></button><button id="next-button" type="button" aria-label="Next bag" onClick={() => navigate(1)}><ArrowRight size={26} /></button><span className="collection-count">0{activeIndex + 1} / 0{PRODUCTS.length}</span></div></div>
      <div id="hero-buy"><BuyButton key={bagKey(product, variant)} product={product} variant={variant} compact /></div>
      <a id="discover-it-link" href={productUrl(product, variant)}>DISCOVER IT <ArrowRight size={30} /></a>
    </div>
  </main>;
}
