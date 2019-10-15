package server;

import edu.mit.csail.sdg.alloy4.Computer;
import gui.SwingLogPanel;

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
    private SwingLogPanel logPanel;

    static int connections = 0;
    public static String staticFileLocation = null;
    public static int port = 0;

    public VisServer(SwingLogPanel logPanel) {
        this.logPanel = logPanel;
        initialize();
    }

    public void currentInstance(String xml) {

        try {
            String content = readFile(xml);
            socket.setCurrentXML(xml, content);
        } catch (IOException e) {
            System.err.println("Could not read instance XML:");
            e.printStackTrace();
        }

    }

    public void openBrowser() {

        if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {

            Desktop desktop = Desktop.getDesktop();
            try {
                desktop.browse(URI.create(home));
            } catch (IOException e) {
                e.printStackTrace();
            }

        } else {

            System.out.println("Unable to open browser automatically. Please open a browser and navigate to " + home);

        }

    }

    public void setEnumerator(Computer enumerator) {
        if (socket != null) socket.setEnumerator(enumerator);
    }

    private void initialize() {

        // Let spark choose an available port
        port(VisServer.port);

        // Establish location of all static website files
        if (VisServer.staticFileLocation != null) {
            externalStaticFileLocation(VisServer.staticFileLocation);
        } else {
            staticFileLocation("public");
        }

        // Establish the websocket that handles communication
        socket = new VisSocket();
        webSocket("/alloy", socket);

        // Spin up the server
        init();

        // Block until the server has started and the port has been determined
        awaitInitialization();

        // Assemble home page using correct port
        home = "http://localhost:" + port();
        log("Visualization server running: ");
        logWebLink(home, home);
        log("\n\n");

        // Print to stdout just in case things aren't displaying correctly in Alloy
        System.out.println("Visuzalization server running: " + home);

    }

    private void log(String message) {

        if (logPanel != null) {
            logPanel.log(message);
        } else {
            System.out.println(message);
        }

    }

    private void logWebLink(String message, String link) {

        if (logPanel != null) {
            logPanel.logWebLink(message, link);
        } else {
            System.out.println(message + '(' + link + ')');
        }

    }

    private static String readFile(String path) throws IOException {

        byte [] encoded = Files.readAllBytes(Paths.get(path));
        return new String(encoded, Charset.defaultCharset());

    }

}
