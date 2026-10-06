/**
 * NIKE // AIRPULSE INDIA — STRIDE AI RECOMMENDER ENGINE
 * Biomechanics questionnaire & personalized shoe recommendation with Indian Rupee (₹) pricing
 */

const QUIZ_STATE = {
  currentStep: 1,
  totalSteps: 5,
  answers: {
    activity: 'running',
    cushion: 'maximum',
    arch: 'neutral',
    surface: 'road',
    intensity: 'high',
    max_budget: 24000 // In Indian Rupees (₹)
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initQuizTriggers();
  initQuizControls();
});

function initQuizTriggers() {
  const modal = document.getElementById('quiz-modal');
  const openButtons = [
    document.getElementById('btn-open-quiz'),
    document.getElementById('hero-quiz-btn'),
    document.getElementById('btn-start-recommender'),
    document.getElementById('mobile-quiz-trigger')
  ];
  const closeBtn = document.getElementById('close-quiz-btn');

  openButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        openQuizModal();
      });
    }
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  }
}

function openQuizModal() {
  const modal = document.getElementById('quiz-modal');
  if (!modal) return;

  QUIZ_STATE.currentStep = 1;
  updateQuizView();

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function initQuizControls() {
  const nextBtn = document.getElementById('quiz-next-btn');
  const prevBtn = document.getElementById('quiz-prev-btn');
  const budgetSlider = document.getElementById('quiz-budget-slider');
  const budgetDisplay = document.getElementById('budget-val-display');

  const optionButtons = document.querySelectorAll('.quiz-option-btn');
  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const stepContainer = btn.closest('.quiz-step');
      if (!stepContainer) return;

      stepContainer.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const param = btn.dataset.param;
      const value = btn.dataset.value;
      if (param && value) {
        QUIZ_STATE.answers[param] = value;
      }
    });
  });

  if (budgetSlider && budgetDisplay) {
    budgetSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      budgetDisplay.textContent = `₹${val.toLocaleString('en-IN')}`;
      QUIZ_STATE.answers.max_budget = val;
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (QUIZ_STATE.currentStep < QUIZ_STATE.totalSteps) {
        QUIZ_STATE.currentStep++;
        updateQuizView();
      } else if (QUIZ_STATE.currentStep === QUIZ_STATE.totalSteps) {
        calculateRecommendations();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (QUIZ_STATE.currentStep > 1) {
        QUIZ_STATE.currentStep--;
        updateQuizView();
      }
    });
  }
}

function updateQuizView() {
  const steps = document.querySelectorAll('.quiz-step');
  const progressFill = document.getElementById('quiz-progress-fill');
  const stepCount = document.getElementById('quiz-step-count');
  const prevBtn = document.getElementById('quiz-prev-btn');
  const nextBtn = document.getElementById('quiz-next-btn');
  const footer = document.getElementById('quiz-footer');
  const resultsView = document.getElementById('quiz-results-view');

  if (resultsView) resultsView.style.display = 'none';
  if (footer) footer.style.display = 'flex';

  steps.forEach(step => {
    const sNum = parseInt(step.dataset.step);
    step.classList.toggle('active', sNum === QUIZ_STATE.currentStep);
  });

  const pct = (QUIZ_STATE.currentStep / QUIZ_STATE.totalSteps) * 100;
  if (progressFill) progressFill.style.width = `${pct}%`;

  const stepTitles = [
    'Primary Purpose',
    'Cushion Preference',
    'Arch & Biomechanics',
    'Surface & Intensity',
    'Budget Cap (INR ₹)'
  ];

  if (stepCount) {
    stepCount.textContent = `Step ${QUIZ_STATE.currentStep} of ${QUIZ_STATE.totalSteps}: ${stepTitles[QUIZ_STATE.currentStep - 1]}`;
  }

  if (prevBtn) {
    prevBtn.style.visibility = QUIZ_STATE.currentStep === 1 ? 'hidden' : 'visible';
  }

  if (nextBtn) {
    if (QUIZ_STATE.currentStep === QUIZ_STATE.totalSteps) {
      nextBtn.innerHTML = `
        <span>Calculate Match</span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
      `;
    } else {
      nextBtn.innerHTML = `
        <span>Continue</span>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;
    }
  }
}

async function calculateRecommendations() {
  const steps = document.querySelectorAll('.quiz-step');
  const footer = document.getElementById('quiz-footer');
  const resultsView = document.getElementById('quiz-results-view');
  const calcScreen = document.getElementById('quiz-calculating');
  const contentScreen = document.getElementById('quiz-results-content');
  const stepCount = document.getElementById('quiz-step-count');
  const progressFill = document.getElementById('quiz-progress-fill');

  steps.forEach(s => s.classList.remove('active'));
  if (footer) footer.style.display = 'none';
  if (stepCount) stepCount.textContent = 'Analysis Complete: Biomechanical Affinity Generated (India)';
  if (progressFill) progressFill.style.width = '100%';

  if (resultsView) resultsView.style.display = 'block';
  if (calcScreen) calcScreen.style.display = 'block';
  if (contentScreen) contentScreen.style.display = 'none';

  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(QUIZ_STATE.answers)
    });

    const data = await res.json();
    const recommendations = data.recommendations || [];
    const bestMatch = data.best_match;

    setTimeout(() => {
      if (calcScreen) calcScreen.style.display = 'none';
      if (contentScreen) {
        contentScreen.style.display = 'block';
        renderQuizResults(bestMatch, recommendations);
      }
    }, 800);

  } catch (err) {
    console.error('Recommendation engine error:', err);
    if (calcScreen) {
      calcScreen.innerHTML = `
        <h4>Error calculating recommendations</h4>
        <p>Please check backend connectivity.</p>
        <button class="btn-secondary" onclick="openQuizModal()">Try Again</button>
      `;
    }
  }
}

function renderQuizResults(bestMatch, recommendations) {
  const contentScreen = document.getElementById('quiz-results-content');
  if (!contentScreen || !bestMatch) return;

  const runnerUps = recommendations.slice(1, 3);
  const formattedPrice = `₹${Math.round(bestMatch.price).toLocaleString('en-IN')}`;

  contentScreen.innerHTML = `
    <!-- TOP BEST MATCH HIGHLIGHT -->
    <div class="top-match-card">
      <div class="top-match-header">
        <span class="card-badge highlight-badge">#1 BIOMECHANICAL MATCH</span>
        <div class="match-percentage-badge">${bestMatch.match_score}% MATCH</div>
      </div>

      <div class="top-match-body">
        <img src="${bestMatch.image_url}" alt="${bestMatch.name}" class="top-match-img">
        <div class="top-match-info">
          <h4>${bestMatch.name}</h4>
          <span class="top-match-subtitle">${bestMatch.subtitle}</span>
          <div class="top-match-price">${formattedPrice}</div>
          <div class="hero-cta-group">
            <button class="btn-primary" onclick="quickAddToCart(${bestMatch.id}); closeQuizModal();">
              Add Best Match to Bag
            </button>
            <button class="btn-secondary" onclick="openProductModal(${bestMatch.id}); closeQuizModal();">
              Full Tech Breakdown
            </button>
          </div>
        </div>
      </div>

      <ul class="match-reasons-list">
        ${bestMatch.match_reasons.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <!-- RUNNER UP STYLES -->
    <div style="margin-top: 24px;">
      <h4 style="font-size: 0.95rem; font-family: var(--font-mono); color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase;">
        Alternate Recommended Silhouettes
      </h4>
      <div class="secondary-matches-grid">
        ${runnerUps.map(alt => {
          const altPrice = `₹${Math.round(alt.price).toLocaleString('en-IN')}`;
          return `
            <div class="secondary-match-item" onclick="openProductModal(${alt.id}); closeQuizModal();">
              <img src="${alt.image_url}" alt="${alt.name}" class="secondary-match-img">
              <div class="secondary-match-info">
                <strong>${alt.name}</strong>
                <span>${alt.match_score}% Compatibility • ${altPrice}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- RETAKE OR CLOSE -->
    <div style="text-align: center; margin-top: 28px;">
      <button class="btn-secondary" onclick="openQuizModal()">
        <span>↺ Retake Fit Quiz</span>
      </button>
    </div>
  `;
}

function closeQuizModal() {
  const modal = document.getElementById('quiz-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}
