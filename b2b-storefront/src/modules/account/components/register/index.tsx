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
        Crear Account Corporativa
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Register with Control Nautas for engineering pricing, online quotes, and B2B order tracking.
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
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
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
          Al crear una account, aceptas la{" "}
          <LocalizedClientLink
            href="/politica-de-privacidad"
            className="underline font-semibold"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          y los{" "}
          <LocalizedClientLink
            href="/terminos-y-condiciones"
            className="underline font-semibold"
          >
            Terms & Conditions
          </LocalizedClientLink>{" "}
          de Control Nautas.
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Crear Account
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already have an account?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline font-semibold"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
