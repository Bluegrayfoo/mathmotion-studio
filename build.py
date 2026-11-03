"""Build a relocatable Python zipapp containing every web asset."""
from pathlib import Path
import tempfile
import shutil
import zipapp

root = Path(__file__).parent
(root / 'dist').mkdir(exist_ok=True)
with tempfile.TemporaryDirectory() as temporary:
    staging = Path(temporary)
    shutil.copy(root / 'server.py', staging / '__main__.py')
    shutil.copytree(root / 'web', staging / 'web')
    zipapp.create_archive(staging, root / 'dist' / 'mathmotion', interpreter='/usr/bin/env python3', compressed=True)
print('Built dist/mathmotion')
