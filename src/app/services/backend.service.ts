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

@Injectable({
  providedIn: "root",
})
export class BackendService {
  private static readonly BASE_URL = "https://api.wheelgpt.dev";

  private readonly http = inject(HttpClient);
  private readonly jwt = inject(JwtService);

  private get(url: string) {
    url = `${BackendService.BASE_URL}/${url}`;
    const token = this.jwt.getToken();

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set("Authorization", `${token}`);
    }
    return this.http.get(url, { headers });
  }

  private post(url: string, body: unknown) {
    url = `${BackendService.BASE_URL}/${url}`;
    const token = this.jwt.getToken();
    let headers = new HttpHeaders();
    if (token !== null) {
      headers = headers.set("Authorization", `${token}`);
    }
    return this.http.post(url, body, { headers });
  }

  private delete(url: string) {
    url = `${BackendService.BASE_URL}/${url}`;
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
        this.post(`auth/login`, { username, password }).pipe(
          map((data) => z.object({ token: z.string() }).parse(data)),
        ),
    };
  }

  public get admin() {
    return {
      getAllCups: () =>
        this.get(`admin/cups`).pipe(
          map((data) => z.array(AdminCupSchema).parse(data)),
        ),
      getCupDetails: (id: number) =>
        this.get(`admin/cup/${id}`).pipe(
          map((data) => AdminCupDetailsSchema.parse(data)),
        ),
      createCup: (year: number, month: number) =>
        this.post("admin/cup/create", { year, month }).pipe(map((_) => true)),
      deleteCup: (id: number) =>
        this.delete(`admin/cup/delete/${id}`).pipe(map((_) => true)),
      changeCupVisibility: (id: number, visible: boolean) =>
        this.post(`admin/cup/public/${id}`, { visible }).pipe(map((_) => true)),
      uploadResults: (qualifierId: number, content: string[][]) =>
        this.post(`admin/cup/qualifier/update/${qualifierId}`, content).pipe(
          map((_) => true),
        ),
      clearResults: (qualifierId: number) =>
        this.delete(`admin/cup/qualifier/clear/${qualifierId}`).pipe(
          map((_) => true),
        ),
      setCurrentCup: (cupId: number) =>
        this.post(`admin/cup/current/${cupId}`, {}).pipe(map((_) => true)),
      renameCup: (cupId: number, name: string) =>
        this.post(`admin/cup/rename/${cupId}`, { name }).pipe(map((_) => true)),
    };
  }

  public get cups() {
    return {
      getAllCups: () =>
        this.get(`cups`).pipe(map((data) => z.array(CupSchema).parse(data))),
      getCurrentCup: () =>
        this.get(`cups/current`).pipe(
          map((data) => CupSchema.nullable().parse(data)),
        ),
    };
  }
}
