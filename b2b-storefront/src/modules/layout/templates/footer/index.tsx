import Logo from "@modules/layout/components/logo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { company } from "@lib/config/company"

export default async function Footer() {
  return (
    <footer className="w-full mt-auto select-none font-[Roboto,Arial,Helvetica,sans-serif] bg-[#1C242E] text-white">
      {/* Main Footer Content */}
      <div className="py-12 px-6 border-b border-[#2A3441]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Identidad Corporativa */}
          <div className="flex flex-col space-y-4">
            <Logo theme="dark" variant="footer" className="-ml-1" />
            <p className="text-[13px] text-[#ABB0B6] leading-relaxed">
              Industrial instrumentation distributor and integrator — PLC/HMI controllers, thermal insulation, heat tracing, and electric heating.
            </p>
            <div className="text-[12px] text-[#ABB0B6] space-y-1 pt-2">
              <p><strong className="text-white">Legal name:</strong> {company.legalName}</p>
              <p><strong className="text-white">Tax ID:</strong> {company.taxId}</p>
              <p><strong className="text-white">Location:</strong> {company.address}</p>
            </div>
          </div>

          {/* Col 2: Company & Solutions */}
          <div className="flex flex-col">
            <h4 className="font-bold text-[14px] text-white uppercase mb-4 tracking-wider">
              Company & Solutions
            </h4>
            <div className="flex flex-col space-y-2.5 text-[13px] text-[#ABB0B6]">
              <LocalizedClientLink href="/nosotros" className="hover:text-white hover:underline transition-colors">
                About Us
              </LocalizedClientLink>
              <LocalizedClientLink href="/casos-de-exito" className="hover:text-white hover:underline transition-colors">
                Case Studies
              </LocalizedClientLink>
              <LocalizedClientLink href="/store" className="hover:text-white hover:underline transition-colors">
                Product Catalog
              </LocalizedClientLink>
              <LocalizedClientLink href="/store/aislamiento-termico" className="hover:text-white hover:underline transition-colors">
                Thermal Insulation
              </LocalizedClientLink>
              <LocalizedClientLink href="/store/automatizacion-plc-hmi" className="hover:text-white hover:underline transition-colors">
                PLC & HMI Automation
              </LocalizedClientLink>
              <LocalizedClientLink href="/store/calefaccion-electrica" className="hover:text-white hover:underline transition-colors">
                Industrial Electric Heating
              </LocalizedClientLink>
            </div>
          </div>

          {/* Col 3: Compra, Soporte y Shippings */}
          <div className="flex flex-col">
            <h4 className="font-bold text-[14px] text-white uppercase mb-4 tracking-wider">
              Buy & B2B Support
            </h4>
            <div className="flex flex-col space-y-2.5 text-[13px] text-[#ABB0B6]">
              <LocalizedClientLink href="/contacto" className="hover:text-white hover:underline transition-colors">
                Request Quote (RFQ)
              </LocalizedClientLink>
              <LocalizedClientLink href="/entregas-y-devoluciones" className="hover:text-white hover:underline transition-colors">
                Shipping & Returns
              </LocalizedClientLink>
              <LocalizedClientLink href="/terminos-y-condiciones" className="hover:text-white hover:underline transition-colors">
                Terms & Conditions of Sale
              </LocalizedClientLink>
              <LocalizedClientLink href="/politica-de-privacidad" className="hover:text-white hover:underline transition-colors">
                Privacy Policy
              </LocalizedClientLink>
              <LocalizedClientLink href="/cart" className="hover:text-white hover:underline transition-colors">
                View Cart
              </LocalizedClientLink>
            </div>
          </div>

          {/* Col 4: Contact Oficial y Medios de Pago */}
          <div className="flex flex-col">
            <h4 className="font-bold text-[14px] text-white uppercase mb-4 tracking-wider">
              Customer Service
            </h4>
            <div className="flex flex-col space-y-3 text-[13px] text-[#ABB0B6] mb-5">
              <div className="p-3.5 bg-[#25313F] rounded border border-[#384657]">
                <div className="text-[11px] uppercase font-bold text-gray-400 mb-1">Sales & WhatsApp</div>
                <a
                  href={`tel:${company.phoneE164}`}
                  className="text-white font-bold text-[15px] hover:text-blue-400 block"
                >
                  {company.phoneDisplay}
                </a>
                <a
                  href={`mailto:${company.email}`}
                  className="text-blue-300 text-[12px] hover:underline block mt-1"
                >
                  {company.email}
                </a>
              </div>
              <div className="text-[12px]">
                <span className="text-white font-semibold block">Business hours:</span>
                {company.hours}
              </div>
            </div>

            <a
              href={company.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-[13px] px-4 py-2.5 rounded transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>

        </div>

        {/* Payment Methods and Dispatch Transparency Bar (Required by GMC) */}
        <div className="max-w-[1440px] mx-auto mt-8 pt-6 border-t border-[#2A3441] flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[#ABB0B6]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white uppercase text-[11px] tracking-wider">Payment methods:</span>
            <span className="bg-[#25313F] px-2.5 py-1 rounded border border-[#384657] text-white font-semibold">🏦 Bank transfer</span>
            <span className="bg-[#25313F] px-2.5 py-1 rounded border border-[#384657] text-white font-semibold">📱 Corporate payment</span>
            <span className="bg-[#25313F] px-2.5 py-1 rounded border border-[#384657] text-white font-semibold">📄 Electronic invoice</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-white uppercase text-[11px] tracking-wider">Fulfillment:</span>
            <span className="bg-[#25313F] px-2.5 py-1 rounded border border-[#384657] text-white font-semibold">🚚 Standard courier</span>
            <span className="bg-[#25313F] px-2.5 py-1 rounded border border-[#384657] text-white font-semibold">🏬 Pickup by arrangement</span>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar (Black #11161D) */}
      <div className="bg-[#11161D] text-[#8C939C] py-5 px-6 text-[12px]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <LocalizedClientLink href="/nosotros" className="hover:text-white hover:underline">
              About Us
            </LocalizedClientLink>
            <span>•</span>
            <LocalizedClientLink href="/contacto" className="hover:text-white hover:underline">
              Contact
            </LocalizedClientLink>
            <span>•</span>
            <LocalizedClientLink href="/entregas-y-devoluciones" className="hover:text-white hover:underline">
              Shipping & Delivery
            </LocalizedClientLink>
            <span>•</span>
            <LocalizedClientLink href="/terminos-y-condiciones" className="hover:text-white hover:underline">
              Terms of Sale
            </LocalizedClientLink>
            <span>•</span>
            <LocalizedClientLink href="/politica-de-privacidad" className="hover:text-white hover:underline">
              Privacy Policy
            </LocalizedClientLink>
          </div>
          <div>
            © {new Date().getFullYear()} {company.legalName} • Tax ID {company.taxId} • All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
