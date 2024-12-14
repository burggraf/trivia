/**
 * This script is used to encrypt the keys in the .keys.json file
 * To run this script, you need to have deno 2.0 or later installed.
 * Run:
 * deno run --allow-read --allow-write lock-up-keys.deno.ts
 */
import forge from "npm:node-forge";

function deriveKey(password: string, salt: string): string {
    const numIterations = 100000;
    const keySize = 32; // 256 bits

    const derivedKey = forge.pkcs5.pbkdf2(
        password,
        salt,
        numIterations,
        keySize,
    );
    return forge.util.bytesToHex(derivedKey); // Convert to hex string before returning
}

function encryptData(data: string, hexKey: string): string {
    // Convert hex key to bytes
    const key = forge.util.hexToBytes(hexKey);

    const iv = forge.random.getBytesSync(12); // 96 bits for AES-GCM

    const cipher = forge.cipher.createCipher(
        "AES-GCM",
        forge.util.createBuffer(key),
    );
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(data, "utf8"));
    cipher.finish();

    const encrypted = cipher.output.getBytes(); // Encrypted binary data
    const tag = cipher.mode.tag.getBytes(); // Authentication tag

    // Combine IV, encrypted data, and tag for storage/transmission
    const payload = forge.util.encode64(iv + encrypted + tag);
    return payload;
}

function decryptData(encryptedData: string, hexKey: string): string {
    // Convert hex key to bytes
    const key = forge.util.hexToBytes(hexKey);
    const payload = forge.util.decode64(encryptedData);
    const ivLength = 12; // 96 bits
    const tagLength = 16; // 128 bits

    const iv = payload.slice(0, ivLength);
    const encrypted = payload.slice(ivLength, -tagLength);
    const tag = payload.slice(-tagLength);

    const decipher = forge.cipher.createDecipher(
        "AES-GCM",
        forge.util.createBuffer(key),
    );
    decipher.start({
        iv: forge.util.createBuffer(iv),
        tag: forge.util.createBuffer(tag),
    });
    decipher.update(forge.util.createBuffer(encrypted));
    const success = decipher.finish();

    if (success) {
        return decipher.output.toString();
    } else {
        throw new Error("Decryption failed");
    }
}

// generate a random password
const password_1 = forge.random.getBytesSync(16).toString("hex");
const password_2 = forge.random.getBytesSync(16).toString("hex");
// generate a random salt
const salt_1 = forge.random.getBytesSync(16).toString("hex");
const salt_2 = forge.random.getBytesSync(16).toString("hex");
// generate a key
const key_1 = deriveKey(password_1, salt_1);
const key_2 = deriveKey(password_2, salt_2);
// open the keys.json file
const keysFile = Deno.readTextFileSync(".keys.json");
// convert the keysFile to a json object
const keys = JSON.parse(keysFile);

// encrypt the keys
keys.SUPABASE_URL_ENCRYPTED = encryptData(keys.SUPABASE_URL, key_1);
keys.SUPABASE_ANON_KEY_ENCRYPTED = encryptData(keys.SUPABASE_ANON_KEY, key_2);

keys.SUPABASE_URL_ENCRYPTION_KEY = key_1;
keys.SUPABASE_ANON_KEY_ENCRYPTION_KEY = key_2;

const envContent = `SUPABASE_URL_ENCRYPTED=${keys.SUPABASE_URL_ENCRYPTED}\n` +
    `SUPABASE_ANON_KEY_ENCRYPTED=${keys.SUPABASE_ANON_KEY_ENCRYPTED}\n` +
    `SUPABASE_URL_ENCRYPTION_KEY=${keys.SUPABASE_URL_ENCRYPTION_KEY}\n` +
    `SUPABASE_ANON_KEY_ENCRYPTION_KEY=${keys.SUPABASE_ANON_KEY_ENCRYPTION_KEY}`;

try {
    const existingContent = Deno.readTextFileSync(".env");
    Deno.writeTextFileSync(".env", existingContent + "\n" + envContent);
} catch {
    // If file doesn't exist, create it
    Deno.writeTextFileSync(".env", envContent);
}

console.log(".env file was created");
console.log("");
console.log(
    "If you plan to use github actions to create desktop builds with Tauri, you will need to set the secrets in github:",
);
console.log("");
console.log("run: gh secret set -f .env");
