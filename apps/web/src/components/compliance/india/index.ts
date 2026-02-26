export { IndiaPFDashboard } from './IndiaPFDashboard';
export { IndiaESIDashboard } from './IndiaESIDashboard';
export { IndiaTDSDashboard } from './IndiaTDSDashboard';
export { FnFCalculator } from './FnFCalculator';

export default {
  IndiaPFDashboard: () => import('./IndiaPFDashboard').then((m) => m.IndiaPFDashboard),
  IndiaESIDashboard: () => import('./IndiaESIDashboard').then((m) => m.IndiaESIDashboard),
  IndiaTDSDashboard: () => import('./IndiaTDSDashboard').then((m) => m.IndiaTDSDashboard),
  FnFCalculator: () => import('./FnFCalculator').then((m) => m.FnFCalculator),
};
