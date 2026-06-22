import { describe, it, expect } from "vitest";
import { validarCPF, validarCNPJ, validarCpfCnpj } from "@/lib/validation/cpf-cnpj";

describe("validarCPF", () => {
  it("aceita CPF válido com máscara", () => {
    expect(validarCPF("529.982.247-25")).toBe(true);
  });

  it("aceita CPF válido sem máscara", () => {
    expect(validarCPF("52998224725")).toBe(true);
  });

  it("rejeita CPF com dígito verificador errado", () => {
    expect(validarCPF("529.982.247-24")).toBe(false);
  });

  it("rejeita sequências repetidas", () => {
    expect(validarCPF("111.111.111-11")).toBe(false);
    expect(validarCPF("000.000.000-00")).toBe(false);
  });

  it("rejeita tamanho incorreto", () => {
    expect(validarCPF("529.982.247")).toBe(false);
    expect(validarCPF("")).toBe(false);
  });
});

describe("validarCNPJ", () => {
  it("aceita CNPJ válido com máscara", () => {
    expect(validarCNPJ("11.222.333/0001-81")).toBe(true);
  });

  it("aceita CNPJ válido sem máscara", () => {
    expect(validarCNPJ("11222333000181")).toBe(true);
  });

  it("rejeita CNPJ com dígito verificador errado", () => {
    expect(validarCNPJ("11.222.333/0001-80")).toBe(false);
  });

  it("rejeita sequências repetidas", () => {
    expect(validarCNPJ("00.000.000/0000-00")).toBe(false);
  });

  it("rejeita tamanho incorreto", () => {
    expect(validarCNPJ("11.222.333/0001")).toBe(false);
    expect(validarCNPJ("")).toBe(false);
  });
});

describe("validarCpfCnpj", () => {
  it("usa CPF quando tipo é pf", () => {
    expect(validarCpfCnpj("529.982.247-25", "pf")).toBe(true);
    expect(validarCpfCnpj("11.222.333/0001-81", "pf")).toBe(false);
  });

  it("usa CNPJ quando tipo é pj", () => {
    expect(validarCpfCnpj("11.222.333/0001-81", "pj")).toBe(true);
    expect(validarCpfCnpj("529.982.247-25", "pj")).toBe(false);
  });
});
