import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import excelFile from "./data/ParkingOC.xlsx"; // Imported from source
import "./App.css"; // Assuming you have some basic styles

export default function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // Load Excel file from src/data
  useEffect(() => {
    fetch(excelFile)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const formatted = sheetData.map((row) => {
          const flat = row[0];
          let cars = [];
          for (let i = 1; i < row.length; i += 2) {
            if (row[i]) {
              cars.push({ number: row[i], model: row[i + 1] || "" });
            }
          }
          return { flat, cars };
        });
        console.log("Formatted Data:", formatted);
        setData(formatted);
      });
  }, []);

  const searchData = (val) => {
    const q = val.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    let res = [];

    // Match Flat Number
    const byFlat = data.find((d) => d.flat?.toLowerCase() === q);
    if (byFlat) res.push({ type: "flat", ...byFlat });

    // Match Car Number
    // Match Car Number (full match or last 4 digits)
data.forEach(d => {
  d.cars.forEach(car => {
    const carNum = String(car.number || "").toLowerCase();
    
    if (carNum === q) {
      // Full match
      res.push({ type: "car", flat: d.flat, car });
    } 
    // Last 4 digits match
    else if (q.length === 4 && carNum.endsWith(q)) {
      res.push({ type: "car", flat: d.flat, car });
    }
  });
});

    // Match Model
    const modelMatches = [];
    data.forEach((d) => {
      d.cars.forEach((car) => {
        if (String(car.model || "").toLowerCase() === q) {
          modelMatches.push({ flat: d.flat, car });
        }
      });
    });
    if (modelMatches.length) res.push({ type: "model", matches: modelMatches });

    setResults(res);
  };

  // Search as you type
  useEffect(() => {
    searchData(query);
  }, [query, data]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-8">
      <h1 className="text-2xl text-gray-900 font-bold text-center mb-6">OC Vehicle Finder</h1>
    
      <input
  type="text"
  placeholder="Search by flat, car number, or model"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  className="w-full border rounded-md p-2 mb-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring focus:border-blue-400"
 />

      <div className="space-y-4">
        {results.length === 0 && query && (
          <p className="text-center">
            No matching records found.
          </p>
        )}

        {results.map((res, index) => {
          if (res.type === "flat") {
            return (
              <div key={index} className="p-4 border rounded-md shadow">
                <h2 className="font-semibold">Flat {res.flat} owns:</h2>
                <ul className="list-disc pl-6">
                  {res.cars.map((c, i) => (
                    <li key={i}>
                      {c.number} - {c.model}
                    </li>
                  ))}
                </ul>
              </div>
            );
          } else if (res.type === "car") {
            return (
              <div key={index} className="text-gray-900 p-4 border rounded-md shadow">
                Car <span className="text-gray-900 font-semibold">{res.car.number}</span> (
                {res.car.model}) belongs to{" "}
                <span className="font-semibold">Flat {res.flat}</span>.
              </div>
            );
          } else if (res.type === "model") {
            return (
              <div key={index} className="text-gray-900 p-4 border rounded-md shadow">
                <h2 className="font-semibold">Cars with model "{query}":</h2>
                <ul className="text-gray-900 list-disc pl-6">
                  {res.matches.map((m, i) => (
                    <li key={i}>
                      {m.car.number} - Flat {m.flat}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
