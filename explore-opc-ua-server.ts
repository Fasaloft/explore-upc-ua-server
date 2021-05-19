import { red, green, yellow, grey } from 'chalk';
import { MAX_AGE } from './env/app-setup';
import { closeOnSigInt, closeSession, createClient, createMonitoredItem, createSubscription, initSession, parseArg, printHelp } from './utils/utils';
import { OPCUAClient, AttributeIds, ClientSession, ClientSubscription, ClientMonitoredItem } from "node-opcua-client";

async function readVariables(session: ClientSession): Promise<void> {
    const nodeId = parseArg('--node-id');
    const dataValue = await session.read({nodeId: nodeId, attributeId: AttributeIds.Value}, MAX_AGE);
    console.log(`[*] Variable ${yellow(nodeId)} ---> ${dataValue.value.value} (${dataValue.statusCode.name})`)
}

async function singleConnection() {
    try {
        console.log('\n' + green('[*] Starting app ...'))
        const client: OPCUAClient = createClient();
        const session: ClientSession = await initSession(client);
        await readVariables(session);
        await closeSession(client, session);
        console.log(green('[*] Closing app ...'), '\n')
    } catch(err) {
        console.log('\n[!] Error: ', err);
    }
}

async function listenAndLogChanges(monitoredItem: ClientMonitoredItem) {
    await monitoredItem.on("changed", (dataValue) => {
        console.log(`[*] ${green('CHANGE')} Variable: ${dataValue.serverTimestamp} ${yellow(parseArg('--node-id'))} ---> ${dataValue.value.value} (${dataValue.statusCode.name})`)
    });
}

async function listAllVariables() {
    try {
        console.log('\n' + green('[*] Starting app ...'))
        const client: OPCUAClient = createClient();
        const session: ClientSession = await initSession(client);
        console.log((await session.browse("RootFolder")).toJSON());
        await closeSession(client, session);
    } catch(err) {
        console.log('\n[!] Error: ', err);
    } 
}

async function listenConnection() {
    try {
        console.log('\n' + green('[*] Starting app ...'))
        const client: OPCUAClient = createClient();
        const session: ClientSession = await initSession(client);
        const subscription: ClientSubscription = await createSubscription(session)
        const monitorItem: ClientMonitoredItem = await createMonitoredItem(subscription);
        listenAndLogChanges(monitorItem);
        await closeOnSigInt(client, session, subscription);
    } catch(err) {
        console.log('\n[!] Error: ', err);
    } 
}

async function main() {
    if(process.argv.length >= 3) {
        switch(process.argv[2]) {
            case 'single': await singleConnection(); break;
            case 'listen': await listenConnection(); break;
            case 'list-variables': await listAllVariables(); break;
            case '-h': printHelp(); break;
        }
    } else {
        console.log(red('[!] No option selected!'));
    }
}

main();