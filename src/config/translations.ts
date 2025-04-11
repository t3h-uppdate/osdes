const currentYear = new Date().getFullYear(); // Keep this for dynamic year

export const translations = {
  // English section from the existing src/config/translations.ts
  en: {
    // Added UI section for missing strings
    ui: {
      everythingYouNeed: "Everything you need to succeed",
      features: [ // Copied from original src/translations.ts
        { title: "Digital Strategy", description: "Build a roadmap for your digital success with our comprehensive strategy services." },
        { title: "24/7 Support", description: "Round-the-clock support to ensure your business never misses a beat." },
        { title: "Global Reach", description: "Connect with customers worldwide..." } // Example, might need adjustment
      ],
      contactDescription: "Get in touch with our team to learn more about how we can help you succeed.",
      // Add other static UI strings if needed (e.g., quickLinks, contactInfo, phone, address)
      quickLinks: "Quick Links",
      contactInfo: "Contact Info",
      // phone removed (moved to site_settings)
      // address removed (moved to site_settings)
      // mail removed (moved to site_settings)
      links: "Links",
      home: "Home", // Keep for UI elements if needed, distinct from site_title
      getStarted: "Get Started", // Keep for UI elements if needed, distinct from hero button text
      projects: "Projects", // Added Projects key
      blog: "Blog", // Added Blog key
      // Labels for dynamic page timestamps
      page_created_at_label: "Created:",
      page_updated_at_label: "Last Updated:",
    },
    blog: {
      title: "Blog", // Keep title if used as section header
      // description removed (moved to site_settings)
    },
    // generalInfo removed (moved to site_settings)
    // hero removed (moved to site_settings)
    about: {
      title: "About Us", // Keep title if used as section header
      // description removed (moved to site_settings)
    },
    projects: {
      title: "Featured Projects",
      project1: {
        title: "OS Design v1",
        description: "The website offers a sleek, intuitive design with straightforward navigation and professional fonts. It highlights the company's services and expertise, making it easy for visitors to get in touch. Simple visuals and effective calls-to-action ensure a smooth and engaging experience. For more information, explore the site.",
        tags: ["Modern", "User-friendly", "Professional"],
        link: ""
      },
      project2: {
        title: "Project 2",
        description: "Coming soon.",
        tags: ["Wait", "For", "It"],
        link: ""
      },
      project3: {
        title: "New Project",
        description: "This is a new project description.",
        tags: ["New", "Exciting", "Innovative"],
        link: ""
      }
    },
    contact: {
      title: "Contact Me",
      nameLabel: "Name",
      namePlaceholder: "Enter your name",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      messageLabel: "Message",
      messagePlaceholder: "Enter your message",
      submitButton: "Send Message",
    },
    footer: {
       // copyright removed (moved to site_settings)
       // Keep footer object if other footer-specific translations might be added later
    },
    services: {
      title: "Services",
      list: [
        { title: "Digital Strategy", description: "Build a roadmap for your digital success with our comprehensive strategy services." },
        { title: "24/7 Support", description: "Round-the-clock support to ensure your business never misses a beat." },
        { title: "Global Reach", description: "Improving your website's visibility on search engines." },
      ],
    },
  },
  // Swedish section, adapted structure
  sv: {
    // Added UI section for missing strings
    ui: {
      everythingYouNeed: "Allt du behöver för att lyckas",
      features: [ // Copied from original src/translations.ts
        { title: "Digital strategi", description: "Bygg en färdplan för din digitala framgång..." },
        { title: "24/7 Support", description: "Support dygnet runt..." },
        { title: "Global räckvidd", description: "Anslut med kunder över hela världen..." }
      ],
      contactDescription: "Kontakta vårt team för att lära dig mer...",
      // Add other static UI strings if needed
      quickLinks: "Snabblänkar",
      contactInfo: "Kontaktinformation",
      phone: "+1 (555) 123-4567", // Keep example phone
      address: "123 Business St, Suite 100", // Keep example address
      links: "Länkar", // Added for social links section title
      home: "Hem", // Added for footer/nav links
      getStarted: "Kom igång", // Added for hero button
      projects: "Projekt", // Added Projects key (Swedish)
      blog: "Blogg", // Added Blog key (Swedish)
    },
    generalInfo: {
      title: "Allmän information",
      siteTitle: "OS Design v1",
      siteRole: "Kreativ Webbdesign",
      logoUrl: "https://raw.githubusercontent.com/tiger3homs/home/refs/heads/main/public/logo.png", // Consistent logo
    },
    hero: {
      title: "Förvandla din", // Kept original split title parts for translation accuracy
      title2: "Digitala närvaro",
      subtitle: "Vi hjälper företag att växa genom att skapa exceptionella digitala upplevelser...",
      ctaButtonText: "Kom igång." // Added and translated
    },
    about: {
      title: "Om oss",
      description: "Vi är ett kreativt webbdesignföretag som specialiserar sig...",
    },
    projects: { // Matched 'en' structure with placeholders
      title: "Utvalda Projekt", // Translated title
      project1: {
        title: "Projekt 1 (Exempel)",
        description: "Beskrivning av projekt 1 kommer här.",
        tags: ["Modern", "Användarvänlig"],
        link: ""
      },
      project2: {
        title: "Projekt 2 (Exempel)",
        description: "Beskrivning av projekt 2 kommer här.",
        tags: ["Vänta", "På", "Det"],
        link: ""
      },
      project3: {
        title: "Nytt Projekt (Exempel)",
        description: "Detta är en ny projektbeskrivning.",
        tags: ["Nytt", "Spännande"],
        link: ""
      }
    },
    contact: {
      title: "Kontakta mig", // Matched 'en' key
      nameLabel: "Namn",
      namePlaceholder: "Ange ditt namn",
      emailLabel: "E-post",
      emailPlaceholder: "Ange din e-post",
      messageLabel: "Meddelande",
      messagePlaceholder: "Skriv ditt meddelande",
      submitButton: "Skicka meddelande",
    },
    footer: {
      copyright: `© ${currentYear} OS Design v1 — Alla rättigheter förbehållna...`, // Consistent key and dynamic year
    },
    services: { // Matched 'en' structure with placeholders
        title: "Tjänster", // Translated title
        list: [
           { title: "Digital Strategi", description: "Bygg en färdplan för din digitala framgång..." },
           { title: "24/7 Support", description: "Support dygnet runt..." },
           { title: "Global Räckvidd", description: "Förbättra din webbplats synlighet..." }, // Example translation
        ]
    },
  },
  // Arabic section, adapted structure
  ar: {
    // Added UI section for missing strings
    ui: {
      everythingYouNeed: "كل ما تحتاجه للنجاح",
      features: [ // Copied from original src/translations.ts
        { title: "استراتيجية رقمية", description: "قم ببناء خارطة طريق لنجاحك الرقمي..." },
        { title: "دعم 24/7", description: "دعم على مدار الساعة..." },
        { title: "الوصول العالمي", description: "تواصل مع العملاء في جميع أنحاء العالم..." }
      ],
      contactDescription: "تواصل مع فريقنا لمعرفة المزيد...",
      // Add other static UI strings if needed
      quickLinks: "روابط سريعة",
      contactInfo: "معلومات الاتصال",
      phone: "+1 (555) 123-4567", // Keep example phone
      address: "123 Business St, Suite 100", // Keep example address
      links: "روابط", // Added for social links section title
      home: "الرئيسية", // Added for footer/nav links
      getStarted: "ابدأ الآن", // Added for hero button
      projects: "المشاريع", // Added Projects key (Arabic)
      blog: "المدونة", // Added Blog key (Arabic)
    },
    generalInfo: {
      title: "معلومات عامة",
      siteTitle: "OS Design v1",
      siteRole: "تصميم ويب إبداعي",
      logoUrl: "https://raw.githubusercontent.com/tiger3homs/home/refs/heads/main/public/logo.png", // Consistent logo
    },
    hero: {
      title: "حول", // Kept original split title parts
      title2: "وجودك الرقمي",
      subtitle: "نساعد الشركات على النمو من خلال إنشاء تجارب رقمية استثنائية...",
      ctaButtonText: "ابدأ الآن." // Added and translated
    },
    about: {
      title: "معلومات عنا",
      description: "نحن شركة تصميم ويب إبداعية متخصصة...",
    },
    projects: { // Matched 'en' structure with placeholders
      title: "مشاريع مميزة", // Translated title
      project1: {
        title: "المشروع 1 (مثال)",
        description: "وصف المشروع 1 يأتي هنا.",
        tags: ["حديث", "سهل الاستخدام"],
        link: ""
      },
      project2: {
        title: "المشروع 2 (مثال)",
        description: "وصف المشروع 2 يأتي هنا.",
        tags: ["انتظر", "من أجل", "ذلك"],
        link: ""
      },
      project3: {
        title: "مشروع جديد (مثال)",
        description: "هذا وصف مشروع جديد.",
        tags: ["جديد", "مثير"],
        link: ""
      }
    },
    contact: {
      title: "اتصل بي", // Matched 'en' key
      nameLabel: "الاسم",
      namePlaceholder: "أدخل اسمك",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      messageLabel: "الرسالة",
      messagePlaceholder: "أدخل رسالتك",
      submitButton: "إرسال الرسالة",
    },
    footer: {
      copyright: `© ${currentYear} تصميم OS الإصدار 1 — جميع الحقوق محفوظة...`, // Consistent key and dynamic year
    },
    services: { // Matched 'en' structure with placeholders
        title: "الخدمات", // Translated title
        list: [
           { title: "استراتيجية رقمية", description: "قم ببناء خارطة طريق لنجاحك الرقمي..." },
           { title: "دعم 24/7", description: "دعم على مدار الساعة..." },
           { title: "الوصول العالمي", description: "تحسين رؤية موقعك على محركات البحث..." }, // Example translation
        ]
    },
  }
};
