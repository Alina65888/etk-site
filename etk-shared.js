/**
 * Общий слой данных для сайта конкурса «Переходим на электронную трудовую книжку».
 * Источник истины — общий backend API (см. server/index.js), а не localStorage браузера:
 * это нужно, чтобы правки в админке одного человека сразу видели все посетители сайта и
 * второй администратор, а не только тот же браузер.
 * load()/save()/reset() асинхронны и возвращают Promise.
 */
(function (global) {
  'use strict';

  // Адрес задеплоенного backend-сервиса (см. server/). Замените на реальный адрес
  // после деплоя на Render, если он отличается от этого.
  var API_BASE = 'https://etk-api.onrender.com';

  function apiLoad() {
    return fetch(API_BASE + '/api/data').then(function (res) {
      if (!res.ok) throw new Error('Не удалось загрузить данные (HTTP ' + res.status + ')');
      return res.json();
    });
  }

  function apiSave(data, adminKey) {
    return fetch(API_BASE + '/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey || ''
      },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error('Не удалось сохранить данные (HTTP ' + res.status + ')');
      return res.json();
    });
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function uid(prefix) {
    return prefix + '_' + Math.random().toString(36).slice(2, 10);
  }

  function defaultData() {
    return {
      campaign: {
        baseline: 2452,
        population: 4424,
        targetPercent: 100,
        startAt: '2026-08-01T00:00:00+03:00',
        endAt: '2026-09-30T23:59:59+03:00',
        status: 'active' // active | completed
      },
      current: {
        total: 2452,
        previousTotal: 2452,
        lastUpdateAt: nowIso(),
        lastUpdateMethod: 'number',
        lastUpdateAuthor: 'Организатор конкурса'
      },
      lists: {
        // employee_id[] — в демо не заполняются персональными данными, только идентификаторы
        baselineList: null,
        currentList: null
      },
      history: [
        {
          id: uid('h'),
          date: nowIso(),
          method: 'number',
          author: 'Организатор конкурса',
          total: 2452,
          previousTotal: 2452,
          note: 'Стартовое значение конкурса'
        }
      ],
      prizeLevels: [
        { id: uid('p'), threshold: 2500, name: 'Уровень 1 — базовый мерч', description: 'Носки', winnersCount: 3, sortOrder: 1, enabled: true, image: null },
        { id: uid('p'), threshold: 2600, name: 'Уровень 2 — улучшенный мерч', description: 'Термобутылка', winnersCount: 5, sortOrder: 2, enabled: true, image: null },
        { id: uid('p'), threshold: 2700, name: 'Уровень 3 — расширенный набор', description: 'Футболка + носки + термобутылка', winnersCount: 7, sortOrder: 3, enabled: true, image: null },
        { id: uid('p'), threshold: 2800, name: 'Уровень 4 — премиальный мерч', description: 'Худи + кепка', winnersCount: 10, sortOrder: 4, enabled: true, image: null },
        { id: uid('p'), threshold: 2876, name: 'Финальный уровень — цель достигнута', description: 'Худи + кепка + носки + термобутылка', winnersCount: 15, sortOrder: 5, enabled: true, image: null }
      ],
      draws: [],
      audit: [
        { id: uid('a'), actor: 'Организатор конкурса', action: 'campaign_created', entity: 'Campaign', before: null, after: 'Инициализация конкурса', date: nowIso() }
      ],
      content: {
        title: 'Переходим на электронную трудовую книжку — вместе открываем больше призов',
        subtitle: 'Сейчас ЭТК выбрали {total} сотрудников. Наша общая цель — {targetPercent} %. Каждый новый переход приближает следующий уровень мерча и увеличивает число победителей.',
        heroNote: 'Регистрация не требуется · данные обновляются администратором',
        ctaText: 'Перейти на электронную трудовую книжку',
        ctaLink: 'https://example-corp.ru/hr/etk-instruction',
        finalCtaText: 'Перейти на электронную трудовую книжку',
        rulesText: 'Участвовать может любой сотрудник компании, оформивший переход на электронную трудовую книжку в период проведения конкурса. Организатор оставляет за собой право уточнять правила без снижения гарантированных условий.',
        header: {
          brandMark: 'ЭТК',
          brandText: 'Конкурс «Переходим на ЭТК»',
          navLabel: 'Правила и FAQ'
        },
        sectionTitles: {
          advantages: 'Преимущества перехода на ЭТК',
          counter: 'Текущий результат',
          progress: 'Прогресс до цели',
          prizes: 'Призовая лестница',
          steps: 'Как участвовать',
          faq: 'Правила и вопросы'
        },
        sections: {
          advantages: true,
          counter: true,
          progress: true,
          prizes: true,
          steps: true,
          faq: true,
          finalCta: true
        },
        faq: [
          { id: uid('f'), question: 'Кто может участвовать в конкурсе?', answer: 'Любой сотрудник компании, который переходит на электронную трудовую книжку в период проведения конкурса.' },
          { id: uid('f'), question: 'Нужно ли регистрироваться на сайте?', answer: 'Нет, регистрация не требуется. Достаточно оформить переход на ЭТК через официальную инструкцию — сайт лишь показывает общий прогресс.' },
          { id: uid('f'), question: 'Как формируется список участников розыгрыша?', answer: 'Участники определяются автоматически сравнением актуального списка перешедших сотрудников с базовым списком на старте конкурса.' },
          { id: uid('f'), question: 'Публикуются ли победители?', answer: 'Да, но только после подтверждения организатора и в обезличенном виде — без ФИО и табельных номеров.' },
          { id: uid('f'), question: 'Что будет, если данные обновляются реже раза в день?', answer: 'Сайт показывает последнюю сохранённую статистику и дату её обновления, ошибки пользователю не отображаются.' }
        ]
      }
    };
  }

  // Дополняет данные, сохранённые более старой версией сайта, недостающими полями контента,
  // не трогая то, что уже было настроено администратором.
  function migrate(data) {
    var defaults = defaultData();
    var c = data.content = data.content || {};
    if (c.heroNote === undefined) c.heroNote = defaults.content.heroNote;
    if (!c.header) c.header = defaults.content.header;
    // Object.assign с дефолтами первым аргументом гарантирует, что новые ключи (добавленные
    // в более поздней версии сайта, например новый раздел) подхватятся и для уже сохранённых данных.
    c.sectionTitles = Object.assign({}, defaults.content.sectionTitles, c.sectionTitles || {});
    c.sections = Object.assign({}, defaults.content.sections, c.sections || {});
    return data;
  }

  // Возвращает Promise<data>. Если API ещё пуст (первый запуск), сервер отдаёт ошибку —
  // тогда инициализируем данными по умолчанию и сохраняем их как первую версию.
  function load() {
    return apiLoad()
      .then(function (raw) {
        return migrate(raw);
      })
      .catch(function (e) {
        console.error('ETK: не удалось загрузить данные из API', e);
        throw e;
      });
  }

  // Возвращает Promise. adminKey обязателен — сервер отклонит запись без верного пароля.
  function save(data, adminKey) {
    return apiSave(data, adminKey);
  }

  // Возвращает Promise<data> — сбрасывает данные к значениям по умолчанию и сохраняет их.
  function reset(adminKey) {
    var initial = defaultData();
    return save(initial, adminKey).then(function () {
      return initial;
    });
  }

  function addAudit(data, actor, action, entity, before, after) {
    data.audit.unshift({
      id: uid('a'),
      actor: actor,
      action: action,
      entity: entity,
      before: before === undefined ? null : before,
      after: after === undefined ? null : after,
      date: nowIso()
    });
  }

  function parseUniqueIds(rows) {
    // rows: array of raw employee_id strings (may contain duplicates/blank)
    var seen = {};
    var unique = [];
    var duplicates = [];
    rows.forEach(function (raw) {
      var id = String(raw || '').trim();
      if (!id) return;
      if (seen[id]) {
        duplicates.push(id);
      } else {
        seen[id] = true;
        unique.push(id);
      }
    });
    return { unique: unique, duplicates: duplicates };
  }

  /** Разбирает CSV-текст (employee_id,full_name,transition_date,department) в массив employee_id */
  function parseCsvEmployeeIds(csvText) {
    var lines = csvText.split(/\r?\n/).filter(function (l) { return l.trim().length > 0; });
    if (!lines.length) return [];
    var startIdx = /employee_id/i.test(lines[0]) ? 1 : 0;
    var ids = [];
    for (var i = startIdx; i < lines.length; i++) {
      var cell = lines[i].split(',')[0];
      if (cell) ids.push(cell.trim());
    }
    return ids;
  }

  function ceilTarget(population, targetPercent) {
    return Math.ceil(population * (targetPercent / 100));
  }

  /** Рассчитывает производные метрики по правилам раздела 6 ТЗ */
  function computeMetrics(data) {
    var c = data.campaign;
    var cur = data.current;
    var targetTotal = ceilTarget(c.population, c.targetPercent);
    var currentPercent = (cur.total / c.population) * 100;
    var remaining = Math.max(0, targetTotal - cur.total);
    var campaignGrowth = cur.total - c.baseline;
    var lastUpdateGrowth = cur.total - cur.previousTotal;

    var levels = data.prizeLevels
      .filter(function (p) { return p.enabled; })
      .slice()
      .sort(function (a, b) { return a.threshold - b.threshold; });

    var currentLevelIndex = -1;
    levels.forEach(function (lvl, idx) {
      if (cur.total >= lvl.threshold) currentLevelIndex = idx;
    });
    var currentLevel = currentLevelIndex >= 0 ? levels[currentLevelIndex] : null;
    var nextLevel = levels[currentLevelIndex + 1] || null;
    var nextLevelGap = nextLevel ? nextLevel.threshold - cur.total : null;

    var eligiblePool = null;
    if (Array.isArray(data.lists.baselineList) && Array.isArray(data.lists.currentList)) {
      var baseSet = {};
      data.lists.baselineList.forEach(function (id) { baseSet[id] = true; });
      var poolSeen = {};
      eligiblePool = [];
      data.lists.currentList.forEach(function (id) {
        if (!baseSet[id] && !poolSeen[id]) {
          poolSeen[id] = true;
          eligiblePool.push(id);
        }
      });
    }

    return {
      targetTotal: targetTotal,
      currentPercent: currentPercent,
      remaining: remaining,
      campaignGrowth: campaignGrowth,
      lastUpdateGrowth: lastUpdateGrowth,
      levels: levels,
      currentLevelIndex: currentLevelIndex,
      currentLevel: currentLevel,
      nextLevel: nextLevel,
      nextLevelGap: nextLevelGap,
      eligiblePool: eligiblePool,
      goalReached: cur.total >= targetTotal
    };
  }

  function formatNumber(n) {
    return Number(n).toLocaleString('ru-RU');
  }

  function formatPercent(n) {
    return n.toFixed(1).replace('.', ',') + ' %';
  }

  function formatDateTime(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return iso;
    }
  }

  global.ETK = {
    load: load,
    save: save,
    reset: reset,
    uid: uid,
    nowIso: nowIso,
    addAudit: addAudit,
    parseUniqueIds: parseUniqueIds,
    parseCsvEmployeeIds: parseCsvEmployeeIds,
    ceilTarget: ceilTarget,
    computeMetrics: computeMetrics,
    formatNumber: formatNumber,
    formatPercent: formatPercent,
    formatDateTime: formatDateTime
  };
})(window);
