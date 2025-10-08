export const isEncryptedString = (str) => {
    if (typeof str !== 'string') return false;
    return str.length >= 16 && /^[A-Za-z0-9+/=]+$/.test(str) && str.length % 4 === 0;
};
