# Sock Calculator Spec (Draft 1)

## Scope
- Single calculator covering multiple heel types and both knitting directions.
- Sizing mode: standard EU sizes 34–48 only.
- Outputs are numeric stitch and row counts plus section ordering.

## Inputs and Defaults
Required inputs:
- `gauge_sts_per_cm`
- `gauge_rows_per_cm`
- `eu_size` (34–48)
- `heel_type` (Square/Flap-and-gusset, Round/Heel-turn, Short-row, Strong)
- `direction` (Toe-up or Cuff-down)

Optional inputs:
- `ankle_circ_cm` (for leg fit adjustments; if omitted, use foot circumference)
- `leg_length_cm` (for leg length; if omitted, default 15 cm)

Defaults:
- `negative_ease` = 0.10 (10% reduction)
- `stitch_multiple` = 4 (round final stitch count to nearest multiple of 4)
- `toe_length_cm` = clamp(0.15 * foot_len_cm, min 4.0, max 6.0)
- `cuff_length_cm` = 5.0 (used when direction is Cuff-down)

## Standard EU Size Table (34–48)
Approximate, average-foot values. Adjust later if you want a specific chart source.

| EU size | Foot length (cm) | Foot circumference (cm) |
|--------:|-----------------:|------------------------:|
| 34 | 22.1 | 20.5 |
| 35 | 22.8 | 21.0 |
| 36 | 23.5 | 21.5 |
| 37 | 24.0 | 22.0 |
| 38 | 24.5 | 22.5 |
| 39 | 25.5 | 23.0 |
| 40 | 26.0 | 23.5 |
| 41 | 26.5 | 24.0 |
| 42 | 27.5 | 24.5 |
| 43 | 28.0 | 25.0 |
| 44 | 29.0 | 25.5 |
| 45 | 29.5 | 26.0 |
| 46 | 30.0 | 26.5 |
| 47 | 31.0 | 26.5 |
| 48 | 31.5 | 26.5 |

## Core Math
Let:
- `foot_len_cm`, `foot_circ_cm` come from the EU table.
- `target_circ_cm = foot_circ_cm * (1 - negative_ease)`
- `raw_sts = target_circ_cm * gauge_sts_per_cm`
- `sock_sts = round_to_multiple(raw_sts, stitch_multiple)`

Length conversions:
- `rows_for_leg = round(leg_length_cm * gauge_rows_per_cm)`
- `rows_for_cuff = round(cuff_length_cm * gauge_rows_per_cm)`
- `rows_for_foot_total = round(foot_len_cm * gauge_rows_per_cm)`
- `rows_for_toe = round(toe_length_cm * gauge_rows_per_cm)`
- `rows_before_toe = rows_for_foot_total - rows_for_toe`

If `ankle_circ_cm` is provided and is smaller than `foot_circ_cm`,
the leg can be tapered to `ankle_sts` using the same ease logic:
- `ankle_target_cm = ankle_circ_cm * (1 - negative_ease)`
- `ankle_sts = round_to_multiple(ankle_target_cm * gauge_sts_per_cm, stitch_multiple)`

## Heel Modules
All heel types output:
- heel stitch count
- heel rows (or turns)
- any gusset/decrease/increase schedule

### Square/Flap-and-gusset
Applies to both directions, uses the classic heel flap + turn + gusset.

Counts:
- `heel_flap_sts = sock_sts / 2`
- `heel_flap_rows = heel_flap_sts` (square flap)
- `heel_turn_sts = heel_flap_sts`
- Gusset pick-up: `gusset_sts_each_side = heel_flap_rows / 2`

Gusset shaping:
- Cuff-down: decrease gusset back to `sock_sts`.
- Toe-up: increase gusset from `sock_sts` to `sock_sts + 2 * gusset_sts_each_side`,
  then decrease back to `sock_sts` after heel completion.

### Round/Heel-turn (Dutch/Classic)
Uses a heel flap and a rounded turn without gusset emphasis.

Counts:
- `heel_flap_sts = sock_sts / 2`
- `heel_flap_rows = heel_flap_sts`
- Turn: divide `heel_turn_sts` into thirds and work short rows
  until the center third remains.

### Short-row heel
Uses short rows across the full sock circumference.

Counts:
- `heel_sts = sock_sts`
- Work short rows until 1/3 of stitches remain unworked,
  then work mirrored short rows to return to full width.

### Strong heel
Same shaping as Square/Flap-and-gusset, with a slipped-stitch fabric
for extra durability. Use the same counts as the Square heel.

## Direction Variants
### Toe-up
1. Toe increases until `sock_sts`.
2. Work foot to `rows_before_toe`.
3. Work selected heel module.
4. Work leg to `rows_for_leg` (optional taper to `ankle_sts`).
5. Work cuff to `rows_for_cuff`.
6. Bind off.

### Cuff-down
1. Cast on `sock_sts`.
2. Work cuff to `rows_for_cuff`.
3. Work leg to `rows_for_leg` (optional taper to `ankle_sts`).
4. Work selected heel module.
5. Work foot to `rows_before_toe`.
6. Work toe decreases to finishing stitch count.
7. Bind off or graft.

## Outputs
The calculator should output:
- `sock_sts` (cast-on or full-foot stitches)
- `rows_for_cuff`, `rows_for_leg`, `rows_before_toe`, `rows_for_toe`
- Heel-specific numbers (flap sts/rows, turn structure, gusset sts)
- Section ordering based on direction
