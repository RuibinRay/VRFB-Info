/**
 * Knowledge check. questions: [{ q, options: [..], answer: index, why }].
 * Each question is answered once; the explanation appears immediately.
 * opts.labels: { score, retry, correct, incorrect }  opts.onDone(score, total)
 */
export function renderQuiz(el, questions, opts = {}) {
  const L = { score: 'Score', retry: 'Try again', correct: 'Correct.', incorrect: 'Not quite.', ...opts.labels };
  let answered, score;
  function draw() {
    answered = 0; score = 0;
    el.classList.add('quiz');
    el.innerHTML = questions.map((item, qi) => `<div class="quiz__q" data-q="${qi}"><p>${qi + 1}. ${item.q}</p><div class="quiz__opts" role="group">${item.options.map((o, oi) => `<button type="button" class="quiz__opt" data-o="${oi}" data-letter="${'ABCDE'[oi]}">${o}</button>`).join('')}</div></div>`).join('') + '<div class="quiz__score" aria-live="polite"></div>';
    el.querySelectorAll('.quiz__q').forEach(box => {
      const item = questions[+box.dataset.q];
      box.querySelectorAll('.quiz__opt').forEach(btn => btn.addEventListener('click', () => {
        if (box.dataset.done) return; box.dataset.done = '1';
        const right = +btn.dataset.o === item.answer;
        box.querySelectorAll('.quiz__opt').forEach(b => { b.disabled = true; if (+b.dataset.o === item.answer) b.classList.add('is-right'); });
        if (!right) btn.classList.add('is-wrong'); else score++;
        const why = document.createElement('p'); why.className = 'quiz__why' + (right ? '' : ' is-wrong'); why.innerHTML = `<b>${right ? L.correct : L.incorrect}</b> ${item.why || ''}`; box.appendChild(why);
        answered++;
        if (answered === questions.length) finish();
      }));
    });
  }
  function finish() {
    const s = el.querySelector('.quiz__score');
    s.innerHTML = `<span>${L.score}: <b>${score} / ${questions.length}</b></span><button type="button" class="btn btn--ghost btn--sm">${L.retry}</button>`;
    s.querySelector('button').addEventListener('click', draw);
    opts.onDone && opts.onDone(score, questions.length);
  }
  draw();
  return { reset: draw };
}
