// "use client";



// import {
//   useEffect,
//   useState,
// } from "react";
// import RoadmapNativeVisualization from "./visualizations/RoadmapNativeVisualization";



// import type {

//   LessonContent,

// } from "../../types/roadmap";

// import RoadmapPracticeViewer from "./RoadmapPracticeViewer";
// import RoadmapModelDeepDive from "./RoadmapModelDeepDive";





// type LessonStage =

//   | "learn"

//   | "visualize"

//   | "code"

//   | "practice";





// interface RoadmapLessonViewerProps {

//   lesson: LessonContent;



//   learnCompleted?: boolean;



//   visualizeCompleted?: boolean;



//   codeCompleted?: boolean;



//   practiceCompleted?: boolean;

//   completedPracticeProblemIds?: string[];

// onPracticeProblemComplete?: (
//   problemId: string
// ) => void;



//   onLearnComplete?: () => void;



//   onVisualizeComplete?: () => void;



//   onCodeComplete?: () => void;



//   onPracticeComplete?: () => void;

// }

// const MODEL_LESSON_IDS = new Set([
//   // Classification
//   "logistic-regression",
//   "knn",
//   "naive-bayes",
//   "decision-tree",
//   "random-forest",
//   "svm",

//   // Regression / optimization
//   "gradient-descent",
//   "polynomial-regression",
//   "regularization",

//   // Unsupervised
//   "clustering-evaluation",
// ]);

// function isModelDeepDiveLesson(lesson: LessonContent) {
//   return false;
// }

// export default function RoadmapLessonViewer({

//   lesson,

//   learnCompleted = false,

//   visualizeCompleted = false,

//   codeCompleted = false,

//   practiceCompleted = false,
//   completedPracticeProblemIds = [],

//   onLearnComplete,

//   onVisualizeComplete,

//   onCodeComplete,

//   onPracticeComplete,
//   onPracticeProblemComplete,

// }: RoadmapLessonViewerProps) {

//   const [activeStage, setActiveStage] =

//     useState<LessonStage>("learn");



//   const [

//     activeSectionIndex,

//     setActiveSectionIndex,

//   ] = useState(0);

//   const [

//   completedSectionIds,

//   setCompletedSectionIds,

// ] = useState<string[]>(

//   () =>

//     learnCompleted

//       ? lesson.sections.map(

//           (section) =>

//             section.id

//         )

//       : []

// );




//   // =========================================================
// // RESET VIEWER WHEN LESSON CHANGES
// // =========================================================
// //
// // A RoadmapLessonViewer instance can receive a different
// // lesson when the learner moves between roadmap topics.
// //
// // React preserves local component state unless we reset it.
// // Without this reset, the previous lesson can leave behind:
// //
// // - its active section
// // - its active stage
// // - its completed section IDs
// // - its displayed lesson progress
// //
// // This keeps every skill lesson independent.
// // =========================================================

// useEffect(() => {
//   setActiveStage("learn");

//   setActiveSectionIndex(0);

//   setCompletedSectionIds(
//     learnCompleted
//       ? lesson.sections.map(
//           (section) =>
//             section.id
//         )
//       : []
//   );
// }, [
//   lesson.id,
//   learnCompleted,
// ]);
//   const activeSection =

//     lesson.sections[

//       activeSectionIndex

//     ];





//   const goToPreviousSection = () => {

//     setActiveSectionIndex(

//       (current) =>

//         Math.max(

//           current - 1,

//           0

//         )

//     );

//   };





//   const goToNextSection = () => {

//     setActiveSectionIndex(

//       (current) =>

//         Math.min(

//           current + 1,

//           lesson.sections.length - 1

//         )

//     );

//   };





//   /*
//  * Overall lesson progress must be based on
//  * persisted roadmap activity state.
//  *
//  * Each lesson has four learning stages:
//  *
//  * Learn
//  * Visualize
//  * Code
//  * Practice
//  *
//  * These values come from the roadmap and
//  * therefore survive browser refresh.
//  */
// const completedLessonStages = [
//   learnCompleted,
//   visualizeCompleted,
//   codeCompleted,
//   practiceCompleted,
// ].filter(Boolean).length;

// const lessonProgress =
//   Math.round(
//     (completedLessonStages / 4) *
//       100
//   );





// const activeSectionCompleted =

//   activeSection

//     ? completedSectionIds.includes(

//         activeSection.id

//       )

//     : false;
//   const usesModelDeepDiveLayout =
//   isModelDeepDiveLesson(lesson);
//   console.log("MODEL DEEP DIVE DEBUG", {
//   lessonId: lesson.id,
//   skillId: lesson.skillId,
//   title: lesson.title,
//   hasModelDeepDive: Boolean(lesson.modelDeepDive),
//   modelDeepDive: lesson.modelDeepDive,
// });

// const completeModelLearnStage = () => {
//   if (learnCompleted) {
//     return;
//   }

//   /*
//    * Model lessons use a grouped deep-dive UI instead of
//    * exposing every internal content section separately.
//    *
//    * We still mark the existing section IDs complete locally
//    * so the underlying lesson structure remains untouched.
//    * Persisted Learn completion continues through the same
//    * existing onLearnComplete callback.
//    */
//   setCompletedSectionIds(
//     lesson.sections.map(
//       (section) => section.id
//     )
//   );

//   onLearnComplete?.();
// };





// const markCurrentSectionComplete = () => {

//   if (!activeSection) {

//     return;

//   }



//   if (activeSectionCompleted) {

//     return;

//   }



//   const updated = [

//     ...completedSectionIds,

//     activeSection.id,

//   ];



//   setCompletedSectionIds(

//     updated

//   );



//   if (

//     updated.length ===

//     lesson.sections.length

//   ) {

//     onLearnComplete?.();

//   }

// };





// const completeAndContinue = () => {

//   if (!activeSection) {

//     return;

//   }



//   let updated =

//     completedSectionIds;



//   if (!activeSectionCompleted) {

//     updated = [

//       ...completedSectionIds,

//       activeSection.id,

//     ];



//     setCompletedSectionIds(

//       updated

//     );



//     if (

//       updated.length ===

//       lesson.sections.length

//     ) {

//       onLearnComplete?.();

//     }

//   }



//   if (

//     activeSectionIndex <

//     lesson.sections.length - 1

//   ) {

//     goToNextSection();

//   }

// };





//   return (

//     <div className="lesson-viewer">

//       <header className="lesson-viewer-header">

//         <div>

//           <span className="roadmap-section-label">

//             DEEP LESSON

//           </span>



//           <h3 className="lesson-viewer-title">

//             {lesson.title}

//           </h3>



//           {lesson.subtitle && (

//             <p className="lesson-viewer-subtitle">

//               {lesson.subtitle}

//             </p>

//           )}

//         </div>



//         <div className="lesson-viewer-progress">

//           <div className="lesson-viewer-progress-meta">

//             <span>

//               Lesson progress

//             </span>



//             <strong>

//               {lessonProgress}%

//             </strong>

//           </div>



//           <div className="lesson-viewer-progress-track">

//             <div

//               className="lesson-viewer-progress-fill"

//               style={{

//                 width:

//                   `${lessonProgress}%`,

//               }}

//             />

//           </div>

//         </div>

//       </header>





//       <nav

//         className="lesson-stage-tabs"

//         aria-label="Lesson stages"

//       >

//         <button

//           type="button"

//           className={

//             activeStage === "learn"

//               ? "lesson-stage-tab lesson-stage-tab-active"

//               : "lesson-stage-tab"

//           }

//           onClick={() =>

//             setActiveStage("learn")

//           }

//         >

//           <span>01</span>

//           Learn

//         </button>



//         <button

//           type="button"

//           className={

//             activeStage ===

//             "visualize"

//               ? "lesson-stage-tab lesson-stage-tab-active"

//               : "lesson-stage-tab"

//           }

//           onClick={() =>

//             setActiveStage(

//               "visualize"

//             )

//           }

//         >

//           <span>02</span>

//           Visualize

//         </button>



//         <button

//           type="button"

//           className={

//             activeStage === "code"

//               ? "lesson-stage-tab lesson-stage-tab-active"

//               : "lesson-stage-tab"

//           }

//           onClick={() =>

//             setActiveStage("code")

//           }

//         >

//           <span>03</span>

//           Code

//         </button>



//         <button

//           type="button"

//           className={

//             activeStage ===

//             "practice"

//               ? "lesson-stage-tab lesson-stage-tab-active"

//               : "lesson-stage-tab"

//           }

//           onClick={() =>

//             setActiveStage(

//               "practice"

//             )

//           }

//         >

//           <span>04</span>

//           Practice

//         </button>

//       </nav>





//       {activeStage === "learn" && (
//   usesModelDeepDiveLayout ? (
//     <section className="lesson-model-learning-experience">
//       <RoadmapModelDeepDive
//   deepDive={lesson.modelDeepDive}
//   sections={lesson.sections}
// />

//       <div className="lesson-model-learn-completion">
//         <div>
//           <strong>
//             Model learning stage
//           </strong>

//           <p>
//             Explore the model through the
//             structured deep-dive categories above.
//             Your detailed lesson content remains
//             available inside the model learning
//             experience.
//           </p>
//         </div>

//         <button
//           type="button"
//           className="day-complete-button"
//           disabled={learnCompleted}
//           onClick={completeModelLearnStage}
//         >
//           {learnCompleted
//             ? "Learn Stage Completed ✓"
//             : "Complete Learn Stage"}
//         </button>
//       </div>
//     </section>
//   ) : (
//     <div className="lesson-learn-layout">

//           <aside className="lesson-section-navigation">

//             <div className="lesson-section-navigation-header">

//               <span>

//                 LESSON SECTIONS

//               </span>



//               <strong>

//                 {

//                   lesson.sections

//                     .length

//                 }

//               </strong>

//             </div>



//             <div className="lesson-section-list">

//               {lesson.sections.map(

//                 (

//                   section,

//                   index

//                 ) => (

//                   <button

//                     key={

//                       section.id

//                     }

//                     type="button"

//                     className={

//                       index ===

//                       activeSectionIndex

//                         ? "lesson-section-button lesson-section-button-active"

//                         : "lesson-section-button"

//                     }

//                     onClick={() =>

//                       setActiveSectionIndex(

//                         index

//                       )

//                     }

//                   >

//                     <span className="lesson-section-number">

//   {completedSectionIds.includes(

//     section.id

//   )

//     ? "✓"

//     : String(

//         index + 1

//       ).padStart(

//         2,

//         "0"

//       )}

// </span>



//                     <span className="lesson-section-name">

//                       {

//                         section.title

//                       }

//                     </span>

//                   </button>

//                 )

//               )}

//             </div>

//           </aside>





//           {activeSection && (

//             <article className="lesson-content-panel">

//               <header className="lesson-content-header">

//                 <span className="lesson-content-counter">

//                   SECTION{" "}

//                   {activeSectionIndex +

//                     1}{" "}

//                   OF{" "}

//                   {

//                     lesson.sections

//                       .length

//                   }

//                 </span>



//                 <h3>

//                   {

//                     activeSection.title

//                   }

//                 </h3>

//               </header>





//               <section className="lesson-explanation">

//                 {activeSection.explanation.map(

//                   (

//                     paragraph,

//                     index

//                   ) => (

//                     <p

//                       key={`${activeSection.id}-explanation-${index}`}

//                     >

//                       {paragraph}

//                     </p>

//                   )

//                 )}

//               </section>





//               {activeSection.intuition &&

//                 activeSection

//                   .intuition.length >

//                   0 && (

//                   <section className="lesson-callout lesson-intuition">

//                     <div className="lesson-callout-heading">

//                       <span>

//                         ◎

//                       </span>



//                       <h4>

//                         Build the

//                         intuition

//                       </h4>

//                     </div>



//                     {activeSection.intuition.map(

//                       (

//                         point,

//                         index

//                       ) => (

//                         <p

//                           key={`${activeSection.id}-intuition-${index}`}

//                         >

//                           {point}

//                         </p>

//                       )

//                     )}

//                   </section>

//                 )}





//               {activeSection

//                 .importantPoints &&

//                 activeSection

//                   .importantPoints

//                   .length > 0 && (

//                   <section className="lesson-important-points">

//                     <h4>

//                       Important points

//                     </h4>



//                     <div className="lesson-important-point-list">

//                       {activeSection.importantPoints.map(

//                         (

//                           point,

//                           index

//                         ) => (

//                           <div

//                             key={`${activeSection.id}-point-${index}`}

//                             className="lesson-important-point"

//                           >

//                             <span>

//                               ✓

//                             </span>



//                             <p>

//                               {point}

//                             </p>

//                           </div>

//                         )

//                       )}

//                     </div>

//                   </section>

//                 )}





//               {activeSection

//                 .mathematics && (

//                 <section className="lesson-mathematics">

//                   <span className="roadmap-section-label">

//                     MATHEMATICS

//                   </span>



//                   <h4>

//                     {activeSection

//                       .mathematics

//                       .title ??

//                       "Understand the mathematics"}

//                   </h4>



//                   <p>

//                     {

//                       activeSection

//                         .mathematics

//                         .explanation

//                     }

//                   </p>



//                   {activeSection

//                     .mathematics

//                     .formula && (

//                     <div className="lesson-formula">

//                       {

//                         activeSection

//                           .mathematics

//                           .formula

//                       }

//                     </div>

//                   )}



//                   {activeSection

//                     .mathematics

//                     .variables &&

//                     activeSection

//                       .mathematics

//                       .variables!

//                       .length >

//                       0 && (

//                       <div className="lesson-math-variables">

//                         {activeSection.mathematics.variables!.map(

//                           (

//                             variable,

//                             index

//                           ) => (

//                             <div

//                               key={`${activeSection.id}-variable-${index}`}

//                               className="lesson-math-variable"

//                             >

//                               <strong>

//                                 {

//                                   variable.symbol

//                                 }

//                               </strong>



//                               <span>

//                                 {

//                                   variable.meaning

//                                 }

//                               </span>

//                             </div>

//                           )

//                         )}

//                       </div>

//                     )}



//                   {activeSection

//                     .mathematics

//                     .example && (

//                     <div className="lesson-math-example">

//                       <strong>

//                         Example

//                       </strong>



//                       <p>

//                         {

//                           activeSection

//                             .mathematics

//                             .example

//                         }

//                       </p>

//                     </div>

//                   )}

//                 </section>

//               )}





//               {activeSection.examples &&

//                 activeSection.examples

//                   .length > 0 && (

//                   <section className="lesson-examples">

//                     <div className="lesson-block-heading">

//                       <span className="roadmap-section-label">

//                         EXAMPLES

//                       </span>



//                       <h4>

//                         See the concept

//                         in action

//                       </h4>

//                     </div>



//                     {activeSection.examples.map(

//                       (example) => (

//                         <article

//                           key={

//                             example.id

//                           }

//                           className="lesson-example-card"

//                         >

//                           <h4>

//                             {

//                               example.title

//                             }

//                           </h4>



//                           <p>

//                             {

//                               example.explanation

//                             }

//                           </p>



//                           {example.code && (

//                             <div className="lesson-code-block">

//                               <div className="lesson-code-header">

//                                 <span>

//                                   {example.language ??

//                                     "code"}

//                                 </span>

//                               </div>



//                               <pre>

//                                 <code>

//                                   {

//                                     example.code

//                                   }

//                                 </code>

//                               </pre>

//                             </div>

//                           )}



//                           {example.output && (

//                             <div className="lesson-output-block">

//                               <span>

//                                 OUTPUT

//                               </span>



//                               <pre>

//                                 {

//                                   example.output

//                                 }

//                               </pre>

//                             </div>

//                           )}



//                           {example

//                             .importantPoints &&

//                             example

//                               .importantPoints

//                               .length >

//                               0 && (

//                               <div className="lesson-example-points">

//                                 {example.importantPoints.map(

//                                   (

//                                     point,

//                                     index

//                                   ) => (

//                                     <p

//                                       key={`${example.id}-point-${index}`}

//                                     >

//                                       <span>

//                                         →

//                                       </span>



//                                       {

//                                         point

//                                       }

//                                     </p>

//                                   )

//                                 )}

//                               </div>

//                             )}

//                         </article>

//                       )

//                     )}

//                   </section>

//                 )}

//               {!usesModelDeepDiveLayout &&
//   lesson.modelDeepDive &&
//   activeSectionIndex ===
//     lesson.sections.length - 1 && (
//     <RoadmapModelDeepDive
//       deepDive={
//         lesson.modelDeepDive
//       }
//     />
//   )}


              




//               <footer className="lesson-section-footer">

//   <button

//     type="button"

//     className="lesson-navigation-button"

//     disabled={

//       activeSectionIndex === 0

//     }

//     onClick={

//       goToPreviousSection

//     }

//   >

//     ← Previous

//   </button>



//   <div className="lesson-section-completion">

//     <span>

//       {activeSectionIndex + 1}

//       {" / "}

//       {lesson.sections.length}

//     </span>



//     {activeSectionCompleted && (

//       <strong>

//         ✓ Completed

//       </strong>

//     )}

//   </div>



//   {activeSectionIndex <

//   lesson.sections.length - 1 ? (

//     <button

//       type="button"

//       className="lesson-navigation-button lesson-navigation-button-primary"

//       onClick={

//         completeAndContinue

//       }

//     >

//       {activeSectionCompleted

//         ? "Continue →"

//         : "Complete & Continue →"}

//     </button>

//   ) : (

//     <button

//       type="button"

//       className="lesson-navigation-button lesson-navigation-button-primary"

//       disabled={

//         activeSectionCompleted

//       }

//       onClick={

//         markCurrentSectionComplete

//       }

//     >

//       {activeSectionCompleted

//         ? "✓ Section Completed"

//         : "Complete Section"}

//     </button>

//   )}

// </footer>

//             </article>

//           )}

//           </div>
//       )
//       )}





//       {activeStage ===

//         "visualize" && (

//         <section className="lesson-stage-placeholder">

//           <span className="roadmap-section-label">

//             VISUALIZE

//           </span>



//           <h3>

//             {lesson.visualization

//               ?.title ??

//               "Interactive visualization"}

//           </h3>



//           <p>

//             {lesson.visualization

//               ?.description ??

//               "An interactive visualization is not configured for this lesson yet."}

//           </p>



//           {lesson.visualization

//             ?.type ===

//             "model-lab" && (

//             <div className="lesson-model-lab-notice">

//               This lesson is connected

//               to a ModelMind Model Lab.

//               The existing lab will be

//               integrated here later.

//             </div>

//           )}



//           {lesson.visualization?.type ===
//   "native" && (
//   <RoadmapNativeVisualization
//     visualizationId={
//       lesson.visualization
//         .visualizationId
//     }
//     title={
//       lesson.visualization.title
//     }
//     description={
//       lesson.visualization
//         .description
//     }
//     skillId={lesson.skillId}
//   />
// )}

//                   <div className="lesson-stage-completion">
//             <button
//               type="button"
//               className="day-complete-button"
//               disabled={visualizeCompleted}
//               onClick={onVisualizeComplete}
//             >
//               {visualizeCompleted
//                 ? "Visualization Completed ✓"
//                 : lesson.visualization?.type === "model-lab"
//                   ? "Mark Model Lab Complete"
//                   : "Complete Visualization"}
//             </button>
//           </div>

// </section>

//       )



//       }





//       {activeStage === "code" && (

//   <section className="lesson-code-workspace">

//     <header className="lesson-code-workspace-header">

//       <span className="roadmap-section-label">

//         CODE

//       </span>



//       <h3>

//         Guided coding

//       </h3>



//       <p>

//         Study the complete implementation

//         and understand what every important

//         part of the code is doing.

//       </p>

//     </header>



//     {lesson.codeExamples.length > 0 ? (

//       <div className="lesson-guided-code-list">

//         {lesson.codeExamples.map(

//           (example, index) => (

//             <article

//               key={example.id}

//               className="lesson-guided-code-card"

//             >

//               <header className="lesson-guided-code-header">

//                 <div className="lesson-guided-code-number">

//                   {String(index + 1).padStart(

//                     2,

//                     "0"

//                   )}

//                 </div>



//                 <div>

//                   <span>

//                     GUIDED EXAMPLE

//                   </span>



//                   <h4>

//                     {example.title}

//                   </h4>



//                   <p>

//                     {example.description}

//                   </p>

//                 </div>

//               </header>



//               <div className="lesson-guided-code-editor">

//                 <div className="lesson-guided-code-toolbar">

//                   <div>

//                     <span className="lesson-editor-dot" />

//                     <span className="lesson-editor-dot" />

//                     <span className="lesson-editor-dot" />

//                   </div>



//                   <span>

//                     {example.language}

//                   </span>

//                 </div>



//                 <pre>

//                   <code>

//                     {example.code}

//                   </code>

//                 </pre>

//               </div>



//               {example.expectedOutput && (

//                 <div className="lesson-guided-output">

//                   <span>

//                     EXPECTED OUTPUT

//                   </span>



//                   <pre>

//                     {example.expectedOutput}

//                   </pre>

//                 </div>

//               )}



//               <section className="lesson-code-explanation">

//                 <h5>

//                   How this code works

//                 </h5>



//                 <div className="lesson-code-explanation-list">

//                   {example.explanation.map(

//                     (

//                       explanation,

//                       explanationIndex

//                     ) => (

//                       <div

//                         key={`${example.id}-explanation-${explanationIndex}`}

//                         className="lesson-code-explanation-item"

//                       >

//                         <span>

//                           {explanationIndex + 1}

//                         </span>



//                         <p>

//                           {explanation}

//                         </p>

//                       </div>

//                     )

//                   )}

//                 </div>

//               </section>



//               {example.commonMistakes &&

//                 example.commonMistakes.length >

//                   0 && (

//                   <section className="lesson-code-mistakes">

//                     <h5>

//                       Common mistakes

//                     </h5>



//                     {example.commonMistakes.map(

//                       (

//                         mistake,

//                         mistakeIndex

//                       ) => (

//                         <div

//                           key={`${example.id}-mistake-${mistakeIndex}`}

//                           className="lesson-code-mistake"

//                         >

//                           <span>

//                             !

//                           </span>



//                           <p>

//                             {mistake}

//                           </p>

//                         </div>

//                       )

//                     )}

//                   </section>

//                 )}



//               <div className="lesson-code-runtime-note">

//                 <div>

//                   <strong>

//                     Try it yourself

//                   </strong>



//                   <p>

//                     When this roadmap is

//                     integrated into ModelMind,

//                     this example will open in

//                     the existing ModelMind

//                     notebook so you can edit

//                     and run the code directly.

//                   </p>

//                 </div>



//                 <button

//                   type="button"

//                   disabled

//                   title="Available after ModelMind notebook integration"

//                 >

//                   Open in Notebook

//                 </button>

//               </div>

//             </article>

//           )

//         )}

//       </div>

//     ) : (

//       <div className="lesson-empty-state">

//         No guided code examples have been

//         added for this lesson yet.

//       </div>

//     )}

//       <div className="lesson-stage-completion">
//       <button
//         type="button"
//         className="day-complete-button"
//         disabled={codeCompleted}
//         onClick={onCodeComplete}
//       >
//         {codeCompleted
//           ? "Code Completed ✓"
//           : "Complete Code Stage"}
//       </button>
//     </div>

// </section>

// )}





//       {activeStage === "practice" && (

//   <RoadmapPracticeViewer
  

//   problems={lesson.practice}

//   practiceCompleted={

//     practiceCompleted

//   }
//   completedProblemIds={
//   completedPracticeProblemIds
// }

// onProblemComplete={
//   onPracticeProblemComplete
// }

//   onPracticeComplete={

//     onPracticeComplete

//   }

// />

// )}

//     </div>

//   );

// }











































"use client";







import {

  useEffect,

  useState,

} from "react";

import RoadmapNativeVisualization from "./visualizations/RoadmapNativeVisualization";







import type {



  LessonContent,



} from "../../types/roadmap";



import RoadmapPracticeViewer from "./RoadmapPracticeViewer";

import RoadmapModelDeepDive from "./RoadmapModelDeepDive";











type LessonStage =



  | "learn"



  | "visualize"



  | "code"



  | "practice";











interface RoadmapLessonViewerProps {



  lesson: LessonContent;







  learnCompleted?: boolean;







  visualizeCompleted?: boolean;







  codeCompleted?: boolean;







  practiceCompleted?: boolean;



  completedPracticeProblemIds?: string[];



onPracticeProblemComplete?: (

  problemId: string

) => void;







  onLearnComplete?: () => void;







  onVisualizeComplete?: () => void;







  onCodeComplete?: () => void;







  onPracticeComplete?: () => void;



}



const MODEL_LESSON_IDS = new Set([

  // Classification

  "logistic-regression",

  "knn",

  "naive-bayes",

  "decision-tree",

  "random-forest",

  "svm",



  // Regression / optimization

  "gradient-descent",

  "polynomial-regression",

  "regularization",



  // Unsupervised

  "clustering-evaluation",

]);



type ModelSectionGroup = {
  title: string;
  start: number;
  end: number;
};

const GROUPED_MODEL_LESSON_IDS = new Set([
  // Classification
  "logistic-regression",
  "knn",
  "naive-bayes",
  "decision-tree",
  "random-forest",
  "svm",

  // Regression / optimization
  "linear-regression",
  "gradient-descent",
  "polynomial-regression",
  "regularization",

  // Unsupervised
  "k-means",
  "clustering-evaluation",
  "pca",

  // Ensembles
  "ensemble-learning",
  "bagging",
  "boosting-foundations",
  "gradient-boosting",
  "xgboost",
  "voting-stacking",
]);

const DECISION_TREE_SECTION_GROUPS: ModelSectionGroup[] = [
  { title: "Decision Tree Foundations", start: 0, end: 3 },
  { title: "Tree Anatomy & Structure", start: 4, end: 6 },
  { title: "How a Tree Learns", start: 7, end: 9 },
  { title: "Splitting Mathematics", start: 10, end: 12 },
  { title: "Classification & Regression", start: 13, end: 15 },
  { title: "Core Parameters", start: 16, end: 20 },
  { title: "Advanced Parameters", start: 21, end: 24 },
  { title: "Overfitting & Pruning", start: 25, end: 27 },
  { title: "Feature Importance & Probabilities", start: 28, end: 29 },
  { title: "Data Handling & Tree Complexity", start: 30, end: 31 },
  { title: "Tuning & Failure Diagnosis", start: 32, end: 33 },
  { title: "Interpreting Decision Trees", start: 34, end: 34 },
  { title: "Model Comparisons", start: 35, end: 35 },
  { title: "Real-World Applications", start: 36, end: 36 },
  { title: "Exam & Interview Mastery", start: 37, end: Number.MAX_SAFE_INTEGER },
];

function clampGroups(
  groups: ModelSectionGroup[],
  sectionCount: number
): ModelSectionGroup[] {
  if (sectionCount <= 0) return [];

  return groups
    .map((group) => ({
      ...group,
      start: Math.min(group.start, sectionCount - 1),
      end: Math.min(group.end, sectionCount - 1),
    }))
    .filter(
      (group, index, safeGroups) =>
        group.start <= group.end &&
        (index === 0 || group.start > safeGroups[index - 1].start)
    );
}

function getAutomaticModelGroups(lesson: LessonContent): ModelSectionGroup[] {
  const sectionCount = lesson.sections.length;
  if (sectionCount <= 0) return [];

  // Keep compact lessons readable. Deep model lessons are presented as
  // 10-15 main chapters, while their original sections remain untouched
  // and become the selectable subsections inside each chapter.
  const targetGroupCount = Math.min(
    15,
    sectionCount,
    Math.max(10, Math.ceil(sectionCount / 3))
  );

  const baseSize = Math.floor(sectionCount / targetGroupCount);
  const remainder = sectionCount % targetGroupCount;
  const groups: ModelSectionGroup[] = [];
  let start = 0;

  for (let index = 0; index < targetGroupCount; index += 1) {
    const size = baseSize + (index < remainder ? 1 : 0);
    const end = start + size - 1;
    const firstSection = lesson.sections[start];
    const lastSection = lesson.sections[end];

    const title =
      firstSection && lastSection && firstSection.id !== lastSection.id
        ? firstSection.title
        : firstSection?.title ?? `Chapter ${index + 1}`;

    groups.push({ title, start, end });
    start = end + 1;
  }

  return groups;
}

function getModelSectionGroups(lesson: LessonContent): ModelSectionGroup[] {
  if (!GROUPED_MODEL_LESSON_IDS.has(lesson.skillId)) return [];

  if (lesson.skillId === "decision-tree") {
    return clampGroups(DECISION_TREE_SECTION_GROUPS, lesson.sections.length);
  }

  return getAutomaticModelGroups(lesson);
}

function isModelDeepDiveLesson(lesson: LessonContent) {

  return false;

}



export default function RoadmapLessonViewer({



  lesson,



  learnCompleted = false,



  visualizeCompleted = false,



  codeCompleted = false,



  practiceCompleted = false,

  completedPracticeProblemIds = [],



  onLearnComplete,



  onVisualizeComplete,



  onCodeComplete,



  onPracticeComplete,

  onPracticeProblemComplete,



}: RoadmapLessonViewerProps) {



  const [activeStage, setActiveStage] =



    useState<LessonStage>("learn");







  const [



    activeSectionIndex,



    setActiveSectionIndex,



  ] = useState(0);



  const [



  completedSectionIds,



  setCompletedSectionIds,



] = useState<string[]>(



  () =>



    learnCompleted



      ? lesson.sections.map(



          (section) =>



            section.id



        )



      : []



);









  // =========================================================

// RESET VIEWER WHEN LESSON CHANGES

// =========================================================

//

// A RoadmapLessonViewer instance can receive a different

// lesson when the learner moves between roadmap topics.

//

// React preserves local component state unless we reset it.

// Without this reset, the previous lesson can leave behind:

//

// - its active section

// - its active stage

// - its completed section IDs

// - its displayed lesson progress

//

// This keeps every skill lesson independent.

// =========================================================



useEffect(() => {

  setActiveStage("learn");



  setActiveSectionIndex(0);



  setCompletedSectionIds(

    learnCompleted

      ? lesson.sections.map(

          (section) =>

            section.id

        )

      : []

  );

}, [

  lesson.id,

  learnCompleted,

]);

  const activeSection =



    lesson.sections[



      activeSectionIndex



    ];

  const modelSectionGroups = getModelSectionGroups(lesson);
  const usesGroupedModelSections = modelSectionGroups.length > 0;
  const activeModelGroupIndex = usesGroupedModelSections
    ? Math.max(
        0,
        modelSectionGroups.findIndex(
          (group) =>
            activeSectionIndex >= group.start &&
            activeSectionIndex <= group.end
        )
      )
    : -1;
  const activeModelGroup =
    activeModelGroupIndex >= 0
      ? modelSectionGroups[activeModelGroupIndex]
      : undefined;











  const goToPreviousSection = () => {



    setActiveSectionIndex(



      (current) =>



        Math.max(



          current - 1,



          0



        )



    );



  };











  const goToNextSection = () => {



    setActiveSectionIndex(



      (current) =>



        Math.min(



          current + 1,



          lesson.sections.length - 1



        )



    );



  };











  /*

 * Overall lesson progress must be based on

 * persisted roadmap activity state.

 *

 * Each lesson has four learning stages:

 *

 * Learn

 * Visualize

 * Code

 * Practice

 *

 * These values come from the roadmap and

 * therefore survive browser refresh.

 */

const completedLessonStages = [

  learnCompleted,

  visualizeCompleted,

  codeCompleted,

  practiceCompleted,

].filter(Boolean).length;



const lessonProgress =

  Math.round(

    (completedLessonStages / 4) *

      100

  );











const activeSectionCompleted =



  activeSection



    ? completedSectionIds.includes(



        activeSection.id



      )



    : false;

  const usesModelDeepDiveLayout =

  isModelDeepDiveLesson(lesson);



const completeModelLearnStage = () => {

  if (learnCompleted) {

    return;

  }



  /*

   * Model lessons use a grouped deep-dive UI instead of

   * exposing every internal content section separately.

   *

   * We still mark the existing section IDs complete locally

   * so the underlying lesson structure remains untouched.

   * Persisted Learn completion continues through the same

   * existing onLearnComplete callback.

   */

  setCompletedSectionIds(

    lesson.sections.map(

      (section) => section.id

    )

  );



  onLearnComplete?.();

};











const markCurrentSectionComplete = () => {



  if (!activeSection) {



    return;



  }







  if (activeSectionCompleted) {



    return;



  }







  const updated = [



    ...completedSectionIds,



    activeSection.id,



  ];







  setCompletedSectionIds(



    updated



  );







  if (



    updated.length ===



    lesson.sections.length



  ) {



    onLearnComplete?.();



  }



};











const completeAndContinue = () => {



  if (!activeSection) {



    return;



  }







  let updated =



    completedSectionIds;







  if (!activeSectionCompleted) {



    updated = [



      ...completedSectionIds,



      activeSection.id,



    ];







    setCompletedSectionIds(



      updated



    );







    if (



      updated.length ===



      lesson.sections.length



    ) {



      onLearnComplete?.();



    }



  }







  if (



    activeSectionIndex <



    lesson.sections.length - 1



  ) {



    goToNextSection();



  }



};











  return (



    <div className="lesson-viewer">



      <header className="lesson-viewer-header">



        <div>



          <span className="roadmap-section-label">



            DEEP LESSON



          </span>







          <h3 className="lesson-viewer-title">



            {lesson.title}



          </h3>







          {lesson.subtitle && (



            <p className="lesson-viewer-subtitle">



              {lesson.subtitle}



            </p>



          )}



        </div>







        <div className="lesson-viewer-progress">



          <div className="lesson-viewer-progress-meta">



            <span>



              Lesson progress



            </span>







            <strong>



              {lessonProgress}%



            </strong>



          </div>







          <div className="lesson-viewer-progress-track">



            <div



              className="lesson-viewer-progress-fill"



              style={{



                width:



                  `${lessonProgress}%`,



              }}



            />



          </div>



        </div>



      </header>











      <nav



        className="lesson-stage-tabs"



        aria-label="Lesson stages"



      >



        <button



          type="button"



          className={



            activeStage === "learn"



              ? "lesson-stage-tab lesson-stage-tab-active"



              : "lesson-stage-tab"



          }



          onClick={() =>



            setActiveStage("learn")



          }



        >



          <span>01</span>



          Learn



        </button>







        <button



          type="button"



          className={



            activeStage ===



            "visualize"



              ? "lesson-stage-tab lesson-stage-tab-active"



              : "lesson-stage-tab"



          }



          onClick={() =>



            setActiveStage(



              "visualize"



            )



          }



        >



          <span>02</span>



          Visualize



        </button>







        <button



          type="button"



          className={



            activeStage === "code"



              ? "lesson-stage-tab lesson-stage-tab-active"



              : "lesson-stage-tab"



          }



          onClick={() =>



            setActiveStage("code")



          }



        >



          <span>03</span>



          Code



        </button>







        <button



          type="button"



          className={



            activeStage ===



            "practice"



              ? "lesson-stage-tab lesson-stage-tab-active"



              : "lesson-stage-tab"



          }



          onClick={() =>



            setActiveStage(



              "practice"



            )



          }



        >



          <span>04</span>



          Practice



        </button>



      </nav>











      {activeStage === "learn" && (

  usesModelDeepDiveLayout ? (

    <section className="lesson-model-learning-experience">

      <RoadmapModelDeepDive

  deepDive={lesson.modelDeepDive}

  sections={lesson.sections}

/>



      <div className="lesson-model-learn-completion">

        <div>

          <strong>

            Model learning stage

          </strong>



          <p>

            Explore the model through the

            structured deep-dive categories above.

            Your detailed lesson content remains

            available inside the model learning

            experience.

          </p>

        </div>



        <button

          type="button"

          className="day-complete-button"

          disabled={learnCompleted}

          onClick={completeModelLearnStage}

        >

          {learnCompleted

            ? "Learn Stage Completed ✓"

            : "Complete Learn Stage"}

        </button>

      </div>

    </section>

  ) : (

    <div className="lesson-learn-layout">



          <aside className="lesson-section-navigation">



            <div className="lesson-section-navigation-header">



              <span>



                LESSON SECTIONS



              </span>







              <strong>



                {usesGroupedModelSections ? modelSectionGroups.length : lesson.sections.length}



              </strong>



            </div>







            <div className="lesson-section-list">
              {usesGroupedModelSections
                ? modelSectionGroups.map((group, index) => {
                    const groupSectionIds = lesson.sections
                      .slice(group.start, group.end + 1)
                      .map((section) => section.id);
                    const groupCompleted =
                      groupSectionIds.length > 0 &&
                      groupSectionIds.every((id) =>
                        completedSectionIds.includes(id)
                      );

                    return (
                      <button
                        key={`${lesson.skillId}-group-${index}`}
                        type="button"
                        className={
                          index === activeModelGroupIndex
                            ? "lesson-section-button lesson-section-button-active"
                            : "lesson-section-button"
                        }
                        onClick={() => setActiveSectionIndex(group.start)}
                      >
                        <span className="lesson-section-number">
                          {groupCompleted
                            ? "✓"
                            : String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="lesson-section-name">
                          {group.title}
                        </span>
                      </button>
                    );
                  })
                : lesson.sections.map((section, index) => (
                    <button
                      key={section.id}
                      type="button"
                      className={
                        index === activeSectionIndex
                          ? "lesson-section-button lesson-section-button-active"
                          : "lesson-section-button"
                      }
                      onClick={() => setActiveSectionIndex(index)}
                    >
                      <span className="lesson-section-number">
                        {completedSectionIds.includes(section.id)
                          ? "✓"
                          : String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="lesson-section-name">
                        {section.title}
                      </span>
                    </button>
                  ))}
            </div>

          </aside>











          {activeSection && (



            <article className="lesson-content-panel">



              <header className="lesson-content-header">



                <span className="lesson-content-counter">



                  SECTION{" "}



                  {activeSectionIndex +



                    1}{" "}



                  OF{" "}



                  {



                    lesson.sections



                      .length



                  }



                </span>







                <h3>



                  {



                    activeSection.title



                  }



                </h3>



              </header>











              \{usesGroupedModelSections && activeModelGroup && (
                <section className="lesson-important-points">
                  <h4>{activeModelGroup.title}</h4>
                  <div className="lesson-section-list">
                    {lesson.sections
                      .slice(activeModelGroup.start, activeModelGroup.end + 1)
                      .map((section, offset) => {
                        const sectionIndex = activeModelGroup.start + offset;
                        const completed = completedSectionIds.includes(section.id);

                        return (
                          <button
                            key={`${lesson.skillId}-subsection-${section.id}`}
                            type="button"
                            className={
                              sectionIndex === activeSectionIndex
                                ? "lesson-section-button lesson-section-button-active"
                                : "lesson-section-button"
                            }
                            onClick={() => setActiveSectionIndex(sectionIndex)}
                          >
                            <span className="lesson-section-number">
                              {completed ? "✓" : String(offset + 1).padStart(2, "0")}
                            </span>
                            <span className="lesson-section-name">{section.title}</span>
                          </button>
                        );
                      })}
                  </div>
                </section>
              )}

              <section className="lesson-explanation">



                {activeSection.explanation.map(



                  (



                    paragraph,



                    index



                  ) => (



                    <p



                      key={`${activeSection.id}-explanation-${index}`}



                    >



                      {paragraph}



                    </p>



                  )



                )}



              </section>











              {activeSection.intuition &&



                activeSection



                  .intuition.length >



                  0 && (



                  <section className="lesson-callout lesson-intuition">



                    <div className="lesson-callout-heading">



                      <span>



                        ◎



                      </span>







                      <h4>



                        Build the



                        intuition



                      </h4>



                    </div>







                    {activeSection.intuition.map(



                      (



                        point,



                        index



                      ) => (



                        <p



                          key={`${activeSection.id}-intuition-${index}`}



                        >



                          {point}



                        </p>



                      )



                    )}



                  </section>



                )}











              {activeSection



                .importantPoints &&



                activeSection



                  .importantPoints



                  .length > 0 && (



                  <section className="lesson-important-points">



                    <h4>



                      Important points



                    </h4>







                    <div className="lesson-important-point-list">



                      {activeSection.importantPoints.map(



                        (



                          point,



                          index



                        ) => (



                          <div



                            key={`${activeSection.id}-point-${index}`}



                            className="lesson-important-point"



                          >



                            <span>



                              ✓



                            </span>







                            <p>



                              {point}



                            </p>



                          </div>



                        )



                      )}



                    </div>



                  </section>



                )}











              {activeSection



                .mathematics && (



                <section className="lesson-mathematics">



                  <span className="roadmap-section-label">



                    MATHEMATICS



                  </span>







                  <h4>



                    {activeSection



                      .mathematics



                      .title ??



                      "Understand the mathematics"}



                  </h4>







                  <p>



                    {



                      activeSection



                        .mathematics



                        .explanation



                    }



                  </p>







                  {activeSection



                    .mathematics



                    .formula && (



                    <div className="lesson-formula">



                      {



                        activeSection



                          .mathematics



                          .formula



                      }



                    </div>



                  )}







                  {activeSection



                    .mathematics



                    .variables &&



                    activeSection



                      .mathematics



                      .variables!



                      .length >



                      0 && (



                      <div className="lesson-math-variables">



                        {activeSection.mathematics.variables!.map(



                          (



                            variable,



                            index



                          ) => (



                            <div



                              key={`${activeSection.id}-variable-${index}`}



                              className="lesson-math-variable"



                            >



                              <strong>



                                {



                                  variable.symbol



                                }



                              </strong>







                              <span>



                                {



                                  variable.meaning



                                }



                              </span>



                            </div>



                          )



                        )}



                      </div>



                    )}







                  {activeSection



                    .mathematics



                    .example && (



                    <div className="lesson-math-example">



                      <strong>



                        Example



                      </strong>







                      <p>



                        {



                          activeSection



                            .mathematics



                            .example



                        }



                      </p>



                    </div>



                  )}



                </section>



              )}











              {activeSection.examples &&



                activeSection.examples



                  .length > 0 && (



                  <section className="lesson-examples">



                    <div className="lesson-block-heading">



                      <span className="roadmap-section-label">



                        EXAMPLES



                      </span>







                      <h4>



                        See the concept



                        in action



                      </h4>



                    </div>







                    {activeSection.examples.map(



                      (example) => (



                        <article



                          key={



                            example.id



                          }



                          className="lesson-example-card"



                        >



                          <h4>



                            {



                              example.title



                            }



                          </h4>







                          <p>



                            {



                              example.explanation



                            }



                          </p>







                          {example.code && (



                            <div className="lesson-code-block">



                              <div className="lesson-code-header">



                                <span>



                                  {example.language ??



                                    "code"}



                                </span>



                              </div>







                              <pre>



                                <code>



                                  {



                                    example.code



                                  }



                                </code>



                              </pre>



                            </div>



                          )}







                          {example.output && (



                            <div className="lesson-output-block">



                              <span>



                                OUTPUT



                              </span>







                              <pre>



                                {



                                  example.output



                                }



                              </pre>



                            </div>



                          )}







                          {example



                            .importantPoints &&



                            example



                              .importantPoints



                              .length >



                              0 && (



                              <div className="lesson-example-points">



                                {example.importantPoints.map(



                                  (



                                    point,



                                    index



                                  ) => (



                                    <p



                                      key={`${example.id}-point-${index}`}



                                    >



                                      <span>



                                        →



                                      </span>







                                      {



                                        point



                                      }



                                    </p>



                                  )



                                )}



                              </div>



                            )}



                        </article>



                      )



                    )}



                  </section>



                )}



              {!usesGroupedModelSections && !usesModelDeepDiveLayout &&

  lesson.modelDeepDive &&

  activeSectionIndex ===

    lesson.sections.length - 1 && (

    <RoadmapModelDeepDive

      deepDive={

        lesson.modelDeepDive

      }

    />

  )}















              <footer className="lesson-section-footer">



  <button



    type="button"



    className="lesson-navigation-button"



    disabled={



      activeSectionIndex === 0



    }



    onClick={



      goToPreviousSection



    }



  >



    ← Previous



  </button>







  <div className="lesson-section-completion">



    <span>



      {activeSectionIndex + 1}



      {" / "}



      {lesson.sections.length}



    </span>







    {activeSectionCompleted && (



      <strong>



        ✓ Completed



      </strong>



    )}



  </div>







  {activeSectionIndex <



  lesson.sections.length - 1 ? (



    <button



      type="button"



      className="lesson-navigation-button lesson-navigation-button-primary"



      onClick={



        completeAndContinue



      }



    >



      {activeSectionCompleted



        ? "Continue →"



        : "Complete & Continue →"}



    </button>



  ) : (



    <button



      type="button"



      className="lesson-navigation-button lesson-navigation-button-primary"



      disabled={



        activeSectionCompleted



      }



      onClick={



        markCurrentSectionComplete



      }



    >



      {activeSectionCompleted



        ? "✓ Section Completed"



        : "Complete Section"}



    </button>



  )}



</footer>



            </article>



          )}



          </div>

      )

      )}











      {activeStage ===



        "visualize" && (



        <section className="lesson-stage-placeholder">



          <span className="roadmap-section-label">



            VISUALIZE



          </span>







          <h3>



            {lesson.visualization



              ?.title ??



              "Interactive visualization"}



          </h3>







          <p>



            {lesson.visualization



              ?.description ??



              "An interactive visualization is not configured for this lesson yet."}



          </p>







          {lesson.visualization



            ?.type ===



            "model-lab" && (



            <div className="lesson-model-lab-notice">



              This lesson is connected



              to a ModelMind Model Lab.



              The existing lab will be



              integrated here later.



            </div>



          )}







          {lesson.visualization?.type ===

  "native" && (

  <RoadmapNativeVisualization

    visualizationId={

      lesson.visualization

        .visualizationId

    }

    title={

      lesson.visualization.title

    }

    description={

      lesson.visualization

        .description

    }

    skillId={lesson.skillId}

  />

)}



                  <div className="lesson-stage-completion">

            <button

              type="button"

              className="day-complete-button"

              disabled={visualizeCompleted}

              onClick={onVisualizeComplete}

            >

              {visualizeCompleted

                ? "Visualization Completed ✓"

                : lesson.visualization?.type === "model-lab"

                  ? "Mark Model Lab Complete"

                  : "Complete Visualization"}

            </button>

          </div>



</section>



      )







      }











      {activeStage === "code" && (



  <section className="lesson-code-workspace">



    <header className="lesson-code-workspace-header">



      <span className="roadmap-section-label">



        CODE



      </span>







      <h3>



        Guided coding



      </h3>







      <p>



        Study the complete implementation



        and understand what every important



        part of the code is doing.



      </p>



    </header>







    {lesson.codeExamples.length > 0 ? (



      <div className="lesson-guided-code-list">



        {lesson.codeExamples.map(



          (example, index) => (



            <article



              key={example.id}



              className="lesson-guided-code-card"



            >



              <header className="lesson-guided-code-header">



                <div className="lesson-guided-code-number">



                  {String(index + 1).padStart(



                    2,



                    "0"



                  )}



                </div>







                <div>



                  <span>



                    GUIDED EXAMPLE



                  </span>







                  <h4>



                    {example.title}



                  </h4>







                  <p>



                    {example.description}



                  </p>



                </div>



              </header>







              <div className="lesson-guided-code-editor">



                <div className="lesson-guided-code-toolbar">



                  <div>



                    <span className="lesson-editor-dot" />



                    <span className="lesson-editor-dot" />



                    <span className="lesson-editor-dot" />



                  </div>







                  <span>



                    {example.language}



                  </span>



                </div>







                <pre>



                  <code>



                    {example.code}



                  </code>



                </pre>



              </div>







              {example.expectedOutput && (



                <div className="lesson-guided-output">



                  <span>



                    EXPECTED OUTPUT



                  </span>







                  <pre>



                    {example.expectedOutput}



                  </pre>



                </div>



              )}







              <section className="lesson-code-explanation">



                <h5>



                  How this code works



                </h5>







                <div className="lesson-code-explanation-list">



                  {example.explanation.map(



                    (



                      explanation,



                      explanationIndex



                    ) => (



                      <div



                        key={`${example.id}-explanation-${explanationIndex}`}



                        className="lesson-code-explanation-item"



                      >



                        <span>



                          {explanationIndex + 1}



                        </span>







                        <p>



                          {explanation}



                        </p>



                      </div>



                    )



                  )}



                </div>



              </section>







              {example.commonMistakes &&



                example.commonMistakes.length >



                  0 && (



                  <section className="lesson-code-mistakes">



                    <h5>



                      Common mistakes



                    </h5>







                    {example.commonMistakes.map(



                      (



                        mistake,



                        mistakeIndex



                      ) => (



                        <div



                          key={`${example.id}-mistake-${mistakeIndex}`}



                          className="lesson-code-mistake"



                        >



                          <span>



                            !



                          </span>







                          <p>



                            {mistake}



                          </p>



                        </div>



                      )



                    )}



                  </section>



                )}







              <div className="lesson-code-runtime-note">



                <div>



                  <strong>



                    Try it yourself



                  </strong>







                  <p>



                    When this roadmap is



                    integrated into ModelMind,



                    this example will open in



                    the existing ModelMind



                    notebook so you can edit



                    and run the code directly.



                  </p>



                </div>







                <button



                  type="button"



                  disabled



                  title="Available after ModelMind notebook integration"



                >



                  Open in Notebook



                </button>



              </div>



            </article>



          )



        )}



      </div>



    ) : (



      <div className="lesson-empty-state">



        No guided code examples have been



        added for this lesson yet.



      </div>



    )}



      <div className="lesson-stage-completion">

      <button

        type="button"

        className="day-complete-button"

        disabled={codeCompleted}

        onClick={onCodeComplete}

      >

        {codeCompleted

          ? "Code Completed ✓"

          : "Complete Code Stage"}

      </button>

    </div>



</section>



)}











      {activeStage === "practice" && (



  <RoadmapPracticeViewer





  problems={lesson.practice}



  practiceCompleted={



    practiceCompleted



  }

  completedProblemIds={

  completedPracticeProblemIds

}



onProblemComplete={

  onPracticeProblemComplete

}



  onPracticeComplete={



    onPracticeComplete



  }



/>



)}



    </div>



  );



}