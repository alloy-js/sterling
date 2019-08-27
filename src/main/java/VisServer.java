import java.awt.*;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;

import static spark.Spark.*;

class VisServer {

    private VisSocket socket;

    static int connections = 0;

    VisServer () {

        // Let spark choose an available port
        port(0);

        // Establish location of all static website files
        staticFileLocation("public");

        // Establish the websocket that handles communication
        socket = new VisSocket();
        webSocket("/alloy", socket);

        // Spin up the server
        init();

        // Block until the server has started and the port has been determined
        awaitInitialization();

        // Open a browser page using the correct port
        if (Desktop.isDesktopSupported()) {

            String home = "http://localhost:" + port();
            Desktop desktop = Desktop.getDesktop();
            try {
                desktop.browse(URI.create(home));
                System.out.println("Visualization server running: " + home);
            } catch (IOException e) {
                e.printStackTrace();
            }

        }

    }

    void currentInstance(String xml) {

        try {
            String content = readFile(xml);
            socket.setCurrentXML(content);
        } catch (IOException e) {
            System.err.println("Could not read instance XML:");
            e.printStackTrace();
        }

    }

    private static String readFile(String path) throws IOException {

        byte [] encoded = Files.readAllBytes(Paths.get(path));
        return new String(encoded, Charset.defaultCharset());

    }

}
