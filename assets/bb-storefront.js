(() => {
  const sections = document.querySelectorAll('[data-bb-home]');

  sections.forEach((section) => {
    const slides = Array.from(section.querySelectorAll('[data-bb-slide]'));
    if (slides.length === 0) return;

    const navigation = Array.from(section.querySelectorAll('[data-bb-go-to]'));
    const swatchLists = Array.from(section.querySelectorAll('[data-bb-swatch-list]'));
    const headline = section.querySelector('[data-bb-headline]');
    const colorCount = section.querySelector('[data-bb-color-count]');
    const selectedColor = section.querySelector('[data-bb-selected-color]');
    const counter = section.querySelector('[data-bb-counter]');
    const discover = section.querySelector('[data-bb-discover]');
    let activeIndex = 0;
    let touchStartX = null;

    const updateVariant = (slide, swatch) => {
      const image = slide.querySelector('[data-bb-product-image]');
      if (image && swatch.dataset.image) {
        image.src = swatch.dataset.image;
        image.alt = `${slide.dataset.title} in ${swatch.dataset.variantTitle}`;
      }
      if (swatch.dataset.background) section.style.setProperty('--bb-bg', swatch.dataset.background);
      if (swatch.dataset.panel) section.style.setProperty('--bb-panel', swatch.dataset.panel);
      slide.href = swatch.dataset.url;
      slide.dataset.variantId = swatch.dataset.variantId;
      slide.setAttribute('aria-label', `Discover ${slide.dataset.title} in ${swatch.dataset.variantTitle}`);
      swatch.closest('[data-bb-swatch-list]').querySelectorAll('[data-bb-swatch]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button === swatch));
      });

      if (slide.dataset.index === String(activeIndex)) {
        if (selectedColor) selectedColor.textContent = swatch.dataset.variantTitle;
        if (discover) discover.href = swatch.dataset.url;
        const soldOut = swatch.dataset.available !== 'true';
        slide.setAttribute(
          'aria-label',
          `Discover ${slide.dataset.title} in ${swatch.dataset.variantTitle}${soldOut ? ' (sold out)' : ''}`,
        );
      }
    };

    const showSlide = (nextIndex) => {
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const role = index === activeIndex
          ? 'center'
          : index === (activeIndex + slides.length - 1) % slides.length
            ? 'left'
            : 'right';
        slide.dataset.role = role;
        slide.setAttribute('aria-hidden', String(role !== 'center'));
        if (role !== 'center') slide.setAttribute('tabindex', '-1');
        else slide.removeAttribute('tabindex');
      });

      navigation.forEach((button, index) => {
        button.setAttribute('aria-pressed', String(index === activeIndex));
      });
      swatchLists.forEach((list, index) => {
        list.classList.toggle('is-active', index === activeIndex);
        list.setAttribute('aria-hidden', String(index !== activeIndex));
      });

      const activeSlide = slides[activeIndex];
      const activeSwatches = swatchLists.find((list) => list.dataset.index === String(activeIndex));
      const selectedSwatch = activeSwatches?.querySelector('[aria-pressed="true"]')
        || activeSwatches?.querySelector('[data-bb-swatch]');
      if (selectedSwatch) updateVariant(activeSlide, selectedSwatch);
      if (headline) headline.textContent = activeSlide.dataset.headline || '';
      if (colorCount) {
        const count = activeSwatches?.querySelectorAll('[data-bb-swatch]').length || 0;
        colorCount.textContent = String(count);
      }
      if (counter) counter.textContent = `0${activeIndex + 1} / 0${slides.length}`;
    };

    section.addEventListener('click', (event) => {
      const swatch = event.target.closest('[data-bb-swatch]');
      if (swatch) {
        event.preventDefault();
        const slide = slides[Number(swatch.closest('[data-bb-swatch-list]').dataset.index)];
        updateVariant(slide, swatch);
        return;
      }

      const target = event.target.closest('[data-bb-go-to]');
      if (target) showSlide(Number(target.dataset.bbGoTo));
      if (event.target.closest('[data-bb-prev]')) showSlide(activeIndex - 1);
      if (event.target.closest('[data-bb-next]')) showSlide(activeIndex + 1);
    });

    section.addEventListener('keydown', (event) => {
      if (event.target.closest('button, a, input, select, textarea')) return;
      if (event.key === 'ArrowLeft') showSlide(activeIndex - 1);
      if (event.key === 'ArrowRight') showSlide(activeIndex + 1);
    });

    section.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    section.addEventListener('touchend', (event) => {
      if (touchStartX === null) return;
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 40) showSlide(activeIndex + (distance > 0 ? -1 : 1));
      touchStartX = null;
    }, { passive: true });

    showSlide(0);
  });

  document.querySelectorAll('[data-bb-product]').forEach((section) => {
    const form = section.querySelector('.bb-product__form');
    const image = section.querySelector('[data-bb-product-image]');
    const price = section.querySelector('[data-bb-price]');
    const comparePrice = section.querySelector('[data-bb-compare-price]');
    const colorLabel = section.querySelector('[data-bb-selected-color]');
    const addButton = section.querySelector('[data-bb-add]');
    const zoomDialog = section.querySelector('[data-bb-zoom-dialog]');
    const zoomImage = section.querySelector('[data-bb-zoom-image]');

    const updateProduct = (variant) => {
      if (!variant) return;
      if (image && variant.dataset.image) {
        image.src = variant.dataset.image;
        image.alt = `${section.querySelector('h1')?.textContent || 'Product'} in ${variant.dataset.variantTitle}`;
      }
      if (variant.dataset.background) section.style.setProperty('--bb-product-bg', variant.dataset.background);
      if (variant.dataset.panel) section.style.setProperty('--bb-product-panel', variant.dataset.panel);
      if (price && variant.dataset.price) price.textContent = variant.dataset.price;
      if (comparePrice) {
        comparePrice.textContent = variant.dataset.comparePrice || '';
        comparePrice.hidden = !variant.dataset.comparePrice;
      }
      if (colorLabel) colorLabel.textContent = variant.dataset.variantTitle || '';
      if (addButton) {
        addButton.disabled = variant.dataset.available !== 'true';
        addButton.textContent = variant.dataset.available === 'true' ? 'Add to bag' : 'Sold out';
      }
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.value);
      window.history.replaceState({}, '', url);
    };

    form?.querySelectorAll('[data-bb-variant]').forEach((variant) => {
      variant.addEventListener('change', () => updateProduct(variant));
    });

    section.querySelectorAll('[data-bb-gallery-image]').forEach((thumbnail) => {
      thumbnail.addEventListener('click', () => {
        if (image) {
          image.src = thumbnail.dataset.image;
          image.alt = thumbnail.dataset.alt || '';
        }
        section.querySelectorAll('[data-bb-gallery-image]').forEach((item) => {
          item.setAttribute('aria-pressed', String(item === thumbnail));
        });
      });
    });

    section.querySelector('[data-bb-zoom]')?.addEventListener('click', () => {
      if (!zoomDialog || typeof zoomDialog.showModal !== 'function') return;
      if (image && zoomImage) {
        zoomImage.src = image.src;
        zoomImage.alt = image.alt;
      }
      zoomDialog.showModal();
    });

    section.querySelector('[data-bb-close-zoom]')?.addEventListener('click', () => zoomDialog?.close());
    zoomDialog?.addEventListener('click', (event) => {
      if (event.target === zoomDialog) zoomDialog.close();
    });
  });
})();
