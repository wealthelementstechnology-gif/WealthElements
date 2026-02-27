# AI Instructions Folder

Drop `.md` files here to extend or modify the AI's behavior, knowledge, and guidelines.

All `.md` files in this folder are automatically loaded and appended to the system prompt when the chat controller starts. Changes take effect on the next server restart.

## File Load Order

Files are loaded in **alphabetical order** by filename. Use a numeric prefix to control order:

```
01-identity.md      ← loads first
02-rules.md
03-india-knowledge.md
04-response-style.md
```

## Tips

- Use clear `# Heading` structure inside each file — the AI sees these as section labels
- Keep each file focused on one topic (identity, rules, domain knowledge, tone, etc.)
- No file size limit, but keep prompts tight — every token counts
- Deleting a file removes those instructions from the AI on next restart
- You can comment a file out temporarily by renaming it with a `_` prefix (e.g., `_rules.md` — not loaded)

## Included Files

| File | Purpose |
|------|---------|
| `identity.md` | Who the AI is and its core role |
| `rules.md` | Absolute dos and don'ts, response structure |
| `india-knowledge.md` | India-specific financial facts, tax rules, platforms |

## Example: Adding a New Instruction File

Create `tone.md`:

```md
# Response Tone Guidelines

- Never use bullet points for emotional topics — use paragraph form
- When the user is clearly stressed, lead with empathy before numbers
- Keep the first sentence of every response under 20 words
```

Save the file, restart the server — done.
