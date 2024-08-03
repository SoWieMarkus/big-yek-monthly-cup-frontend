import { z } from "zod";

export const QualifierSchema = z.object({
	id: z.number(),
	version: z.number(),
	cupId: z.number(),
});

export const AdminQualifierSchema = QualifierSchema.extend({
	_count: z.object({
		results: z.number(),
	}),
});

export type Qualifier = z.infer<typeof QualifierSchema>;
export type AdminQualifier = z.infer<typeof AdminQualifierSchema>;
