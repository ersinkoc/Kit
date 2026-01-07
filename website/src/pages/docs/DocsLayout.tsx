import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';

export function DocsLayout() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <Sidebar className="hidden lg:block" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <article className="prose prose-slate dark:prose-invert max-w-none">
            <Outlet />
          </article>
        </div>
      </div>
    </div>
  );
}
