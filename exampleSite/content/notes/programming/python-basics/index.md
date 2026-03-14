---
title: "Python Basics"
subtitle: "Language fundamentals and idioms"
date: 2025-01-20T10:00:00Z
draft: false
pageID: "notes-python-basics"
tags: [programming, python, example]
---

## Data Types

Python has several built-in data types. The most common:

| Type | Mutable | Example |
|------|---------|---------|
| `int` | No | `42` |
| `float` | No | `3.14` |
| `str` | No | `"hello"` |
| `list` | Yes | `[1, 2, 3]` |
| `dict` | Yes | `{"a": 1}` |
| `tuple` | No | `(1, 2)` |
| `set` | Yes | `{1, 2, 3}` |

## List Comprehensions

```python
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
pairs = [(x, y) for x in range(3) for y in range(3) if x != y]
```

{{< callout "tip" "Performance" >}}
List comprehensions are typically faster than equivalent `for` loops because the iteration is implemented in C under the hood.
{{< /callout >}}

## Generators

{{< collapse "Generator example" >}}
```python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
first_ten = [next(fib) for _ in range(10)]
```
Generators are lazy — they produce values on demand, useful for large or infinite sequences.
{{< /collapse >}}
