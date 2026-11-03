"""Exercise the relocated archive, HTTP asset boundary, and launcher."""
import pathlib
import shutil
import subprocess
import tempfile
import unittest
import urllib.request
import urllib.error

ROOT = pathlib.Path(__file__).resolve().parents[1]

class PackageTest(unittest.TestCase):
    def test_relocated_archive(self):
        subprocess.run(['python3', str(ROOT / 'build.py')], check=True)
        with tempfile.TemporaryDirectory() as directory:
            executable = pathlib.Path(directory) / 'mathmotion'
            shutil.copy2(ROOT / 'dist' / 'mathmotion', executable)
            process = subprocess.Popen([str(executable), '--port', '0', '--no-browser'], cwd=directory, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            try:
                line = process.stdout.readline()
                self.assertTrue(line.startswith('MathMotion Studio: http://127.0.0.1:'), line)
                url = line.strip().split(': ', 1)[1]
                for resource in ['/', '/app.js', '/engine.js', '/style.css']:
                    with urllib.request.urlopen(url + resource, timeout=5) as response:
                        self.assertEqual(response.status, 200)
                        self.assertGreater(len(response.read()), 100)
                for resource in ['/server.py', '/../info.xml', '/missing']:
                    with self.assertRaises(urllib.error.HTTPError) as error:
                        urllib.request.urlopen(url + resource, timeout=5)
                    self.assertEqual(error.exception.code, 404)
            finally:
                process.terminate()
                process.communicate(timeout=5)

if __name__ == '__main__':
    unittest.main()
