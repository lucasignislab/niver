from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
OUTPUT = ASSETS / "avatars"
OUTPUT.mkdir(exist_ok=True)

individual = [
    "yury-ferreira", "robson-abreu", "andre-xavier", "edvaldo-anjos",
    "dairo-junior", "luciano-lomeu", "bruno-borges", "amanda-gomes",
    "mauricio-brollo", "davy-marcelo", "ligia-de-souza", "clarissa-aguiar",
    "lidi-fran", "eitor-guimaraes", "sarah-lima", "bruno-borges-ratao",
    "ronaldo-ibrahim", "luka",
]
sprites = {
    "tarcisio-bianchi": ("mentores-01", 0),
    "michael-pogne": ("mentores-01", 344),
    "tayna-gauche": ("mentores-01", 680),
    "leo-rodrigues": ("mentores-02", 0),
    "bruno-matos": ("mentores-02", 344),
}
crops = {"luka": (132, 572, 588, 1028)}


def finish(image, name, sharpen=110):
    image = image.resize((512, 512), Image.Resampling.LANCZOS)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.1, percent=sharpen, threshold=3))
    image.save(OUTPUT / f"{name}.webp", "WEBP", quality=95, method=6)


for name in individual:
    with Image.open(ASSETS / f"{name}.webp") as source:
        source = source.convert("RGBA")
        side = min(source.width, source.height)
        left = (source.width - side) // 2
        crop = crops.get(name, (left, 0, left + side, side))
        finish(source.crop(crop), name)

for name, (sprite, left) in sprites.items():
    with Image.open(ASSETS / f"{sprite}.webp") as source:
        source = source.convert("RGBA")
        side = source.height
        finish(source.crop((left, 0, left + side, side)), name, sharpen=125)

names = individual[:6] + list(sprites) + individual[6:]
thumb_size = 144
label_height = 30
columns = 6
rows = (len(names) + columns - 1) // columns
sheet = Image.new("RGB", (columns * thumb_size, rows * (thumb_size + label_height)), "#202020")
draw = ImageDraw.Draw(sheet)
for index, name in enumerate(names):
    with Image.open(OUTPUT / f"{name}.webp") as avatar:
        avatar = avatar.convert("RGBA").resize((thumb_size, thumb_size), Image.Resampling.LANCZOS)
        x = (index % columns) * thumb_size
        y = (index // columns) * (thumb_size + label_height)
        sheet.paste(avatar, (x, y), avatar)
        draw.text((x + 5, y + thumb_size + 8), name, fill="white")
sheet.save(ROOT / "avatar-quality-check.jpg", quality=90)
print(f"Generated {len(names)} optimized avatars in {OUTPUT}")
