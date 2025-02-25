import { useState, useEffect } from "react";
import Table from "./Table";
import Input from "./Input";
import reactLogo from "../assets/react.svg";
import electronLogo from "../assets/electron.svg.png";
import viteLogo from "../assets/electron.svg.png"; // Pastikan file ini benar-benar ada di dalam folder assets

// ✅ Definisikan tipe data untuk hasil scraping
type ScrapingResult = any; // Ubah `any` ke tipe yang sesuai jika tahu strukturnya

function App() {
  const [results, setResults] = useState<ScrapingResult | null>(null);

  useEffect(() => {
    if (!window.ipcRenderer) {
      console.error("ipcRenderer tidak tersedia!");
      return;
    }

    // ✅ Tentukan tipe event handler secara eksplisit
    const handleScrapingDone = (_event: Electron.IpcRendererEvent, results: ScrapingResult) => {
      console.log("Scraping done:", results);
      setResults(results);
    };

    const handleScrapingError = (_event: Electron.IpcRendererEvent, error: Error) => {
      console.error("Error during scraping:", error);
    };

    window.ipcRenderer.on("scraping-done", handleScrapingDone);
    window.ipcRenderer.on("scraping-error", handleScrapingError);

    // ✅ Bersihkan event listener saat komponen unmount
    return () => {
      window.ipcRenderer.off("scraping-done", handleScrapingDone);
      window.ipcRenderer.off("scraping-error", handleScrapingError);
    };
  }, []);

  return (
    <div className="container mx-auto">
      <div className="flex justify-center items-center my-8">
        <div className="text-center">
          <div className="flex justify-center">
            <a className="mx-4" href="https://electron-vite.github.io" target="_blank">
              <img src={electronLogo} className="w-24 h-24 mb-4 mx-auto" alt="Electron logo" />
            </a>
            <a className="mx-4" href="https://react.dev" target="_blank">
              <img src={reactLogo} className="w-24 h-24 mb-4 mx-auto" alt="React logo" />
            </a>
            <a className="mx-4" href="https://vitejs.dev" target="_blank">
              <img src={viteLogo} className="w-24 h-24 mb-4 mx-auto" alt="Vite logo" />
            </a>
          </div>

          <h1 className="text-3xl font-bold mb-2">Google Maps Scrapping</h1>
          <div className="text-center text-sm text-gray-500">
            Dibuat by Tim IT Intern UFI
          </div>
        </div>
      </div>

      <div className="flex justify-center my-4">
        <Input />
      </div>

      <div className="flex justify-center items-center my-8">
        {/* ✅ Pastikan `results` valid sebelum dikirim ke Table */}
        {results ? <Table places={results} /> : <p className="text-gray-500">Menunggu hasil...</p>}
      </div>
    </div>
  );
}

export default App;
