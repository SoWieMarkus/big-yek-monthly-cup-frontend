import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map } from "rxjs";
import { z } from "zod";
import {
  AdminCupDetailsSchema,
  AdminCupSchema,
  CupSchema,
} from "../models/cup";
import { JwtService } from "./jwt.service";
import type { Row } from "./csv-validator.service";

@Injectable({
  providedIn: "root",
})
export class BackendService {
  private static readonly BASE_URL = "https://api.wheelgpt.dev";

  private readonly http = inject(HttpClient);
  private readonly jwt = inject(JwtService);

  private get(path: string) {
    const url = `${BackendService.BASE_URL}/${path}`;
    const token = this.jwt.getToken();

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set("Authorization", `${token}`);
    }
    return this.http.get(url, { headers });
  }

  private post(path: string, body: unknown) {
    const url = `${BackendService.BASE_URL}/${path}`;
    const token = this.jwt.getToken();
    let headers = new HttpHeaders();
    if (token !== null) {
      headers = headers.set("Authorization", `${token}`);
    }
    return this.http.post(url, body, { headers });
  }

  private delete(path: string) {
    const url = `${BackendService.BASE_URL}/${path}`;
    const token = this.jwt.getToken();
    let headers = new HttpHeaders();
    if (token !== null) {
      headers = headers.set("Authorization", `${token}`);
    }
    return this.http.delete(url, { headers });
  }

  public get authentication() {
    return {
      login: (username: string, password: string) =>
        this.post("auth/login", { username, password }).pipe(
          map((data) => z.object({ token: z.string() }).parse(data)),
        ),
    };
  }

  public get admin() {
    return {
      getAllCups: () =>
        this.get("admin/cups").pipe(
          map((data) => z.array(AdminCupSchema).parse(data)),
        ),
      getCupDetails: (id: number) =>
        this.get(`admin/cup/${id}`).pipe(
          map((data) => AdminCupDetailsSchema.parse(data)),
        ),
      createCup: (year: number, month: number) =>
        this.post("admin/cup/create", { year, month }).pipe(map((_) => true)),
      deleteCup: (id: number) =>
        this.delete(`admin/cup/${id}/delete`).pipe(map((_) => true)),
      changeCupVisibility: (id: number, visible: boolean) =>
        this.post(`admin/cup/${id}/public`, { visible }).pipe(map((_) => true)),
      uploadResults: (cupId: number, qualifierId: number, data: { server: number, data: Row[] }) =>
        this.post(`admin/cup/${cupId}/qualifier/${qualifierId}/update`, data).pipe(
          map((_) => true),
        ),
      createQualifier: (cupId: number, version: number) =>
        this.post(`admin/cup/${cupId}/qualifier/create`, { version }).pipe(
          map((_) => true),
        ),
      deleteQualifier: (cupId: number, qualifierId: number) =>
        this.delete(`admin/cup/${cupId}/qualifier/${qualifierId}/delete`).pipe(
          map((_) => true),
        ),
      clearResults: (cupId: number, qualifierId: number) =>
        this.delete(`admin/cup/${cupId}/qualifier/${qualifierId}/clear`).pipe(
          map((_) => true),
        ),
      setCurrentCup: (cupId: number) =>
        this.post(`admin/cup/${cupId}/current`, {}).pipe(map((_) => true)),
      renameCup: (cupId: number, name: string) =>
        this.post(`admin/cup/${cupId}/rename`, { name }).pipe(map((_) => true)),
    };
  }

  public get cups() {
    return {
      getAllCups: () =>
        this.get("cups").pipe(map((data) => z.array(CupSchema).parse(data))),
      getCurrentCup: () =>
        this.get("cups/current").pipe(
          map((data) => CupSchema.nullable().parse(data)),
        ),
    };
  }
}
