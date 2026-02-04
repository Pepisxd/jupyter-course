import argparse
import inspect
from dataclasses import dataclass
from typing import List

import torch
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import (
  AutoModelForCausalLM,
  AutoTokenizer,
  BitsAndBytesConfig,
  TrainingArguments,
)
from trl import SFTTrainer
try:
    from trl import SFTConfig
except ImportError:  # Older TRL versions
    SFTConfig = None


@dataclass
class TrainConfig:
    model_name: str = "Qwen/Qwen3-4B-Instruct-2507"
    train_file: str = "hf_jupyter_messages.jsonl"
    output_dir: str = "qwen3-jupyter-lora"
    max_steps: int = 300
    per_device_train_batch_size: int = 1
    gradient_accumulation_steps: int = 16
    learning_rate: float = 2e-4
    max_seq_length: int = 256
    lora_r: int = 4
    lora_alpha: int = 8
    lora_dropout: float = 0.05
    save_steps: int = 100
    logging_steps: int = 50
    warmup_ratio: float = 0.05


def build_prompt(tokenizer, messages: List[dict]) -> str:
    return tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=False
    )


def formatting_func(tokenizer):
    def _format(sample):
        return build_prompt(tokenizer, sample["messages"])

    return _format


def parse_args() -> TrainConfig:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-name", default=TrainConfig.model_name)
    parser.add_argument("--train-file", default=TrainConfig.train_file)
    parser.add_argument("--output-dir", default=TrainConfig.output_dir)
    parser.add_argument("--max-steps", type=int, default=TrainConfig.max_steps)
    parser.add_argument(
        "--per-device-train-batch-size",
        type=int,
        default=TrainConfig.per_device_train_batch_size,
    )
    parser.add_argument(
        "--gradient-accumulation-steps",
        type=int,
        default=TrainConfig.gradient_accumulation_steps,
    )
    parser.add_argument("--learning-rate", type=float, default=TrainConfig.learning_rate)
    parser.add_argument("--max-seq-length", type=int, default=TrainConfig.max_seq_length)
    parser.add_argument("--lora-r", type=int, default=TrainConfig.lora_r)
    parser.add_argument("--lora-alpha", type=int, default=TrainConfig.lora_alpha)
    parser.add_argument("--lora-dropout", type=float, default=TrainConfig.lora_dropout)
    parser.add_argument("--save-steps", type=int, default=TrainConfig.save_steps)
    parser.add_argument("--logging-steps", type=int, default=TrainConfig.logging_steps)
    parser.add_argument("--warmup-ratio", type=float, default=TrainConfig.warmup_ratio)
    args = parser.parse_args()

    return TrainConfig(**vars(args))


def main() -> None:
    cfg = parse_args()
    if torch.cuda.is_available():
        torch.backends.cuda.matmul.allow_tf32 = True

    tokenizer = AutoTokenizer.from_pretrained(cfg.model_name, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        cfg.model_name,
        device_map="auto",
        quantization_config=bnb_config,
        dtype=torch.float16,
    )

    model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={"use_reentrant": False})
    model.config.use_cache = False
    model = prepare_model_for_kbit_training(model)
    lora_config = LoraConfig(
        r=cfg.lora_r,
        lora_alpha=cfg.lora_alpha,
        lora_dropout=cfg.lora_dropout,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=[
            "q_proj",
            "k_proj",
            "v_proj",
            "o_proj",
            "gate_proj",
            "up_proj",
            "down_proj",
        ],
    )
    model = get_peft_model(model, lora_config)

    dataset = load_dataset("json", data_files=cfg.train_file, split="train")

    warmup_steps = int(cfg.max_steps * cfg.warmup_ratio)
    training_args_kwargs = dict(
        output_dir=cfg.output_dir,
        max_steps=cfg.max_steps,
        per_device_train_batch_size=cfg.per_device_train_batch_size,
        gradient_accumulation_steps=cfg.gradient_accumulation_steps,
        learning_rate=cfg.learning_rate,
        save_steps=cfg.save_steps,
        logging_steps=cfg.logging_steps,
        warmup_steps=warmup_steps,
        bf16=False,
        fp16=False,
        report_to="none",
    )

    training_signature = inspect.signature(TrainingArguments.__init__)
    if "optim" in training_signature.parameters:
        training_args_kwargs["optim"] = "paged_adamw_8bit"
    if "push_to_hub" in training_signature.parameters:
        training_args_kwargs["push_to_hub"] = False
    if "push_to_hub_token" in training_signature.parameters:
        training_args_kwargs["push_to_hub_token"] = None

    training_args = TrainingArguments(**training_args_kwargs)

    trainer_kwargs = dict(
        model=model,
        train_dataset=dataset,
        formatting_func=formatting_func(tokenizer),
        args=training_args,
    )

    trainer_signature = inspect.signature(SFTTrainer.__init__)
    if SFTConfig is not None and "sft_config" in trainer_signature.parameters:
        sft_config_kwargs = {}
        sft_signature = inspect.signature(SFTConfig.__init__)
        if "max_seq_length" in sft_signature.parameters:
            sft_config_kwargs["max_seq_length"] = cfg.max_seq_length
        if "dataset_text_field" in sft_signature.parameters:
            sft_config_kwargs["dataset_text_field"] = None
        if sft_config_kwargs:
            trainer_kwargs["sft_config"] = SFTConfig(**sft_config_kwargs)
    if "tokenizer" in trainer_signature.parameters:
        trainer_kwargs["tokenizer"] = tokenizer
    if "max_seq_length" in trainer_signature.parameters:
        trainer_kwargs["max_seq_length"] = cfg.max_seq_length
    if "dataset_text_field" in trainer_signature.parameters:
        trainer_kwargs["dataset_text_field"] = None

    trainer = SFTTrainer(**trainer_kwargs)

    trainer.train()
    trainer.save_model(cfg.output_dir)


if __name__ == "__main__":
    main()
