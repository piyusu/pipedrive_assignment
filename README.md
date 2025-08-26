# Pipedrive Person Updater

This project reads **input data** from `inputData.json` and **mappings** from `mappings.json`, then creates or updates a **Person** in **Pipedrive CRM** using their public API.

---

## 📌 Features
✔ Read and parse `inputData.json` and `mappings.json`  
✔ Map internal keys to Pipedrive fields dynamically  
✔ Check if a Person exists in Pipedrive by **name**  
✔ **Update** existing Person or **Create** a new one  
✔ Log the Pipedrive response for reference  

---

## 🔄 Process Flow

```mermaid
flowchart TD
    A[Start] --> B[Read inputData.json & mappings.json]
    B --> C[Build Pipedrive payload]
    C --> D{Person exists in Pipedrive?}
    D -->|Yes| E[Update existing Person]
    D -->|No| F[Create new Person]
    E --> G[Log response]
    F --> G[Log response]
    G --> H[End]
