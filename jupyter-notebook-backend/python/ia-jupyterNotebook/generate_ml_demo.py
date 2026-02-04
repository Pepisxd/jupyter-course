import csv
import json
import math
import random
from pathlib import Path


def make_dataset(path: Path, rows: int = 120, seed: int = 42) -> None:
    random.seed(seed)
    headers = ["x1", "x2", "y"]
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for _ in range(rows):
            x1 = random.uniform(0, 10)
            x2 = random.uniform(0, 10)
            noise = random.uniform(-1.5, 1.5)
            y = 1 if (1.2 * x1 + 0.8 * x2 + noise) > 10 else 0
            writer.writerow([round(x1, 3), round(x2, 3), y])


def make_notebook(dataset_name: str) -> dict:
    markdown_intro = [
        "# ML basico: clasificacion binaria\n",
        "\n",
        "Objetivo: entrenar un modelo para predecir la clase `y`.\n",
        "\n",
        "Modelo matematico (regresion logistica):\n",
        r"$p(y=1|x)=\sigma(w_1 x_1 + w_2 x_2 + b)$\n",
        "\n",
        "donde $\\sigma(z)=\\frac{1}{1+e^{-z}}$.\n",
    ]

    markdown_eval = [
        "## Evaluacion\n",
        "\n",
        "Se reportan accuracy y matriz de confusion con al menos 35 registros.\n",
    ]

    code_cell = [
        "import pandas as pd\n",
        "from sklearn.model_selection import train_test_split\n",
        "from sklearn.linear_model import LogisticRegression\n",
        "from sklearn.metrics import accuracy_score, confusion_matrix\n",
        "\n",
        f"df = pd.read_csv('{dataset_name}')\n",
        "X = df[['x1', 'x2']]\n",
        "y = df['y']\n",
        "X_train, X_test, y_train, y_test = train_test_split(\n",
        "    X, y, test_size=0.2, random_state=42\n",
        ")\n",
        "model = LogisticRegression()\n",
        "model.fit(X_train, y_train)\n",
        "pred = model.predict(X_test)\n",
        "print('Accuracy:', accuracy_score(y_test, pred))\n",
        "print('Confusion Matrix:')\n",
        "print(confusion_matrix(y_test, pred))\n",
    ]

    return {
        "cells": [
            {"cell_type": "markdown", "metadata": {}, "source": markdown_intro},
            {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": code_cell},
            {"cell_type": "markdown", "metadata": {}, "source": markdown_eval},
        ],
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": "3.x"},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


def main() -> None:
    base_dir = Path(__file__).parent
    dataset_path = base_dir / "ml_demo_dataset.csv"
    notebook_path = base_dir / "ml_demo.ipynb"

    make_dataset(dataset_path)
    notebook = make_notebook(dataset_path.name)

    with notebook_path.open("w", encoding="utf-8") as f:
        json.dump(notebook, f, ensure_ascii=False, indent=2)

    print(f"Dataset: {dataset_path}")
    print(f"Notebook: {notebook_path}")


if __name__ == "__main__":
    main()
