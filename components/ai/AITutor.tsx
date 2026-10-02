// // "use client";

// // import {
// //   useEffect,
// //   useMemo,
// //   useState,
// // } from "react";

// // import {
// //   analyzePythonError,
// //   explainPythonCode,
// //   AIErrorResult,
// //   CodeExplanationResult,
// // } from "@/lib/api";

// // import {
// //   LearningLevel,
// // } from "@/types/learning";

// // import {
// //   NotebookCellType,
// // } from "@/types/notebook";


// // interface Props {
// //   action: string;

// //   cell: NotebookCellType | null;

// //   learningLevel: LearningLevel;

// //   onAcceptFix: (
// //     cellId: string,
// //     correctedCode: string,
// //     runAfterAccept: boolean
// //   ) => void;
// // }


// // interface DiffLine {
// //   type:
// //     | "same"
// //     | "removed"
// //     | "added";

// //   text: string;
// // }


// // type TutorMode =
// //   | "code"
// //   | "explain"
// //   | "fix"
// //   | null;


// // /* =========================================================
// //    SIMPLE CODE DIFF
// //    ========================================================= */

// // function createCodeDiff(
// //   originalCode: string,
// //   fixedCode: string
// // ): DiffLine[] {
// //   const oldLines =
// //     originalCode.split("\n");

// //   const newLines =
// //     fixedCode.split("\n");

// //   const result: DiffLine[] = [];

// //   const maximumLength =
// //     Math.max(
// //       oldLines.length,
// //       newLines.length
// //     );

// //   for (
// //     let i = 0;
// //     i < maximumLength;
// //     i++
// //   ) {
// //     const oldLine = oldLines[i];
// //     const newLine = newLines[i];

// //     if (oldLine === newLine) {
// //       if (oldLine !== undefined) {
// //         result.push({
// //           type: "same",
// //           text: oldLine,
// //         });
// //       }

// //       continue;
// //     }

// //     if (oldLine !== undefined) {
// //       result.push({
// //         type: "removed",
// //         text: oldLine,
// //       });
// //     }

// //     if (newLine !== undefined) {
// //       result.push({
// //         type: "added",
// //         text: newLine,
// //       });
// //     }
// //   }

// //   return result;
// // }


// // /* =========================================================
// //    COMPONENT
// //    ========================================================= */

// // export default function AITutor({
// //   action,
// //   cell,
// //   learningLevel,
// //   onAcceptFix,
// // }: Props) {
// //   const [
// //     result,
// //     setResult,
// //   ] =
// //     useState<AIErrorResult | null>(
// //       null
// //     );

// //   const [
// //     codeResult,
// //     setCodeResult,
// //   ] =
// //     useState<CodeExplanationResult | null>(
// //       null
// //     );

// //   const [
// //     loading,
// //     setLoading,
// //   ] =
// //     useState(false);

// //   const [
// //     message,
// //     setMessage,
// //   ] =
// //     useState("");

// //   const [
// //     currentMode,
// //     setCurrentMode,
// //   ] =
// //     useState<TutorMode>(null);


// //   /* =======================================================
// //      RESET WHEN CELL CHANGES
// //      ======================================================= */

// //   useEffect(() => {
// //     setResult(null);
// //     setCodeResult(null);
// //     setMessage("");
// //     setCurrentMode(null);
// //   }, [cell?.id]);


// //   /* =======================================================
// //      RESET WHEN GLOBAL LEVEL CHANGES
// //      ======================================================= */

// //   useEffect(() => {
// //     setResult(null);
// //     setCodeResult(null);

// //     if (cell) {
// //       setMessage(
// //         `Learning level changed to ${learningLevel}. Run the explanation again to use this level.`
// //       );
// //     }
// //   }, [
// //     learningLevel,
// //     cell,
// //   ]);


// //   /* =======================================================
// //      NOTEBOOK ACTIONS
// //      ======================================================= */

// //   useEffect(() => {
// //     if (!cell) {
// //       return;
// //     }

// //     if (action === "Explain Code") {
// //       setCurrentMode("code");
// //       setResult(null);
// //       setCodeResult(null);
// //       setMessage("");

// //       void requestCodeExplanation();
// //     }

// //     if (action === "Explain Error") {
// //       setCurrentMode("explain");
// //       setResult(null);
// //       setCodeResult(null);

// //       setMessage(
// //         "Ready to explain this error."
// //       );
// //     }

// //     if (action === "Fix Error") {
// //       setCurrentMode("fix");
// //       setResult(null);
// //       setCodeResult(null);

// //       setMessage(
// //         "Ready to generate a safe fix."
// //       );
// //     }
// //   }, [
// //     action,
// //     cell,
// //   ]);


// //   /* =======================================================
// //      CODE DIFF
// //      ======================================================= */

// //   const diffLines =
// //     useMemo(() => {
// //       if (
// //         !cell ||
// //         !result?.fixed_code
// //       ) {
// //         return [];
// //       }

// //       return createCodeDiff(
// //         cell.content,
// //         result.fixed_code
// //       );
// //     }, [
// //       cell,
// //       result,
// //     ]);


// //   const changedLineCount =
// //     useMemo(() => {
// //       return diffLines.filter(
// //         (line) =>
// //           line.type !== "same"
// //       ).length;
// //     }, [
// //       diffLines,
// //     ]);


// //   /* =======================================================
// //      CODE EXPLAINER
// //      ======================================================= */

// //   async function requestCodeExplanation() {
// //     if (!cell) {
// //       setMessage(
// //         "Select a notebook cell first."
// //       );

// //       return;
// //     }

// //     if (!cell.content.trim()) {
// //       setMessage(
// //         "This notebook cell is empty."
// //       );

// //       return;
// //     }

// //     setLoading(true);

// //     setResult(null);
// //     setCodeResult(null);

// //     setMessage("");

// //     setCurrentMode("code");

// //     try {
// //       const response =
// //         await explainPythonCode(
// //           cell.content,
// //           learningLevel
// //         );

// //       setCodeResult(response);

// //       if (!response.handled) {
// //         setMessage(
// //           "This code needs deeper analysis than the local Code Explainer currently provides."
// //         );
// //       }
// //     } catch (error) {
// //       setMessage(
// //         error instanceof Error
// //           ? error.message
// //           : "ModelMind could not explain this code."
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   }


// //   /* =======================================================
// //      ERROR INTELLIGENCE
// //      ======================================================= */

// //   async function requestAI(
// //     selectedAction:
// //       | "explain"
// //       | "fix"
// //   ) {
// //     if (!cell) {
// //       setMessage(
// //         "Select a notebook cell first."
// //       );

// //       return;
// //     }

// //     if (!cell.error) {
// //       setMessage(
// //         "Run the cell first so ModelMind can inspect the error."
// //       );

// //       return;
// //     }

// //     setLoading(true);

// //     setResult(null);
// //     setCodeResult(null);

// //     setMessage("");

// //     setCurrentMode(
// //       selectedAction
// //     );

// //     try {
// //       const response =
// //         await analyzePythonError(
// //           cell.content,
// //           cell.error,
// //           selectedAction,
// //           learningLevel
// //         );

// //       setResult(response);

// //       if (
// //         selectedAction === "fix" &&
// //         !response.fixed_code
// //       ) {
// //         setMessage(
// //           response.handled
// //             ? "ModelMind understands this error, but it cannot safely generate an automatic code change yet."
// //             : "This error requires advanced analysis. The local engine will not guess a fix."
// //         );
// //       }
// //     } catch (error) {
// //       setMessage(
// //         error instanceof Error
// //           ? error.message
// //           : "ModelMind could not analyze the error."
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   }


// //   /* =======================================================
// //      FIX ACTIONS
// //      ======================================================= */

// //   function cancelFix() {
// //     setResult(null);
// //     setCodeResult(null);

// //     setCurrentMode(null);

// //     setMessage(
// //       "Fix cancelled. Your original code was not changed."
// //     );
// //   }


// //   function acceptFix(
// //     runAfterAccept: boolean
// //   ) {
// //     if (
// //       !cell ||
// //       !result?.fixed_code
// //     ) {
// //       return;
// //     }

// //     onAcceptFix(
// //       cell.id,
// //       result.fixed_code,
// //       runAfterAccept
// //     );

// //     setResult(null);
// //     setCodeResult(null);

// //     setCurrentMode(null);

// //     setMessage(
// //       runAfterAccept
// //         ? "Fix accepted. Running the corrected code..."
// //         : "Fix accepted. The notebook cell has been updated."
// //     );
// //   }


// //   /* =======================================================
// //      UI
// //      ======================================================= */

// //   return (
// //     <aside className="aiPanel">

// //       {/* HEADER */}

// //       <div className="aiHeader">
// //         <div>
// //           <span className="aiBadge">
// //             MODELMIND AI
// //           </span>

// //           <h3>
// //             AI Learning Tutor
// //           </h3>
// //         </div>
// //       </div>


// //       <p className="aiHelp">
// //         Understand your code, errors,
// //         and machine-learning workflow.
// //       </p>


// //       {/* GLOBAL LEVEL */}

// //       <div
// //         style={{
// //           marginBottom: "14px",
// //           padding: "10px 12px",

// //           border:
// //             "1px solid rgba(114,226,138,0.18)",

// //           borderRadius: "8px",

// //           background:
// //             "rgba(114,226,138,0.05)",

// //           display: "flex",
// //           alignItems: "center",
// //           justifyContent:
// //             "space-between",

// //           gap: "10px",

// //           fontSize: "12px",
// //         }}
// //       >
// //         <span
// //           style={{
// //             opacity: 0.65,
// //           }}
// //         >
// //           Learning level
// //         </span>

// //         <strong
// //           style={{
// //             color: "#72e28a",
// //           }}
// //         >
// //           {learningLevel}
// //         </strong>
// //       </div>


// //       {/* TOOLS */}

// //       <div className="aiTools">

// //         <button
// //           disabled={
// //             loading ||
// //             !cell
// //           }
// //           onClick={
// //             requestCodeExplanation
// //           }
// //         >
// //           <span className="toolIcon">
// //             &lt;/&gt;
// //           </span>

// //           <span>
// //             <strong>
// //               Explain Code
// //             </strong>

// //             <small>
// //               Learn what this cell
// //               is doing.
// //             </small>
// //           </span>
// //         </button>


// //         <button
// //           disabled={
// //             loading ||
// //             !cell?.error
// //           }
// //           onClick={() =>
// //             requestAI(
// //               "explain"
// //             )
// //           }
// //         >
// //           <span className="toolIcon">
// //             ?
// //           </span>

// //           <span>
// //             <strong>
// //               Explain Error
// //             </strong>

// //             <small>
// //               Understand why your
// //               code failed.
// //             </small>
// //           </span>
// //         </button>


// //         <button
// //           disabled={
// //             loading ||
// //             !cell?.error
// //           }
// //           onClick={() =>
// //             requestAI(
// //               "fix"
// //             )
// //           }
// //         >
// //           <span className="toolIcon">
// //             ✦
// //           </span>

// //           <span>
// //             <strong>
// //               Fix Error
// //             </strong>

// //             <small>
// //               Preview changes before
// //               applying them.
// //             </small>
// //           </span>
// //         </button>

// //       </div>


// //       {/* SELECTED CELL */}

// //       {cell && (
// //         <div className="selectedCellCard">

// //           <span className="responseLabel">
// //             SELECTED CELL
// //           </span>

// //           <pre className="contextPreview">
// //             {cell.content}
// //           </pre>

// //         </div>
// //       )}


// //       {/* LOADING */}

// //       {loading && (
// //         <div className="debugLoading">

// //           <div className="debugLoadingIcon">
// //             ✦
// //           </div>

// //           <div>
// //             <strong>
// //               ModelMind is analyzing
// //               your code
// //             </strong>

// //             <p>
// //               {currentMode === "code"
// //                 ? "Understanding the code structure and ML workflow..."
// //                 : "Reading the traceback and locating the cause..."}
// //             </p>
// //           </div>

// //         </div>
// //       )}


// //       {/* MESSAGE */}

// //       {message &&
// //         !loading && (
// //           <div className="aiMessage">
// //             {message}
// //           </div>
// //         )}


// //       {/* ===================================================
// //           CODE EXPLANATION RESULT
// //           =================================================== */}

// //       {codeResult &&
// //         currentMode === "code" &&
// //         !loading && (
// //           <div className="debugResult">

// //             <div className="debugResultHeader">

// //               <div>
// //                 <span className="responseLabel">
// //                   CODE EXPLANATION
// //                 </span>

// //                 <h3>
// //                   What this code is doing
// //                 </h3>
// //               </div>

// //               <span className="localBadge">
// //                 {codeResult.source ===
// //                 "modelmind-local"
// //                   ? "LOCAL"
// //                   : "ADVANCED"}
// //               </span>

// //             </div>


// //             {/* METADATA */}

// //             <div
// //               style={{
// //                 display: "flex",
// //                 flexWrap: "wrap",
// //                 gap: "8px",

// //                 marginBottom:
// //                   "14px",

// //                 fontSize: "11px",
// //                 opacity: 0.75,
// //               }}
// //             >
// //               <span>
// //                 Level:{" "}
// //                 <strong
// //                   style={{
// //                     color:
// //                       "#72e28a",
// //                   }}
// //                 >
// //                   {learningLevel}
// //                 </strong>
// //               </span>

// //               <span>
// //                 •
// //               </span>

// //               <span>
// //                 Confidence:{" "}
// //                 {Math.round(
// //                   codeResult.confidence *
// //                     100
// //                 )}
// //                 %
// //               </span>

// //               <span>
// //                 •
// //               </span>

// //               <span>
// //                 {codeResult.source ===
// //                 "modelmind-local"
// //                   ? "ModelMind Local"
// //                   : codeResult.source}
// //               </span>
// //             </div>


// //             {/* SUMMARY */}

// //             <div className="explanationBlock">

// //               <h4>
// //                 Summary
// //               </h4>

// //               <p>
// //                 {codeResult.summary}
// //               </p>

// //             </div>


// //             {/* PURPOSE */}

// //             {codeResult.purpose && (
// //               <div className="explanationBlock">

// //                 <h4>
// //                   Purpose
// //                 </h4>

// //                 <p>
// //                   {codeResult.purpose}
// //                 </p>

// //               </div>
// //             )}


// //             {/* ML FLOW */}

// //             {codeResult.ml_flow.length >
// //               0 && (
// //               <div className="explanationBlock">

// //                 <h4>
// //                   Machine-learning flow
// //                 </h4>

// //                 <div
// //                   style={{
// //                     display: "grid",
// //                     gap: "10px",
// //                   }}
// //                 >
// //                   {codeResult.ml_flow.map(
// //                     (
// //                       item,
// //                       index
// //                     ) => (
// //                       <div
// //                         key={`${item.stage}-${index}`}
// //                         style={{
// //                           padding:
// //                             "10px 12px",

// //                           border:
// //                             "1px solid rgba(114,226,138,0.14)",

// //                           borderRadius:
// //                             "8px",

// //                           background:
// //                             "rgba(114,226,138,0.035)",
// //                         }}
// //                       >
// //                         <strong>
// //                           {index + 1}.{" "}
// //                           {item.stage}
// //                         </strong>

// //                         <p
// //                           style={{
// //                             margin:
// //                               "6px 0 0",
// //                           }}
// //                         >
// //                           {
// //                             item.explanation
// //                           }
// //                         </p>

// //                         {item.line_number && (
// //                           <small
// //                             style={{
// //                               opacity:
// //                                 0.55,
// //                             }}
// //                           >
// //                             Line{" "}
// //                             {
// //                               item.line_number
// //                             }
// //                           </small>
// //                         )}
// //                       </div>
// //                     )
// //                   )}
// //                 </div>

// //               </div>
// //             )}


// //             {/* STEP BY STEP */}

// //             {codeResult.steps.length >
// //               0 && (
// //               <div className="explanationBlock">

// //                 <h4>
// //                   Step-by-step
// //                 </h4>

// //                 <div
// //                   style={{
// //                     display: "grid",
// //                     gap: "12px",
// //                   }}
// //                 >
// //                   {codeResult.steps.map(
// //                     (
// //                       step,
// //                       index
// //                     ) => (
// //                       <div
// //                         key={`${step.line_number}-${index}`}
// //                         style={{
// //                           paddingBottom:
// //                             "10px",

// //                           borderBottom:
// //                             "1px solid rgba(255,255,255,0.06)",
// //                         }}
// //                       >
// //                         <strong>
// //                           {index + 1}.{" "}
// //                           {step.title}
// //                         </strong>

// //                         {step.line_number && (
// //                           <small
// //                             style={{
// //                               marginLeft:
// //                                 "8px",

// //                               opacity:
// //                                 0.5,
// //                             }}
// //                           >
// //                             Line{" "}
// //                             {
// //                               step.line_number
// //                             }
// //                           </small>
// //                         )}

// //                         {step.code && (
// //                           <pre
// //                             className="contextPreview"
// //                             style={{
// //                               marginTop:
// //                                 "8px",
// //                             }}
// //                           >
// //                             {step.code}
// //                           </pre>
// //                         )}

// //                         <p>
// //                           {
// //                             step.explanation
// //                           }
// //                         </p>
// //                       </div>
// //                     )
// //                   )}
// //                 </div>

// //               </div>
// //             )}


// //             {/* CONCEPTS */}

// //             {codeResult.concepts.length >
// //               0 && (
// //               <div className="explanationBlock">

// //                 <h4>
// //                   Concepts to understand
// //                 </h4>

// //                 {codeResult.concepts.map(
// //                   (
// //                     concept,
// //                     index
// //                   ) => (
// //                     <div
// //                       key={`${concept.title}-${index}`}
// //                       style={{
// //                         marginBottom:
// //                           "12px",
// //                       }}
// //                     >
// //                       <strong>
// //                         {
// //                           concept.title
// //                         }
// //                       </strong>

// //                       <p>
// //                         {
// //                           concept.explanation
// //                         }
// //                       </p>
// //                     </div>
// //                   )
// //                 )}

// //               </div>
// //             )}


// //             {/* VARIABLES */}

// //             {codeResult.variables.length >
// //               0 && (
// //               <div className="explanationBlock">

// //                 <h4>
// //                   Important variables
// //                 </h4>

// //                 <div
// //                   style={{
// //                     display: "grid",
// //                     gap: "10px",
// //                   }}
// //                 >
// //                   {codeResult.variables.map(
// //                     (
// //                       variable,
// //                       index
// //                     ) => (
// //                       <div
// //                         key={`${variable.name}-${index}`}
// //                       >
// //                         <code>
// //                           {
// //                             variable.name
// //                           }
// //                         </code>

// //                         <p
// //                           style={{
// //                             margin:
// //                               "4px 0",
// //                           }}
// //                         >
// //                           {
// //                             variable.explanation
// //                           }
// //                         </p>

// //                         {variable.assigned_from && (
// //                           <small
// //                             style={{
// //                               opacity:
// //                                 0.55,
// //                             }}
// //                           >
// //                             From:{" "}
// //                             {
// //                               variable.assigned_from
// //                             }
// //                           </small>
// //                         )}
// //                       </div>
// //                     )
// //                   )}
// //                 </div>

// //               </div>
// //             )}


// //             {/* LIBRARIES */}

// //             {codeResult.libraries.length >
// //               0 && (
// //               <div className="explanationBlock">

// //                 <h4>
// //                   Libraries used
// //                 </h4>

// //                 {codeResult.libraries.map(
// //                   (
// //                     library,
// //                     index
// //                   ) => (
// //                     <div
// //                       key={`${library.name}-${index}`}
// //                       style={{
// //                         marginBottom:
// //                           "10px",
// //                       }}
// //                     >
// //                       <strong>
// //                         {
// //                           library.name
// //                         }
// //                       </strong>

// //                       <p>
// //                         {
// //                           library.explanation
// //                         }
// //                       </p>
// //                     </div>
// //                   )
// //                 )}

// //               </div>
// //             )}


// //             {/* ADVANCED / LEARNING NOTES */}

// //             {codeResult.advanced_notes
// //               .length > 0 && (
// //               <div className="explanationBlock">

// //                 <h4>
// //                   {learningLevel ===
// //                   "Advanced"
// //                     ? "Advanced insights"
// //                     : "Learning notes"}
// //                 </h4>

// //                 {codeResult.advanced_notes.map(
// //                   (
// //                     note,
// //                     index
// //                   ) => (
// //                     <div
// //                       key={`${note.title}-${index}`}
// //                       style={{
// //                         marginBottom:
// //                           "12px",
// //                       }}
// //                     >
// //                       <strong>
// //                         {note.title}
// //                       </strong>

// //                       <p>
// //                         {
// //                           note.explanation
// //                         }
// //                       </p>
// //                     </div>
// //                   )
// //                 )}

// //               </div>
// //             )}


// //             {/* WARNINGS */}

// //             {codeResult.warnings.length >
// //               0 && (
// //               <div className="explanationBlock">

// //                 <h4>
// //                   Important notes
// //                 </h4>

// //                 {codeResult.warnings.map(
// //                   (
// //                     warning,
// //                     index
// //                   ) => (
// //                     <div
// //                       key={`${warning.title}-${index}`}
// //                       style={{
// //                         marginBottom:
// //                           "10px",
// //                       }}
// //                     >
// //                       <strong>
// //                         {
// //                           warning.title
// //                         }
// //                       </strong>

// //                       <p>
// //                         {
// //                           warning.message
// //                         }
// //                       </p>
// //                     </div>
// //                   )
// //                 )}

// //               </div>
// //             )}

// //           </div>
// //         )}


// //       {/* ===================================================
// //           ERROR EXPLANATION
// //           =================================================== */}

// //       {result &&
// //         currentMode ===
// //           "explain" && (
// //           <div className="debugResult">

// //             <div className="debugResultHeader">

// //               <div>
// //                 <span className="responseLabel">
// //                   ERROR DETECTED
// //                 </span>

// //                 <h3>
// //                   {result.title ||
// //                     result.error_type}
// //                 </h3>
// //               </div>

// //               <span className="localBadge">
// //                 {result.source ===
// //                 "modelmind-local"
// //                   ? "LOCAL"
// //                   : "ADVANCED"}
// //               </span>

// //             </div>


// //             <div
// //               style={{
// //                 display: "flex",
// //                 alignItems: "center",
// //                 gap: "6px",

// //                 marginBottom:
// //                   "12px",

// //                 fontSize:
// //                   "11px",

// //                 opacity: 0.7,
// //               }}
// //             >
// //               <span>
// //                 Explanation level:
// //               </span>

// //               <strong
// //                 style={{
// //                   color:
// //                     "#72e28a",
// //                 }}
// //               >
// //                 {learningLevel}
// //               </strong>
// //             </div>


// //             {result.line_number && (
// //               <div className="errorLocation">

// //                 <span>
// //                   Line{" "}
// //                   {result.line_number}
// //                 </span>

// //                 <code>
// //                   {result.failing_line}
// //                 </code>

// //               </div>
// //             )}


// //             <div className="explanationBlock">

// //               <h4>
// //                 What happened?
// //               </h4>

// //               <p>
// //                 {result.explanation}
// //               </p>

// //             </div>


// //             <div className="explanationBlock">

// //               <h4>
// //                 Python says
// //               </h4>

// //               <p>
// //                 {result.why}
// //               </p>

// //             </div>


// //             <div className="explanationBlock">

// //               <h4>
// //                 How do I solve it?
// //               </h4>

// //               <p>
// //                 {result.how_to_fix}
// //               </p>

// //             </div>


// //             {result.fixed_code && (
// //               <button
// //                 className="generateFixButton"
// //                 onClick={() =>
// //                   requestAI(
// //                     "fix"
// //                   )
// //                 }
// //               >
// //                 ✦ Show suggested fix
// //               </button>
// //             )}

// //           </div>
// //         )}


// //       {/* ===================================================
// //           FIX RESULT
// //           =================================================== */}

// //       {result &&
// //         currentMode ===
// //           "fix" &&
// //         result.fixed_code && (
// //           <div className="fixResult">

// //             <div className="fixResultHeader">

// //               <div>
// //                 <span className="responseLabel">
// //                   PROPOSED FIX
// //                 </span>

// //                 <h3>
// //                   Review changes
// //                 </h3>
// //               </div>

// //               <span className="reviewBadge">
// //                 REVIEW
// //               </span>

// //             </div>


// //             <p className="fixDescription">
// //               ModelMind will not change
// //               your code until you accept
// //               this suggestion.
// //             </p>


// //             <div className="codeDiff">

// //               <div className="codeDiffHeader">

// //                 <span>
// //                   Code changes
// //                 </span>

// //                 <span>
// //                   {changedLineCount}{" "}
// //                   change
// //                   {changedLineCount === 1
// //                     ? ""
// //                     : "s"}
// //                 </span>

// //               </div>


// //               <div className="diffCode">

// //                 {diffLines.map(
// //                   (
// //                     line,
// //                     index
// //                   ) => (
// //                     <div
// //                       key={`${index}-${line.type}`}
// //                       className={`diffLine ${
// //                         line.type ===
// //                         "removed"
// //                           ? "diffRemoved"
// //                           : line.type ===
// //                               "added"
// //                             ? "diffAdded"
// //                             : "diffSame"
// //                       }`}
// //                     >
// //                       <span className="diffSymbol">
// //                         {line.type ===
// //                         "removed"
// //                           ? "−"
// //                           : line.type ===
// //                               "added"
// //                             ? "+"
// //                             : " "}
// //                       </span>

// //                       <code>
// //                         {line.text ||
// //                           " "}
// //                       </code>

// //                     </div>
// //                   )
// //                 )}

// //               </div>

// //             </div>


// //             <div className="fixReason">

// //               <span className="fixReasonIcon">
// //                 ✦
// //               </span>

// //               <div>
// //                 <strong>
// //                   Why this change?
// //                 </strong>

// //                 <p>
// //                   {result.changes ||
// //                     result.how_to_fix}
// //                 </p>
// //               </div>

// //             </div>


// //             <div className="fixActionBar">

// //               <button
// //                 className="cancelFixButton"
// //                 onClick={
// //                   cancelFix
// //                 }
// //               >
// //                 Cancel
// //               </button>


// //               <button
// //                 className="acceptFixButton"
// //                 onClick={() =>
// //                   acceptFix(
// //                     false
// //                   )
// //                 }
// //               >
// //                 ✓ Accept Fix
// //               </button>


// //               <button
// //                 className="acceptRunButton"
// //                 onClick={() =>
// //                   acceptFix(
// //                     true
// //                   )
// //                 }
// //               >
// //                 ▶ Accept & Run
// //               </button>

// //             </div>


// //             <p className="fixSafetyText">
// //               Review AI-generated or
// //               automated changes before
// //               accepting them.
// //             </p>

// //           </div>
// //         )}

// //     </aside>
// //   );
// // }


// "use client";

// import {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import {
//   analyzePythonError,
//   AIErrorResult,
// } from "@/lib/api";

// import {
//   LearningLevel,
// } from "@/types/learning";

// import {
//   NotebookCellType,
// } from "@/types/notebook";


// interface Props {
//   action: string;

//   cell: NotebookCellType | null;

//   learningLevel: LearningLevel;

//   onAcceptFix: (
//     cellId: string,
//     correctedCode: string,
//     runAfterAccept: boolean
//   ) => void;
// }


// interface DiffLine {
//   type:
//     | "same"
//     | "removed"
//     | "added";

//   text: string;
// }


// /*
//  * Simple line-by-line diff.
//  *
//  * For our current ModelMind prototype:
//  *
//  * unchanged -> normal
//  * old       -> red
//  * new       -> green
//  *
//  * Later this can be replaced by a
//  * character-level diff engine.
//  */

// function createCodeDiff(
//   originalCode: string,
//   fixedCode: string
// ): DiffLine[] {
//   const oldLines =
//     originalCode.split("\n");

//   const newLines =
//     fixedCode.split("\n");

//   const result: DiffLine[] = [];

//   const maximumLength =
//     Math.max(
//       oldLines.length,
//       newLines.length
//     );

//   for (
//     let i = 0;
//     i < maximumLength;
//     i++
//   ) {
//     const oldLine = oldLines[i];
//     const newLine = newLines[i];

//     /*
//      * Same line.
//      */

//     if (oldLine === newLine) {
//       if (oldLine !== undefined) {
//         result.push({
//           type: "same",
//           text: oldLine,
//         });
//       }

//       continue;
//     }

//     /*
//      * Existing line changed / removed.
//      */

//     if (oldLine !== undefined) {
//       result.push({
//         type: "removed",
//         text: oldLine,
//       });
//     }

//     /*
//      * New line changed / added.
//      */

//     if (newLine !== undefined) {
//       result.push({
//         type: "added",
//         text: newLine,
//       });
//     }
//   }

//   return result;
// }


// export default function AITutor({
//   action,
//   cell,
//   learningLevel,
//   onAcceptFix,
// }: Props) {
//   const [
//     result,
//     setResult,
//   ] =
//     useState<AIErrorResult | null>(
//       null
//     );

//   const [
//     loading,
//     setLoading,
//   ] =
//     useState(false);

//   const [
//     message,
//     setMessage,
//   ] =
//     useState("");

//   const [
//     currentMode,
//     setCurrentMode,
//   ] =
//     useState<
//       "explain" | "fix" | null
//     >(null);


//   /*
//    * Reset previous analysis whenever
//    * another notebook cell is selected.
//    */

//   useEffect(() => {
//     setResult(null);
//     setMessage("");
//     setCurrentMode(null);
//   }, [cell?.id]);


//   /*
//    * When the user changes the GLOBAL
//    * ModelMind learning level, clear any
//    * previous explanation.
//    *
//    * This prevents an explanation generated
//    * at Basic level from remaining visible
//    * after switching to Medium or Advanced.
//    */

//   useEffect(() => {
//     setResult(null);

//     if (cell?.error) {
//       setMessage(
//         `Learning level changed to ${learningLevel}. Run Explain Error or Fix Error again to use this level.`
//       );
//     }
//   }, [
//     learningLevel,
//     cell?.error,
//   ]);


//   /*
//    * When the user clicks Explain Error /
//    * Fix Error underneath a notebook cell,
//    * remember which operation they want.
//    */

//   useEffect(() => {
//     if (!cell?.error) {
//       return;
//     }

//     if (action === "Explain Error") {
//       void requestAI("explain");
//     }

//     if (action === "Fix Error") {
//       void requestAI("fix");
//     }
//   }, [
//     action,
//     cell?.id,
//   ]);


//   /*
//    * Build red / green code preview.
//    */

//   const diffLines =
//     useMemo(() => {
//       if (
//         !cell ||
//         !result?.fixed_code
//       ) {
//         return [];
//       }

//       return createCodeDiff(
//         cell.content,
//         result.fixed_code
//       );
//     }, [
//       cell,
//       result,
//     ]);


//   const changedLineCount =
//     useMemo(() => {
//       return diffLines.filter(
//         (line) =>
//           line.type !== "same"
//       ).length;
//     }, [
//       diffLines,
//     ]);


//   /*
//    * Ask ModelMind Error Intelligence.
//    *
//    * IMPORTANT:
//    * learningLevel comes from the GLOBAL
//    * application setting.
//    *
//    * There is no independent AI Tutor
//    * Basic / Intermediate / Advanced state.
//    */

//   async function requestAI(
//     selectedAction:
//       | "explain"
//       | "fix"
//   ) {
//     if (!cell) {
//       setMessage(
//         "Select a notebook cell first."
//       );

//       return;
//     }

//     if (!cell.error) {
//       setMessage(
//         "Run the cell first so ModelMind can inspect the error."
//       );

//       return;
//     }

//     setLoading(true);
//     setResult(null);
//     setMessage("");

//     setCurrentMode(
//       selectedAction
//     );

//     try {
//       const response =
//         await analyzePythonError(
//           cell.content,
//           cell.error,
//           selectedAction,
//           learningLevel
//         );

//       setResult(response);

//       /*
//        * Local debugger understands the
//        * error but cannot safely rewrite it.
//        */

//       if (
//         selectedAction ===
//           "fix" &&
//         !response.fixed_code
//       ) {
//         setMessage(
//           response.handled
//             ? "ModelMind understands this error, but it cannot safely generate an automatic code change yet."
//             : "This error requires advanced analysis. The local engine will not guess a fix."
//         );
//       }
//     } catch (error) {
//       setMessage(
//         error instanceof Error
//           ? error.message
//           : "ModelMind could not analyze the error."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }


//   function cancelFix() {
//     setResult(null);

//     setCurrentMode(null);

//     setMessage(
//       "Fix cancelled. Your original code was not changed."
//     );
//   }


//   function acceptFix(
//     runAfterAccept: boolean
//   ) {
//     if (
//       !cell ||
//       !result?.fixed_code
//     ) {
//       return;
//     }

//     onAcceptFix(
//       cell.id,
//       result.fixed_code,
//       runAfterAccept
//     );

//     setResult(null);

//     setCurrentMode(null);

//     setMessage(
//       runAfterAccept
//         ? "Fix accepted. Running the corrected code..."
//         : "Fix accepted. The notebook cell has been updated."
//     );
//   }


//   return (
//     <aside className="aiPanel">

//       {/* ===================================================
//           HEADER
//           =================================================== */}

//       <div className="aiHeader">
//         <div>
//           <span className="aiBadge">
//             MODELMIND AI
//           </span>

//           <h3>
//             AI Debugging Tutor
//           </h3>
//         </div>
//       </div>


//       <p className="aiHelp">
//         Understand the problem before
//         changing your code.
//       </p>


//       {/* ===================================================
//           GLOBAL LEARNING LEVEL
//           =================================================== */}

//       <div
//         style={{
//           marginBottom: "14px",
//           padding: "10px 12px",

//           border:
//             "1px solid rgba(114,226,138,0.18)",

//           borderRadius: "8px",

//           background:
//             "rgba(114,226,138,0.05)",

//           display: "flex",
//           alignItems: "center",
//           justifyContent:
//             "space-between",

//           gap: "10px",

//           fontSize: "12px",
//         }}
//       >
//         <span
//           style={{
//             opacity: 0.65,
//           }}
//         >
//           Learning level
//         </span>

//         <strong
//           style={{
//             color: "#72e28a",
//           }}
//         >
//           {learningLevel}
//         </strong>
//       </div>


//       {/* ===================================================
//           TOOLS
//           =================================================== */}

//       <div className="aiTools">

//         <button
//           disabled={
//             loading ||
//             !cell?.error
//           }
//           onClick={() =>
//             requestAI(
//               "explain"
//             )
//           }
//         >
//           <span className="toolIcon">
//             ?
//           </span>

//           <span>
//             <strong>
//               Explain Error
//             </strong>

//             <small>
//               Understand why your
//               code failed.
//             </small>
//           </span>
//         </button>


//         <button
//           disabled={
//             loading ||
//             !cell?.error
//           }
//           onClick={() =>
//             requestAI(
//               "fix"
//             )
//           }
//         >
//           <span className="toolIcon">
//             ✦
//           </span>

//           <span>
//             <strong>
//               Fix Error
//             </strong>

//             <small>
//               Preview changes before
//               applying them.
//             </small>
//           </span>
//         </button>

//       </div>


//       {/* ===================================================
//           SELECTED CELL
//           =================================================== */}

//       {cell && (
//         <div className="selectedCellCard">

//           <span className="responseLabel">
//             SELECTED CELL
//           </span>

//           <pre className="contextPreview">
//             {cell.content}
//           </pre>

//         </div>
//       )}


//       {/* ===================================================
//           LOADING
//           =================================================== */}

//       {loading && (
//         <div className="debugLoading">

//           <div className="debugLoadingIcon">
//             ✦
//           </div>

//           <div>
//             <strong>
//               ModelMind is analyzing
//               your code
//             </strong>

//             <p>
//               Reading the traceback
//               and locating the cause...
//             </p>
//           </div>

//         </div>
//       )}


//       {/* ===================================================
//           MESSAGE
//           =================================================== */}

//       {message &&
//         !loading && (
//           <div className="aiMessage">
//             {message}
//           </div>
//         )}


//       {/* ===================================================
//           EXPLANATION RESULT
//           =================================================== */}

//       {result &&
//         currentMode ===
//           "explain" && (
//           <div className="debugResult">

//             <div className="debugResultHeader">

//               <div>
//                 <span className="responseLabel">
//                   ERROR DETECTED
//                 </span>

//                 <h3>
//                   {result.title ||
//                     result.error_type}
//                 </h3>
//               </div>

//               <span className="localBadge">
//                 {result.source ===
//                 "modelmind-local"
//                   ? "LOCAL"
//                   : "ADVANCED"}
//               </span>

//             </div>


//             {/* CURRENT GLOBAL LEVEL */}

//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",

//                 marginBottom:
//                   "12px",

//                 fontSize:
//                   "11px",

//                 opacity: 0.7,
//               }}
//             >
//               <span>
//                 Explanation level:
//               </span>

//               <strong
//                 style={{
//                   color:
//                     "#72e28a",
//                 }}
//               >
//                 {learningLevel}
//               </strong>
//             </div>


//             {result.line_number && (
//               <div className="errorLocation">

//                 <span>
//                   Line{" "}
//                   {result.line_number}
//                 </span>

//                 <code>
//                   {result.failing_line}
//                 </code>

//               </div>
//             )}


//             <div className="explanationBlock">

//               <h4>
//                 What happened?
//               </h4>

//               <p>
//                 {result.explanation}
//               </p>

//             </div>


//             <div className="explanationBlock">

//               <h4>
//                 Python says
//               </h4>

//               <p>
//                 {result.why}
//               </p>

//             </div>


//             <div className="explanationBlock">

//               <h4>
//                 How do I solve it?
//               </h4>

//               <p>
//                 {result.how_to_fix}
//               </p>

//             </div>


//             {result.fixed_code && (
//               <button
//                 className="generateFixButton"
//                 onClick={() =>
//                   requestAI(
//                     "fix"
//                   )
//                 }
//               >
//                 ✦ Show suggested fix
//               </button>
//             )}

//           </div>
//         )}


//       {/* ===================================================
//           FIX RESULT
//           =================================================== */}

//       {result &&
//         currentMode ===
//           "fix" &&
//         result.fixed_code && (
//           <div className="fixResult">

//             <div className="fixResultHeader">

//               <div>
//                 <span className="responseLabel">
//                   PROPOSED FIX
//                 </span>

//                 <h3>
//                   Review changes
//                 </h3>
//               </div>

//               <span className="reviewBadge">
//                 REVIEW
//               </span>

//             </div>


//             <p className="fixDescription">
//               ModelMind will not change
//               your code until you accept
//               this suggestion.
//             </p>


//             {/* =============================================
//                 RED / GREEN DIFF
//                 ============================================= */}

//             <div className="codeDiff">

//               <div className="codeDiffHeader">

//                 <span>
//                   Code changes
//                 </span>

//                 <span>
//                   {changedLineCount}{" "}
//                   change
//                   {changedLineCount === 1
//                     ? ""
//                     : "s"}
//                 </span>

//               </div>


//               <div className="diffCode">

//                 {diffLines.map(
//                   (
//                     line,
//                     index
//                   ) => (
//                     <div
//                       key={`${index}-${line.type}`}
//                       className={`diffLine ${
//                         line.type ===
//                         "removed"
//                           ? "diffRemoved"
//                           : line.type ===
//                               "added"
//                             ? "diffAdded"
//                             : "diffSame"
//                       }`}
//                     >
//                       <span className="diffSymbol">
//                         {line.type ===
//                         "removed"
//                           ? "−"
//                           : line.type ===
//                               "added"
//                             ? "+"
//                             : " "}
//                       </span>

//                       <code>
//                         {line.text ||
//                           " "}
//                       </code>

//                     </div>
//                   )
//                 )}

//               </div>

//             </div>


//             {/* =============================================
//                 WHY
//                 ============================================= */}

//             <div className="fixReason">

//               <span className="fixReasonIcon">
//                 ✦
//               </span>

//               <div>
//                 <strong>
//                   Why this change?
//                 </strong>

//                 <p>
//                   {result.changes ||
//                     result.how_to_fix}
//                 </p>
//               </div>

//             </div>


//             {/* =============================================
//                 ACTIONS
//                 ============================================= */}

//             <div className="fixActionBar">

//               <button
//                 className="cancelFixButton"
//                 onClick={
//                   cancelFix
//                 }
//               >
//                 Cancel
//               </button>


//               <button
//                 className="acceptFixButton"
//                 onClick={() =>
//                   acceptFix(
//                     false
//                   )
//                 }
//               >
//                 ✓ Accept Fix
//               </button>


//               <button
//                 className="acceptRunButton"
//                 onClick={() =>
//                   acceptFix(
//                     true
//                   )
//                 }
//               >
//                 ▶ Accept & Run
//               </button>

//             </div>


//             <p className="fixSafetyText">
//               Review AI-generated or
//               automated changes before
//               accepting them.
//             </p>

//           </div>
//         )}

//     </aside>
//   );
// }


"use client";



import {

  useEffect,

  useMemo,

  useState,

} from "react";



import {
  analyzePythonError,
  analyzePythonErrorWithGemini,
  connectGemini,
  disconnectGemini,
  getGeminiStatus,
  requiresAIFallback,
  AIErrorResult,
} from "@/lib/api";



import {

  LearningLevel,

} from "@/types/learning";



import {

  NotebookCellType,

} from "@/types/notebook";





interface Props {

  action: string;



  cell: NotebookCellType | null;



  learningLevel: LearningLevel;



  onAcceptFix: (


    cellId: string,

    correctedCode: string,

    runAfterAccept: boolean

  ) => void;

}





interface DiffLine {

  type:

    | "same"

    | "removed"

    | "added";



  text: string;

}





/*

 * Simple line-by-line diff.

 *

 * For our current ModelMind prototype:

 *

 * unchanged -> normal

 * old       -> red

 * new       -> green

 *

 * Later this can be replaced by a

 * character-level diff engine.

 */



function createCodeDiff(

  originalCode: string,

  fixedCode: string

): DiffLine[] {

  const oldLines =

    originalCode.split("\n");



  const newLines =

    fixedCode.split("\n");



  const result: DiffLine[] = [];



  const maximumLength =

    Math.max(

      oldLines.length,

      newLines.length

    );



  for (

    let i = 0;

    i < maximumLength;

    i++

  ) {

    const oldLine = oldLines[i];

    const newLine = newLines[i];



    /*

     * Same line.

     */



    if (oldLine === newLine) {

      if (oldLine !== undefined) {

        result.push({

          type: "same",

          text: oldLine,

        });

      }



      continue;

    }



    /*

     * Existing line changed / removed.

     */



    if (oldLine !== undefined) {

      result.push({

        type: "removed",

        text: oldLine,

      });

    }



    /*

     * New line changed / added.

     */



    if (newLine !== undefined) {

      result.push({

        type: "added",

        text: newLine,

      });

    }

  }



  return result;

}

interface GuidedSuggestion {
  title: string;
  explanation: string;
  code: string;
}


/*
 * Decide whether a single line looks like
 * executable Python rather than explanation text.
 */
function looksLikePythonLine(
  value: string
): boolean {
  const text = value.trim();

  if (!text) {
    return false;
  }

  return (
    text.startsWith("import ") ||
    text.startsWith("from ") ||
    text.startsWith("print(") ||
    text.startsWith("raise ") ||
    text.startsWith("return ") ||
    text.startsWith("try:") ||
    text.startsWith("except ") ||
    text.startsWith("finally:") ||
    text.startsWith("if ") ||
    text.startsWith("elif ") ||
    text.startsWith("else:") ||
    text.startsWith("for ") ||
    text.startsWith("while ") ||
    text.startsWith("with ") ||
    text.startsWith("def ") ||
    text.startsWith("class ") ||
    text.startsWith("assert ") ||
    text.startsWith("pass") ||
    text.startsWith("break") ||
    text.startsWith("continue") ||
    text.startsWith("df.") ||
    text.startsWith("X.") ||
    text.startsWith("y.") ||
    text.startsWith("model.") ||
    text.startsWith("torch.") ||
    text.startsWith("tf.") ||
    text.startsWith("np.") ||
    text.startsWith("pd.") ||
    /^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(text)
  );
}


/*
 * General code detector used elsewhere
 * in Guided Fix.
 *
 * IMPORTANT:
 * Multiline text by itself is NOT enough
 * to classify something as Python code.
 */
function looksLikeCode(
  value: string
): boolean {
  const text = value.trim();

  if (!text) {
    return false;
  }

  const lines = text.split("\n");

  return lines.some((line) =>
    looksLikePythonLine(line)
  );
}


function cleanCodeBlock(
  value: string
): string {
  return value
    .replace(
      /^```(?:python)?\s*/i,
      ""
    )
    .replace(
      /```\s*$/i,
      ""
    )
    .trim();
}


/*
 * Split a mixed Gemini suggestion such as:
 *
 * "Try this approach:
 *
 * try:
 *     ...
 * except ...:
 *     ..."
 *
 * into explanation + executable Python.
 */
function splitExplanationAndCode(
  value: string
): {
  explanation: string;
  code: string;
} {
  const raw = value.trim();

  if (!raw) {
    return {
      explanation: "",
      code: "",
    };
  }

  /*
   * First handle Markdown fenced code.
   */
  const fencedMatch = raw.match(
    /^([\s\S]*?)```(?:python)?\s*([\s\S]*?)```\s*$/i
  );

  if (fencedMatch) {
    return {
      explanation:
        fencedMatch[1].trim(),
      code: cleanCodeBlock(
        fencedMatch[2]
      ),
    };
  }

  const lines = raw.split("\n");

  /*
   * Find the first line that strongly
   * resembles Python.
   */
  const firstCodeLine =
    lines.findIndex((line) =>
      looksLikePythonLine(line)
    );

  if (firstCodeLine === -1) {
    return {
      explanation: raw,
      code: "",
    };
  }

  /*
   * Everything before the first Python
   * line is educational explanation.
   */
  const explanation = lines
    .slice(0, firstCodeLine)
    .join("\n")
    .trim()
    .replace(
      /(?:Example|Code|Try this):\s*$/i,
      ""
    )
    .trim();

  /*
   * Everything from the first Python
   * line onward is the proposed code.
   *
   * Preserve indentation exactly.
   */
  const code = lines
    .slice(firstCodeLine)
    .join("\n")
    .trim();

  return {
    explanation,
    code,
  };
}


function parseGuidedSuggestion(
  suggestion: string,
  index: number
): GuidedSuggestion {
  const raw = suggestion.trim();

  const separated =
    splitExplanationAndCode(raw);

  /*
   * Mixed explanation + Python.
   */
  if (
    separated.explanation &&
    separated.code
  ) {
    return {
      title: `Approach ${index + 1}`,
      explanation:
        separated.explanation,
      code: separated.code,
    };
  }

  /*
   * Pure Python suggestion.
   */
  if (
    !separated.explanation &&
    separated.code
  ) {
    return {
      title: `Approach ${index + 1}`,
      explanation:
        "Try this code-based approach.",
      code: separated.code,
    };
  }

  /*
   * Plain educational recommendation.
   */
  return {
    title: `Approach ${index + 1}`,
    explanation:
      separated.explanation || raw,
    code: "",
  };
}



export default function AITutor({

  action,

  cell,

  learningLevel,

  onAcceptFix,

}: Props) {

  const [

    result,

    setResult,

  ] =

    useState<AIErrorResult | null>(

      null

    );



  const [

    loading,

    setLoading,

  ] =

    useState(false);



  const [

    message,

    setMessage,

  ] =

    useState("");



  const [

    currentMode,

    setCurrentMode,

  ] =

    useState<

      "explain" | "fix" | null

    >(null);
      /* =========================================================
     GEMINI CONNECTION STATE
     ========================================================= */

  const [
    geminiConnected,
    setGeminiConnected,
  ] = useState(false);

  const [
    geminiStatusLoaded,
    setGeminiStatusLoaded,
  ] = useState(false);

  const [
    geminiKey,
    setGeminiKey,
  ] = useState("");

  const [
    geminiConnecting,
    setGeminiConnecting,
  ] = useState(false);

  const [
    showGeminiConnect,
    setShowGeminiConnect,
  ] = useState(false);

  const [
    pendingGeminiAction,
    setPendingGeminiAction,
  ] = useState<
    "explain" | "fix" | null
  >(null);

    
/* =========================================================
   LOAD SAVED GEMINI CONNECTION
   ========================================================= */

useEffect(() => {
  let active = true;

  async function loadGeminiStatus() {
    try {
      const status =
        await getGeminiStatus();

      if (!active) {
        return;
      }

      setGeminiConnected(
        status.connected
      );
    } catch {
      if (active) {
        setGeminiConnected(false);
      }
    } finally {
      if (active) {
        setGeminiStatusLoaded(true);
      }
    }
  }

  void loadGeminiStatus();

  return () => {
    active = false;
  };
}, []);





  /*

   * Reset previous analysis whenever

   * another notebook cell is selected.

   */



  useEffect(() => {

    setResult(null);

    setMessage("");

    setCurrentMode(null);

  }, [cell?.id]);





  /*

   * When the user changes the GLOBAL

   * ModelMind learning level, clear any

   * previous explanation.

   *

   * This prevents an explanation generated

   * at Basic level from remaining visible

   * after switching to Medium or Advanced.

   */



  useEffect(() => {

    setResult(null);



    if (cell?.error) {

      setMessage(

        `Learning level changed to ${learningLevel}. Run Explain Error or Fix Error again to use this level.`

      );

    }

  }, [

    learningLevel,

    cell?.error,

  ]);





  /*

   * When the user clicks Explain Error /

   * Fix Error underneath a notebook cell,

   * remember which operation they want.

   */



  useEffect(() => {

    if (!cell?.error) {

      return;

    }



    if (action === "Explain Error") {

      void requestAI("explain");

    }



    if (action === "Fix Error") {

      void requestAI("fix");

    }

  }, [

    action,

    cell?.id,

  ]);





  /*

   * Build red / green code preview.

   */



  const diffLines =

    useMemo(() => {

      if (

        !cell ||

        !result?.fixed_code

      ) {

        return [];

      }



      return createCodeDiff(

        cell.content,

        result.fixed_code

      );

    }, [

      cell,

      result,

    ]);





  const changedLineCount =

    useMemo(() => {

      return diffLines.filter(

        (line) =>

          line.type !== "same"

      ).length;

    }, [

      diffLines,

    ]);





  /*

   * Ask ModelMind Error Intelligence.

   *

   * IMPORTANT:

   * learningLevel comes from the GLOBAL

   * application setting.

   *

   * There is no independent AI Tutor

   * Basic / Intermediate / Advanced state.

   */


  /* =========================================================
   ADVANCED GEMINI ANALYSIS
   ========================================================= */

async function requestGeminiAnalysis(
  selectedAction: "explain" | "fix"
) {
  if (!cell?.error) {
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const advancedResult =
      await analyzePythonErrorWithGemini(
        cell.content,
        cell.error,
        selectedAction,
        learningLevel
      );

    setResult(advancedResult);

    setShowGeminiConnect(false);
    setPendingGeminiAction(null);

    if (
      selectedAction === "fix" &&
      !advancedResult.fixed_code &&
      !advancedResult.suggestions?.length
    ) {
      setMessage(
        "Advanced analysis completed, but no safe automatic rewrite was produced."
      );
    }
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Advanced AI analysis failed."
    );
  } finally {
    setLoading(false);
  }
}


/* =========================================================
   CONNECT GEMINI ONCE
   ========================================================= */

async function handleConnectGemini() {
  const cleanKey = geminiKey.trim();

  if (!cleanKey) {
    setMessage(
      "Enter your Gemini API key."
    );

    return;
  }

  setGeminiConnecting(true);
  setMessage("");

  try {
    await connectGemini(cleanKey);

    /*
     * Remove the raw key from React state
     * immediately after the backend accepts it.
     */
    setGeminiKey("");

    setGeminiConnected(true);
    setShowGeminiConnect(false);

    setMessage(
      "Gemini connected successfully."
    );

    /*
     * Continue the error analysis that caused
     * the connection prompt.
     */
    if (pendingGeminiAction) {
      const requestedAction =
        pendingGeminiAction;

      setPendingGeminiAction(null);

      await requestGeminiAnalysis(
        requestedAction
      );
    }
  } catch (error) {
    setGeminiConnected(false);

    setMessage(
      error instanceof Error
        ? error.message
        : "Could not connect Gemini."
    );
  } finally {
    setGeminiConnecting(false);
  }
}


/* =========================================================
   REMOVE SAVED GEMINI CONNECTION
   ========================================================= */

async function handleDisconnectGemini() {
  try {
    await disconnectGemini();

    setGeminiConnected(false);
    setGeminiKey("");
    setShowGeminiConnect(false);
    setPendingGeminiAction(null);

    setMessage(
      "Gemini connection removed."
    );
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Could not remove Gemini connection."
    );
  }
}
  async function requestAI(
  selectedAction:
    | "explain"
    | "fix"
) {
  if (!cell) {
    setMessage(
      "Select a notebook cell first."
    );

    return;
  }

  if (!cell.error) {
    setMessage(
      "Run the cell first so ModelMind can inspect the error."
    );

    return;
  }

  setLoading(true);
  setResult(null);
  setMessage("");
  setCurrentMode(
    selectedAction
  );

  setShowGeminiConnect(false);
  setPendingGeminiAction(null);

  try {
    /*
     * =====================================================
     * STAGE 1
     * Always run ModelMind locally first.
     * =====================================================
     */

    const response =
      await analyzePythonError(
        cell.content,
        cell.error,
        selectedAction,
        learningLevel
      );

    /*
     * =====================================================
     * STAGE 2
     * Decide whether advanced AI is actually required.
     *
     * IMPORTANT:
     * Missing fixed_code does NOT trigger Gemini.
     *
     * Only:
     *   !handled
     * OR
     *   confidence < 0.70
     * =====================================================
     */

    const needsGemini =
      requiresAIFallback(
        response
      );

    if (!needsGemini) {
      /*
       * Local ModelMind result wins.
       *
       * Gemini is never contacted here.
       */
      setResult(response);

      if (
        selectedAction === "fix" &&
        !response.fixed_code
      ) {
        /*
         * This intentionally remains local.
         *
         * Guided Fix 2.0 can display suggestions,
         * diagnostics and educational guidance
         * without requiring an automatic rewrite.
         */
        setMessage("");
      }

      return;
    }

    /*
     * =====================================================
     * STAGE 3
     * Local confidence is insufficient.
     * =====================================================
     */

    if (geminiConnected) {
      /*
       * User already connected Gemini previously.
       *
       * No API-key prompt.
       */
      setLoading(false);

      await requestGeminiAnalysis(
        selectedAction
      );

      return;
    }

    /*
     * Gemini is genuinely needed, but has never
     * been connected (or was disconnected).
     */

    setResult(response);

    setPendingGeminiAction(
      selectedAction
    );

    setShowGeminiConnect(true);

    setMessage(
      "ModelMind needs advanced AI analysis for this error. Connect Gemini once to continue."
    );
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "ModelMind could not analyze the error."
    );
  } finally {
    setLoading(false);
  }
}





  function cancelFix() {

    setResult(null);



    setCurrentMode(null);



    setMessage(

      "Fix cancelled. Your original code was not changed."

    );

  }





  function acceptFix(

    runAfterAccept: boolean

  ) {

    if (

      !cell ||

      !result?.fixed_code

    ) {

      return;

    }



    onAcceptFix(

      cell.id,

      result.fixed_code,

      runAfterAccept

    );



    setResult(null);



    setCurrentMode(null);



    setMessage(

      runAfterAccept

        ? "Fix accepted. Running the corrected code..."

        : "Fix accepted. The notebook cell has been updated."

    );

  }
    async function copyGuidedCode(
    code: string
  ) {
    if (!code.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        code
      );

      setMessage(
        "Code copied to clipboard."
      );
    } catch {
      setMessage(
        "Could not copy the code."
      );
    }
  }


  function insertGuidedCode(
    code: string
  ) {
    if (!code.trim()) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(
        "modelmind-insert-guided-code",
        {
          detail: {
            code,
          },
        }
      )
    );

    setMessage(
      "Guided code inserted into a new notebook cell."
    );
  }





  return (

    <aside className="aiPanel">



      {/* ===================================================

          HEADER

          =================================================== */}



      <div className="aiHeader">

        <div>

          <span className="aiBadge">

            MODELMIND AI

          </span>



          <h3>

            AI Debugging Tutor

          </h3>

        </div>

      </div>





      <p className="aiHelp">

        Understand the problem before

        changing your code.

      </p>





      {/* ===================================================

          GLOBAL LEARNING LEVEL

          =================================================== */}



      <div

        style={{

          marginBottom: "14px",

          padding: "10px 12px",



          border:

            "1px solid rgba(114,226,138,0.18)",



          borderRadius: "8px",



          background:

            "rgba(114,226,138,0.05)",



          display: "flex",

          alignItems: "center",

          justifyContent:

            "space-between",



          gap: "10px",



          fontSize: "12px",

        }}

      >

        <span

          style={{

            opacity: 0.65,

          }}

        >

          Learning level

        </span>



        <strong

          style={{

            color: "#72e28a",

          }}

        >

          {learningLevel}

        </strong>

      </div>





      {/* ===================================================

          TOOLS

          =================================================== */}



      <div className="aiTools">



        <button

          disabled={

            loading ||

            !cell?.error

          }

          onClick={() =>

            requestAI(

              "explain"

            )

          }

        >

          <span className="toolIcon">

            ?

          </span>



          <span>

            <strong>

              Explain Error

            </strong>



            <small>

              Understand why your

              code failed.

            </small>

          </span>

        </button>





        <button

          disabled={

            loading ||

            !cell?.error

          }

          onClick={() =>

            requestAI(

              "fix"

            )

          }

        >

          <span className="toolIcon">

            ✦

          </span>



          <span>

            <strong>

              Fix Error

            </strong>



            <small>

              Preview changes before

              applying them.

            </small>

          </span>

        </button>



      </div>





      {/* ===================================================

          SELECTED CELL

          =================================================== */}



      {cell && (

        <div className="selectedCellCard">



          <span className="responseLabel">

            SELECTED CELL

          </span>



          <pre className="contextPreview">

            {cell.content}

          </pre>



        </div>

      )}





      {/* ===================================================

          LOADING

          =================================================== */}



      {loading && (

        <div className="debugLoading">



          <div className="debugLoadingIcon">

            ✦

          </div>



          <div>

            <strong>

              ModelMind is analyzing

              your code

            </strong>



            <p>

              Reading the traceback

              and locating the cause...

            </p>

          </div>



        </div>

      )}





      {/* ===================================================

          MESSAGE

          =================================================== */}



      {message &&

        !loading && (

          <div className="aiMessage">

            {message}

          </div>

        )}
        {/* ===================================================
    GEMINI ADVANCED AI CONNECTION
    =================================================== */}

{geminiStatusLoaded &&
  geminiConnected &&
  !showGeminiConnect && (
    <div
      style={{
        marginTop: "12px",
        padding: "10px 12px",
        border:
          "1px solid rgba(114,226,138,0.22)",
        borderRadius: "9px",
        background:
          "rgba(114,226,138,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        gap: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          fontSize: "12px",
        }}
      >
        <span
          style={{
            color: "#72e28a",
          }}
        >
          ●
        </span>

        <span>
          Gemini connected
        </span>
      </div>

      <button
        type="button"
        onClick={() =>
          void handleDisconnectGemini()
        }
        style={{
          padding: "5px 8px",
          borderRadius: "6px",
          border:
            "1px solid rgba(255,255,255,0.12)",
          background:
            "rgba(255,255,255,0.04)",
          color: "inherit",
          cursor: "pointer",
          fontSize: "10px",
        }}
      >
        Remove
      </button>
    </div>
  )}


{showGeminiConnect &&
  !geminiConnected && (
    <div
      style={{
        marginTop: "12px",
        padding: "14px",
        border:
          "1px solid rgba(114,226,138,0.22)",
        borderRadius: "10px",
        background:
          "rgba(114,226,138,0.05)",
      }}
    >
      <span className="responseLabel">
        ADVANCED AI
      </span>

      <h4
        style={{
          margin:
            "8px 0 6px",
        }}
      >
        Connect Gemini
      </h4>

      <p
        style={{
          margin:
            "0 0 12px",
          opacity: 0.72,
          fontSize: "12px",
          lineHeight: 1.5,
        }}
      >
        ModelMind&apos;s local
        engine could not confidently
        solve this error. Connect your
        Gemini API key once for advanced
        analysis.
      </p>

      <input
        type="password"
        value={geminiKey}
        onChange={(event) =>
          setGeminiKey(
            event.target.value
          )
        }
        placeholder="Gemini API key"
        autoComplete="off"
        spellCheck={false}
        style={{
          width: "100%",
          boxSizing:
            "border-box",
          padding:
            "9px 10px",
          borderRadius: "7px",
          border:
            "1px solid rgba(255,255,255,0.14)",
          background:
            "rgba(0,0,0,0.20)",
          color: "inherit",
          outline: "none",
          fontSize: "12px",
        }}
      />

      <p
        style={{
          margin:
            "7px 0 10px",
          opacity: 0.55,
          fontSize: "10px",
          lineHeight: 1.45,
        }}
      >
        The key is sent only to your
        local ModelMind backend and is
        not inserted into notebook code.
      </p>

      <button
        type="button"
        disabled={
          geminiConnecting ||
          !geminiKey.trim()
        }
        onClick={() =>
          void handleConnectGemini()
        }
        style={{
          width: "100%",
          padding:
            "9px 12px",
          borderRadius: "7px",
          border:
            "1px solid rgba(114,226,138,0.30)",
          background:
            "rgba(114,226,138,0.10)",
          color: "inherit",
          cursor:
            geminiConnecting
              ? "wait"
              : "pointer",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        {geminiConnecting
          ? "Connecting..."
          : "Save & Connect"}
      </button>
    </div>
  )}





      {/* ===================================================

          EXPLANATION RESULT

          =================================================== */}



      {result &&

        currentMode ===

          "explain" && (

          <div className="debugResult">



            <div className="debugResultHeader">



              <div>

                <span className="responseLabel">

                  ERROR DETECTED

                </span>



                <h3>

                  {result.title ||

                    result.error_type}

                </h3>

              </div>



              <span className="localBadge">

                {result.source ===

                "modelmind-local"

                  ? "LOCAL"

                  : "ADVANCED"}

              </span>



            </div>





            {/* CURRENT GLOBAL LEVEL */}



            <div

              style={{

                display: "flex",

                alignItems: "center",

                gap: "6px",



                marginBottom:

                  "12px",



                fontSize:

                  "11px",



                opacity: 0.7,

              }}

            >

              <span>

                Explanation level:

              </span>



              <strong

                style={{

                  color:

                    "#72e28a",

                }}

              >

                {learningLevel}

              </strong>

            </div>





            {result.line_number && (

              <div className="errorLocation">



                <span>

                  Line{" "}

                  {result.line_number}

                </span>



                <code>

                  {result.failing_line}

                </code>



              </div>

            )}





            <div className="explanationBlock">



              <h4>

                What happened?

              </h4>



              <p>

                {result.explanation}

              </p>



            </div>





            <div className="explanationBlock">



              <h4>

                Python says

              </h4>



              <p>

                {result.why}

              </p>



            </div>





            <div className="explanationBlock">



              <h4>

                How do I solve it?

              </h4>



              <p>

                {result.how_to_fix}

              </p>



            </div>





            {result.fixed_code && (

              <button

                className="generateFixButton"

                onClick={() =>

                  requestAI(

                    "fix"

                  )

                }

              >

                ✦ Show suggested fix

              </button>

            )}



          </div>

        )}





                  {/* ===================================================
          GUIDED FIX 2.0
          =================================================== */}

      {result &&
        currentMode === "fix" &&
        !result.fixed_code &&
        result.handled &&
        !loading && (
          <div className="fixResult">

            <div className="fixResultHeader">
              <div>
                <span className="responseLabel">
                  GUIDED FIX
                </span>

                <h3>
                  {result.title ||
                    result.error_type}
                </h3>
              </div>

              <span className="reviewBadge">
                REVIEW
              </span>
            </div>


            <p className="fixDescription">
              ModelMind understands this error,
              but more than one correction may be
              valid. Your original code has not
              been changed.
            </p>


            <div className="explanationBlock">
              <h4>
                What happened?
              </h4>

              <p>
                {result.explanation}
              </p>
            </div>


            {result.why && (
              <div className="explanationBlock">
                <h4>
                  Why did it fail?
                </h4>

                <p>
                  {result.why}
                </p>
              </div>
            )}


            {result.how_to_fix && (
              <div className="explanationBlock">
                <h4>
                  How can I fix it?
                </h4>

                <p>
                  {result.how_to_fix}
                </p>
              </div>
            )}


            {result.suggestions &&
              result.suggestions.length >
                0 && (
                <div className="explanationBlock">

                  <h4>
                    Possible approaches
                  </h4>

                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      marginTop: "10px",
                    }}
                  >
                    {result.suggestions.map(
                      (
                        suggestion,
                        index
                      ) => {
                        const parsed =
                          parseGuidedSuggestion(
                            suggestion,
                            index
                          );

                        return (
                          <div
                            key={`${index}-${suggestion}`}
                            style={{
                              border:
                                "1px solid rgba(255,255,255,0.10)",
                              borderRadius:
                                "10px",
                              background:
                                "rgba(255,255,255,0.025)",
                              overflow:
                                "hidden",
                            }}
                          >

                            <div
                              style={{
                                padding:
                                  "12px 14px",
                              }}
                            >
                              <strong
                                style={{
                                  display:
                                    "block",
                                  marginBottom:
                                    "6px",
                                  fontSize:
                                    "13px",
                                }}
                              >
                                {
                                  parsed.title
                                }
                              </strong>

                              <p
                                style={{
                                  margin: 0,
                                  opacity:
                                    0.78,
                                  lineHeight:
                                    1.55,
                                  fontSize:
                                    "12px",
                                }}
                              >
                                {
                                  parsed.explanation
                                }
                              </p>
                            </div>


                            {parsed.code && (
                              <>
                                <div
                                  style={{
                                    borderTop:
                                      "1px solid rgba(255,255,255,0.08)",
                                    background:
                                      "rgba(0,0,0,0.22)",
                                  }}
                                >
                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      justifyContent:
                                        "space-between",
                                      alignItems:
                                        "center",
                                      padding:
                                        "7px 10px",
                                      borderBottom:
                                        "1px solid rgba(255,255,255,0.06)",
                                      fontSize:
                                        "10px",
                                      opacity:
                                        0.65,
                                    }}
                                  >
                                    <span>
                                      PYTHON
                                    </span>

                                    <span>
                                      Suggested
                                      diagnostic
                                    </span>
                                  </div>

                                  <pre
                                    style={{
                                      margin: 0,
                                      padding:
                                        "12px",
                                      overflowX:
                                        "auto",
                                      whiteSpace:
                                        "pre",
                                      fontSize:
                                        "12px",
                                      lineHeight:
                                        1.6,
                                    }}
                                  >
                                    <code>
                                      {
                                        parsed.code
                                      }
                                    </code>
                                  </pre>
                                </div>


                                <div
                                  style={{
                                    display:
                                      "flex",
                                    gap: "8px",
                                    padding:
                                      "10px",
                                    borderTop:
                                      "1px solid rgba(255,255,255,0.06)",
                                    flexWrap:
                                      "wrap",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void copyGuidedCode(
                                        parsed.code
                                      )
                                    }
                                    style={{
                                      padding:
                                        "7px 10px",
                                      borderRadius:
                                        "7px",
                                      border:
                                        "1px solid rgba(255,255,255,0.14)",
                                      background:
                                        "rgba(255,255,255,0.05)",
                                      color:
                                        "inherit",
                                      cursor:
                                        "pointer",
                                      fontSize:
                                        "11px",
                                    }}
                                  >
                                    Copy Code
                                  </button>


                                  <button
                                    type="button"
                                    onClick={() =>
                                      insertGuidedCode(
                                        parsed.code
                                      )
                                    }
                                    style={{
                                      padding:
                                        "7px 10px",
                                      borderRadius:
                                        "7px",
                                      border:
                                        "1px solid rgba(114,226,138,0.30)",
                                      background:
                                        "rgba(114,226,138,0.10)",
                                      color:
                                        "inherit",
                                      cursor:
                                        "pointer",
                                      fontSize:
                                        "11px",
                                    }}
                                  >
                                    + Insert into
                                    New Cell
                                  </button>
                                </div>
                              </>
                            )}

                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}


            {result.changes && (
              <div className="explanationBlock">
                <h4>
                  Recommended diagnostic
                </h4>

                {looksLikeCode(
                  result.changes
                ) ? (
                  <>
                    <pre
                      style={{
                        margin:
                          "10px 0 0",
                        padding:
                          "12px",
                        overflowX:
                          "auto",
                        whiteSpace:
                          "pre",
                        borderRadius:
                          "8px",
                        background:
                          "rgba(0,0,0,0.22)",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        fontSize:
                          "12px",
                        lineHeight:
                          1.6,
                      }}
                    >
                      <code>
                        {
                          result.changes
                        }
                      </code>
                    </pre>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        marginTop:
                          "8px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void copyGuidedCode(
                            result.changes
                          )
                        }
                      >
                        Copy Code
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          insertGuidedCode(
                            result.changes
                          )
                        }
                      >
                        + Insert into
                        New Cell
                      </button>
                    </div>
                  </>
                ) : (
                  <p>
                    {result.changes}
                  </p>
                )}
              </div>
            )}


            <p className="fixSafetyText">
              ModelMind did not automatically
              rewrite this cell because choosing
              a solution without knowing your
              intention could change the meaning
              of your program.
            </p>

          </div>
        )}

{/* ===================================================

          FIX RESULT

          =================================================== */}



      {result &&

        currentMode ===

          "fix" &&

        result.fixed_code && (

          <div className="fixResult">



            <div className="fixResultHeader">



              <div>

                <span className="responseLabel">

                  PROPOSED FIX

                </span>



                <h3>

                  Review changes

                </h3>

              </div>



              <span className="reviewBadge">

                REVIEW

              </span>



            </div>





            <p className="fixDescription">

              ModelMind will not change

              your code until you accept

              this suggestion.

            </p>





            {/* =============================================

                RED / GREEN DIFF

                ============================================= */}



            <div className="codeDiff">



              <div className="codeDiffHeader">



                <span>

                  Code changes

                </span>



                <span>

                  {changedLineCount}{" "}

                  change

                  {changedLineCount === 1

                    ? ""

                    : "s"}

                </span>



              </div>





              <div className="diffCode">



                {diffLines.map(

                  (

                    line,

                    index

                  ) => (

                    <div

                      key={`${index}-${line.type}`}

                      className={`diffLine ${

                        line.type ===

                        "removed"

                          ? "diffRemoved"

                          : line.type ===

                              "added"

                            ? "diffAdded"

                            : "diffSame"

                      }`}

                    >

                      <span className="diffSymbol">

                        {line.type ===

                        "removed"

                          ? "−"

                          : line.type ===

                              "added"

                            ? "+"

                            : " "}

                      </span>



                      <code>

                        {line.text ||

                          " "}

                      </code>



                    </div>

                  )

                )}



              </div>



            </div>





            {/* =============================================

                WHY

                ============================================= */}



            <div className="fixReason">



              <span className="fixReasonIcon">

                ✦

              </span>



              <div>

                <strong>

                  Why this change?

                </strong>



                <p>

                  {result.changes ||

                    result.how_to_fix}

                </p>

              </div>



            </div>





            {/* =============================================

                ACTIONS

                ============================================= */}



            <div className="fixActionBar">



              <button

                className="cancelFixButton"

                onClick={

                  cancelFix

                }

              >

                Cancel

              </button>





              <button

                className="acceptFixButton"

                onClick={() =>

                  acceptFix(

                    false

                  )

                }

              >

                ✓ Accept Fix

              </button>





              <button

                className="acceptRunButton"

                onClick={() =>

                  acceptFix(

                    true

                  )

                }

              >

                ▶ Accept & Run

              </button>



            </div>





            <p className="fixSafetyText">

              Review AI-generated or

              automated changes before

              accepting them.

            </p>



          </div>

        )}



    </aside>

  );

}
