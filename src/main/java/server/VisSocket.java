package server;

import edu.mit.csail.sdg.alloy4.Computer;
import edu.mit.csail.sdg.alloy4.OurDialog;
import edu.mit.csail.sdg.translator.A4TupleSet;
import org.eclipse.jetty.websocket.api.*;
import org.eclipse.jetty.websocket.api.annotations.*;
import sterling.SterlingEvaluator;

import java.io.IOException;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebSocket
public class VisSocket {

    private Vector<Session> sessions = new Vector<Session>();
    private Session currentSession;
    private Computer enumerator;
    private String currentXMLFile = "";
    private String currentXML = "";
    private boolean verbose = true;

    private boolean canEval = false;
    private SterlingEvaluator evaluator = new SterlingEvaluator();

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

        String cmd = message.substring(0, 4);

        switch (cmd) {
            case "curr":
                sendXML(session, currentXML);
                break;
            case "next":
                requestNext();
                break;
            case "ping":
                sendPong(session);
                break;
            case "EVL:":
                requestEval(session, message);
                break;
            default:
                break;
        }
    }

    void setCurrentXML(String xmlFile, String xml) {
        currentXMLFile = xmlFile;
        currentXML = xml;
        canEval = evaluator.setFile(xmlFile);
        if (currentSession != null) sendXML(currentSession, currentXML);
    }

    void setEnumerator(Computer enumerator) {
        this.enumerator = enumerator;
    }

    private void requestEval(Session session, String message) {

        Pattern pattern = Pattern.compile("EVL:(-?\\d+):(.*)");
        Matcher matcher = pattern.matcher(message);

        if (matcher.matches()) {

            String id = matcher.group(1);
            String expr = matcher.group(2);

            if (!canEval) {

                sendEval(session, id, "ERR:Evaluator not supported.");

            } else {

                try {

                    Object result = evaluator.evaluate(expr);

                    if (result instanceof A4TupleSet) {
                        sendEval(session, id, result.toString().trim());
                    }
                    else if (result instanceof String) {
                        sendEval(session, id, (String) result);
                    }
                    else if (result instanceof Boolean) {
                        sendEval(session, id, result.toString());
                    }
                    else {
                        sendEval(session, id, "ERR:Unknown result type");
                    }

                } catch (Exception e) {

                    sendEval(session, id, "ERR:" + e.getMessage());

                }
            }

        } else {
            sendEval(session, "-1", "ERR:Invalid request.");
        }

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

    private void sendEval(Session session, String id, String result) {
        try {
            session.getRemote().sendString("EVL:" + id + ":" + result);
        } catch (IOException e) {
            System.err.println("Unable to send evaluation result");
            e.printStackTrace();
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
