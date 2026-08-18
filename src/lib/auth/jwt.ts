import env from "@/env";
import * as jose from "jose";

export type TokenPayload = {
  userId: string;
  email: string;
  role?: "USER" | "ADMIN";
};

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export async function signJwt(
  payload: TokenPayload,
  expiresIn = "7d"
): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifyJwt(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}
