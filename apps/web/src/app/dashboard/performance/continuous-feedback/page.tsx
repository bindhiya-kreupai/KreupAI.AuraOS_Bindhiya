/**
 * Canonical continuous-feedback hub. Previously this route rendered a
 * browser-local "Feedback 360 Configuration" form (localStorage) that did not
 * match the route's purpose. It now re-exports the single ContinuousFeedback
 * hub used at /dashboard/continuous-feedback so both routes stay in sync.
 */
export { default } from '../../(modules)/continuous-feedback/page';
