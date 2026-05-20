import os
from openai import OpenAI

# Initialize the lightweight API client
# (It automatically uses the OPENAI_API_KEY from your environment variables)
client = OpenAI()

def transcribe_audio(audio_file_path):
    try:
        if not os.path.exists(audio_file_path):
            print("❌ Audio file not found")
            return ""
            
        with open(audio_file_path, "rb") as audio_file:
            print("🎙️ Sending audio to OpenAI Cloud Whisper...")
            transcript = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file
            )
        return transcript.text
    except Exception as e:
        print(f"❌ Cloud Transcription error: {e}")
        return ""

# Dummy object placeholder so your other files don't break if they import it
voice_ai = None