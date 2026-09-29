import { Metadata } from "next"
import { company } from "@lib/config/company"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WhatsAppProductCTA from "@modules/common/components/whatsapp-product-cta"

export const metadata: Metadata = {
  title: "Sobre Nosotros | Control Nautas S.A.C. - Ingeniería e Instrumentación B2B",
  description:
    "Conozca a Control Nautas S.A.C., empresa peruana especializada en distribución de instrumentación industrial, automatización, calefacción eléctrica, trazado térmico y aislamiento.",
}

export default function NosotrosPage() {
  return (
    <div className="w-full bg-white text-[#1C242E] min-h-screen py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="text-xs text-neutral-500 mb-6 flex items-center gap-2">
          <LocalizedClientLink href="/" className="hover:underline">Inicio</LocalizedClientLink>
          <span>/</span>
          <span className="text-neutral-900 font-semibold">Nosotros</span>
        </div>

        {/* Hero Section */}
        <div className="border-b border-neutral-200 pb-10 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
            Perfil Corporativo
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4">
            Ingeniería, Instrumentación y Automatización para la Industria Peruana
          </h1>
          <p className="text-base text-neutral-600 max-w-3xl leading-relaxed">
            <strong>{company.legalName}</strong> (RUC: {company.taxId}) es una empresa peruana especializada en la provisión de soluciones integrales de instrumentación industrial, sistemas de automatización PLC/HMI, trazado térmico eléctrico, aislamiento térmico de alta temperatura y monitoreo ambiental para infraestructuras críticas.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="w-10 h-10 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-lg mb-4">
              🎯
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Nuestra Misión</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Garantizar la continuidad operativa y la eficiencia energética de las plantas industriales en el Perú, suministrando equipamiento de clase mundial con asesoría de ingeniería especializada de preventa y postventa.
            </p>
          </div>

          <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="w-10 h-10 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-lg mb-4">
              👁️
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Nuestra Visión</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Ser el referente técnico y comercial preferido por ingenieros de planta, integradores de sistemas y jefes de mantenimiento para el abastecimiento confiable de componentes de automatización y control térmico en el país.
            </p>
          </div>

          <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="w-10 h-10 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-lg mb-4">
              🛡️
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-2">Compromiso Técnico</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              No somos un revendedor genérico; respaldamos cada componente con fichas técnicas de fabricante, cálculos de dimensionamiento, garantía oficial y stock local para entregas ágiles en todo el Perú.
            </p>
          </div>
        </div>

        {/* Sectors Served */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Sectores Industriales que Atendemos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {[
              { icon: "⛏️", title: "Minería y Metalurgia", desc: "Trazado térmico anticongelante y sensores de alta resistencia." },
              { icon: "🐟", title: "Pesca y Harina", desc: "Aislamiento térmico de calderas y líneas de vapor con lana de roca." },
              { icon: "⚡", title: "Energía y Generación", desc: "Calefactores de estator y control de condensación en hidroeléctricas." },
              { icon: "🏢", title: "Data Centers y Banca", desc: "Monitoreo ambiental inteligente AKCP de temperatura y fugas." },
              { icon: "🏭", title: "Química y Petroquímica", desc: "Control de viscosidad de fluidos y equipos antiexplosión." },
              { icon: "🍞", title: "Alimentos y Bebidas", desc: "Data loggers para cadena de frío y transmisores sanitarios." },
              { icon: "❄️", title: "Refrigeración y HVAC", desc: "Espuma elastomérica y controladores PID de alta precisión." },
              { icon: "🌱", title: "Agroindustria", desc: "Sustratos hidropónicos minerales y ventilación industrial." },
            ].map((sector, i) => (
              <div key={i} className="p-4 border border-neutral-200 rounded bg-white hover:border-blue-500 transition-colors">
                <div className="text-xl mb-2">{sector.icon}</div>
                <div className="font-bold text-neutral-900 mb-1">{sector.title}</div>
                <div className="text-neutral-500 leading-normal">{sector.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Contact Banner */}
        <div className="p-8 bg-neutral-900 text-white rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2">¿Requiere asesoría técnica para un proyecto en planta?</h2>
            <p className="text-xs text-neutral-400 max-w-xl">
              Nuestros ingenieros le asistirán en el dimensionamiento exacto y selección del equipamiento adecuado para su aplicación.
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <LocalizedClientLink
              href="/contacto"
              className="bg-white text-neutral-900 hover:bg-neutral-100 font-bold text-xs px-5 py-3 rounded transition-colors"
            >
              Contactar Oficina
            </LocalizedClientLink>
            <WhatsAppProductCTA
              variant="primary"
              ctaLocation="contact"
              customText="Chatear con un Ingeniero"
            />
          </div>
        </div>

      </div>
    </div>
  )
}
