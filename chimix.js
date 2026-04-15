async function init(){
  const els = await (await fetch('periodic_table_elements.json')).json();
  const grid = document.getElementById('grid');
  const info = document.getElementById('info');
  const search = document.getElementById('search');
  const filter = document.getElementById('filter');
  const cls = c => ({'alkali metal':'alkali','alkaline earth metal':'alkaline','transition metal':'transition','post-transition metal':'post','metalloid':'metalloid','diatomic nonmetal':'nonmetal','polyatomic nonmetal':'nonmetal','noble gas':'noble','lanthanoid':'lanthanoid','actinoid':'actinoid'})[c] || 'nonmetal';
  const show = e => {
    const q = search.value.trim().toLowerCase();
    const f = filter.value;
    const t = `${e.name} ${e.symbol} ${e.number} ${e.category}`.toLowerCase();
    return (!q || t.includes(q)) && (!f || e.category === f);
  };
  function render(){
    grid.innerHTML='';
    els.forEach(e => {
      if (!show(e)) return;
      const d = document.createElement('div');
      d.className = `el ${cls(e.category)}`;
      d.style.gridColumn = e.xpos;
      d.style.gridRow = e.ypos;
      d.innerHTML = `<div class='n'>${e.number}</div><div class='s'>${e.symbol}</div><div class='name'>${e.name}</div><div class='m'>M = ${e.atomic_mass ?? '—'} g·mol⁻¹</div>`;
      d.onclick = () => info.innerHTML = `<strong>${e.name} (${e.symbol})</strong><br>Numéro atomique Z : ${e.number}<br>Masse molaire M : ${e.atomic_mass ?? '—'} g·mol⁻¹<br>Famille : ${e.category ?? '—'}`;
      grid.appendChild(d);
    });
  }
  search.addEventListener('input', render);
  filter.addEventListener('change', render);
  render();
}
init();
