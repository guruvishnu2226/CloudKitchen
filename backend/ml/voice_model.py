import whisper

def load_voice_ai():
    try:
        model = whisper.load_model("base")
        print("✅ Voice AI Loaded Successfully")
        return model
    except Exception as e:
        print(f"❌ Could not load Voice AI: {e}")
        return None

# THIS is the exact variable your customer.py file is trying to import!
voice_ai = load_voice_ai()