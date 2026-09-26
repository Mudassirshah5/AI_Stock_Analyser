import React from 'react';
import { Newspaper, ExternalLink, ShieldCheck } from 'lucide-react';
import { NewsItem } from '../types/stock';

interface NewsSectionProps {
  news: NewsItem[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-slate-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Headlines ({news.length})
            </h3>
            <p className="text-xs text-slate-500">
              Raw external reporting from primary financial wires
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Headlines report events; does not establish causation</span>
        </div>
      </div>

      {news && news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {news.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span className="font-semibold text-slate-700">{item.publisher}</span>
                  <span>{item.publishedAt}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                  {item.title}
                </h4>
              </div>

              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-950 transition-colors self-start"
                >
                  <span>Read article source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="mt-3 text-[11px] text-slate-400">Wire item</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
          No recent news available from the selected data source.
        </div>
      )}
    </div>
  );
};
