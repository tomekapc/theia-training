import { FileListService, Files } from "../common/file-list-protocol";
import { injectable, inject } from "inversify";
import { FileListServiceClient } from './file-list-service-client';

@injectable()
export class NodeFileListService implements FileListService {

    @inject(FileListServiceClient)
    protected readonly client: FileListServiceClient;

    getFiles(uri: string): Promise<Files> {
        return this.client.getFiles(uri);
    }

}