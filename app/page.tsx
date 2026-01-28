import SheetParser from "./components/sheetParser";
import tableVisualization from "./displayWinners/tableVisualization";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-[#FFFFFF]">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-[#FFFFFF] sm:items-start">
        <h1 className="text-4xl font-bold text-zinc-900 mb-8">
          Phishing Awards Dashboard
        </h1>
        <h2 className="text-2xl font-semibold text-[#000000] mb-4">
          <SheetParser />
        </h2>

        
      </main>
    </div>
  );
}
