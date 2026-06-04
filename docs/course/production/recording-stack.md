# Recording stack (course-wide)

The capture + edit setup for every lesson video. **This is the spec BAM approves
before any recording begins** (the kickoff STOP gate). Nothing here is recorded
until BAM signs off on the gear/software list and the linked operator task
`plans/user-tasks/NN-recording-stack.md` is marked done.

The course runs entirely on `npx tsx` and `npm run test` — **no Docker, no
LangGraph server, no cloud account is required to record any Module 0 lesson.**
LangSmith (Modules 3–5) needs an account; see
`plans/user-tasks/NN-langsmith-team-tier.md`.

---

## Capture

| Need | Baseline | Notes |
|---|---|---|
| Screen capture | ScreenFlow (macOS) or OBS Studio (free, cross-platform) | Record display at native res; export 1080p/30. |
| Display | ≥ 1920×1080 logical; record a 16:9 region | Hide the menubar clock and notifications. |
| Microphone | Any cardioid USB mic (e.g. Audio-Technata ATR2100x / Samson Q2U) | Pop filter; record a quiet room, not a laptop mic. |
| Webcam (talking-head intro/outro) | 1080p webcam or phone-as-webcam | Only the per-module intro/outro need on-camera. |
| Audio interface | Optional; USB mic is fine for Foundation | — |

## Editor / terminal appearance (consistency across lessons)

- Editor font ≥ 18 pt, terminal font ≥ 16 pt, high-contrast theme.
- Notifications **off** (macOS Focus / Do Not Disturb).
- Clean `git status` on the lesson's `course/lesson-NN` tag before rolling.
- One window layout reused across the course (editor left, terminal right).

## Edit + export

- Edit in ScreenFlow / DaVinci Resolve (free).
- Lower-thirds for citations (`[cite: …]` markers in the script).
- Export: 1080p (or 1440p) H.264, 30 fps, ≤ 12 Mbps, loudness ~ −16 LUFS.
- Captions: auto-generate, then hand-correct technical terms.

## Hosting

Where the finished videos live is an operator decision — see
`plans/user-tasks/NN-video-host-signup.md`. The landing page embeds the Module 1
video once the course ships.

## macOS note (BAM's machine)

BAM is on macOS 13.7.8 (Ventura). OBS Studio and DaVinci Resolve both support
Ventura; ScreenFlow's latest also supports it. **None of the recording or course
tooling requires Docker**, so the Docker Desktop / Ventura incompatibility is not
a blocker for this course.
