import SheetParser from "./components/sheetParser";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
          Phishing Awards Dashboard
        </h1>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          <SheetParser />  
          Some changes here
        </h2>
        
      </main>
    </div>
  );
}
