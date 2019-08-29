package sterling;

import java.io.IOException;
import java.net.URL;
import java.time.Instant;
import java.util.Enumeration;
import java.util.jar.Manifest;

public final class SterlingVersion {

    private SterlingVersion() {}

    public static String version = "unknown";
    public static String builddate = Instant.ofEpochMilli(0).toString();

    static {

        Manifest manifest = getManifest();

        if (manifest != null) {

            SterlingVersion.version = manifest.getMainAttributes().getValue("Build-Version");
            SterlingVersion.builddate = manifest.getMainAttributes().getValue("Build-Timestamp");

        }

    }

    private static Manifest getManifest() {
        try {
            Enumeration<URL> resources = SterlingVersion.class.getClassLoader().getResources("META-INF/MANIFEST.MF");
            while (resources.hasMoreElements()) {
                URL url = resources.nextElement();
                Manifest m = new Manifest(url.openStream());
                String value = m.getMainAttributes().getValue("Bundle-SymbolicName");
                if (value != null && value.equals("org.alloytools.alloy.dist")) {
                    return m;
                }
            }
        } catch (IOException e) {
            System.err.println("Unable to locate JAR manifest");
        }
        return null;
    }

}
