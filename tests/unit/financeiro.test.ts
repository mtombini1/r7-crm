import { describe, it, expect, vi, afterEach } from "vitest";
import {
  competenciaLabel,
  calcularVencimento,
  isVencido,
} from "@/lib/financeiro/competencias";

describe("competenciaLabel", () => {
  it("formata o 1º dia do mês como MM/yyyy", () => {
    expect(competenciaLabel("2026-06-01")).toBe("06/2026");
  });

  it("formata janeiro corretamente", () => {
    expect(competenciaLabel("2026-01-01")).toBe("01/2026");
  });

  it("ignora o dia da competência", () => {
    expect(competenciaLabel("2026-12-15")).toBe("12/2026");
  });
});

describe("calcularVencimento", () => {
  it("usa o dia informado no mês da competência", () => {
    expect(calcularVencimento("2026-06-01", 10)).toBe("2026-06-10");
  });

  it("preserva o mês mesmo com dia de um dígito", () => {
    expect(calcularVencimento("2026-01-01", 5)).toBe("2026-01-05");
  });

  it("faz clamp para 28 quando o dia é maior", () => {
    expect(calcularVencimento("2026-02-01", 31)).toBe("2026-02-28");
    expect(calcularVencimento("2026-06-01", 30)).toBe("2026-06-28");
  });

  it("faz clamp para 1 quando o dia é menor que 1", () => {
    expect(calcularVencimento("2026-06-01", 0)).toBe("2026-06-01");
    expect(calcularVencimento("2026-06-01", -5)).toBe("2026-06-01");
  });

  it("trunca dias fracionários", () => {
    expect(calcularVencimento("2026-06-01", 10.9)).toBe("2026-06-10");
  });
});

describe("isVencido", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna false quando o status não é pendente", () => {
    expect(isVencido("2020-01-01", "pago")).toBe(false);
    expect(isVencido("2020-01-01", "cancelado")).toBe(false);
  });

  it("retorna true quando pendente e vencimento no passado", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-21T12:00:00-03:00"));
    expect(isVencido("2026-06-10", "pendente")).toBe(true);
  });

  it("retorna true quando pendente e vencimento é hoje", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-21T12:00:00-03:00"));
    expect(isVencido("2026-06-21", "pendente")).toBe(true);
  });

  it("retorna false quando pendente e vencimento no futuro", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-21T12:00:00-03:00"));
    expect(isVencido("2026-07-01", "pendente")).toBe(false);
  });
});
