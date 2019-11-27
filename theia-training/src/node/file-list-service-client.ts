import * as path from 'path';
import * as cp from 'child_process';
import { injectable } from "inversify";
import { JsonRpcProxyFactory } from "@theia/core/lib/common/messaging/proxy-factory";
import { DEBUG_MODE } from "@theia/core/lib/node/debug";
import { FileListService, Files } from "../common/file-list-protocol";
import { IPCMessageReader, IPCMessageWriter, createMessageConnection, Trace } from 'vscode-jsonrpc';
import { BackendApplicationContribution } from "@theia/core/lib/node/backend-application";

@injectable()
export class FileListServiceClient implements FileListService, BackendApplicationContribution {

    protected readonly proxyFactory = new JsonRpcProxyFactory<FileListService>();
    protected readonly remote = this.proxyFactory.createProxy();

    initialize(): void {
        const jarPath = path.resolve(__dirname, '../../build/my-file-server.jar');
        const args = [];
        if (DEBUG_MODE) {
            args.push('-Xdebug');
            args.push('-Xrunjdwp:server=y,transport=dt_socket,address=8000,suspend=n,quiet=y');
        }
        args.push(...['-jar', jarPath]);
        const childProcess = cp.spawn('java', args, {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        });

        console.log(`[file-list: ${childProcess.pid}] IPC started`);
        childProcess.once('exit', () => console.log(`[file-list: ${childProcess.pid}] IPC exited`));

        const reader = new IPCMessageReader(childProcess);
        const writer = new IPCMessageWriter(childProcess);
        const connection = createMessageConnection(reader, writer, {
            error: (message: string) => console.error(`[file-list: ${childProcess.pid}] ${message}`),
            warn: (message: string) => console.warn(`[file-list: ${childProcess.pid}] ${message}`),
            info: (message: string) => console.info(`[file-list: ${childProcess.pid}] ${message}`),
            log: (message: string) => console.info(`[file-list: ${childProcess.pid}] ${message}`)
        });
        connection.trace(Trace.Verbose, {
            // tslint:disable-next-line:no-any
            log: (message: any, data?: string) => console.info(`[file-list: ${childProcess.pid}] ${message}` + (typeof data === 'string' ? ' ' + data : ''))
        });
        this.proxyFactory.listen(connection);
    }

    getFiles(uri: string): Promise<Files> {
        return this.remote.getFiles(uri);
    }


}