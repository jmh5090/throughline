import { Mail, Linkedin, FileText, Globe } from "lucide-react";

export const VOICE_PRESETS = {
  authoritative_guide: {
    id: "authoritative_guide",
    name: "Authoritative Guide",
    description:
      "Expert peer who distills complexity into clarity. Confident, specific, no hand-waving.",
    tone: "Authoritative and confident, but not alarmist. We're the knowledgeable guide — the colleague who read the 200-page rule so you don't have to.",
    brandVoice:
      "Expert peer. Direct, specific, no filler. We lead with business impact, not policy jargon.",
    dos: [
      "Reference specific section numbers and dates",
      "Lead with business impact",
      "Include concrete next steps",
      "Acknowledge complexity without oversimplifying",
    ],
    donts: [
      "Use fear-based urgency",
      "Oversimplify nuanced guidance",
      "Make definitive legal/tax claims",
      "Use generic platitudes",
    ],
    channelNotes: {
      email:
        "Under 200 words. Subject line references the specific guidance. Concrete CTA.",
      linkedin:
        "First person from company expert. Hook with business impact. End with genuine question. 100-180 words.",
      blog: "SEO-optimized. Signal as hook but broadly useful. Clear point of view.",
      web: "Conversion-focused. Hero addresses persona's #1 concern.",
    },
  },
  thought_leader: {
    id: "thought_leader",
    name: "Thought Leader",
    description:
      "Visionary perspective that connects dots others miss. Forward-looking, bold takes.",
    tone: "Visionary and forward-looking. We see around corners. Our content makes readers feel smarter and more prepared.",
    brandVoice:
      "Industry oracle. We connect policy dots to business strategy in ways competitors don't.",
    dos: [
      "Take a clear position",
      "Connect to broader trends",
      "Use data and examples",
      "Project forward",
    ],
    donts: [
      "Sit on the fence",
      "Rehash what everyone knows",
      "Be contrarian without substance",
      "Ignore practical implications",
    ],
    channelNotes: {
      email:
        "Teaser format — insight then CTA. Provocative but honest subject lines.",
      linkedin:
        "Hot take format. Bold statement, back it up, invite debate. 120-200 words.",
      blog: "Long-form analysis. Original research angle. Be the primary source.",
      web: "Category leader positioning. Unique perspective in every headline.",
    },
  },
  trusted_advisor: {
    id: "trusted_advisor",
    name: "Trusted Advisor",
    description:
      "Calm, thorough, and balanced. Presents options and helps the reader decide.",
    tone: "Warm, knowledgeable, and balanced. We present the full picture and help readers make informed decisions.",
    brandVoice:
      "Trusted counselor. We earn trust through thoroughness and honesty.",
    dos: [
      "Present multiple perspectives",
      "Acknowledge uncertainty honestly",
      "Provide decision frameworks",
      "Be thorough on implications",
    ],
    donts: [
      "Push a single agenda",
      "Oversell urgency",
      "Gloss over risks",
      "Be condescending",
    ],
    channelNotes: {
      email: "Educational tone. 'Here's what you need to know' framing.",
      linkedin: "Balanced analysis. 'Here's what I'm hearing' framing.",
      blog: "Comprehensive guide format. FAQ section at end.",
      web: "Trust-building. Emphasize expertise and track record.",
    },
  },
  insurgent: {
    id: "insurgent",
    name: "Insurgent",
    description:
      "Challenger brand energy. Direct, urgent, cuts through noise.",
    tone: "Direct, urgent, and unapologetic. We cut through the noise.",
    brandVoice:
      "Challenger. We say what others won't. Fast, sharp, action-oriented.",
    dos: [
      "Be direct and action-oriented",
      "Call out industry inertia",
      "Create urgency through specificity",
      "Use concrete numbers",
    ],
    donts: [
      "Be vague or hedging",
      "Sound like a press release",
      "Use passive voice",
      "Bury the lead",
    ],
    channelNotes: {
      email: "Short and punchy. One key message. Bold CTA. Under 150 words.",
      linkedin: "Contrarian hook. Under 150 words.",
      blog: "Opinionated and fast. Numbered takeaways.",
      web: "Bold headlines. Speed and simplicity.",
    },
  },
};

export const CHANNELS = {
  email: { id: "email", name: "Email", Icon: Mail },
  linkedin: { id: "linkedin", name: "LinkedIn", Icon: Linkedin },
  blog: { id: "blog", name: "Blog Post", Icon: FileText },
  web: { id: "web", name: "Web Copy", Icon: Globe },
};

export const DEMO_CONFIG = {
  theme:
    "Clean energy tax credit guidance, IRA implementation, and credit transfer market intel",
  sources: [
    {
      name: "U.S. Department of Treasury",
      type: "government",
      url: "https://home.treasury.gov",
      why: "Primary source for IRA tax credit regulations and guidance",
    },
    {
      name: "Internal Revenue Service",
      type: "government",
      url: "https://irs.gov",
      why: "Issues notices, rulings, and registration processes for energy credits",
    },
    {
      name: "Department of Energy",
      type: "government",
      url: "https://energy.gov",
      why: "Publishes funding opportunities and technical guidance",
    },
    {
      name: "Bloomberg NEF",
      type: "research",
      url: "https://about.bnef.com",
      why: "Market data on clean energy investment and credit pricing",
    },
    {
      name: "Utility Dive",
      type: "news",
      url: "https://utilitydive.com",
      why: "Industry coverage of energy policy and market developments",
    },
    {
      name: "Tax Notes",
      type: "industry",
      url: "https://taxnotes.com",
      why: "Detailed analysis of tax legislation and IRS guidance",
    },
  ],
  personas: [
    {
      id: "p_dev",
      name: "Project Developer",
      title: "VP of Development",
      company: "Mid-size renewable energy developer",
      painPoints: [
        "Uncertain credit eligibility timelines",
        "Prevailing wage & apprenticeship compliance",
        "Transferability vs. direct pay decisions",
      ],
      buyingTriggers: [
        "New IRS guidance on credit eligibility",
        "Transferability marketplace maturity",
        "Bonus credit qualification changes",
      ],
      sophistication: "high",
      notes:
        "Deeply technical. Wants specifics, not hand-waving. Often has legal counsel reviewing everything.",
    },
    {
      id: "p_buyer",
      name: "Tax Credit Buyer",
      title: "Head of Tax",
      company: "Fortune 500 corporation with tax liability",
      painPoints: [
        "Counterparty risk in credit transfers",
        "Discount rate uncertainty",
        "Audit exposure and indemnification",
      ],
      buyingTriggers: [
        "Clearer IRS transfer registration process",
        "Market price transparency",
        "New credit types becoming transferable",
      ],
      sophistication: "high",
      notes:
        "Risk-averse. Needs confidence in compliance. Responds to market benchmarks and peer activity.",
    },
    {
      id: "p_advisor",
      name: "Tax Advisor",
      title: "Partner, Tax Advisory",
      company: "Big 4 or specialized tax advisory firm",
      painPoints: [
        "Keeping clients current on rapid guidance changes",
        "Structuring compliant transfer deals",
        "Managing pipeline across credit types",
      ],
      buyingTriggers: [
        "New proposed regulations",
        "Market volume growth",
        "Client demand for credit monetization",
      ],
      sophistication: "expert",
      notes:
        "Already knows the landscape. Wants delta — what changed, what's new, what's the implication they haven't considered.",
    },
  ],
  voice: {
    ...VOICE_PRESETS.authoritative_guide,
  },
  signals: [
    {
      id: "demo_s1",
      date: "2026-02-12",
      title:
        "Treasury and IRS Issue Notice 2026-15: Guidance on Prohibited Foreign Entity Material Assistance Rules for 45Y, 48E, and 45X Credits",
      source: "U.S. Department of Treasury",
      url: "https://www.irs.gov/newsroom/treasury-irs-provide-guidance-for-certain-energy-tax-credits-regarding-material-assistance-provided-by-prohibited-foreign-entities-under-the-one-big-beautiful-bill",
      summary:
        "Treasury released 95 pages of guidance defining 'material assistance from a prohibited foreign entity' under the One Big Beautiful Bill. The notice establishes interim safe harbors for calculating the Material Assistance Cost Ratio for 45Y/48E facilities and 45X components. Comments due March 30, 2026.",
      impact: "high",
      tags: ["FEOC", "PFE", "45Y", "48E", "45X", "OBBBA"],
    },
    {
      id: "demo_s2",
      date: "2026-02-03",
      title:
        "IRS Issues Proposed Regulations on Section 45Z Clean Fuel Production Credit Under the One Big Beautiful Bill",
      source: "Internal Revenue Service",
      url: "https://www.irs.gov/newsroom/treasury-irs-issue-proposed-regulations-on-the-clean-fuel-production-credit-under-the-one-big-beautiful-bill",
      summary:
        "Proposed regs provide guidance on 45Z credit determination, emissions rates, and registration requirements. OBBBA extended the credit through 2029, limited feedstocks to US/Mexico/Canada origin, and excluded indirect land use changes from emissions calculations.",
      impact: "high",
      tags: ["45Z", "Clean Fuel", "OBBBA", "Proposed Regs"],
    },
    {
      id: "demo_s3",
      date: "2025-12-01",
      title:
        "OBBBA Preserves Tax Credit Transferability but Adds FEOC Restrictions and Accelerated Solar/Wind Phaseout",
      source: "Tax Notes",
      url: "https://www.claconnect.com/en/resources/articles/25/transferable-energy-credits-remain-a-key-strategy-after-obbba",
      summary:
        "Despite early proposals to repeal Section 6418 transferability, the final OBBBA preserved the framework. However, credits can no longer be transferred to prohibited foreign entities, and solar/wind projects beginning construction after July 4, 2026 face accelerated placed-in-service deadlines.",
      impact: "high",
      tags: ["Transferability", "6418", "OBBBA", "Solar", "Wind"],
    },
    {
      id: "demo_s4",
      date: "2025-12-10",
      title:
        "Transfer Market Exceeds $40B in 2025 as 45X, 45Z, and 45U Credits Gain Buyer Traction",
      source: "Bloomberg NEF",
      url: "https://www.reunioninfra.com/insights/reunions-q3-2025-market-monitor-release",
      summary:
        "The clean energy tax credit transfer market surpassed $40 billion in 2025, up from under $10B in 2023. Section 45Z clean fuel credits are trading in the high $0.80s to low $0.90s. Buyers are now prioritizing 'legacy' FEOC-exempt Section 48 and 45 credits at premium pricing.",
      impact: "high",
      tags: ["Transfer Market", "45Z Pricing", "45X", "FEOC-Exempt"],
    },
    {
      id: "demo_s5",
      date: "2025-12-11",
      title:
        "ACP Introduces Standardized Tax Credit Transfer Agreement to Reduce Transaction Costs",
      source: "Utility Dive",
      url: "https://cleanpower.org/blog/tax-credit-transferability-takes-center-stage/",
      summary:
        "The American Clean Power Association launched a standardized ITC transfer agreement form to reduce deal friction as the market scales. Transaction costs currently run 3-7% of deal size. Standardized templates for 45Y production credits and 45X manufacturing credits are expected next.",
      impact: "medium",
      tags: ["TCTA", "Standardization", "ACP", "Transaction Costs"],
    },
  ],
};
