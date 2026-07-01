import { makeCollectionRoute } from '../../_factory';

export const dynamic = 'force-dynamic';

const routes = makeCollectionRoute('equipment-lease');
export const GET = routes.GET;
export const POST = routes.POST;
