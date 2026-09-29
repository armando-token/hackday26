import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Logo from "@modules/layout/components/logo"
import { useActionState } from "react"

import AltchaWidget from "@modules/common/components/altcha"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <Logo theme="light" variant="auth" className="mb-4" />
      <h1 className="text-large-semi uppercase mb-6">Iniciar Sesión</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Accede a tu cuenta corporativa para gestionar tus cotizaciones, pedidos y precios técnicos B2B.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            title="Ingresa un correo electrónico válido."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
          <AltchaWidget auto="onload" />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Iniciar sesión
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        ¿No tienes una cuenta corporativa?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline font-semibold"
          data-testid="register-button"
        >
          Regístrate aquí
        </button>
        .
      </span>
    </div>
  )
}

export default Login
