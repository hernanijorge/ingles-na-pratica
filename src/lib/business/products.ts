export const DEFAULT_PRODUCTS = [
  { key: "COURSE_FULL", name: "Curso completo — English Made Simple", priceCents: 9700 },
  { key: "COURSE_CONSTRUCTION", name: "Curso — English for Construction Workers", priceCents: 9700 },
  { key: "SINGLE_CLASS", name: "Aula particular avulsa", priceCents: 6000 },
  { key: "PACKAGE_4", name: "Pacote de 4 aulas particulares", priceCents: 20000 },
] as const;

export type ProductKey = (typeof DEFAULT_PRODUCTS)[number]["key"];

/** Quantos créditos de aula particular cada produto concede ao ser pago. */
export const PRODUCT_CLASS_CREDITS: Partial<Record<ProductKey, number>> = {
  SINGLE_CLASS: 1,
  PACKAGE_4: 4,
};

/** Produtos que concedem matrícula (Enrollment) em um curso pelo seu productKey. */
export const PRODUCT_COURSE_KEYS: ProductKey[] = ["COURSE_FULL", "COURSE_CONSTRUCTION"];
