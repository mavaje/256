import {iClient} from "./client";

export interface iServer {
    register_client(client: iClient): void;
}