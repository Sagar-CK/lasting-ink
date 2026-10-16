"""Package the installable extension without development files."""
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent.parent
extension = root / "extension"
version = json.loads((extension / "manifest.json").read_text())["version"]
output = root / "dist" / f"lasting-ink-{version}.zip"
output.parent.mkdir(exist_ok=True)
with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    for file in sorted(extension.rglob("*")):
        if file.is_file() and not any(part.startswith(".") for part in file.relative_to(extension).parts):
            archive.write(file, Path("lasting-ink") / file.relative_to(extension))
print(output)
