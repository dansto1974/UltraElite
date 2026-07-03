# Custom ship models

Drop a `<name>.obj` file in this folder to override that ship's built-in hull —
`cobra.obj` overrides the Cobra Mk III, `krait.obj` the Krait, and so on. The
name has to match the model key used in-game; open the Ship panel and use
"Export OBJ" on the ship you want to edit to get a correctly-named starting
file with its current geometry.

Workflow:

1. Open the Ship panel, browse to the ship you want to fix, click "Export OBJ".
   This downloads `<name>.obj` with the ship's current faces.
2. Edit it in a real 3D tool (Blender, etc.) — add/move/delete faces as needed.
   Keep face winding consistent (recalculate normals so they point outward)
   or the hull may render shaded on the wrong side.
3. Export back out as Wavefront OBJ and place the file in this folder, named
   to match the original (overwrite the download from step 1).
4. Refresh the page. On startup the game fetches `ship_models/<name>.obj` for
   every ship and uses it if present, otherwise falls back to the built-in
   geometry — nothing breaks if a file is missing.

Notes:

- Only vertices (`v`) and faces (`f`) are read. Edges, adjacency, and per-face
  normals/UVs are all derived from the faces themselves — there's no manual
  bookkeeping to get wrong here, unlike the old hand-authored edge-adjacency
  data.
- Decorative overlays (windows, engine glow, trim lines) aren't part of the
  OBJ — those still come from the ship's hardcoded `details` entry in
  `index.html`, which references vertex *indices*. If you heavily rework a
  mesh (added/removed/reordered vertices), those indices may point at the
  wrong vertices afterward and need updating by hand in the code.
