import sys
from pathlib import Path
from llm_clients import AISquad

# プロンプト読み込み用
def load_prompt(name):
    path = Path(__file__).parent / "prompts" / f"{name}.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return ""

def main():
    squad = AISquad()
    request = sys.argv[1] if len(sys.argv) > 1 else "現状のコードを分析し、改善点を提案して"

    print(f"\n🚀 SQUAD ACTIVATED: Processing request: \"{request}\"\n")

    # --- Phase 1: 🧠 Planner (Claude Code) ---
    # PlannerをClaude Codeに移管したため表示を修正
    print("--- [Phase 1] Planner (Claude Code) is thinking... ---")
    
    # Claude CodeをPlannerとして機能させるための厳格なSystem Instructionを追加
    planner_prompt = f"""
    あなたはV10プロジェクトのPlanner（Context Architect）です。Builderと同じモデル（Claude Code）を使用していますが、
    **あなたの唯一の任務は計画の策定であり、絶対にコードを生成してはなりません**。
    プロジェクトの戦略的使命とマニフェスト（特にGit Worktree Isolation Protocol）を厳守してください。

    ユーザーの要望: {request}
    
    この要望を、Builderが実装すべき具体的な「技術タスクリスト」に分解してください。
    出力はMarkdown形式のリストのみにしてください。
    """
    plan = squad.call("planner", planner_prompt)
    print(f"\n📋 PLAN:\n{plan}\n")

    # --- Phase 2: 🔨 Builder (Claude) ---
    print("--- [Phase 2] Builder (Claude) is coding... ---")
    builder_prompt = f"""
    あなたはBuilder（Polyglot Coder / Claude Code）です。
    以下のプランに基づいて、必要なコードの変更内容、または具体的な実装コードを提示してください。
    
    プラン:
    {plan}
    """
    code_changes = squad.call("builder", builder_prompt)
    print(f"\n🔨 BUILD OUTPUT:\n{code_changes}\n")

    # --- Phase 3: ⚖️ Auditor (ChatGPT) ---
    print("--- [Phase 3] Auditor (ChatGPT) is reviewing... ---")
    auditor_prompt = f"""
    あなたはAuditor（ChatGPT）です。
    Plannerの計画と、Builderの実装案を監査してください。
    
    1. セキュリティ上の問題はないか？
    2. 要望を満たしているか？
    3. 改善すべき点はあるか？
    
    厳格に判定してください。
    
    Plannerの計画:
    {plan}
    
    Builderの実装:
    {code_changes}
    """
    audit_report = squad.call("auditor", auditor_prompt)
    print(f"\n⚖️ AUDIT REPORT:\n{audit_report}\n")

    # 結果の保存
    (Path("artifacts") / "last_run_report.md").write_text(
        f"# Run Report\n## Plan\n{plan}\n## Build\n{code_changes}\n## Audit\n{audit_report}", 
        encoding="utf-8"
    )
    print("\n✅ Squad mission completed. Check artifacts/last_run_report.md")

if __name__ == "__main__":
    main()