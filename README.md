# 🛒 Buy N Large Voice Marketplace MVP

Un **marketplace de nueva generación** impulsado por **IA conversacional** con voz en tiempo real, construido con **Lovable**, **Supabase**, **Gemini Live** y **RAG (Retrieval-Augmented Generation)**.

---

## 🚀 ¿Qué hace este MVP?

Imagina que compras en Amazon, pero en vez de hacer clics, **hablas con un agente de IA** que te guía, responde tus dudas, y te recomienda productos **en tiempo real**.

Este MVP demuestra exactamente eso.

---

## 🧠 Características Clave

- 🎙️ **Asistente de voz** con Gemini Live (IA conversacional en tiempo real).
- 🔍 **Recomendaciones contextuales** gracias a RAG con embeddings vectoriales.
- 🛍️ **Exploración fluida de productos** con una interfaz intuitiva.
- ⚡ Construido rápidamente usando **Lovable** + **Supabase**.

---

## 🛠️ Tecnologías Usadas

| Tecnología                                      | Propósito                                           |
| ----------------------------------------------- | --------------------------------------------------- |
| [Lovable](https://lovable.so)                   | UI/UX y lógica frontend/backend sin fricción.       |
| [Supabase](https://supabase.com)                | Base de datos, API REST y almacenamiento vectorial. |
| [Gemini Live](https://aistudio.google.com/live) | Agente de IA conversacional con voz.                |

---

## 🧩 Arquitectura General

1. **Frontend** en Lovable conecta con Supabase y Gemini Live.
2. **Productos** están guardados en Supabase, junto con embeddings generados.
3. Cuando el usuario hace una consulta por voz:
   - Gemini convierte su voz en texto.
   - Generamos un **embedding del texto**.
   - Consultamos la base usando un índice vectorial.
   - La IA responde con contexto real del producto.

---

## 🧪 Demo en Video

📺 [YouTube: Demo del MVP (máx. 10 min)](https://youtu.be/MZQLlCUxH9k)

---

## 📦 Scripts Clave

### 🔹 `generate_embeddings.py`

```python
# Genera y guarda embeddings en Supabase usando Gemini
```

### 🔹 `buscar_productos_por_embedding()`

```sql
create or replace function buscar_productos_por_embedding(
  input_embedding vector(768)
)
returns table (
  id int8,
  name text,
  description text,
  specs jsonb,
  brand text,
  score numeric
)
language sql
as $$
  select
    id,
    name,
    description,
    specs,
    brand,
    1 - (embedding <-> input_embedding) as score
  from products
  order by embedding <-> input_embedding
  limit 5;
$$;

```

## ⚙️ Cómo Ejecutarlo

Sigue estos pasos para levantar el proyecto localmente:

### 1. Clona el repositorio

```bash
git clone https://github.com/dbravo13/Voice-Agent-MVP.git
cd proyecto
```

### 2. Levanta la interfaz (Lovable)

```bash
cd client
npm install
```

Accede a http://localhost:8080

### 3. Genera y guarda los embeddings en Supabase

```python
python generate_embeddings.py
```

Este script:

- Lee los productos desde Supabase.

- Genera embeddings con Gemini.

- Los guarda en el campo embedding del producto.
