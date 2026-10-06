import { defaultPortfolioContent } from './defaultPortfolioContent';
import { PortfolioContent } from './model';
import { withBasePath } from '../../../shared/utils/assetUrl';

export const PUBLISHED_CONTENT_PATH = withBasePath('/content/portfolio-content.json');
export const DRAFT_STORAGE_KEY = 'minimalist-designer-portfolio-draft-content';

export function normalizePortfolioContent(raw?: Partial<PortfolioContent> | null): PortfolioContent {
  if (!raw) {
    return defaultPortfolioContent;
  }

  return {
    ...defaultPortfolioContent,
    ...raw,
    homePage: raw.homePage ?? defaultPortfolioContent.homePage,
    aboutPage: raw.aboutPage ?? defaultPortfolioContent.aboutPage,
    siteProfile: { ...defaultPortfolioContent.siteProfile, ...raw.siteProfile },
    footerInfo: { ...defaultPortfolioContent.footerInfo, ...raw.footerInfo },
    heroLinks: raw.heroLinks ?? defaultPortfolioContent.heroLinks,
    experiences: raw.experiences ?? defaultPortfolioContent.experiences,
    awards: raw.awards ?? defaultPortfolioContent.awards,
    works: (raw.works ?? defaultPortfolioContent.works).map((work, index) => {
      const fallbackGallery = work.gallery ?? [];
      const fallbackParagraphs = work.content ?? [];

      return {
        ...work,
        blocks:
          work.blocks && work.blocks.length > 0
            ? work.blocks
            : [
                ...fallbackParagraphs.map((paragraph, paragraphIndex) => ({
                  id: `${work.id || index}-paragraph-${paragraphIndex}`,
                  type: 'paragraph' as const,
                  content: paragraph,
                })),
                ...fallbackGallery.map((imageUrl, imageIndex) => ({
                  id: `${work.id || index}-image-${imageIndex}`,
                  type: 'image' as const,
                  url: imageUrl,
                  caption: '',
                })),
              ],
      };
    }),
  };
}

export function stringifyPortfolioContent(content: PortfolioContent) {
  return JSON.stringify(content, null, 2);
}
