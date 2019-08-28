package server;

import java.awt.*;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;

import static spark.Spark.*;

public class VisServer {

    private String home;
    private VisSocket socket;

    static int connections = 0;

    public VisServer() {

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

        // Assemble home page using correct port
        home = "http://localhost:" + port();
        System.out.println("Visualization server running: " + home);

    }

    public void currentInstance(String xml) {

        try {
            String content = readFile(xml);
            socket.setCurrentXML(content);
        } catch (IOException e) {
            System.err.println("Could not read instance XML:");
            e.printStackTrace();
        }

    }

    public void openBrowser() {

        if (Desktop.isDesktopSupported()) {

            Desktop desktop = Desktop.getDesktop();
            try {
                desktop.browse(URI.create(home));
            } catch (IOException e) {
                e.printStackTrace();
            }

        }

    }

    private static String readFile(String path) throws IOException {

        byte [] encoded = Files.readAllBytes(Paths.get(path));
        return new String(encoded, Charset.defaultCharset());

    }

}
