# 132/33 kV Substation Simulator V5

Independent development repository for the interactive 3D apprentice-training simulator.

## Scope
132 kV incoming transmission → 132 kV yard → 132/33 kV power transformer → 33 kV bus → outgoing 33 kV feeders.

This repository is intentionally separate from the EFL Apprentice Hub while V5 is being developed and validated.

## V5 priorities
1. Electrical accuracy
2. Physical conductor continuity
3. Realistic HV equipment and clearances
4. Transformer detail
5. 3D ↔ single-line-diagram synchronization
6. Protection and station-DC training
7. Guided power-flow visualization

The current commit is the clean GitHub development baseline.

## Saved development state — V10 Phase 6

Current work is committed to `main` and deployed through GitHub Pages. The simulator includes the V10 equipment/modeling upgrades, transformer detail and cutaway, 132 kV and 33 kV yard improvements, independent feeder controls, protection/fault simulation, switching interlocks, interactive SLD, training mode, CB visible-break modeling, corrected feeder exits, and the Phase 6 primary-circuit audit in progress.

Latest runtime hotfixes restore the `sagTube()` conductor helper and use a versioned `app-v6.js` reference in `index.html` to prevent stale browser-cache errors.

Continue Phase 6 from this saved point: audit the transformer 33 kV side → incomer CB → CT/VT → 33 kV bus → F1/F2/F3 isolators → feeder CBs → CTs → outgoing lines, with terminal-to-terminal conductor continuity and visible electrical breaks at switching devices.
