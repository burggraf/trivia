import * as forge from 'node-forge';

export function decryptData(encryptedData: string, hexKey: string): string {
    // Convert hex key to bytes
    const key = forge.util.hexToBytes(hexKey);
    const payload = forge.util.decode64(encryptedData);
    const ivLength = 12; // 96 bits
    const tagLength = 16; // 128 bits

    const iv = payload.slice(0, ivLength);
    const encrypted = payload.slice(ivLength, -tagLength);
    const tag = payload.slice(-tagLength);

    const decipher = forge.cipher.createDecipher('AES-GCM', forge.util.createBuffer(key));
    decipher.start({
        iv: forge.util.createBuffer(iv),
        tag: forge.util.createBuffer(tag)
    });
    decipher.update(forge.util.createBuffer(encrypted));
    const success = decipher.finish();

    if (success) {
        return decipher.output.toString();
    } else {
        throw new Error('Decryption failed');
    }
}
