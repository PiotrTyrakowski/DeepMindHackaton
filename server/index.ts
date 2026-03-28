const DEFAULT_STATE = {
  themeVariant: "earthy" as const,
  roofPhotoFixed: false,
  faqFirstQuestion: "What areas do you serve?",
};

let state = { ...DEFAULT_STATE };

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

Bun.serve({
  port: 3001,
  routes: {
    "/state": {
      GET: () => new Response(JSON.stringify(state), { headers: CORS_HEADERS }),
      POST: async (req) => {
        const body = await req.json();
        state = { ...state, ...body };
        console.log("State updated:", state);
        return new Response(JSON.stringify(state), { headers: CORS_HEADERS });
      },
      OPTIONS: () => new Response(null, { status: 204, headers: CORS_HEADERS }),
    },
    "/reset": {
      POST: () => {
        state = { ...DEFAULT_STATE };
        console.log("State reset");
        return new Response(JSON.stringify(state), { headers: CORS_HEADERS });
      },
      OPTIONS: () => new Response(null, { status: 204, headers: CORS_HEADERS }),
    },
  },
});

console.log("State server running on http://localhost:3001");
