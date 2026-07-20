import { makeItemRoute } from '../../_factory';

export const dynamic = 'force-dynamic';

const routes = makeItemRoute('bid');
export const GET = routes.GET;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
