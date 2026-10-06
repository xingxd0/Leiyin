import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PUBLISHED_CONTENT_PATH,
  normalizePortfolioContent,
  stringifyPortfolioContent,
} from '../../portfolio/content/normalizePortfolioContent';
import { usePortfolioContent } from '../../portfolio/content/PortfolioContentProvider';
import { resolveAssetUrl } from '../../../shared/utils/assetUrl';
import { getWorkSlug } from '../../portfolio/content/workSlug';
import {
  Award,
  Experience,
  HeroLink,
  PortfolioContent,
  Work,
  WorkContentBlock,
  WorkContentBlockType,
} from '../../portfolio/content/model';

type AdminMode = 'home' | 'about' | 'article';

function Field({
  label,
  value,
  onChange,
  textarea = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  const baseClassName =
    'w-full border border-[#d9d9d4] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-black';

  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={5}
          className={`${baseClassName} min-h-32 resize-y`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${baseClassName} h-12`}
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full border border-[#d9d9d4] bg-white px-4 text-sm text-[#111111] outline-none transition focus:border-black"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-[#e8e8e3] bg-white">
      <div className="border-b border-[#f0f0ec] px-6 py-5">
        {eyebrow ? <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">{eyebrow}</p> : null}
        <h3 className="text-2xl font-extralight tracking-tight text-[#111111]">
          {title}
          <span className="font-bold text-blue-600">.</span>
        </h3>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}

function CompactCard({
  title,
  meta,
  children,
  onDelete,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
  onDelete?: () => void;
}) {
  return (
    <div className="border border-[#ededea] bg-[#fbfbfa]">
      <div className="flex items-start justify-between gap-4 border-b border-[#ededea] px-5 py-4">
        <div>
          <h4 className="text-base font-medium tracking-tight text-[#111111]">{title}</h4>
          {meta ? <p className="mt-1 text-xs text-gray-400">{meta}</p> : null}
        </div>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 transition hover:text-[#111111]"
          >
            Delete
          </button>
        ) : null}
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>
    </div>
  );
}

function SidebarNavItem({
  active,
  label,
  onClick,
  count,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  count?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between border-b border-white/5 px-5 py-3 text-left text-sm transition ${
        active ? 'bg-white text-[#111111]' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span>{label}</span>
      {count ? <span className={`text-[10px] uppercase tracking-[0.2em] ${active ? 'text-blue-600' : 'text-white/40'}`}>{count}</span> : null}
    </button>
  );
}

function createBlock(type: WorkContentBlockType): WorkContentBlock {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content: type === 'image' || type === 'video' ? '' : 'New content block',
    url: '',
    caption: '',
  };
}

function downloadContentFile(content: PortfolioContent) {
  const blob = new Blob([stringifyPortfolioContent(content)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'portfolio-content.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminDashboard() {
  const { content, publishedContent, hasLocalDraft, saveContent, resetDraft } = usePortfolioContent();
  const [draft, setDraft] = useState<PortfolioContent>(content);
  const [message, setMessage] = useState('本地编辑完成后先保存草稿，确认无误再导出发布文件并提交到 Git。');
  const [mode, setMode] = useState<AdminMode>('home');
  const [activeWorkId, setActiveWorkId] = useState(content.works[0]?.id ?? '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(content);
    if (!activeWorkId && content.works[0]?.id) {
      setActiveWorkId(content.works[0].id);
    }
  }, [activeWorkId, content]);

  useEffect(() => {
    if (!draft.works.some((work) => work.id === activeWorkId) && draft.works[0]?.id) {
      setActiveWorkId(draft.works[0].id);
    }
  }, [activeWorkId, draft.works]);

  const updateDraft = (nextDraft: PortfolioContent) => {
    setDraft(nextDraft);
    setMessage('表单已修改。先保存本地草稿，再导出发布文件。');
  };

  const handleSave = () => {
    saveContent(draft);
    setMessage('本地草稿已保存，当前端口下的前台预览已同步。');
  };

  const handleReset = () => {
    resetDraft();
    setDraft(publishedContent);
    setMessage('已清除本地草稿，前台已恢复到当前已发布版本。');
  };

  const handleUsePublished = () => {
    setDraft(publishedContent);
    setMessage('编辑器已载入当前已发布版本，可继续本地修改。');
  };

  const handleExport = () => {
    downloadContentFile(draft);
    setMessage('已导出发布文件。请将下载的 JSON 覆盖到 public/content/portfolio-content.json 后再提交到 Git。');
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const rawText = await file.text();
      const parsed = normalizePortfolioContent(JSON.parse(rawText) as PortfolioContent);
      setDraft(parsed);
      setActiveWorkId(parsed.works[0]?.id ?? '');
      setMessage('已导入 JSON 到本地编辑器。保存草稿后即可联动前台预览。');
    } catch {
      setMessage('导入失败，请确认 JSON 文件结构正确。');
    } finally {
      event.target.value = '';
    }
  };

  const selectedWork = draft.works.find((work) => work.id === activeWorkId) ?? draft.works[0] ?? null;

  const updateHeroLink = (index: number, key: keyof HeroLink, value: string) => {
    updateDraft({
      ...draft,
      heroLinks: draft.heroLinks.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value || undefined } : item,
      ),
    });
  };

  const updateExperience = (index: number, key: keyof Experience, value: string) => {
    updateDraft({
      ...draft,
      experiences: draft.experiences.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    });
  };

  const updateAward = (index: number, key: keyof Award, value: string) => {
    updateDraft({
      ...draft,
      awards: draft.awards.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    });
  };

  const updateWorkById = (workId: string, updater: (work: Work) => Work) => {
    updateDraft({
      ...draft,
      works: draft.works.map((work) => (work.id === workId ? updater(work) : work)),
    });
  };

  const addHeroLink = () => {
    updateDraft({
      ...draft,
      heroLinks: [...draft.heroLinks, { label: 'New Link', href: '', value: 'New Value' }],
    });
  };

  const addExperience = () => {
    updateDraft({
      ...draft,
      experiences: [
        ...draft.experiences,
        {
          period: '2026',
          company: 'New Company',
          location: 'City',
          role: 'Role',
          description: 'Describe this experience.',
        },
      ],
    });
  };

  const addAward = () => {
    updateDraft({
      ...draft,
      awards: [...draft.awards, { year: '2026', title: 'New Award', category: 'Category' }],
    });
  };

  const addWork = () => {
    const nextId = `work-${Date.now()}`;
    updateDraft({
      ...draft,
      works: [
        ...draft.works,
        {
          id: nextId,
          title: 'NEW PROJECT TITLE',
          category: 'Category',
          year: '2026',
          imageUrl: '',
          description: 'Add a short summary for this project.',
          client: 'Client',
          role: 'Role',
          content: ['Describe the project in detail.'],
          gallery: [],
          blocks: [
            {
              id: `${nextId}-heading-1`,
              type: 'heading',
              content: 'New article heading',
            },
            {
              id: `${nextId}-paragraph-1`,
              type: 'paragraph',
              content: 'Start writing the article body here.',
            },
          ],
        },
      ],
    });
    setActiveWorkId(nextId);
    setMode('article');
  };

  const addBlock = (type: WorkContentBlockType) => {
    if (!selectedWork) return;
    updateWorkById(selectedWork.id, (work) => ({
      ...work,
      blocks: [...(work.blocks ?? []), createBlock(type)],
    }));
  };

  const updateBlock = (blockId: string, key: keyof WorkContentBlock, value: string) => {
    if (!selectedWork) return;
    updateWorkById(selectedWork.id, (work) => ({
      ...work,
      blocks: (work.blocks ?? []).map((block) => (block.id === blockId ? { ...block, [key]: value } : block)),
    }));
  };

  const removeBlock = (blockId: string) => {
    if (!selectedWork) return;
    updateWorkById(selectedWork.id, (work) => ({
      ...work,
      blocks: (work.blocks ?? []).filter((block) => block.id !== blockId),
    }));
  };

  const moveBlock = (blockId: string, direction: -1 | 1) => {
    if (!selectedWork) return;
    updateWorkById(selectedWork.id, (work) => {
      const blocks = [...(work.blocks ?? [])];
      const currentIndex = blocks.findIndex((block) => block.id === blockId);
      const targetIndex = currentIndex + direction;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= blocks.length) {
        return work;
      }

      [blocks[currentIndex], blocks[targetIndex]] = [blocks[targetIndex], blocks[currentIndex]];
      return { ...work, blocks };
    });
  };

  const stats = useMemo(
    () => [
      { label: 'Projects', value: `${draft.works.length}` },
      { label: 'Experiences', value: `${draft.experiences.length}` },
      { label: 'Awards', value: `${draft.awards.length}` },
      { label: 'Hero Links', value: `${draft.heroLinks.length}` },
    ],
    [draft.awards.length, draft.experiences.length, draft.heroLinks.length, draft.works.length],
  );

  const modeMeta = {
    home: {
      title: 'Home Maintenance',
      description: '维护首页 Hero、简介、经历、奖项和页脚内容。本页编辑的是本地草稿。',
    },
    about: {
      title: 'About Work Maintenance',
      description: '维护作品列表页头部信息，以及卡片展示内容。确认后导出发布文件。',
    },
    article: {
      title: 'Content Management',
      description: '编辑 About Work 点开后的详情文章，支持富媒体内容块和本地预览。',
    },
  }[mode];

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#111111]">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImport}
      />
      <div className="flex min-h-screen">
        <aside className="hidden w-[240px] shrink-0 bg-[#111111] text-white lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/40">Portfolio CMS</p>
            <h1 className="mt-3 text-2xl font-extralight tracking-tight">
              Admin<span className="font-bold text-blue-500">.</span>
            </h1>
          </div>
          <div className="px-6 py-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/30">Page Maintenance</p>
          </div>
          <nav>
            <SidebarNavItem active={mode === 'home'} label="Home" onClick={() => setMode('home')} />
            <SidebarNavItem active={mode === 'about'} label="About Work" onClick={() => setMode('about')} count={`${draft.works.length}`} />
          </nav>
          <div className="px-6 py-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white/30">Content Management</p>
          </div>
          <nav className="border-t border-white/5">
            <SidebarNavItem active={mode === 'article'} label="Article Editor" onClick={() => setMode('article')} count={`${draft.works.length}`} />
          </nav>
          <div className="mt-auto border-t border-white/10 px-6 py-5 text-xs text-white/40">
            Edit locally, export for publish.
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[#ecece7] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">{modeMeta.title}</p>
                <h2 className="mt-2 text-3xl font-extralight tracking-tight">
                  {modeMeta.title}
                  <span className="font-bold text-blue-600">.</span>
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/" className="border border-[#e8e8e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 transition hover:border-black hover:text-black">
                  View Home
                </Link>
                <Link to="/work" className="border border-[#e8e8e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 transition hover:border-black hover:text-black">
                  View About Work
                </Link>
              </div>
            </div>
          </header>

          <div className="flex-1 px-6 py-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <div className="border border-[#ecece7] bg-white px-6 py-5">
                  <p className="text-sm leading-relaxed text-gray-500">{modeMeta.description}</p>
                </div>

                {mode === 'home' ? (
                  <>
                    <Panel title="Home Page Header" eyebrow="Page Identity">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field
                          label="Eyebrow"
                          value={draft.homePage.eyebrow}
                          onChange={(value) => updateDraft({ ...draft, homePage: { ...draft.homePage, eyebrow: value } })}
                        />
                        <Field
                          label="Title"
                          value={draft.homePage.title}
                          onChange={(value) => updateDraft({ ...draft, homePage: { ...draft.homePage, title: value } })}
                        />
                        <Field
                          label="Meta Code"
                          value={draft.homePage.metaCode}
                          onChange={(value) => updateDraft({ ...draft, homePage: { ...draft.homePage, metaCode: value } })}
                        />
                        <Field
                          label="Meta Label"
                          value={draft.homePage.metaLabel}
                          onChange={(value) => updateDraft({ ...draft, homePage: { ...draft.homePage, metaLabel: value } })}
                        />
                      </div>
                    </Panel>

                    <Panel title="Site Profile" eyebrow="Hero Content">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field
                          label="Name"
                          value={draft.siteProfile.name}
                          onChange={(value) => updateDraft({ ...draft, siteProfile: { ...draft.siteProfile, name: value } })}
                        />
                        <Field
                          label="Title"
                          value={draft.siteProfile.title}
                          onChange={(value) => updateDraft({ ...draft, siteProfile: { ...draft.siteProfile, title: value } })}
                        />
                        <Field
                          label="Hero Image"
                          value={draft.siteProfile.heroImage}
                          onChange={(value) => updateDraft({ ...draft, siteProfile: { ...draft.siteProfile, heroImage: value } })}
                          placeholder="/gallery/hero.jpg 或 https://..."
                        />
                        <div className="md:col-span-2">
                          <Field
                            label="Hero Blurb"
                            value={draft.siteProfile.blurb}
                            onChange={(value) => updateDraft({ ...draft, siteProfile: { ...draft.siteProfile, blurb: value } })}
                            textarea
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Field
                            label="Intro"
                            value={draft.siteProfile.intro}
                            onChange={(value) => updateDraft({ ...draft, siteProfile: { ...draft.siteProfile, intro: value } })}
                            textarea
                          />
                        </div>
                      </div>
                    </Panel>

                    <Panel title="Hero Links" eyebrow="Shortcut Content">
                      {draft.heroLinks.map((item, index) => (
                        <div key={index}>
                          <CompactCard
                            title={`Link ${index + 1}`}
                            meta="首页左下角信息"
                            onDelete={() =>
                              updateDraft({
                                ...draft,
                                heroLinks: draft.heroLinks.filter((_, itemIndex) => itemIndex !== index),
                              })
                            }
                          >
                            <Field label="Label" value={item.label} onChange={(value) => updateHeroLink(index, 'label', value)} />
                            <Field label="Value" value={item.value} onChange={(value) => updateHeroLink(index, 'value', value)} />
                            <div className="md:col-span-2">
                              <Field label="Href" value={item.href ?? ''} onChange={(value) => updateHeroLink(index, 'href', value)} />
                            </div>
                          </CompactCard>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addHeroLink}
                        className="border border-[#e8e8e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 transition hover:border-black hover:text-black"
                      >
                        Add Link
                      </button>
                    </Panel>

                    <Panel title="Employment History" eyebrow="Home Sections">
                      {draft.experiences.map((item, index) => (
                        <div key={index}>
                          <CompactCard
                            title={item.company}
                            meta={item.period}
                            onDelete={() =>
                              updateDraft({
                                ...draft,
                                experiences: draft.experiences.filter((_, itemIndex) => itemIndex !== index),
                              })
                            }
                          >
                            <Field label="Period" value={item.period} onChange={(value) => updateExperience(index, 'period', value)} />
                            <Field label="Company" value={item.company} onChange={(value) => updateExperience(index, 'company', value)} />
                            <Field label="Location" value={item.location} onChange={(value) => updateExperience(index, 'location', value)} />
                            <Field label="Role" value={item.role} onChange={(value) => updateExperience(index, 'role', value)} />
                            <div className="md:col-span-2">
                              <Field label="Description" value={item.description} onChange={(value) => updateExperience(index, 'description', value)} textarea />
                            </div>
                          </CompactCard>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addExperience}
                        className="border border-[#e8e8e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 transition hover:border-black hover:text-black"
                      >
                        Add Experience
                      </button>
                    </Panel>

                    <Panel title="Awards & Patents" eyebrow="Home Sections">
                      {draft.awards.map((item, index) => (
                        <div key={index}>
                          <CompactCard
                            title={item.title}
                            meta={item.year}
                            onDelete={() =>
                              updateDraft({
                                ...draft,
                                awards: draft.awards.filter((_, itemIndex) => itemIndex !== index),
                              })
                            }
                          >
                            <Field label="Year" value={item.year} onChange={(value) => updateAward(index, 'year', value)} />
                            <Field label="Category" value={item.category} onChange={(value) => updateAward(index, 'category', value)} />
                            <div className="md:col-span-2">
                              <Field label="Title" value={item.title} onChange={(value) => updateAward(index, 'title', value)} />
                            </div>
                          </CompactCard>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addAward}
                        className="border border-[#e8e8e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 transition hover:border-black hover:text-black"
                      >
                        Add Award
                      </button>
                    </Panel>

                    <Panel title="Footer Information" eyebrow="Global Content">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field
                          label="Location Label"
                          value={draft.footerInfo.locationLabel}
                          onChange={(value) => updateDraft({ ...draft, footerInfo: { ...draft.footerInfo, locationLabel: value } })}
                        />
                        <Field
                          label="Location Value"
                          value={draft.footerInfo.locationValue}
                          onChange={(value) => updateDraft({ ...draft, footerInfo: { ...draft.footerInfo, locationValue: value } })}
                        />
                        <Field
                          label="Connect Label"
                          value={draft.footerInfo.connectLabel}
                          onChange={(value) => updateDraft({ ...draft, footerInfo: { ...draft.footerInfo, connectLabel: value } })}
                        />
                        <Field
                          label="Connect Value"
                          value={draft.footerInfo.connectValue}
                          onChange={(value) => updateDraft({ ...draft, footerInfo: { ...draft.footerInfo, connectValue: value } })}
                        />
                        <Field
                          label="Connect Href"
                          value={draft.footerInfo.connectHref}
                          onChange={(value) => updateDraft({ ...draft, footerInfo: { ...draft.footerInfo, connectHref: value } })}
                        />
                        <Field
                          label="Time Label"
                          value={draft.footerInfo.timeLabel}
                          onChange={(value) => updateDraft({ ...draft, footerInfo: { ...draft.footerInfo, timeLabel: value } })}
                        />
                        <Field
                          label="Time Value"
                          value={draft.footerInfo.timeValue}
                          onChange={(value) => updateDraft({ ...draft, footerInfo: { ...draft.footerInfo, timeValue: value } })}
                        />
                      </div>
                    </Panel>
                  </>
                ) : null}

                {mode === 'about' ? (
                  <>
                    <Panel title="About Work Header" eyebrow="Page Identity">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field
                          label="Eyebrow"
                          value={draft.aboutPage.eyebrow}
                          onChange={(value) => updateDraft({ ...draft, aboutPage: { ...draft.aboutPage, eyebrow: value } })}
                        />
                        <Field
                          label="Title"
                          value={draft.aboutPage.title}
                          onChange={(value) => updateDraft({ ...draft, aboutPage: { ...draft.aboutPage, title: value } })}
                        />
                        <Field
                          label="Meta Code"
                          value={draft.aboutPage.metaCode}
                          onChange={(value) => updateDraft({ ...draft, aboutPage: { ...draft.aboutPage, metaCode: value } })}
                        />
                        <Field
                          label="Meta Label"
                          value={draft.aboutPage.metaLabel}
                          onChange={(value) => updateDraft({ ...draft, aboutPage: { ...draft.aboutPage, metaLabel: value } })}
                        />
                      </div>
                    </Panel>

                    <Panel title="Portfolio Card Content" eyebrow="Archive Page">
                      {draft.works.map((work) => (
                        <div key={work.id}>
                          <CompactCard
                            title={work.title}
                            meta={`${work.year} · ${work.category}`}
                          >
                            <Field
                              label="Title"
                              value={work.title}
                              onChange={(value) => updateWorkById(work.id, (current) => ({ ...current, title: value }))}
                            />
                            <Field
                              label="Year"
                              value={work.year}
                              onChange={(value) => updateWorkById(work.id, (current) => ({ ...current, year: value }))}
                            />
                            <Field
                              label="Category"
                              value={work.category}
                              onChange={(value) => updateWorkById(work.id, (current) => ({ ...current, category: value }))}
                            />
                            <Field
                              label="Cover Image"
                              value={work.imageUrl}
                              onChange={(value) => updateWorkById(work.id, (current) => ({ ...current, imageUrl: value }))}
                            />
                            <div className="md:col-span-2">
                              <Field
                                label="Card Description"
                                value={work.description}
                                onChange={(value) => updateWorkById(work.id, (current) => ({ ...current, description: value }))}
                                textarea
                              />
                            </div>
                          </CompactCard>
                        </div>
                      ))}
                    </Panel>
                  </>
                ) : null}

                {mode === 'article' ? (
                  <>
                    <Panel title="Article Selector" eyebrow="Content Management">
                      <div className="flex flex-wrap gap-3">
                        {draft.works.map((work) => (
                          <button
                            key={work.id}
                            type="button"
                            onClick={() => setActiveWorkId(work.id)}
                            className={`border px-4 py-3 text-left transition ${
                              selectedWork?.id === work.id
                                ? 'border-black bg-black text-white'
                                : 'border-[#e8e8e3] bg-white text-[#111111] hover:border-black'
                            }`}
                          >
                            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] opacity-60">{work.year}</span>
                            <span className="mt-2 block text-sm font-medium tracking-tight">{work.title}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={addWork}
                          className="border border-dashed border-[#d9d9d4] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400 transition hover:border-black hover:text-black"
                        >
                          Add Project
                        </button>
                      </div>
                    </Panel>

                    {selectedWork ? (
                      <>
                        <Panel title="Article Meta" eyebrow="Detail Page">
                          <div className="grid gap-4 md:grid-cols-2">
                            <Field
                              label="Title"
                              value={selectedWork.title}
                              onChange={(value) => updateWorkById(selectedWork.id, (work) => ({ ...work, title: value }))}
                            />
                            <Field
                              label="Slug / ID"
                              value={selectedWork.id}
                              onChange={(value) => {
                                updateWorkById(selectedWork.id, (work) => ({ ...work, id: value }));
                                setActiveWorkId(value);
                              }}
                            />
                            <Field
                              label="Year"
                              value={selectedWork.year}
                              onChange={(value) => updateWorkById(selectedWork.id, (work) => ({ ...work, year: value }))}
                            />
                            <Field
                              label="Category"
                              value={selectedWork.category}
                              onChange={(value) => updateWorkById(selectedWork.id, (work) => ({ ...work, category: value }))}
                            />
                            <Field
                              label="Client"
                              value={selectedWork.client ?? ''}
                              onChange={(value) => updateWorkById(selectedWork.id, (work) => ({ ...work, client: value }))}
                            />
                            <Field
                              label="Role"
                              value={selectedWork.role ?? ''}
                              onChange={(value) => updateWorkById(selectedWork.id, (work) => ({ ...work, role: value }))}
                            />
                            <div className="md:col-span-2">
                              <Field
                                label="Cover Image"
                                value={selectedWork.imageUrl}
                                onChange={(value) => updateWorkById(selectedWork.id, (work) => ({ ...work, imageUrl: value }))}
                              placeholder="/gallery/project-cover.jpg 或 https://..."
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Field
                                label="Summary"
                                value={selectedWork.description}
                                onChange={(value) => updateWorkById(selectedWork.id, (work) => ({ ...work, description: value }))}
                                textarea
                              />
                            </div>
                          </div>
                          <div className="border-t border-[#f0f0ec] pt-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">Permalink</p>
                            <p className="mt-2 text-sm text-gray-500">{`/work/${getWorkSlug(selectedWork)}`}</p>
                          </div>
                        </Panel>

                        <Panel title="Article Editor" eyebrow="Rich Media">
                          <div className="flex flex-wrap gap-3">
                            {([
                              ['heading', 'Add Heading'],
                              ['paragraph', 'Add Paragraph'],
                              ['quote', 'Add Quote'],
                              ['image', 'Add Image'],
                              ['video', 'Add Video'],
                            ] as Array<[WorkContentBlockType, string]>).map(([type, label]) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => addBlock(type)}
                                className="border border-[#e8e8e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 transition hover:border-black hover:text-black"
                              >
                                {label}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-5">
                            {(selectedWork.blocks ?? []).map((block, index) => (
                              <div key={block.id} className="border border-[#ededea] bg-[#fbfbfa]">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ededea] px-5 py-4">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400">{`Block ${index + 1}`}</p>
                                    <p className="mt-2 text-base font-medium tracking-tight text-[#111111]">{block.type}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => moveBlock(block.id, -1)}
                                      className="border border-[#e8e8e3] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500"
                                    >
                                      Up
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveBlock(block.id, 1)}
                                      className="border border-[#e8e8e3] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500"
                                    >
                                      Down
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeBlock(block.id)}
                                      className="border border-[#e8e8e3] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                <div className="grid gap-4 p-5 md:grid-cols-2">
                                  <SelectField
                                    label="Block Type"
                                    value={block.type}
                                    onChange={(value) => updateBlock(block.id, 'type', value)}
                                    options={[
                                      { label: 'Heading', value: 'heading' },
                                      { label: 'Paragraph', value: 'paragraph' },
                                      { label: 'Quote', value: 'quote' },
                                      { label: 'Image', value: 'image' },
                                      { label: 'Video', value: 'video' },
                                    ]}
                                  />
                                  <Field
                                    label="Caption"
                                    value={block.caption ?? ''}
                                    onChange={(value) => updateBlock(block.id, 'caption', value)}
                                  />

                                  {block.type === 'image' || block.type === 'video' ? (
                                    <div className="md:col-span-2">
                                      <Field
                                        label={block.type === 'image' ? 'Media URL' : 'Embed URL'}
                                        value={block.url ?? ''}
                                        onChange={(value) => updateBlock(block.id, 'url', value)}
                                        placeholder={block.type === 'image' ? '/gallery/article-media.jpg 或 https://...' : 'https://www.youtube.com/embed/...'}
                                      />
                                    </div>
                                  ) : null}

                                  {block.type !== 'image' && block.type !== 'video' ? (
                                    <div className="md:col-span-2">
                                      <Field
                                        label="Content"
                                        value={block.content ?? ''}
                                        onChange={(value) => updateBlock(block.id, 'content', value)}
                                        textarea
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </Panel>

                      </>
                    ) : null}
                  </>
                ) : null}
              </div>

              <div className="space-y-6">
                <Panel title="Publish" eyebrow="Actions">
                  <div className="space-y-4 text-sm text-gray-500">
                    <div className="flex items-center justify-between border-b border-[#f0f0ec] pb-3">
                      <span>Current Preview</span>
                      <span className="font-medium text-[#111111]">{hasLocalDraft ? 'Local Draft' : 'Published File'}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#f0f0ec] pb-3">
                      <span>Editing Scope</span>
                      <span className="font-medium text-[#111111]">{modeMeta.title}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#f0f0ec] pb-3">
                      <span>Publish File</span>
                      <span className="font-medium text-[#111111]">public/content/portfolio-content.json</span>
                    </div>
                    <p className="leading-relaxed">{message}</p>
                    <div className="grid gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="bg-[#111111] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white transition hover:opacity-85"
                      >
                        Save Local Draft
                      </button>
                      <button
                        type="button"
                        onClick={handleExport}
                        className="border border-[#e8e8e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 transition hover:border-black hover:text-black"
                      >
                        Export Publish JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-[#e8e8e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 transition hover:border-black hover:text-black"
                      >
                        Import JSON
                      </button>
                      <button
                        type="button"
                        onClick={handleUsePublished}
                        className="border border-[#e8e8e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 transition hover:border-black hover:text-black"
                      >
                        Load Published
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="border border-[#e8e8e3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 transition hover:border-black hover:text-black"
                      >
                        Clear Local Draft
                      </button>
                    </div>
                  </div>
                </Panel>

                <Panel title="Content Summary" eyebrow="Overview">
                  <div className="space-y-3">
                    {stats.map((item) => (
                      <div key={item.label} className="flex items-center justify-between border-b border-[#f0f0ec] pb-3 text-sm">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-medium text-[#111111]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Local Gallery" eyebrow="Media">
                  <div className="space-y-3 text-sm text-gray-500">
                    <p>本地图库目录：`public/gallery`</p>
                    <p>图片引用方式：`/gallery/文件名.jpg`</p>
                    <p>示例：`/gallery/hero.jpg`、`/gallery/work-01.png`</p>
                    <p>导出的发布 JSON 也应一起提交到 Git。</p>
                  </div>
                </Panel>

                <Panel title="Quick Jump" eyebrow="Navigation">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setMode('home')}
                      className={`flex w-full items-center justify-between border px-4 py-4 text-left ${mode === 'home' ? 'border-black bg-black text-white' : 'border-[#e8e8e3] bg-white text-[#111111]'}`}
                    >
                      <span className="text-sm">Home Maintenance</span>
                      <span className="text-[10px] uppercase tracking-[0.24em] opacity-60">Page</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('about')}
                      className={`flex w-full items-center justify-between border px-4 py-4 text-left ${mode === 'about' ? 'border-black bg-black text-white' : 'border-[#e8e8e3] bg-white text-[#111111]'}`}
                    >
                      <span className="text-sm">About Work</span>
                      <span className="text-[10px] uppercase tracking-[0.24em] opacity-60">Page</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('article')}
                      className={`flex w-full items-center justify-between border px-4 py-4 text-left ${mode === 'article' ? 'border-black bg-black text-white' : 'border-[#e8e8e3] bg-white text-[#111111]'}`}
                    >
                      <span className="text-sm">Article Editor</span>
                      <span className="text-[10px] uppercase tracking-[0.24em] opacity-60">Content</span>
                    </button>
                  </div>
                </Panel>

                {selectedWork ? (
                  <Panel title="Current Article" eyebrow="Detail Page">
                    <div className="space-y-4">
                      <div className="overflow-hidden bg-gray-100">
                        {selectedWork.imageUrl ? (
                          <img
                            src={resolveAssetUrl(selectedWork.imageUrl)}
                            alt={selectedWork.title}
                            className="h-48 w-full object-cover grayscale"
                          />
                        ) : (
                          <div className="flex h-48 items-center justify-center text-sm text-gray-400">No cover image</div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-400">{selectedWork.year}</p>
                        <h4 className="mt-2 text-xl font-light tracking-tight text-[#111111]">{selectedWork.title}</h4>
                        <p className="mt-3 text-sm leading-relaxed text-gray-500">{selectedWork.description}</p>
                      </div>
                      <Link to={`/work/${getWorkSlug(selectedWork)}`} className="text-sm text-blue-600 underline underline-offset-4">
                        Preview detail page
                      </Link>
                    </div>
                  </Panel>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
