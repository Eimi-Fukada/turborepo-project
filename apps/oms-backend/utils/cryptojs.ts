import CryptoJS from 'crypto-js'

// 解密
export function decrypt(encryptedData: string) {
  const initkey = 'vu9fwn6jy8gimpeh'
  const key = CryptoJS.enc.Utf8.parse(initkey)
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  const plaintext = decrypted.toString(CryptoJS.enc.Utf8)
  return plaintext
}

// 加密
export function encrypt(plaintext: string) {
  const KEY = CryptoJS.enc.Utf8.parse('vu9fwn6jy8gimpeh')
  const ciphertext = CryptoJS.AES.encrypt(plaintext, KEY, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString()
  return ciphertext
}
