import { SignJWT, jwtVerify } from "jose";

const getSecret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "dev-secret-please-change-in-production"
  );

export async function signToken(payload: { userId: string; email: string; name: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { userId: string; email: string; name: string };
}
