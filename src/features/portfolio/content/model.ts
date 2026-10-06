export interface Work {
  id: string;
  title: string;
  category: string;
  year: string;
  imageUrl: string;
  description: string;
  client?: string;
  role?: string;
  gallery?: string[];
  content?: string[];
  blocks?: WorkContentBlock[];
}

export type WorkContentBlockType = 'heading' | 'paragraph' | 'image' | 'quote' | 'video';

export interface WorkContentBlock {
  id: string;
  type: WorkContentBlockType;
  content?: string;
  url?: string;
  caption?: string;
}

export interface Experience {
  period: string;
  company: string;
  location: string;
  role: string;
  description: string;
}

export interface Award {
  year: string;
  title: string;
  category: string;
}

export interface FooterInfo {
  locationLabel: string;
  locationValue: string;
  connectLabel: string;
  connectValue: string;
  connectHref: string;
  timeLabel: string;
  timeValue: string;
}

export interface HeroLink {
  label: string;
  href?: string;
  value: string;
}

export interface SiteProfile {
  name: string;
  title: string;
  blurb: string;
  heroImage: string;
  intro: string;
}

export interface PageIntro {
  eyebrow: string;
  title: string;
  metaCode: string;
  metaLabel: string;
}

export interface PortfolioContent {
  siteProfile: SiteProfile;
  homePage: PageIntro;
  aboutPage: PageIntro;
  heroLinks: HeroLink[];
  experiences: Experience[];
  awards: Award[];
  footerInfo: FooterInfo;
  works: Work[];
}
