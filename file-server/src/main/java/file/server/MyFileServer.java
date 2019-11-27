package file.server;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.eclipse.lsp4j.jsonrpc.services.JsonRequest;

public class MyFileServer {

    @JsonRequest("getFiles")
    public CompletableFuture<MyFiles> listFiles(String uri) throws IOException {
        Path fsPath = Paths.get(URI.create(uri));
        MyFiles result = new MyFiles();
        if (!Files.isDirectory(fsPath)) {
            result.setIsDirectory(false);
            return CompletableFuture.completedFuture(result);
        }
        result.setIsDirectory(true);
        result.setChildren(Files.list(fsPath).map(f -> f.toUri().toString()).collect(Collectors.toList()));
        return CompletableFuture.completedFuture(result);
    }

}