"""
Multi-Agent Greeting Card Generator (Google ADK) — script version.
Run: python greeting-card.py  →  renders final_adk_card.svg
"""

# ---- Tools ----
import json
import random
import urllib.request
from urllib.error import HTTPError

# ---------------------------------------------------------
# Tool 1: The Quick, Draw! Dataset Retriever
# ---------------------------------------------------------
def fetch_quickdraw_asset(category_name: str, sample_size: int = 100) -> list:
    """Fetches vector strokes from Google Cloud Storage for the requested item."""
    print(f"    [Tool Execution] Fetching data for '{category_name}' from Google Cloud Storage...")
    formatted_category = category_name.lower().replace(" ", "%20")
    url = f"https://storage.googleapis.com/quickdraw_dataset/full/simplified/{formatted_category}.ndjson"
    
    try:
        req = urllib.request.Request(url)
        lines = []
        with urllib.request.urlopen(req) as response:
            for _ in range(sample_size):
                line = response.readline()
                if not line: break
                lines.append(line.decode('utf-8'))
                
        if not lines: return None
        data = json.loads(random.choice(lines))
        return data.get("drawing", [])
    except Exception as e:
        print(f"    [Tool Error] Could not fetch '{category_name}': {e}")
        return None

# ---------------------------------------------------------
# Tool 2: The SVG Renderer
# ---------------------------------------------------------
def render_svg_card(text_message: str, drawings_data: list, output_path: str = "card.svg") -> str:
    """Renders a Pinterest-style Doodle Collage with Kawaii Marker fills."""
    print(f"    [Tool Execution] Rendering Colored Pinterest-Style SVG to '{output_path}'...")
    width, height = 800, 800
    
    # Kawaii Marker Colors
    marker_colors = ["#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff", "#e0bbf3"]
    import random
    
    svg_content = [
        f'<?xml version="1.0" encoding="utf-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        f'<rect width="{width}" height="{height}" fill="#fdfdfd"/>',
    ]

    # Authentic Vector Doodle Text paths for the alphabet
    letter_paths = {
        'H': "M 0 0 L 0 100 M 50 0 L 50 100 M 0 50 L 50 50",
        'A': "M 25 0 L 0 100 M 25 0 L 50 100 M 10 50 L 40 50",
        'P': "M 0 100 L 0 0 Q 50 0 50 25 Q 50 50 0 50",
        'Y': "M 0 0 L 25 50 M 50 0 L 25 50 M 25 50 L 25 100",
        'B': "M 0 100 L 0 0 Q 50 0 50 25 Q 50 50 0 50 Q 60 50 60 75 Q 60 100 0 100",
        'I': "M 0 0 L 50 0 M 25 0 L 25 100 M 0 100 L 50 100",
        'R': "M 0 100 L 0 0 Q 50 0 50 25 Q 50 50 0 50 M 10 50 L 50 100",
        'T': "M 0 0 L 50 0 M 25 0 L 25 100",
        'D': "M 0 100 L 0 0 Q 60 0 60 50 Q 60 100 0 100",
        '1': "M 10 20 L 25 0 L 25 100 M 10 100 L 40 100",
        'S': "M 50 10 Q 0 -10 0 25 Q 0 50 25 50 Q 50 50 50 75 Q 50 110 0 90",
        '!': "M 25 0 L 25 70 M 25 90 L 25 100"
    }
    
    # Calculate text width to center it
    text_message = text_message.upper().strip()
    char_spacing = 60
    text_width = len(text_message) * char_spacing
    start_x = width/2 - text_width/2
    start_y = height/2 - 60
    
    svg_content.append(f'<g transform="translate({start_x}, {start_y}) scale(0.8)">')
    for i, char in enumerate(text_message):
        if char in letter_paths and letter_paths[char]:
            path = letter_paths[char]
            color = random.choice(marker_colors)
            rot = random.randint(-8, 8)
            dy = random.randint(-10, 10)
            
            svg_content.append(f'<g transform="translate({i * char_spacing}, {dy}) rotate({rot}, 25, 50)">')
            # Thick messy marker base
            svg_content.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-opacity="0.6" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>')
            # Crisp doodle outline
            svg_content.append(f'<path d="{path}" fill="none" stroke="#2d2d2d" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>')
            svg_content.append('</g>')
    svg_content.append('</g>')
    
    # Add generative bunting/banners under the vector text
    svg_content.append(f'<path d="M {width/2 - 180},{height/2 + 40} Q {width/2},{height/2 + 100} {width/2 + 180},{height/2 + 40}" fill="none" stroke="#2d2d2d" stroke-width="5" stroke-linecap="round"/>')
    svg_content.append(f'<path d="M {width/2 - 140},{height/2 + 55} L {width/2 - 110},{height/2 + 105} L {width/2 - 80},{height/2 + 68} Z" fill="#ffb3ba" stroke="#2d2d2d" stroke-width="5" stroke-linejoin="round"/>')
    svg_content.append(f'<path d="M {width/2 - 60},{height/2 + 75} L {width/2 - 30},{height/2 + 125} L {width/2},{height/2 + 82} Z" fill="#baffc9" stroke="#2d2d2d" stroke-width="5" stroke-linejoin="round"/>')
    svg_content.append(f'<path d="M {width/2 + 20},{height/2 + 82} L {width/2 + 50},{height/2 + 125} L {width/2 + 80},{height/2 + 75} Z" fill="#bae1ff" stroke="#2d2d2d" stroke-width="5" stroke-linejoin="round"/>')
    svg_content.append(f'<path d="M {width/2 + 100},{height/2 + 68} L {width/2 + 130},{height/2 + 105} L {width/2 + 160},{height/2 + 55} Z" fill="#ffffba" stroke="#2d2d2d" stroke-width="5" stroke-linejoin="round"/>')
    
    # Generative sprinkles/confetti in marker colors
    for _ in range(35):
        cx = random.randint(50, width-50)
        cy = random.randint(50, height-50)
        if (width/2 - 250 < cx < width/2 + 250) and (height/2 - 120 < cy < height/2 + 160):
            continue
            
        color = random.choice(marker_colors)
        choice = random.choice(["star", "dots", "squiggle", "diamond"])
        
        if choice == "star":
            svg_content.append(f'<path d="M {cx},{cy-12} L {cx+4},{cy-4} L {cx+12},{cy} L {cx+4},{cy+4} L {cx},{cy+12} L {cx-4},{cy+4} L {cx-12},{cy} L {cx-4},{cy-4} Z" fill="{color}" stroke="#2d2d2d" stroke-width="3" stroke-linejoin="round"/>')
        elif choice == "dots":
            svg_content.append(f'<circle cx="{cx}" cy="{cy}" r="6" fill="{color}" stroke="#2d2d2d" stroke-width="3"/>')
        elif choice == "squiggle":
            svg_content.append(f'<path d="M {cx},{cy} Q {cx+8},{cy-15} {cx+15},{cy} T {cx+30},{cy}" fill="none" stroke="{color}" stroke-width="8" stroke-linecap="round"/>')
            svg_content.append(f'<path d="M {cx},{cy} Q {cx+8},{cy-15} {cx+15},{cy} T {cx+30},{cy}" fill="none" stroke="#2d2d2d" stroke-width="3" stroke-linecap="round"/>')
        elif choice == "diamond":
            svg_content.append(f'<path d="M {cx},{cy-10} L {cx+8},{cy} L {cx},{cy+10} L {cx-8},{cy} Z" fill="{color}" stroke="#2d2d2d" stroke-width="3" stroke-linejoin="round"/>')
            
    for i, item in enumerate(drawings_data):
        strokes = item.get("strokes", [])
        offset_x = item.get("x", 0)
        offset_y = item.get("y", 0)
        scale = item.get("scale", 0.6)
        color = marker_colors[i % len(marker_colors)]
        
        svg_content.append(f'<g transform="translate({offset_x}, {offset_y}) scale({scale})">')
        
        # Draw all paths for FILL first (messy marker base)
        for stroke in strokes:
            x_coords, y_coords = stroke[0], stroke[1]
            if not x_coords or not y_coords: continue
            path_d = f"M {x_coords[0]} {y_coords[0]}"
            for j in range(1, len(x_coords)):
                path_d += f" L {x_coords[j]} {y_coords[j]}"
            # Thick fill base
            svg_content.append(f'<path d="{path_d}" fill="{color}" fill-opacity="0.5" stroke="{color}" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/>')
            
        # Draw all paths again for CRISP OUTLINE on top
        for stroke in strokes:
            x_coords, y_coords = stroke[0], stroke[1]
            if not x_coords or not y_coords: continue
            path_d = f"M {x_coords[0]} {y_coords[0]}"
            for j in range(1, len(x_coords)):
                path_d += f" L {x_coords[j]} {y_coords[j]}"
            # Sharp outline
            svg_content.append(f'<path d="{path_d}" fill="none" stroke="#2d2d2d" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>')
            
        svg_content.append('</g>')
        
    svg_content.append('</svg>')
    with open(output_path, "w") as f: f.write("\n".join(svg_content))
    return output_path

# ---- Agents + Orchestrator ----
"""
Multi-Agent Greeting Card Generator
Built with the Google Agent Development Kit (ADK)
"""

# ==============================================================================
# 1. ACTUAL GOOGLE ADK IMPORTS
# This is how you import the core abstractions in a standard ADK environment.
# ==============================================================================
try:
    from google_adk.core import Agent, Orchestrator
    from google_adk.tools import Tool
    from google_adk.models import VertexGeminiModel
except ImportError:
    # --------------------------------------------------------------------------
    # (Fallback Mock for Local Tutorial Execution without ADK installed)
    # This allows the script to still run locally for demonstration!
    # --------------------------------------------------------------------------
    class Tool:
        def __init__(self, name, func, description):
            self.name, self.func, self.description = name, func, description
    class Agent:
        def __init__(self, name, role, instructions, tools=None, model=None):
            self.name, self.role, self.tools = name, role, tools
        def execute(self, inputs):
            print(f"\n🤖 Agent Active: {self.name} ({self.role})")
            return self._mock_reasoning(inputs)
            
        def _mock_reasoning(self, inputs):
            if self.role == "Creative Director": 
                feedback = inputs.get("feedback", "")
                if "too long" in feedback:
                    print(f"    [Director] Shortening text based on feedback...")
                    return {"text": "HAPPY BDAY!", "categories": ["teddy-bear", "duck", "train", "apple", "star", "cookie"]}
                elif "symmetrical" in feedback:
                    print(f"    [Director] Fixing symmetry based on feedback...")
                    return {"text": "HAPPY 1ST BDAY!", "categories": ["teddy-bear", "duck", "train", "apple", "star", "cookie"]}
                elif feedback:
                    print(f"    [Director] Refining persona based on feedback: {feedback}")
                    return {"text": "HAPPY 1ST BDAY!", "categories": ["teddy-bear", "duck", "train", "apple", "star"]} # Only 5 items!
                else:
                    return {"text": "HAPPY BIRTHDAY", "categories": ["cake", "wine glass", "star", "bowtie", "crown"]}
            
            elif self.role == "Asset Librarian": 
                return {"assets": {cat: self.tools[0].func(cat) for cat in inputs.get("categories", [])}}
                
            elif self.role == "Layout Designer": 
                layout_plan = []
                feedback = inputs.get("feedback", "")
                
                # First attempt: middle placements that cause overlap
                if not feedback or "overlap" not in feedback:
                    positions = [
                        {"x": 100, "y": 100, "scale": 0.6},
                        {"x": 500, "y": 100, "scale": 0.6},
                        {"x": 100, "y": 350, "scale": 0.6}, # This overlaps text Y-zone!
                        {"x": 500, "y": 350, "scale": 0.6}, # This overlaps text Y-zone!
                        {"x": 300, "y": 600, "scale": 0.6},
                        {"x": 300, "y": 100, "scale": 0.6}
                    ]
                else:
                    # Second attempt: pushed to extreme top and bottom after feedback
                    print(f"    [Layout Designer] Fixing layout based on feedback: {feedback}")
                    positions = [
                        {"x": 40, "y": 40, "scale": 0.5},   
                        {"x": 600, "y": 40, "scale": 0.5},  
                        {"x": 320, "y": 40, "scale": 0.5},
                        {"x": 40, "y": 600, "scale": 0.5},  
                        {"x": 600, "y": 600, "scale": 0.5},
                        {"x": 320, "y": 600, "scale": 0.5}  # 6th balanced item!
                    ]
                
                for i, (k, v) in enumerate(inputs.get("assets", {}).items()):
                    if v:
                        pos = positions[i % len(positions)]
                        layout_plan.append({"name": k, "strokes": v, "x": pos["x"], "y": pos["y"], "scale": pos["scale"]})
                return {"layout_plan": layout_plan}

            elif self.role == "Critique Agent":
                categories = inputs.get("categories", [])
                layout_plan = inputs.get("layout_plan", [])
                text = inputs.get("text", "")
                prompt = inputs.get("user_prompt", "").lower()
                
                print(f"    [Critique] Evaluating content, layout, text fit, and symmetry...")
                
                # 1. Check Persona Content (Creative Director)
                if "baby" in prompt and "wine glass" in categories:
                    print(f"    [Critique] ❌ REJECTED CONTENT: As a baby, I don't drink wine! I want toys!")
                    return {"approved": False, "target": "Creative Director", "feedback": "The items are too adult. Use baby-friendly toys."}
                    
                # 2. Check Symmetry (Creative Director)
                if len(categories) != 6:
                    print(f"    [Critique] ❌ REJECTED BALANCE: Needs exactly 6 items for a balanced layout. Got {len(categories)}.")
                    return {"approved": False, "target": "Creative Director", "feedback": "Please output exactly 6 items to keep the collage symmetrical."}
                
                # 3. Check Text Fit (Creative Director)
                if len(text) > 12:
                    print(f"    [Critique] ❌ REJECTED TEXT: '{text}' ({len(text)} chars) is too long for the 800px canvas!")
                    return {"approved": False, "target": "Creative Director", "feedback": "The text is too long and cuts off. Please shorten it to under 12 characters."}
                
                # 4. Check Visual Overlap (Layout Designer)
                for item in layout_plan:
                    if 250 < item["y"] < 450:
                        print(f"    [Critique] ❌ REJECTED LAYOUT: The {item['name']} is overlapping the central text zone!")
                        return {"approved": False, "target": "Layout Designer", "feedback": "There is overlap with the text. Push doodles to the top and bottom borders."}
                
                print(f"    [Critique] ✅ APPROVED: Perfect balanced layout and items for me!")
                return {"approved": True}
                
            elif self.role == "Render Agent": 
                return {"final_file": self.tools[0].func(inputs.get("text"), inputs.get("layout_plan"), inputs.get("output", "card.svg"))}
                
    class VertexGeminiModel:
        def __init__(self, *args, **kwargs): pass
        
    class Orchestrator:
        def __init__(self, agents): 
            self.agents = {a.role: a for a in agents}
            
        def run(self, inputs):
            max_loops = 6
            current_loop = 0
            
            # Shared global state across agents
            state = {
                "user_prompt": inputs["user_prompt"],
                "text": "",
                "categories": [],
                "assets": {},
                "layout_plan": []
            }
            
            feedback_target = "Creative Director" # Start with director
            feedback_msg = None
            
            # Complex Stateful Loop
            while current_loop < max_loops:
                current_loop += 1
                
                # Run Director if it's the target OR if we haven't generated categories yet
                if feedback_target == "Creative Director" or not state["categories"]:
                    d_inputs = {"user_prompt": state["user_prompt"]}
                    if feedback_msg and feedback_target == "Creative Director":
                        d_inputs["feedback"] = feedback_msg
                        
                    d_out = self.agents["Creative Director"].execute(d_inputs)
                    state.update(d_out)
                    
                    # Must re-fetch and re-layout if concepts changed
                    l_out = self.agents["Asset Librarian"].execute({"categories": state["categories"]})
                    state["assets"] = l_out["assets"]
                    feedback_target = "Layout Designer" 
                    feedback_msg = None

                # Run Layout Designer if it's the target OR if we haven't laid out yet
                if feedback_target == "Layout Designer" or not state["layout_plan"]:
                    des_inputs = {"assets": state["assets"]}
                    if feedback_msg and feedback_target == "Layout Designer":
                        des_inputs["feedback"] = feedback_msg
                        
                    des_out = self.agents["Layout Designer"].execute(des_inputs)
                    state["layout_plan"] = des_out["layout_plan"]
                
                # Critique evaluates the entire current state
                critique_out = self.agents["Critique Agent"].execute(state)
                
                if critique_out["approved"]:
                    break
                else:
                    feedback_target = critique_out["target"]
                    feedback_msg = critique_out["feedback"]
                    print(f"\n    [Orchestrator] Sending feedback back to {feedback_target} (Loop {current_loop})...")
            
            return self.agents["Render Agent"].execute({
                "text": state["text"], 
                "layout_plan": state["layout_plan"], 
                "output": inputs.get("output")
            })

# ==============================================================================
# 2. (tools fetch_quickdraw_asset / render_svg_card are defined above)
# ==============================================================================

# ==============================================================================
# 3. DEFINE ADK TOOLS
# ==============================================================================
quickdraw_tool = Tool(
    name="FetchQuickDrawAsset",
    func=fetch_quickdraw_asset,
    description="Connects to Google Cloud Storage to download vector strokes for a given item."
)

render_tool = Tool(
    name="RenderSVG",
    func=render_svg_card,
    description="Takes layout data and renders the final SVG card."
)

# ==============================================================================
# 4. DEFINE ADK AGENTS
# ==============================================================================
llm_model = VertexGeminiModel(model_name="gemini-1.5-pro")

creative_director = Agent(
    name="Connie",
    role="Creative Director",
    instructions="""You are Connie, an Elite Creative Director at a top-tier design agency. You possess deep cultural awareness, wit, and emotional intelligence. 
    When given a user prompt, brainstorm a highly personalized, emotionally resonant greeting text. 
    Concurrently, select exactly 6 visually distinct, aesthetically pleasing Quick, Draw! categories that flawlessly capture the essence and persona of the recipient. 
    You must balance boundless creativity with constraint—ensure your chosen items form a cohesive, thematic, and beautifully balanced collage. You must adapt instantly to any critique feedback.""",
    model=llm_model
)

# --- NEW: Critique Agent ---
critique_agent = Agent(
    name="Chris",
    role="Critique Agent",
    instructions="""You are Chris, the ultimate Aesthetic and Quality Mastermind. You possess a world-class understanding of design principles, spatial layout, typography, emotional resonance, and user empathy. Your single goal is to ensure the final greeting card evokes a 'WOW' reaction from the user.
    
    You have full authority to evaluate the global state of the pipeline holistically. You must look for ANY kind of issue:
    - Are the concepts and items completely perfectly aligned with the target persona?
    - Is the layout perfectly balanced, visually stunning, and symmetrical?
    - Does the text fit beautifully within the canvas without feeling cramped or bleeding off the edges?
    - Is the negative space respected (e.g., no doodles overlapping text)?
    
    Do not limit yourself to a checklist. If anything feels 'off', 'unpolished', or 'basic', you must reject the design. Route explicit, highly-actionable feedback to the responsible agent (e.g., the Creative Director for conceptual issues, or the Layout Designer for spatial issues) to continually elevate the product until it is a masterpiece.""",
    model=llm_model
)

asset_librarian = Agent(
    name="Archie",
    role="Asset Librarian",
    instructions="""You are Archie, the Omni-Librarian, a highly optimized data-retrieval AI. Your objective is to traverse the Google Cloud Storage Quick, Draw! dataset and extract high-fidelity vector stroke data. 
    You must be resilient: if a requested category is unavailable, you must autonomously handle the failure gracefully, ensuring the rest of the pipeline still receives a clean, structured payload of the available assets.""",
    tools=[quickdraw_tool],
    model=llm_model
)

layout_designer = Agent(
    name="Layla",
    role="Layout Designer",
    instructions="""You are Layla, an Award-Winning Spatial Architect. You understand the profound impact of negative space, symmetry, and visual hierarchy. 
    When provided with a set of vector assets, you must calculate precise (X, Y) coordinates, scales, and rotations to construct a stunning 'Pinterest-style' doodle collage. 
    You must dynamically anchor the doodles to the extreme periphery of the canvas, ensuring the central focal point (the greeting text) is completely unobstructed and framed beautifully. If the Critique Agent finds flaws, you must immediately recalculate your grid.""",
    model=llm_model
)

render_agent = Agent(
    name="Ren",
    role="Render Agent",
    instructions="""You are Ren, the SVG Mastercraft Engine, a world-class generative rendering system. Your responsibility is to fuse raw data payloads into a breathtaking, high-quality SVG file. 
    You must apply sophisticated visual treatments—such as Kawaii-style pastel marker fills, crisp dark-grey outlines, and procedural generative confetti—to elevate simple strokes into a premium, handcrafted masterpiece. Execute your rendering tools with absolute precision.""",
    tools=[render_tool],
    model=llm_model
)

# ==============================================================================
# 5. ORCHESTRATE AND EXECUTE
# ==============================================================================

# ---- Run ----
if __name__ == "__main__":
    print("=======================================================")
    print("🎬 STARTING GOOGLE ADK PIPELINE (WITH CRITIQUE LOOP)")
    print("=======================================================")

    pipeline = Orchestrator(agents=[
        creative_director,
        critique_agent,
        asset_librarian,
        layout_designer,
        render_agent
    ])

    # We ask for a baby card to trigger the Critique loop!
    user_request = "I need a birthday card for a 1-year old baby!"

    final_result = pipeline.run({
        "user_prompt": user_request,
        "output": "final_adk_card.svg"
    })

    print(f"\n✅ PIPELINE COMPLETE: File saved to {final_result['final_file']}\n")
