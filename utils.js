import fs from "fs";
import csv from "csv-parser";

const readCSVToArray = async (filePath) => {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

// Usage example
const filePath = "./data/companies.csv";
export const getCompanies = async () => {
  const data = await readCSVToArray(filePath);
  return data.map((company) => company["ISIN"]);
};
