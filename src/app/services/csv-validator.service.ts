import { Injectable } from '@angular/core';
import Papa from "papaparse";
import { z } from 'zod';

const RowSchema = z.tuple([
  z.number().min(1),  // Position
  z.number().min(0),  // Points
  z.string(),  // Name
  z.string(),  // Login
  z.string()   // Zone
]);

export type Row = z.infer<typeof RowSchema>;

const validate = (data: unknown): data is Row => {
  const result = RowSchema.safeParse(data);
  if (result.error) {
    console.error(result.error);
  }
  return result.success;
}

@Injectable({
  providedIn: 'root'
})
export class CsvValidatorService {

  public validate(csv: string) {
    return new Promise<Row[]>((resolve, reject) => {
      Papa.parse<string>(csv, {
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0) {
            for (const error of result.errors) {
              console.error(error);
            }
          }
          const rows: Row[] = [];
          for (const row of result.data) {
            if (row.length === 5 && validate(row)) {
              rows.push(row);
              continue;
            }
            reject();
          }
          resolve(rows);
        },
      });
    });
  };
}

