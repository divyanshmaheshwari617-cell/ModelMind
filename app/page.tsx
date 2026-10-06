import GradientDescentVisualizer from "@/components/visualization/model-lab/gradient-descent/GradientDescentVisualizer";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <GradientDescentVisualizer />
    </main>
  );
}