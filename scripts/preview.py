# Arma una copia de dist/ con rutas relativas para la vista previa publicada como artifact.
import re, shutil, pathlib, sys
src = pathlib.Path('dist'); out = pathlib.Path(sys.argv[1])
if out.exists(): shutil.rmtree(out)
shutil.copytree(src / 'assets', out / 'assets')
(out / 'en').mkdir(parents=True)

def rel(html, prefix, home, en):
    html = html.replace('"/assets/', f'"{prefix}assets/').replace("url(/assets/", f"url({prefix}assets/").replace("'/assets/", f"'{prefix}assets/")
    html = re.sub(r'<link rel="(icon|apple-touch-icon)"[^>]*>', '', html)
    html = html.replace('href="/en/"', f'href="{en}"').replace('href="/"', f'href="{home}"')
    return html

es = rel((src / 'index.html').read_text(), '', './', 'en/index.html')
es = re.sub(r'<title>.*?</title>', '<title>Servicios Especializados del Corazón</title>', es, count=1, flags=re.S)
head = re.search(r'<head>(.*?)</head>', es, re.S).group(1)
body = re.search(r'<body[^>]*>(.*)</body>', es, re.S).group(1)
head = re.sub(r'<meta charset="utf-8"\s*/?>', '', head)
head = re.sub(r'<meta name="viewport"[^>]*>', '', head)
page = head + '\n<script>document.documentElement.lang="es"</script>\n' + body
(out / 'index.html').write_text(page)

en = rel((src / 'en' / 'index.html').read_text(), '../', '../', './')
(out / 'en' / 'index.html').write_text(en)
print('ok', sum(1 for _ in (out / 'assets').iterdir()), 'assets')
