import { describe, it, expect } from "vitest";
import { labelMarco, labelTipoContratual, severidadeMarco } from "@/lib/alertas/marcos";

describe("labelMarco", () => {
  it("rotula cada marco em pt-BR", () => {
    expect(labelMarco("30")).toBe("Vence em 30 dias");
    expect(labelMarco("15")).toBe("Vence em 15 dias");
    expect(labelMarco("7")).toBe("Vence em 7 dias");
    expect(labelMarco("1")).toBe("Vence em 1 dia");
    expect(labelMarco("vencido")).toBe("Vencido");
  });

  it("usa singular para 1 dia", () => {
    expect(labelMarco("1")).toContain("1 dia");
    expect(labelMarco("1")).not.toContain("dias");
  });

  it("retorna travessão para valores desconhecidos/nulos", () => {
    expect(labelMarco(null)).toBe("—");
    expect(labelMarco(undefined)).toBe("—");
    expect(labelMarco("99")).toBe("—");
  });
});

describe("labelTipoContratual", () => {
  it("rotula cada tipo contratual em pt-BR", () => {
    expect(labelTipoContratual("reajuste")).toBe("Reajuste");
    expect(labelTipoContratual("renovacao")).toBe("Renovação");
    expect(labelTipoContratual("desconto")).toBe("Encerramento de desconto");
  });

  it("retorna travessão para valores desconhecidos/nulos", () => {
    expect(labelTipoContratual(null)).toBe("—");
    expect(labelTipoContratual(undefined)).toBe("—");
    expect(labelTipoContratual("outro")).toBe("—");
  });
});

describe("severidadeMarco", () => {
  it("trata vencido e 1 dia como destructive", () => {
    expect(severidadeMarco("vencido")).toBe("destructive");
    expect(severidadeMarco("1")).toBe("destructive");
  });

  it("trata 7 e 15 dias como warning", () => {
    expect(severidadeMarco("7")).toBe("warning");
    expect(severidadeMarco("15")).toBe("warning");
  });

  it("trata 30 dias e desconhecidos como default", () => {
    expect(severidadeMarco("30")).toBe("default");
    expect(severidadeMarco(null)).toBe("default");
    expect(severidadeMarco(undefined)).toBe("default");
    expect(severidadeMarco("99")).toBe("default");
  });
});
