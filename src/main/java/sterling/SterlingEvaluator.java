package sterling;

import edu.mit.csail.sdg.alloy4.*;
import edu.mit.csail.sdg.ast.Expr;
import edu.mit.csail.sdg.ast.ExprVar;
import edu.mit.csail.sdg.ast.Module;
import edu.mit.csail.sdg.ast.Sig;
import edu.mit.csail.sdg.parser.CompUtil;
import edu.mit.csail.sdg.sim.SimInstance;
import edu.mit.csail.sdg.sim.SimTuple;
import edu.mit.csail.sdg.sim.SimTupleset;
import edu.mit.csail.sdg.translator.A4Solution;
import edu.mit.csail.sdg.translator.A4SolutionReader;
import edu.mit.csail.sdg.translator.A4Tuple;
import edu.mit.csail.sdg.translator.A4TupleSet;
import kodkod.engine.fol2sat.HigherOrderDeclException;
import org.alloytools.alloy.core.AlloyCore;

import java.io.File;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static edu.mit.csail.sdg.alloy4.A4Preferences.ImplicitThis;
import static edu.mit.csail.sdg.alloy4.A4Preferences.VerbosityPref;

public class SterlingEvaluator {

    public Object evaluate (String expression) throws Exception {

        return evaluator.compute(expression);

    }

    public boolean setFile (String xmlFile) {

        try {
            evaluator.compute(new File(xmlFile));
            return true;
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return false;
        }

    }

    /** Performs expression evaluation */
    private Computer evaluator = new Computer() {

        private String filename = null;

        @Override
        public final Object compute(final Object input) throws Exception {
            if (input instanceof File) {
                filename = ((File) input).getAbsolutePath();
                return "";
            }
            if (!(input instanceof String))
                return "";
            final String str = (String) input;
            if (str.trim().length() == 0)
                return ""; // Empty line
            Module root = null;
            A4Solution ans = null;
            try {
                Map<String,String> fc = new LinkedHashMap<String,String>();
                XMLNode x = new XMLNode(new File(filename));
                if (!x.is("alloy"))
                    throw new Exception();
                String mainname = null;
                for (XMLNode sub : x)
                    if (sub.is("instance")) {
                        mainname = sub.getAttribute("filename");
                        break;
                    }
                if (mainname == null)
                    throw new Exception();
                for (XMLNode sub : x)
                    if (sub.is("source")) {
                        String name = sub.getAttribute("filename");
                        String content = sub.getAttribute("content");
                        fc.put(name, content);
                    }
                root = CompUtil.parseEverything_fromFile(A4Reporter.NOP, fc, mainname, (Version.experimental && ImplicitThis.get()) ? 2 : 1);
                ans = A4SolutionReader.read(root.getAllReachableSigs(), x);
                for (ExprVar a : ans.getAllAtoms()) {
                    root.addGlobal(a.label, a);
                }
                for (ExprVar a : ans.getAllSkolems()) {
                    root.addGlobal(a.label, a);
                }
            } catch (Throwable ex) {
                throw new ErrorFatal("Failed to read or parse the XML file.");
            }
            try {
                Expr e = CompUtil.parseOneExpression_fromString(root, str);
                if (AlloyCore.isDebug() && VerbosityPref.get() == A4Preferences.Verbosity.FULLDEBUG) {
                    SimInstance simInst = convert(root, ans);
                    if (simInst.wasOverflow())
                        return simInst.visitThis(e).toString() + " (OF)";
                }
                return ans.eval(e);
            } catch (HigherOrderDeclException ex) {
                throw new ErrorType("Higher-order quantification is not allowed in the evaluator.");
            }
        }
    };

    /** Converts an A4TupleSet into a SimTupleset object. */
    private static SimTupleset convert(Object object) throws Err {
        if (!(object instanceof A4TupleSet))
            throw new ErrorFatal("Unexpected type error: expecting an A4TupleSet.");
        A4TupleSet s = (A4TupleSet) object;
        if (s.size() == 0)
            return SimTupleset.EMPTY;
        List<SimTuple> list = new ArrayList<SimTuple>(s.size());
        int arity = s.arity();
        for (A4Tuple t : s) {
            String[] array = new String[arity];
            for (int i = 0; i < t.arity(); i++)
                array[i] = t.atom(i);
            list.add(SimTuple.make(array));
        }
        return SimTupleset.make(list);
    }

    /** Converts an A4Solution into a SimInstance object. */
    private static SimInstance convert(Module root, A4Solution ans) throws Err {
        SimInstance ct = new SimInstance(root, ans.getBitwidth(), ans.getMaxSeq());
        for (Sig s : ans.getAllReachableSigs()) {
            if (!s.builtin)
                ct.init(s, convert(ans.eval(s)));
            for (Sig.Field f : s.getFields())
                if (!f.defined)
                    ct.init(f, convert(ans.eval(f)));
        }
        for (ExprVar a : ans.getAllAtoms())
            ct.init(a, convert(ans.eval(a)));
        for (ExprVar a : ans.getAllSkolems())
            ct.init(a, convert(ans.eval(a)));
        return ct;
    }

}
