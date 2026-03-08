# Turning Raw Financial Documents into Semantic Knowledge

> Master's thesis project — Léa Dieudonat · PwC Luxembourg · August 2020

An NLP & ontology-based pipeline that makes large collections of financial documents queryable through semantic search — transforming unstructured PDFs into a structured, searchable knowledge base.

---

## Context

Financial analysts at PwC Luxembourg had to manually sift through hundreds of **KIIDs** (Key Investor Information Documents) and **Prospectuses** to answer simple questions like *"What is this fund's risk profile?"*. These documents are:

- **Heterogeneous** — varying structures, section names, and layouts across funds
- **Multilingual** — French, English, and German in the same corpus
- **Volume-heavy** — 800+ documents to process simultaneously

Traditional keyword search fails here because it matches characters, not meaning. This project explores whether NLP and ontology techniques can bridge that gap.

---

## The Pipeline

```
Raw PDFs → Chunking → Embeddings → Semantic Search → Answer
```

| Step | What it does |
|---|---|
| **Chunking** | Splits each document into smaller, self-contained passages |
| **Embeddings** | Encodes each passage as a vector using BERT (state of the art, 2019) |
| **Semantic Search** | Finds the passages closest to a user query using cosine similarity |
| **Ontology** | Structures extracted concepts and relationships into a knowledge graph |

---

## Key Techniques

### Chunking strategies
Three approaches were compared — fixed-size, sentence-based, and semantic chunking — with the core trade-off being context loss (too small) vs. noise (too large).

### Text Embeddings
- **TF-IDF** — frequency-based baseline, no semantic understanding
- **Word2Vec** — word-level relationships via geometric encoding
- **BERT** *(used)* — contextual embeddings that understand "bank" differently in finance vs. geography

### Semantic vs. Keyword Search
A query for *"risk fund"* in semantic search also returns results about *volatility*, *exposure*, and *downside* — concepts that share no words with the query but carry the same meaning.

---

## Results

- Built a **financial ontology graph** mapping funds to investment objectives (capital growth, income, equity appreciation…)
- **Automatically classified** subfunds by investment objective using K-means and hierarchical clustering — with no manual labelling
- Demonstrated that KIID and Prospectus documents describing the same fund are correctly matched despite entirely different wording

---

## Limits & Next Steps

**Limits**
- Multilingual documents introduce noise — a dedicated multilingual pipeline is needed
- Prospectus extraction is unreliable due to highly inconsistent structures

**Future directions**
- Evaluate [FIBO](https://spec.edmcouncil.org/fibo/) as a reusable financial ontology standard
- Test [FinBERT](https://arxiv.org/abs/1908.10063) for better accuracy on financial vocabulary
- Improve chunking for variable-length Prospectuses
- Validate ontology concepts with financial domain experts

---

## Presentation

This repo includes an interactive slide deck ([index.html](index.html)) covering the full methodology — open it in any browser, navigate with `←` / `→` keys.
