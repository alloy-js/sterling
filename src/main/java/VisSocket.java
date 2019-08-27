import org.eclipse.jetty.websocket.api.*;
import org.eclipse.jetty.websocket.api.annotations.*;

import java.io.IOException;
import java.util.Vector;

@WebSocket
public class VisSocket {

    private Vector<Session> sessions = new Vector<Session>();
    private Session currentSession;
    private String currentXML = "";
    private boolean verbose = true;

    @OnWebSocketConnect
    public void onConnect(Session session) {
        sessions.add(session);
        currentSession = session;
        log("Connection opened. " + ++VisServer.connections + " open connections.");
    }

    @OnWebSocketClose
    public void closed(Session session, int status, String reason) {
        sessions.remove(session);
        log("Connection closed. " + --VisServer.connections + " open connections.");
    }

    @OnWebSocketMessage
    public void message(Session session, String message) throws IOException {
        switch (message) {
            case "current":
                sendXML(session, currentXML);
                break;
            case "next":
                log("Request next instance");
            default:
                break;
        }
    }

    void setCurrentXML(String xml) {
        currentXML = xml;
        if (currentSession != null) sendXML(currentSession, currentXML);
    }

    private void sendXML(Session session, String xml) {
        try {
            String prefix = "XML:";
            session.getRemote().sendString(prefix + xml);
        } catch (IOException e) {
            System.err.println("Unable to send XML");
            e.printStackTrace();
        }
    }

    private void log(String message) {
        if (verbose) {
            System.out.println(message);
        }
    }

}
