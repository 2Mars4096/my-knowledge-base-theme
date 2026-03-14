---
title: "Data Structures"
subtitle: "Trees, heaps, and hash maps"
date: 2025-01-22T10:00:00Z
draft: false
pageID: "notes-data-structures"
tags: [programming, algorithms, example]
---

## Complexity Overview

| Operation | Array | Linked List | Hash Map | BST (balanced) |
|-----------|-------|-------------|----------|----------------|
| Access | $O(1)$ | $O(n)$ | $O(1)$ avg | $O(\log n)$ |
| Search | $O(n)$ | $O(n)$ | $O(1)$ avg | $O(\log n)$ |
| Insert | $O(n)$ | $O(1)$ | $O(1)$ avg | $O(\log n)$ |
| Delete | $O(n)$ | $O(1)$ | $O(1)$ avg | $O(\log n)$ |

## Binary Search Tree

{{< mermaid >}}
graph TD
    A((8)) --> B((3))
    A --> C((10))
    B --> D((1))
    B --> E((6))
    C --> F((  ))
    C --> G((14))
    E --> H((4))
    E --> I((7))
    style F fill:none,stroke:none
{{< /mermaid >}}

{{< theorem "definition" "BST Property" >}}
A binary tree is a **BST** if for every node $v$: all keys in the left subtree of $v$ are less than $v$'s key, and all keys in the right subtree are greater.
{{< /theorem >}}

{{< callout "warning" "Degeneracy" >}}
An unbalanced BST degenerates to a linked list with $O(n)$ operations. Use self-balancing variants (AVL, Red-Black) for guaranteed $O(\log n)$.
{{< /callout >}}
