export function encodeEmail(email: string): string {
  return btoa([...email].reverse().join(""));
}

export function decodeEmail(encoded: string): string {
  return atob(encoded).split("").reverse().join("");
}

export function obfuscateEmailHuman(email: string): string {
  return email.replace("@", " [at] ").replace(/\./g, " [dot] ");
}
