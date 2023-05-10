/* istanbul ignore file */
import { Injectable } from "@tsed/di";
import nodeFetch, { RequestInfo, RequestInit, Response } from "node-fetch";

@Injectable()
export class HttpFetch {
  public async fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    return nodeFetch(url, init);
  }
}
