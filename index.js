/* ==========================================================================
   STARTUPSENSE AI - INTERACTION ENGINE
   ========================================================================== */

import {
  auth,
  db,
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  resetPassword,
  checkUsernameUnique,
  completeOnboarding,
  logoutUser,
  onAuthChange
} from "./firebase-service.js";

document.addEventListener('DOMContentLoaded', () => {
  
  /* ------------------------------------------------------------------------
     1. HEADER SCROLL EFFECT
     ------------------------------------------------------------------------ */
  const header = document.getElementById('header');
  
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run once on startup


  /* ------------------------------------------------------------------------
     2. MOBILE MENU & DRAWER CONTROL
     ------------------------------------------------------------------------ */
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  const toggleMenu = () => {
    menuToggle.classList.toggle('active');
    mobileDrawer.classList.toggle('active');
    // Toggle body scroll locking
    document.body.style.overflow = mobileDrawer.classList.contains('active') ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', toggleMenu);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('active')) {
        toggleMenu();
      }
    });
  });


  /* ------------------------------------------------------------------------
     3. FAQ ACCORDION WITH DYNAMIC SCROLLHEIGHT
     ------------------------------------------------------------------------ */
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Close all other accordion items first for a clean look
      accordionItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-content').style.maxHeight = '0px';
          otherItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('active');
        content.style.maxHeight = '0px';
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ------------------------------------------------------------------------
     4. INTERACTIVE AI STARTUP ANALYZER
     ------------------------------------------------------------------------ */
  const startupInput = document.getElementById('startupInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const demoLoader = document.getElementById('demoLoader');
  const loaderStatus = document.getElementById('loaderStatus');
  const progressBar = document.getElementById('progressBar');
  const demoOutput = document.getElementById('demoOutput');
  const presetChips = document.querySelectorAll('.preset-chip');

  // SWOT DOM elements
  const swotStrengths = document.getElementById('swotStrengths');
  const swotWeaknesses = document.getElementById('swotWeaknesses');
  const swotOpportunities = document.getElementById('swotOpportunities');
  const swotThreats = document.getElementById('swotThreats');
  
  // Revenue DOM elements
  const marketSizeVal = document.getElementById('marketSize');
  const channelListContainer = document.getElementById('channelList');

  // Pre-configured Mock Data based on Keywords
  const analysisData = {
    yoga: {
      swot: {
        s: ["Personalized onboarding caters to varying skills", "High scalability using mobile application channels"],
        w: ["Highly competitive fitness app market space", "User retention requires constant content refresh"],
        o: ["Integrate with smart wearable devices (watchOS, Garmin)", "Corporate wellness partnerships for team-based yoga"],
        t: ["Established competitors (Peloton, Apple Fitness+)", "Short-term yoga trend cycles and user fatigue"]
      },
      marketSize: "₹1,190 Cr / Year",
      channels: [
        { name: "SaaS Subscription (Premium Plans)", weight: 60 },
        { name: "In-App Virtual Workshops", weight: 25 },
        { name: "Affiliate Yoga Apparel sales", weight: 15 }
      ],
      competitors: {
        name1: "Peloton Yoga",
        name2: "Yoga Studio App",
        features: [
          ["Flexibility Diagnostics", "Yes (AI Camera)", "No (Pre-recorded)", "No"],
          ["Real-time Bio-feedback", "Yes (Apple Watch)", "No", "No"],
          ["Subscription Pricing", "₹499 / Month", "₹1,299 / Month", "₹399 / Month"],
          ["Niche Alignment", "High (Flexibility focus)", "Low (General fitness)", "Medium (General yoga)"]
        ]
      },
      canvas: {
        problem: "Traditional fitness applications deliver static yoga routines that ignore the user's specific joints flexibility limits, resulting in slower progression or elevated physical injury risks.",
        solution: "Provide a vision-AI camera calibration that maps personal flexibility metrics, dynamically restructuring yoga postures and sequences in real-time.",
        metrics: "Average weekly session completion rate, monthly user retention, and flexible index range improvement score.",
        value: "Achieve safe, customized yoga posture calibrations tailored directly to your personal joint flex limits, automatically designed by AI.",
        advantage: "Proprietary real-time joint-angle inference model using standard smartphone camera feeds.",
        channels: "Apple App Store and Google Play, organic yoga influencer sponsorships, and corporate wellness benefits managers.",
        segments: "Injury-fearing beginners, sedentary work professionals needing rehabilitation, and advanced yogis breaking plateaus.",
        cost: "GPU server processing for real-time model inference, high-quality instructor content acquisition, and digital ad acquisition.",
        revenue: "SaaS subscriptions (₹499/mo) and premium specialty workshop tickets (₹1,500/session)."
      },
      suggestions: [
        "Consult with professional yoga teachers and physiotherapists to validate the joint-angle safe extension limit presets.",
        "Launch a browser-based '3-minute desk posture stretch' teaser extension to drive traffic from desk-bound workers.",
        "Market directly around the pain-point of 'preventing yoga injuries' to create high contrast with general fitness giants.",
        "Optimize the camera calibration flow to ensure it takes less than 30 seconds to minimize onboarding drop-offs."
      ]
    },
    eco: {
      swot: {
        s: ["Strong consumer interest in eco-friendly sustainability", "High recurring order value from household products"],
        w: ["Higher supply chain costs for verified zero-waste goods", "Niche market compared to cheap traditional plastics"],
        o: ["B2B corporate gifting packages and bundles", "Dynamic custom subscription intervals to increase average order value"],
        t: ["Greenwashing competitors causing consumer skepticism", "Rapidly changing plastic-alternatives regulation policies"]
      },
      marketSize: "₹722.5 Cr / Year",
      channels: [
        { name: "Product Sales (Sub-boxes)", weight: 70 },
        { name: "Direct-to-Consumer (eCommerce)", weight: 20 },
        { name: "Brand Sponsorships", weight: 10 }
      ],
      competitors: {
        name1: "Grove Collaborative",
        name2: "Local Eco Markets",
        features: [
          ["Custom Refill Scheduling", "Yes (Automated)", "No (Manual ordering)", "No"],
          ["Plastic-Free Verification", "100% Certified", "Variable (Partially eco)", "Variable"],
          ["Delivery carbon offset", "Yes (Carbon Neutral)", "No", "No"],
          ["Product variety selection", "Medium (Curated essentials)", "High (Mass market)", "Low (Local only)"]
        ]
      },
      canvas: {
        problem: "Conscious consumers struggle to find verified plastic-free household goods, often resorting to inconvenient travel or sorting through greenwashed brands.",
        solution: "A personalized subscription box that curates certified zero-waste kitchen, bath, and household cleaning supplies.",
        metrics: "Customer lifetime value (LTV), monthly subscription retention rate, and total pounds of plastic waste diverted.",
        value: "Seamlessly transition to a certified zero-waste household with automated, eco-friendly essentials delivered to your door.",
        advantage: "Direct wholesale vendor integrations and packaging returning network loops.",
        channels: "Social media sustainability influencers, green lifestyle search ads, and local community farmers market pop-ups.",
        segments: "Eco-conscious urban families, zero-waste lifestyle beginners, and climate-anxious Gen-Z consumers.",
        cost: "Eco-certified wholesale procurement, zero-plastic packaging materials, and low-emission shipping logistics.",
        revenue: "Monthly curated box subscription sales (average ₹1,499/box) and online store individual item purchases."
      },
      suggestions: [
        "Design a circular packaging model where users can return empty glass refill containers in their next box delivery.",
        "Introduce a dashboard 'carbon tracker' showing users exactly how many plastic bottles they have saved to encourage retention.",
        "Partner with sustainable lifestyle micro-influencers on TikTok and Instagram to create unboxing content.",
        "Offer local pickup hubs in high-density eco-aware neighborhoods to eliminate shipping overheads."
      ]
    },
    calendar: {
      swot: {
        s: ["Direct value proposition of saved hours each week", "Unique data-driven deep work scheduling algorithms"],
        w: ["Hardware compatibility issues with biometric sensor SDKs", "Consumer privacy concerns around sensitive health data tracking"],
        o: ["Integrate with enterprise workspaces (Slack, Teams, Jira)", "Premium licensing tiers for startup corporate accounts"],
        t: ["Tech giants (Google, Microsoft) adding similar smart tools", "Frequent biometric wearable API deprecations"]
      },
      marketSize: "₹1,785 Cr / Year",
      channels: [
        { name: "B2B Enterprise Licensing", weight: 50 },
        { name: "Pro Consumer Subscription Plans", weight: 35 },
        { name: "Integration App Store commissions", weight: 15 }
      ],
      competitors: {
        name1: "Reclaim.ai",
        name2: "Google Calendar",
        features: [
          ["Biometric SDK sync", "Yes (Fitbit / Apple)", "No", "No"],
          ["Auto Deep Work locks", "Yes (Adaptive)", "Yes (Rules-based)", "No (Manual block)"],
          ["Slack Focus Mode toggle", "Yes (Automated)", "Yes (Manual sync)", "No"],
          ["Team Calendar Overlays", "High (AI-negotiated)", "Medium (Standard overlap)", "Low"]
        ]
      },
      canvas: {
        problem: "Knowledge workers experience constant cognitive context switching due to scattered meetings, resulting in lack of deep focus time and burnout.",
        solution: "A smart calendar extension that analyzes sleep, heart-rate variability, and schedule density to dynamically auto-block optimal focus hours.",
        metrics: "Daily active focus hours logged, user schedule satisfaction score, and meeting schedule renegotiation success rate.",
        value: "Auto-protect your best energy windows for deep work before meeting requests can fill them, synced with your body's biometrics.",
        advantage: "Biometric correlation logic matching circadian rhythms with focus task performance history.",
        channels: "Google Workspace Marketplace, Product Hunt launcher campaigns, and professional tech community sponsorships.",
        segments: "Software developers, project managers, startup founders, and research students with high cognitive loads.",
        cost: "OAuth security compliance auditing, third-party wearable API integration maintenance, and developer salaries.",
        revenue: "Individual pro plans (₹399/mo) and B2B corporate team licenses (₹799/user/mo)."
      },
      suggestions: [
        "Prioritize obtaining official Google Workspace Recommended App certification to build trust with corporate IT managers.",
        "Implement a 'Friday Digest' showing users exactly how many hours of deep focus were saved and protected.",
        "Create a Slack plugin that auto-updates profile status to 'Deep Work (Circadian Peak)' and silences notifications.",
        "Ensure all user biometric data is processed client-side or fully encrypted to resolve enterprise security requirements."
      ]
    },
    camera: {
      swot: {
        s: ["High-margin peer-to-peer transaction fee architecture", "Zero initial inventory overhead costs"],
        w: ["Complex trust and damage liability insurance overheads", "High marketing cost to acquire initial camera lenders"],
        o: ["Partnerships with film universities and photography academies", "Expansion into high-end audio, tripod, and lighting gear rentals"],
        t: ["Fast depreciation of camera body value as new tech drops", "Legal disputes over equipment damages or theft"]
      },
      marketSize: "₹807.5 Cr / Year",
      channels: [
        { name: "Marketplace Transaction Fees (15%)", weight: 65 },
        { name: "Lender Premium Insurance Add-ons", weight: 25 },
        { name: "Professional Equipment Cleaning Fees", weight: 10 }
      ],
      competitors: {
        name1: "ShareGrid",
        name2: "Traditional Rental Shops",
        features: [
          ["Instant P2P Insurance", "Yes (On-demand)", "Yes (Annual policy)", "No (High deposit)"],
          ["Local Gear Pickup", "Yes (Under 2 hours)", "No (Shipped only)", "No (In-store pickup)"],
          ["Lender payout speed", "Instant (Within 24h)", "Weekly", "Monthly"],
          ["Gear selection depth", "High (User-owned)", "Medium", "Low (Stock-dependent)"]
        ]
      },
      canvas: {
        problem: "Freelance videographers and hobbyists face high costs buying specialized camera gear, while owners leave expensive equipment sitting idle.",
        solution: "Rent high-end camera equipment locally in minutes, fully insured, or list your idle gear to earn passive income.",
        metrics: "Monthly active renter transactions, average rental order value, and gear owner signup growth rate.",
        value: "A peer-to-peer camera equipment rental marketplace protected by instant, custom gear insurance coverage.",
        advantage: "Automated real-time gear insurance underwriting system integrated into checkout.",
        channels: "Photography forums and filmmaking subreddits, YouTube gear review sponsorships, and design school partnerships.",
        segments: "Indie filmmakers, travel vloggers, wedding photographers, and production studios needing scale equipment.",
        cost: "Marketplace insurance pool backing, ID and credit verification API costs, and customer support disputes management.",
        revenue: "15% platform transaction fee split on all rental orders, and optional premium protection plans."
      },
      suggestions: [
        "Establish partnership deals with local camera repair shops to offer fast diagnostics in the event of rental damage disputes.",
        "Run targeted geographic ads near film universities during seasonal final project weeks to capture student rentals.",
        "Build a robust ID-verification flow using Stripe Identity to build trust and filter out fraudulent renters.",
        "Offer a 'VIP white-glove' gear management program where the platform stores, cleans, and rents equipment for high-value lenders."
      ]
    },
    generic: {
      swot: {
        s: ["Highly localized focus offers niche service superiority", "Extremely agile product iteration cycle"],
        w: ["Unproven initial product-market fit metrics", "Limited early-stage marketing budget for customer acquisition"],
        o: ["Strategic marketing partnerships to lower CAC", "Expansion into untapped adjacent verticals"],
        t: ["Low barriers to entry for copycat competitors", "Shifting economic conditions impacting client spend"]
      },
      marketSize: "₹552.5 Cr / Year",
      channels: [
        { name: "Core Product Subscriptions (SaaS)", weight: 55 },
        { name: "Premium Add-ons & Templates", weight: 30 },
        { name: "Professional consulting services", weight: 15 }
      ],
      competitors: {
        name1: "Industry Giants",
        name2: "Traditional Consultants",
        features: [
          ["AI Validation Speed", "Instant (Under 3 mins)", "No (Takes weeks)", "No (Slow)"],
          ["Visual Lean Canvas", "Yes (Auto-generated)", "No", "No (Manual layout)"],
          ["Cost to Validate", "Ultra-low (Subscription)", "High", "Extremely High"],
          ["Adaptability of model", "High (Real-time updates)", "Medium", "Low"]
        ]
      },
      canvas: {
        problem: "Early-stage founders waste months and capital validating startup ideas through manual surveys and outdated market reports.",
        solution: "An automated intelligence engine that analyzes competitor features, estimates market size, and structures SWOT + Lean Canvas in seconds.",
        metrics: "Report generation speed, user validation success outcomes, and conversion rate from report to dashboard.",
        value: "Go from abstract startup concept to a comprehensive, data-driven validation report and roadmap in under three minutes.",
        advantage: "Multi-layered synthesis engine connecting search trends, competitor matrices, and financial frameworks.",
        channels: "Startup community newsletters, founder incubators, digital marketing hacks, and organic SEO.",
        segments: "Aspiring entrepreneurs, serial side-hustlers, early product managers, and venture incubators.",
        cost: "AI model token APIs, real-time search engine queries, and dashboard infrastructure hosting.",
        revenue: "Premium credit packages, monthly subscription access (₹999/mo), and white-labeled PDF exports."
      },
      suggestions: [
        "Provide clean PDF output customization options so users can print reports and share them directly with prospective investors.",
        "Include a direct 'Share link' option that generates public URLs of reports to increase virality.",
        "Integrate search-volume estimation markers to back up the SAM market size estimates with transparent data.",
        "Create a feedback loop letting users mark AI findings as 'accurate' or 'inaccurate' to continually refine suggestions."
      ]
    }
  };

  // Status logs for the loader animation
  const loaderStatuses = [
    { progress: 0, text: "Scanning global market index and databases..." },
    { progress: 25, text: "Compiling competitor matrices & identifying feature gaps..." },
    { progress: 50, text: "Synthesizing SWOT matrix dimensions..." },
    { progress: 75, text: "Simulating monetization models and channels..." },
    { progress: 100, text: "Finalizing AI validation metrics..." }
  ];

  // Helper to match input string to key mock categories
  const determineCategory = (input) => {
    const text = input.toLowerCase();
    if (text.includes('yoga') || text.includes('fitness') || text.includes('wellness')) return 'yoga';
    if (text.includes('eco') || text.includes('waste') || text.includes('green') || text.includes('household')) return 'eco';
    if (text.includes('calendar') || text.includes('biometric') || text.includes('productivity') || text.includes('time')) return 'calendar';
    if (text.includes('camera') || text.includes('rental') || text.includes('gear') || text.includes('share')) return 'camera';
    return 'generic';
  };

  // Perform Analysis
  const performAnalysis = () => {
    const concept = startupInput.value.trim();
    if (!concept) {
      // Focus and animate input to warn user
      startupInput.focus();
      const parent = startupInput.closest('.demo-input-box');
      parent.style.borderColor = 'var(--danger)';
      setTimeout(() => {
        parent.style.borderColor = '';
      }, 1000);
      return;
    }

    // Hide previous output, show loader
    demoOutput.classList.remove('show');
    setTimeout(() => {
      demoOutput.style.display = 'none';
      demoLoader.style.display = 'flex';
      
      let currentProgress = 0;
      progressBar.style.width = '0%';
      
      // Animate progress bar and status text
      const interval = setInterval(() => {
        currentProgress += 2;
        progressBar.style.width = `${currentProgress}%`;

        // Update status text depending on progress milestone
        const currentStatus = loaderStatuses.find(s => currentProgress >= s.progress && currentProgress < s.progress + 25);
        if (currentStatus) {
          loaderStatus.textContent = currentStatus.text;
        }

        if (currentProgress >= 100) {
          clearInterval(interval);
          setTimeout(renderResults, 300);
        }
      }, 50); // 100% in 2500ms
    }, 200);
  };

  // Render dynamic results after loading finishes
  const renderResults = () => {
    const concept = startupInput.value.trim();
    const category = determineCategory(concept);
    const data = analysisData[category];

    // SWOT Injection
    injectList(swotStrengths, data.swot.s);
    injectList(swotWeaknesses, data.swot.w);
    injectList(swotOpportunities, data.swot.o);
    injectList(swotThreats, data.swot.t);

    // Revenue Injection
    marketSizeVal.textContent = data.marketSize;
    channelListContainer.innerHTML = '';
    
    data.channels.forEach(channel => {
      const channelItem = document.createElement('div');
      channelItem.className = 'channel-item';
      channelItem.innerHTML = `
        <div class="channel-info">
          <span>${channel.name}</span>
          <span class="weight">${channel.weight}%</span>
        </div>
        <div class="channel-bar-bg">
          <div class="channel-bar" style="width: 0%"></div>
        </div>
      `;
      channelListContainer.appendChild(channelItem);
    });

    // Hide loader, show output
    demoLoader.style.display = 'none';
    demoOutput.style.display = 'block';
    
    // Trigger animations in next paint frame
    setTimeout(() => {
      demoOutput.classList.add('show');
      
      // Animate width of the revenue channels
      const bars = channelListContainer.querySelectorAll('.channel-bar');
      bars.forEach((bar, index) => {
        setTimeout(() => {
          bar.style.width = `${data.channels[index].weight}%`;
        }, 150 * index);
      });
    }, 50);
  };

  const injectList = (ulElement, array) => {
    ulElement.innerHTML = '';
    array.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      ulElement.appendChild(li);
    });
  };

  /* ------------------------------------------------------------------------
     5. APP DASHBOARD SYSTEM
     ------------------------------------------------------------------------ */
  const landingPage = document.getElementById('landingPage');
  const appDashboard = document.getElementById('appDashboard');
  
  // App navigation buttons
  const sidebarButtons = document.querySelectorAll('.sidebar-btn');
  const bottomNavButtons = document.querySelectorAll('.bottom-nav-btn');
  const allNavButtons = [...sidebarButtons, ...bottomNavButtons];
  
  // View views
  const appViews = document.querySelectorAll('.app-view');
  
  // App Home inputs & controls
  const appStartupInput = document.getElementById('appStartupInput');
  const appGenerateBtn = document.getElementById('appGenerateBtn');
  const appDemoLoader = document.getElementById('appDemoLoader');
  const appLoaderStatus = document.getElementById('appLoaderStatus');
  const appProgressBar = document.getElementById('appProgressBar');
  
  // App History elements
  const historyListContainer = document.getElementById('historyListContainer');
  const historyEmptyState = document.getElementById('historyEmptyState');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  
  // App Analytics elements
  const analyticsTitle = document.getElementById('analyticsTitle');
  const analyticsIdeaDesc = document.getElementById('analyticsIdeaDesc');
  const analyticsContent = document.getElementById('analyticsContent');
  const analyticsEmptyState = document.getElementById('analyticsEmptyState');
  const appMarketSize = document.getElementById('appMarketSize');
  const appChannelList = document.getElementById('appChannelList');
  const appSwotStrengths = document.getElementById('appSwotStrengths');
  const appSwotWeaknesses = document.getElementById('appSwotWeaknesses');
  const appSwotOpportunities = document.getElementById('appSwotOpportunities');
  const appSwotThreats = document.getElementById('appSwotThreats');
  
  // Profile elements
  const profileUsedCredits = document.getElementById('profileUsedCredits');
  const profileUsageText = document.getElementById('profileUsageText');
  const profileProgressBar = document.getElementById('profileProgressBar');
  
  // Exit & logout
  const exitAppBtn = document.getElementById('exitAppBtn');
  const logoutAppBtn = document.getElementById('logoutAppBtn');

  // Application State
  let usedCredits = 3;
  let activeAnalysisId = null;
  
  // Pre-seed some history items for premium realistic feel
  let historyData = [
    {
      id: 'idea-1',
      concept: 'A fitness App with personalized yoga plans based on user flexibility',
      category: 'yoga',
      date: '05 Jul 2026',
      score: 92
    },
    {
      id: 'idea-2',
      concept: 'An eco-friendly subscription box for zero-waste household products',
      category: 'eco',
      date: '01 Jul 2026',
      score: 87
    },
    {
      id: 'idea-3',
      concept: 'AI-powered calendar extension that auto-schedules deep work sessions',
      category: 'calendar',
      date: '28 Jun 2026',
      score: 95
    }
  ];

  // Helper to Darken a Color for Hover state
  const darkenColor = (hex, percent) => {
    let num = parseInt(hex.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 0 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 0 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1);
  };

  // Helper to show the app dashboard
  let pendingConcept = null;
  const showAppDashboard = () => {
    landingPage.classList.add('hidden');
    appDashboard.classList.remove('hidden');
    document.body.classList.add('app-active');
    
    // Check if in Guest Mode and update UI elements
    updateGuestModeUI();
    
    if (pendingConcept) {
      switchTab('home');
      appStartupInput.value = pendingConcept;
      performAppAnalysis();
      pendingConcept = null;
      startupInput.value = '';
    } else {
      switchTab('home');
    }
  };

  // Helper to exit the app dashboard
  const exitAppDashboard = () => {
    appDashboard.classList.add('hidden');
    landingPage.classList.remove('hidden');
    document.body.classList.remove('app-active');
    window.scrollTo({ top: 0 });
  };

  // Modal elements & controller functions
  const loginModal = document.getElementById('loginModal');
  const loginRequiredModal = document.getElementById('loginRequiredModal');

  const openModal = (modal) => {
    if (modal) modal.classList.remove('hidden');
  };

  const closeModal = (modal) => {
    if (modal) modal.classList.add('hidden');
  };

  // Bind close buttons
  const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
  const closeRequiredModalBtn = document.getElementById('closeRequiredModalBtn');
  const requiredCloseBtn = document.getElementById('requiredCloseBtn');

  if (closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', () => closeModal(loginModal));
  if (closeRequiredModalBtn) closeRequiredModalBtn.addEventListener('click', () => closeModal(loginRequiredModal));
  if (requiredCloseBtn) requiredCloseBtn.addEventListener('click', () => closeModal(loginRequiredModal));

  // Close modal when clicking on overlay background
  [loginModal, loginRequiredModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  // Modal Views switching helper
  const switchToView = (view) => {
    const loginView = document.getElementById('loginFormView');
    const signupView = document.getElementById('signupFormView');
    const forgotView = document.getElementById('forgotFormView');
    const onboardingView = document.getElementById('onboardingFormView');
    
    if (loginView) loginView.classList.add('hidden');
    if (signupView) signupView.classList.add('hidden');
    if (forgotView) forgotView.classList.add('hidden');
    if (onboardingView) onboardingView.classList.add('hidden');
    
    if (view === 'login' && loginView) loginView.classList.remove('hidden');
    if (view === 'signup' && signupView) signupView.classList.remove('hidden');
    if (view === 'forgot' && forgotView) forgotView.classList.remove('hidden');
    if (view === 'onboarding' && onboardingView) onboardingView.classList.remove('hidden');
  };

  // Switch links triggers
  const switchToSignUpBtn = document.getElementById('switchToSignUpBtn');
  const switchToLoginBtn = document.getElementById('switchToLoginBtn');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotToLoginBtn = document.getElementById('forgotToLoginBtn');

  if (switchToSignUpBtn) {
    switchToSignUpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchToView('signup');
    });
  }
  if (switchToLoginBtn) {
    switchToLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchToView('login');
    });
  }
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchToView('forgot');
    });
  }
  if (forgotToLoginBtn) {
    forgotToLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchToView('login');
    });
  }

  // Handle Google Sign-In click
  const handleGoogleLogin = async (emailFieldId) => {
    try {
      showLoading(true);
      const emailVal = emailFieldId ? document.getElementById(emailFieldId)?.value.trim() : "";
      const { user, isNewUser } = await signInWithGoogle(emailVal);
      showLoading(false);
      
      if (isNewUser) {
        showToast("Welcome! Please complete onboarding.", "success");
        switchToView("onboarding");
        document.getElementById('onboardingFullName').value = user.displayName || "";
        const photoUrl = user.photoURL || "";
        document.getElementById('onboardingAvatarUrl').value = photoUrl;
        document.getElementById('onboardingAvatarPreview').src = photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150";
      } else {
        showToast("Logged in successfully!", "success");
        closeModal(loginModal);
        closeModal(loginRequiredModal);
      }
    } catch (error) {
      showLoading(false);
      showToast(error.message || "Failed to sign in with Google.", "error");
    }
  };

  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const googleSignupBtn = document.getElementById('googleSignupBtn');
  if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => handleGoogleLogin('loginEmail'));
  if (googleSignupBtn) googleSignupBtn.addEventListener('click', () => handleGoogleLogin('signupEmail'));

  // Email Validation Helper
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Password validation helper
  const isStrongPassword = (password) => {
    if (password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
  };

  // Sign In submit handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        showToast("Please fill in all fields.", "error");
        return;
      }

      if (!isValidEmail(email)) {
        showToast("Invalid email format.", "error");
        return;
      }

      try {
        showLoading(true);
        await loginWithEmail(email, password);
        showLoading(false);
        showToast("Logged in successfully!", "success");
        closeModal(loginModal);
      } catch (error) {
        showLoading(false);
        let errorMsg = "Login failed.";
        if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
          errorMsg = "Incorrect email or password.";
        } else if (error.code === "auth/invalid-email") {
          errorMsg = "Invalid email format.";
        }
        showToast(errorMsg, "error");
      }
    });
  }

  // Sign Up submit handler
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('signupFullName').value.trim();
      const username = document.getElementById('signupUsername').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('signupConfirmPassword').value;

      if (!fullName || !username || !email || !password || !confirmPassword) {
        showToast("Please fill in all fields.", "error");
        return;
      }

      if (!isValidEmail(email)) {
        showToast("Invalid email format.", "error");
        return;
      }

      if (!isStrongPassword(password)) {
        showToast("Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }

      try {
        showLoading(true);
        // Register user
        await registerWithEmail(fullName, username, email, password);
        showLoading(false);
        showToast("Account created successfully!", "success");
        closeModal(loginModal);
      } catch (error) {
        showLoading(false);
        showToast(error.message || "Failed to create account.", "error");
      }
    });
  }

  // Forgot Password submit handler
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value.trim();

      if (!email) {
        showToast("Please enter your email.", "error");
        return;
      }

      if (!isValidEmail(email)) {
        showToast("Invalid email format.", "error");
        return;
      }

      try {
        showLoading(true);
        await resetPassword(email);
        showLoading(false);
        showToast("Password reset link sent to your email!", "success");
        switchToView('login');
      } catch (error) {
        showLoading(false);
        showToast(error.message || "Failed to send reset link.", "error");
      }
    });
  }

  // Onboarding submit handler
  const onboardingForm = document.getElementById('onboardingForm');
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('onboardingUsername').value.trim();
      const fullName = document.getElementById('onboardingFullName').value.trim();
      const avatarUrl = document.getElementById('onboardingAvatarUrl').value.trim();

      if (!username || !fullName) {
        showToast("Please fill in all required fields.", "error");
        return;
      }

      try {
        showLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("No authenticated user found.");
        
        await completeOnboarding(currentUser.uid, username, fullName, avatarUrl);
        showLoading(false);
        showToast("Onboarding complete!", "success");
        closeModal(loginModal);
      } catch (error) {
        showLoading(false);
        showToast(error.message || "Failed to complete onboarding.", "error");
      }
    });
  }

  // Guest login trigger
  const loginAsGuest = () => {
    localStorage.setItem("guestMode", "true");
    localStorage.removeItem("loggedIn");
    closeModal(loginModal);
    closeModal(loginRequiredModal);
    showAppDashboard();
  };

  const guestModeBtn = document.getElementById('guestModeBtn');
  const signupGuestModeBtn = document.getElementById('signupGuestModeBtn');
  if (guestModeBtn) guestModeBtn.addEventListener('click', loginAsGuest);
  if (signupGuestModeBtn) signupGuestModeBtn.addEventListener('click', loginAsGuest);

  // Show/Hide general loading overlays
  const showLoading = (isLoading) => {
    let loader = document.getElementById('authGeneralLoader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'authGeneralLoader';
      loader.className = 'modal-overlay';
      loader.style.zIndex = '10001';
      loader.style.display = 'flex';
      loader.style.alignItems = 'center';
      loader.style.justifyContent = 'center';
      loader.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: var(--bg-card); padding: 32px; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-lg);">
          <div class="spinner"></div>
          <p style="color: var(--text-dark); font-weight: 500;">Authenticating...</p>
        </div>
      `;
      document.body.appendChild(loader);
    }
    if (isLoading) {
      loader.classList.remove('hidden');
    } else {
      loader.classList.add('hidden');
    }
  };

  // Required Login Modal actions
  const requiredLoginBtn = document.getElementById('requiredLoginBtn');
  const requiredGuestBtn = document.getElementById('requiredGuestBtn');

  if (requiredLoginBtn) {
    requiredLoginBtn.addEventListener('click', () => {
      closeModal(loginRequiredModal);
      switchToView('login');
      openModal(loginModal);
    });
  }

  if (requiredGuestBtn) {
    requiredGuestBtn.addEventListener('click', () => {
      closeModal(loginRequiredModal);
      loginAsGuest();
    });
  }

  // Intercept landing page CTAs to trigger login modal
  const landingPageCTAs = [
    ...document.querySelectorAll('a[href="#demo"]'),
    ...document.querySelectorAll('a[href="#login"]'),
    document.getElementById('logo')
  ];

  landingPageCTAs.forEach(cta => {
    if (!cta) return;
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      if (cta.id === 'logo') {
        exitAppDashboard();
      } else {
        const isGuest = localStorage.getItem("guestMode") === "true";
        const isLoggedIn = localStorage.getItem("loggedIn") === "true";
        if (isGuest || isLoggedIn) {
          showAppDashboard();
        } else {
          openModal(loginModal);
        }
      }
    });
  });

  // Redirect landing page input form to launch app via login popup
  if (analyzeBtn && startupInput) {
    analyzeBtn.replaceWith(analyzeBtn.cloneNode(true));
    const newAnalyzeBtn = document.getElementById('analyzeBtn');
    
    const triggerLandingPageAnalysis = () => {
      const concept = startupInput.value.trim();
      if (concept) {
        pendingConcept = concept;
        const isGuest = localStorage.getItem("guestMode") === "true";
        const isLoggedIn = localStorage.getItem("loggedIn") === "true";
        if (isGuest || isLoggedIn) {
          showAppDashboard();
        } else {
          openModal(loginModal);
        }
      } else {
        startupInput.focus();
        const parent = startupInput.closest('.demo-input-box');
        parent.style.borderColor = 'var(--danger)';
        setTimeout(() => { parent.style.borderColor = ''; }, 1000);
      }
    };

    newAnalyzeBtn.addEventListener('click', triggerLandingPageAnalysis);
    startupInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        triggerLandingPageAnalysis();
      }
    });
  }

  // Redirect landing page presets via login popup
  presetChips.forEach(chip => {
    chip.replaceWith(chip.cloneNode(true));
  });
  
  const newPresetChips = document.querySelectorAll('.preset-chip');
  newPresetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const concept = chip.getAttribute('data-idea');
      pendingConcept = concept;
      const isGuest = localStorage.getItem("guestMode") === "true";
      const isLoggedIn = localStorage.getItem("loggedIn") === "true";
      if (isGuest || isLoggedIn) {
        showAppDashboard();
      } else {
        openModal(loginModal);
      }
    });
  });

  // Guest Mode UI Update helper
  const updateGuestModeUI = () => {
    const isGuest = localStorage.getItem("guestMode") === "true";
    
    const headerGuestControls = document.getElementById('headerGuestControls');
    const headerUserControls = document.getElementById('headerUserControls');
    const guestModeBanner = document.getElementById('guestModeBanner');
    
    const settingsGuestBadge = document.getElementById('settingsGuestBadge');
    const settingsGuestBanner = document.getElementById('settingsGuestBanner');
    const settingsProfileCard = document.getElementById('settingsProfileCard');
    
    const sidebarHistoryBtn = document.getElementById('sidebarHistoryBtn');
    const sidebarSavedReportsBtn = document.getElementById('sidebarSavedReportsBtn');
    const bottomNavHistoryBtn = document.getElementById('bottomNavHistoryBtn');
    
    const settingsItemProfile = document.getElementById('settingsItemProfile');
    const settingsItemSecurity = document.getElementById('settingsItemSecurity');
    const settingsItemNotifications = document.getElementById('settingsItemNotifications');
    
    const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
    
    if (isGuest) {
      if (headerGuestControls) headerGuestControls.classList.remove('hidden');
      if (headerUserControls) headerUserControls.classList.add('hidden');
      
      if (guestModeBanner) guestModeBanner.classList.remove('hidden');
      if (settingsGuestBadge) settingsGuestBadge.classList.remove('hidden');
      if (settingsGuestBanner) settingsGuestBanner.classList.remove('hidden');
      if (settingsProfileCard) settingsProfileCard.classList.add('hidden');
      
      if (sidebarLoginBtn) sidebarLoginBtn.classList.remove('hidden');
      
      [sidebarHistoryBtn, sidebarSavedReportsBtn, bottomNavHistoryBtn].forEach(btn => {
        if (btn) {
          btn.classList.add('disabled-link');
          const normalIcon = btn.querySelector('.normal-icon');
          const lockIcon = btn.querySelector('.lock-icon');
          if (normalIcon) normalIcon.classList.add('hidden');
          if (lockIcon) lockIcon.classList.remove('hidden');
        }
      });
      
      [settingsItemProfile, settingsItemSecurity, settingsItemNotifications].forEach(item => {
        if (item) {
          item.classList.add('disabled-item');
          const lockIcon = item.querySelector('.lock-icon');
          if (lockIcon) lockIcon.classList.remove('hidden');
        }
      });
    } else {
      if (headerGuestControls) headerGuestControls.classList.add('hidden');
      if (headerUserControls) headerUserControls.classList.remove('hidden');
      
      if (guestModeBanner) guestModeBanner.classList.add('hidden');
      if (settingsGuestBadge) settingsGuestBadge.classList.add('hidden');
      if (settingsGuestBanner) settingsGuestBanner.classList.add('hidden');
      if (settingsProfileCard) settingsProfileCard.classList.remove('hidden');
      
      if (sidebarLoginBtn) sidebarLoginBtn.classList.add('hidden');
      
      [sidebarHistoryBtn, sidebarSavedReportsBtn, bottomNavHistoryBtn].forEach(btn => {
        if (btn) {
          btn.classList.remove('disabled-link');
          const normalIcon = btn.querySelector('.normal-icon');
          const lockIcon = btn.querySelector('.lock-icon');
          if (normalIcon) normalIcon.classList.remove('hidden');
          if (lockIcon) lockIcon.classList.add('hidden');
        }
      });
      
      [settingsItemProfile, settingsItemSecurity, settingsItemNotifications].forEach(item => {
        if (item) {
          item.classList.remove('disabled-item');
          const lockIcon = item.querySelector('.lock-icon');
          if (lockIcon) lockIcon.classList.add('hidden');
        }
      });
    }
  };

  // Bind headers & banner guest login actions
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  const guestBannerLoginBtn = document.getElementById('guestBannerLoginBtn');
  const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
  
  [headerLoginBtn, guestBannerLoginBtn, sidebarLoginBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
      });
    }
  });

  // Switch tabs view function
  const switchTab = (tabName) => {
    allNavButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    appViews.forEach(view => {
      if (view.id === `view-${tabName}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    if (tabName === 'history') {
      renderHistoryList();
    } else if (tabName === 'analytics') {
      renderAnalyticsView();
    } else if (tabName === 'profile') {
      renderProfileView();
    } else if (tabName === 'saved-reports') {
      renderSavedReportsList();
    }
  };

  // Nav buttons click listeners with Guest restrictions
  allNavButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = btn.getAttribute('data-tab');
      const isGuest = localStorage.getItem("guestMode") === "true";
      
      if (isGuest && (tab === 'history' || tab === 'saved-reports')) {
        e.preventDefault();
        openModal(loginRequiredModal);
        return;
      }
      
      switchTab(tab);
    });
  });

  // Restrict settings items clicks in Guest Mode
  const restrictedSettings = [
    document.getElementById('settingsItemProfile'),
    document.getElementById('settingsItemSecurity'),
    document.getElementById('settingsItemNotifications')
  ];

  restrictedSettings.forEach(item => {
    if (item) {
      item.addEventListener('click', (e) => {
        const isGuest = localStorage.getItem("guestMode") === "true";
        if (isGuest) {
          e.preventDefault();
          e.stopPropagation();
          openModal(loginRequiredModal);
        }
      });
    }
  });

  // Empty state CTA buttons listeners
  document.querySelectorAll('[data-go-home]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab('home');
    });
  });

  // Exit app dashboard buttons listeners
  if (exitAppBtn) {
    exitAppBtn.addEventListener('click', async () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("guestMode");
      try {
        await logoutUser();
      } catch (err) {
        console.error(err);
      }
      exitAppDashboard();
    });
  }
  if (logoutAppBtn) {
    logoutAppBtn.addEventListener('click', async () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("guestMode");
      try {
        await logoutUser();
      } catch (err) {
        console.error(err);
      }
      exitAppDashboard();
    });
  }
  
  // App avatar button listener -> switches to Settings
  const appAvatarBtn = document.getElementById('appAvatarBtn');
  if (appAvatarBtn) {
    appAvatarBtn.addEventListener('click', () => {
      switchTab('profile');
    });
  }

  // History List rendering
  const renderHistoryList = () => {
    historyListContainer.innerHTML = '';
    if (historyData.length === 0) {
      historyEmptyState.classList.remove('hidden');
      clearHistoryBtn.classList.add('hidden');
    } else {
      historyEmptyState.classList.add('hidden');
      clearHistoryBtn.classList.remove('hidden');

      historyData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
          <div class="history-card-left">
            <div class="history-card-title">${item.concept.split(' ').slice(0, 3).join(' ')}...</div>
            <div class="history-card-concept">${item.concept}</div>
            <div class="history-card-date">${item.date}</div>
          </div>
          <div class="history-card-right">
            <div class="history-card-score">${item.score}% Fit</div>
            <button class="history-delete-btn" data-id="${item.id}" aria-label="Delete analysis">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;

        // Card select handler
        card.addEventListener('click', (e) => {
          if (e.target.closest('.history-delete-btn')) return;
          activeAnalysisId = item.id;
          switchTab('analytics');
        });

        // Delete handler
        const delBtn = card.querySelector('.history-delete-btn');
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          historyData = historyData.filter(h => h.id !== item.id);
          localStorage.setItem('historyData', JSON.stringify(historyData));
          if (activeAnalysisId === item.id) activeAnalysisId = null;
          renderHistoryList();
        });

        historyListContainer.appendChild(card);
      });
    }
  };

  // Clear all history
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      historyData = [];
      localStorage.setItem('historyData', JSON.stringify(historyData));
      activeAnalysisId = null;
      renderHistoryList();
    });
  }

  // Analytics view rendering
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const favoriteReportBtn = document.getElementById('favoriteReportBtn');
  const shareReportBtn = document.getElementById('shareReportBtn');

  const renderAnalyticsView = () => {
    if (!activeAnalysisId) {
      analyticsEmptyState.classList.remove('hidden');
      analyticsContent.classList.add('hidden');
      analyticsIdeaDesc.textContent = 'Please generate or select an analysis from History first.';
      if (downloadPdfBtn) downloadPdfBtn.classList.add('hidden');
      if (favoriteReportBtn) favoriteReportBtn.classList.add('hidden');
      if (shareReportBtn) shareReportBtn.classList.add('hidden');
      return;
    }

    const item = historyData.find(h => h.id === activeAnalysisId);
    if (!item) {
      activeAnalysisId = null;
      renderAnalyticsView();
      return;
    }

    analyticsEmptyState.classList.add('hidden');
    analyticsContent.classList.remove('hidden');
    if (downloadPdfBtn) downloadPdfBtn.classList.remove('hidden');
    if (shareReportBtn) shareReportBtn.classList.remove('hidden');
    
    analyticsTitle.textContent = (item.apiData && item.apiData.startup_name && item.apiData.startup_name.length > 0)
      ? `${item.apiData.startup_name[0]} - AI Report`
      : `${item.concept.split(' ').slice(0, 3).join(' ')} - AI Report`;
      
    analyticsIdeaDesc.textContent = (item.apiData && item.apiData.tagline)
      ? `"${item.apiData.tagline}"`
      : `"${item.concept}"`;

    const data = item.apiData || analysisData[item.category] || analysisData['generic'];

    // Market Size SAM
    appMarketSize.textContent = data.market_size || data.marketSize;

    // Monetization Channels list rendering
    appChannelList.innerHTML = '';
    data.channels.forEach(channel => {
      const channelItem = document.createElement('div');
      channelItem.className = 'channel-item';
      channelItem.innerHTML = `
        <div class="channel-info">
          <span>${channel.name}</span>
          <span class="weight">${channel.weight}%</span>
        </div>
        <div class="channel-bar-bg">
          <div class="channel-bar" style="width: 0%"></div>
        </div>
      `;
      appChannelList.appendChild(channelItem);
      
      // Animate width after mounting
      setTimeout(() => {
        const bar = channelItem.querySelector('.channel-bar');
        if (bar) bar.style.width = `${channel.weight}%`;
      }, 50);
    });

    // SWOT Injection
    injectList(appSwotStrengths, data.swot.s);
    injectList(appSwotWeaknesses, data.swot.w);
    injectList(appSwotOpportunities, data.swot.o);
    injectList(appSwotThreats, data.swot.t);

    // Competitor Analysis Injection
    const compName1 = document.getElementById('competitorName1');
    const compName2 = document.getElementById('competitorName2');
    const compBody = document.getElementById('competitorTableBody');
    if (compName1 && compName2 && compBody) {
      compName1.textContent = data.competitors.name1;
      compName2.textContent = data.competitors.name2;
      compBody.innerHTML = '';
      data.competitors.features.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach((cell, idx) => {
          const td = document.createElement(idx === 0 ? 'th' : 'td');
          td.textContent = cell;
          tr.appendChild(td);
        });
        compBody.appendChild(tr);
      });
    }

    // Lean Canvas Injection
    const cProblem = document.getElementById('canvasProblem');
    const cSolution = document.getElementById('canvasSolution');
    const cMetrics = document.getElementById('canvasMetrics');
    const cValue = document.getElementById('canvasValue');
    const cAdvantage = document.getElementById('canvasAdvantage');
    const cChannels = document.getElementById('canvasChannels');
    const cSegments = document.getElementById('canvasSegments');
    const cCost = document.getElementById('canvasCost');
    const cRevenue = document.getElementById('canvasRevenue');

    if (cProblem && cSolution && cMetrics && cValue && cAdvantage && cChannels && cSegments && cCost && cRevenue) {
      cProblem.textContent = data.canvas.problem;
      cSolution.textContent = data.canvas.solution;
      cMetrics.textContent = data.canvas.metrics;
      cValue.textContent = data.canvas.value;
      cAdvantage.textContent = data.canvas.advantage;
      cChannels.textContent = data.canvas.channels;
      cSegments.textContent = data.canvas.segments;
      cCost.textContent = data.canvas.cost;
      cRevenue.textContent = data.canvas.revenue;
    }

    // Suggestions Injection
    const suggList = document.getElementById('suggestionsList');
    if (suggList) {
      suggList.innerHTML = '';
      data.suggestions.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        suggList.appendChild(li);
      });
    }

    // Favorite Button UI update
    updateFavoriteBtnUI();
  };

  // Print PDF action click trigger
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Profile view rendering
  const renderProfileView = () => {
    profileUsedCredits.textContent = usedCredits;
    const pct = (usedCredits / 10) * 100;
    profileUsageText.textContent = `${pct}%`;
    profileProgressBar.style.width = `${pct}%`;
  };

  // Perform Analysis logic within App
  const performAppAnalysis = async () => {
    const concept = appStartupInput.value.trim();
    if (!concept) {
      appStartupInput.focus();
      const parent = appStartupInput.closest('.input-card');
      if (parent) {
        parent.classList.add('validation-error');
        setTimeout(() => { parent.classList.remove('validation-error'); }, 1000);
      }
      return;
    }

    // Hide generate btn and show loader
    appGenerateBtn.classList.add('hidden');
    appDemoLoader.classList.remove('hidden');
    
    let currentProgress = 0;
    appProgressBar.style.width = '0%';
    appLoaderStatus.textContent = 'Initializing AI Startup Agent...';

    // Incremental progress visual timer
    const interval = setInterval(() => {
      if (currentProgress < 90) {
        currentProgress += 3;
        appProgressBar.style.width = `${currentProgress}%`;
        
        // Show realistic agent processing messages
        if (currentProgress >= 25 && currentProgress < 50) {
          appLoaderStatus.textContent = 'Analyzing market size and target audience pain points...';
        } else if (currentProgress >= 50 && currentProgress < 75) {
          appLoaderStatus.textContent = 'Mapping competitor features and SWOT quadrants...';
        } else if (currentProgress >= 75) {
          appLoaderStatus.textContent = 'Drafting Lean Canvas models and monetization suggestions...';
        }
      }
    }, 150);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${apiBaseUrl}/generate-startup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startupIdea: concept })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }

      const responseData = await response.json();
      
      clearInterval(interval);
      appProgressBar.style.width = '100%';
      appLoaderStatus.textContent = 'Startup plan generated by Gemini AI!';

      setTimeout(() => {
        const category = responseData.startup_category || determineCategory(concept);
        
        // Add new dynamic analysis to history
        const newRecord = {
          id: 'idea-' + Date.now(),
          concept: concept,
          category: category,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          score: Math.floor(Math.random() * 15) + 80, // 80 - 95%
          apiData: responseData
        };
        
        historyData.unshift(newRecord);
        localStorage.setItem('historyData', JSON.stringify(historyData));
        activeAnalysisId = newRecord.id;
        
        // Increment credit usage
        usedCredits = Math.min(10, usedCredits + 1);
        localStorage.setItem('usedCredits', usedCredits);
        renderProfileView();

        // Reset loader & buttons
        appStartupInput.value = '';
        appDemoLoader.classList.add('hidden');
        appGenerateBtn.classList.remove('hidden');

        // Switch to analytics view
        switchTab('analytics');
        showToast('Analysis completed successfully!', 'success');
      }, 500);

    } catch (error) {
      clearInterval(interval);
      appDemoLoader.classList.add('hidden');
      appGenerateBtn.classList.remove('hidden');
      console.error('Error validating startup:', error);
      showToast(error.message || 'Failed to connect to AI engine. Please retry.', 'error');
    }
  };

  // Bind Generate Analysis Action inside App
  if (appGenerateBtn) {
    appGenerateBtn.addEventListener('click', performAppAnalysis);
  }
  if (appStartupInput) {
    appStartupInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        performAppAnalysis();
      }
    });
  }

  // ==========================================================================
  // APP SETTINGS CUSTOMIZATIONS & LOADERS
  // ==========================================================================

  // Theme toggler checkbox control
  const themeToggleCheckbox = document.getElementById('themeToggleCheckbox');
  if (themeToggleCheckbox) {
    themeToggleCheckbox.addEventListener('change', () => {
      if (themeToggleCheckbox.checked) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Accent Color Picker logic
  const colorChips = document.querySelectorAll('.color-chip');
  colorChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const color = chip.getAttribute('data-color');
      
      colorChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      document.documentElement.style.setProperty('--primary', color);
      document.documentElement.style.setProperty('--primary-hover', darkenColor(color, 20));
      
      localStorage.setItem('accentColor', color);
    });
  });

  // Font Size selector logic
  const fontSizeSelector = document.getElementById('fontSizeSelector');
  if (fontSizeSelector) {
    fontSizeSelector.addEventListener('change', () => {
      const size = fontSizeSelector.value;
      
      document.body.classList.remove('fs-small', 'fs-medium', 'fs-large');
      document.body.classList.add('fs-' + size);
      
      localStorage.setItem('fontSize', size);
    });
  }

  // --------------------------------------------------------------------------
  // TOAST NOTIFICATIONS & PREFERENCES MODALS
  // --------------------------------------------------------------------------

  // Toast notifier function
  const showToast = (message, type = 'info') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }
    
    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  };

  // Modals Selectors
  const editProfileModal = document.getElementById('editProfileModal');
  const editEmailModal = document.getElementById('editEmailModal');
  const securityModal = document.getElementById('securityModal');
  const notificationsModal = document.getElementById('notificationsModal');

  // Trigger buttons
  const profileEditBtn = document.getElementById('profileEditBtn');
  const settingsEditEmailBtn = document.getElementById('settingsEditEmailBtn');
  const settingsEditSecurityBtn = document.getElementById('settingsEditSecurityBtn');
  const settingsEditNotificationsBtn = document.getElementById('settingsEditNotificationsBtn');

  // Modal Close buttons
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  const closeEmailModalBtn = document.getElementById('closeEmailModalBtn');
  const closeSecurityModalBtn = document.getElementById('closeSecurityModalBtn');
  const closeNotificationsModalBtn = document.getElementById('closeNotificationsModalBtn');

  // Wire Modal Triggers
  if (profileEditBtn) {
    profileEditBtn.addEventListener('click', () => {
      document.getElementById('profileNameInput').value = document.getElementById('profileNameDisplay').textContent;
      document.getElementById('profileRoleInput').value = document.getElementById('profileRoleDisplay').textContent;
      const currentAvatar = document.getElementById('profileAvatarImg').src;
      document.getElementById('profileAvatarUrlInput').value = currentAvatar;
      document.getElementById('profileAvatarPreview').src = currentAvatar;
      openModal(editProfileModal);
    });
  }
  if (closeProfileModalBtn) closeProfileModalBtn.addEventListener('click', () => closeModal(editProfileModal));

  if (settingsEditEmailBtn) {
    settingsEditEmailBtn.addEventListener('click', () => {
      if (localStorage.getItem("guestMode") === "true") {
        openModal(loginRequiredModal);
        return;
      }
      document.getElementById('newEmailInput').value = document.getElementById('profileEmailDisplay').textContent;
      openModal(editEmailModal);
    });
  }
  if (closeEmailModalBtn) closeEmailModalBtn.addEventListener('click', () => closeModal(editEmailModal));

  if (settingsEditSecurityBtn) {
    settingsEditSecurityBtn.addEventListener('click', () => {
      if (localStorage.getItem("guestMode") === "true") {
        openModal(loginRequiredModal);
        return;
      }
      document.getElementById('currentPasswordInput').value = '';
      document.getElementById('newPasswordInput').value = '';
      document.getElementById('confirmPasswordInput').value = '';
      openModal(securityModal);
    });
  }
  if (closeSecurityModalBtn) closeSecurityModalBtn.addEventListener('click', () => closeModal(securityModal));

  if (settingsEditNotificationsBtn) {
    settingsEditNotificationsBtn.addEventListener('click', () => {
      if (localStorage.getItem("guestMode") === "true") {
        openModal(loginRequiredModal);
        return;
      }
      openModal(notificationsModal);
    });
  }
  if (closeNotificationsModalBtn) closeNotificationsModalBtn.addEventListener('click', () => closeModal(notificationsModal));

  // Live Avatar Image Previews
  const profileAvatarUrlInput = document.getElementById('profileAvatarUrlInput');
  if (profileAvatarUrlInput) {
    profileAvatarUrlInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      document.getElementById('profileAvatarPreview').src = url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150";
    });
  }

  const onboardingAvatarUrl = document.getElementById('onboardingAvatarUrl');
  if (onboardingAvatarUrl) {
    onboardingAvatarUrl.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      document.getElementById('onboardingAvatarPreview').src = url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150";
    });
  }

  // Close overlays on clicking backgrounds
  [editProfileModal, editEmailModal, securityModal, notificationsModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  // Modal form submissions listeners
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('profileNameInput').value.trim();
      const role = document.getElementById('profileRoleInput').value.trim();
      const avatarUrl = document.getElementById('profileAvatarUrlInput').value.trim();
      
      if (name && role) {
        document.getElementById('profileNameDisplay').textContent = name;
        document.getElementById('profileRoleDisplay').textContent = role;
        
        localStorage.setItem('profileName', name);
        localStorage.setItem('profileRole', role);
        
        if (avatarUrl) {
          document.getElementById('profileAvatarImg').src = avatarUrl;
          localStorage.setItem('profileAvatar', avatarUrl);
          const appAvatar = document.querySelector('.app-avatar');
          if (appAvatar) appAvatar.src = avatarUrl;
        }

        const isGuest = localStorage.getItem("guestMode") === "true";
        if (!isGuest && auth.currentUser) {
          try {
            showLoading(true);
            const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
              fullName: name,
              profilePhoto: avatarUrl || ""
            });
            showLoading(false);
          } catch (err) {
            showLoading(false);
            console.error("Failed to update Firestore profile: ", err);
          }
        }
        
        closeModal(editProfileModal);
        showToast('Profile details updated!', 'success');
      }
    });
  }

  const emailForm = document.getElementById('emailForm');
  if (emailForm) {
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newEmail = document.getElementById('newEmailInput').value.trim();
      if (newEmail) {
        document.getElementById('profileEmailDisplay').textContent = newEmail;
        localStorage.setItem('profileEmail', newEmail);
        closeModal(editEmailModal);
        showToast('Email address changed.', 'success');
      }
    });
  }

  const securityForm = document.getElementById('securityForm');
  if (securityForm) {
    securityForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentPwd = document.getElementById('currentPasswordInput').value;
      const newPwd = document.getElementById('newPasswordInput').value;
      const confirmPwd = document.getElementById('confirmPasswordInput').value;
      
      if (newPwd !== confirmPwd) {
        showToast('New passwords do not match!', 'info');
        return;
      }
      
      closeModal(securityModal);
      showToast('Password updated successfully.', 'success');
    });
  }

  const notificationsForm = document.getElementById('notificationsForm');
  if (notificationsForm) {
    notificationsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const weekly = document.getElementById('weeklyDigestCheckbox').checked;
      const credits = document.getElementById('creditAlertsCheckbox').checked;
      const security = document.getElementById('securityLogsCheckbox').checked;
      
      localStorage.setItem('weeklyDigestPref', weekly);
      localStorage.setItem('creditAlertsPref', credits);
      localStorage.setItem('securityLogsPref', security);
      
      closeModal(notificationsModal);
      showToast('Alert preferences saved.', 'success');
    });
  }

  // --------------------------------------------------------------------------
  // SAVED REPORTS & FAVORITING MECHANICS
  // --------------------------------------------------------------------------
  let savedReports = JSON.parse(localStorage.getItem('savedReports') || '[]');

  // Check if report is favorited
  const updateFavoriteBtnUI = () => {
    if (!activeAnalysisId || !favoriteReportBtn) return;
    const isSaved = savedReports.some(r => r.id === activeAnalysisId);
    favoriteReportBtn.classList.remove('hidden');
    if (isSaved) {
      favoriteReportBtn.classList.add('favorited');
      document.getElementById('favoriteBtnText').textContent = 'Favorited';
    } else {
      favoriteReportBtn.classList.remove('favorited');
      document.getElementById('favoriteBtnText').textContent = 'Save to Favorites';
    }
  };

  // Toggle favorite trigger
  const toggleFavoriteReport = () => {
    if (!activeAnalysisId) return;
    const index = savedReports.findIndex(r => r.id === activeAnalysisId);
    const report = historyData.find(h => h.id === activeAnalysisId);
    if (!report) return;

    if (index > -1) {
      savedReports.splice(index, 1);
      showToast('Removed from saved library.', 'info');
    } else {
      savedReports.push(report);
      showToast('Added to saved library.', 'success');
    }
    localStorage.setItem('savedReports', JSON.stringify(savedReports));
    updateFavoriteBtnUI();

    // Re-render saved list if active
    const activeTabBtn = document.querySelector('.sidebar-btn.active, .bottom-nav-btn.active');
    if (activeTabBtn && activeTabBtn.getAttribute('data-tab') === 'saved-reports') {
      renderSavedReportsList();
    }
  };

  if (favoriteReportBtn) {
    favoriteReportBtn.addEventListener('click', () => {
      const isGuest = localStorage.getItem("guestMode") === "true";
      if (isGuest) {
        openModal(loginRequiredModal);
        return;
      }
      toggleFavoriteReport();
    });
  }

  // Copy shareable link
  if (shareReportBtn) {
    shareReportBtn.addEventListener('click', () => {
      const isGuest = localStorage.getItem("guestMode") === "true";
      if (isGuest) {
        openModal(loginRequiredModal);
        return;
      }
      
      const mockUrl = `${window.location.origin}${window.location.pathname}?report=${activeAnalysisId}`;
      navigator.clipboard.writeText(mockUrl).then(() => {
        showToast('Report link copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Unable to copy link', 'info');
      });
    });
  }

  // Render Saved Reports List
  const savedReportsListContainer = document.getElementById('savedReportsListContainer');
  const savedReportsEmptyState = document.getElementById('savedReportsEmptyState');

  const renderSavedReportsList = () => {
    if (!savedReportsListContainer || !savedReportsEmptyState) return;
    savedReportsListContainer.innerHTML = '';
    
    if (savedReports.length === 0) {
      savedReportsEmptyState.classList.remove('hidden');
      savedReportsListContainer.classList.add('hidden');
    } else {
      savedReportsEmptyState.classList.add('hidden');
      savedReportsListContainer.classList.remove('hidden');

      savedReports.forEach(item => {
        const card = document.createElement('div');
        card.className = 'saved-report-card';
        card.innerHTML = `
          <div class="saved-report-info">
            <div class="saved-report-title">${item.concept.split(' ').slice(0, 3).join(' ')}...</div>
            <div class="saved-report-concept">${item.concept}</div>
            <div class="saved-report-date">${item.date}</div>
          </div>
          <div class="saved-report-actions">
            <div class="saved-report-score">${item.score}% Fit</div>
            <button class="saved-report-unsave-btn" data-id="${item.id}" aria-label="Unsave report">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" stroke-width="0">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          </div>
        `;

        card.addEventListener('click', (e) => {
          if (e.target.closest('.saved-report-unsave-btn')) return;
          activeAnalysisId = item.id;
          switchTab('analytics');
        });

        const unsaveBtn = card.querySelector('.saved-report-unsave-btn');
        unsaveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          savedReports = savedReports.filter(r => r.id !== item.id);
          localStorage.setItem('savedReports', JSON.stringify(savedReports));
          renderSavedReportsList();
          showToast('Removed from saved library.', 'info');
          if (activeAnalysisId === item.id) {
            updateFavoriteBtnUI();
          }
        });

        savedReportsListContainer.appendChild(card);
      });
    }
  };

  // --------------------------------------------------------------------------
  // APP STATE INITIALIZATION
  // --------------------------------------------------------------------------
  const initAppState = () => {
    // Restore history and credits
    const savedHistory = localStorage.getItem('historyData');
    if (savedHistory) {
      historyData = JSON.parse(savedHistory);
    }
    const savedCredits = localStorage.getItem('usedCredits');
    if (savedCredits) {
      usedCredits = parseInt(savedCredits, 10);
    }

    // 1. Restore Customizations
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      if (themeToggleCheckbox) themeToggleCheckbox.checked = true;
    }

    const savedAccentColor = localStorage.getItem('accentColor');
    if (savedAccentColor) {
      document.documentElement.style.setProperty('--primary', savedAccentColor);
      document.documentElement.style.setProperty('--primary-hover', darkenColor(savedAccentColor, 20));
      
      colorChips.forEach(chip => {
        if (chip.getAttribute('data-color') === savedAccentColor) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
    }

    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    document.body.classList.remove('fs-small', 'fs-medium', 'fs-large');
    document.body.classList.add('fs-' + savedFontSize);
    if (fontSizeSelector) fontSizeSelector.value = savedFontSize;

    // Restore profile settings
    const savedName = localStorage.getItem('profileName') || 'Jane Doe';
    const savedRole = localStorage.getItem('profileRole') || 'Founder, StartupSense AI';
    const savedEmail = localStorage.getItem('profileEmail') || 'founder@startupsense.ai';
    const savedAvatar = localStorage.getItem('profileAvatar');
    
    const dName = document.getElementById('profileNameDisplay');
    const dRole = document.getElementById('profileRoleDisplay');
    const dEmail = document.getElementById('profileEmailDisplay');
    const dAvatar = document.getElementById('profileAvatarImg');
    
    if (dName) dName.textContent = savedName;
    if (dRole) dRole.textContent = savedRole;
    if (dEmail) dEmail.textContent = savedEmail;
    
    if (savedAvatar && dAvatar) {
      dAvatar.src = savedAvatar;
      const appAvatar = document.querySelector('.app-avatar');
      if (appAvatar) appAvatar.src = savedAvatar;
    }

    // Restore notification checkboxes
    const weeklyDigestCheckbox = document.getElementById('weeklyDigestCheckbox');
    const creditAlertsCheckbox = document.getElementById('creditAlertsCheckbox');
    const securityLogsCheckbox = document.getElementById('securityLogsCheckbox');
    
    if (weeklyDigestCheckbox) weeklyDigestCheckbox.checked = localStorage.getItem('weeklyDigestPref') !== 'false';
    if (creditAlertsCheckbox) creditAlertsCheckbox.checked = localStorage.getItem('creditAlertsPref') !== 'false';
    if (securityLogsCheckbox) securityLogsCheckbox.checked = localStorage.getItem('securityLogsPref') !== 'false';

    // 2. Restore Session
    // The home (landing) page should always open first when visiting the site, unless a valid Firebase session exists
    exitAppDashboard();
  };

  // User Profile UI Update helper
  const updateUserProfileUI = (profile) => {
    const nameDisplay = document.getElementById('profileNameDisplay');
    const roleDisplay = document.getElementById('profileRoleDisplay');
    const emailDisplay = document.getElementById('profileEmailDisplay');
    const avatarImg = document.getElementById('profileAvatarImg');
    const headerAvatarImg = document.getElementById('appAvatarBtn')?.querySelector('img');
    
    if (nameDisplay) nameDisplay.textContent = profile.fullName || "Founder";
    if (roleDisplay) roleDisplay.textContent = `@${profile.username}` || "Founder, StartupSense AI";
    if (emailDisplay) emailDisplay.textContent = profile.email || "";
    
    const photoUrl = profile.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150";
    if (avatarImg) avatarImg.src = photoUrl;
    if (headerAvatarImg) headerAvatarImg.src = photoUrl;
  };

  // Listen to Firebase Auth state
  onAuthChange(async (firebaseUser, userProfile) => {
    if (firebaseUser) {
      // User is logged in to Firebase
      localStorage.setItem("loggedIn", "true");
      localStorage.removeItem("guestMode");

      if (userProfile && !userProfile.onboardingCompleted) {
        // Redirect to profile completion onboarding view
        switchToView("onboarding");
        openModal(loginModal);
        
        const nameField = document.getElementById('onboardingFullName');
        const avatarField = document.getElementById('onboardingAvatarUrl');
        if (nameField) nameField.value = userProfile.fullName || firebaseUser.displayName || "";
        if (avatarField) {
          const photoUrl = userProfile.profilePhoto || firebaseUser.photoURL || "";
          avatarField.value = photoUrl;
          document.getElementById('onboardingAvatarPreview').src = photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150";
        }
      } else {
        // Fully validated user
        closeModal(loginModal);
        closeModal(loginRequiredModal);
        
        if (userProfile) {
          updateUserProfileUI(userProfile);
        }
        showAppDashboard();
      }
    } else {
      // Not logged in to Firebase
      localStorage.removeItem("loggedIn");
      
      if (localStorage.getItem("guestMode") === "true") {
        showAppDashboard();
      } else {
        exitAppDashboard();
      }
    }
  });

  // Run Startup App State Configuration
  initAppState();

});

