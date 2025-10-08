// encryptionService.js
class EncryptionService {
    constructor() {
        this.SALT_LENGTH = 16;
        this.KEY_LENGTH = 32;
        this.IV_LENGTH = 12;
        this.ITERATIONS = 100000;
    }

    async generateDataKey() {
        return window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    async deriveKeyFromPassword(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: this.ITERATIONS,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }

    generateSalt() {
        return window.crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    }

    async encryptData(data, dataKey) {
        const encoder = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            dataKey,
            encoder.encode(data)
        );

        const result = new Uint8Array(iv.length + encrypted.byteLength);
        result.set(iv, 0);
        result.set(new Uint8Array(encrypted), iv.length);

        return this.arrayBufferToBase64(result);
    }

    async decryptData(encryptedData, dataKey) {
        const data = this.base64ToArrayBuffer(encryptedData);
        const iv = data.slice(0, this.IV_LENGTH);
        const encrypted = data.slice(this.IV_LENGTH);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            dataKey,
            encrypted
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }

    async encryptDataKey(dataKey, kek) {
        const exportedKey = await window.crypto.subtle.exportKey("raw", dataKey);
        const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            kek,
            exportedKey
        );

        const result = new Uint8Array(iv.length + encrypted.byteLength);
        result.set(iv, 0);
        result.set(new Uint8Array(encrypted), iv.length);

        return this.arrayBufferToBase64(result);
    }

    async decryptDataKey(encryptedDataKey, kek) {
        const data = this.base64ToArrayBuffer(encryptedDataKey);
        const iv = data.slice(0, this.IV_LENGTH);
        const encrypted = data.slice(this.IV_LENGTH);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            kek,
            encrypted
        );

        return window.crypto.subtle.importKey(
            "raw",
            decrypted,
            { name: "AES-GCM" },
            true,
            ["encrypt", "decrypt"]
        );
    }

    async exportKey(key) {
        const exported = await window.crypto.subtle.exportKey("raw", key);
        return this.arrayBufferToBase64(exported);
    }

    async importKey(exportedKey) {
        const keyData = this.base64ToArrayBuffer(exportedKey);
        return window.crypto.subtle.importKey(
            "raw",
            keyData,
            { name: "AES-GCM" },
            true,
            ["encrypt", "decrypt"]
        );
    }

    arrayBufferToBase64(buffer) {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)));
    }

    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    uint8ArrayToHex(uint8Array) {
        return Array.from(uint8Array)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    hexToUint8Array(hex) {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }
}

export default new EncryptionService();
