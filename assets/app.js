async function load() {
  const res = await fetch('manifest.json', { cache: 'no-store' });
  const data = await res.json(); // [{title, path, grade, tags, updatedAt}]
  const list = document.getElementById('list');
  const stats = document.getElementById('stats');
  const q = document.getElementById('q');
  const grade = document.getElementById('grade');

  const render = () => {
    const term = (q.value || '').toLowerCase().trim();
    const g = grade.value;
    const filtered = data.filter(it => {
      const okGrade = !g || it.grade === g;
      const haystack = (it.title + ' ' + (it.tags||[]).join(' ')).toLowerCase();
      const okTerm = !term || haystack.includes(term);
      return okGrade && okTerm;
    });

    stats.textContent = `Tổng: ${data.length} • Hiển thị: ${filtered.length}`;    
    list.innerHTML = filtered.map(it => `
      <article class="card">
        <h3><a href="${it.path}" target="_blank" rel="noopener">${it.title}</a></h3>
        <div>Khối: <strong>${it.grade}</strong> • Cập nhật: ${new Date(it.updatedAt).toLocaleDateString()}</div>
        ${(it.tags && it.tags.length) ? `<div class="badges">${it.tags.map(t=>`<span class="badge">#${t}</span>`).join('')}</div>` : ''}
      </article>
    `).join('');
  };

  q.addEventListener('input', render);
  grade.addEventListener('change', render);
  render();
}

load().catch(err => {
  document.getElementById('list').innerHTML = `<p>Lỗi tải manifest: ${err.message}</p>`;
});
