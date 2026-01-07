import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { DocsLayout } from '@/pages/docs/DocsLayout';
import { Introduction } from '@/pages/docs/Introduction';
import { Installation } from '@/pages/docs/Installation';
import { QuickStart } from '@/pages/docs/QuickStart';
import { ModulesOverview } from '@/pages/docs/ModulesOverview';
import { ModulePage } from '@/pages/docs/ModulePage';
import { ApiOverview } from '@/pages/api/ApiOverview';
import { Examples } from '@/pages/Examples';
import { Playground } from '@/pages/Playground';
import { NotFound } from '@/pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="docs" element={<DocsLayout />}>
          <Route index element={<Introduction />} />
          <Route path="installation" element={<Installation />} />
          <Route path="quick-start" element={<QuickStart />} />
          <Route path="modules" element={<ModulesOverview />} />
          <Route path="modules/:moduleName" element={<ModulePage />} />
        </Route>
        <Route path="api/*" element={<ApiOverview />} />
        <Route path="examples" element={<Examples />} />
        <Route path="playground" element={<Playground />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
