# Video script · Module 0 · Lesson 3 · Getting set up (Python)

> Format reference: `docs/course/production/video-script-format.md`. Pace ~140 wpm.

## Block 1 — Header

- **Lesson:** Module 0 · Lesson 3 · Getting set up (Python)
- **Duration:** ~3 min
- **Objective:** a Python-first viewer creates an optional venv and sees the loop
  sketched in Python with the same graph shape.
- **Segments:** screencast (terminal + a Python sketch slide), talking-head outro.
- **Tag:** `course/lesson-03`.

## Block 2 — Pre-production

- A clean shell; Python 3.11+ available (`python --version`).
- Slide: the Python loop sketch from the lesson (write_reply / critique_reply /
  route_after_critique / StateGraph builder).
- Terminal ≥ 16 pt; notifications OFF.

## Block 3 — Word-for-word VO (verbatim)

**[Beat 1 · talking-head · 0:00]**
> LangChain Academy is usually taught in Python, and Python learners are
> first-class here. The runnable artifact is TypeScript, so every lesson can cite a
> real file, but LangGraph ships the same mental model in both languages. This
> lesson is the bridge.

**[Beat 2 · terminal: venv · 0:25]**
> You do not need Python to take this course. But if you want to follow the
> LangGraph Python docs in parallel, create a virtual environment and install four
> packages. That is the entire Python setup. No container, no server.

**[Beat 3 · slide: Python loop sketch · 1:00]**
> And here is the payoff: the loop you will read in Lesson 6 looks almost identical
> in Python. Same write node, same critique node, same conditional edge, same cap.
> `add_conditional_edges` with a list of reachable nodes, exactly like the
> TypeScript `addConditionalEdges`. The shapes match because LangGraph models the
> same thing in both languages: a typed state graph with reducers and conditional
> edges. [cite: LangChain, n.d.]

**[Beat 4 · talking-head · 1:55]**
> So treat Python here as a Rosetta stone, not a fork. The next lesson is a full
> translation table you keep open for the whole course. You are not locked out by
> language; the pattern is language-independent.

## Block 4 — Post-production

- Lower-third citation on Beat 3.
- Side-by-side TS/Python snippet on Beat 3 (Python left, TS right) so "the shapes
  match" is literal.
- Chapter markers at Beats 2, 3.
- Export 1080p/30, H.264, ~ −16 LUFS.

## Block 5 — Screen-recording description (shot list)

- **Beat 2:** type `python -m venv .venv && source .venv/bin/activate`, then
  `pip install -U langgraph langchain-anthropic langsmith pydantic`; let it finish
  (trim in post).
- **Beat 3:** cut to the Python-sketch slide; highlight `add_conditional_edges` and
  its `["write_reply", END]` argument; briefly reveal the TS equivalent beside it.

## Bonus footage — Optional: visualize a graph with `langgraph dev` (no Docker)

> Optional step from the lesson's `langgraph dev` note. Record as a separate ~75s clip.

**Pre-production:** a minimal Python port of the loop in a scratch dir with a
`langgraph.json`; `pip install -U "langgraph-cli[inmem]"` done off-camera.

**VO (verbatim):**
> Optional and Docker-free. The Python CLI ships an in-memory dev server. Install
> the inmem extra, run `langgraph dev`, and LangGraph Studio opens in your browser
> pointed at a local server. It is a lovely way to see a graph as a diagram. This
> course does not depend on it, and to be clear, Docker only enters with `langgraph
> up`, which we never use. [cite: LangChain, n.d.-c]

**Shot list:** terminal `langgraph dev`; browser opens
`smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024`; show the graph
diagram of write_reply → critique_reply with the conditional edge; click one node
to show its state. Lower-third citation on the "in-memory dev server" sentence.
Emphasize on screen: "No Docker."
