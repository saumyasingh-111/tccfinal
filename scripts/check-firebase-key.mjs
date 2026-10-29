
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "");
const key = env.FIREBASE_PRIVATE_KEY ?? "";

console.log("Private key length:", key.length);
console.log("Starts with PEM header:", key.includes("-----BEGIN PRIVATE KEY-----"));
console.log("Contains PEM footer:", key.includes("-----END PRIVATE KEY-----"));
console.log("Contains literal \\n:", key.includes("\\n"));
console.log("Contains actual newlines:", key.includes("\n"));
console.log("Has surrounding quote characters:", /^["']|["']$/.test(key));
