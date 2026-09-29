import nodemailer from "nodemailer"
import { company } from "@lib/config/company"

export interface OrderEmailData {
  orderId: string
  displayId?: string | number
  customerEmail: string
  customerName: string
  total: number
  currency: string
  items: Array<{
    title: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    address: string
    city: string
    province?: string
  }
  paymentMethod: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10)
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    const subject = `Confirmación de Pedido #${data.displayId || data.orderId.slice(-6)} - ${company.legalName}`

    const itemsHtml = data.items
      .map(
        (i) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.title}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">S/. ${(i.price * i.quantity).toFixed(2)}</td>
          </tr>`
      )
      .join("")

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background-color: #1C242E; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 22px;">CONTROL NAUTAS S.A.C.</h1>
          <p style="margin: 5px 0 0; font-size: 13px; color: #ABB0B6;">RUC ${company.taxId} • Especialistas en Instrumentación y Control</p>
        </div>

        <div style="padding: 24px 0; border-bottom: 1px solid #ddd;">
          <h2 style="color: #0F1111; font-size: 18px; margin-top: 0;">¡Gracias por su compra, ${data.customerName}!</h2>
          <p style="font-size: 14px; line-height: 1.5;">Su pedido <strong>#${data.displayId || data.orderId.slice(-6)}</strong> ha sido registrado exitosamente.</p>
        </div>

        <div style="padding: 16px 0;">
          <h3 style="font-size: 15px; margin-bottom: 12px;">Resumen del Pedido</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 8px; text-align: left;">Producto</th>
                <th style="padding: 8px; text-align: center;">Cant.</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; font-weight: bold; text-align: right;">Total:</td>
                <td style="padding: 12px 8px; font-weight: bold; text-align: right; color: #1E7E34; font-size: 16px;">S/. ${data.total.toFixed(2)} PEN</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="background-color: #f9f9f9; padding: 16px; border-radius: 6px; margin: 20px 0; font-size: 13px;">
          <h4 style="margin-top: 0; color: #1C242E;">Instrucciones para Transferencia Bancaria</h4>
          <p>Titular: <strong>${company.legalName}</strong> (RUC: ${company.taxId})</p>
          <p><strong>BCP Soles:</strong> 193-9483726-0-12 | CCI: 002-193-009483726012-14</p>
          <p><strong>BBVA Soles:</strong> 0011-0175-0100083921 | CCI: 011-175-000100083921-72</p>
          <p style="margin-bottom: 0;">Envíe su comprobante a <strong>${company.email}</strong> o al WhatsApp <strong>${company.phoneDisplay}</strong> indicando su número de pedido para iniciar el despacho.</p>
        </div>

        <div style="font-size: 12px; color: #666; text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
          <p>Atención al cliente: ${company.email} • ${company.phoneDisplay} • ${company.address}</p>
        </div>
      </div>
    `

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      await transporter.sendMail({
        from: `"${company.legalName}" <${smtpUser}>`,
        to: data.customerEmail,
        bcc: company.email,
        subject,
        html: htmlContent,
      })
      console.log(`[Email] Correo transaccional enviado con éxito a ${data.customerEmail} para pedido #${data.orderId}`)
    } else {
      console.log(`[Email] Simulación de correo transaccional (SMTP no configurado) para ${data.customerEmail} pedido #${data.orderId}`)
    }
    return { success: true }
  } catch (error) {
    console.error("[Email Error] Error enviando correo transaccional:", error)
    return { success: false, error }
  }
}
