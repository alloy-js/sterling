package server;

import edu.mit.csail.sdg.alloy4.Computer;
import edu.mit.csail.sdg.alloy4.OurDialog;
import org.eclipse.jetty.websocket.api.*;
import org.eclipse.jetty.websocket.api.annotations.*;

import java.io.IOException;
import java.util.Vector;

@WebSocket
public class VisSocket {

    private Vector<Session> sessions = new Vector<Session>();
    private Session currentSession;
    private Computer enumerator;
    private String currentXMLFile = "";
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
        if (currentSession == session) {
            if (sessions.size() > 0){
                currentSession = sessions.lastElement();
            } else {
                currentSession = null;
            }
        }
        log("Connection closed. " + --VisServer.connections + " open connections.");
    }

    @OnWebSocketMessage
    public void message(Session session, String message) throws IOException {
        switch (message) {
            case "current":
                sendXML(session, currentXML);
                break;
            case "next":
                requestNext();
                break;
            case "ping":
                sendPong(session);
                break;
            default:
                break;
        }
    }

    void setCurrentXML(String xmlFile, String xml) {
        currentXMLFile = xmlFile;
        currentXML = xml;
        if (currentSession != null) sendXML(currentSession, currentXML);
    }

    void setEnumerator(Computer enumerator) {
        this.enumerator = enumerator;
    }

    private void requestNext() {
        if (enumerator != null && !currentXMLFile.isEmpty()) {
            try {
                enumerator.compute(currentXMLFile);
            } catch (Throwable e) {
                OurDialog.alert(e.getMessage());
            }
        }
    }

    private void sendPong(Session session) {
        try {
            session.getRemote().sendString("pong");
        } catch (IOException e) {
            System.err.println("Unable to send pong");
            e.printStackTrace();
        }
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
