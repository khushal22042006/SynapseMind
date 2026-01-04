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
        Generate mind map with hierarchical structure from text
        """
        try:
            self._check_rate_limit()
            
            # Clean text but keep more context
            text = self._clean_text(text)
            
            prompt = f"""Analyze this text and extract key concepts to create a hierarchical mind map.
            
            TEXT:
            {text}
            
            Extract:
            1. MAIN_CENTRAL_TOPIC: [The central theme]
            2. PRIMARY_BRANCHES: [3-5 main categories or subtopics]
            3. For each primary branch, list 2-3 key points or sub-branches
            4. Show connections between related concepts
            
            Format your response as:
            CENTRAL_TOPIC: [topic name]
            
            BRANCHES:
            1. [Branch 1 Name]
            • [Subpoint 1]
            • [Subpoint 2]
            
            2. [Branch 2 Name]
            • [Subpoint 1]
            • [Subpoint 2]
            
            RELATIONSHIPS:
            - [Concept A] is related to [Concept B] because...
            - [Concept B] connects to [Concept C] for...
            
            Keep it structured but concise."""
            
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "max_output_tokens": 2000,  # Increased for hierarchy
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "top_k": 40
                }
            )
            
            # Parse the structured response
            mindmap_data = self._parse_structured_mindmap(response.text)
            
            # Build nodes and connections
            return self._build_mindmap_structure(mindmap_data)
            
        except Exception as e:
            print(f"❌ Mindmap generation error: {e}")
            return self._create_fallback_mindmap(text)

    def _parse_structured_mindmap(self, response_text: str) -> Dict[str, Any]:
        """
        Parse structured mind map data from Gemini response
        """
        data = {
            "central_topic": "",
            "branches": [],
            "relationships": []
        }
        
        lines = response_text.strip().split('\n')
        current_section = None
        current_branch = None
        
        for line in lines:
            line = line.strip()
            
            if not line:
                continue
                
            # Identify sections
            if line.startswith("CENTRAL_TOPIC:"):
                data["central_topic"] = line.replace("CENTRAL_TOPIC:", "").strip()
                current_section = "central"
                
            elif line.startswith("BRANCHES:"):
                current_section = "branches"
                
            elif line.startswith("RELATIONSHIPS:"):
                current_section = "relationships"
                
            # Parse based on current section
            elif current_section == "branches":
                # Check for branch number (1., 2., etc.)
                if line and line[0].isdigit() and '.' in line and len(line.split('.')[0].strip()) == 1:
                    branch_name = line.split('.', 1)[1].strip()
                    current_branch = {
                        "name": branch_name,
                        "points": []
                    }
                    data["branches"].append(current_branch)
                    
                elif line.startswith("•") or line.startswith("-"):
                    if current_branch:
                        point = line[1:].strip()
                        current_branch["points"].append(point)
                        
            elif current_section == "relationships":
                if line.startswith("-"):
                    rel_text = line[1:].strip()
                    data["relationships"].append(rel_text)
        
        return data

    def _build_mindmap_structure(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build mind map nodes and connections from parsed data
        """
        nodes = []
        edges = []
        node_id_counter = 0
        
        # Add central topic node
        if data["central_topic"]:
            central_id = f"node_{node_id_counter}"
            nodes.append({
                "id": central_id,
                "label": data["central_topic"],
                "type": "central",
                "size": 30
            })
            node_id_counter += 1
        
        # Add branch nodes
        branch_nodes = []
        for i, branch in enumerate(data["branches"]):
            branch_id = f"node_{node_id_counter}"
            nodes.append({
                "id": branch_id,
                "label": branch["name"],
                "type": "branch",
                "size": 24
            })
            branch_nodes.append((branch_id, branch))
            
            # Connect branch to central topic
            if central_id:
                edges.append({
                    "id": f"edge_{len(edges)}",
                    "source": central_id,
                    "target": branch_id,
                    "label": "contains"
                })
            
            node_id_counter += 1
            
            # Add subpoints
            for j, point in enumerate(branch.get("points", [])):
                point_id = f"node_{node_id_counter}"
                nodes.append({
                    "id": point_id,
                    "label": point,
                    "type": "detail",
                    "size": 18
                })
                
                # Connect point to branch
                edges.append({
                    "id": f"edge_{len(edges)}",
                    "source": branch_id,
                    "target": point_id,
                    "label": "includes"
                })
                
                node_id_counter += 1
        
        # Add relationship-based connections (if any)
        for rel in data.get("relationships", []):
            # Simple relationship extraction - you could enhance this
            if " is related to " in rel:
                parts = rel.split(" is related to ")
                if len(parts) == 2:
                    source_concept = parts[0].strip()
                    target_part = parts[1].split(" because")[0].strip()
                    
                    # Find matching nodes (simplified - could be enhanced)
                    for node in nodes:
                        if source_concept.lower() in node["label"].lower():
                            source_id = node["id"]
                            for target_node in nodes:
                                if target_part.lower() in target_node["label"].lower() and target_node["id"] != source_id:
                                    edges.append({
                                        "id": f"edge_{len(edges)}",
                                        "source": source_id,
                                        "target": target_node["id"],
                                        "label": "related to",
                                        "dashed": True
                                    })
                                    break
                            break
        
        return {
            "nodes": nodes,
            "edges": edges,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "central_topic": data.get("central_topic", ""),
            "status": "success"
        }

    def _create_fallback_mindmap(self, text: str) -> Dict[str, Any]:
        """
        Create a simple fallback mind map when generation fails
        """
        # Extract first sentence as central topic
        first_sentence = text.split('.')[0][:100]
        
        nodes = [
            {
                "id": "node_0",
                "label": first_sentence if first_sentence else "Main Topic",
                "type": "central",
                "size": 30
            }
        ]
        
        # Add a few basic branches based on text keywords
        keywords = ["equation", "assumptions", "applications", "variables"]
        for i, keyword in enumerate(keywords[:3]):
            if keyword in text.lower():
                nodes.append({
                    "id": f"node_{i+1}",
                    "label": keyword.capitalize(),
                    "type": "branch",
                    "size": 24
                })
        
        # Simple connections
        edges = []
        for i in range(1, len(nodes)):
            edges.append({
                "id": f"edge_{i-1}",
                "source": "node_0",
                "target": nodes[i]["id"]
            })
        
        return {
            "nodes": nodes,
            "edges": edges,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "central_topic": first_sentence,
            "status": "fallback"
        }  






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