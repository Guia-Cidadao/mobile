/**
 * Validações de formulário espelhando as regras do backend
 * (`UserRequestDTO`, `LoginRequestDTO` e `ServicoRequestDTO`).
 * Cada função retorna a mensagem de erro ou `undefined` quando válido.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_SPECIAL_CHARS = /[@#$%^&+=!]/;

export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 100;
export const PASSWORD_MIN_LENGTH = 6;
export const SERVICE_TEXT_MAX_LENGTH = 255;

export function validateRequired(value: string, fieldLabel: string): string | undefined {
  return value.trim().length === 0 ? `${fieldLabel} é obrigatório.` : undefined;
}

export function validateEmail(value: string): string | undefined {
  if (value.trim().length === 0) {
    return 'Informe seu e-mail.';
  }
  return EMAIL_REGEX.test(value.trim()) ? undefined : 'Informe um e-mail válido.';
}

export function validateName(value: string): string | undefined {
  const length = value.trim().length;
  if (length === 0) {
    return 'Informe seu nome de usuário.';
  }
  if (length < NAME_MIN_LENGTH || length > NAME_MAX_LENGTH) {
    return `O nome deve ter entre ${NAME_MIN_LENGTH} e ${NAME_MAX_LENGTH} caracteres.`;
  }
  return undefined;
}

/** Regras de senha forte exigidas pelo backend no cadastro/atualização. */
export function validateStrongPassword(value: string): string | undefined {
  if (value.length === 0) {
    return 'Informe uma senha.';
  }
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (!/[0-9]/.test(value) || !/[A-Z]/.test(value) || !PASSWORD_SPECIAL_CHARS.test(value)) {
    return 'A senha deve conter um número, uma letra maiúscula e um caractere especial (@#$%^&+=!).';
  }
  return undefined;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  if (confirmation.length === 0) {
    return 'Confirme sua senha.';
  }
  return password === confirmation ? undefined : 'As senhas não coincidem.';
}

export interface PasswordRule {
  label: string;
  isMet: boolean;
}

/** Usado para exibir o checklist visual de força de senha. */
export function getPasswordRules(value: string): PasswordRule[] {
  return [
    {
      label: `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`,
      isMet: value.length >= PASSWORD_MIN_LENGTH,
    },
    { label: 'Uma letra maiúscula', isMet: /[A-Z]/.test(value) },
    { label: 'Um número', isMet: /[0-9]/.test(value) },
    { label: 'Um caractere especial (@#$%^&+=!)', isMet: PASSWORD_SPECIAL_CHARS.test(value) },
  ];
}

/** Retorna `true` se nenhum campo do objeto de erros possui mensagem. */
export function hasNoErrors<T extends object>(errors: T): boolean {
  return Object.values(errors).every((message) => !message);
}
