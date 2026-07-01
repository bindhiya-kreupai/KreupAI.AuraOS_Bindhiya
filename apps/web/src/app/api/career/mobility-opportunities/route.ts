import { makeCollectionRoute } from '../_factory';

export const dynamic = 'force-dynamic';

const routes = makeCollectionRoute('mobility-opportunity');
export const GET = routes.GET;
export const POST = routes.POST;
