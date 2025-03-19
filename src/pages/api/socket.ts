import { NextApiRequest, NextApiResponse } from 'next';
import { initSocketServer } from '@/server/socket';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ((res.socket as unknown).server && (res.socket as { server: { io?: unknown } }).server.io) {
    // Socket server already initialized
    res.end();
    return;
  }

  initSocketServer(req, res, (res.socket as { server: unknown }).server);
  res.end();
}

// Disable body parsing, we just need the raw stream for socket.io
export const config = {
  api: {
    bodyParser: false,
  },
};