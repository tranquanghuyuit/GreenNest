import { config } from "../config.js";

function normalizeTransferContent(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function buildVietqrTransferContent(orderCode: string) {
  return normalizeTransferContent(`${config.vietqrTransferPrefix} ${orderCode}`);
}

export function buildVietqrImageUrl(amount: number, transferContent: string) {
  const bankId = encodeURIComponent(config.vietqrBankId.trim());
  const accountNo = encodeURIComponent(config.vietqrAccountNo.trim());
  const template = encodeURIComponent(config.vietqrTemplate.trim() || "compact2");
  const query = new URLSearchParams({
    amount: String(Math.round(amount)),
    addInfo: transferContent,
    accountName: config.vietqrAccountName.trim()
  });

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?${query.toString()}`;
}
