from typing import Literal
# import google.generativeai as genai # 削除
from openai import OpenAI
from anthropic import Anthropic
from .config import GOOGLE_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY

class AISquad:
    def __init__(self):
        # 🔨 Planner/Builder: Claude Code
        # PlannerはClaude Code (Builderと同じ) に移管されます
        if ANTHROPIC_API_KEY:
            self.claude = Anthropic(api_key=ANTHROPIC_API_KEY)
        
        # ⚖️ Auditor: ChatGPT
        if OPENAI_API_KEY:
            self.chatgpt = OpenAI(api_key=OPENAI_API_KEY)

        # Geminiに関する初期化コードは削除されました

    def call(self, role: Literal["planner", "builder", "auditor"], prompt: str) -> str:
        print(f"🤖 Calling {role.upper()}...")
        
        # 役割が 'planner' または 'builder' の場合、Claudeクライアントを使用
        if role == "planner" or role == "builder": 
            if not hasattr(self, 'claude'):
                return f"Error: ANTHROPIC_API_KEY not configured for {role} role."
            
            # Planner/Builder (Claude Code, Sonnet 3.5)
            msg = self.claude.messages.create(
                model="claude-3-5-sonnet-latest", # Builderと同じモデルを使用
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}]
            )
            return msg.content[0].text
            
        elif role == "auditor": # ChatGPT (GPT-4o)
            if not hasattr(self, 'chatgpt'):
                return "Error: OPENAI_API_KEY not configured for Auditor role."
                
            resp = self.chatgpt.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}]
            )
            return resp.choices[0].message.content
        
        return "Error: Unknown Role"