"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LandingLocale = "en" | "km";

type LandingCopy = {
  navigation: {
    links: Array<{ label: string; href: string }>;
    openBot: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    trust: {
      accuracy: string;
      response: string;
      crops: string;
    };
    liveResultTitle: string;
    liveResultSubtitle: string;
    responseTitle: string;
    responseSubtitle: string;
    scroll: string;
  };
  stats: {
    items: Array<{ value: string; label: string }>;
  };
  whatIs: {
    badge: string;
    title: string;
    description: string;
    points: Array<{
      title: string;
      description: string;
    }>;
  };
  howItWorks: {
    badge: string;
    title: string;
    description: string;
    steps: Array<{
      step: string;
      title: string;
      description: string;
    }>;
  };
  features: {
    badge: string;
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      tag: string;
    }>;
  };
  diseaseMarquee: {
    badge: string;
    title: string;
    description: string;
  };
  crops: {
    badge: string;
    title: string;
    description: string;
    familyOneTitle: string;
    familyOneSubtitle: string;
    familyTwoTitle: string;
    familyTwoSubtitle: string;
    familyOneItems: string[];
    familyTwoItems: string[];
  };
  ourStory: {
    badge: string;
    title: string;
    paragraphOne: string;
    paragraphTwo: string;
    imageAlt: string;
  };
  cta: {
    titleLine1: string;
    titleLine2: string;
    description: string;
    button: string;
    note: string;
  };
  footer: {
    description: string;
    productTitle: string;
    contactTitle: string;
    links: Array<{ label: string; href: string }>;
    supportEmail: string;
    botHandle: string;
    copyright: string;
  };
};

const landingDictionaries: Record<LandingLocale, LandingCopy> = {
  en: {
    navigation: {
      links: [
        { label: "What is Save Crop", href: "#what-is-save-crop" },
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Our Crops", href: "#crops" },
        { label: "Our Story", href: "#our-story" },
      ],
      openBot: "Open Bot",
    },
    hero: {
      badge: "Trusted by Cambodian Farmers",
      titleLine1: "Detect Crop Disease",
      titleLine2: "Before It Spreads",
      description:
        "Send a photo of your plant to our Telegram bot and get an instant AI-powered disease diagnosis with practical treatment guidance in under 30 seconds.",
      primaryCta: "Start on Telegram",
      secondaryCta: "See How It Works",
      trust: {
        accuracy: "95% accuracy",
        response: "Under 30s response",
        crops: "11+ crop types",
      },
      liveResultTitle: "Live Bot Result",
      liveResultSubtitle: "Real Telegram screenshot",
      responseTitle: "< 30 seconds",
      responseSubtitle: "End-to-end response",
      scroll: "Scroll",
    },
    stats: {
      items: [
        { value: "95%", label: "Detection Accuracy" },
        { value: "11+", label: "Crop Species" },
        { value: "< 30s", label: "Analysis Time" },
        { value: "24 / 7", label: "Bot Available" },
      ],
    },
    whatIs: {
      badge: "About Save Crop",
      title: "What is Save Crop?",
      description:
        "Save Crop is an AI assistant on Telegram that helps farmers identify crop diseases early and get clear treatment guidance without needing a separate app.",
      points: [
        {
          title: "AI Disease Detection",
          description:
            "Analyzes your crop photos and identifies likely diseases using trained computer vision models.",
        },
        {
          title: "Fast Practical Advice",
          description:
            "Provides treatment and prevention steps you can apply quickly in real farming conditions.",
        },
        {
          title: "Built for Cambodia",
          description:
            "Designed around local crop types and daily farmer workflows using Telegram as the main channel.",
        },
      ],
    },
    howItWorks: {
      badge: "Simple Process",
      title: "Three steps to save your crop",
      description:
        "No app download needed. Works directly inside Telegram — the app you already use every day.",
      steps: [
        {
          step: "01",
          title: "Open the Bot",
          description: "Search for @savecropbot on Telegram and tap Start. No account or registration required.",
        },
        {
          step: "02",
          title: "Send a Photo",
          description: "Take a clear photo of the affected leaf or plant and send it directly to the bot.",
        },
        {
          step: "03",
          title: "Get Your Diagnosis",
          description: "Receive instant disease identification with a confidence score and a personalized treatment plan.",
        },
      ],
    },
    features: {
      badge: "Technology",
      title: "Powered by advanced AI",
      description:
        "Multiple layers of intelligence work together to give you the most accurate diagnosis possible—including inclusive tools for farmers who read with difficulty.",
      items: [
        {
          title: "Custom Deep Learning",
          description:
            "Neural networks trained on thousands of real crop disease images for each vegetable family. Models are continuously improved for higher accuracy.",
          tag: "Model Layer",
        },
        {
          title: "LLM-Powered Classification",
          description:
            "Large language models identify the vegetable type in your photo first, then route it to the correct specialized disease detection model.",
          tag: "Classification Layer",
        },
        {
          title: "Personalized Treatment Plans",
          description:
            "AI generates detailed, localized recommendations including local pesticide options, organic alternatives, and step-by-step prevention strategies.",
          tag: "Recommendation Layer",
        },
        {
          title: "Text-to-Speech for easier access",
          description:
            "A standout Save Crop feature: built-in text-to-speech helps farmers who have disabilities related to reading, low literacy, or eye strain—listen to guidance in Khmer or English instead of reading long messages on a small screen.",
          tag: "Accessibility",
        },
      ],
    },
    diseaseMarquee: {
      badge: "Detection Library",
      title: "Diseases we can identify",
      description: "Our AI models are trained to recognize a wide spectrum of crop diseases across all supported plant families.",
    },
    crops: {
      badge: "Coverage",
      title: "Supported Crops",
      description: "Two major crop families grown across Cambodia are covered with high-accuracy AI disease detection.",
      familyOneTitle: "Cucumber Family",
      familyOneSubtitle: "(Cucurbitaceae)",
      familyTwoTitle: "Cauliflower Family",
      familyTwoSubtitle: "(Brassica oleracea)",
      familyOneItems: [
        "Cucumber",
        "Watermelon",
        "Yellow Watermelon",
        "Wax Gourd",
        "Pumpkin",
        "Squash",
      ],
      familyTwoItems: [
        "Cauliflower",
        "Broccoli",
        "Romanesco",
        "Broccolini",
        "Cabbage",
      ],
    },
    ourStory: {
      badge: "Our Story",
      title: "From Development to Real Farms",
      paragraphOne:
        "We traveled to Kampot province to test Save Crop directly with local farmers in real farm conditions.",
      paragraphTwo:
        "Many farms really liked our bot, and we received very positive feedback. Their input helped us improve the bot to be simpler, faster, and more useful in daily farming work.",
      imageAlt: "Save Crop team testing the bot with farmers in Kampot",
    },
    cta: {
      titleLine1: "Your crops deserve",
      titleLine2: "the best protection",
      description: "Join hundreds of Cambodian farmers already using AI to detect diseases early and protect their harvests.",
      button: "Start Using Save Crop — Free",
      note: "No account needed · Works on any device with Telegram",
    },
    footer: {
      description: "AI-powered crop disease detection delivered directly through Telegram — built for Cambodian farmers.",
      productTitle: "Product",
      contactTitle: "Contact",
      links: [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Our Crops", href: "#crops" },
      ],
      supportEmail: "support@carep.org",
      botHandle: "@savecropbot",
      copyright: "All rights reserved.",
    },
  },
  km: {
    navigation: {
      links: [
        { label: "Save Crop ជាអ្វី", href: "#what-is-save-crop" },
        { label: "មុខងារ", href: "#features" },
        { label: "របៀបប្រើប្រាស់", href: "#how-it-works" },
        { label: "ដំណាំដែលគាំទ្រ", href: "#crops" },
        { label: "អំពីយើង", href: "#our-story" },
      ],
      openBot: "បើក Bot",
    },
    hero: {
      badge: "សម្រាប់កសិករខ្មែរ",
      titleLine1: "រកឃើញជំងឺដំណាំ",
      titleLine2: "មុនពេលវារីករាលដាល",
      description:
        "ផ្ញើរូបស្លឹកដំណាំទៅ Telegram bot របស់យើង ហើយទទួលបានលទ្ធផលវិភាគជំងឺដោយ AI និងការណែនាំព្យាបាលជាក់ស្តែង ក្នុងរយៈពេលតិចជាង 30 វិនាទី។",
      primaryCta: "ចាប់ផ្តើមលើ Telegram",
      secondaryCta: "មើលរបៀបដំណើរការ",
      trust: {
        accuracy: "ភាពត្រឹមត្រូវ 95%",
        response: "ឆ្លើយតបក្រោម 30 វិនាទី",
        crops: "ដំណាំលើស 11 ប្រភេទ",
      },
      liveResultTitle: "លទ្ធផល Bot ពិត",
      liveResultSubtitle: "រូបភាពជាក់ស្តែងពី Telegram",
      responseTitle: "< 30 វិនាទី",
      responseSubtitle: "ពេលវេលាឆ្លើយតបពេញដំណើរ",
      scroll: "អូសចុះក្រោម",
    },
    stats: {
      items: [
        { value: "95%", label: "ភាពត្រឹមត្រូវ" },
        { value: "11+", label: "ប្រភេទដំណាំ" },
        { value: "< 30s", label: "ពេលវិភាគ" },
        { value: "24 / 7", label: "បម្រើ 24 ម៉ោង" },
      ],
    },
    whatIs: {
      badge: "អំពី Save Crop",
      title: "Save Crop ជាអ្វី?",
      description:
        "Save Crop គឺជាជំនួយការ AI លើ Telegram ដែលជួយកសិកររកឃើញជំងឺដំណាំឆាប់ និងទទួលបានការណែនាំព្យាបាលច្បាស់លាស់ ដោយមិនចាំបាច់ដំឡើងកម្មវិធីបន្ថែម។",
      points: [
        {
          title: "AI រកឃើញជំងឺដំណាំ",
          description:
            "វិភាគរូបភាពដំណាំរបស់អ្នក និងកំណត់ជំងឺដែលអាចកើតមាន ដោយប្រើម៉ូឌែលកុំព្យូទ័រវិញ្ញាណ។",
        },
        {
          title: "ការណែនាំរហ័ស អនុវត្តបាន",
          description:
            "ផ្តល់ជំហានព្យាបាល និងការការពារ ដែលអាចយកទៅប្រើបានភ្លាមៗក្នុងការធ្វើស្រែពិតប្រាកដ។",
        },
        {
          title: "បង្កើតសម្រាប់កម្ពុជា",
          description:
            "រចនាឡើងស្របតាមប្រភេទដំណាំក្នុងស្រុក និងការងារប្រចាំថ្ងៃរបស់កសិករ តាមរយៈ Telegram។",
        },
      ],
    },
    howItWorks: {
      badge: "ងាយស្រួលប្រើ",
      title: "3 ជំហានសម្រាប់ការពារដំណាំ",
      description: "មិនចាំបាច់ដំឡើងកម្មវិធីថ្មី។ ប្រើបានផ្ទាល់ក្នុង Telegram ដែលអ្នកប្រើរាល់ថ្ងៃ។",
      steps: [
        {
          step: "01",
          title: "បើក Bot",
          description: "ស្វែងរក @savecropbot ក្នុង Telegram ហើយចុច Start។ មិនត្រូវការចុះឈ្មោះទេ។",
        },
        {
          step: "02",
          title: "ផ្ញើរូបភាព",
          description: "ថតរូបស្លឹក ឬដើមដំណាំដែលមានបញ្ហា ហើយផ្ញើទៅ bot ដោយផ្ទាល់។",
        },
        {
          step: "03",
          title: "ទទួលលទ្ធផល",
          description: "ទទួលបានការកំណត់ជំងឺភ្លាមៗ ជាមួយភាគរយជឿជាក់ និងផែនការព្យាបាលតាមលក្ខណៈជាក់ស្តែង។",
        },
      ],
    },
    features: {
      badge: "បច្ចេកវិទ្យា",
      title: "ដំណើរការដោយ AI ទំនើប",
      description:
        "ស្រទាប់បច្ចេកវិទ្យាច្រើនធ្វើការរួមគ្នា ដើម្បីផ្តល់លទ្ធផលដែលត្រឹមត្រូវខ្ពស់ រួមទាំងឧបករណ៍ដែលងាយស្រួលសម្រាប់កសិករដែលអានមិនស្រួល។",
      items: [
        {
          title: "Deep Learning ផ្ទាល់ខ្លួន",
          description:
            "ម៉ូឌែល AI ត្រូវបានបណ្តុះបណ្តាលដោយរូបភាពជំងឺដំណាំពិតរាប់ពាន់សន្លឹក សម្រាប់គ្រួសារដំណាំនីមួយៗ។",
          tag: "ស្រទាប់ម៉ូឌែល",
        },
        {
          title: "ចាត់ថ្នាក់ដោយ LLM",
          description:
            "ម៉ូឌែលភាសាធំៗជួយកំណត់ប្រភេទដំណាំជាមុនសិន ហើយបញ្ជូនទៅម៉ូឌែលជំងឺដែលត្រឹមត្រូវ។",
          tag: "ស្រទាប់ចាត់ថ្នាក់",
        },
        {
          title: "ផែនការព្យាបាលផ្ទាល់ខ្លួន",
          description:
            "AI ផ្តល់ការណែនាំលម្អិត រួមទាំងជម្រើសថ្នាំ វិធីសាស្ត្រធម្មជាតិ និងការការពារសម្រាប់ពេលក្រោយ។",
          tag: "ស្រទាប់ណែនាំ",
        },
        {
          title: "បម្លែងអត្ថបទទៅសំឡេង",
          description:
            "មុខងារពិសេសរបស់ Save Crop៖ មានអានអត្ថបទជាសំឡេងជួយកសិករដែលមានពិការភាពក្នុងការអាន អក្សរតិច ឬចាញ់ភ្នែក—អាចស្តាប់ការណែនាំជាភាសាខ្មែរ ជំនួសការអានសារវែងលើអេក្រង់តូច។",
          tag: "ភាពអាចចូលប្រើបាន",
        },
      ],
    },
    diseaseMarquee: {
      badge: "បណ្ណាល័យជំងឺ",
      title: "ជំងឺដែលយើងអាចរកឃើញ",
      description: "AI របស់យើងត្រូវបានបណ្តុះបណ្តាលសម្រាប់ជំងឺដំណាំជាច្រើនលើគ្រួសារដំណាំដែលគាំទ្រ។",
    },
    crops: {
      badge: "ការគាំទ្រ",
      title: "ដំណាំដែលគាំទ្រ",
      description: "គ្រួសារដំណាំសំខាន់ 2 ប្រភេទនៅកម្ពុជា ត្រូវបានគាំទ្រដោយការវិភាគជំងឺ AI ភាពត្រឹមត្រូវខ្ពស់។",
      familyOneTitle: "គ្រួសារត្រសក់",
      familyOneSubtitle: "(Cucurbitaceae)",
      familyTwoTitle: "គ្រួសារខាត់ណា",
      familyTwoSubtitle: "(Brassica oleracea)",
      familyOneItems: [
        "ត្រសក់",
        "ឪឡឹក",
        "ឪឡឹកលឿង",
        "ត្រឡាច",
        "ល្ពៅ",
        "ស្ពៃល្ពៅ",
      ],
      familyTwoItems: [
        "ផ្កាខាត់ណា",
        "ប្រូខូលី",
        "រ៉ូម៉ាណេស្កូ",
        "ប្រូខូលីនី",
        "ស្ពៃក្តោប",
      ],
    },
    ourStory: {
      badge: "អំពីយើង",
      title: "ពីការបង្កើតថ្មីទៅកាន់ចំការពិត",
      paragraphOne:
        "ក្រុមការងារយើងបានទៅខេត្តកំពត ដើម្បីសាកល្បង Save Crop ជាមួយកសិករក្នុងស្ថានភាពកសិកម្មពិតប្រាកដ។",
      paragraphTwo:
        "កសិករជាច្រើនពេញចិត្ត bot របស់ពួកយើង ហើយពួកយើងទទួលបានមតិយោបល់ល្អៗជាច្រើន ដែលជួយឱ្យពួកយើងកែលម្អ bot ឱ្យងាយប្រើ លឿន និងមានប្រយោជន៍ជាងមុនសម្រាប់ការងារប្រចាំថ្ងៃរបស់កសិករ។",
      imageAlt: "ក្រុម Save Crop សាកល្បង bot ជាមួយកសិករនៅខេត្តកំពត",
    },
    cta: {
      titleLine1: "ដំណាំរបស់អ្នកសមនឹង",
      titleLine2: "ការការពារល្អបំផុត",
      description: "ចូលរួមជាមួយកសិករខ្មែរច្រើនរយនាក់ដែលកំពុងប្រើ AI ដើម្បីរកជំងឺឆាប់ និងការពារផលដំណាំ។",
      button: "ចាប់ផ្តើមប្រើ  — ឥតគិតថ្លៃ",
      note: "មិនត្រូវការគណនី · ប្រើបានលើគ្រប់ឧបករណ៍ដែលមាន Telegram",
    },
    footer: {
      description: "ប្រព័ន្ធរកឃើញជំងឺដំណាំដោយ AI ផ្តល់ជូនផ្ទាល់តាម Telegram សម្រាប់កសិករខ្មែរ។",
      productTitle: "ផលិតផល",
      contactTitle: "ទំនាក់ទំនង",
      links: [
        { label: "មុខងារ", href: "#features" },
        { label: "របៀបប្រើប្រាស់", href: "#how-it-works" },
        { label: "ដំណាំដែលគាំទ្រ", href: "#crops" },
      ],
      supportEmail: "support@carep.org",
      botHandle: "@savecropbot",
      copyright: "រក្សាសិទ្ធិគ្រប់យ៉ាង។",
    },
  },
};

type LandingI18nContextType = {
  locale: LandingLocale;
  setLocale: (locale: LandingLocale) => void;
  copy: LandingCopy;
};

const LandingI18nContext = createContext<LandingI18nContextType | null>(null);

export function LandingI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LandingLocale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("landing-locale");
    if (saved === "en" || saved === "km") {
      setLocale(saved);
      return;
    }

    if (navigator.language.toLowerCase().startsWith("km")) {
      setLocale("km");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("landing-locale", locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      copy: landingDictionaries[locale],
    }),
    [locale],
  );

  return (
    <LandingI18nContext.Provider value={value}>
      {children}
    </LandingI18nContext.Provider>
  );
}

export function useLandingI18n() {
  const context = useContext(LandingI18nContext);

  if (!context) {
    throw new Error("useLandingI18n must be used within LandingI18nProvider");
  }

  return context;
}
