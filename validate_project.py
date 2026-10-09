"""Check static asset references, image alternatives and shared behavior wiring."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re

root = Path(__file__).parent
errors = []

class Validator(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.file = file
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                errors.append(f'{self.file.name}: duplicate id {attrs["id"]}')
            self.ids.add(attrs['id'])
        if tag == 'img' and 'alt' not in attrs:
            errors.append(f'{self.file.name}: missing image alt')
        for key in ('src', 'href'):
            value = attrs.get(key, '')
            parsed = urlsplit(value)
            if value and not parsed.scheme and not value.startswith('#'):
                if not (self.file.parent / unquote(parsed.path)).is_file():
                    errors.append(f'{self.file.name}: missing reference {value}')

for file in root.glob('*.html'):
    text = file.read_text(encoding='utf-8')
    Validator(file).feed(text)
    assert text.count('src="./assets/js/store.js"') == 1, file
    assert text.count('href="./assets/css/common.css"') == 1, file
    assert not re.search(r'<a[^>]*>\s*<button', text), file

for file in (root / 'assets/css').glob('*.css'):
    text = file.read_text(encoding='utf-8')
    assert text.count('{') == text.count('}'), file
    for reference in re.findall(r'@import\s+url\((.*?)\)', text):
        if not (file.parent / reference.strip('"\'')).is_file():
            errors.append(f'{file.name}: missing import {reference}')

assert not errors, '\n'.join(errors)
print(f'PASS: {len(list(root.glob("*.html")))} HTML pages, local references, image alternatives, unique IDs and CSS imports.')
