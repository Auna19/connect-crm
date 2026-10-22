import "./globals.css";

export const metadata = {
  title: "ConnectCRM — CRM, Integrations & QA Testing Platform",
  description: "Enterprise CRM platform with omnichannel helpdesk, order tracking, webhook integrations, AES-256 encrypted connector management, and QA Integration Test Lab.",
  keywords: "CRM, integrations, QA testing, helpdesk, order tracking, webhooks, API testing"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
