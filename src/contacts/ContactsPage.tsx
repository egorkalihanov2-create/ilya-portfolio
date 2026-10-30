import { type FormEvent, useState } from "react";

function Header() {
  return (
    <header className="site-header">
      <nav aria-label="Main navigation">
        <a href="/main">Main</a>
        <a href="/about">About me</a>
        <a href="/cases">Cases</a>
        <a href="/contacts" aria-current="page">Contacts</a>
      </nav>
    </header>
  );
}

function ContactPill({
  className,
  href,
  download,
  children,
}: {
  className: string;
  href?: string;
  download?: string;
  children: string;
}) {
  if (!href) return <span className={`contacts-pill ${className}`}>{children}</span>;
  return (
    <a
      className={`contacts-pill ${className}`}
      href={href}
      download={download}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

export default function ContactsPage() {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [message, contact ? `Contact: ${contact}` : ""].filter(Boolean).join("\n\n");
    window.location.href = `mailto:novik.brand@gmail.com?subject=${encodeURIComponent("Portfolio enquiry")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="contacts-shell">
      <Header />
      <main className="contacts-flow">
        <section className="contacts-hero" aria-labelledby="contacts-title">
          <h1 id="contacts-title">Contacts</h1>

          <ContactPill
            className="contacts-pill--cv"
            href="./assets/documents/Ilya_Novik_CV_EN.pdf"
            download="Ilya_Novik_CV_EN.pdf"
          >
            View CV
          </ContactPill>
          <ContactPill className="contacts-pill--telegram" href="https://t.me/wilyam_the_originator">Write in Telegram</ContactPill>
          <ContactPill className="contacts-pill--email" href="mailto:novik.brand@gmail.com">Send me an email</ContactPill>
          <ContactPill className="contacts-pill--playstation" href="https://psnprofiles.com/McLover">PlayStation account</ContactPill>
          <ContactPill className="contacts-pill--chess" href="https://www.chess.com/member/McLover_from_Minsk">Chess.com account</ContactPill>

          <div className="contacts-portrait">
            <img src="./assets/figma/contacts/portrait-dog.jpeg" alt="Ilya taking a selfie with his dog" />
          </div>

          <form id="contact-form" className="contacts-form" onSubmit={submitMessage}>
            <label>
              <span className="sr-only">Your message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Or write right here..."
                required
              />
            </label>
            <label className="contacts-contact-field">
              <span className="sr-only">Your contact</span>
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="And send your contact..."
                required
              />
              <button type="submit" aria-label="Send message">
                <picture>
                  <source media="(max-width: 600px)" srcSet="./assets/figma/contacts/arrow-mobile.svg" />
                  <img src="./assets/figma/contacts/arrow.svg" alt="" />
                </picture>
              </button>
            </label>
          </form>
        </section>

        <a className="page-pill page-pill--dark contacts-main-link" href="/main">
          Go to<br />Main Page
        </a>

        <footer className="contacts-footer">
          <a href="mailto:novik.brand@gmail.com">novik.brand@gmail.com</a>
          <a href="https://t.me/wilyam_the_originator" target="_blank" rel="noreferrer">tg: @wilyam_the_originator</a>
        </footer>
      </main>
    </div>
  );
}
