# faces — presenter reference kit for thumbnail generation

Durable, cross-video **subject reference** for `/packaging` Stage 5. Every thumbnail
render (`tools/gen_thumbnail.py`, Nano Banana Pro) passes these images to the model as
face references so the presenter's face stays consistent across variants and re-rolls.
Same library-first idea as `media/library/sfx/` — this kit is reused, not regenerated per video.

**You supply your own images.** Face photos are personal, so this repo ships the folder
and this doc, not anyone's likeness (the images are git-ignored).

## What to add

Drop 1–4 clean reference photos of the on-camera presenter here, named `face-ref-01.jpg`,
`face-ref-02.jpg`, … `tools/gen_thumbnail.py` passes the **whole folder** as references, so
more good angles + expressions = a more faithful, consistent face.

A good reference is:

- **Sharp and front-facing**, evenly lit, looking at the camera — the identity anchor.
  Nano Banana Pro can re-pose and re-express from a single good shot.
- **Varied expressions** across the extra shots to cover the winning thumbnail looks
  (wide-eyed / shocked, big excited smile, pointing, curious).
- **Face unobstructed** (no hands/mic across it), plain-ish background — the render replaces
  the scene, so only the face/identity is used.

Then run `/packaging` — it references `media/library/faces/` automatically.
