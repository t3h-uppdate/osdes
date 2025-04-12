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
};
