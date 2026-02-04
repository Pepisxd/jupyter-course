import argparse
import json
from typing import Any, Dict, List

from datasets import load_dataset


DEFAULT_SYSTEM = "You are a helpful Jupyter Notebook assistant."


def normalize_messages(sample: Dict[str, Any]) -> List[Dict[str, str]]:
    if "messages" in sample and isinstance(sample["messages"], list):
        messages = [
            {
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            }
            for msg in sample["messages"]
            if msg.get("content")
        ]
        return messages

    question = sample.get("question") or sample.get("prompt") or ""
    answer = sample.get("answer") or sample.get("response") or ""
    if not question or not answer:
        return []

    return [
        {"role": "user", "content": str(question)},
        {"role": "assistant", "content": str(answer)},
    ]


def passes_package_filter(sample: Dict[str, Any], include_packages: List[str]) -> bool:
    if not include_packages:
        return True
    packages = sample.get("packages_used") or []
    packages_lower = {str(pkg).lower() for pkg in packages}
    return any(pkg in packages_lower for pkg in include_packages)


def build_training_row(messages: List[Dict[str, str]], system_prompt: str) -> Dict[str, Any]:
    if not messages:
        return {}

    if messages[0].get("role") != "system":
        messages = [{"role": "system", "content": system_prompt}] + messages

    return {"messages": messages}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dataset",
        default="jupyter-agent/jupyter-agent-dataset",
        help="Hugging Face dataset path",
    )
    parser.add_argument("--split", default="non_thinking")
    parser.add_argument("--output", default="hf_jupyter_messages.jsonl")
    parser.add_argument("--max-samples", type=int, default=5000)
    parser.add_argument(
        "--include-packages",
        default="pandas,numpy,sklearn,matplotlib",
        help="Comma-separated package filter (optional).",
    )
    parser.add_argument("--system-prompt", default=DEFAULT_SYSTEM)
    parser.add_argument(
        "--streaming",
        action="store_true",
        help="Stream samples from HF without downloading full split first.",
    )
    args = parser.parse_args()

    include_packages = [
        pkg.strip().lower()
        for pkg in args.include_packages.split(",")
        if pkg.strip()
    ]

    dataset = load_dataset(args.dataset, split=args.split, streaming=args.streaming)

    kept = 0
    with open(args.output, "w", encoding="utf-8") as f:
        iterator = dataset if args.streaming else range(min(args.max_samples, len(dataset)))
        for item in iterator:
            sample = item if args.streaming else dataset[item]
            if not passes_package_filter(sample, include_packages):
                continue

            messages = normalize_messages(sample)
            row = build_training_row(messages, args.system_prompt)
            if not row:
                continue

            f.write(json.dumps(row, ensure_ascii=False) + "\n")
            kept += 1
            if kept >= args.max_samples:
                break

    print(f"Saved {kept} rows to {args.output}")


if __name__ == "__main__":
    main()
