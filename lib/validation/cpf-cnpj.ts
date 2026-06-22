/** Validação de CPF/CNPJ com cálculo de dígito verificador. Sem dependências externas. */

/** Valida um CPF (com ou sem máscara) calculando os dígitos verificadores. */
export function validarCPF(v: string): boolean {
  const cpf = (v ?? "").replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  // Rejeita sequências repetidas (000..., 111..., etc.).
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigito = (qtd: number): number => {
    let soma = 0;
    for (let i = 0; i < qtd; i++) {
      soma += Number(cpf[i]) * (qtd + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const dig1 = calcDigito(9);
  const dig2 = calcDigito(10);
  return dig1 === Number(cpf[9]) && dig2 === Number(cpf[10]);
}

/** Valida um CNPJ (com ou sem máscara) calculando os dígitos verificadores. */
export function validarCNPJ(v: string): boolean {
  const cnpj = (v ?? "").replace(/\D/g, "");
  if (cnpj.length !== 14) return false;
  // Rejeita sequências repetidas (00000000000000, etc.).
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigito = (qtd: number): number => {
    const pesos =
      qtd === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < qtd; i++) {
      soma += Number(cnpj[i]) * pesos[i];
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const dig1 = calcDigito(12);
  const dig2 = calcDigito(13);
  return dig1 === Number(cnpj[12]) && dig2 === Number(cnpj[13]);
}

/** Valida CPF ou CNPJ conforme o tipo do inquilino. */
export function validarCpfCnpj(v: string, tipo: "pf" | "pj"): boolean {
  return tipo === "pj" ? validarCNPJ(v) : validarCPF(v);
}
