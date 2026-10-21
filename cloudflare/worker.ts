import { SITE_URL } from "../lib/site";

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === "holiday.masonhu.cc") {
      return Response.redirect(`${SITE_URL}${url.pathname}${url.search}`, 308);
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
