import { lazy } from 'react';

const LazyProject = lazy(() => import('./project'));

export default LazyProject;
