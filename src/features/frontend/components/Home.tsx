import { motion } from 'motion/react';
import { usePortfolioContent } from '../../portfolio/content/PortfolioContentProvider';
import { Hero } from './Hero';

export function Home() {
  const { content } = usePortfolioContent();
  const { awards, experiences, homePage, siteProfile } = content;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1920px] flex-1 flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col justify-between border-b border-gray-100 bg-[#f9f9f8] md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-1/3 md:border-r md:border-b-0">
        <Hero />
      </aside>

      <section className="flex h-full w-full flex-col px-8 py-6 md:w-2/3 md:px-12 lg:px-20">
        <header className="mb-8 flex items-end justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              {homePage.eyebrow}
            </span>
            <h2 className="text-4xl font-extralight tracking-tighter md:text-6xl">
              {homePage.title}
              <span className="font-bold text-blue-600">.</span>
            </h2>
          </div>
          <div className="hidden text-right md:block">
            <span className="block text-[10px] font-mono uppercase text-gray-300">{homePage.metaLabel}</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col border-t border-black pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl border-b border-gray-100 py-8 md:py-12"
          >
            <h3 className="text-2xl font-light leading-relaxed tracking-tight text-[#111111] md:text-3xl">
              {siteProfile.intro}
            </h3>
          </motion.div>

          <div className="border-b border-gray-100 py-12">
            <h4 className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              Employment History
            </h4>
            <div className="flex flex-col">
              {experiences.map((experience, index) => (
                <motion.div
                  key={`${experience.company}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group -mx-4 flex cursor-default flex-col gap-4 border-b border-gray-50 px-4 py-8 transition-all last:border-0 hover:bg-gray-50 md:flex-row md:gap-8"
                >
                  <div className="w-full shrink-0 md:w-48">
                    <span className="mb-1 block text-[10px] font-mono text-gray-400">{experience.period}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#111111]">
                      {experience.company}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h5 className="mb-2 text-xl font-light tracking-tight">{experience.role}</h5>
                    <p className="max-w-xl whitespace-pre-line text-sm font-medium leading-relaxed text-gray-500">
                      {experience.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="py-12">
            <h4 className="mb-8 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
              Awards, Patents
            </h4>
            <div className="flex flex-col">
              {awards.map((award, index) => (
                <motion.div
                  key={`${award.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group -mx-4 flex cursor-default flex-col items-start gap-4 border-b border-gray-50 px-4 py-6 transition-all last:border-0 hover:bg-gray-50 md:flex-row md:items-center md:gap-6 lg:gap-8"
                >
                  <div className="w-full shrink-0 md:w-[50px] lg:w-40">
                    <span className="block text-[10px] font-mono text-gray-400">{award.year}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h5 className="text-lg font-light tracking-tight">{award.title}</h5>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {award.category}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
