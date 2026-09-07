import { Link } from "react-router-dom";
import { mailHref, telHref, waHref } from "../contact";
import { useApp } from "../context";

export default function Contact() {
  const { site } = useApp();
  return (
    <div className="container section">
      <h2>Talk to Bigdots</h2>
      <p className="muted">Call, email or chat with us. We reply during store hours 9am – 8pm IST.</p>
      <div className="contact-grid">
        <a className="contact-tile" href={telHref(site.phone)} target="_blank" rel="noreferrer">
          <span>Call</span>
          <strong>{site.phone}</strong>
          <p>Speak to support for orders and returns.</p>
        </a>
        <a className="contact-tile" href={mailHref(site.email, "Bigdots support")} target="_blank" rel="noreferrer">
          <span>Email</span>
          <strong>{site.email}</strong>
          <p>Send product or delivery questions.</p>
        </a>
        <a className="contact-tile" href={waHref(site.whatsapp)} target="_blank" rel="noreferrer">
          <span>WhatsApp</span>
          <strong>+{site.whatsapp}</strong>
          <p>Chat with the store team.</p>
        </a>
      </div>
      <p className="muted">{site.address}</p>
      <Link to="/shop" className="btn btn-blue" style={{ marginTop: 16 }}>Continue shopping</Link>
    </div>
  );
}
