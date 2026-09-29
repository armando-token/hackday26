"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { company } from "@lib/config/company"
import { leafImage } from "@lib/cn-catalog"
import type { CnCategoryNode } from "@lib/cn-catalog/taxonomy"

const SENSOR_SUBCATEGORIES = [
  {
    name: "Sensores de Temperatura",
    slug: "temperatura-termopar-rtd",
    count: 32,
    img: "/cn-media/categories/temperatura-termopar-rtd.webp",
  },
  {
    name: "Transmisores de Temperatura",
    slug: "transmisores-temperatura",
    count: 10,
    img: "/cn-media/categories/transmisores-temperatura.webp",
  },
  {
    name: "Humedad y Temperatura",
    slug: "humedad-temperatura",
    count: 19,
    img: "/cn-media/categories/humedad-temperatura.webp",
  },
  {
    name: "Presión y Melt Pressure",
    slug: "presion-proceso",
    count: 11,
    img: "/cn-media/categories/presion-proceso.webp",
  },
  {
    name: "Gases Industriales y CO₂",
    slug: "gases-co2",
    count: 32,
    img: "/cn-media/categories/gases-co2.webp",
  },
  {
    name: "Sensores de Nivel y Proximidad",
    slug: "nivel",
    count: 5,
    img: "/cn-media/categories/nivel.webp",
  },
  {
    name: "Accesorios y Termopozos",
    slug: "accesorios-sensores",
    count: 22,
    img: "/cn-media/categories/accesorios-sensores.webp",
  },
]

export default function SensorsHub({
  category,
}: {
  category?: CnCategoryNode
} = {}) {
  const whatsappUrl = `https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(
    "Hola Control Nautas, requiero asesoría técnica para la selección y cotización de sensores y transmisores industriales."
  )}`

  const totalCount = SENSOR_SUBCATEGORIES.reduce((a, b) => a + b.count, 0)

  return (
    <div className="w-full font-[Arial,Helvetica,sans-serif] text-[#333]">
      {/* Category Header */}
      <div className="mb-4">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#0F1111] mb-1">
          Sensores y Transmisores Industriales
        </h1>
        <p className="text-[12px] sm:text-[13px] text-[#666]">
          Disponibles {totalCount} productos industriales
        </p>
      </div>

      {/* ========================================================================= */}
      {/* CLEAN SUBCATEGORY TILES (HOMEPAGE PARITY: IMAGE + TITLE + DIRECT 1-CLICK)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 mb-12">
        {SENSOR_SUBCATEGORIES.map((sub) => {
          const childCategory = category?.children?.find((c) => c.slug === sub.slug)
          const imgSrc =
            childCategory?.imageUrl || leafImage(childCategory || sub.slug) || sub.img

          return (
            <LocalizedClientLink
              key={sub.slug}
              href={`/store/sensores-transmisores/${sub.slug}`}
              className="bg-white border border-[#E0E0E0] -ml-px -mt-px p-3 sm:p-4 min-h-[195px] flex flex-col items-center justify-between hover:border-[#0066CC] hover:z-10 relative transition-colors group cursor-pointer"
            >
              <div className="w-full h-[135px] sm:h-[145px] mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src={imgSrc}
                  alt={sub.name}
                  className="max-h-[130px] sm:max-h-[140px] max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <span className="text-[13px] sm:text-[13.5px] font-bold text-[#0066CC] group-hover:underline text-center leading-snug mt-auto">
                {sub.name}
              </span>
              <span className="text-[11px] text-[#666] mt-1 font-normal">
                {childCategory?.productCount ?? sub.count} productos
              </span>
            </LocalizedClientLink>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* SELECTION GUIDE TABLE: GUÍA TÉCNICA DE SELECCIÓN POR VARIABLE             */}
      {/* ========================================================================= */}
      <div className="mb-12 bg-[#F8F9FA] border border-[#D5D9D9] p-5 sm:p-6 rounded-sm">
        <div className="mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0066CC]">
            CRITERIO DE INGENIERÍA
          </span>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#0F1111]">
            Guía de Selección por Variable de Proceso
          </h2>
          <p className="text-[12.5px] sm:text-[13px] text-[#565959]">
            Identifique la tecnología adecuada según las condiciones operativas de su aplicación:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[12.5px]">
          {/* GUIDE BOX 1 */}
          <div className="bg-white p-4 border border-[#E0E0E0] rounded-xs">
            <div className="font-bold text-[#0F1111] text-[14px] mb-2 flex items-center gap-1.5">
              <span>🌡️</span>
              <span>Temperatura (°C)</span>
            </div>
            <ul className="space-y-2 text-[#444] text-[12px]">
              <li>
                <b>Hasta 400°C (Alta precisión):</b> Use <LocalizedClientLink href="/store/sensores-transmisores/temperatura-termopar-rtd" className="text-[#0066CC] hover:underline font-medium">RTD Pt100 a 3 hilos</LocalizedClientLink> (±0.15°C).
              </li>
              <li>
                <b>Hasta 1200°C (Hornos / Calderas):</b> Use <LocalizedClientLink href="/store/sensores-transmisores/temperatura-termopar-rtd" className="text-[#0066CC] hover:underline font-medium">Termopares Tipo K / J</LocalizedClientLink>.
              </li>
              <li>
                <b>Salida a PLC (4-20mA):</b> Integre transmisor <LocalizedClientLink href="/store/sensores-transmisores/transmisores-temperatura" className="text-[#0066CC] hover:underline font-medium">TxBlock-USB</LocalizedClientLink>.
              </li>
            </ul>
          </div>

          {/* GUIDE BOX 2 */}
          <div className="bg-white p-4 border border-[#E0E0E0] rounded-xs">
            <div className="font-bold text-[#0F1111] text-[14px] mb-2 flex items-center gap-1.5">
              <span>💧</span>
              <span>Humedad & Clima</span>
            </div>
            <ul className="space-y-2 text-[#444] text-[12px]">
              <li>
                <b>Salas limpias y almacenes:</b> Transmisor de pared <LocalizedClientLink href="/store/sensores-transmisores/humedad-temperatura" className="text-[#0066CC] hover:underline font-medium">RHT Climate WM</LocalizedClientLink>.
              </li>
              <li>
                <b>Ductos de climatización HVAC:</b> Transmisor de vástago <LocalizedClientLink href="/store/sensores-transmisores/humedad-temperatura" className="text-[#0066CC] hover:underline font-medium">RHT Climate DM</LocalizedClientLink>.
              </li>
              <li>
                <b>Ambientes agresivos:</b> Sondas Novus RHT-P10 con brida de acero inoxidable.
              </li>
            </ul>
          </div>

          {/* GUIDE BOX 3 */}
          <div className="bg-white p-4 border border-[#E0E0E0] rounded-xs">
            <div className="font-bold text-[#0F1111] text-[14px] mb-2 flex items-center gap-1.5">
              <span>⏲️</span>
              <span>Presión & Vacío</span>
            </div>
            <ul className="space-y-2 text-[#444] text-[12px]">
              <li>
                <b>Filtros y HVAC (Baja Presión):</b> Transmisor diferencial <LocalizedClientLink href="/store/sensores-transmisores/presion-proceso" className="text-[#0066CC] hover:underline font-medium">EMS BT-3X1 / BT-4X1</LocalizedClientLink> (±50 Pa).
              </li>
              <li>
                <b>Extrusión de Polímeros:</b> Transductor <LocalizedClientLink href="/store/sensores-transmisores/presion-proceso" className="text-[#0066CC] hover:underline font-medium">Melt Pressure NaK MPI</LocalizedClientLink> hasta 400°C.
              </li>
              <li>
                <b>Inspección en terreno:</b> Manómetro digital portátil BS-412.
              </li>
            </ul>
          </div>

          {/* GUIDE BOX 4 */}
          <div className="bg-white p-4 border border-[#E0E0E0] rounded-xs">
            <div className="font-bold text-[#0F1111] text-[14px] mb-2 flex items-center gap-1.5">
              <span>🧪</span>
              <span>Gases & Seguridad SST</span>
            </div>
            <ul className="space-y-2 text-[#444] text-[12px]">
              <li>
                <b>Calidad de aire y oficinas:</b> Transmisores <LocalizedClientLink href="/store/sensores-transmisores/gases-co2" className="text-[#0066CC] hover:underline font-medium">CO₂ NDIR EMS KT-3X1</LocalizedClientLink>.
              </li>
              <li>
                <b>Refrigeración y Frigoríficos:</b> Transmisor de amoníaco <LocalizedClientLink href="/store/sensores-transmisores/gases-co2" className="text-[#0066CC] hover:underline font-medium">EMS AT-3XX (NH₃)</LocalizedClientLink>.
              </li>
              <li>
                <b>Monitoreo móvil de operarios:</b> Detectores portátiles de mano <LocalizedClientLink href="/store/sensores-transmisores/gases-co2" className="text-[#0066CC] hover:underline font-medium">Serie KS/AS</LocalizedClientLink>.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TECHNICAL ADVICE CALL TO ACTION BANNER                                    */}
      {/* ========================================================================= */}
      <div className="bg-[#131921] text-white p-6 sm:p-8 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[#FF9900] text-[12px] font-bold uppercase tracking-wider mb-2">
            <span>📞 ASESORÍA DE INGENIERÍA EN PLANTA</span>
          </div>
          <h3 className="text-[20px] sm:text-[22px] font-bold text-white mb-2">
            ¿Necesita dimensionar un sensor, termopozo o transmisor para su proceso?
          </h3>
          <p className="text-[13px] sm:text-[14px] text-[#CCCCCC] max-w-2xl leading-relaxed">
            Nuestros ingenieros especialistas le asisten en la selección del tipo de sensor, longitud de vástago, rosca a proceso, tiempo de respuesta y compatibilidad de señal con su PLC o registrador.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-[13px] rounded-sm transition-colors shadow-sm"
          >
            <span>💬 Cotizar por WhatsApp</span>
          </a>
          <a
            href={`tel:${company.phoneE164}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#232F3E] hover:bg-[#2C3B4E] border border-[#485769] text-white font-bold text-[13px] rounded-sm transition-colors"
          >
            <span>Tel: {company.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
