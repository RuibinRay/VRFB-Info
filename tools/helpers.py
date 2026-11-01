"""Language-neutral HTML helpers shared by the page generator and the content modules."""

def cite(*nums):
    return '<span class="cite">' + ''.join(f'<a href="references.html#ref-{n}">[{n}]</a>' for n in nums) + '</span>'

def field(k, label, val, unit='', mn=None, mx=None, step=None, kind='number'):
    rng = f' min="{mn}"' if mn is not None else ''
    rng += f' max="{mx}"' if mx is not None else ''
    rng += f' step="{step}"' if step is not None else ''
    if kind == 'range':
        return f'<label class="field"><span>{label} <span class="val">{val}{unit}</span></span><input type="range" data-k="{k}" data-unit="{unit}" value="{val}"{rng}></label>'
    return f'<label class="field"><span>{label}{(" (" + unit + ")") if unit else ""}</span><input type="number" data-k="{k}" value="{val}"{rng}></label>'

def stat(k, label, accent=False):
    return f'<div class="stat{" accent" if accent else ""}"><b data-out="{k}">—</b><span>{label}</span></div>'

def swatch(hex_):
    return f'<span class="panel__swatch" style="background:{hex_}"></span>'
