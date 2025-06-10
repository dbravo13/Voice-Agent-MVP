import asyncio
import json
import os
from google import genai
import base64
from google.genai import types

from websockets.server import WebSocketServerProtocol
import websockets.server
from pydub import AudioSegment

from supabase import create_client, Client


SUPABASE_URL = "https://fuxqxjwbpbwourkblhte.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1eHF4andicGJ3b3Vya2JsaHRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQwNzcwMCwiZXhwIjoyMDYyOTgzNzAwfQ.Hj0hR23ytmtS4r14iIgLSUj3MaF33ZGHWZaTVXymeqU"


supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


# Load API key from environment
os.environ['GOOGLE_API_KEY'] = 'AIzaSyDU_3Wlr-sJXqplSqxXFMvcchBPbehY4SI'
gemini_api_key = os.environ['GOOGLE_API_KEY']
MODEL = "gemini-2.0-flash-live-001"  # For multimodal

client = genai.Client(
  http_options={
    'api_version': 'v1alpha',
  }
)
# ==== FUNCIONES AUXILIARES ====

def load_previous_session_handle():
    try:
        with open('session_handle.json', 'r') as f:
            data = json.load(f)
            print(f"Loaded previous session handle: {data.get('previous_session_handle')}")
            return data.get('previous_session_handle')
    except FileNotFoundError:
        return None

def save_previous_session_handle(handle):
    with open('session_handle.json', 'w') as f:
        json.dump({'previous_session_handle': handle}, f)

def get_embedding(text: str):
    model = genai.GenerativeModel("embedding-001")
    res = model.embed_content(
        content=text,
        task_type="RETRIEVAL_DOCUMENT",
        title="Consulta del usuario"
    )
    return res["embedding"]

def buscar_productos_similares(texto):
    embedding = get_embedding(texto)
    vector_str = str(embedding).replace('[', '{').replace(']', '}')
    query = f"""
        SELECT id, name, description, specs, brand
        FROM products
        ORDER BY embedding <-> '{vector_str}'::vector
        LIMIT 5;
    """
    response = supabase.rpc("execute_sql", {"sql": query}).execute()
    return response.data


# ==== SESIÓN PRINCIPAL GEMINI ====

previous_session_handle = load_previous_session_handle()

async def gemini_session_handler(websocket: WebSocketServerProtocol):
    print(f"Starting Gemini session")
    try:
        config_message = await websocket.recv()
        config_data = json.loads(config_message)

        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Kore")
                ),
                language_code='es-ES',
            ),
            system_instruction="You are a helpful assistant.",
            session_resumption=types.SessionResumptionConfig(
                handle=previous_session_handle
            ),
            output_audio_transcription=types.AudioTranscriptionConfig()
        )

        async with client.aio.live.connect(model=MODEL, config=config) as session:

            async def send_to_gemini():
                try:
                    async for message in websocket:
                        try:
                            data = json.loads(message)

                            if "realtime_input" in data:
                                for chunk in data["realtime_input"]["media_chunks"]:
                                    if chunk["mime_type"] == "audio/pcm":
                                        await session.send(input={
                                            "mime_type": "audio/pcm",
                                            "data": chunk["data"]
                                        })
                                    elif chunk["mime_type"].startswith("image/"):
                                        await session.send(input={
                                            "mime_type": chunk["mime_type"],
                                            "data": chunk["data"]
                                        })

                            elif "text" in data:
                                text_content = data["text"]
                                if text_content.startswith("buscar productos:"):
                                    query = text_content.replace("buscar productos:", "").strip()
                                    resultados = buscar_productos_similares(query)
                                    await websocket.send(json.dumps({"productos_similares": resultados}))
                                else:
                                    await session.send(input={
                                        "mime_type": "text/plain",
                                        "data": text_content
                                    })
                        except Exception as e:
                            print(f"Error sending to Gemini: {e}")
                except Exception as e:
                    print(f"Error in send_to_gemini: {e}")
                finally:
                    print("send_to_gemini closed")

            async def receive_from_gemini():
                try:
                    while True:
                        try:
                            async for response in session.receive():

                                if response.server_content and getattr(response.server_content, 'interrupted', None):
                                    await websocket.send(json.dumps({"interrupted": "True"}))
                                    continue

                                if response.usage_metadata:
                                    usage = response.usage_metadata
                                    print(f'Used {usage.total_token_count} tokens in total.')

                                if response.session_resumption_update:
                                    update = response.session_resumption_update
                                    if update.resumable and update.new_handle:
                                        save_previous_session_handle(update.new_handle)
                                        print(f"Session resumed with handle: {update.new_handle}")

                                sc = response.server_content
                                if sc:
                                    if sc.output_transcription:
                                        await websocket.send(json.dumps({
                                            "transcription": {
                                                "text": sc.output_transcription.text,
                                                "sender": "Gemini",
                                                "finished": sc.output_transcription.finished
                                            }
                                        }))

                                    if sc.input_transcription:
                                        await websocket.send(json.dumps({
                                            "transcription": {
                                                "text": sc.input_transcription.text,
                                                "sender": "User",
                                                "finished": sc.input_transcription.finished
                                            }
                                        }))

                                    if sc.model_turn:
                                        for part in sc.model_turn.parts:
                                            if getattr(part, 'text', None):
                                                await websocket.send(json.dumps({"text": part.text}))
                                            elif getattr(part, 'inline_data', None):
                                                try:
                                                    base64_audio = base64.b64encode(part.inline_data.data).decode('utf-8')
                                                    await websocket.send(json.dumps({"audio": base64_audio}))
                                                except Exception as e:
                                                    print(f"Error sending audio: {e}")

                                    if sc.turn_complete:
                                        await websocket.send(json.dumps({
                                            "transcription": {
                                                "text": "",
                                                "sender": "Gemini",
                                                "finished": True
                                            }
                                        }))

                        except websockets.exceptions.ConnectionClosedOK:
                            break
                        except Exception as e:
                            print(f"Error receiving from Gemini: {e}")
                            break
                finally:
                    print("receive_from_gemini closed")

            await asyncio.gather(
                asyncio.create_task(send_to_gemini()),
                asyncio.create_task(receive_from_gemini())
            )

    except Exception as e:
        print(f"Error in Gemini session: {e}")
    finally:
        print("Gemini session closed.")


# ==== MAIN SERVER ====

async def main():
    server = await websockets.server.serve(
        gemini_session_handler,
        host="0.0.0.0",
        port=9084,
        compression=None
    )
    print("WebSocket server running on ws://0.0.0.0:9084")
    await asyncio.Future()  # Keep alive

if __name__ == "__main__":
    asyncio.run(main())