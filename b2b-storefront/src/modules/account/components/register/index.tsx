"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/layout/components/logo"
import { signup } from "@lib/data/customer"

import AltchaWidget from "@modules/common/components/altcha"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <Logo theme="light" variant="auth" className="mb-4" />
      <h1 className="text-large-semi uppercase mb-6">
        Crear Cuenta Corporativa
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Regístrate en Control Nautas para acceder a precios de ingeniería, cotizaciones en línea y seguimiento de pedidos B2B.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Nombre"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Apellido"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Correo electrónico"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Teléfono"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Contraseña"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
          <AltchaWidget auto="onload" />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          Al crear una cuenta, aceptas la{" "}
          <LocalizedClientLink
            href="/politica-de-privacidad"
            className="underline font-semibold"
          >
            Política de Privacidad
          </LocalizedClientLink>{" "}
          y los{" "}
          <LocalizedClientLink
            href="/terminos-y-condiciones"
            className="underline font-semibold"
          >
            Términos y Condiciones
          </LocalizedClientLink>{" "}
          de Control Nautas.
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Crear Cuenta
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        ¿Ya tienes una cuenta?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline font-semibold"
        >
          Iniciar sesión
        </button>
        .
      </span>
    </div>
  )
}

export default Register
