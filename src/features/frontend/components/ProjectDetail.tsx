import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { usePortfolioContent } from '../../portfolio/content/PortfolioContentProvider';
import { WorkContentBlock } from '../../portfolio/content/model';
import { getWorkSlug } from '../../portfolio/content/workSlug';
import { resolveAssetUrl } from '../../../shared/utils/assetUrl';
import { SiteFooter } from './SiteFooter';

function renderBlock(block: WorkContentBlock, index: number, workTitle: string) {
  const baseMotionProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, delay: index * 0.03 },
  };

  switch (block.type) {
    case 'heading':
      return (
        <motion.h3 key={block.id} {...baseMotionProps} className="text-2xl font-light tracking-tight text-[#111111] md:text-3xl">
          {block.content}
        </motion.h3>
      );
    case 'quote':
      return (
        <motion.blockquote
          key={block.id}
          {...baseMotionProps}
          className="border-l-2 border-black pl-6 text-xl font-light leading-relaxed tracking-tight text-[#111111] md:text-2xl"
        >
          {block.content}
        </motion.blockquote>
      );
    case 'image':
      return (
        <motion.figure key={block.id} {...baseMotionProps} className="space-y-4">
          <div className="w-full overflow-hidden bg-gray-100 shadow-lg">
            <img
              src={resolveAssetUrl(block.url)}
              alt={block.caption || workTitle}
              className="h-full max-h-[720px] w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
            />
          </div>
          {block.caption ? <figcaption className="text-sm text-gray-400">{block.caption}</figcaption> : null}
        </motion.figure>
      );
    case 'video':
      return (
        <motion.figure key={block.id} {...baseMotionProps} className="space-y-4">
          <div className="aspect-video w-full overflow-hidden bg-black shadow-lg">
            <iframe
              src={block.url}
              title={block.caption || workTitle}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {block.caption ? <figcaption className="text-sm text-gray-400">{block.caption}</figcaption> : null}
        </motion.figure>
      );
    case 'paragraph':
    default:
      return (
        <motion.p key={block.id} {...baseMotionProps} className="text-lg font-light leading-relaxed text-gray-600 md:text-xl">
          {block.content}
        </motion.p>
      );
  }
}

export function ProjectDetail() {
  const { content } = usePortfolioContent();
  const { works } = content;
  const { slug } = useParams();
  const work = works.find((item) => getWorkSlug(item) === slug || item.id === slug);

  if (!work) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-2xl font-light">Project not found</h2>
        <Link to="/work" className="mt-4 text-[10px] font-bold uppercase tracking-widest underline">
          Return to Portfolio
        </Link>
      </div>
    );
  }

  const detailBlocks = work.blocks ?? [];

  return (
    <section className="mx-auto flex h-full w-full max-w-7xl flex-col px-8 py-6 md:px-12 lg:px-20">
      <header className="mb-12 flex items-end justify-between">
        <div className="space-y-4">
          <Link
            to="/work"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 transition-colors hover:text-[#111111]"
          >
            ← Back to Portfolio
          </Link>
          <h2 className="text-4xl font-extralight leading-tight tracking-tighter md:text-5xl lg:text-6xl">
            {work.title}
            <span className="font-bold text-blue-600">.</span>
          </h2>
        </div>
      </header>

      <div className="flex flex-1 flex-col border-t border-black pb-12 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4"
        >
          <div className="flex flex-col space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Client</span>
            <span className="text-sm font-semibold">{work.client || 'N/A'}</span>
          </div>
          <div className="flex flex-col space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Role</span>
            <span className="text-sm font-semibold">{work.role || 'Design'}</span>
          </div>
          <div className="flex flex-col space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Category</span>
            <span className="text-sm font-semibold">{work.category}</span>
          </div>
          <div className="flex flex-col space-y-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Year</span>
            <span className="text-sm font-semibold">{work.year}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-16 aspect-[16/9] w-full overflow-hidden bg-gray-100 shadow-lg md:aspect-[21/9]"
        >
          <img
            src={resolveAssetUrl(work.imageUrl)}
            alt={work.title}
            className="h-full w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
          />
        </motion.div>

        <div className="mx-auto mb-20 max-w-3xl space-y-8 text-[#111111]">
          {detailBlocks.length > 0 ? (
            detailBlocks.map((block, index) => renderBlock(block, index, work.title))
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-lg font-light leading-relaxed text-gray-600 md:text-xl"
            >
              {work.description}
            </motion.p>
          )}
        </div>
      </div>

      <SiteFooter
        leftLabel="Project"
        leftValue={work.category}
        rightLabel="Action"
        rightValue="Return to Portfolio"
        rightHref="/work"
      />
    </section>
  );
}
