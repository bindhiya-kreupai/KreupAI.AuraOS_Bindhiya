import { makeItemRoute } from '../../_factory';

export const dynamic = 'force-dynamic';

const routes = makeItemRoute('mobility-preference');
export const GET = routes.GET;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
