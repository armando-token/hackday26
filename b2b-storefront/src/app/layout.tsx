import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import GoogleTagManager from "@modules/layout/components/gtm"
import { company } from "@lib/config/company"
import WhatsAppFloatingLauncher from "@modules/common/components/whatsapp-floating-launcher"

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl || getBaseURL()),
  title: {
    default: "Control Nautas Perú | Instrumentación y Automatización Industrial B2B",
    template: "%s | Control Nautas B2B",
  },
  description:
    "Distribuidor e integrador en Perú de instrumentación industrial, controladores PLC/HMI, aislamiento térmico, calefacción eléctrica, sensores y monitoreo de procesos.",
  keywords: [
    "Control Nautas",
    "Instrumentación Industrial Perú",
    "Automatización PLC HMI",
    "Calefacción Eléctrica Industrial",
    "Lana de Roca Perú",
    "Heat Tracing Cables",
    "Sensores de Temperatura",
    "Novus Perú",
    "Horner Automation",
    "AKCP Datacenter",
  ],
  authors: [{ name: "CONTROL NAUTAS S.A.C." }],
  creator: "CONTROL NAUTAS S.A.C.",
  publisher: "CONTROL NAUTAS S.A.C.",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: company.siteUrl,
    title: "Control Nautas Perú | Catálogo y Soluciones de Ingeniería B2B",
    description:
      "Catálogo técnico B2B de instrumentación, aislamiento térmico, sensores, calefacción eléctrica y automatización industrial.",
    siteName: "Control Nautas",
    images: [
      {
        url: "/images/logo/control_nautas_logo_fondo_blanco.webp",
        width: 800,
        height: 250,
        alt: "Control Nautas - Instrumentación y Automatización Industrial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Control Nautas Perú | Instrumentación Industrial B2B",
    description:
      "Catálogo técnico de instrumentación, sensores, automatización y calefacción eléctrica.",
    images: ["/images/logo/control_nautas_logo_fondo_blanco.webp"],
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" data-mode="light">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Google tag (gtag.js) GA4 & Google Ads */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-71TVCYJE8P"
        />
        <script
          id="google-tag-init"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', 'G-71TVCYJE8P', { send_page_view: true });
              gtag('config', 'AW-11191602111');

              // Rastreo Automático Global de Conversiones B2B (WhatsApp, Llamadas y Cotizaciones)
              if (typeof window !== 'undefined') {
                document.addEventListener('click', function(e) {
                  var target = e.target && e.target.closest ? e.target.closest('a, button') : null;
                  if (!target) return;
                  var href = target.getAttribute('href') || '';
                  var text = (target.innerText || '').toLowerCase();

                  // 1. Clic en WhatsApp o Cotizar
                  if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp.com') !== -1) {
                    gtag('event', 'click_whatsapp_cotizar', {
                      event_category: 'ecommerce',
                      event_label: href,
                      value: 1.0,
                      currency: 'PEN'
                    });
                    gtag('event', 'generate_lead', {
                      event_category: 'whatsapp_b2b',
                      event_label: href,
                      value: 1.0,
                      currency: 'PEN'
                    });
                    gtag('event', 'conversion', {
                      send_to: 'AW-11191602111'
                    });
                    window.dataLayer.push({
                      event: 'click_whatsapp_cotizar',
                      lead_type: 'whatsapp',
                      url: href
                    });
                  }
                  // 2. Clic en Teléfono / Llamada
                  else if (href.indexOf('tel:') !== -1) {
                    gtag('event', 'contact', {
                      event_category: 'phone_call',
                      event_label: href
                    });
                    gtag('event', 'conversion', {
                      send_to: 'AW-11191602111'
                    });
                  }
                  // 3. Clic en botones de Cotizar
                  else if (text.indexOf('cotizar') !== -1 || text.indexOf('solicitar cotización') !== -1) {
                    gtag('event', 'click_whatsapp_cotizar', {
                      event_category: 'quote_intent'
                    });
                    gtag('event', 'begin_checkout', {
                      event_category: 'quote_intent'
                    });
                    window.dataLayer.push({
                      event: 'click_whatsapp_cotizar',
                      lead_type: 'quote_button'
                    });
                  }
                }, true);
              }
            `,
          }}
        />
        {/* Google Tag Manager Container */}
        <script
          id="gtm-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KZT9PCF');
            `,
          }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KZT9PCF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <main className="relative">{props.children}</main>
        {/* Modern WhatsApp Floating Launcher con animaciones radar, badge no leídos y mensajes B2B breves */}
        <WhatsAppFloatingLauncher />
      </body>
    </html>
  )
}
