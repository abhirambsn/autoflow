import { Response } from "express";

type SSEClient = Response;

type ClientMap = {
    owner: string;
    res: SSEClient;
}
const clients: ClientMap[] = [];

export function registerClient(res: SSEClient, owner: string) {
    clients.push({res, owner});
}

export function deregisterClient(res: SSEClient) {
    const client = clients.find((client) => client.res === res);
    if (!client) {
        return;
    }
    const index = clients.indexOf(client);
    if (index > -1) {
        clients.splice(index, 1);
    }
}

export function broadcast(data: any) {
    clients.forEach((client) => {
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}