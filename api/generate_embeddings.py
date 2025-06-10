import os
import google.generativeai as genai 
from supabase import create_client, Client

# Claves de configuración
GOOGLE_API_KEY = "AIzaSyDU_3Wlr-sJXqplSqxXFMvcchBPbehY4SI"
SUPABASE_URL = "https://fuxqxjwbpbwourkblhte.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1eHF4andicGJ3b3Vya2JsaHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQwNzcwMCwiZXhwIjoyMDYyOTgzNzAwfQ.Hj0hR23ytmtS4r14iIgLSUj3MaF33ZGHWZaTVXymeqU"

genai.configure(api_key=GOOGLE_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Función de embedding
def get_embedding(text: str):
    result = genai.embed_content(
        model="models/embedding-001",
        content=text,
        task_type="retrieval_document"
    )
    return list(result["embedding"])

# Obtener productos
response = supabase.table("products").select("*").execute()
productos = response.data
print(f"🔍 Productos encontrados: {len(productos)}")

# Loop de generación y actualización
for prod in productos:
    print(f"🔎 ID={prod.get('id')} | Tiene embedding: {prod.get('embedding') is not None}")
    if prod.get("embedding") is None:
        text = f"{prod['name']}. {prod['description']}. {prod['specs']}. {prod['brand']}"
        embedding = get_embedding(text)
        print(f"🧠 Generando embedding para: {prod['name']} (id={prod['id']})")

        resp = supabase.table("products").update({
            "embedding": embedding
        }).eq("id", prod["id"]).execute()
        print("📝 Respuesta del update:", resp)

print("✅ Embeddings generados y guardados.")