import { OPTIONS, SUBSCRIPTION_OPTIONS, MONITOR_PARAMETERS } from '../env/app-setup';
import { red, grey, green } from 'chalk';
import {
    OPCUAClient,
    AttributeIds,
    ClientSession,
    ClientSubscription,
    ClientMonitoredItem,
    TimestampsToReturn,
 } from "node-opcua-client";


export function parseArg(name: string): string {
    const index = process.argv.indexOf(name);
    if(index > 0 && process.argv.length > (index + 1) ) {
        return process.argv[index + 1];
    }
    return '';
}

export function createClient(): OPCUAClient {
    console.log('[?] Creating client... ');
    return OPCUAClient.create(OPTIONS);
}

export async function initSession(client: OPCUAClient): Promise<ClientSession> {
    console.log('[?] Connection to server... ');
    await client.connect(parseArg('--url'));
    console.log('[?] Creating session... \n');
    return await client.createSession();
}

export async function closeSession(client: OPCUAClient, session: ClientSession): Promise<void> {
    console.log('\n[?] Closing session... ');
    await session.close();
    console.log('[?] Disconnection client... ');
    await client.disconnect();
}

export async function createSubscription(session: ClientSession): Promise<ClientSubscription> {
    const subscription = await session.createSubscription2(SUBSCRIPTION_OPTIONS);
    subscription.on("keepalive", () => console.log(`[*] ${grey('LISTENING ...')}`))
    return subscription;
}

export async function createMonitoredItem(subscription: ClientSubscription): Promise<ClientMonitoredItem> {
    const itemToMonitor = { nodeId: parseArg('--node-id'), attributeId: AttributeIds.Value };
    return await subscription.monitor(itemToMonitor, MONITOR_PARAMETERS, TimestampsToReturn.Both);
}

export async function closeOnSigInt(client: OPCUAClient, session: ClientSession, subscription: ClientSubscription) {
    let running = true;
    process.on("SIGINT", async () => {
        if (!running) { return; }
        console.log('\n', red('[*] Listening stoped ...'))
        running = false;
        await subscription.terminate();
        await closeSession(client, session);
        console.log(green('[*] Closing app ...'), '\n')
    });
}

export function printHelp() {
    console.log('\nStructure:\n  ts-node explore-opc-ua-server.ts {variant} {options}\n\nOptions:\n  -h          Help\n  --url       OPC url (opc.tcp://{ip-adress}:{port}/{name1}/{name2})\n  --node-id   Node ID in OPC UA std (\'ns=3;i=1001\'))\n\nVariants:\n  single      Make single call to OPC server\n  listen      Emit value on every node change\n');
}