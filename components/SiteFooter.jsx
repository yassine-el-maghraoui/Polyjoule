export default function SiteFooter() {
  return (
    <footer className="site-footer py-4 mt-auto">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <p className="mb-0 small">&copy; {new Date().getFullYear()} Polyjoule. Tous droits réservés.</p>
        <ul className="list-unstyled d-flex gap-3 mb-0">
          <li>
            <a href="https://www.facebook.com/polyjoule" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/polyjoule?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </li>
          <li>
            <a href="https://www.linkedin.com/company/polyjoule/" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
