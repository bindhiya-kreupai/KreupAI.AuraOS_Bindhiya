import { makeCollectionRoute } from '../_factory';

export const dynamic = 'force-dynamic';

const routes = makeCollectionRoute('succession-plan');
export const GET = routes.GET;
export const POST = routes.POST;
