import Script from "next/script"
import { company } from "@lib/config/company"

export default function GoogleTagManager() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || company.gtmId
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID || company.ga4Id || "G-71TVCYJE8P"

  return (
    <>
      {/* 1. Direct Google Analytics 4 (gtag.js) Stream */}
      {ga4Id && (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${ga4Id}', {
                  send_page_view: true
                });
              `,
            }}
          />
        </>
      )}

      {/* 2. Google Tag Manager Container */}
      {gtmId && (
        <>
          <Script
            id="gtm-base"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}
    </>
  )
}

