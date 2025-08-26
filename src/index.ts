import dotenv from "dotenv";
import axios from "axios";
import type { PipedrivePerson } from "./types/pipedrive";
import inputData from "./mappings/inputData.json";
import mappings from "./mappings/mappings.json";

dotenv.config();

const apiKey = process.env.PIPEDRIVE_API_KEY;
const companyDomain = process.env.PIPEDRIVE_COMPANY_DOMAIN;

if (!apiKey || !companyDomain) {
  throw new Error("Missing API key or company domain in .env file");
}

// ✅ Create Axios instance for Pipedrive API
const api = axios.create({
  baseURL: `https://${companyDomain}.pipedrive.com/api/v1`,
  params: { api_token: apiKey },
});

/**
 * ✅ Utility function to get nested value by path
 */
const getNestedValue = (obj: any, path: string): any => {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const syncPdPerson = async (): Promise<PipedrivePerson | null> => {
  try {
    // ✅ Step 1: Build payload from mappings
    const payload: Record<string, any> = {};

    mappings.forEach((map) => {
      const value = getNestedValue(inputData, map.inputKey);
      if (value) {
        // Pipedrive expects phone/email as arrays of objects
        if (map.pipedriveKey === "phone") {
          const label = map.inputKey.split(".").pop() || "home";
          payload["phone"] = [{ label, value, primary: true }];
        } else if (map.pipedriveKey === "email") {
          payload["email"] = [{ label: "work", value, primary: true }];
        } else {
          payload[map.pipedriveKey] = value;
        }
      }
    });

    console.log("Mapped payload:", payload);

    // ✅ Step 2: Get name for search
    const nameMapping = mappings.find((m) => m.pipedriveKey === "name");
    if (!nameMapping) throw new Error("No name mapping found");

    const personName = getNestedValue(inputData, nameMapping.inputKey);
    if (!personName) throw new Error("Name value missing in inputData");

    // ✅ Step 3: Search for person in Pipedrive
    const searchResponse = await api.get("/persons/search", {
      params: { term: personName },
    });

    const items = searchResponse.data.data?.items || [];
    let result;

    if (items.length > 0) {
      const personId = items[0].item.id;
      console.log(`Person found (ID: ${personId}). Updating...`);
      result = await api.put(`/persons/${personId}`, payload);
    } else {
      console.log("Person not found. Creating new person...");
      result = await api.post("/persons", payload);
    }

    console.log("Sync successful:", result.data.data);
    return result.data.data as PipedrivePerson;
  } catch (error: any) {
    console.error(
      "Error syncing person:",
      error.response?.data || error.message
    );
    return null;
  }
};

// ✅ Call the function
(async () => {
  const pipedrivePerson = await syncPdPerson();
  console.log("Final Pipedrive Person:", pipedrivePerson);
})();
