import { Metadata } from "next"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { company } from "@lib/config/company"

export const metadata: Metadata = {
  title: "Términos y Políticas Legales | Control Nautas",
  description: "Políticas de privacidad, términos de uso, condiciones de venta y despacho de Control Nautas.",
  robots: {
    index: false,
    follow: false,
  },
}

const contentData: Record<string, { title: string; subtitle: string; content: string[] }> = {
  "privacy-policy": {
    title: "Política de Privacidad",
    subtitle: "Protección y tratamiento responsable de datos personales y corporativos.",
    content: [
      "En Control Nautas S.A.C., estamos comprometidos con la seguridad y confidencialidad de la información de nuestros clientes corporativos, ingenieros y usuarios de la plataforma.",
      "Los datos personales y de contacto recopilados (tales como nombres, correos electrónicos corporativos, números telefónicos y direcciones de entrega) son utilizados exclusivamente para la gestión de cotizaciones, procesamiento de pedidos, emisión de comprobantes de pago y entrega técnica de productos.",
      "Control Nautas no comercializa, transfiere ni cede bajo ninguna circunstancia los datos de nuestros usuarios a terceros sin consentimiento expreso previo, de acuerdo a la Ley de Protección de Datos Personales (Ley N° 29733 y D.S. 016-2024-JUS de la República del Perú).",
      "Usted puede ejercer en cualquier momento sus derechos de acceso, rectificación, cancelación u oposición (derechos ARCO) escribiéndonos a ventas@controlnautas.com o llamando al +51 950 302 141."
    ]
  },
  "terms-of-use": {
    title: "Términos y Condiciones de Uso",
    subtitle: "Lineamientos generales para el acceso y uso del catálogo técnico y plataforma B2B.",
    content: [
      "El acceso y uso de este sitio web y catálogo técnico están regulados por los presentes Términos y Condiciones. Al navegar o crear una cuenta corporativa en Control Nautas, usted acepta someterse a estas estipulaciones.",
      "Toda la información técnica, hojas de datos, diagramas y especificaciones publicadas en este catálogo tienen fines orientativos y de selección industrial. Control Nautas procura mantener la máxima exactitud en las fichas técnicas proporcionadas por los fabricantes.",
      "Los precios publicados en la plataforma corresponden a valores de referencia web en Soles (PEN) y pueden estar sujetos a confirmación de stock, volumen de compra y cotizaciones personalizadas de ingeniería.",
      "Queda prohibida la reproducción, duplicación o extracción no autorizada de contenidos, catálogos, imágenes o bases de datos de Control Nautas con fines comerciales de terceros."
    ]
  },
  "terms-of-sale": {
    title: "Términos y Condiciones de Venta",
    subtitle: "Condiciones comerciales, facturación, garantías y entregas de mercadería.",
    content: [
      "Todas las transacciones comerciales realizadas a través de la plataforma o mediante órdenes de compra son procesadas por Control Nautas S.A.C. (RUC 20610965807) con emisión de factura o boleta electrónica según corresponda.",
      "Los productos cuentan con garantía de fabricante contra defectos de manufactura, respaldada directamente por las marcas oficiales.",
      "Los despachos a nivel nacional se realizan a través de transporte calificado o agencias autorizadas, garantizando el embalaje adecuado para instrumentación electrónica y equipos industriales sensibles.",
      "Para devoluciones y cambios, el ítem debe encontrarse en su empaque original sin indicios de manipulación indebida ni energización fuera de los parámetros del fabricante."
    ]
  }
}

export default async function ContentPage(props: {
  params: Promise<{ countryCode: string; slug: string[] }>
}) {
  const params = await props.params
  const slugKey = (params.slug || []).join("/")
  const pageInfo = contentData[slugKey]

  if (!pageInfo) {
    notFound()
  }

  return (
    <div className="w-full bg-white font-[Arial,Helvetica,sans-serif] text-[#333333] min-h-screen py-10">
      <div className="max-w-[1000px] mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="text-[12px] text-[#666666] mb-6 flex items-center gap-2">
          <LocalizedClientLink href="/" className="text-[#0066CC] hover:underline">
            Inicio
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-[#333333] font-semibold">{pageInfo.title}</span>
        </div>

        {/* Title */}
        <div className="border-b border-[#CCCCCC] pb-6 mb-8">
          <h1 className="text-[28px] font-bold text-black uppercase tracking-wide">
            {pageInfo.title}
          </h1>
          <p className="text-[14px] text-[#666666] mt-2">
            {pageInfo.subtitle}
          </p>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-6 text-[14px] leading-relaxed text-[#444444] bg-[#FAFAFA] p-8 border border-[#E5E5E5]">
          {pageInfo.content.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-6 border-t border-[#CCCCCC] flex items-center justify-between">
          <LocalizedClientLink
            href="/store"
            className="text-[13px] font-bold text-[#0066CC] hover:underline"
          >
            ← Volver al Catálogo
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/contacto"
            className="text-[13px] font-bold text-[#0066CC] hover:underline"
          >
            Contactar a Soporte →
          </LocalizedClientLink>
        </div>

      </div>
    </div>
  )
}
