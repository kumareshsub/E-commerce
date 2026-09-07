export function telHref(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  return digits ? `tel:+${digits}` : "tel:";
}

export function mailHref(email = "", subject = "Bigdots enquiry", body = "") {
  const q = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
    su: subject,
  });
  if (body) q.set("body", body);
  return `https://mail.google.com/mail/?${q.toString()}`;
}

export function waHref(phone = "") {
  return `https://wa.me/${String(phone).replace(/\D/g, "")}`;
}

export function payBadge(status) {
  if (status === "paid") return "Paid";
  if (status === "refunded") return "Refunded";
  if (status === "failed") return "Failed";
  return "Pending";
}
