# backend/services/gemini_service.py - SIMPLIFIED VERSION
import google.generativeai as genai
import json
import os
import re
import time
from typing import Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables directly
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if not GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY not found in environment")

class GeminiService:
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        """
        Initialize Gemini service
        """
        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        
        self.model_name = model_name
        self.model = genai.GenerativeModel(model_name)
        
        # Rate limiting tracking
        self.last_request_time = 0
        self.request_count = 0
        self.daily_limit = 250000
        self.minute_limit = 1
        
        print(f"✅ Gemini Service initialized")
        print(f"   Model: {model_name}")
    
    def _check_rate_limit(self):
        """Simple rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < 60:
            wait_time = 60 - time_since_last
            print(f"⏳ Waiting {wait_time:.1f}s due to rate limit")
            time.sleep(wait_time)
        
        self.last_request_time = time.time()
        self.request_count += 1
    
    def generate_summary(self, text: str, level: str = "quick") -> str:
        """
        Generate summary
        """
        try:
            self._check_rate_limit()
            
            # Clean text
            text = self._clean_text(text)
            
             # Set appropriate token limits based on level
            token_limits = {
                    "quick": 500,      # ~225 words
                    "detailed": 1200,    
                    "academic": 2000   
                }   
 


            # Simple prompts
            if level == "quick":
                prompt =prompt = f"""Provide a concise 5-6 sentence summary capturing the essence of this text.

                    Text:
                    {text}

                    Focus on:
                    • The main subject or topic
                    • The core finding or argument
                    • Keep it under 600 words
                    """



            elif level == "detailed":
                prompt =prompt = f"""Provide a comprehensive yet concise paragraph summary of this text.

                          Text:
                          {text}

                          Your summary should:
                          1. State the main topic and purpose
                          2. Outline the key points or arguments
                          3. Mention important evidence or examples used
                          4. Note any conclusions or recommendations
                          5. Maintain a smooth, paragraph-style flow 

                          Avoid bullet points - write in complete, connected sentences.
                          """
            
            else:  # academic
                prompt =  f"""Create a structured academic summary of the following text. Include:
                        1. Main topic and scope
                        2. Key concepts/categories discussed  
                        3. Theoretical or practical implications
                        4. Critical analysis or limitations noted

                        Text to summarize:
                        {text}

                        Ensure the summary is complete, coherent, and ends with a concluding statement."""

            response = self.model.generate_content(
                prompt,
                generation_config={
                    "max_output_tokens": token_limits[level],
                    "temperature": 0.3,
                    "top_p": 0.8
                    }
            )
            
            summary = response.text.strip()
            print(f"📊 Generated {level} summary ({len(summary)} chars, {len(summary.split())} words)")
            
            return summary
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Summary error: {error_msg}")
            
            # Fallback
            if level == "quick":
                return f"Quick summary ({word_count} words): This text discusses {self._extract_keywords(text)}."
            elif level == "detailed":
                return f"Detailed summary ({word_count} words): The selected text covers {self._extract_main_topic(text)}. Key points include {self._extract_key_phrases(text, 3)}. This represents an important discussion in the field."
            else:
                 return f"Academic analysis ({word_count} words):\n- Topic: {self._extract_main_topic(text)}\n- Key concepts: {self._extract_key_concepts(text, 4)}\n- Methodology: Analytical review\n- Implications: Theoretical significance"
            

            
    
    def generate_mindmap(self, text: str) -> Dict[str, Any]:
        """
        Generate mind map
        """
        try:
            self._check_rate_limit()
            
            text = self._clean_text(text, max_length=2000)
            
            prompt = f"""Extract main concepts from this text and return as a simple list:
            
            Text: {text}
            
            Concepts:"""
            
            response = self.model.generate_content(
                prompt,
                generation_config={"max_output_tokens": 150, "temperature": 0.2}
            )
            
            # Parse concepts
            concepts = self._parse_concepts(response.text)
            
            # Build mind map
            return self._build_mindmap(concepts)
            
        except Exception as e:
            print(f"❌ Mindmap error: {e}")
            return self._create_fallback_mindmap(text)
        

    
    def _clean_text(self, text: str, max_tokens: int = 8000) -> str:
      """
      Clean and truncate text based on rough token estimation
      """
      if not text:
          return ""
      
      text = ' '.join(text.split())
      
      # Rough estimate: 1 token ≈ 4 characters for English
      max_chars = max_tokens * 4
      
      if len(text) > max_chars:
          truncated = text[:max_chars]
          
          # Try to find a natural break
          for separator in ['. ', '\n\n', '; ', '? ', '! ']:
              last_break = truncated.rfind(separator)
              if last_break > max_chars * 0.7:  # If break is in last 30%
                  return text[:last_break + len(separator)] + "..."
          
          return text[:max_chars] + "..."
      
      return text


    def _parse_concepts(self, text: str) -> list:
        """Parse concepts from response"""
        concepts = []
        
        # Remove markdown code blocks
        text = text.replace('```', '').replace('```json', '').replace('```python', '')
        
        # Try JSON parsing
        try:
            if '[' in text and ']' in text:
                json_str = text[text.find('['):text.find(']')+1]
                concepts = json.loads(json_str)
                return concepts[:5]
        except:
            pass
        
        # Try line-by-line parsing
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        for line in lines:
            # Remove numbers and bullets
            clean_line = re.sub(r'^[\d\-•\.\s]+', '', line)
            if clean_line and len(clean_line) < 50:
                concepts.append(clean_line)
        
        return concepts[:5] if concepts else ["Main Concept", "Key Point 1", "Key Point 2"]
    
    def _build_mindmap(self, concepts: list) -> Dict[str, Any]:
        """Build mind map structure"""
        if not concepts:
            concepts = ["Main Topic", "Sub Topic 1", "Sub Topic 2"]
        
        nodes = []
        for i, concept in enumerate(concepts):
            nodes.append({
                "id": str(i + 1),
                "label": concept[:30],
                "type": "main" if i == 0 else "sub"
            })
        
        edges = []
        if len(nodes) > 1:
            for i in range(2, len(nodes) + 1):
                edges.append({
                    "source": "1",
                    "target": str(i),
                    "label": "includes"
                })
        
        return {"nodes": nodes, "edges": edges}
    
    def _create_fallback_mindmap(self, text: str) -> Dict[str, Any]:
        """Create fallback mind map"""
        # Extract some words as concepts
        words = [w for w in text.split() if len(w) > 4][:3]
        if not words:
            words = ["Learning", "AI", "Technology"]
        
        return {
            "nodes": [
                {"id": "1", "label": words[0], "type": "main"},
                {"id": "2", "label": words[1] if len(words) > 1 else "Concept 1", "type": "sub"},
                {"id": "3", "label": words[2] if len(words) > 2 else "Concept 2", "type": "sub"}
            ],
            "edges": [
                {"source": "1", "target": "2", "label": "includes"},
                {"source": "1", "target": "3", "label": "relates"}
            ]
        }
    
    def get_usage_stats(self) -> dict:
        """Get usage statistics"""
        return {
            "requests_today": self.request_count,
            "daily_limit": self.daily_limit,
            "remaining_today": self.daily_limit - self.request_count,
            "model": self.model_name
        }
    
    def test_connection(self) -> bool:
        """Test Gemini connection"""
        try:
            if not GEMINI_API_KEY:
                return False
            
            self._check_rate_limit()
            response = self.model.generate_content(
                "Hello",
                generation_config={"max_output_tokens": 10}
            )
            return bool(response.text)
        except Exception as e:
            print(f"Connection test failed: {e}")
            return False