import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || '5b139e5c95598b17e8a6064a7f972f4f2b5970801f4cd4118a35cd7d782fa370';

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET_KEY) as { userId: number, email: string };
}