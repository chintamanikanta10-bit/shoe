/**
 * NIKE // AIRPULSE — NIKE BY YOU CUSTOMIZER STUDIO
 * Interactive 3D-feel sneaker configurator: color wash, sole glow, and laser heel tag
 */

const CUSTOMIZER_STATE = {
  upper: 'default',
  upperName: 'Obsidian',
  glow: '#ccff00',
  glowName: 'Volt Electric',
  engraving: 'AIR // 26',
  price: 24995.00
};

document.addEventListener('DOMContentLoaded', () => {
  initCustomizer();
});

function initCustomizer() {
  const upperButtons = document.querySelectorAll('#upper-color-options .custom-color-btn');
  const glowButtons = document.querySelectorAll('#sole-glow-options .glow-color-btn');
  const engravingInput = document.getElementById('custom-engraving-input');
  const charLimitCount = document.getElementById('char-limit-count');
  const heelTag = document.getElementById('custom-heel-tag');
  const colorWash = document.getElementById('custom-color-wash');
  const soleGlow = document.getElementById('custom-sole-glow');
  const specSummary = document.getElementById('custom-spec-summary');
  const addCustomBtn = document.getElementById('btn-add-custom-shoe');

  // Upper tint mappings
  const upperMap = {
    default: { name: 'Obsidian', filter: 'none', bg: 'transparent' },
    crimson: { name: 'Crimson Blaze', filter: 'hue-rotate(330deg) saturate(1.8)', bg: 'rgba(255, 23, 68, 0.25)' },
    cyber: { name: 'Cyber Cyan', filter: 'hue-rotate(180deg) saturate(1.9)', bg: 'rgba(0, 229, 255, 0.25)' },
    emerald: { name: 'Electric Mint', filter: 'hue-rotate(90deg) saturate(1.7)', bg: 'rgba(0, 230, 118, 0.25)' },
    gold: { name: 'Championship Gold', filter: 'hue-rotate(45deg) saturate(2.2)', bg: 'rgba(255, 215, 0, 0.25)' }
  };

  upperButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      upperButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const upperKey = btn.dataset.upper;
      const data = upperMap[upperKey];
      if (data && colorWash) {
        CUSTOMIZER_STATE.upper = upperKey;
        CUSTOMIZER_STATE.upperName = data.name;
        colorWash.style.background = data.bg;
        updateSpecSummary();
      }
    });
  });

  // Sole glow
  glowButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      glowButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const glowColor = btn.dataset.glow;
      CUSTOMIZER_STATE.glow = glowColor;
      CUSTOMIZER_STATE.glowName = btn.title || 'Custom Glow';

      if (soleGlow) {
        soleGlow.style.background = glowColor;
        soleGlow.style.boxShadow = `0 0 45px ${glowColor}`;
      }
      updateSpecSummary();
    });
  });

  // Laser Heel Engraving Live Update
  if (engravingInput && heelTag) {
    engravingInput.addEventListener('input', (e) => {
      let val = e.target.value.toUpperCase();
      if (val.length > 8) val = val.substring(0, 8);
      e.target.value = val;

      CUSTOMIZER_STATE.engraving = val || 'AIR // 26';
      heelTag.textContent = CUSTOMIZER_STATE.engraving;

      if (charLimitCount) {
        charLimitCount.textContent = `${val.length}/8`;
      }
      updateSpecSummary();
    });
  }

  function updateSpecSummary() {
    if (specSummary) {
      specSummary.textContent = `${CUSTOMIZER_STATE.upperName} / ${CUSTOMIZER_STATE.glowName} / [${CUSTOMIZER_STATE.engraving}]`;
    }
  }

  // Add Custom Sneaker to Bag
  if (addCustomBtn) {
    addCustomBtn.addEventListener('click', () => {
      const customItem = {
        id: 999, // Custom bespoke identifier
        name: `Nike By You — Bespoke AirPulse`,
        subtitle: `Custom Bespoke • [${CUSTOMIZER_STATE.engraving}]`,
        price: CUSTOMIZER_STATE.price,
        image_url: '/static/images/hero_sneaker.jpg',
        colorway: `${CUSTOMIZER_STATE.upperName} / ${CUSTOMIZER_STATE.glowName}`,
        size: 10,
        customTag: CUSTOMIZER_STATE.engraving,
        quantity: 1
      };

      if (typeof addItemToCart === 'function') {
        addItemToCart(customItem);
      }
      if (typeof showToast === 'function') {
        showToast(`Custom Bespoke pair [${CUSTOMIZER_STATE.engraving}] added to your bag!`);
      }
      if (typeof openCartDrawer === 'function') {
        openCartDrawer();
      }
    });
  }
}
