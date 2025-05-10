import { z } from "zod";

export const pdfFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type === "application/pdf", {
      message: "Invalid PDF",
    })
    .refine((file) => file.name.endsWith(".pdf"), { message: "Invalid PDF" }),
});

export const pageNumSchema = z.number().refine((value) => {
  return value > 0;
});
