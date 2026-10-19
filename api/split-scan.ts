import { handleSplitScanRequest } from "../src/lib/split-scan-handler";

export const maxDuration = 60;
export const config = {
  maxDuration: 60,
  api: {
    bodyParser: false, // allow raw multipart stream
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res?: any) {
  // If standard Web API (Request)
  if (req instanceof Request || (req?.headers && typeof req.text === "function")) {
    return handleSplitScanRequest(req as Request);
  }

  // If Node.js (req: IncomingMessage, res: ServerResponse)
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else if (value) {
      headers.set(key, String(value));
    }
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks);

  const webReq = new Request(url, {
    method: req.method,
    headers,
    body: ["GET", "HEAD", "OPTIONS"].includes(req.method || "") ? undefined : body,
  });

  const webRes = await handleSplitScanRequest(webReq);

  if (res && typeof res.status === "function") {
    res.status(webRes.status);
    webRes.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });
    const text = await webRes.text();
    return res.end(text);
  }

  return webRes;
}

export async function GET(req: Request) {
  return handleSplitScanRequest(req);
}

export async function POST(req: Request) {
  return handleSplitScanRequest(req);
}

export async function OPTIONS(req: Request) {
  return handleSplitScanRequest(req);
}
