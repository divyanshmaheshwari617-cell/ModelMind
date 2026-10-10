
import BootstrapStudio from "@/components/bagging/BootstrapStudio";
import BaggingTrainingStudio from "@/components/bagging/BaggingTrainingStudio";
import BaggingBiasVarianceStudio from "@/components/bagging/BaggingBiasVarianceStudio";
import BaggingTheoryStudio from "@/components/bagging/BaggingTheoryStudio";
import BaggingNavigation from "@/components/bagging/BaggingNavigation";
import BaggingVisualLearningStudio from "@/components/bagging/BaggingVisualLearningStudio";
import BaggingInteractiveGraphs from "@/components/bagging/BaggingInteractiveGraphs";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#080d19] text-white">
      <BaggingNavigation />

      <div className="mx-auto max-w-[1500px] space-y-16 px-4 py-8 md:px-8">
        <section
  id="visual-learning"
  className="scroll-mt-24"
>
  <BaggingVisualLearningStudio />

</section>
<section
  id="interactive-graphs"
  className="scroll-mt-24"
>
  <BaggingInteractiveGraphs />
</section>
        <section
          id="bootstrap"
          className="scroll-mt-24"
        >
          <BootstrapStudio />
        </section>

        <section
          id="training"
          className="scroll-mt-24"
        >
          <BaggingTrainingStudio />
        </section>

        <section
          id="bias-variance"
          className="scroll-mt-24"
        >
          <BaggingBiasVarianceStudio />
        </section>

        <section
          id="theory"
          className="scroll-mt-24"
        >
          <BaggingTheoryStudio />
        </section>

        <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
          ModelMind — Bagging Learning Laboratory
        </footer>
      </div>
    </main>
  );
}
