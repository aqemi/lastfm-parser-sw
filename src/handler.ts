import { ImageUrlRewriter } from './image-url.rewriter';

const ROUTE_RE = /^\/artist\/([^\s!?/.*#|]+)\/images$/;
const IMAGE_SELECTOR = 'a.image-list-item img';

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return MethodNotAllowed(request);
  }
  const url = new URL(request.url);
  if (!ROUTE_RE.test(url.pathname)) {
    return NotFound(request);
  }

  const [, artist] = url.pathname.match(ROUTE_RE) ?? [];
  if (!artist) {
    return InternalServerError();
  }

  const lastFmResponse = await fetch(
    `https://www.last.fm/music/${artist}/+images`,
  );

  const imageUrlRewriter = new ImageUrlRewriter();
  const rewriter = new HTMLRewriter().on(IMAGE_SELECTOR, imageUrlRewriter);
  await rewriter.transform(lastFmResponse).text();
  const imageUrl = imageUrlRewriter.getUrl();
  const json = {
    small: getSmallImageUrl(imageUrl),
    large: getLargeImageUrl(imageUrl),
  };

  return new Response(JSON.stringify(json, null, 2), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}

function MethodNotAllowed(request: Request): Response {
  return new Response(`Method ${request.method} not allowed.`, {
    status: 405,
    headers: {
      Allow: 'GET',
    },
  });
}

function NotFound(request: Request): Response {
  return new Response(`Url ${request.url} not found.`, {
    status: 404,
  });
}

function InternalServerError(): Response {
  return new Response('Internal Server Error', {
    status: 500,
  });
}

function getSmallImageUrl(url: string): string {
  return url.replace(/\/u(\/.+?\/)/, '/u/64s/');
}

function getLargeImageUrl(url: string): string {
  return url.replace(/\/u(\/.+?\/)/, '/u/');
}
