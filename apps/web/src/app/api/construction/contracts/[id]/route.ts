import { makeItemRoute } from '../../_factory';

export const dynamic = 'force-dynamic';

const routes = makeItemRoute('contract');
export const GET = routes.GET;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
