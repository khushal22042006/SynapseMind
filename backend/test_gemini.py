import google.generativeai as genai

# YOUR API KEY HERE
YOUR_API_KEY = "AIzaSyBJfQixWZ3Wix72BQja3dJKiWAqjMFcu5g"

def test_gemini_correct():
    """Test with YOUR available models"""
    
    # Configure
    genai.configure(api_key=YOUR_API_KEY)
    
    # YOUR available models from screenshot
    models_to_try = [
        'gemini-2.5-flash',        # Fast, should work
        'gemini-2.5-flash-lite',   # Lightweight, likely free
        'gemini-3-flash',          # Latest
        'gemma-3-12b',             # Good for text
        'gemma-3-27b',             # Better quality
    ]
    
    for model_name in models_to_try:
        try:
            print(f"\n🔧 Testing: {model_name}")
            
            # Create model
            model = genai.GenerativeModel(model_name)
            
            # Simple test
            response = model.generate_content(
                "Say 'Hello from Gemini' in a creative way",
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 100,
                }
            )
            
            print(f"✅ SUCCESS with {model_name}!")
            print(f"   Response: {response.text[:100]}...")
            
            # Test if it can handle longer text (for your project)
            test_text = "Artificial intelligence helps students learn better."
            summary_response = model.generate_content(
                f"Summarize this in one sentence: {test_text}"
            )
            print(f"   Summary test: {summary_response.text[:80]}...")
            
            return model_name  # Return first working model
            
        except Exception as e:
            error_msg = str(e)
            if "404" in error_msg:
                print(f"   ❌ Model not found (404)")
            elif "quota" in error_msg.lower() or "429" in error_msg:
                print(f"   ❌ Quota exceeded (429)")
                print(f"      Wait 24 hours or use new API key")
                break
            else:
                print(f"   ❌ Error: {error_msg[:80]}...")
    
    print("\n⚠️ No working models found.")
    return None

if __name__ == "__main__":
    print("=" * 60)
    print("🔍 TESTING YOUR AVAILABLE GEMINI MODELS")
    print("=" * 60)
    
    working_model = test_gemini_correct()
    
    if working_model:
        print(f"\n🎉 USE THIS MODEL IN YOUR PROJECT: '{working_model}'")
        print("\n📋 Add to your backend code:")
        print(f'   model = genai.GenerativeModel("{working_model}")')
    else:
        print("\n🔧 If all models fail:")
        print("   1. Wait 24 hours for quota reset")
        print("   2. Create new Google account for fresh API key")
        print("   3. Check: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com")